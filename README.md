# Barbershop

Сайт барбершопу з онлайн-записом: Next.js (`apps/web`) + NestJS API (`apps/api`) + PostgreSQL.

## Що вміє

- **Онлайн-запис** `/booking`: послуга → майстер (або «будь-хто») → дата й вільний час → контакти. Слоти по 15 хвилин рахуються з графіка майстра, вихідних і наявних записів за київським часом (з переходом на літній час).
- **Без подвійних записів**: перевірка перетину в транзакції, а під нею exclusion constraint у Postgres (`Booking_no_overlap`), тож навіть одночасні запити не займуть один слот.
- **Керування записом без акаунта**: після запису клієнт отримує секретне посилання `/booking/<token>`, щоб переглянути, перенести або скасувати запис (не пізніше ніж за 2 години). У базі зберігається лише SHA-256 токена.
- **Адмінка** `/admin`: записи на день зі зміною статусу, послуги й ціни, майстри, робочі години, вихідні, модерація відгуків. Ролі: `ADMIN` бачить усе, `BARBER` лише свої записи й графік.
- **Сповіщення**: Telegram адміну про кожен новий, скасований чи перенесений запис і новий відгук; SMS клієнту з посиланням на запис і нагадування за добу (TurboSMS). Обидва необов’язкові.
- **SEO**: сторінки послуг `/services/<slug>` і майстрів `/barbers/<slug>`, `sitemap.xml`, `robots.txt`, OG-картинка, JSON-LD `BarberShop` з рейтингом і відгуками, `Service`, `Person`, хлібні крихти.
- **Аналітика**: події воронки (`booking_start`, `booking_step`, `booking_submitted`, `booking_failed`, `phone_click` тощо) у GA4/GTM, якщо задано `NEXT_PUBLIC_GA_ID`. Персональні дані не передаються.
- **Захист**: rate limit на вхід (5 за 15 хв), запис (5 за 10 хв) і відгуки, поле-пастка для ботів, токен адміна лише в httpOnly-cookie.

## Запуск

1. Node.js 22+ (`.nvmrc`).
2. `npm install`
3. Скопіюй env-файли і заповни їх:
   - `apps/api/.env.example` → `apps/api/.env` (`AUTH_SECRET`: `openssl rand -base64 32`, `SEED_ADMIN_EMAIL` і `SEED_ADMIN_PASSWORD` для першого адміністратора)
   - `apps/web/.env.example` → `apps/web/.env.local`
4. `npm run db:start`: локальна база Postgres (prisma dev, без Docker). `DATABASE_URL` для неї вже в `.env.example`.
   `prisma dev` обслуговує лише одне з’єднання, тому локально `DATABASE_POOL_MAX=1`; на справжньому Postgres став 10 або більше.
5. `npm run db:migrate`, потім `npm run db:seed`: таблиці, послуги, майстри з графіком, адміністратор, кілька відгуків.
6. `npm run dev`: сайт http://localhost:3000, адмінка http://localhost:3000/admin, API http://localhost:4000/api, Swagger http://localhost:4000/api/docs

Майстра з власним входом в адмінку створи в базі: користувач з роллю `BARBER`, прив’язаний до профілю майстра (`Barber.userId`).

## Команди

| Команда                        | Що робить                              |
| ------------------------------ | -------------------------------------- |
| `npm run dev`                  | сайт і API разом                       |
| `npm run build`                | збирає shared, api, web                |
| `npm run lint` / `npm test`    | лінт і unit-тести всіх частин          |
| `npm run test:e2e -w api`      | e2e-тести API на базі з `DATABASE_URL` |
| `npm run db:start` / `db:stop` | запустити / зупинити локальну базу     |
| `npm run db:migrate`           | нова міграція Prisma                   |
| `npm run db:seed`              | тестові дані й перший адміністратор    |
| `npm run db:studio`            | перегляд бази в браузері               |

## CI і деплой

- GitHub Actions (`.github/workflows/ci.yml`) на кожен PR і push у `main`: міграції на чистому Postgres, lint, unit- і e2e-тести, збірка.
- Docker: `apps/api/Dockerfile` і `apps/web/Dockerfile` (Next у режимі `standalone`), збираються з кореня репозиторію.
- `docker compose up --build` піднімає Postgres, міграції, API і сайт. Потрібен `.env` у корені з `POSTGRES_PASSWORD` і `AUTH_SECRET`; для Telegram і SMS додай `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `TURBOSMS_TOKEN`.
- За реверс-проксі задай API `TRUST_PROXY=1`, інакше rate limit бачитиме IP проксі.
