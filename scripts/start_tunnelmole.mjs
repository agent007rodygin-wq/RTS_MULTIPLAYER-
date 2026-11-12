import fs from 'fs';
import path from 'path';

const DESKTOP_PATH = '/home/uro/Рабочий стол/ССЫЛКА_ДЛЯ_ДРУЗЕЙ.txt';
const CF_URL = 'https://ranges-tours-increases-radios.trycloudflare.com';

async function main() {
  console.log('[Tunnelmole] Запуск туннеля для порта 3000...');
  
  const { default: tunnelmole } = await import('/home/uro/node/lib/node_modules/tunnelmole/cjs/index.js');
  const url = await tunnelmole({ port: 3000 });

  console.log(`[Tunnelmole] Готово! Публичный URL: ${url}`);

  const content = `🎮 ССЫЛКИ ДЛЯ ВХОДА В BASINGSE MMORPG

1. 🇺🇦 ДЛЯ УКРАИНЫ И БЕЗ БЛОКИРОВОК (Без VPN и без паролей):
👉 ${url}
(Открывается напрямую на смартфонах и ПК без блокировок провайдеров и без ожидания!)

2. 🌍 ОСНОВНАЯ ССЫЛКА (Cloudflare):
👉 ${CF_URL}

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
