import { Policy, type PolicyBefore } from '@nestjs/authorization';
import type { StaffUser } from './user.js';

// Хто що може в адмінці. ADMIN може все; BARBER працює лише зі своїми записами й графіком.
@Policy()
export class StaffPolicy implements PolicyBefore<StaffUser> {
  before(user: StaffUser | null) {
    if (user?.role === 'ADMIN') return true;
  }

  /** Будь-хто з персоналу */
  staff(user: StaffUser | null) {
    return !!user;
  }

  /** Послуги, майстри, відгуки: лише адміністратор (before() вже пропустив ADMIN) */
  manage(_user: StaffUser | null) {
    return false;
  }

  /** Розклад і вихідні конкретного майстра */
  manageBarber(user: StaffUser | null, barberId: string) {
    return !!user && user.barberId === barberId;
  }

  /** Запис: майстер бачить і змінює лише свої */
  manageBooking(user: StaffUser, booking: { barberId: string }) {
    return user.barberId === booking.barberId;
  }
}
