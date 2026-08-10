# Squinder: CRM для персон, общая матрица интересов и seed-механика

**Автор:** m_brtn  
**Дата:** 2026-08-10, 13:00 EEST  
**Ветка:** `main`  
**Базовый коммит:** `8eadea1` (`Update theme colors in ThemeProvider for improved visual consistency`)  
**Связанные задачи:** без трекера

## Контекст

Свайпер до сих пор показывал четыре захардкоженных demo-профиля. Чтобы наполнять
ленту реальными данными, понадобилось третье приложение — CRM без авторизации,
где можно добавлять и редактировать персон для свайпов, плюс механика быстрого
наполнения базы скриптом (JSON-файлы удобно генерировать через LLM).

Одновременно поля анкеты (пол, «кем интересуется») и интересы вынесены в общие
константы, чтобы CRM, API и мобильный онбординг использовали одни и те же
значения и матчинг был прямым сравнением slug'ов. Матрица интересов срисована
с интереc-пикера Tinder (скриншоты в сессии), фотографии персон подготовлены
в корневой папке `profiles/`.

## Что сделано

### 1. Общий пакет `@squinder/shared`

- Новый workspace `packages/shared` (в `pnpm-workspace.yaml` добавлен
  `packages/*`).
- Енумы анкеты: `GENDERS`, `INTERESTED_IN` (male/female/everyone),
  `SMOKING` (no/sometimes/yes), `ALCOHOL` (no/socially/regularly),
  `WORKOUTS` (no/rarely/often), `PETS` (have/want/no/dont_want),
  `KIDS` (have/maybe/no/dont_want) + английские label-мапы для CRM.
- Матрица интересов: 12 категорий, 172 интереса со slug'ами в kebab-case,
  лимит выбора `MAX_PROFILE_INTERESTS = 10` (как «10 of 10» в Tinder).
- Сборка через `prepare` — dist собирается автоматически при `pnpm install`;
  Metro читает исходники через поле `react-native`, Vite — через alias.

### 2. Схема БД и API

- Новые таблицы: `personas` (все поля анкеты, `photo_urls`, служебный
  `seed_key` для идемпотентных апсертов), `interests`,
  `persona_interests`, `user_interests`; pg-енумы `smoking`, `alcohol`,
  `workouts`, `pets`, `kids`. Миграция `0002_broad_tombstone.sql`.
- Матрица интересов синхронизируется в таблицу `interests` при старте API
  (после миграций), поэтому FK работают без ручного сида.
- Роуты: `GET/POST /personas`, `GET/PUT/DELETE /personas/:id`
  (с заменой связей интересов в транзакции), `GET /interests`.
- `POST /users` принимает `interests`, `/me` возвращает их.
- `@fastify/static` раздаёт корневую папку `profiles/` по `/profiles/...`;
  в compose она смонтирована в контейнер read-only.
- Dockerfile копирует `packages/shared` до `pnpm install`, чтобы `prepare`
  собрал dist внутри образа.

### 3. CRM (`apps/crm`)

- Vite + React 19 (официальный генератор `create vite`, шаблон react-ts),
  без авторизации — локальный админ-инструмент.
- Слева список персон с поиском, фото и возрастом; справа форма
  создания/редактирования: все поля анкеты чипсами, фото по одному URL или
  `profiles/...` пути на строку с превью, пикер интересов с поиском по
  категориям и счётчиком «N of 10».
- Запуск: `make crm` или `pnpm dev:crm`, API-адрес через `VITE_API_URL`
  (по умолчанию `http://localhost:3001`).

### 4. Seed-механика для LLM

- `pnpm db:seed` / `make seed` → `apps/api/src/scripts/seed.ts` (tsx).
- Читает JSON-файлы из `apps/api/seeds/` (или переданный путь), валидирует
  все значения по общим константам и падает с понятными ошибками до записи.
- Апсерт по обязательному `key` — повторный прогон обновляет, а не дублирует.
- Формат задокументирован в `apps/api/seeds/README.md` (таблица полей и
  допустимых значений — можно скармливать LLM), рядом
  `example.personas.json` с четырьмя персонами на фото из `profiles/`.

### 5. Онбординг на общих константах + шаг интересов

