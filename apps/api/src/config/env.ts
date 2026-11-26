import { z } from 'zod';

// Перевірка змінних оточення під час старту: без них застосунок не запуститься.
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET має бути щонайменше 32 символи'),
  // Назва й телефон у SMS клієнтам
  SHOP_NAME: z.string().default('KREMEN'),
  SHOP_PHONE: z.string().default('+380670000000'),
  // Сповіщення адміну в Telegram (необов'язково): токен від @BotFather і id чату
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_ADMIN_CHAT_ID: z.string().optional(),
  // SMS клієнтам через TurboSMS (необов'язково)
  TURBOSMS_TOKEN: z.string().optional(),
  TURBOSMS_SENDER: z.string().default('KREMEN'),
  // Скільки проксі стоїть перед API (для коректної IP у rate limit)
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  OBSERVE_APP_KEY: z.string().optional(),
  OBSERVE_APP_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  // Порожні рядки з .env (KEY=) вважаємо незаданими
  const cleaned = Object.fromEntries(
    Object.entries(config).filter(([, v]) => v !== ''),
  );
  const parsed = envSchema.safeParse(cleaned);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
    );
  }
  return parsed.data;
}
