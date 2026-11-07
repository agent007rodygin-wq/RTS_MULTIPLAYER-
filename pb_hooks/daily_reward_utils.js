var DAILY_REWARDS_TABLE = {
  1: { gold: 500, rubies: 0, items: [], description: "500 золота" },
  2: { gold: 0, rubies: 0, items: [{ id: 10002, name: "Доски", amount: 20 }, { id: 10005, name: "Камни", amount: 20 }], description: "20 досок + 20 камней" },
  3: { gold: 1000, rubies: 0, items: [{ id: 10001, name: "Дерево", amount: 30 }], description: "1000 золота + 30 дерева" },
  4: { gold: 0, rubies: 2, items: [{ id: 10006, name: "Каменные блоки", amount: 10 }], description: "2 рубина + 10 каменных блоков" },
  5: { gold: 1500, rubies: 0, items: [{ id: 10013, name: "Петарда", amount: 5 }], description: "1500 золота + 5 петард" },
  6: { gold: 2500, rubies: 3, items: [], description: "2500 золота + 3 рубина" },
  7: { gold: 0, rubies: 5, items: [{ id: 10018, name: "Яйцо Горыныча", amount: 1 }], description: "5 рубинов + Яйцо Горыныча" },
};

function parseUserData(record) {
  if (!record) return {};
  var raw = record.get("data");
  if (!raw) return {};

  if (Array.isArray(raw)) {
    try {
      var decoded = "";
      for (var i = 0; i < raw.length; i++) {
        decoded += String.fromCharCode(Number(raw[i]));
      }
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
}

function setUserData(record, obj) {
  record.set("data", JSON.stringify(obj || {}));
}

function getUtcDayNumber(ts) {
  return Math.floor(Number(ts || 0) / 86400000);
}

function linkTelegram(app, userId, telegramId, telegramUsername) {
  userId = String(userId || "").trim();
  telegramId = Number(telegramId || 0);
  telegramUsername = String(telegramUsername || "").trim();

  if (!userId || !telegramId) {
    return {
      status: 400,
      body: { success: false, error: "INVALID_PARAMETERS", message: "Не указан никнейм/ID или telegramId" }
    };
  }

  // Strip link_ prefix if sent
  if (userId.indexOf("link_") === 0) {
    userId = userId.substring(5).trim();
  }

  var userRecord = null;
  // 1. Try finding by exact PocketBase record ID
  try {
    userRecord = app.findRecordById("users", userId);
  } catch (_e) { userRecord = null; }

  // 2. Search by exact nickname or username
  if (!userRecord) {
    try {
      userRecord = app.findFirstRecordByFilter("users", "name = {:id} || username = {:id}", { id: userId });
    } catch (_e2) { userRecord = null; }
  }

  // 3. Fallback: case-insensitive search by nickname
  if (!userRecord) {
    try {
      var candidatesCi = app.findRecordsByFilter("users", "name ~ {:id} || username ~ {:id}", "-updated", 20, 0, { id: userId });
      if (candidatesCi && candidatesCi.length > 0) {
        var lowerTarget = userId.toLowerCase();
        for (var c = 0; c < candidatesCi.length; c++) {
          var cName = String(candidatesCi[c].get("name") || "").toLowerCase().trim();
          var cUser = String(candidatesCi[c].get("username") || "").toLowerCase().trim();
          if (cName === lowerTarget || cUser === lowerTarget) {
            userRecord = candidatesCi[c];
            break;
          }
        }
        if (!userRecord) userRecord = candidatesCi[0];
      }
    } catch (_e3) { userRecord = null; }
  }

  // 4. Fallback: Cyrillic/Latin mapping (e.g. user typed "Юро" or "Уро" for account "Uro")
  if (!userRecord) {
    var translitMap = { "юро": "Uro", "уро": "Uro", "uro": "Uro" };
    var mappedName = translitMap[userId.toLowerCase()];
    if (mappedName) {
      try {
        userRecord = app.findFirstRecordByFilter("users", "name = {:id} || username = {:id}", { id: mappedName });
      } catch (_e4) { userRecord = null; }
    }
  }

  if (!userRecord) {
    return {
      status: 404,
      body: { success: false, error: "USER_NOT_FOUND", message: "Игрок '" + userId + "' не найден в игре. Проверьте правильность никнейма или ID!" }
    };
  }

  // Canonical user ID from record
  userId = userRecord.id;
  var currentName = userRecord.get("name") || userId;

  // Anti-abuse check: ensure telegramId is not linked to another player
  var existingUsers = [];
  try {
    existingUsers = app.findRecordsByFilter("users", "data ~ '" + telegramId + "'", "-created", 100);
  } catch (_e) { existingUsers = []; }

  for (var i = 0; i < existingUsers.length; i++) {
    if (existingUsers[i].id !== userId) {
      var otherData = parseUserData(existingUsers[i]);
      if (Number(otherData.telegramId) === telegramId) {
        var existingName = existingUsers[i].get("name") || existingUsers[i].id;
        
        // If the same player (same nickname), allow migration/transfer to this active account!
        if (String(existingName).trim().toLowerCase() === String(currentName).trim().toLowerCase()) {
          console.log("[TelegramLink] Migrating telegram link for same player from old account", existingUsers[i].id, "to active account", userId);
          otherData.telegramLinked = false;
          delete otherData.telegramId;
          delete otherData.telegramUsername;
          delete otherData.telegramLinkedAt;
          setUserData(existingUsers[i], otherData);
          app.save(existingUsers[i]);
        } else {
          return {
            status: 409,
            body: {
              success: false,
              error: "ALREADY_LINKED",
              linkedUserName: existingName,
              message: "Этот Telegram уже привязан к игроку " + existingName + "!"
            }
          };
        }
      }
    }
  }

  var userData = parseUserData(userRecord);
  userData.telegramId = telegramId;
  userData.telegramUsername = telegramUsername;
  userData.telegramLinked = true;
  userData.telegramLinkedAt = Date.now();
  setUserData(userRecord, userData);
  app.save(userRecord);

  console.log("[TelegramLink] Successfully linked user", userId, "with tg", telegramId, telegramUsername);

  return {
    status: 200,
    body: {
      success: true,
      userId: userId,
      userName: currentName,
      telegramId: telegramId,
      telegramLinked: true,
      message: "Telegram успешно привязан!"
    }
  };
}

function getTelegramStatus(app, telegramId) {
  telegramId = Number(telegramId || 0);
  if (!telegramId) {
    return { status: 400, body: { success: false, error: "INVALID_PARAMETERS" } };
  }

  var existingUsers = [];
  try {
    existingUsers = app.findRecordsByFilter("users", "data ~ '" + telegramId + "'", "-created", 20);
  } catch (_e) { existingUsers = []; }

  for (var i = 0; i < existingUsers.length; i++) {
    var uData = parseUserData(existingUsers[i]);
    if (Number(uData.telegramId) === telegramId) {
      return {
        status: 200,
        body: {
          success: true,
          linked: true,
          user: {
            id: existingUsers[i].id,
            name: existingUsers[i].get("name") || existingUsers[i].id,
            streakDays: Number(uData.streakDays || 1),
            lastClaim: Number(uData.lastDailyRewardClaim || 0)
          }
        }
      };
    }
  }

  return {
    status: 200,
    body: { success: true, linked: false }
  };
}

function claimDailyReward(app, authRecord, fallbackUserId) {
  var userId = authRecord ? authRecord.id : null;
  if (!userId) {
    userId = String(fallbackUserId || "").trim();
  }

  if (!userId) {
    return {
      status: 401,
      body: { success: false, error: "UNAUTHORIZED", message: "Необходима авторизация" }
    };
  }

  var userRecord = null;
  try {
    userRecord = app.findRecordById("users", userId);
  } catch (_e) { userRecord = null; }

  if (!userRecord) {
    return {
      status: 404,
      body: { success: false, error: "USER_NOT_FOUND", message: "Пользователь не найден" }
    };
  }

  var userData = parseUserData(userRecord);
  if (!userData.telegramLinked) {
    return {
      status: 403,
      body: {
        success: false,
        error: "TELEGRAM_NOT_LINKED",
        message: "Для сбора ежедневных бонусов необходимо привязать Telegram и подписаться на группу!"
      }
    };
  }

  var now = Date.now();
  var todayDay = getUtcDayNumber(now);
  var lastClaimTs = Number(userData.lastDailyRewardClaim || 0);
  var lastClaimDay = getUtcDayNumber(lastClaimTs);

  // Check if already claimed today
  if (lastClaimTs > 0 && todayDay === lastClaimDay) {
    var msUntilTomorrow = ((todayDay + 1) * 86400000) - now;
    return {
      status: 400,
      body: {
        success: false,
        error: "ALREADY_CLAIMED_TODAY",
        message: "Вы уже получили награду за сегодня!",
        nextClaimInMs: Math.max(0, msUntilTomorrow),
        streakDays: Number(userData.streakDays || 1)
      }
    };
  }

  // Calculate streak day (1 to 7)
  var currentStreak = Number(userData.streakDays || 0);
  var newStreak = 1;

  if (lastClaimTs === 0) {
    newStreak = 1;
  } else if (todayDay === lastClaimDay + 1) {
    newStreak = (currentStreak % 7) + 1;
  } else {
    // Streak broken (missed day)
    newStreak = 1;
  }

  var reward = DAILY_REWARDS_TABLE[newStreak];
  if (!reward) reward = DAILY_REWARDS_TABLE[1];

  var curGold = Number(userRecord.get("gold") || userData.gold || 0);
  var curRubies = Number(userRecord.get("rubies") || userData.rubies || 0);
  var rawInv = userRecord.get("inventory");
  var inv = {};
  if (Array.isArray(rawInv)) {
    try {
      var decodedInv = "";
      for (var d = 0; d < rawInv.length; d++) {
        decodedInv += String.fromCharCode(Number(rawInv[d]));
      }
      inv = JSON.parse(decodedInv) || {};
    } catch (_e) { inv = {}; }
  } else if (typeof rawInv === "string") {
    try {
      inv = JSON.parse(rawInv) || {};
    } catch (_e) { inv = {}; }
  } else if (rawInv && typeof rawInv === "object") {
    inv = JSON.parse(JSON.stringify(rawInv));
  }

  var newGold = curGold + (reward.gold || 0);
  var newRubies = curRubies + (reward.rubies || 0);

  if (reward.items && reward.items.length > 0) {
    for (var k = 0; k < reward.items.length; k++) {
      var item = reward.items[k];
      var itemIdStr = String(item.id);
      var curAmount = Number(inv[itemIdStr] || 0);
      inv[itemIdStr] = curAmount + Number(item.amount);
    }
  }

  userRecord.set("gold", newGold);
  userRecord.set("rubies", newRubies);
  userRecord.set("inventory", JSON.stringify(inv));

  userData.gold = newGold;
  userData.rubies = newRubies;
  userData.inventory = inv;
  userData.lastDailyRewardClaim = now;
  userData.streakDays = newStreak;
  setUserData(userRecord, userData);

  app.save(userRecord);

  console.log("[DailyReward] User", userId, "claimed day", newStreak, "reward:", reward.description);

  return {
    status: 200,
    body: {
      success: true,
      streakDays: newStreak,
      reward: reward,
      gold: newGold,
      rubies: newRubies,
      inventory: inv,
      lastDailyRewardClaim: now
    }
  };
}

// --- Referral & Promo Code System ---

var REFERRAL_REFERRER_GOLD = 2000;
var REFERRAL_REFERRER_RUBIES = 2;
var REFERRAL_NEWBIE_GOLD = 1000;
var REFERRAL_NEWBIE_WOOD = 30; // ID 10001
var REFERRAL_NEWBIE_PETARDS = 5; // ID 10013

function validatePromoCode(app, promoCode, currentName) {
  var code = String(promoCode || "").trim();
  var selfName = String(currentName || "").trim().toLowerCase();

  if (!code) {
    return { status: 400, body: { success: false, valid: false, message: "Промокод не указан" } };
  }

  if (code.toLowerCase() === selfName) {
    return { status: 400, body: { success: false, valid: false, message: "Нельзя использовать свой никнейм в качестве промокода!" } };
  }

  var referrerRecord = null;
  try {
    referrerRecord = app.findFirstRecordByFilter("users", "name = {:name} || username = {:name}", { name: code });
  } catch (_e) { referrerRecord = null; }

  if (!referrerRecord) {
    return {
      status: 404,
      body: { success: false, valid: false, message: "Игрок с промокодом '" + code + "' не найден" }
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      valid: true,
      referrerId: referrerRecord.id,
      referrerName: referrerRecord.get("name") || code,
      bonus: {
        gold: REFERRAL_NEWBIE_GOLD,
        wood: REFERRAL_NEWBIE_WOOD,
        petards: REFERRAL_NEWBIE_PETARDS
      }
    }
  };
}

function processReferralTutorialCompleted(app, userId) {
  userId = String(userId || "").trim();
  if (!userId) return { status: 400, body: { success: false, error: "NO_USER_ID" } };

  var userRecord = null;
  try {
    userRecord = app.findRecordById("users", userId);
  } catch (_e) { userRecord = null; }

  if (!userRecord) return { status: 404, body: { success: false, error: "USER_NOT_FOUND" } };

  var userData = parseUserData(userRecord);
  var referrerId = String(userData.referredBy || "").trim();

  // If no referrer or already granted
  if (!referrerId || userData.referralRewardGranted === true) {
    return { status: 200, body: { success: true, alreadyProcessed: true } };
  }

  var referrerRecord = null;
  try {
    referrerRecord = app.findRecordById("users", referrerId);
  } catch (_e) { referrerRecord = null; }

  if (referrerRecord) {
    var refData = parseUserData(referrerRecord);
    var curGold = Number(referrerRecord.get("gold") || refData.gold || 0);
    var curRubies = Number(referrerRecord.get("rubies") || refData.rubies || 0);

    var newGold = curGold + REFERRAL_REFERRER_GOLD;
    var newRubies = curRubies + REFERRAL_REFERRER_RUBIES;

    referrerRecord.set("gold", newGold);
    referrerRecord.set("rubies", newRubies);

    refData.gold = newGold;
    refData.rubies = newRubies;
    refData.referralSuccessCount = Number(refData.referralSuccessCount || 0) + 1;

    var pendingList = Array.isArray(refData.pendingReferralNotifs) ? refData.pendingReferralNotifs : [];
    pendingList.push({
      friendName: userRecord.get("name") || "Друг",
      date: Date.now(),
      gold: REFERRAL_REFERRER_GOLD,
      rubies: REFERRAL_REFERRER_RUBIES
    });
    refData.pendingReferralNotifs = pendingList;

    setUserData(referrerRecord, refData);
    app.save(referrerRecord);

    console.log("[Referral] Rewarded referrer", referrerId, "for friend", userId, "+2000 gold, +2 rubies");
  }

  userData.referralRewardGranted = true;
  userData.referralRewardGrantedAt = Date.now();
  setUserData(userRecord, userData);
  app.save(userRecord);

  return {
    status: 200,
    body: {
      success: true,
      rewarded: true,
      referrerId: referrerId
    }
  };
}

module.exports = {
  DAILY_REWARDS_TABLE: DAILY_REWARDS_TABLE,
  REFERRAL_NEWBIE_GOLD: REFERRAL_NEWBIE_GOLD,
  REFERRAL_NEWBIE_WOOD: REFERRAL_NEWBIE_WOOD,
  REFERRAL_NEWBIE_PETARDS: REFERRAL_NEWBIE_PETARDS,
  REFERRAL_REFERRER_GOLD: REFERRAL_REFERRER_GOLD,
  REFERRAL_REFERRER_RUBIES: REFERRAL_REFERRER_RUBIES,
  parseUserData: parseUserData,
  setUserData: setUserData,
  linkTelegram: linkTelegram,
  getTelegramStatus: getTelegramStatus,
  claimDailyReward: claimDailyReward,
  validatePromoCode: validatePromoCode,
  processReferralTutorialCompleted: processReferralTutorialCompleted
};
