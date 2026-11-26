import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticationModule } from '@nestjs/authentication';
import { AuthorizationModule } from '@nestjs/authorization';
import type { Env } from '../config/env.js';
import { AuthController } from './auth.controller.js';
import { CredentialsService } from './credentials.service.js';
import { JwtAuth } from './jwt-auth.provider.js';
import { StaffPolicy } from './staff.policy.js';
import { UsersRepository } from './users.repository.js';
import './user.js';

// Вхід персоналу. Bearer-токен живе 12 годин (одна зміна), без refresh-токенів:
// сайт тримає його в httpOnly-cookie і просить увійти знову, коли він спливає.
@Module({
  imports: [
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        accessToken: {
          key: config.get('AUTH_SECRET', { infer: true }),
          ttl: '12h',
          issuer: 'barbershop-api',
        },
        refreshToken: false,
      }),
    }),
    AuthorizationModule.forRoot(),
  ],
  controllers: [AuthController],
  providers: [UsersRepository, CredentialsService, JwtAuth, StaffPolicy],
  exports: [StaffPolicy],
})
export class AuthModule {}
