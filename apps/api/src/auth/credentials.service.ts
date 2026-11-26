import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UsersRepository } from './users.repository.js';
import type { StaffUser } from './user.js';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  /** Користувач або null, якщо email чи пароль невірні. */
  async verify(email: string, password: string): Promise<StaffUser | null> {
    const found = await this.users.findCredentials(email);
    // Без акаунта verify() перевіряє фіктивний хеш, тож за часом відповіді не видно, які email існують
    const valid = await this.passwordHasher.verify(
      password,
      found?.passwordHash,
    );
    if (!valid || !found) return null;
    if (this.passwordHasher.needsRehash(found.passwordHash)) {
      await this.users.updatePasswordHash(
        found.user.id,
        await this.passwordHasher.hash(password),
      );
    }
    return found.user;
  }
}
