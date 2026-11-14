// Server-authoritative treasure chest collection.
// Mirrors the processTreeHit contract: single transaction per collect, the
// client only reconciles the returned payload. Chest share state lives inside
// the existing map_resources data JSON column (data.chest) — no schema change.

var CHEST_COIN_REWARDS = [100, 500, 1000, 2000];
var CHEST_MAX_COLLECTORS = 2;
// Keep the legacy client-side chest balance: a collect cost 1 energy and
// granted 2 glory (App.tsx ENERGY_COST_PER_CHOP / GLORY_PER_CHOP).
var CHEST_ENERGY_COST = 1;
var CHEST_GLORY_REWARD = 2;
var CHEST_DEBUG_PREFIX = "[ChestCollect Debug]";

function chestToInt(value, fallback) {
  var numeric = parseInt(value, 10);
  return isNaN(numeric) ? fallback : numeric;
}

function chestNormalizeString(value, fallback) {
  if (value === null || value === undefined) return fallback || "";
  var text = String(value);
  return text ? text : (fallback || "");
}

function chestDebugLog(scope, payload) {
  try {
    console.log(CHEST_DEBUG_PREFIX + "[" + scope + "] " + JSON.stringify(payload));
  } catch (error) {
    console.log(CHEST_DEBUG_PREFIX + "[" + scope + "] " + String(payload));
  }
}

