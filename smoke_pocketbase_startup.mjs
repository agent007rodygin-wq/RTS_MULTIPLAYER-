import PocketBase from "pocketbase";

const BASE_URL = process.env.PB_URL || "http://89.127.214.182:8090";
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "admin@basingse.game";
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || "BaSingSe2024";

const pb = new PocketBase(BASE_URL);
pb.autoCancellation(false);

const ZONE_FILTER =
  '(zoneId = "0_0" || zoneId = "4_0" || zoneId = "1_0" || zoneId = "0_4" || zoneId = "0_1" || zoneId = "4_4" || zoneId = "4_1" || zoneId = "1_4" || zoneId = "1_1")';

const results = [];

function pass(name, details = "") {
  results.push({ status: "PASS", name, details });
}

function fail(name, error) {
  const details =
    error?.response?.message ||
    error?.response?.data?.message ||
    error?.message ||
    String(error);
  results.push({ status: "FAIL", name, details });
}

async function run(name, fn) {
  try {
    const details = await fn();
    pass(name, details || "");
  } catch (error) {
    fail(name, error);
  }
}

async function checkHealth() {
  const response = await fetch(`${BASE_URL}/api/health`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  if (!data.code || data.code !== 200) {
    throw new Error(`Unexpected payload: ${JSON.stringify(data)}`);
  }
  return `code=${data.code} message=${data.message}`;
}

async function checkRealtimeEndpoint() {
  const response = await fetch(`${BASE_URL}/api/realtime`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const text = await response.text();
  const marker = "id:";
  if (!text.startsWith(marker)) {
    throw new Error(`Unexpected realtime response: ${text.slice(0, 120)}`);
  }
  const clientId = text.slice(marker.length).trim();
  if (!clientId) {
    throw new Error("Realtime client id is empty");
  }
  return `clientId=${clientId.slice(0, 8)}...`;
}

async function main() {
  console.log(`[SMOKE] Base URL: ${BASE_URL}`);

  await run("GET /api/health", checkHealth);

  await run("Superuser auth", async () => {
    const auth = await pb
      .collection("_superusers")
      .authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    return `id=${auth.record?.id || "unknown"} email=${auth.record?.email || "unknown"}`;
  });

  await run("List collections metadata", async () => {
    const cols = await pb.collections.getFullList();
    return `collections=${cols.length}`;
  });

  await run("users list page=1 perPage=1", async () => {
    const users = await pb.collection("users").getList(1, 1, { skipTotal: false });
    return `totalItems=${users.totalItems}`;
  });

  await run("buildings startup zone filter", async () => {
    const res = await pb.collection("buildings").getList(1, 500, {
      skipTotal: true,
      filter: ZONE_FILTER,
    });
    return `items=${res.items.length}`;
  });

  await run("map_resources startup zone filter", async () => {
    const res = await pb.collection("map_resources").getList(1, 500, {
      skipTotal: true,
      filter: ZONE_FILTER,
    });
    return `items=${res.items.length}`;
  });

  await run("dropped_items startup zone filter", async () => {
    const res = await pb.collection("dropped_items").getList(1, 500, {
      skipTotal: true,
      filter: ZONE_FILTER,
    });
    return `items=${res.items.length}`;
  });

  await run("chat_messages sort=-created", async () => {
    const res = await pb.collection("chat_messages").getList(1, 500, {
      skipTotal: true,
      sort: "-created",
    });
    return `items=${res.items.length}`;
  });

  await run("GET /api/realtime", checkRealtimeEndpoint);

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.length - passed;

  console.log("");
  console.log("=== POCKETBASE STARTUP SMOKE REPORT ===");
  for (const row of results) {
    const details = row.details ? ` :: ${row.details}` : "";
    console.log(`${row.status} - ${row.name}${details}`);
  }
  console.log("---------------------------------------");
  console.log(`Summary: PASS=${passed} FAIL=${failed} TOTAL=${results.length}`);
  pb.authStore.clear();

  const exitCode = failed > 0 ? 1 : 0;
  process.exit(exitCode);
}

main().catch((error) => {
  console.error("[SMOKE] Fatal error:", error);
  process.exit(1);
});
