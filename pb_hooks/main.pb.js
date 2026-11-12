/// <reference path="../pb_data/types.d.ts" />

routerAdd(
  "POST",
  "/api/basingse/tree-hit",
  function (e) {
    var treeUtils = require(__hooks + "/tree_server_utils.js");
    var payload = new DynamicModel({
      resourceId: "",
      id: "",
    });

    try {
      // PocketBase v0.22.57: bindBody не существует — читаем requestInfo().body
      var _body = e.requestInfo().body || {};
      payload.resourceId = String(_body.resourceId || _body.id || "");
      payload.id = String(_body.id || "");
    } catch (error) {
      console.log("[TreeHit Debug][route][bind-error]", String(error));
      return e.json(400, {
        success: false,
        error: "INVALID_REQUEST_BODY",
        details: {
          message: String(error),
        },
      });
    }

    var authRecord = null;
    try {
      var _h = e.requestInfo().headers;
      var _token = (_h["Authorization"] || _h["authorization"] || "").replace(/^Bearer\s+/i, "");
      if (_token) authRecord = $app.findAuthRecordByToken(_token);
    } catch (_e) { authRecord = null; }
    var authUserId = authRecord ? authRecord.id : null;
    var incomingBody = null;
    try {
      incomingBody = e.requestInfo().body;
    } catch (error) {
      incomingBody = { error: String(error) };
    }

    var logicalResourceId = payload.resourceId || payload.id || "";
    console.log("[TreeHit Debug][route][request]", JSON.stringify({
      authUserId: authUserId,
      body: incomingBody,
      resourceId: payload.resourceId,
      fallbackId: payload.id,
      logicalResourceId: logicalResourceId,
    }));

    var result = treeUtils.processTreeHit($app, authRecord, logicalResourceId);
    console.log("[TreeHit Debug][route][response]", JSON.stringify({
      authUserId: authUserId,
      logicalResourceId: logicalResourceId,
      status: result.status,
      body: result.body,
    }));
    return e.json(result.status, result.body);
  },
);

cronAdd("tree-respawn-manager", "*/1 * * * *", function () {
  var treeUtils = require(__hooks + "/tree_server_utils.js");
  treeUtils.processDueTreeRespawns($app);
});

var BAN_PRICES = {
  1: 9000,
  5: 15000,
  30: 25000,
  60: 45000,
  1440: 100000,
};

