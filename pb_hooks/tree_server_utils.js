var TREE_MAX_HP = 3;
var TREE_HIT_ENERGY_COST = 2;
var TREE_HIT_GOLD_REWARD = 5000000;
var TREE_HIT_GLORY_REWARD = 2;
var TREE_HIT_WOOD_REWARD = 1;
var TREE_RESPAWN_DELAY_MS = 3 * 60 * 1000;
var TREE_RESPAWN_RETRY_MS = 60 * 1000;
var TREE_RESPAWN_ATTEMPTS_LIMIT = 200;
var WOOD_ITEM_ID = "10001";
var ZONE_SIZE = 200;
var TREE_DEBUG_PREFIX = "[TreeHit Debug]";

var forestMask = null;
try {
  forestMask = require(__hooks + "/forest_mask.js");
} catch (e1) {
  try {
    forestMask = require(__hooks + "/forest-mask.json");
  } catch (e2) {
    try {
      forestMask = require("./forest_mask.js");
    } catch (e3) {
      try {
        forestMask = require("./forest-mask.json");
      } catch (e4) {}
    }
  }
}

function isForestCell(x, y) {
  if (!forestMask || !forestMask.rows) return false;
  var maskX = ((x % 50) + 50) % 50;
  var maskY = ((y % 50) + 50) % 50;
  var row = forestMask.rows[maskY];
  if (!row) return false;
  return row[maskX] === "1" || row.charAt(maskX) === "1";
}

function toInt(value, fallback) {
  var numeric = parseInt(value, 10);
  return isNaN(numeric) ? fallback : numeric;
}

function normalizeString(value, fallback) {
  if (value === null || value === undefined) return fallback || "";
  var text = String(value);
  return text ? text : (fallback || "");
}

function debugLog(scope, payload) {
  try {
    console.log(TREE_DEBUG_PREFIX + "[" + scope + "] " + JSON.stringify(payload));
  } catch (error) {
    console.log(TREE_DEBUG_PREFIX + "[" + scope + "] " + String(payload));
  }
}

function summarizeRawValue(value) {
  var objectTag = Object.prototype.toString.call(value);
  var constructorName = value && value.constructor ? normalizeString(value.constructor.name, "") : "";
  var keys = [];
  try {
    keys = value && typeof value === "object" ? Object.keys(value).slice(0, 50) : [];
  } catch (error) {
    keys = ["<keys_error:" + String(error) + ">"];
  }
  return {
    type: typeof value,
    objectTag: objectTag,
    constructorName: constructorName,
    isArray: Array.isArray(value),
    keys: keys,
    length: value && typeof value.length === "number" ? value.length : null,
    byteLength: value && typeof value.byteLength === "number" ? value.byteLength : null,
    stringValue: value === null || value === undefined ? value : String(value),
  };
}

function safePublicExport(record) {
  try {
    if (record && typeof record.publicExport === "function") {
      return record.publicExport();
    }
  } catch (error) {
    return { error: String(error) };
  }
  return null;
}

function isByteArrayLike(value) {
  if (!value) return false;
  if (typeof Uint8Array !== "undefined" && value instanceof Uint8Array) return true;
  if (!Array.isArray(value)) return false;
  for (var i = 0; i < value.length; i++) {
    var item = value[i];
    if (typeof item !== "number" || !isFinite(item) || item < 0 || item > 255) {
      return false;
    }
  }
  return true;
}

