import { StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import type { Env } from './config/env.js';

/** Спільне налаштування застосунку: і для main.ts, і для e2e-тестів. */
export function configureApp(app: NestExpressApplication) {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  // За реверс-проксі (Render, Fly, nginx): інакше rate limit бачить IP проксі
  const trustProxy = config.get('TRUST_PROXY', { infer: true });
  if (trustProxy > 0) app.set('trust proxy', trustProxy);

  app.use(helmet());
  app.enableCors({
    origin: config.get('WEB_ORIGIN', { infer: true }),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  // Валідація zod-схемами з @barbershop/shared: @Body({ schema }), @Query({ schema })
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  return config;
}
