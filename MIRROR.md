# MIRROR.md — Навигационная карта Ba Sing Se MMORPG

> Сжатая когнитивная карта проекта для мгновенной ориентации человека и ИИ-агентов. Не запускайте слепой `grep` по репозиторию — используйте этот манифест.

---

## 🚀 Порты и сервисы
* **Frontend Dev Server:** `http://localhost:3000/` (или `3001..3002` при занятом порту). Запуск: `npm run dev`.
* **Backend Database:** `http://127.0.0.1:8090/` (локальный PocketBase v0.22.57). Управляется systemd `aiagent-pocketbase.service`.
* **Admin PocketBase:** `admin@basingse.game` / `BaSingSe2024`.

---

## 🗺️ Ключевые точки входа
| Файл | Назначение | Ключевые функции / символы |
|---|---|---|
| [`src/main.tsx`](file:///home/uro/Рабочий%20стол/my%20projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/src/main.tsx) | Точка входа React/Vite | Рендер `App` |
| [`App.tsx`](file:///home/uro/Рабочий%20стол/my%20projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/App.tsx) | Главный оркестратор и игровой цикл | `App()`, `processTreeHit()`, игровой тик, рендер карты и UI |
| [`src/pocketbase.ts`](file:///home/uro/Рабочий%20стол/my%20projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/src/pocketbase.ts) | Клиентский адаптер PocketBase | `pb`, очереди запросов, реалтайм подписки (`onSnapshot`), `requestTreeHit` |
| [`DATABASE_SCHEMA.md`](file:///home/uro/Рабочий%20стол/my%20projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/DATABASE_SCHEMA.md) | Каноническая схема базы данных | Описание всех полей коллекций |
| [`types.ts`](file:///home/uro/Рабочий%20стол/my%20projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/types.ts) | Доменные типы TypeScript | Типы зданий, ресурсов, инвентаря, персонажа |

---

## 🗄️ Коллекции PocketBase (Слой данных)
1. **`users`** (Auth): Профиль, золото, рубины, слава, инвентарь, клан, пол, туториалы.
2. **`buildings`**: Здания на карте (`zoneId`, `x`, `y`, `hp`, `type`, `workState`, `data`).
3. **`map_resources`**: Деревья, монстры, спавны ресурсов (`type`, `x`, `y`, `zoneId`, `maxHp`, `data`).
4. **`map_state`**: Состояние мира, таймстампы синхронизации, `forceReloadAt`.
5. **Вспомогательные:** `chat_messages`, `private_messages`, `presence`, `clans`, `market`, `elections`, `history`, `leaderboard_profiles`.

---

## 🛡️ Архитектурные инварианты (НЕ НАРУШАТЬ)
1. **Один адаптер:** Все обращения к базе идут строго через [`src/pocketbase.ts`](file:///home/uro/Рабочий%20стол/my%20projects/goldwasdx-svg-BASINGSEMMORPGREALTIME-main/src/pocketbase.ts). Никаких сторонних клиентов или прямых SQL-запросов из UI.
2. **Серверная истина:** Проверка ресурсов (например, удары по дереву `tree-hit`) валидируется сервером. Оптимистичный UI откатывается, если сервер вернул отказ.
3. **Совместимость версий:** PocketBase работает на версии `0.22` (поля схемы задаются массивом `schema: [...]`).
4. **Запрет слепого переименования:** Никогда не создавать коллекции-дубликаты (`map_state2`, `map_state3` и т.д.) при сбоях. Если операция падает — проверьте структуру запроса и ошибки в консоли браузера/терминала.
