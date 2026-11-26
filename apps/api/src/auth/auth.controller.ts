import {
  Controller,
  Get,
  HttpCode,
  Post,
  UnauthorizedException,
  Body,
} from '@nestjs/common';
import { CurrentUser, Public, TokenService } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { Throttle } from '@nestjs/throttler';
import {
  loginSchema,
  type AuthToken,
  type LoginInput,
  type Me,
} from '@barbershop/shared';
import { CredentialsService } from './credentials.service.js';
import { StaffPolicy } from './staff.policy.js';
import type { StaffUser } from './user.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly credentials: CredentialsService,
    private readonly tokens: TokenService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  // Підбір пароля: 5 спроб за 15 хвилин з однієї IP
  @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
  async login(
    @Body({ schema: loginSchema }) body: LoginInput,
  ): Promise<AuthToken> {
    const user = await this.credentials.verify(body.email, body.password);
    if (!user) throw new UnauthorizedException('Невірний email або пароль');
    const { accessToken, expiresIn } = await this.tokens.issue(user.id, {
      method: 'password',
    });
    return { accessToken, expiresIn };
  }

  @Get('me')
  @Can(StaffPolicy, 'staff')
  me(@CurrentUser() user: StaffUser): Me {
    return user;
  }
}
