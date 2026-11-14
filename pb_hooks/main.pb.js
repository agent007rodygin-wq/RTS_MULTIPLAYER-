/// <reference path="../pb_data/types.d.ts" />

routerAdd(
  "POST",
  "/api/basingse/tree-hit",
  function (e) {
    var treeUtils = require(__hooks + "/tree_server_utils.js");
    var secUtils = require(__hooks + "/security_utils.js");

    // 2026-11 security pass: each hit pays out server-side rewards, so cap
    // request rate per player (150/min — far above any human chop cadence).
    if (!secUtils.checkRateLimit("tree-hit:" + secUtils.requestKey(e), 150)) {
      secUtils.securityLog("rate_limit", { route: "/api/basingse/tree-hit" });
      return e.json(429, { success: false, error: "RATE_LIMITED", message: "Слишком частые удары по дереву, притормозите" });
    }

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

routerAdd(
  "POST",
  "/api/basingse/chest-collect",
  function (e) {
    var chestUtils = require(__hooks + "/chest_server_utils.js");
    var secUtils = require(__hooks + "/security_utils.js");

    // 2026-11 security pass: server-rolled rewards → cap per player (30/min).
    if (!secUtils.checkRateLimit("chest:" + secUtils.requestKey(e), 30)) {
      secUtils.securityLog("rate_limit", { route: "/api/basingse/chest-collect" });
      return e.json(429, { success: false, error: "RATE_LIMITED", message: "Слишком много запросов, попробуйте позже" });
    }

    var payload = new DynamicModel({
      resourceId: "",
      mode: "",
    });

    try {
      var _body = e.requestInfo().body || {};
      payload.resourceId = String(_body.resourceId || _body.id || "");
      payload.mode = String(_body.mode || "");
    } catch (error) {
      console.log("[ChestCollect Debug][route][bind-error]", String(error));
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

    console.log("[ChestCollect Debug][route][request]", JSON.stringify({
      authUserId: authUserId,
      resourceId: payload.resourceId,
      mode: payload.mode,
    }));

    var result = chestUtils.processChestCollect($app, authRecord, payload.resourceId, payload.mode);
    console.log("[ChestCollect Debug][route][response]", JSON.stringify({
      authUserId: authUserId,
      resourceId: payload.resourceId,
      mode: payload.mode,
      status: result.status,
      body: result.body,
    }));
    return e.json(result.status, result.body);
  },
);

routerAdd(
  "POST",
  "/api/basingse/gift-send",
  function (e) {
    var giftUtils = require(__hooks + "/gift_server_utils.js");
    var targetUserId = "";
    var buildingId = "";

    try {
      var _body = e.requestInfo().body || {};
      targetUserId = String(_body.targetUserId || _body.targetId || "");
      buildingId = String(_body.buildingId || "");
    } catch (error) {
      console.log("[GiftSend Debug][route][bind-error]", String(error));
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

    var result = giftUtils.processGiftSend($app, authRecord, targetUserId, buildingId);
    console.log("[GiftSend Debug][route][response]", JSON.stringify({
      authUserId: authRecord ? authRecord.id : null,
      targetUserId: targetUserId,
      buildingId: buildingId,
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

// ─── Curse player (turn into animal) ────────────────────────────────────────
// The users collection update rule only allows self-updates ("id = @request.auth.id"),
// so the client cannot write another player's record directly. This endpoint performs
// the write with elevated (hook) privileges and uses the server-side price table.
routerAdd(
  "POST",
  "/api/game/curse-player",
  function (e) {
    // Server-authoritative options (mirrors src/game/ui/actionOptions.ts CURSE_OPTIONS)
    var CURSE_OPTIONS = [
      { durationMinutes: 1, cost: 4000, prefix: "(ква-ква-ква)", animalName: "Жаба" },
      { durationMinutes: 2, cost: 8000, prefix: "(му-му-му)", animalName: "Корова" },
      { durationMinutes: 3, cost: 12000, prefix: "(гаф-гаф)", animalName: "Собака" },
      { durationMinutes: 4, cost: 16000, prefix: "(хрю-хрю)", animalName: "Свинья" },
      { durationMinutes: 5, cost: 20000, prefix: "(бе-бе-бе)", animalName: "Барашек" },
    ];

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
        console.log("[curse-player:parseDataField] decode failed:", String(error));
      }
      return {};
    };

    var setDataField = function (record, obj) {
      record.set("data", JSON.stringify(obj));
    };

    try {
      var body = e.requestInfo().body || {};
      var targetId = String(body.targetUserId || "").trim();
      var duration = Number(body.durationMinutes) || 0;

      var authRecord = null;
      try {
        var _h = e.requestInfo().headers;
        var _token = (_h["Authorization"] || _h["authorization"] || "").replace(/^Bearer\s+/i, "");
        if (_token) authRecord = $app.findAuthRecordByToken(_token);
      } catch (_e) { authRecord = null; }
      if (!authRecord) {
        return e.json(401, { success: false, error: "AUTH_REQUIRED" });
      }
      var issuerId = authRecord.id;

      if (!targetId) {
        return e.json(400, { success: false, error: "MISSING_TARGET" });
      }

      var option = null;
      for (var i = 0; i < CURSE_OPTIONS.length; i++) {
        if (CURSE_OPTIONS[i].durationMinutes === duration) option = CURSE_OPTIONS[i];
      }
      if (!option) {
        return e.json(400, { success: false, error: "INVALID_DURATION" });
      }

      var result = null;

      $app.runInTransaction(function (txApp) {
        var issuerRecord = txApp.findRecordById("users", issuerId);
        var targetRecord = txApp.findRecordById("users", targetId);

        var issuerGold = Number(issuerRecord.get("gold") || 0);
        if (issuerGold < option.cost) {
          throw new Error("INSUFFICIENT_GOLD|" + option.cost + "|" + issuerGold);
        }

        var issuerData = parseDataField(issuerRecord);
        if (Array.isArray(issuerData)) issuerData = {};
        var targetData = parseDataField(targetRecord);
        if (Array.isArray(targetData)) targetData = {};

        var now = Date.now();
        var activeCurse = {
          prefix: option.prefix,
          animalName: option.animalName,
          endTime: now + option.durationMinutes * 60 * 1000,
        };

        issuerRecord.set("gold", issuerGold - option.cost);
        issuerData.gold = issuerGold - option.cost;
        setDataField(issuerRecord, issuerData);

        targetData.activeCurse = activeCurse;
        setDataField(targetRecord, targetData);

        txApp.save(issuerRecord);
        txApp.save(targetRecord);

        result = {
          success: true,
          targetUserId: targetId,
          cost: option.cost,
          durationMinutes: option.durationMinutes,
          activeCurse: activeCurse,
          issuerGold: issuerGold - option.cost,
        };
      });

      return e.json(200, result);
    } catch (err) {
      var detail = String(err);
      if (detail.indexOf("INSUFFICIENT_GOLD") !== -1) {
        var parts = detail.split("|");
        return e.json(409, {
          success: false,
          error: "INSUFFICIENT_GOLD",
          required: Number(parts[1]) || 0,
          available: Number(parts[2]) || 0,
        });
      }
      if (detail.indexOf("sql: no rows in result set") !== -1 || detail.indexOf("not found") !== -1) {
        return e.json(404, { success: false, error: "TARGET_NOT_FOUND" });
      }
      console.log("[curse-player] FAILED:", detail);
      return e.json(500, { success: false, error: "INTERNAL_ERROR", detail: detail.substring(0, 200) });
    }
  }
);

// ─── Punish player (glory penalty for rubies) ───────────────────────────────
// Same rule constraint as curse-player: writes the TARGET player's glory with
// hook privileges and deducts rubies from the issuer using the server-side table.
routerAdd(
  "POST",
  "/api/game/punish-player",
  function (e) {
    // Server-authoritative options (mirrors src/game/ui/actionOptions.ts PUNISHMENT_OPTIONS)
    var PUNISHMENT_OPTIONS = [
      { cost: 1, gloryPenalty: 500 },
      { cost: 2, gloryPenalty: 1000 },
      { cost: 3, gloryPenalty: 2400 },
      { cost: 4, gloryPenalty: 5500 },
      { cost: 5, gloryPenalty: 9000 },
    ];

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
        console.log("[punish-player:parseDataField] decode failed:", String(error));
      }
      return {};
    };

    var setDataField = function (record, obj) {
      record.set("data", JSON.stringify(obj));
    };

    try {
      var body = e.requestInfo().body || {};
      var targetId = String(body.targetUserId || "").trim();
      var cost = Number(body.cost) || 0;

      var authRecord = null;
      try {
        var _h = e.requestInfo().headers;
        var _token = (_h["Authorization"] || _h["authorization"] || "").replace(/^Bearer\s+/i, "");
        if (_token) authRecord = $app.findAuthRecordByToken(_token);
      } catch (_e) { authRecord = null; }
      if (!authRecord) {
        return e.json(401, { success: false, error: "AUTH_REQUIRED" });
      }
      var issuerId = authRecord.id;

      if (!targetId) {
        return e.json(400, { success: false, error: "MISSING_TARGET" });
      }

      var option = null;
      for (var i = 0; i < PUNISHMENT_OPTIONS.length; i++) {
        if (PUNISHMENT_OPTIONS[i].cost === cost) option = PUNISHMENT_OPTIONS[i];
      }
      if (!option) {
        return e.json(400, { success: false, error: "INVALID_COST" });
      }

      var result = null;

      $app.runInTransaction(function (txApp) {
        var issuerRecord = txApp.findRecordById("users", issuerId);
        var targetRecord = txApp.findRecordById("users", targetId);

        var issuerRubies = Number(issuerRecord.get("rubies") || 0);
        if (issuerRubies < option.cost) {
          throw new Error("INSUFFICIENT_RUBIES|" + option.cost + "|" + issuerRubies);
        }

        var issuerData = parseDataField(issuerRecord);
        if (Array.isArray(issuerData)) issuerData = {};
        var targetData = parseDataField(targetRecord);
        if (Array.isArray(targetData)) targetData = {};

        var targetGlory = Number(targetRecord.get("glory") || 0);
        var nextTargetGlory = Math.max(0, targetGlory - option.gloryPenalty);

        issuerRecord.set("rubies", issuerRubies - option.cost);
        issuerData.rubies = issuerRubies - option.cost;
        setDataField(issuerRecord, issuerData);

        targetRecord.set("glory", nextTargetGlory);
        targetData.glory = nextTargetGlory;
        setDataField(targetRecord, targetData);

        txApp.save(issuerRecord);
        txApp.save(targetRecord);

        result = {
          success: true,
          targetUserId: targetId,
          cost: option.cost,
          gloryPenalty: option.gloryPenalty,
          targetGlory: nextTargetGlory,
          issuerRubies: issuerRubies - option.cost,
        };
      });

      return e.json(200, result);
    } catch (err) {
      var detail = String(err);
      if (detail.indexOf("INSUFFICIENT_RUBIES") !== -1) {
        var parts = detail.split("|");
        return e.json(409, {
          success: false,
          error: "INSUFFICIENT_RUBIES",
          required: Number(parts[1]) || 0,
          available: Number(parts[2]) || 0,
        });
      }
      if (detail.indexOf("sql: no rows in result set") !== -1 || detail.indexOf("not found") !== -1) {
        return e.json(404, { success: false, error: "TARGET_NOT_FOUND" });
      }
      console.log("[punish-player] FAILED:", detail);
      return e.json(500, { success: false, error: "INTERNAL_ERROR", detail: detail.substring(0, 200) });
    }
  }
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
// 2026-11 security pass: all mutating Telegram routes now require
// authentication. Two access paths:
//   1. Backend/bot path  — "X-Internal-Secret" header matching the
//      TELEGRAM_LINK_SECRET env var (shared secret, never exposed to browsers).
//   2. Mini App path     — Bearer auth token + freshly signed Telegram
//      initData (HMAC-validated server-side); linking is forced to the
//      authenticated player's own account.
// Everything else is rejected with 401 and security-logged.

routerAdd(
  "POST",
  "/api/basingse/telegram-link",
  function (e) {
    var dailyUtils = require(__hooks + "/daily_reward_utils.js");
    var secUtils = require(__hooks + "/security_utils.js");

    if (!secUtils.checkRateLimit("tg-link:" + secUtils.requestKey(e), 15)) {
      secUtils.securityLog("rate_limit", { route: "/api/basingse/telegram-link" });
      return e.json(429, { success: false, error: "RATE_LIMITED", message: "Слишком много запросов, попробуйте позже" });
    }

    var _body = e.requestInfo().body || {};
    var authRecord = secUtils.resolveAuthRecord(e);
    var hasInternal = secUtils.verifyInternalSecret(e);

    var userId = String(_body.userId || "");
    var telegramId = String(_body.telegramId || "");
    var telegramUsername = String(_body.telegramUsername || "");

    if (!hasInternal) {
      // Mini App path: proof of Telegram identity must be freshly signed initData
      // tied to the authenticated player. Anything else is rejected.
      var tgUser = null;
      var botToken = secUtils.getTelegramBotToken();
      var initData = String(_body.initData || "");
      if (authRecord && botToken && initData) {
        var v = secUtils.validateTelegramInitData(initData, botToken, 86400);
        if (v.ok) tgUser = v.user;
      }
      if (!authRecord || !tgUser) {
        secUtils.securityLog("rejected", {
          route: "/api/basingse/telegram-link",
          reason: tgUser ? "NO_AUTH" : "BAD_OR_MISSING_INITDATA",
          hasAuth: !!authRecord
        });
        return e.json(401, {
          success: false,
          error: "UNAUTHORIZED",
          message: "Требуется авторизация (Bearer-токен и подписанный Telegram initData) или внутренний секрет"
        });
      }
      // Force the link onto the authenticated player's own record with the
      // initData-verified Telegram identity — never trust body-supplied ids here.
      userId = authRecord.id;
      telegramId = String(tgUser.id || "");
      telegramUsername = String(tgUser.username || tgUser.first_name || "");
    }

    if (!secUtils.isValidTelegramId(telegramId)) {
      return e.json(400, { success: false, error: "INVALID_TELEGRAM_ID", message: "Некорректный telegramId" });
    }

    var result = dailyUtils.linkTelegram($app, userId, telegramId, telegramUsername);
    return e.json(result.status, result.body);
  }
);

routerAdd(
  "POST",
  "/api/basingse/telegram-status",
  function (e) {
    var dailyUtils = require(__hooks + "/daily_reward_utils.js");
    var secUtils = require(__hooks + "/security_utils.js");

    if (!secUtils.checkRateLimit("tg-status:" + secUtils.requestKey(e), 15)) {
      secUtils.securityLog("rate_limit", { route: "/api/basingse/telegram-status" });
      return e.json(429, { success: false, error: "RATE_LIMITED", message: "Слишком много запросов, попробуйте позже" });
    }

    var authRecord = secUtils.resolveAuthRecord(e);
    var hasInternal = secUtils.verifyInternalSecret(e);
    if (!authRecord && !hasInternal) {
      secUtils.securityLog("rejected", { route: "/api/basingse/telegram-status", reason: "NO_AUTH_OR_SECRET" });
      return e.json(401, { success: false, error: "UNAUTHORIZED", message: "Требуется авторизация или внутренний секрет" });
    }

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
    var secUtils = require(__hooks + "/security_utils.js");

    var authRecord = secUtils.resolveAuthRecord(e);
    if (!authRecord) {
      secUtils.securityLog("rejected", { route: "/api/basingse/claim-daily-reward", reason: "NO_AUTH" });
      return e.json(401, { success: false, error: "UNAUTHORIZED", message: "Необходима авторизация" });
    }

    if (!secUtils.checkRateLimit("daily:" + authRecord.id, 6)) {
      secUtils.securityLog("rate_limit", { route: "/api/basingse/claim-daily-reward", userId: authRecord.id });
      return e.json(429, { success: false, error: "RATE_LIMITED", message: "Слишком много запросов, попробуйте позже" });
    }

    // 2026-11 security pass: the body-supplied fallback userId was removed —
    // rewards can only ever be claimed for the token's own account, and the
    // read-check-save sequence now runs inside a transaction so concurrent
    // claims cannot double-apply the reward.
    var result = null;
    $app.runInTransaction(function (txApp) {
      result = dailyUtils.claimDailyReward(txApp, authRecord);
    });
    return e.json(result.status, result.body);
  }
);

routerAdd(
  "POST",
  "/api/basingse/validate-promo",
  function (e) {
    var dailyUtils = require(__hooks + "/daily_reward_utils.js");
    var secUtils = require(__hooks + "/security_utils.js");

    // Stays unauthenticated by design: it is called during registration, before
    // the player has a session. It is read-only — rate limited to slow down
    // promo-code enumeration.
    if (!secUtils.checkRateLimit("promo:" + secUtils.requestKey(e), 30)) {
      secUtils.securityLog("rate_limit", { route: "/api/basingse/validate-promo" });
      return e.json(429, { success: false, error: "RATE_LIMITED", message: "Слишком много запросов, попробуйте позже" });
    }

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
    var secUtils = require(__hooks + "/security_utils.js");

    var authRecord = secUtils.resolveAuthRecord(e);
    if (!authRecord) {
      secUtils.securityLog("rejected", { route: "/api/basingse/complete-referral-tutorial", reason: "NO_AUTH" });
      return e.json(401, { success: false, error: "UNAUTHORIZED", message: "Необходима авторизация" });
    }

    if (!secUtils.checkRateLimit("referral:" + authRecord.id, 10)) {
      secUtils.securityLog("rate_limit", { route: "/api/basingse/complete-referral-tutorial", userId: authRecord.id });
      return e.json(429, { success: false, error: "RATE_LIMITED", message: "Слишком много запросов, попробуйте позже" });
    }

    // 2026-11 security pass: the tutorial completion (and referrer payout) is
    // attributed to the authenticated player only — the body userId is ignored.
    var result = dailyUtils.processReferralTutorialCompleted($app, authRecord.id);
    return e.json(result.status, result.body);
  }
);

// --- BasingSe Achievements Stats & Join Order API ---

routerAdd(
  "GET",
  "/api/basingse/achievements-stats",
  function (e) {
    var secUtils = require(__hooks + "/security_utils.js");

    // Scans up to ~2000 user records per call — rate limit anonymous bulk reads.
    if (!secUtils.checkRateLimit("achstats:" + secUtils.requestKey(e), 10)) {
      secUtils.securityLog("rate_limit", { route: "/api/basingse/achievements-stats" });
      return e.json(429, { success: false, error: "RATE_LIMITED", message: "Слишком много запросов, попробуйте позже" });
    }

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
    var secUtils = require(__hooks + "/security_utils.js");

    // 2026-11 security pass: this route writes joinNumber onto a user record,
    // so it now requires authentication (any logged-in player may look up any
    // profile's static number, matching the in-game profile UI).
    var authRecord = secUtils.resolveAuthRecord(e);
    if (!authRecord) {
      secUtils.securityLog("rejected", { route: "/api/basingse/player-order", reason: "NO_AUTH" });
      return e.json(401, { success: false, error: "UNAUTHORIZED", message: "Необходима авторизация" });
    }

    if (!secUtils.checkRateLimit("order:" + authRecord.id, 20)) {
      secUtils.securityLog("rate_limit", { route: "/api/basingse/player-order", userId: authRecord.id });
      return e.json(429, { success: false, error: "RATE_LIMITED", message: "Слишком много запросов, попробуйте позже" });
    }

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

// ─── Hot-field column sync (2026-11 perf pass) ───────────────────────────────
// zoneId/lastMoveTime/lastAttackTime/hostId are now REAL columns on buildings.
// The client still writes them inside the `data` JSON blob (read-modify-write
// merge keeps data complete), so sync the columns from data on every write.
// This keeps `zoneId` filters correct for clients on any bundle version and
// prepares future fast-path writes that touch columns only.
var syncBuildingHotColumns = function (e) {
  var data = {};
  var raw = e.record.get("data");
  if (raw) {
    if (typeof raw === "string") {
      try { var p = JSON.parse(raw); if (p && typeof p === "object") data = p; } catch (_err) {}
    } else if (typeof raw === "object" && !Array.isArray(raw)) {
      data = raw;
    }
  }
  // Fallback-only: never overwrite a column that the request payload already
  // set at top level (PB applies those before hooks run). Fill gaps from data.
  if (!String(e.record.get("zoneId") || "")) {
    e.record.set("zoneId", String(data.zoneId || ""));
  }
  if (!Number(e.record.get("lastMoveTime") || 0)) {
    e.record.set("lastMoveTime", Number(data.lastMoveTime || 0) || 0);
  }
  if (!Number(e.record.get("lastAttackTime") || 0)) {
    e.record.set("lastAttackTime", Number(data.lastAttackTime || 0) || 0);
  }
  if (!String(e.record.get("hostId") || "")) {
    e.record.set("hostId", String(data.hostId || ""));
  }
};

onRecordUpdate(function (e) {
  syncBuildingHotColumns(e);
  e.next();
}, "buildings");

onRecordCreate(function (e) {
  syncBuildingHotColumns(e);
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


// 2026-11 security pass: the unauthenticated "GET /api/dev-token" route was
// REMOVED here. It minted a valid auth token for any user id without any
// authentication — a full account-takeover backdoor. Use
// $app.findAuthRecordByToken-based routes or the PocketBase superuser API for
// tooling instead.

// ==============================================================================
//  🛡️ 2026-11 security pass: signup/login helpers replacing anonymous reads
// ==============================================================================
// Once the "users" collection list/view rules are tightened to authenticated
// users, the client can no longer (a) check nickname uniqueness during
// registration and (b) resolve a nickname to the auth identity for Cyrillic
// names. These two rate-limited routes provide exactly that functionality
// without exposing user records.

routerAdd(
  "POST",
  "/api/basingse/check-name",
  function (e) {
    var secUtils = require(__hooks + "/security_utils.js");

    if (!secUtils.checkRateLimit("check-name:" + secUtils.requestKey(e), 30)) {
      secUtils.securityLog("rate_limit", { route: "/api/basingse/check-name" });
      return e.json(429, { success: false, error: "RATE_LIMITED", message: "Слишком много запросов, попробуйте позже" });
    }

    var _body = e.requestInfo().body || {};
    var name = String(_body.name || "").trim();
    if (name.length < 3 || name.length > 150) {
      return e.json(200, { success: true, taken: false, valid: false });
    }
    // bind params ({:name}) are escaped by PocketBase — pass the raw value
    var existing = [];
    try {
      existing = $app.findRecordsByFilter("users", "name = {:name} || username = {:name}", "", 1, 0, { name: name });
    } catch (_err) { existing = []; }
    return e.json(200, { success: true, taken: existing && existing.length > 0 });
  }
);

routerAdd(
  "POST",
  "/api/basingse/resolve-identity",
  function (e) {
    var secUtils = require(__hooks + "/security_utils.js");

    if (!secUtils.checkRateLimit("resolve-id:" + secUtils.requestKey(e), 15)) {
      secUtils.securityLog("rate_limit", { route: "/api/basingse/resolve-identity" });
      return e.json(429, { success: false, error: "RATE_LIMITED", message: "Слишком много запросов, попробуйте позже" });
    }

    var _body = e.requestInfo().body || {};
    var identity = String(_body.identity || "").trim();
    if (!identity || identity.length > 150) {
      return e.json(200, { success: true, found: false });
    }
    // bind params ({:identity}) are escaped by PocketBase — pass the raw value
    var matched = [];
    try {
      matched = $app.findRecordsByFilter("users", "name = {:identity} || username = {:identity}", "", 1, 0, { identity: identity });
    } catch (_err) { matched = []; }
    if (matched && matched.length > 0) {
      var email = "";
      try { email = String(matched[0].email() || ""); } catch (_e1) {}
      if (!email) { try { email = String(matched[0].get("email") || ""); } catch (_e2) { email = ""; } }
      if (email) {
        return e.json(200, { success: true, found: true, email: email });
      }
    }
    return e.json(200, { success: true, found: false });
  }
);

// ==============================================================================
//  🛡️ Server-side Protection: users starting economy (2026-11 security pass)
// ==============================================================================
// Registration is a public create on the "users" collection (it has to be for
// sign-up). Without this hook a modified client could POST arbitrary starting
// gold / rubies / energy and mint free currency on account creation. The
// values below mirror the legacy legit signup payload in src/pocketbase.ts —
// no balance change, only enforcement.
onRecordCreate(function (e) {
  var START_GOLD = 100;
  var START_RUBIES = 10;
  var START_ENERGY = 500;

  var rec = e.record;
  var gold = Number(rec.get("gold") || 0);
  var rubies = Number(rec.get("rubies") || 0);
  var energy = Number(rec.get("energy") || 0);

  if (gold !== START_GOLD) {
    console.log("[SECURITY] users.create: forced starting gold", gold, "->", START_GOLD, "for", rec.get("name"));
    rec.set("gold", START_GOLD);
  }
  if (rubies !== START_RUBIES) {
    console.log("[SECURITY] users.create: forced starting rubies", rubies, "->", START_RUBIES, "for", rec.get("name"));
    rec.set("rubies", START_RUBIES);
  }
  if (energy !== START_ENERGY) {
    console.log("[SECURITY] users.create: forced starting energy", energy, "->", START_ENERGY, "for", rec.get("name"));
    rec.set("energy", START_ENERGY);
  }

  e.next();
}, "users");

