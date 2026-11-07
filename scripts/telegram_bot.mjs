// Telegram Bot Service for Ba Sing Se MMORPG Daily Rewards & Anti-Abuse
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7103667977:AAEa7TsAyowlW_f0szixHUhL4G-Mc2NFK4g';
const GROUP_CHAT_ID = -1001741260337;
const GROUP_USERNAME = 'BasingseCryptoCity';
const GROUP_INVITE_URL = 'https://t.me/BasingseCryptoCity';
const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8090';

const TG_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Store pending links: telegramUserId -> gameIdentifier (id or nickname)
const pendingLinks = new Map();

// Standard keyboard with single clear actions
const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: '🎁 Получить бонус' }, { text: '🎮 Открыть ежедневные награды' }],
    [{ text: '🤝 Пригласить друга' }, { text: 'ℹ️ Мой статус привязки' }]
  ],
  resize_keyboard: true,
  persistent: true
};

async function callTelegram(method, payload = {}) {
  const url = `${TG_API_BASE}/${method}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error(`[TG Bot] Error calling ${method}:`, err.message);
    return { ok: false, error: err.message };
  }
}

async function linkToPocketBase(userIdOrName, telegramId, telegramUsername) {
  try {
    const res = await fetch(`${PB_URL}/api/basingse/telegram-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userIdOrName, telegramId, telegramUsername })
    });
    const data = await res.json();
    return { status: res.status, ...data };
  } catch (err) {
    console.error('[TG Bot] PocketBase link error:', err.message);
    return { success: false, error: 'PB_OFFLINE', message: 'Сервер игры временно недоступен' };
  }
}

async function checkPocketBaseStatus(telegramId) {
  try {
    const res = await fetch(`${PB_URL}/api/basingse/telegram-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegramId })
    });
    return await res.json();
  } catch (err) {
    return { success: false, linked: false };
  }
}

async function checkMembership(userId) {
  const res = await callTelegram('getChatMember', {
    chat_id: GROUP_CHAT_ID,
    user_id: userId
  });

  if (!res.ok) {
    return { isMember: false, status: 'unknown' };
  }

  const status = res.result?.status;
  const isMember = ['creator', 'administrator', 'member', 'restricted'].includes(status);
  return { isMember, status };
}

async function handleLinkAttempt(chatId, telegramUserId, username, identifier) {
  const cleanId = String(identifier || '').replace(/^link_/, '').trim();
  if (!cleanId) return;

  console.log(`[TG Bot] Link attempt from tg ${telegramUserId} with identifier: "${cleanId}"`);

  // Check group membership
  const memberCheck = await checkMembership(telegramUserId);

  if (!memberCheck.isMember) {
    // Try auto-approving join request if pending
    try {
      await callTelegram('approveChatJoinRequest', {
        chat_id: GROUP_CHAT_ID,
        user_id: telegramUserId
      });
    } catch (_e) {}

    const recheck = await checkMembership(telegramUserId);
    if (!recheck.isMember) {
      pendingLinks.set(telegramUserId, cleanId);
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `👋 Почти готово!\n\nЧтобы получать **ежедневные бонусы**, подпишитесь на нашу группу:\n👉 [Группа ${GROUP_USERNAME}](${GROUP_INVITE_URL})\n\nПосле того как вступите, нажмите кнопку ниже 👇`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📢 Вступить в группу', url: GROUP_INVITE_URL }],
            [{ text: '✅ Я вступил, подтвердить!', callback_data: `check_link_${cleanId}` }]
          ]
        }
      });
      return;
    }
  }

  // User is in group - proceed with linking
  const linkRes = await linkToPocketBase(cleanId, telegramUserId, username);

  if (linkRes.success) {
    pendingLinks.delete(telegramUserId);
    const targetName = linkRes.userName || cleanId;
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `🎉 **Аккаунт успешно привязан!**\n\nИгрок: **${targetName}**\nTelegram: **@${username || telegramUserId}**\n\n🎁 **Ежедневный бонус за вход разблокирован!**\nВозвращайтесь в игру, открывайте планшет и нажимайте на золотой подарок!`,
      parse_mode: 'Markdown',
      reply_markup: MAIN_KEYBOARD
    });
  } else {
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `⚠️ **Ошибка привязки:**\n${linkRes.message || 'Не удалось привязать аккаунт.'}`,
      parse_mode: 'Markdown',
      reply_markup: MAIN_KEYBOARD
    });
  }
}

async function handleStartCommand(message, payload) {
  const chatId = message.chat.id;
  const telegramUserId = message.from.id;
  const username = message.from.username || message.from.first_name || '';

  if (payload && payload.trim()) {
    await handleLinkAttempt(chatId, telegramUserId, username, payload);
    return;
  }

  // Normal /start without payload
  const statusRes = await checkPocketBaseStatus(telegramUserId);

  if (statusRes.linked && statusRes.user) {
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `👋 Привет, **${statusRes.user.name}**!\n\n✅ Твой Telegram уже привязан к игре **Ba Sing Se Crypto City**.\n🔥 Текущая серия входов: **День ${statusRes.user.streakDays || 1} из 7**.\n\n🎁 Открывай игру и забирай свой ежедневный бонус в планшете (кнопка «Бонус» рядом с инвентарем)!`,
      parse_mode: 'Markdown',
      reply_markup: MAIN_KEYBOARD
    });
  } else {
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `🏰 Добро пожаловать в официальный бот **Ba Sing Se Crypto City**!\n\n🎁 **Как получить ежедневный бонус:**\n1. Подпишись на нашу группу: [${GROUP_USERNAME}](${GROUP_INVITE_URL})\n2. Отправь мне сюда свой **игровой Никнейм** или **код из планшета** (например, \`link_...\`).\n\n👇 Просто напиши свой никнейм в ответном сообщении:`,
      parse_mode: 'Markdown',
      reply_markup: MAIN_KEYBOARD
    });
  }
}