function chestIsByteArrayLike(value) {
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

function chestDecodeUtf8Bytes(value) {
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

function chestHashToBase36(input) {
  var hash = 2166136261;
  var raw = chestNormalizeString(input, "");
  for (var i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(36);
}

function chestSanitizePbId(id) {
  var strId = chestNormalizeString(id, "");
  if (strId.length === 15 && /^[a-z0-9]+$/i.test(strId)) {
    return strId;
  }

  var safe = strId.replace(/[^a-zA-Z0-9]/g, "z").toLowerCase();
  var pbId = "";

  if (safe.length > 15) {
    var hash = chestHashToBase36(strId);
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

function chestParseDataField(record) {
  if (!record) return {};
  var raw = record.get("data");
  if (!raw) return {};

  if (Array.isArray(raw) || chestIsByteArrayLike(raw)) {
    try {
      var decoded = chestDecodeUtf8Bytes(raw);
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

function chestSetDataField(record, obj) {
  record.set("data", JSON.stringify(obj));
}

function chestBuildResponse(status, payload) {
  return {
    status: status,
    body: payload,
  };
}

function chestBuildErrorResponse(status, errorCode, details, message) {
  return chestBuildResponse(status, {
    success: false,
    error: errorCode,
    message: message || errorCode,
    details: details || {},
  });
}

function parseChestCoords(resourceId) {
  var raw = chestNormalizeString(resourceId, "").trim();
  // Legacy chest logical ids use a "chest_" prefix ("chest_84_281"); current ones are "84_281".
  if (raw.indexOf("chest_") === 0) {
    raw = raw.substring(6);
  }
  var parts = raw.split("_");
  if (parts.length !== 2) return null;
  var x = chestToInt(parts[0], NaN);
  var y = chestToInt(parts[1], NaN);
  if (isNaN(x) || isNaN(y)) return null;
  return { x: x, y: y };
}

function resolveChestRecord(txApp, logicalResourceId) {
  var sanitizedId = chestSanitizePbId(logicalResourceId);

  try {
    var byId = txApp.findRecordById("map_resources", sanitizedId);
    var byIdGameId = chestNormalizeString(byId.get("gameId"), "");
    if (byId && (byIdGameId === logicalResourceId || chestNormalizeString(byId.get("type"), "") === "chest")) {
      return { record: byId, matchedBy: "id" };
    }
  } catch (errorById) {
    chestDebugLog("resolve.by_id_miss", {
      resourceId: logicalResourceId,
      sanitizedId: sanitizedId,
      message: String(errorById),
    });
  }

  try {
    var byGameId = txApp.findRecordsByFilter(
      "map_resources",
      "gameId = {:gid} && type = 'chest'",
      "",
      1,
      0,
      { gid: logicalResourceId }
    );
    if (byGameId && byGameId.length > 0) {
      return { record: byGameId[0], matchedBy: "gameId" };
    }
  } catch (errorByFilter) {
    chestDebugLog("resolve.by_filter_error", String(errorByFilter));
  }

  // Last resort: legacy/world-gen chests may carry gameIds like "chest_84_281"
  // while the client resolved a bare "84_281" (or vice versa) — match by coords.
  var coords = parseChestCoords(logicalResourceId);
  if (coords) {
    try {
      var byCoords = txApp.findRecordsByFilter(
        "map_resources",
        "x = {:x} && y = {:y} && type = 'chest'",
        "",
        1,
        0,
        { x: coords.x, y: coords.y }
      );
      if (byCoords && byCoords.length > 0) {
        chestDebugLog("resolve.by_coords", {
          resourceId: logicalResourceId,
          matchedGameId: chestNormalizeString(byCoords[0].get("gameId"), ""),
        });
        return { record: byCoords[0], matchedBy: "coords" };
      }
    } catch (errorByCoords) {
      chestDebugLog("resolve.by_coords_error", String(errorByCoords));
    }
  }

  return { record: null, matchedBy: "none" };
}

function rollChestReward() {
  var rewards = CHEST_COIN_REWARDS;
  var index = Math.floor(Math.random() * rewards.length);
  var rolled = chestToInt(rewards[index], rewards[0]);
  if (rolled <= 0) rolled = rewards[0];
  return rolled;
}

function applyChestRewards(txApp, userRecord, rewardGold) {
  var nextGold = Math.max(0, chestToInt(userRecord.get("gold"), 0)) + rewardGold;
  var nextEnergy = Math.max(0, chestToInt(userRecord.get("energy"), 0) - CHEST_ENERGY_COST);
  var nextGlory = Math.max(0, chestToInt(userRecord.get("glory"), 0)) + CHEST_GLORY_REWARD;

  userRecord.set("gold", nextGold);
  userRecord.set("energy", nextEnergy);
  userRecord.set("glory", nextGlory);

  var userData = chestParseDataField(userRecord);
  userData.gold = nextGold;
  userData.energy = nextEnergy;
  userData.glory = nextGlory;
  chestSetDataField(userRecord, userData);

  txApp.save(userRecord);
  return {
    gold: nextGold,
    energy: nextEnergy,
    glory: nextGlory,
  };
}

function buildNotEnoughEnergyError(logicalResourceId, currentEnergy) {
  var response = chestBuildErrorResponse(409, "NOT_ENOUGH_ENERGY", {
    resourceId: logicalResourceId,
    requiredEnergy: CHEST_ENERGY_COST,
    currentEnergy: currentEnergy,
  }, "Not enough energy to collect the chest");
  response.body.requiredEnergy = CHEST_ENERGY_COST;
  response.body.currentEnergy = currentEnergy;
  return response;
}

function buildChestSnapshot(record, chestMeta) {
  var data = chestParseDataField(record);
  var x = chestToInt(record.get("x"), chestToInt(data.x, 0));
  var y = chestToInt(record.get("y"), chestToInt(data.y, 0));
  return {
    gameId: chestNormalizeString(record.get("gameId"), chestNormalizeString(data.gameId, "")),
    x: x,
    y: y,
    zoneId: chestNormalizeString(record.get("zoneId"), chestNormalizeString(data.zoneId, "")),
    finderId: chestMeta ? chestNormalizeString(chestMeta.finderId, "") : "",
    finderName: chestMeta ? chestNormalizeString(chestMeta.finderName, "") : "",
    collectors: chestMeta && Array.isArray(chestMeta.collectors) ? chestMeta.collectors : [],
  };
}

function processChestCollect(app, authRecord, resourceId, mode) {
  var logicalResourceId = chestNormalizeString(resourceId, "").trim();
  var normalizedMode = chestNormalizeString(mode, "").trim().toLowerCase();

  if (!logicalResourceId) {
    return chestBuildErrorResponse(400, "INVALID_RESOURCE_ID", {
      resourceId: resourceId,
    }, "Missing or invalid resourceId");
  }

  if (normalizedMode !== "share" && normalizedMode !== "private") {
    return chestBuildErrorResponse(400, "INVALID_MODE", {
      resourceId: logicalResourceId,
      mode: mode,
    }, "Mode must be 'share' or 'private'");
  }

  var result = chestBuildResponse(200, {
    success: true,
    applied: false,
    resourceId: logicalResourceId,
    mode: normalizedMode,
  });

  try {
    app.runInTransaction(function (txApp) {
      if (!authRecord || !authRecord.id) {
        result = chestBuildErrorResponse(401, "AUTH_REQUIRED", {
          resourceId: logicalResourceId,
        }, "Auth is required");
        chestDebugLog("process.auth_missing", result.body);
        return;
      }

      var userRecord = txApp.findRecordById("users", authRecord.id);
      if (!userRecord) {
        result = chestBuildErrorResponse(404, "USER_NOT_FOUND", {
          resourceId: logicalResourceId,
          userId: authRecord.id,
        }, "Authenticated user record was not found");
        chestDebugLog("process.user_missing", result.body);
        return;
      }

      var lookup = resolveChestRecord(txApp, logicalResourceId);
      var chestRecord = lookup.record;

      if (!chestRecord) {
        result = chestBuildErrorResponse(404, "CHEST_GONE", {
          resourceId: logicalResourceId,
          matchedBy: lookup.matchedBy,
        }, "Chest resource was not found (already collected?)");
        chestDebugLog("process.chest_not_found", result.body);
        return;
      }

      if (chestNormalizeString(chestRecord.get("type"), "") !== "chest") {
        result = chestBuildErrorResponse(400, "NOT_A_CHEST", {
          resourceId: logicalResourceId,
          matchedBy: lookup.matchedBy,
        }, "Resolved resource is not a chest");
        chestDebugLog("process.not_a_chest", result.body);
        return;
      }

      var recordData = chestParseDataField(chestRecord);
      var chestMeta = recordData.chest && typeof recordData.chest === "object" ? recordData.chest : null;
      var userId = authRecord.id;
      var userName = chestNormalizeString(userRecord.get("name"), "Игрок");

      chestDebugLog("process.state", {
        authUserId: userId,
        resourceId: logicalResourceId,
        matchedBy: lookup.matchedBy,
        mode: normalizedMode,
        chestMeta: chestMeta,
      });

      if (normalizedMode === "private") {
        // "Собрать и не делиться": allowed only while nobody has claimed the chest.
        if (chestMeta && chestNormalizeString(chestMeta.finderId, "")) {
          result = chestBuildErrorResponse(409, "CHEST_ALREADY_SHARED", {
            resourceId: logicalResourceId,
            finderId: chestMeta.finderId,
          }, "Chest was already shared by another player");
          chestDebugLog("process.private_on_shared", result.body);
          return;
        }

        var currentEnergyPrivate = chestToInt(userRecord.get("energy"), 0);
        if (currentEnergyPrivate < CHEST_ENERGY_COST) {
          result = buildNotEnoughEnergyError(logicalResourceId, currentEnergyPrivate);
          chestDebugLog("process.private_no_energy", result.body);
          return;
        }

        var privateReward = rollChestReward();
        var privateRewards = applyChestRewards(txApp, userRecord, privateReward);
        txApp.delete(chestRecord);

        result.body = {
          success: true,
          applied: true,
          resourceId: logicalResourceId,
          mode: normalizedMode,
          rewardGold: privateReward,
          playerGold: privateRewards.gold,
          playerEnergy: privateRewards.energy,
          playerGlory: privateRewards.glory,
          chestDeleted: true,
          createdShare: false,
          chest: null,
        };
        chestDebugLog("process.private_success", result.body);
        return;
      }

      // mode === "share"
      if (!chestMeta || !chestNormalizeString(chestMeta.finderId, "")) {
        // First collector becomes the finder; the chest stays on the map.
        var currentEnergyFind = chestToInt(userRecord.get("energy"), 0);
        if (currentEnergyFind < CHEST_ENERGY_COST) {
          result = buildNotEnoughEnergyError(logicalResourceId, currentEnergyFind);
          chestDebugLog("process.share_find_no_energy", result.body);
          return;
        }

        var shareReward = rollChestReward();
        var shareRewards = applyChestRewards(txApp, userRecord, shareReward);

        chestMeta = {
          finderId: userId,
          finderName: userName,
          foundAt: Date.now(),
          collectors: [],
        };
        recordData.chest = chestMeta;
        chestSetDataField(chestRecord, recordData);
        try { chestRecord.set("gameId", chestNormalizeString(chestRecord.get("gameId"), logicalResourceId)); } catch (_) {}
        txApp.save(chestRecord);

        result.body = {
          success: true,
          applied: true,
          resourceId: logicalResourceId,
          mode: normalizedMode,
          rewardGold: shareReward,
          playerGold: shareRewards.gold,
          playerEnergy: shareRewards.energy,
          playerGlory: shareRewards.glory,
          chestDeleted: false,
          createdShare: true,
          chest: buildChestSnapshot(chestRecord, chestMeta),
        };
        chestDebugLog("process.share_found", result.body);
        return;
      }

      var collectors = Array.isArray(chestMeta.collectors) ? chestMeta.collectors : [];
      var alreadyCollected = chestNormalizeString(chestMeta.finderId, "") === userId || collectors.indexOf(userId) >= 0;
      if (alreadyCollected) {
        // No second reward, but return the authoritative gold so a client that
        // lost the original response can still reconcile its local balance.
        result = chestBuildErrorResponse(409, "ALREADY_COLLECTED", {
          resourceId: logicalResourceId,
          chest: buildChestSnapshot(chestRecord, chestMeta),
        }, "This player already collected the chest");
        result.body.details.alreadyCollected = true;
        result.body.playerGold = chestToInt(userRecord.get("gold"), 0);
        result.body.chest = buildChestSnapshot(chestRecord, chestMeta);
        chestDebugLog("process.already_collected", result.body);
        return;
      }

      if (collectors.length >= CHEST_MAX_COLLECTORS) {
        // Defensive cleanup: the record should have been deleted on the last collect.
        txApp.delete(chestRecord);
        result = chestBuildErrorResponse(409, "CHEST_DEPLETED", {
          resourceId: logicalResourceId,
          chestDeleted: true,
        }, "Chest has already been fully collected");
        chestDebugLog("process.depleted", result.body);
        return;
      }

      var joinReward = rollChestReward();
      var currentEnergyJoin = chestToInt(userRecord.get("energy"), 0);
      if (currentEnergyJoin < CHEST_ENERGY_COST) {
        result = buildNotEnoughEnergyError(logicalResourceId, currentEnergyJoin);
        chestDebugLog("process.share_join_no_energy", result.body);
        return;
      }

      var joinRewards = applyChestRewards(txApp, userRecord, joinReward);

      collectors.push(userId);
      chestMeta.collectors = collectors;
      recordData.chest = chestMeta;
      chestSetDataField(chestRecord, recordData);

      var chestDeleted = collectors.length >= CHEST_MAX_COLLECTORS;
      if (chestDeleted) {
        txApp.delete(chestRecord);
      } else {
        txApp.save(chestRecord);
      }

      result.body = {
        success: true,
        applied: true,
        resourceId: logicalResourceId,
        mode: normalizedMode,
        rewardGold: joinReward,
        playerGold: joinRewards.gold,
        playerEnergy: joinRewards.energy,
        playerGlory: joinRewards.glory,
        chestDeleted: chestDeleted,
        createdShare: false,
        chest: chestDeleted ? null : buildChestSnapshot(chestRecord, chestMeta),
      };
      chestDebugLog("process.share_join", result.body);
    });
  } catch (error) {
    chestDebugLog("process.exception", {
      authUserId: authRecord ? authRecord.id : null,
      resourceId: logicalResourceId,
      mode: normalizedMode,
      message: String(error),
      data: error && error.data ? error.data : null,
      response: error && error.response ? error.response : null,
    });
    result = chestBuildErrorResponse(400, "CHEST_REWARD_UPDATE_FAILED", {
      resourceId: logicalResourceId,
      message: String(error),
      data: error && error.data ? error.data : null,
      response: error && error.response ? error.response : null,
    }, "Failed to apply chest collect rewards");
  }

  return result;
}

module.exports = {
  CHEST_COIN_REWARDS: CHEST_COIN_REWARDS,
  CHEST_MAX_COLLECTORS: CHEST_MAX_COLLECTORS,
  processChestCollect: processChestCollect,
};
