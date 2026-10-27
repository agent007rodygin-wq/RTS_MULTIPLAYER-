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

function parseDataField(record) {
  var raw = record.get("data");

  if (!raw) {
    return {};
  }

  if (Array.isArray(raw)) {
    try {
      var decoded = "";

      for (var i = 0; i < raw.length; i++) {
        decoded += String.fromCharCode(Number(raw[i]));
      }

      var parsedBytes = JSON.parse(decoded);

      if (
        parsedBytes &&
        typeof parsedBytes === "object" &&
        !Array.isArray(parsedBytes)
      ) {
        return parsedBytes;
      }

      return {};
    } catch (error) {
      console.log("[parseDataField] byte decode failed:", String(error));
      return {};
    }
  }

  if (typeof raw === "string") {
    try {
      var parsedString = JSON.parse(raw);

      if (
        parsedString &&
        typeof parsedString === "object" &&
        !Array.isArray(parsedString)
      ) {
        return parsedString;
      }

      return {};
    } catch (error) {
      console.log("[parseDataField] string decode failed:", String(error));
      return {};
    }
  }

  if (typeof raw === "object") {
    return raw;
  }

  return {};
}

function setDataField(record, obj) {
  record.set("data", JSON.stringify(obj));
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

    var parseDataField = function (record) {
      var raw = record.get("data");

      if (!raw) {
        return {};
      }

      // PocketBase may return a JSON field as Go []byte,
      // which crosses into JS as an array of integers.
      if (Array.isArray(raw)) {
        try {
          var decoded = "";

          for (var i = 0; i < raw.length; i++) {
            decoded += String.fromCharCode(Number(raw[i]));
          }

          var parsedBytes = JSON.parse(decoded);

          if (
            parsedBytes &&
            typeof parsedBytes === "object" &&
            !Array.isArray(parsedBytes)
          ) {
            return parsedBytes;
          }

          return {};
        } catch (error) {
          console.log("[parseDataField] byte decode failed:", String(error));
          return {};
        }
      }

      if (typeof raw === "string") {
        try {
          var parsedString = JSON.parse(raw);

          if (
            parsedString &&
            typeof parsedString === "object" &&
            !Array.isArray(parsedString)
          ) {
            return parsedString;
          }

          return {};
        } catch (error) {
          console.log("[parseDataField] string decode failed:", String(error));
          return {};
        }
      }

      if (typeof raw === "object") {
        return raw;
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

        var existingTargetBanEnd = finitePositive(targetData.banEndTime) || 0;
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
