# Squinder: bootstrap Expo/Fastify, realtime-инфраструктура и первый онбординг

**Автор:** m_brtn  
**Дата:** 2026-08-07, 21:00 EEST
**Ветка:** `main`  
**Базовый коммит:** `a9dfe57` (`Init`)  
**Связанные задачи:** без трекера, начальная разработка продукта

## Контекст

Проект стартовал с требования web-first: основной клиент разрабатывается на Expo Web, но должен сохранять путь к iOS, Android и будущему Telegram Mini App. Бэкенду сразу нужны HTTP API, WebSocket и SSE для будущих AI-чатов, Railway-деплой и база с векторным поиском.

Первой продуктовой фичей стал онбординг: имя, расширенный выбор пола и дата рождения. На этапе разработки поля предзаполнены; профиль создаётся в PostgreSQL, а анонимная сессия сохраняется на устройстве.

## Что сделано

### 1. Официальные scaffold и монорепозиторий

- Expo-приложение создано через официальный `create-expo-app` TypeScript template.
- Fastify API пересоздан официальным `fastify-cli generate --lang=ts`.
- Настроены pnpm workspaces для `apps/mobile` и `apps/api`.
- Expo оставлен на совместимых с SDK 57 версиях, а не механически обновлён до несовместимых npm latest.

### 2. Realtime API и инфраструктура

- `GET /health` возвращает статус и версию API.
- `/ws` отправляет ping каждые 5 секунд.
- `/events` отдаёт SSE connected/ping events.
- Добавлены Fastify CORS, environment config и Drizzle database plugin.
- Подготовлен Railway config с `/health` как deployment healthcheck.

### 3. PostgreSQL и Docker

- Выбран PostgreSQL 18 + pgvector вместо отдельной vector DB.
- Добавлены Dockerfile API и Compose-сервисы `api`/`postgres`.
- Учтён новый PG18 data mount `/var/lib/postgresql`.
- Добавлена Drizzle migration: расширение `vector`, enum пола и таблица `users`.
- Миграции применяются при старте API.
- Makefile даёт единый workflow: `make prep`, затем `make web`, `make ios` или `make android`.

### 4. Expo Web и development builds

- Добавлены `react-dom` и `react-native-web`, отсутствовавшие в blank template.
- Для SDK 57 настроен `expo-dev-client` и EAS development profile: магазинные версии Expo Go ещё не поддерживают этот SDK.
- Добавлены `make build-ios`, `make build-android` и `make build-dev`.
- API URL автоматически выводится из Expo dev host; локальный Docker API доступен на `3001`.

### 5. Онбординг и анонимная сессия

- Реализованы три последовательных шага с прогрессом:
  1. имя;
  2. мужской / женский / небинарный / не указывать;
  3. дата рождения.
- Dev-значения: `Alex`, `male`, `1995-05-15`.
- `POST /users` создаёт пользователя и выдаёт 256-битный случайный session token.
- В PostgreSQL сохраняется только SHA-256 hash токена.
- `GET /me` восстанавливает пользователя по Bearer token.
- Native хранит токен в Expo SecureStore, web — в localStorage через platform adapter.
- После завершения показывается главный экран со статусом API и WebSocket; dev-сессию можно сбросить.

### 6. i18n foundation

- Добавлены `react-intl` и `expo-localization` с единым `I18nProvider`.
- Английский стал первым и fallback-языком; сообщения хранятся в `apps/mobile/src/i18n/messages/en.json`.
- Все пользовательские строки вынесены из TS/TSX в semantic message keys, включая placeholders, ошибки, статусы, кнопки и видимые dev-defaults.
- ICU MessageFormat используется для interpolation, форматирования времени и plural-веток.
- Добавлен реальный plural message для оставшихся шагов онбординга: отдельные варианты для 0, 1 и нескольких шагов.
- Создано Cursor rule `.cursor/rules/i18n.mdc`, запрещающее hardcoded UI copy и конкатенацию переводимых фрагментов.