async function handleTextMessage(message) {
  const chatId = message.chat.id;
  const telegramUserId = message.from.id;
  const username = message.from.username || message.from.first_name || '';
  const text = (message.text || '').trim();

  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    await handleStartCommand(message, parts[1] || '');
    return;
  }

  if (text === '🎁 Получить бонус' || text === '🎮 Открыть ежедневные награды') {
    const statusRes = await checkPocketBaseStatus(telegramUserId);
    if (statusRes.linked && statusRes.user) {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `✅ **Твой аккаунт привязан!**\n\nИгрок: **${statusRes.user.name}**\n🎁 Ежедневные награды активны в игре.\n\nОткрой меню планшета в игре и нажми на золотой подарок!`,
        parse_mode: 'Markdown',
        reply_markup: MAIN_KEYBOARD
      });
    } else {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `👋 Для привязки напиши в этот чат свой **игровой никнейм** или **код из игры** (например: \`link_...\`):`,
        parse_mode: 'Markdown',
        reply_markup: MAIN_KEYBOARD
      });
    }
    return;
  }

  if (text === '🤝 Пригласить друга') {
    const statusRes = await checkPocketBaseStatus(telegramUserId);
    if (statusRes.linked && statusRes.user) {
      const myCode = statusRes.user.name || statusRes.user.id;
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `🏰 **Приглашай друзей в Ba Sing Se Crypto City!**\n\nТвой личный промокод: \`${myCode}\`\n\n📋 **Скопируй и отправь это сообщение другу:**\n_«Заходи в игру Ba Sing Se Crypto City! При регистрации введи мой промокод_ \`${myCode}\` _и сразу получи стартовый бонус: +1000 золота, 30 дерева и 5 петард!»_\n\n🎁 **Твоя награда:** за каждого друга, завершившего обучение в игре, ты получишь:\n💎 **+2 рубина** и 🪙 **+2 000 золота**!`,
        parse_mode: 'Markdown',
        reply_markup: MAIN_KEYBOARD
      });
    } else {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `👋 Чтобы получить свой реферальный промокод, сначала отправьте мне ваш никнейм в игре для привязки!`,
        parse_mode: 'Markdown',
        reply_markup: MAIN_KEYBOARD
      });
    }
    return;
  }

  if (text === 'ℹ️ Мой статус привязки') {
    const statusRes = await checkPocketBaseStatus(telegramUserId);
    if (statusRes.linked && statusRes.user) {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `📊 **Информация о привязке:**\n\n• Статус: **Привязан** ✅\n• Игрок: **${statusRes.user.name}**\n• Telegram ID: \`${telegramUserId}\`\n• Серия входов: **День ${statusRes.user.streakDays || 1} / 7** 🔥`,
        parse_mode: 'Markdown',
        reply_markup: MAIN_KEYBOARD
      });
    } else {
      await callTelegram('sendMessage', {
        chat_id: chatId,
        text: `❌ Ваш Telegram еще не привязан к игре.\n\nНапишите свой игровой никнейм в ответ на это сообщение!`,
        parse_mode: 'Markdown',
        reply_markup: MAIN_KEYBOARD
      });
    }
    return;
  }

  // Avoid treating long sentences / chat messages as nickname link attempts
  if (text.length > 35 && !text.startsWith('link_')) {
    await callTelegram('sendMessage', {
      chat_id: chatId,
      text: `🤖 Чтобы привязать аккаунт к Telegram, отправьте ваш игровой **Никнейм** (например, \`Uro\`) или нажмите золотую кнопку «Привязать Telegram» в планшете игры!`,
      parse_mode: 'Markdown',
      reply_markup: MAIN_KEYBOARD
    });
    return;
  }

  // Any other text treated as nickname / user identifier
  await handleLinkAttempt(chatId, telegramUserId, username, text);
}