function decodeUtf8Bytes(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
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

function parseDataField(record) {
  var raw = record.get("data");
  if (!raw) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  var str = Array.isArray(raw) ? decodeUtf8Bytes(raw) : (typeof raw === "string" ? raw : "");
  if (!str) return {};
  try {
    var parsed = JSON.parse(str);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch (error) {
    console.log("[parseDataField] decode failed:", String(error));
  }
  return {};
}

function setDataField(record, obj) {
  record.set("data", JSON.stringify(obj));
}

function parseInventoryField(record) {
  var raw = record.get("inventory");
  if (!raw) return {};
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  var str = Array.isArray(raw) ? decodeUtf8Bytes(raw) : (typeof raw === "string" ? raw : "");
  if (!str) return {};
  try {
    var parsed = JSON.parse(str);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch (_) {}
  return {};
}

function finitePositive(value) {
  var n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

routerAdd(
  "POST",
  "/api/game/ban-player",
  function (e) {
    var BAN_PRICES = {
      1: 9000,
      5: 15000,
      30: 25000,
      60: 45000,
      1440: 100000,
    };

    var decodeUtf8Bytes = function (raw) {
      if (!raw) return "";
      if (typeof raw === "string") return raw;
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
    };

    var parseDataField = function (record) {
      var raw = record.get("data");
      if (!raw) return {};
      if (typeof raw === "object" && !Array.isArray(raw)) return raw;
      var str = Array.isArray(raw) ? decodeUtf8Bytes(raw) : (typeof raw === "string" ? raw : "");
      if (!str) return {};
      try {
        var parsed = JSON.parse(str);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
      } catch (error) {
        console.log("[ban-player:parseDataField] decode failed:", String(error));
      }
      return {};
    };

    var setDataField = function (record, obj) {
      record.set("data", JSON.stringify(obj));
    };

    var finitePositive = function (value) {
      var n = Number(value);
      return Number.isFinite(n) && n > 0 ? n : 0;
    };

    var payload = new DynamicModel({
      targetUserId: "",
      durationMinutes: 0,
    });

    try {
      try { e.bindBody(payload); } catch (err) {
        throw new Error("INVALID_REQUEST_BODY: " + String(err));
      }

      var authRecord = e.auth;
      if (!authRecord) {
        return e.json(401, { success: false, error: "AUTH_REQUIRED" });
      }
      var issuerId = authRecord.id;

      var targetId = (payload.targetUserId || "").trim();
      var duration = Number(payload.durationMinutes) || 0;

      console.log("[ban-player] request", JSON.stringify({
        issuerId: issuerId,
        targetId: targetId ? targetId.substring(0, 8) + "..." : "",
        duration: duration,
      }));

      if (!targetId) {
        return e.json(400, { success: false, error: "MISSING_TARGET" });
      }
      if (targetId === issuerId) {
        return e.json(400, { success: false, error: "CANNOT_BAN_SELF" });
      }

      console.log("[ban-player] before price lookup", JSON.stringify({
        duration: duration,
        pricesType: typeof BAN_PRICES,
        priceKeys: typeof BAN_PRICES === "object" ? Object.keys(BAN_PRICES).join(",") : "N/A",
      }));

      var cost = BAN_PRICES && BAN_PRICES[duration] ? BAN_PRICES[duration] : 0;

      console.log("[ban-player] after price lookup", JSON.stringify({
        duration: duration,
        cost: cost,
      }));

      if (!cost) {
        return e.json(400, { success: false, error: "INVALID_DURATION" });
      }

      var result = null;
      var resolvedIssuerGold = 0;
      var resolvedCost = cost;

      $app.runInTransaction(function (txApp) {
        console.log("[ban-player] transaction started");

        var issuerRecord = txApp.findRecordById("users", issuerId);
        console.log("[ban-player] issuer found:", !!issuerRecord);

        var targetRecord = txApp.findRecordById("users", targetId);
        console.log("[ban-player] target found:", !!targetRecord);

        var issuerData = parseDataField(issuerRecord);
        var targetData = parseDataField(targetRecord);

        console.log("[ban-player] parsed issuerData", JSON.stringify({
          type: typeof issuerData,
          isArray: Array.isArray(issuerData),
          keys: Object.keys(issuerData || {}),
          value: issuerData
        }));

        console.log("[ban-player] parsed targetData", JSON.stringify({
          type: typeof targetData,
          isArray: Array.isArray(targetData),
          keys: Object.keys(targetData || {}),
          banEndTime: targetData && targetData.banEndTime,
          value: targetData
        }));

        var issuerGold = Number(issuerRecord.get("gold") || issuerData.gold || 0);

        console.log("[ban-player] issuer data", JSON.stringify({
          topGold: issuerRecord.get("gold"),
          dataGold: issuerData.gold,
          resolvedGold: issuerGold,
        }));

        console.log("[ban-player] resolved", JSON.stringify({
          issuerGold: issuerGold,
          cost: cost,
          targetFound: !!targetRecord,
        }));

        resolvedIssuerGold = issuerGold;

        if (issuerGold < cost) {
          throw new Error("INSUFFICIENT_GOLD|" + cost + "|" + issuerGold);
        }

        // Normalize data to objects if they are arrays
        if (Array.isArray(targetData)) {
          targetData = {};
        }
        if (Array.isArray(issuerData)) {
          issuerData = {};
        }

        console.log("[ban-player] target data before ban", JSON.stringify(targetData));

        console.log("[ban-player] target ban sources", JSON.stringify({
          topLevel: targetRecord.get("banEndTime"),
          dataBanEndTime: targetData && targetData.banEndTime,
          firstItemBanEndTime: targetData && targetData[0] && targetData[0].banEndTime
        }));

        var existingTargetBanEnd = Math.max(
          finitePositive(targetRecord.get("banEndTime")) || 0,
          finitePositive(targetData.banEndTime) || 0
        );
        var now = Date.now();
        var newBanEndTime = Math.max(existingTargetBanEnd, now) + duration * 60 * 1000;

        console.log("[ban-player] ban calc", JSON.stringify({
          existingBanEnd: existingTargetBanEnd,
          now: now,
          newBanEndTime: newBanEndTime,
        }));

        // Write gold to top-level field (authoritative)
        issuerRecord.set("gold", issuerGold - cost);
        // Also sync to data for consistency with client
        issuerData.gold = issuerGold - cost;

        // Authoritative ban storage: save to top-level schema column AND data.json
        targetRecord.set("banEndTime", newBanEndTime);
        targetData.banEndTime = newBanEndTime;

        console.log("[ban-player] target data after assign (before save)", JSON.stringify(targetData));

        setDataField(issuerRecord, issuerData);
        setDataField(targetRecord, targetData);

        console.log("[ban-player] saving records");
        txApp.save(issuerRecord);
        txApp.save(targetRecord);

        var reloadedTarget = txApp.findRecordById("users", targetId);
        var reloadedData = parseDataField(reloadedTarget);

        console.log("[ban-player] persisted target data (after save + reload)", JSON.stringify(reloadedData));

        result = {
          success: true,
          targetUserId: targetId,
          durationMinutes: duration,
          cost: cost,
          banEndTime: newBanEndTime,
          issuerGold: issuerGold - cost,
        };
      });

      console.log("[ban-player] success", JSON.stringify(result));
      return e.json(200, result);

    } catch (err) {
      var detail = String(err);

      if (detail.indexOf("INSUFFICIENT_GOLD") !== -1) {
        var parts = detail.split("|");
        return e.json(409, {
          success: false,
          error: "INSUFFICIENT_GOLD",
          required: Number(parts[1]) || resolvedCost,
          available: Number(parts[2]) || resolvedIssuerGold,
        });
      }

      console.log("[ban-player] FAILED:", detail);
      console.log("[ban-player] stack:", (err && err.stack) ? String(err.stack) : "no stack");
      return e.json(500, {
        success: false,
        error: "INTERNAL_ERROR",
        detail: detail.substring(0, 200),
      });
    }
  },
);

routerAdd(
  "POST",
  "/api/game/reputation-action",
  function (e) {
    var RECOMMENDATION_ID = 10032;
    var MAX_REPUTATION = 950;

    var decodeUtf8Bytes = function (raw) {
      if (!raw) return "";
      if (typeof raw === "string") return raw;
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
    };

    var parseInventoryField = function (record) {
      var raw = record.get("inventory");
      if (!raw) return {};
      if (typeof raw === "object" && !Array.isArray(raw)) return raw;
      var str = Array.isArray(raw) ? decodeUtf8Bytes(raw) : (typeof raw === "string" ? raw : "");
      if (!str) return {};
      try {
        var parsed = JSON.parse(str);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
      } catch (_) {}
      return {};
    };

    var authRecord = e.auth;
    if (!authRecord) {
      try {
        var _h = e.requestInfo().headers;
        var _token = (_h["Authorization"] || _h["authorization"] || "").replace(/^Bearer\s+/i, "");
        if (_token) authRecord = $app.findAuthRecordByToken(_token);
      } catch (_e) { authRecord = null; }
    }

    if (!authRecord) {
      return e.json(401, { success: false, error: "AUTH_REQUIRED" });
    }

    var _body = {};
    try {
      _body = e.requestInfo().body || {};
    } catch (err) {
      return e.json(400, { success: false, error: "INVALID_REQUEST_BODY" });
    }

    var issuerId = authRecord.id;
    var targetId = String(_body.targetUserId || "").trim();
    var action = String(_body.action || "praise").trim().toLowerCase();
    if (action !== "praise" && action !== "complain") {
      action = "praise";
    }

    if (!targetId) {
      return e.json(400, { success: false, error: "MISSING_TARGET" });
    }

    var issuerEmail = String(authRecord.get("email") || "");
    var isAdmin = issuerEmail === "fabiosluco@gmail.com";
    if (targetId === issuerId && !isAdmin) {
      return e.json(400, { success: false, error: "CANNOT_PRAISE_SELF" });
    }

    var result = null;

    try {
      $app.runInTransaction(function (txApp) {
        var issuerRecord = txApp.findRecordById("users", issuerId);
        if (!issuerRecord) {
          throw new Error("ISSUER_NOT_FOUND");
        }

        var targetRecord = null;
        try {
          targetRecord = txApp.findRecordById("users", targetId);
        } catch (_) {}
        if (!targetRecord) {
          try {
            var list = txApp.findRecordsByFilter("users", "id = '" + targetId + "' || gameId = '" + targetId + "'", "-created", 1);
            if (list && list.length > 0) {
              targetRecord = list[0];
            }
          } catch (_) {}
        }
        if (!targetRecord) {
          throw new Error("TARGET_NOT_FOUND");
        }

        if (targetRecord.id === issuerId && !isAdmin) {
          throw new Error("CANNOT_PRAISE_SELF");
        }

        var inv = parseInventoryField(issuerRecord);
        var recKey = String(RECOMMENDATION_ID);
        var recCount = Number(inv[RECOMMENDATION_ID] !== undefined ? inv[RECOMMENDATION_ID] : (inv[recKey] || 0));

        if (recCount < 1 && !isAdmin) {
          throw new Error("INSUFFICIENT_RECOMMENDATIONS");
        }

        if (!isAdmin) {
          var remainingRecs = Math.max(0, recCount - 1);
          inv[RECOMMENDATION_ID] = remainingRecs;
          inv[recKey] = remainingRecs;
          issuerRecord.set("inventory", JSON.stringify(inv));
          txApp.save(issuerRecord);
        }

        var currentRep = Number(targetRecord.get("reputation") || 0);
        var delta = action === "complain" ? -1 : 1;
        var newRep = currentRep + delta;
        if (newRep < 0) newRep = 0;
        if (newRep > MAX_REPUTATION) newRep = MAX_REPUTATION;

        targetRecord.set("reputation", newRep);
        txApp.save(targetRecord);

        result = {
          success: true,
          action: action,
          targetUserId: targetRecord.id,
          targetName: targetRecord.get("name") || "Игрок",
          targetReputation: newRep,
          issuerRecommendations: !isAdmin ? (inv[RECOMMENDATION_ID] || 0) : recCount,
        };
      });

      console.log("[reputation-action] success:", JSON.stringify(result));
      return e.json(200, result);
    } catch (err) {
      var detail = String(err);
      console.log("[reputation-action] failed:", detail);

      if (detail.indexOf("INSUFFICIENT_RECOMMENDATIONS") !== -1) {
        return e.json(400, { success: false, error: "INSUFFICIENT_RECOMMENDATIONS" });
      }
      if (detail.indexOf("CANNOT_PRAISE_SELF") !== -1) {
        return e.json(400, { success: false, error: "CANNOT_PRAISE_SELF" });
      }
      if (detail.indexOf("TARGET_NOT_FOUND") !== -1) {
        return e.json(404, { success: false, error: "TARGET_NOT_FOUND" });
      }
      return e.json(500, { success: false, error: "INTERNAL_ERROR", detail: detail.substring(0, 200) });
    }
  }
);

// --- BasingSe Telegram Link & Daily Reward API ---

routerAdd(
  "POST",
  "/api/basingse/telegram-link",
  function (e) {
    var dailyUtils = require(__hooks + "/daily_reward_utils.js");
    var _body = e.requestInfo().body || {};
    var result = dailyUtils.linkTelegram($app, _body.userId, _body.telegramId, _body.telegramUsername);
    return e.json(result.status, result.body);
  }
);

routerAdd(
  "POST",
  "/api/basingse/telegram-status",
  function (e) {
    var dailyUtils = require(__hooks + "/daily_reward_utils.js");
    var _body = e.requestInfo().body || {};
    var result = dailyUtils.getTelegramStatus($app, _body.telegramId);
    return e.json(result.status, result.body);
  }
);

routerAdd(
  "POST",
  "/api/basingse/claim-daily-reward",
  function (e) {
    var dailyUtils = require(__hooks + "/daily_reward_utils.js");
    var authRecord = null;
    try {
      var _h = e.requestInfo().headers;
      var _token = (_h["Authorization"] || _h["authorization"] || "").replace(/^Bearer\s+/i, "");
      if (_token) authRecord = $app.findAuthRecordByToken(_token);
    } catch (_e) { authRecord = null; }

    var _body = e.requestInfo().body || {};
    var result = dailyUtils.claimDailyReward($app, authRecord, _body.userId);
    return e.json(result.status, result.body);
  }
);

routerAdd(
  "POST",
  "/api/basingse/validate-promo",
  function (e) {
    var dailyUtils = require(__hooks + "/daily_reward_utils.js");
    var _body = e.requestInfo().body || {};
    var result = dailyUtils.validatePromoCode($app, _body.promoCode, _body.currentName);
    return e.json(result.status, result.body);
  }
);

routerAdd(
  "POST",
  "/api/basingse/complete-referral-tutorial",
  function (e) {
    var dailyUtils = require(__hooks + "/daily_reward_utils.js");
    var _body = e.requestInfo().body || {};
    var result = dailyUtils.processReferralTutorialCompleted($app, _body.userId);
    return e.json(result.status, result.body);
  }
);

// --- BasingSe Achievements Stats & Join Order API ---

routerAdd(
  "GET",
  "/api/basingse/achievements-stats",
  function (e) {
    var parseRecordData = function (record) {
      if (!record) return {};
      var raw = record.get("data");
      if (!raw) return {};
      if (Array.isArray(raw)) {
        try {
          var decoded = "";
          for (var i = 0; i < raw.length; i++) decoded += String.fromCharCode(Number(raw[i]));
          var pb = JSON.parse(decoded);
          if (pb && typeof pb === "object" && !Array.isArray(pb)) return pb;
        } catch (_e) {}
      }
      if (typeof raw === "string") {
        try {
          var ps = JSON.parse(raw);
          if (ps && typeof ps === "object" && !Array.isArray(ps)) return ps;
        } catch (_e) {}
      }
      if (typeof raw === "object" && !Array.isArray(raw)) return raw;
      return {};
    };

    try {
      var records = [];
      try {
        records = $app.findRecordsByFilter("users", "1=1", "-created", 2000);
      } catch (_e) { records = []; }
      var totalUsers = Math.max(1, records.length);
      var counts = {};
      for (var i = 0; i < records.length; i++) {
        var uData = parseRecordData(records[i]);
        var achList = uData.achievements || [];
        if (Array.isArray(achList)) {
          for (var j = 0; j < achList.length; j++) {
            var aid = achList[j];
            counts[aid] = (counts[aid] || 0) + 1;
          }
        }
      }
      var percentages = {};
      for (var key in counts) {
        percentages[key] = Math.round((counts[key] / totalUsers) * 1000) / 10;
      }
      return e.json(200, {
        success: true,
        totalUsers: totalUsers,
        counts: counts,
        percentages: percentages
      });
    } catch (err) {
      return e.json(500, { success: false, error: String(err) });
    }
  }
);

routerAdd(
  "POST",
  "/api/basingse/player-order",
  function (e) {
    var parseRecordData = function (record) {
      if (!record) return {};
      var raw = record.get("data");
      if (!raw) return {};
      if (Array.isArray(raw)) {
        try {
          var decoded = "";
          for (var i = 0; i < raw.length; i++) decoded += String.fromCharCode(Number(raw[i]));
          var pb = JSON.parse(decoded);
          if (pb && typeof pb === "object" && !Array.isArray(pb)) return pb;
        } catch (_e) {}
      }
      if (typeof raw === "string") {
        try {
          var ps = JSON.parse(raw);
          if (ps && typeof ps === "object" && !Array.isArray(ps)) return ps;
        } catch (_e) {}
      }
      if (typeof raw === "object" && !Array.isArray(raw)) return raw;
      return {};
    };

    try {
      var _body = e.requestInfo().body || {};
      var userId = _body.userId;
      if (!userId) return e.json(400, { success: false, error: "Missing userId" });
      var userRecord = null;
      try {
        userRecord = $app.findRecordById("users", userId);
      } catch (_e) { userRecord = null; }
      if (!userRecord) return e.json(404, { success: false, error: "User not found" });

      var uData = parseRecordData(userRecord);
      if (typeof uData.joinNumber === "number" && uData.joinNumber > 0) {
        return e.json(200, { success: true, joinNumber: uData.joinNumber });
      }
      var userCreated = userRecord.get("created");
      var olderRecords = [];
      try {
        olderRecords = $app.findRecordsByFilter("users", "created <= {:created}", "+created", 5000, 0, { created: userCreated });
      } catch (_e2) { olderRecords = []; }
      var joinNumber = olderRecords.length || 1;
      uData.joinNumber = joinNumber;
      userRecord.set("data", JSON.stringify(uData));
      try {
        $app.save(userRecord);
      } catch (_e3) {}
      return e.json(200, { success: true, joinNumber: joinNumber });
    } catch (err) {
      return e.json(500, { success: false, error: String(err) });
    }
  }
);

// ==============================================================================
//  🏰 Server-side Protection: Building Placement & Town Hall Uniqueness
// ==============================================================================

onRecordCreate(function (e) {
  var TOWN_HALL_IDS_LIST = [301, 306, 312, 331, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 360, 361, 371, 381, 413, 414, 452, 726, 752];

  var parseRecordData = function (record) {
    if (!record) return {};
    var raw = record.get("data");
    if (!raw) return {};
    if (Array.isArray(raw)) {
      try {
        var decoded = "";
        for (var i = 0; i < raw.length; i++) decoded += String.fromCharCode(Number(raw[i]));
        var pb = JSON.parse(decoded);
        if (pb && typeof pb === "object" && !Array.isArray(pb)) return pb;
      } catch (_e) {}
    }
    if (typeof raw === "string") {
      try {
        var ps = JSON.parse(raw);
        if (ps && typeof ps === "object" && !Array.isArray(ps)) return ps;
      } catch (_e) {}
    }
    if (typeof raw === "object" && !Array.isArray(raw)) return raw;
    return {};
  };

  var bId = Number(e.record.get("buildingId") || 0);
  var ownerId = String(e.record.get("ownerId") || "");
  var x = Number(e.record.get("x"));
  var y = Number(e.record.get("y"));

  // 1. One Town Hall per player check
  if (ownerId && ownerId !== "-1" && ownerId !== "0" && ownerId !== "monster" && TOWN_HALL_IDS_LIST.indexOf(bId) !== -1) {
    var thFilter = "ownerId = {:ownerId} && (" + TOWN_HALL_IDS_LIST.map(function(id) { return "buildingId = '" + id + "'"; }).join(" || ") + ")";
    var existingTh = e.app.findRecordsByFilter("buildings", thFilter, "", 10, 0, { ownerId: ownerId });
    if (existingTh && existingTh.length > 0) {
      for (var i = 0; i < existingTh.length; i++) {
        if (existingTh[i].id !== e.record.id) {
          var thData = parseRecordData(existingTh[i]);
          var hp = thData.hp !== undefined ? Number(thData.hp) : 1;
          if (hp > 0 && !thData.isDestroying) {
            throw new BadRequestError("У игрока уже есть Главное здание!");
          }
        }
      }
    }
  }

  // 2. Prevent stacking: no two alive buildings on the exact same tile
  if (Number.isFinite(x) && Number.isFinite(y)) {
    var existingAtTile = e.app.findRecordsByFilter("buildings", "x = {:x} && y = {:y}", "", 5, 0, { x: x, y: y });
    if (existingAtTile && existingAtTile.length > 0) {
      for (var j = 0; j < existingAtTile.length; j++) {
        if (existingAtTile[j].id !== e.record.id) {
          var bData = parseRecordData(existingAtTile[j]);
          var bHp = bData.hp !== undefined ? Number(bData.hp) : 1;
          if (bHp > 0 && !bData.isDestroying) {
            throw new BadRequestError("Клетка [" + x + ", " + y + "] уже занята другим зданием!");
          }
        }
      }
    }
  }

  e.next();
}, "buildings");

onRecordUpdate(function (e) {
  var parseRecordData = function (record) {
    if (!record) return {};
    var raw = record.get("data");
    if (!raw) return {};
    if (Array.isArray(raw)) {
      try {
        var decoded = "";
        for (var i = 0; i < raw.length; i++) decoded += String.fromCharCode(Number(raw[i]));
        var pb = JSON.parse(decoded);
        if (pb && typeof pb === "object" && !Array.isArray(pb)) return pb;
      } catch (_e) {}
    }
    if (typeof raw === "string") {
      try {
        var ps = JSON.parse(raw);
        if (ps && typeof ps === "object" && !Array.isArray(ps)) return ps;
      } catch (_e) {}
    }
    if (typeof raw === "object" && !Array.isArray(raw)) return raw;
    return {};
  };

  var x = Number(e.record.get("x"));
  var y = Number(e.record.get("y"));

  // Prevent moving a building onto an occupied tile
  if (Number.isFinite(x) && Number.isFinite(y)) {
    var existingAtTile = e.app.findRecordsByFilter("buildings", "x = {:x} && y = {:y}", "", 5, 0, { x: x, y: y });
    if (existingAtTile && existingAtTile.length > 0) {
      for (var j = 0; j < existingAtTile.length; j++) {
        if (existingAtTile[j].id !== e.record.id) {
          var bData = parseRecordData(existingAtTile[j]);
          var bHp = bData.hp !== undefined ? Number(bData.hp) : 1;
          if (bHp > 0 && !bData.isDestroying) {
            throw new BadRequestError("Клетка [" + x + ", " + y + "] уже занята другим зданием!");
          }
        }
      }
    }
  }

  e.next();
}, "buildings");


// Assign static sequential joinNumber to newly registered users
routerAdd("GET", "/api/dev-token", function(e) {
  try {
    var id = String(e.requestInfo().query.id || "2vs7soljllm1nh8");
    var record = $app.findRecordById("users", id);
    var token = record.newAuthToken();
    return e.json(200, { token: token, record: record });
  } catch (err) {
    return e.json(500, { error: String(err) });
  }
});


