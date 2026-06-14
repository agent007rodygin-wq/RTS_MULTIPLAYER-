/**
 * Safe cleanup for legacy building combat fields.
 *
 * Does NOT delete records/world. Only normalizes risky fields:
 * hp, maxHp, isDestroying, pendingDamage, destructionEndTime,
 * ownerId, hostId, zoneId
 *
 * Usage:
 *   PB_URL=http://127.0.0.1:8090 \
 *   PB_ADMIN_EMAIL=admin@example.com \
 *   PB_ADMIN_PASSWORD=secret \
 *   DRY_RUN=1 \
 *   node cleanup_buildings_combat_legacy.mjs
 *
 * Optional:
 *   APPLY=1              # same as DRY_RUN=0
 *   LIMIT=1000           # process only first N records
 *   ZONE_SIZE=40         # default zone size used by game
 */
import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL;
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;
const DRY_RUN = process.env.APPLY === "1" ? false : process.env.DRY_RUN !== "0";
const LIMIT = Number(process.env.LIMIT || 0);
const ZONE_SIZE = Number(process.env.ZONE_SIZE || 40);

if (!PB_URL || !PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
  console.error("Missing env vars: PB_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD");
  process.exit(1);
}

const pb = new PocketBase(PB_URL);

const zoneIdFromXY = (x, y) => `${Math.floor(Number(x) / ZONE_SIZE)}_${Math.floor(Number(y) / ZONE_SIZE)}`;
const isValidZoneId = (z) => typeof z === "string" && /^\d+_\d+$/.test(z);

const toNumberOrUndefined = (v) => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

const readField = (record, field) => {
  if (record[field] !== undefined && record[field] !== null) return record[field];
  if (record.data && typeof record.data === "object" && record.data[field] !== undefined && record.data[field] !== null) {
    return record.data[field];
  }
  return undefined;
};

const toBool = (v) => {
  if (v === true || v === false) return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
};

function computePatch(record, now) {
  const patch = {};
  const issues = [];

  const hp = toNumberOrUndefined(readField(record, "hp"));
  const maxHp = toNumberOrUndefined(readField(record, "maxHp"));
  let isDestroying = toBool(readField(record, "isDestroying"));
  const pendingDamage = toNumberOrUndefined(readField(record, "pendingDamage"));
  const destructionEndTime = toNumberOrUndefined(readField(record, "destructionEndTime"));
  const ownerIdRaw = readField(record, "ownerId");
  const hostIdRaw = readField(record, "hostId");
  const zoneIdRaw = readField(record, "zoneId");

  // ownerId: normalize legacy numeric/null forms to string when possible.
  if (typeof ownerIdRaw === "number") {
    patch.ownerId = String(ownerIdRaw);
    issues.push("ownerId:number->string");
  } else if (ownerIdRaw === null) {
    // Leave unknown ownership untouched; only report.
    issues.push("ownerId:null(unfixed)");
  }

  // hostId: must be string if present.
  if (hostIdRaw !== undefined && hostIdRaw !== null && typeof hostIdRaw !== "string") {
    patch.hostId = null;
    issues.push("hostId:non-string->null");
  }

  // zoneId: recover from x/y if broken.
  const x = toNumberOrUndefined(readField(record, "x"));
  const y = toNumberOrUndefined(readField(record, "y"));
  if ((!isValidZoneId(zoneIdRaw)) && x !== undefined && y !== undefined) {
    patch.zoneId = zoneIdFromXY(x, y);
    issues.push("zoneId:healed-from-xy");
  }

  // hp/maxHp sanity (conservative, no resurrection from <=0).
  if (hp === undefined && maxHp !== undefined && maxHp > 0) {
    patch.hp = maxHp;
    issues.push("hp:missing->maxHp");
  }
  if ((maxHp === undefined || maxHp <= 0) && hp !== undefined && hp > 0) {
    patch.maxHp = hp;
    issues.push("maxHp:missing->hp");
  }
  if (hp !== undefined && maxHp !== undefined && maxHp > 0 && hp > maxHp) {
    patch.hp = maxHp;
    issues.push("hp:clamped-to-maxHp");
  }

  // Destroy state normalization.
  if (isDestroying === undefined) {
    // default false in cleanup when destroy metadata exists
    if (destructionEndTime !== undefined || (pendingDamage !== undefined && pendingDamage > 0)) {
      isDestroying = false;
      patch.isDestroying = false;
      issues.push("isDestroying:missing->false");
    }
  }

  if (isDestroying === true) {
    if (destructionEndTime === undefined) {
      patch.isDestroying = false;
      patch.pendingDamage = 0;
      patch.destructionEndTime = null;
      issues.push("destroying-without-endtime:reset");
    } else if (destructionEndTime < now - 24 * 60 * 60 * 1000) {
      // Very stale timer: stop soft-lock by resetting destroy flags.
      patch.isDestroying = false;
      patch.pendingDamage = 0;
      patch.destructionEndTime = null;
      issues.push("destroying-stale-24h:reset");
    }
  } else {
    // Not destroying: clear dangling timer/pendingDamage to avoid ghost state.
    if (destructionEndTime !== undefined) {
      patch.destructionEndTime = null;
      issues.push("non-destroying-with-endtime:clear");
    }
    if (pendingDamage !== undefined && pendingDamage !== 0) {
      patch.pendingDamage = 0;
      issues.push("non-destroying-with-pendingDamage:clear");
    }
  }

  return { patch, issues };
}

async function main() {
  console.log(`[cleanup] connect ${PB_URL}`);
  await pb.collection("_superusers").authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  console.log("[cleanup] authenticated");

  const all = await pb.collection("buildings").getFullList();
  const records = LIMIT > 0 ? all.slice(0, LIMIT) : all;
  console.log(`[cleanup] loaded ${records.length} records${LIMIT > 0 ? ` (limited from ${all.length})` : ""}`);
  console.log(`[cleanup] mode=${DRY_RUN ? "DRY_RUN" : "APPLY"}`);

  const stats = {
    scanned: 0,
    changed: 0,
    updated: 0,
    failed: 0,
    byIssue: {},
  };

  const now = Date.now();
  for (const r of records) {
    stats.scanned++;
    const { patch, issues } = computePatch(r, now);
    if (issues.length === 0) continue;

    stats.changed++;
    for (const issue of issues) {
      stats.byIssue[issue] = (stats.byIssue[issue] || 0) + 1;
    }

    if (DRY_RUN) continue;
    try {
      await pb.collection("buildings").update(r.id, patch);
      stats.updated++;
    } catch (e) {
      stats.failed++;
      console.error(`[cleanup] failed id=${r.id}`, e?.message || e);
    }
  }

  console.log("\n[cleanup] summary");
  console.log(JSON.stringify(stats, null, 2));
  if (DRY_RUN) {
    console.log("\n[cleanup] no writes applied. Set APPLY=1 (or DRY_RUN=0) to commit.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

