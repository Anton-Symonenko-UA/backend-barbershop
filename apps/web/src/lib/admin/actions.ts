'use server';

import {
  BOOKING_STATUSES,
  barberUpdateSchema,
  loginSchema,
  serviceUpsertSchema,
  timeOffCreateSchema,
  workingHoursSchema,
  zonedToUtc,
  type AuthToken,
  type BookingStatus,
} from '@barbershop/shared';
import { refresh, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { ApiError } from '@/lib/api';
import { SERVER_API_URL } from '@/lib/config';
import { adminApi, clearAdminToken, setAdminToken } from './session';

// Server Actions адмінки. Кожна сама перевіряє вхід (zod) і авторизується токеном
// із cookie: права перевіряє API, тут лише передаємо запит і оновлюємо кеш сторінок.

export type ActionState = { ok: boolean; message: string } | null;

const fail = (e: unknown): ActionState => ({
  ok: false,
  message:
    e instanceof ApiError
      ? e.status === 403
        ? 'Недостатньо прав'
        : e.message
      : 'Не вдалося зберегти. Спробуйте ще раз.',
});

const issues = (e: z.ZodError): ActionState => ({
  ok: false,
  message: e.issues.map((i) => i.message).join('; '),
});

const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
};

/** "09:30" → 570 */
const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// ---------- Вхід ----------

export async function login(_: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: fd.get('email'), password: fd.get('password') });
  if (!parsed.success) return issues(parsed.error);
  const res = await fetch(`${SERVER_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
    cache: 'no-store',
  }).catch(() => null);
  if (!res) return { ok: false, message: 'Сервер недоступний' };
  if (res.status === 429) return { ok: false, message: 'Забагато спроб. Зачекайте 15 хвилин.' };
  if (!res.ok) return { ok: false, message: 'Невірний email або пароль' };
  const token = (await res.json()) as AuthToken;
  await setAdminToken(token.accessToken, token.expiresIn);
  const next = str(fd, 'next');
  // Лише внутрішні шляхи адмінки: не даємо зробити open redirect
  redirect(next && /^\/admin(\/[\w-]*)*$/.test(next) ? next : '/admin/bookings');
}

export async function logout() {
  await clearAdminToken();
  redirect('/admin/login');
}

// ---------- Записи ----------

export async function setBookingStatus(id: string, status: BookingStatus): Promise<ActionState> {
  if (!BOOKING_STATUSES.includes(status)) return { ok: false, message: 'Невідомий статус' };
  try {
    await adminApi(`/admin/bookings/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (e) {
    return fail(e);
  }
  refresh();
  return { ok: true, message: 'Статус оновлено' };
}

// ---------- Послуги ----------

export async function saveService(_: ActionState, fd: FormData): Promise<ActionState> {
  const id = str(fd, 'id');
  const price = Number(String(fd.get('price') ?? '').replace(',', '.'));
  const parsed = serviceUpsertSchema.safeParse({
    slug: fd.get('slug'),
    name: fd.get('name'),
    description: str(fd, 'description'),
    durationMin: fd.get('durationMin'),
    priceCents: Number.isFinite(price) ? Math.round(price * 100) : NaN,
    categoryId: str(fd, 'categoryId'),
    isActive: fd.get('isActive') === 'on',
    sortOrder: fd.get('sortOrder') || 0,
  });
  if (!parsed.success) return issues(parsed.error);
  try {
    await adminApi(id ? `/admin/services/${encodeURIComponent(id)}` : '/admin/services', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(parsed.data),
    });
  } catch (e) {
    return fail(e);
  }
  updateTag('services');
  refresh();
  return { ok: true, message: id ? 'Послугу збережено' : 'Послугу додано' };
}

// ---------- Майстри ----------

export async function saveBarber(_: ActionState, fd: FormData): Promise<ActionState> {
  const id = str(fd, 'id');
  const parsed = barberUpdateSchema.safeParse({
    slug: fd.get('slug'),
    name: fd.get('name'),
    title: str(fd, 'title'),
    specialty: str(fd, 'specialty'),
    bio: str(fd, 'bio'),
    experienceSince: str(fd, 'experienceSince'),
    photoUrl: str(fd, 'photoUrl'),
    instagram: str(fd, 'instagram'),
    isActive: fd.get('isActive') === 'on',
    sortOrder: fd.get('sortOrder') || 0,
    serviceIds: fd.getAll('serviceIds').map(String),
  });
  if (!parsed.success) return issues(parsed.error);
  try {
    await adminApi(id ? `/admin/barbers/${encodeURIComponent(id)}` : '/admin/barbers', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(parsed.data),
    });
  } catch (e) {
    return fail(e);
  }
  updateTag('barbers');
  refresh();
  return { ok: true, message: 'Майстра збережено' };
}

export async function saveHours(_: ActionState, fd: FormData): Promise<ActionState> {
  const barberId = String(fd.get('barberId'));
  const days = [0, 1, 2, 3, 4, 5, 6]
    .filter((d) => fd.get(`on-${d}`) === 'on')
    .map((weekday) => ({
      weekday,
      startMin: toMinutes(String(fd.get(`start-${weekday}`) ?? '')),
      endMin: toMinutes(String(fd.get(`end-${weekday}`) ?? '')),
    }));
  const parsed = workingHoursSchema.safeParse(days);
  if (!parsed.success) return issues(parsed.error);
  try {
    await adminApi(`/admin/barbers/${encodeURIComponent(barberId)}/hours`, {
      method: 'PUT',
      body: JSON.stringify(parsed.data),
    });
  } catch (e) {
    return fail(e);
  }
  refresh();
  return { ok: true, message: 'Графік збережено' };
}

export async function addTimeOff(_: ActionState, fd: FormData): Promise<ActionState> {
  const barberId = String(fd.get('barberId'));
  const from = str(fd, 'from');
  const to = str(fd, 'to') ?? from;
  if (!from || !to) return { ok: false, message: 'Вкажіть дати' };
  // Дати з форми: цілі дні за київським часом, «до» включно
  const end = new Date(zonedToUtc(to, 0).getTime() + 24 * 3600_000);
  const parsed = timeOffCreateSchema.safeParse({
    startsAt: zonedToUtc(from, 0).toISOString(),
    endsAt: end.toISOString(),
    reason: str(fd, 'reason') ?? undefined,
  });
  if (!parsed.success) return issues(parsed.error);
  try {
    await adminApi(`/admin/barbers/${encodeURIComponent(barberId)}/time-off`, {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    });
  } catch (e) {
    return fail(e);
  }
  refresh();
  return { ok: true, message: 'Вихідні додано' };
}

export async function removeTimeOff(barberId: string, timeOffId: string): Promise<ActionState> {
  try {
    await adminApi(
      `/admin/barbers/${encodeURIComponent(barberId)}/time-off/${encodeURIComponent(timeOffId)}`,
      { method: 'DELETE' },
    );
  } catch (e) {
    return fail(e);
  }
  refresh();
  return { ok: true, message: 'Вихідні видалено' };
}

// ---------- Відгуки ----------

export async function setReviewPublished(id: string, isPublished: boolean): Promise<ActionState> {
  try {
    await adminApi(`/admin/reviews/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    });
  } catch (e) {
    return fail(e);
  }
  updateTag('reviews');
  refresh();
  return { ok: true, message: isPublished ? 'Опубліковано' : 'Приховано' };
}

export async function deleteReview(id: string): Promise<ActionState> {
  try {
    await adminApi(`/admin/reviews/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (e) {
    return fail(e);
  }
  updateTag('reviews');
  refresh();
  return { ok: true, message: 'Відгук видалено' };
}
