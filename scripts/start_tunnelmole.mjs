import fs from 'fs';
import path from 'path';

const DESKTOP_PATH = '/home/uro/Рабочий стол/ССЫЛКА_ДЛЯ_ДРУЗЕЙ.txt';
const CF_URL_FILE = '/tmp/basingse_public_url.txt';

function readLiveCloudflareUrl() {
  try {
    if (fs.existsSync(CF_URL_FILE)) {
      const val = fs.readFileSync(CF_URL_FILE, 'utf8').trim();
      if (val.startsWith('https://')) return val;
    }
  } catch {}
  return '';
}

async function main() {
  console.log('[Tunnelmole] Запуск туннеля для порта 3000...');
  
  const { default: tunnelmole } = await import('/home/uro/node/lib/node_modules/tunnelmole/cjs/index.js');
  const url = await tunnelmole({ port: 3000 });

  console.log(`[Tunnelmole] Готово! Публичный URL: ${url}`);

  const cfUrl = readLiveCloudflareUrl();
  const cfBlock = cfUrl
    ? `\n2. 🌍 ОСНОВНАЯ ССЫЛКА (Cloudflare):\n👉 ${cfUrl}\n`
    : '';

  const content = `🎮 ССЫЛКИ ДЛЯ ВХОДА В BASINGSE MMORPG

1. 🇺🇦🇷🇺 ДЛЯ УКРАИНЫ / РОССИИ И БЕЗ БЛОКИРОВОК (Без VPN и без паролей):
👉 ${url}
(Открывается напрямую на смартфонах и ПК без блокировок провайдеров и без ожидания!)
${cfBlock}
⚡ Оба адреса ведут в один и тот же игровой мир на твоем сервере!
`;

  try {
    fs.writeFileSync(DESKTOP_PATH, content, 'utf8');
    console.log(`[Tunnelmole] Файл сохранен на рабочем столе: ${DESKTOP_PATH}`);
  } catch (err) {
    console.error('[Tunnelmole] Ошибка записи файла на рабочий стол:', err);
  }

  // Keep process alive
  setInterval(() => {}, 60000);
}

main().catch(err => {
  console.error('[Tunnelmole] Критическая ошибка:', err);
  process.exit(1);
});
