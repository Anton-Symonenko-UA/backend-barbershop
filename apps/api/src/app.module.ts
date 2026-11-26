import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { createObserveModule } from '@nestjs/observe';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module.js';
import { BarbersModule } from './barbers/barbers.module.js';
import { BookingsModule } from './bookings/bookings.module.js';
import { validateEnv } from './config/env.js';
import { HealthModule } from './health/health.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { SchedulingModule } from './scheduling/scheduling.module.js';
import { ServicesModule } from './services/services.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    // Телеметрія NestJS Observe: вмикається, коли в .env є OBSERVE_APP_KEY
    // (npx @nestjs/observe link). Без ключа нічого не надсилає.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'api',
      http: { ignore: ['/api/health'] },
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    // Базовий захист від спаму: 100 запитів за хвилину з однієї IP.
    // Чутливі маршрути (вхід, запис, відгуки) мають суворіші @Throttle().
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 100 }],
      // e2e-тести шлють десятки запитів з однієї IP; ліміти там перевіряє окремий тест
      skipIf: () =>
        process.env.NODE_ENV === 'test' &&
        process.env.THROTTLE_IN_TESTS !== 'true',
    }),
    PrismaModule,
    // Автентифікація й авторизація перед фічами: їхні guard-и мають бути глобальними
    AuthModule,
    HealthModule,
    ServicesModule,
    BarbersModule,
    SchedulingModule,
    BookingsModule,
    ReviewsModule,
    NotificationsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