async function handleCallbackQuery(callbackQuery) {
  const queryId = callbackQuery.id;
  const telegramUserId = callbackQuery.from.id;
  const username = callbackQuery.from.username || callbackQuery.from.first_name || '';
  const data = callbackQuery.data || '';
  const chatId = callbackQuery.message?.chat?.id;

  if (data.startsWith('check_link_')) {
    const identifier = data.replace('check_link_', '').trim();
    await handleLinkAttempt(chatId, telegramUserId, username, identifier);
    try {
      await callTelegram('answerCallbackQuery', { callback_query_id: queryId });
    } catch (_e) {}
  }
}

async function handleJoinRequest(joinRequest) {
  const telegramUserId = joinRequest.from.id;
  const username = joinRequest.from.username || joinRequest.from.first_name || '';

  console.log(`[TG Bot] Join request from ${telegramUserId} (@${username})`);

  // Auto-approve request
  await callTelegram('approveChatJoinRequest', {
    chat_id: GROUP_CHAT_ID,
    user_id: telegramUserId
  });

  if (pendingLinks.has(telegramUserId)) {
    const identifier = pendingLinks.get(telegramUserId);
    await handleLinkAttempt(telegramUserId, telegramUserId, username, identifier);
  }
}

async function startPolling() {
  console.log(`[TG Bot] Starting clean polling for @BasingseCritpoCytiAI_bot on group ${GROUP_CHAT_ID}...`);
  let offset = 0;

  while (true) {
    try {
      const res = await callTelegram('getUpdates', {
        offset: offset,
        timeout: 25,
        allowed_updates: ['message', 'callback_query', 'chat_join_request']
      });

      if (res && res.ok && Array.isArray(res.result)) {
        for (const update of res.result) {
          offset = Math.max(offset, update.update_id + 1);

          if (update.message && update.message.text) {
            await handleTextMessage(update.message);
          } else if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
          } else if (update.chat_join_request) {
            await handleJoinRequest(update.chat_join_request);
          }
        }
      } else if (res && !res.ok) {
        console.error('[TG Bot] getUpdates returned not ok:', res);
        await new Promise(r => setTimeout(r, 4000));
      }
    } catch (err) {
      console.error('[TG Bot] Polling loop error:', err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

startPolling();