function decodeUtf8Bytes(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  try {
    var bytes = value;
    if (Array.isArray(value)) {
      if (typeof Uint8Array !== "undefined") {
        bytes = Uint8Array.from(value);
      }
    }
    if (typeof TextDecoder !== "undefined") {
      return new TextDecoder("utf-8").decode(bytes);
    }
  } catch (error) {
    // Pure JS UTF-8 decoder fallback below.
  }

  var raw = Array.isArray(value) ? value : Array.prototype.slice.call(value || []);
  var out = "";
  var i = 0;
  var len = raw.length;
  while (i < len) {
    var c = raw[i++] & 0xff;
    if ((c & 0x80) === 0) {
      out += String.fromCharCode(c);
    } else if ((c & 0xe0) === 0xc0) {
      if (i < len) {
        var c2 = raw[i++] & 0xff;
        out += String.fromCharCode(((c & 0x1f) << 6) | (c2 & 0x3f));
      }
    } else if ((c & 0xf0) === 0xe0) {
      if (i + 1 < len) {
        var c2 = raw[i++] & 0xff;
        var c3 = raw[i++] & 0xff;
        out += String.fromCharCode(((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f));
      }
    } else if ((c & 0xf8) === 0xf0) {
      if (i + 2 < len) {
        var c2 = raw[i++] & 0xff;
        var c3 = raw[i++] & 0xff;
        var c4 = raw[i++] & 0xff;
        var cp = (((c & 0x07) << 18) | ((c2 & 0x3f) << 12) | ((c3 & 0x3f) << 6) | (c4 & 0x3f)) - 0x10000;
        out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      }
    } else {
      out += String.fromCharCode(c);
    }
  }
  return out;
}

function tryParseInventoryJson(raw) {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function hashToBase36(input) {
  var hash = 2166136261;
  var raw = normalizeString(input, "");
  for (var i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(36);
}

function sanitizePbId(id) {
  var strId = normalizeString(id, "");
  if (strId.length === 15 && /^[a-z0-9]+$/i.test(strId)) {
    return strId;
  }

  var safe = strId.replace(/[^a-zA-Z0-9]/g, "z").toLowerCase();
  var pbId = "";

  if (safe.length > 15) {
    var hash = hashToBase36(strId);
    var prefixLen = Math.max(1, 15 - hash.length);
    pbId = safe.substring(0, prefixLen) + hash;
  } else {
    pbId = safe;
    while (pbId.length < 15) {
      pbId += "0";
    }
  }

  return pbId.substring(0, 15);
}

function parseResourceCoords(resourceId) {
  var raw = normalizeString(resourceId, "").trim();
  if (raw.indexOf("tree_") === 0) {
    raw = raw.substring(5);
  }
  var parts = raw.split("_");
  if (parts.length !== 2) return null;
  var x = toInt(parts[0], NaN);
  var y = toInt(parts[1], NaN);
  if (isNaN(x) || isNaN(y)) return null;
  return { x: x, y: y };
}

function parseDataField(record) {
  if (!record) return {};
  var raw = record.get("data");
  if (!raw) return {};

  if (Array.isArray(raw) || isByteArrayLike(raw)) {
    try {
      var decoded = decodeUtf8Bytes(raw);
      var parsedBytes = JSON.parse(decoded);
      if (parsedBytes && typeof parsedBytes === "object" && !Array.isArray(parsedBytes)) {
        return parsedBytes;
      }
      return {};
    } catch (error) {
      return {};
    }
  }

  if (typeof raw === "string") {
    try {
      var parsedString = JSON.parse(raw);
      if (parsedString && typeof parsedString === "object" && !Array.isArray(parsedString)) {
        return parsedString;
      }
      return {};
    } catch (error) {
      return {};
    }
  }

  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }

  return {};
}

function setDataField(record, obj) {
  record.set("data", JSON.stringify(obj));
}

function getTreeCurrentHp(treeRecord) {
  if (!treeRecord) return TREE_MAX_HP;
  var data = parseDataField(treeRecord);
  var hp = data && data.hp !== undefined ? toInt(data.hp, NaN) : NaN;
  if (isNaN(hp)) {
    hp = toInt(treeRecord.get("hp"), NaN);
  }
  if (isNaN(hp) || hp <= 0) {
    var maxHp = data && data.maxHp !== undefined ? toInt(data.maxHp, NaN) : NaN;
    if (isNaN(maxHp)) {
      maxHp = toInt(treeRecord.get("maxHp"), TREE_MAX_HP);
    }
    hp = maxHp > 0 ? maxHp : TREE_MAX_HP;
  }
  return hp;
}

function ensureInventoryObject(userRecord) {
  var rawInventory = userRecord.get("inventory");
  var inventory = rawInventory;
  var dataInventory = userRecord ? userRecord.get("data") && userRecord.get("data").inventory : undefined;

  debugLog("inventory.raw", {
    userId: userRecord ? userRecord.id : null,
    inventorySummary: summarizeRawValue(inventory),
    dataInventorySummary: summarizeRawValue(dataInventory),
  });

  debugLog("inventory.inspect", {
    userId: userRecord ? userRecord.id : null,
    raw: inventory,
    rawType: typeof inventory,
    constructor: inventory && inventory.constructor ? normalizeString(inventory.constructor.name, "") : "",
    isArray: Array.isArray(inventory),
    keys: inventory && typeof inventory === "object" ? Object.keys(inventory).slice(0, 50) : [],
    publicExportInventory: (safePublicExport(userRecord) || {}).inventory,
    dataInventory: dataInventory,
  });

  if (typeof inventory === "string") {
    inventory = tryParseInventoryJson(inventory) || {};
  } else if (isByteArrayLike(inventory)) {
    var decodedInventoryText = decodeUtf8Bytes(inventory);
    inventory = tryParseInventoryJson(decodedInventoryText) || {};
  } else if (inventory && typeof inventory === "object" && !Array.isArray(inventory)) {
    inventory = inventory;
  } else {
    inventory = {};
  }

  var sanitized = {};
  for (var key in inventory) {
    if (!Object.prototype.hasOwnProperty.call(inventory, key)) continue;
    var itemId = toInt(key, NaN);
    if (isNaN(itemId) || itemId < 10000) continue;
    sanitized[String(itemId)] = Math.max(0, toInt(inventory[key], 0));
  }

  debugLog("inventory.decoded", {
    userId: userRecord ? userRecord.id : null,
    rawSummary: summarizeRawValue(rawInventory),
    decodedSummary: summarizeRawValue(sanitized),
    inventory: sanitized,
  });

  if (!Object.keys(sanitized).length) {
    debugLog("inventory.empty_after_normalize", {
      userId: userRecord ? userRecord.id : null,
      rawInventorySummary: summarizeRawValue(inventory),
      rawDataSummary: summarizeRawValue(userRecord ? userRecord.get("data") : undefined),
      publicExport: safePublicExport(userRecord),
    });
  }
  return sanitized;
}

function addInventoryItem(userRecord, itemId, amount) {
  var inventory = ensureInventoryObject(userRecord);
  var key = String(itemId);
  var beforeAmount = Math.max(0, Number(inventory[key] || 0));
  inventory[key] = Math.max(0, beforeAmount + amount);
  userRecord.set("inventory", inventory);
  return {
    woodItemId: key,
    beforeAmount: beforeAmount,
    afterAmount: Math.max(0, toInt(inventory[key], 0)),
    inventoryKeys: Object.keys(inventory),
    inventory: inventory,
  };
}

function getTreeRecordSnapshot(treeRecord, fallbackCoords) {
  if (!treeRecord) {
    if (fallbackCoords) {
      var zoneId = Math.floor(fallbackCoords.x / ZONE_SIZE) + "_" + Math.floor(fallbackCoords.y / ZONE_SIZE);
      return {
        id: "tree_" + fallbackCoords.x + "_" + fallbackCoords.y,
        gameId: "tree_" + fallbackCoords.x + "_" + fallbackCoords.y,
        x: fallbackCoords.x,
        y: fallbackCoords.y,
        zoneId: zoneId,
        sectorId: zoneId,
        type: "tree",
        hp: TREE_MAX_HP,
        maxHp: TREE_MAX_HP,
        state: "alive",
      };
    }
    return null;
  }
  var data = parseDataField(treeRecord);
  return {
    id: normalizeString(treeRecord.id, ""),
    gameId: normalizeString(treeRecord.get("gameId"), normalizeString(data.gameId, "")),
    x: toInt(treeRecord.get("x"), toInt(data.x, NaN)),
    y: toInt(treeRecord.get("y"), toInt(data.y, NaN)),
    zoneId: normalizeString(treeRecord.get("zoneId"), normalizeString(data.zoneId, "")),
    sectorId: normalizeString(treeRecord.get("sectorId"), normalizeString(data.sectorId, "")),
    type: normalizeString(treeRecord.get("type"), normalizeString(data.type, "")),
    hp: data && data.hp !== undefined ? toInt(data.hp, TREE_MAX_HP) : toInt(treeRecord.get("hp"), TREE_MAX_HP),
    maxHp: data && data.maxHp !== undefined ? toInt(data.maxHp, TREE_MAX_HP) : toInt(treeRecord.get("maxHp"), TREE_MAX_HP),
    state: normalizeString(data && data.state ? data.state : treeRecord.get("state"), "alive"),
  };
}

function buildTreeHitResponse(status, payload) {
  return {
    status: status,
    body: payload,
  };
}

function buildErrorResponse(status, errorCode, details, message) {
  return buildTreeHitResponse(status, {
    success: false,
    error: errorCode,
    message: message || errorCode,
    details: details || {},
  });
}

function resolveTreeRecord(app, resourceId) {
  var logicalResourceId = normalizeString(resourceId, "").trim();
  var coords = parseResourceCoords(logicalResourceId);
  var sanitizedId = sanitizePbId(logicalResourceId);
  var attempts = [];

  if (!logicalResourceId) {
    return {
      record: null,
      attempts: attempts,
      matchedBy: null,
      sanitizedId: sanitizedId,
      coords: coords,
      isVirtual: false,
    };
  }

  if (logicalResourceId.length === 15 && /^[a-z0-9]+$/i.test(logicalResourceId)) {
    attempts.push({ mode: "record.id", value: logicalResourceId });
    try {
      var recById = app.findRecordById("map_resources", logicalResourceId);
      if (recById) {
        return {
          record: recById,
          attempts: attempts,
          matchedBy: "record.id",
          sanitizedId: sanitizedId,
          coords: coords,
          isVirtual: false,
        };
      }
    } catch (error) {
      attempts[attempts.length - 1].error = String(error);
    }
  }

  attempts.push({ mode: "sanitizedRecord.id", value: sanitizedId });
  try {
    var recBySanitized = app.findRecordById("map_resources", sanitizedId);
    if (recBySanitized) {
      return {
        record: recBySanitized,
        attempts: attempts,
        matchedBy: "sanitizedRecord.id",
        sanitizedId: sanitizedId,
        coords: coords,
        isVirtual: false,
      };
    }
  } catch (error) {
    attempts[attempts.length - 1].error = String(error);
  }

  attempts.push({ mode: "gameId", value: logicalResourceId });
  try {
    var recByGameId = app.findFirstRecordByFilter(
      "map_resources",
      "gameId = {:resourceId}",
      { resourceId: logicalResourceId }
    );
    if (recByGameId) {
      return {
        record: recByGameId,
        attempts: attempts,
        matchedBy: "gameId",
        sanitizedId: sanitizedId,
        coords: coords,
        isVirtual: false,
      };
    }
  } catch (error) {
    attempts[attempts.length - 1].error = String(error);
  }

  if (coords) {
    attempts.push({ mode: "coords", value: { x: coords.x, y: coords.y } });
    try {
      var recByCoords = app.findFirstRecordByFilter(
        "map_resources",
        "x = {:x} && y = {:y}",
        { x: coords.x, y: coords.y }
      );
      if (recByCoords) {
        return {
          record: recByCoords,
          attempts: attempts,
          matchedBy: "coords",
          sanitizedId: sanitizedId,
          coords: coords,
          isVirtual: false,
        };
      }
    } catch (error) {
      attempts[attempts.length - 1].error = String(error);
    }

    // Procedural Forest Mask lookup:
    // If no database record exists, check if this coordinate is a tree in the 50x50 mask
    if (isForestCell(coords.x, coords.y)) {
      // 1. Check if tree is respawning (pending respawn record)
      try {
        var pendingRespawn = app.findFirstRecordByFilter(
          "tree_respawns",
          "oldX = {:x} && oldY = {:y} && status = 'pending'",
          { x: coords.x, y: coords.y }
        );
        if (pendingRespawn) {
          attempts.push({ mode: "virtualMask.respawning", value: { x: coords.x, y: coords.y } });
          return {
            record: null,
            attempts: attempts,
            matchedBy: null,
            sanitizedId: sanitizedId,
            coords: coords,
            isRespawning: true,
            isVirtual: false,
          };
        }
      } catch (_eRespawn) {}

      // 2. Check if a building (mountain, river, player building) is on this cell
      try {
        var blockingBuilding = app.findFirstRecordByFilter(
          "buildings",
          "x = {:x} && y = {:y} && (hp > 0 || hp = null)",
          { x: coords.x, y: coords.y }
        );
        if (blockingBuilding) {
          attempts.push({ mode: "virtualMask.blockedByBuilding", value: { x: coords.x, y: coords.y, buildingId: blockingBuilding.get("buildingId") } });
          return {
            record: null,
            attempts: attempts,
            matchedBy: null,
            sanitizedId: sanitizedId,
            coords: coords,
            isBlocked: true,
            isVirtual: false,
          };
        }
      } catch (_eBuilding) {}

      // 3. Check if non-tree resource is on this cell
      try {
        var blockingResource = app.findFirstRecordByFilter(
          "map_resources",
          "x = {:x} && y = {:y} && type != 'tree'",
          { x: coords.x, y: coords.y }
        );
        if (blockingResource) {
          attempts.push({ mode: "virtualMask.blockedByResource", value: { x: coords.x, y: coords.y, type: blockingResource.get("type") } });
          return {
            record: null,
            attempts: attempts,
            matchedBy: null,
            sanitizedId: sanitizedId,
            coords: coords,
            isBlocked: true,
            isVirtual: false,
          };
        }
      } catch (_eRes) {}

      // Cell is a valid, unharvested virtual tree from mask!
      attempts.push({ mode: "virtualMask.valid", value: { x: coords.x, y: coords.y } });
      return {
        record: null,
        attempts: attempts,
        matchedBy: "virtualMask",
        sanitizedId: sanitizedId,
        coords: coords,
        isVirtual: true,
      };
    }
  }

  return {
    record: null,
    attempts: attempts,
    matchedBy: null,
    sanitizedId: sanitizedId,
    coords: coords,
    isVirtual: false,
  };
}

function buildRespawnJobAtCoords(txApp, x, y, zoneId, logicalResourceId, nowMs) {
  try {
    var respawnCollection = txApp.findCollectionByNameOrId("tree_respawns");
    if (!respawnCollection) return;
    var respawnJob = new Record(respawnCollection);

    respawnJob.set("resourceType", "tree");
    respawnJob.set("oldResourceId", logicalResourceId);
    respawnJob.set("oldX", toInt(x, 0));
    respawnJob.set("oldY", toInt(y, 0));
    respawnJob.set("zoneId", zoneId);
    respawnJob.set("sectorId", zoneId);
    respawnJob.set("respawnAt", nowMs + TREE_RESPAWN_DELAY_MS);
    respawnJob.set("status", "pending");
    respawnJob.set("attempts", 0);
    respawnJob.set("createdAt", nowMs);

    txApp.save(respawnJob);
  } catch (err) {
    debugLog("buildRespawnJobAtCoords.error", String(err));
  }
}

function buildRespawnJob(txApp, treeRecord, logicalResourceId, nowMs) {
  var x = toInt(treeRecord.get("x"), 0);
  var y = toInt(treeRecord.get("y"), 0);
  var sectorId = normalizeString(treeRecord.get("sectorId"), normalizeString(treeRecord.get("zoneId"), ""));
  buildRespawnJobAtCoords(txApp, x, y, sectorId, logicalResourceId, nowMs);
}

function processTreeHit(app, authRecord, resourceId) {
  var logicalResourceId = normalizeString(resourceId, "").trim();
  if (!logicalResourceId) {
    debugLog("process.invalid_resource_id", {
      authUserId: authRecord ? authRecord.id : null,
      incomingResourceId: resourceId,
    });
    return buildErrorResponse(400, "INVALID_RESOURCE_ID", {
      resourceId: resourceId,
    }, "Missing or invalid resourceId");
  }

  debugLog("process.request", {
    authUserId: authRecord ? authRecord.id : null,
    parsedResourceId: logicalResourceId,
    sanitizedPbId: sanitizePbId(logicalResourceId),
    coords: parseResourceCoords(logicalResourceId),
  });

  var result = buildTreeHitResponse(200, {
    success: true,
    applied: false,
    resourceId: logicalResourceId,
  });

  try {
    app.runInTransaction(function (txApp) {
      if (!authRecord || !authRecord.id) {
        result = buildErrorResponse(401, "AUTH_REQUIRED", {
          resourceId: logicalResourceId,
        }, "Auth is required");
        debugLog("process.auth_missing", result.body);
        return;
      }

      var userRecord = txApp.findRecordById("users", authRecord.id);
      var lookup = resolveTreeRecord(txApp, logicalResourceId);
      var isVirtual = lookup.isVirtual === true;
      var treeRecord = lookup.record;

      debugLog("user.record.before_apply", {
        authUserId: authRecord.id,
        inventoryFieldSummary: summarizeRawValue(userRecord ? userRecord.get("inventory") : undefined),
        dataFieldSummary: summarizeRawValue(userRecord ? userRecord.get("data") : undefined),
        publicExport: safePublicExport(userRecord),
      });

      debugLog("process.lookup", {
        authUserId: authRecord.id,
        resourceId: logicalResourceId,
        lookupFilters: lookup.attempts,
        matchedBy: lookup.matchedBy,
        foundRecord: getTreeRecordSnapshot(treeRecord, lookup.coords),
        isVirtual: isVirtual,
      });

      if (!treeRecord && !isVirtual) {
        var errCode = lookup.isRespawning ? "TREE_NOT_ALIVE" : (lookup.isBlocked ? "BLOCKED_TILE" : "TREE_NOT_FOUND");
        result = buildErrorResponse(lookup.isRespawning ? 409 : 400, errCode, {
          resourceId: logicalResourceId,
          sanitizedPbId: lookup.sanitizedId,
          coords: lookup.coords,
          lookupFilters: lookup.attempts,
        }, lookup.isRespawning ? "Tree is respawning" : "Tree resource was not found");
        debugLog("process.tree_not_found_or_blocked", result.body);
        return;
      }

      if (treeRecord && normalizeString(treeRecord.get("type"), "") !== "tree") {
        result = buildErrorResponse(400, "NOT_A_TREE", {
          resourceId: logicalResourceId,
          matchedBy: lookup.matchedBy,
          record: getTreeRecordSnapshot(treeRecord, lookup.coords),
        }, "Resolved resource is not a tree");
        debugLog("process.not_a_tree", result.body);
        return;
      }

      var currentTreeData = treeRecord ? parseDataField(treeRecord) : {};
      var treeState = normalizeString(currentTreeData.state || (treeRecord ? treeRecord.get("state") : "alive"), "alive");
      if (treeState !== "alive") {
        result = buildErrorResponse(409, "TREE_NOT_ALIVE", {
          resourceId: logicalResourceId,
          matchedBy: lookup.matchedBy,
          record: getTreeRecordSnapshot(treeRecord, lookup.coords),
        }, "Tree is not in alive state");
        debugLog("process.tree_not_alive", result.body);
        return;
      }

      var currentEnergy = toInt(userRecord.get("energy"), 0);
      if (currentEnergy < TREE_HIT_ENERGY_COST) {
        result = buildErrorResponse(409, "NOT_ENOUGH_ENERGY", {
          resourceId: logicalResourceId,
          requiredEnergy: TREE_HIT_ENERGY_COST,
          currentEnergy: currentEnergy,
          userId: authRecord.id,
        }, "Not enough energy to hit tree");
        result.body.requiredEnergy = TREE_HIT_ENERGY_COST;
        result.body.currentEnergy = currentEnergy;
        debugLog("process.not_enough_energy", result.body);
        return;
      }

      var currentHp = isVirtual ? TREE_MAX_HP : getTreeCurrentHp(treeRecord);
      var nextHp = Math.max(0, currentHp - 1);
      var treesChoppedIncrement = nextHp <= 0 ? 1 : 0;
      var nowMs = Date.now();
      var targetX = lookup.coords ? lookup.coords.x : toInt(treeRecord.get("x"), 0);
      var targetY = lookup.coords ? lookup.coords.y : toInt(treeRecord.get("y"), 0);
      var zoneId = Math.floor(targetX / ZONE_SIZE) + "_" + Math.floor(targetY / ZONE_SIZE);

      debugLog("process.before_apply", {
        authUserId: authRecord.id,
        resourceId: logicalResourceId,
        matchedBy: lookup.matchedBy,
        record: getTreeRecordSnapshot(treeRecord, lookup.coords),
        currentEnergy: currentEnergy,
        nextHp: nextHp,
        treesChoppedIncrement: treesChoppedIncrement,
        isVirtual: isVirtual,
      });

      userRecord.set("energy", Math.max(0, currentEnergy - TREE_HIT_ENERGY_COST));
      userRecord.set("gold", toInt(userRecord.get("gold"), 0) + TREE_HIT_GOLD_REWARD);
      userRecord.set("glory", toInt(userRecord.get("glory"), 0) + TREE_HIT_GLORY_REWARD);
      if (treesChoppedIncrement > 0) {
        userRecord.set("treesChopped", toInt(userRecord.get("treesChopped"), 0) + treesChoppedIncrement);
      }
      var inventoryReward = addInventoryItem(userRecord, WOOD_ITEM_ID, TREE_HIT_WOOD_REWARD);

      debugLog("reward.inventory", {
        userId: authRecord.id,
        woodItemId: inventoryReward.woodItemId,
        beforeWood: inventoryReward.beforeAmount,
        afterWood: inventoryReward.afterAmount,
        inventoryKeys: inventoryReward.inventoryKeys,
      });

      debugLog("reward.payload", {
        userId: authRecord.id,
        energy: toInt(userRecord.get("energy"), 0),
        gold: toInt(userRecord.get("gold"), 0),
        glory: toInt(userRecord.get("glory"), 0),
        treesChopped: toInt(userRecord.get("treesChopped"), 0),
        inventory: inventoryReward.inventory,
      });

      txApp.save(userRecord);

      if (nextHp > 0) {
        if (isVirtual || !treeRecord) {
          var resourcesCollection = txApp.findCollectionByNameOrId("map_resources");
          treeRecord = new Record(resourcesCollection);
          treeRecord.set("type", "tree");
          treeRecord.set("x", targetX);
          treeRecord.set("y", targetY);
          treeRecord.set("zoneId", zoneId);
          treeRecord.set("sectorId", zoneId);
          treeRecord.set("gameId", logicalResourceId);
        }
        var updatedTreeData = parseDataField(treeRecord);
        updatedTreeData.hp = nextHp;
        updatedTreeData.maxHp = TREE_MAX_HP;
        updatedTreeData.state = "alive";
        updatedTreeData.x = targetX;
        updatedTreeData.y = targetY;
        updatedTreeData.type = "tree";
        updatedTreeData.gameId = logicalResourceId;
        updatedTreeData.zoneId = zoneId;
        setDataField(treeRecord, updatedTreeData);
        try { treeRecord.set("hp", nextHp); } catch (_) {}
        try { treeRecord.set("maxHp", TREE_MAX_HP); } catch (_) {}
        try { treeRecord.set("state", "alive"); } catch (_) {}
        try { treeRecord.set("sectorId", zoneId); } catch (_) {}
        try { treeRecord.set("respawnAt", 0); } catch (_) {}
        if (toInt(treeRecord.get("createdAt"), 0) <= 0) {
          try { treeRecord.set("createdAt", nowMs); } catch (_) {}
        }
        txApp.save(treeRecord);
      } else {
        // Tree felled: build respawn job at exact coordinate
        buildRespawnJobAtCoords(txApp, targetX, targetY, zoneId, logicalResourceId, nowMs);
        if (treeRecord && !isVirtual) {
          txApp.delete(treeRecord);
        }
      }

      result.body = {
        success: true,
        applied: true,
        resourceId: logicalResourceId,
        matchedBy: lookup.matchedBy,
        depleted: nextHp <= 0,
        currentHp: nextHp,
        rewardGold: TREE_HIT_GOLD_REWARD,
        rewardWood: TREE_HIT_WOOD_REWARD,
        rewardGlory: TREE_HIT_GLORY_REWARD,
        energyCost: TREE_HIT_ENERGY_COST,
        treesChoppedIncrement: treesChoppedIncrement,
        treeRecord: getTreeRecordSnapshot(treeRecord, lookup.coords),
        playerGold: toInt(userRecord.get("gold"), 0),
        playerEnergy: toInt(userRecord.get("energy"), 0),
        playerGlory: toInt(userRecord.get("glory"), 0),
        playerTreesChopped: toInt(userRecord.get("treesChopped"), 0),
        inventory: inventoryReward.inventory,
      };

      debugLog("process.success", {
        authUserId: authRecord.id,
        resourceId: logicalResourceId,
        response: result.body,
      });
    });
  } catch (error) {
    debugLog("process.exception", {
      authUserId: authRecord ? authRecord.id : null,
      resourceId: logicalResourceId,
      message: String(error),
      data: error && error.data ? error.data : null,
      response: error && error.response ? error.response : null,
    });
    result = buildErrorResponse(400, "USER_REWARD_UPDATE_FAILED", {
      resourceId: logicalResourceId,
      message: String(error),
      data: error && error.data ? error.data : null,
      response: error && error.response ? error.response : null,
    }, "Failed to apply tree hit rewards");
  }

  return result;
}

function respawnSingleTree(app, respawnRecord) {
  try {
    app.runInTransaction(function (txApp) {
      var status = normalizeString(respawnRecord.get("status"), "pending");
      if (status !== "pending") return;

      var respawnAt = toInt(respawnRecord.get("respawnAt"), 0);
      var nowMs = Date.now();

      if (respawnAt > nowMs) return;

      // In the deterministic procedural mask model, trees respawn at the exact same tile.
      // Simply deleting the pending tree_respawns record naturally un-suppresses the tree!
      // If a building was constructed on this tile while felled, building priority blocks it.
      // NO synthetic map_resources record is created!
      txApp.delete(respawnRecord);
    });
  } catch (error) {
    debugLog("respawnSingleTree.error", String(error));
  }
}

function processDueTreeRespawns(app) {
  var nowMs = Date.now();
  var records = app.findRecordsByFilter(
    "tree_respawns",
    "status = 'pending' && respawnAt <= {:nowMs}",
    "respawnAt",
    TREE_RESPAWN_ATTEMPTS_LIMIT,
    0,
    { nowMs: nowMs }
  );

  if (!records || !records.length) return 0;

  for (var i = 0; i < records.length; i++) {
    respawnSingleTree(app, records[i]);
  }

  return records.length;
}

module.exports = {
  TREE_MAX_HP: TREE_MAX_HP,
  TREE_HIT_ENERGY_COST: TREE_HIT_ENERGY_COST,
  TREE_HIT_GOLD_REWARD: TREE_HIT_GOLD_REWARD,
  TREE_HIT_GLORY_REWARD: TREE_HIT_GLORY_REWARD,
  TREE_HIT_WOOD_REWARD: TREE_HIT_WOOD_REWARD,
  TREE_RESPAWN_DELAY_MS: TREE_RESPAWN_DELAY_MS,
  isForestCell: isForestCell,
  resolveTreeRecord: resolveTreeRecord,
  processTreeHit: processTreeHit,
  processDueTreeRespawns: processDueTreeRespawns,
};
