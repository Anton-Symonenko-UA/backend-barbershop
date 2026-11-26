import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { StaffUser } from './user.js';

const select = {
  id: true,
  email: true,
  role: true,
  barber: { select: { id: true } },
} as const;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<StaffUser | null> {
    const row = await this.prisma.user.findUnique({ where: { id }, select });
    return row && toUser(row);
  }

  /** Єдине місце, де хеш пароля залишає базу. */
  async findCredentials(email: string) {
    const row = await this.prisma.user.findUnique({
      where: { email },
      select: { ...select, passwordHash: true },
    });
    return row && { user: toUser(row), passwordHash: row.passwordHash };
  }

  async updatePasswordHash(id: string, passwordHash: string) {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }
}

function toUser(row: {
  id: string;
  email: string;
  role: StaffUser['role'];
  barber: { id: string } | null;
}): StaffUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    barberId: row.barber?.id ?? null,
  };
}
