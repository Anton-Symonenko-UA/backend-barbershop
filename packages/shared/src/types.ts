import type { BookingStatus, Role } from './schemas.js';

// Відповіді API. Дати приходять рядками ISO 8601 в UTC.

// GET /api/services
export interface PublicService {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number;
  category: string | null;
}

// GET /api/barbers
export interface PublicBarber {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  bio: string | null;
  specialty: string | null;
  experienceYears: number | null;
  photoUrl: string | null;
  instagram: string | null;
  serviceIds: string[];
}

// GET /api/availability
export interface AvailabilitySlot {
  startsAt: string;
  /** Майстри, вільні в цей час (якщо майстра не обрано) */
  barberIds: string[];
}
export interface Availability {
  date: string;
  durationMin: number;
  slots: AvailabilitySlot[];
}

// POST /api/bookings, GET /api/bookings/manage/:token
export interface BookingDetails {
  id: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  barber: { id: string; name: string };
  service: { id: string; name: string };
  customerName: string;
  /** Чи може клієнт ще скасувати або перенести запис сам */
  canChange: boolean;
}
export interface BookingCreated extends BookingDetails {
  /** Секрет для посилання «керувати записом». Повертається лише один раз. */
  manageToken: string;
}

// GET /api/reviews
export interface PublicReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  barberName: string | null;
  createdAt: string;
}
export interface ReviewsSummary {
  average: number | null;
  count: number;
  items: PublicReview[];
}

// ---------- Адмінка ----------

export interface AuthToken {
  accessToken: string;
  /** Секунди до закінчення дії токена */
  expiresIn: number;
}

export interface Me {
  id: string;
  email: string;
  role: Role;
  barberId: string | null;
}

export interface AdminBooking {
  id: string;
  status: BookingStatus;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  comment: string | null;
  barber: { id: string; name: string };
  service: { id: string; name: string };
  customer: { id: string; name: string; phone: string };
  createdAt: string;
}

export interface AdminService extends PublicService {
  isActive: boolean;
  sortOrder: number;
  categoryId: string | null;
}

export interface AdminCategory {
  id: string;
  name: string;
}

export interface AdminBarber extends PublicBarber {
  isActive: boolean;
  sortOrder: number;
  experienceSince: number | null;
  workingHours: { weekday: number; startMin: number; endMin: number }[];
  timeOff: { id: string; startsAt: string; endsAt: string; reason: string | null }[];
}

export interface AdminReview extends PublicReview {
  isPublished: boolean;
}
