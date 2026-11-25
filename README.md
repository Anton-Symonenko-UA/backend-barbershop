# Barbershop

Сайт барбершопу з онлайн-записом: Next.js (`apps/web`) + NestJS API (`apps/api`) + PostgreSQL.

## Запуск

1. Node.js 22+ (`.nvmrc`).
2. `npm install`
3. Скопіюй env-файли і заповни їх:
   - `apps/api/.env.example` → `apps/api/.env` (`DATABASE_URL` з Neon або локального Postgres, `AUTH_SECRET`: `openssl rand -base64 32`)
   - `apps/web/.env.example` → `apps/web/.env.local`
4. `npm run db:start`: локальна база Postgres (prisma dev, без Docker). `DATABASE_URL` для неї вже в `.env.example`.
5. `npm run db:migrate`, потім `npm run db:seed`: таблиці й тестові послуги.
6. `npm run dev`: сайт http://localhost:3000, API http://localhost:4000/api, Swagger http://localhost:4000/api/docs

## Команди

| Команда                        | Що робить                          |
| ------------------------------ | ---------------------------------- |
| `npm run dev`                  | сайт і API разом                   |
| `npm run build`                | збирає shared, api, web            |
| `npm run lint` / `npm test`    | лінт і тести всіх частин           |
| `npm run db:start` / `db:stop` | запустити / зупинити локальну базу |
| `npm run db:migrate`           | нова міграція Prisma               |
| `npm run db:seed`              | тестові дані                       |
| `npm run db:studio`            | перегляд бази в браузері           |
