# Barbershop — монорепо (сайт + API)

Сайт барбершопу з онлайн-записом, рівень як у комерційного продукту. Мова інтерфейсу українська (`lang="uk"`), код і коміти англійською.

## Структура

| Шлях              | Що це                                  | Стек                                                                                                                                           |
| ----------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`        | Публічний сайт + адмінка               | Next.js 16 (App Router, Cache Components), React 19, Tailwind 4, shadcn/ui (base-nova, Base UI), motion, TanStack Query, react-hook-form + zod |
| `apps/api`        | REST API                               | NestJS 12 (ESM), Prisma 7 + PostgreSQL, @nestjs/authentication / authorization, throttler, terminus, swagger                                   |
| `packages/shared` | Спільні zod-схеми й типи для web і api | TypeScript, zod 4                                                                                                                              |

npm workspaces. Команди з кореня: `npm run dev` (web :3000 + api :4000), `npm run build`, `npm run lint`, `npm test`, `npm run db:start` (локальний Postgres через prisma dev), `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`.
Після змін у `packages/shared` треба запустити `npm run build -w @barbershop/shared`.

## Правила

- Next.js і NestJS тут новіші, ніж ти знаєш. Читай `apps/web/AGENTS.md` і `apps/api/AGENTS.md` і документацію в `node_modules/next/dist/docs/` перед тим, як писати код.
- API ESM: відносні імпорти закінчуються на `.js`. Префікс маршрутів `/api`, Swagger на `/api/docs`.
- Валідацію вхідних даних описуй у `packages/shared` (zod) і використовуй її і в API (`@Body({ schema })`), і у формах сайту.
- Гроші зберігай у копійках (`priceCents: Int`), час у UTC (`DateTime`), робочі години у хвилинах від півночі.
- Запис до майстра не повинен давати двох записів на один слот: перевіряй перетин у транзакції.
- Секрети тримай тільки в `.env` (у git йде лише `.env.example`). `AUTH_SECRET` має бути ≥ 32 байт.
- Дизайн: кінематографічний редакційний стиль (референс: `design-ref/`, у git не йде). Темна тепла гама, латунний акцент `primary`, редакційні панелі `paper` (холодний папір) і `tan` (тютюн) з похилими краями. Заголовки Unbounded (`font-heading`, капс, font-black), текст Manrope, дрібні підписи утилітою `eyebrow`. Кольори тільки з токенів у `globals.css`, без hex у компонентах. Контент головної в `apps/web/src/config/site.ts`. Mobile-first, мінімальна ширина 360px.
- Доступність: семантичні теги, `alt` у зображень, видимий focus, контраст AA. Кожна scroll-анімація (motion) має статичний варіант при `prefers-reduced-motion`, а відрізки `useTransform` мають лежати в межах 0..1.
- Зображення через `next/image`, метадані через `metadata` / `generateMetadata`, JSON-LD `BarberShop` на головній.
- Перед комітом мають проходити `npm run lint`, `npm test` і `npm run build`.

## Скіли: що брати для якої задачі

Встановлені в проект (`.claude/skills`):

- **nestjs, nestjs-feature**: нові модулі й ендпоінти API.
- **nestjs-auth**: вхід в адмінку, ролі ADMIN/BARBER.
- **nestjs-production**: конфіг, логи, rate limit, health, деплой.
- **nestjs-testing**: тести API.
- **prisma-cli, prisma-client-api, prisma-database-setup, prisma-postgres**: схема, міграції, запити.
- **vercel-react-best-practices, vercel-composition-patterns**: React і Next.js компоненти, продуктивність.
- **vercel-react-view-transitions**: анімації переходів між сторінками.
- **web-design-guidelines**: перевірка UI на відповідність гайдлайнам.

Загальні скіли користувача:

- **ui-ux-pro-max, design-system, ui-styling**: дизайн сторінок, токени, компоненти shadcn.
- **brand, design, image, banner-design**: айдентика, логотип, візуали.
- **site-architecture**: карта сторінок, навігація, URL.
- **copywriting, copy-editing**: тексти сайту.
- **cro**: конверсія в запис.
- **seo-audit, schema, ai-seo**: SEO, локальне SEO, JSON-LD.
- **analytics, conversion-tracking**: аналітика й події запису.
- **security-review, code-review, simplify**: перевірка коду перед злиттям.
- **run**: запустити застосунок і перевірити зміни в браузері.
