import type { Role } from '@barbershop/shared';

// Користувач адмінки, яким бачать його guard, політики й сервіси. Без хеша пароля.
export interface StaffUser {
  id: string;
  email: string;
  role: Role;
  barberId: string | null;
}

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: StaffUser;
    refreshTokens: false;
  }
}
