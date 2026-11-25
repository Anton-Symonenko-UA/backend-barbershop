import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule, ObserveInstrument } from './app.module.js';
import type { Env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.use(helmet());
  app.enableCors({
    origin: config.get('WEB_ORIGIN', { infer: true }),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    const doc = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Barbershop API')
        .setVersion('0.1.0')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, doc);
  }

  await app.listen(config.get('PORT', { infer: true }));
}
await bootstrap();