## Архитектурные решения

- **Expo Web — основная платформа.** Native-only зависимости допускаются только с web fallback или platform adapter.
- **Telegram Mini App не требует отдельного продукта.** План — открыть Expo Web внутри Telegram WebView и добавить Telegram SDK через web-only слой.
- **Fastify вместо NestJS.** Для текущего масштаба достаточно меньшего boilerplate при полноценной поддержке HTTP, WebSocket и SSE.
- **PostgreSQL + pgvector вместо отдельной vector DB.** Транзакционные данные и embeddings остаются в одной системе; отдельный движок появится только при подтверждённой нагрузке.
- **Mastra отложена до первого AI-flow.** Детерминированные формы, валидация, сессии и CRUD не должны зависеть от агента.
- **Анонимная сессия — временный auth boundary.** Контракт уже отделён от UI, поэтому позже токен можно заменить Telegram auth, OAuth или полноценной учётной записью.
- **ICU MessageFormat как контракт локализации.** Тексты хранятся в JSON, UI обращается к semantic keys через `react-intl`; plural/select/interpolation не собираются вручную.
- **API не отвечает за локализованный copy.** Серверные ошибки остаются машиночитаемыми, а пользовательский текст выбирается на границе Expo UI.

## Проверка

- `pnpm typecheck` — API и mobile без ошибок.
- API test suite — зелёный.
- Expo Doctor — 20/20 проверок.
- Docker image собирается; API и PostgreSQL проходят healthchecks.
- pgvector 0.8.6 включён в локальной БД.
- Реальными запросами проверены healthcheck, WebSocket, SSE, создание пользователя и `/me`.
- В браузере пройден полный онбординг и подтверждено восстановление сессии после перезагрузки.
- Expo Web повторно проверен после подключения `IntlProvider`: главный экран полностью отображается на английском.
- ICU plural message отдельно прогнан для `count = 0`, `1` и `2`: получены три корректные английские формы.
- Поиск по TS/TSX не нашёл оставшихся русских или напрямую захардкоженных пользовательских строк.

## Риски и открытые вопросы

- Для физического iPhone EAS development build требует Apple Developer Account.
- Анонимные пользователи пока не объединяются между устройствами.
- Сброс dev-сессии не удаляет пользователя из БД; до настоящей авторизации это допустимо.
- Возрастное ограничение ещё не определено: сервер проверяет корректность и отсутствие будущей даты, но не минимальный возраст.
- Размерность vector-поля нужно выбрать вместе с embedding-моделью; преждевременно фиксировать её в схеме не стали.

## Коммиты

- `a9dfe57` — `Init`.
- Онбординг, Drizzle migration, dev-client и session flow пока не закоммичены.

## Основные изменённые файлы

- `apps/mobile/App.tsx`, `apps/mobile/src/` — orchestration, onboarding, home, API client, session storage и i18n provider.
- `apps/mobile/src/i18n/messages/en.json` — полный английский message catalog с ICU plural.
- `apps/api/src/routes/users.ts` — создание пользователя и восстановление сессии.
- `apps/api/src/db/schema.ts`, `apps/api/drizzle/` — пользовательская схема и миграция.
- `apps/api/src/plugins/database.ts` — типизированный Drizzle client и startup migrations.
- `Makefile`, `compose.yaml`, `apps/api/Dockerfile`, `railway.json` — локальная и Railway-инфраструктура.
- `.cursor/rules/project-conventions.mdc` — устойчивые правила проекта из этой сессии.
- `.cursor/rules/i18n.mdc` — обязательные правила локализации Expo UI.

## Следующая сессия

Определить следующий пользовательский экран после онбординга и контракт реальной авторизации. До первого AI-сценария Mastra не подключать; при начале AI-чата отдельно спроектировать streaming lifecycle, persistence и восстановление оборванных ответов.