- Опции пола и «кого ищете» строятся из `GENDERS` / `INTERESTED_IN`.
- Добавлен пятый шаг — выбор интересов: чипсы по категориям матрицы,
  максимум 10, шаг можно пропустить; выбранное уходит в `POST /users`.

### 6. Dev-консоль и workflow

- `scripts/dev-console.mjs` — статус-таблица сервисов (API, фото персон,
  CRM, Metro, PostgreSQL) с реальной проверкой доступности по HTTP/TCP;
  печатается после `make backend` и доступна как `make status`.
- `make backend` теперь `docker compose up -d --build`, поэтому после
  изменений API достаточно `make ios` / `make android` / `make crm` —
  образ пересобирается по кэшу без ручных docker-команд.
- Новые цели Makefile: `crm`, `seed`, `status`.

## Архитектурные решения

- **Slug интереса — первичный ключ.** Строковые slug'и из общей матрицы
  используются и в БД, и в API, и в UI; матчинг пользователей с персонами —
  пересечение множеств без джойнов на числовые id.
- **Матрица живёт в коде, БД — производная.** Источник правды —
  `packages/shared`; таблица `interests` апсертится при старте API, что
  сохраняет ссылочную целостность связей.
- **Seed идемпотентен через `seed_key`.** LLM может регенерировать файлы,
  прогон не плодит дубликаты; ручные персоны из CRM (`seed_key = null`)
  не затрагиваются.
- **Один shared-пакет, три способа потребления.** Node/tsc берут dist,
  Metro — исходники через `react-native` field, Vite — через alias; это
  избавляет от пересборки пакета в горячем цикле мобильной и веб-разработки.
- **CRM без авторизации.** Осознанно: локальный инструмент до появления
  админ-аутентификации.

## Проверка

- `pnpm typecheck` — все четыре workspace без ошибок.
- `pnpm --filter @squinder/api build` и `pnpm --filter @squinder/api test` —
  сборка и тесты зелёные.
- `expo-doctor` — 21/21 после добавления зависимости в mobile.
- Миграция применена к Docker PostgreSQL (`drizzle-kit migrate`), сид прогнан
  дважды: `4 created, 0 updated` → `0 created, 4 updated`.
- В базе: 4 персоны, 172 интереса, 24 связи `persona_interests`.
- `make status` показывает корректные состояния сервисов.
- UI CRM в браузере вживую не проверялся — нужен smoke test.

## Риски и открытые вопросы

- CRM открыт без авторизации; терпимо локально, но нельзя выставлять наружу.
- Свайпер всё ещё читает захардкоженные demo-профили — лента не переведена
  на `GET /personas` (следующий логичный шаг).
- Матрица интересов собрана по скриншотам Tinder частично «по мотивам»;
  состав категорий стоит отревьюить продуктово.
- Интерес-пикер онбординга — простые чипсы без секций show more/less и
  поиска, на длинной матрице скролл заметный.
- `interests` открытым текстом на английском в mobile UI (без i18n-ключей
  на каждый интерес) — осознанный компромисс.
- Фото персон раздаются из репозитория; для production нужно хранилище.

## Коммиты

- `8eadea1` — базовый коммит; все изменения сессии пока не закоммичены.

## Основные изменённые файлы

- `packages/shared/src/{profile,interests}.ts` — общие енумы и матрица.
- `apps/api/src/db/schema.ts`, `apps/api/drizzle/0002_broad_tombstone.sql` —
  новые таблицы и pg-енумы.
- `apps/api/src/routes/{personas,interests,users}.ts` — CRUD персон,
  матрица, интересы пользователя.
- `apps/api/src/scripts/seed.ts`, `apps/api/seeds/` — seed-механика и формат.
- `apps/api/src/plugins/{database,static}.ts` — синк интересов, статика фото.
- `apps/crm/` — новое веб-приложение CRM.
- `apps/mobile/src/screens/OnboardingScreen.tsx`,
  `apps/mobile/src/api/client.ts`, `apps/mobile/App.tsx` — общие константы
  и шаг интересов.
- `Makefile`, `scripts/dev-console.mjs`, `compose.yaml`,
  `apps/api/Dockerfile` — workflow, статус-таблица, сборка образа.

## Следующая сессия

Перевести свайпер с demo-массива на `GET /personas` (фильтрация по
`gender`/`interestedIn` пользователя), показать интересы на карточке и
сделать smoke test CRM в браузере.
