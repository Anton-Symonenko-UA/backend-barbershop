import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  JwtBearerProvider,
  type JwtClaims,
} from '@nestjs/authentication';
import { UsersRepository } from './users.repository.js';
import type { StaffUser } from './user.js';

@Injectable()
export class JwtAuth extends JwtBearerProvider<StaffUser> {
  constructor(
    private readonly users: UsersRepository,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this);
  }

  // Користувача й роль читаємо з бази на кожен запит: видалений акаунт чи змінена роль діють одразу
  validate({ sub }: JwtClaims) {
    return sub ? this.users.findById(sub) : null;
  }
}
