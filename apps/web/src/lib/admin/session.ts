import 'server-only';
import type { Me } from '@barbershop/shared';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ApiError } from '@/lib/api';
import { SERVER_API_URL } from '@/lib/config';

// Токен персоналу живе лише в httpOnly-cookie: JavaScript у браузері його не бачить,
// а всі запити до адмінського API йдуть із сервера Next.

export const ADMIN_COOKIE = 'kremen_admin';

export async function getAdminToken() {
  return (await cookies()).get(ADMIN_COOKIE)?.value ?? null;
}

export async function setAdminToken(token: string, maxAgeSec: number) {
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSec,
  });
}

export async function clearAdminToken() {
  (await cookies()).delete(ADMIN_COOKIE);
}

/** Запит до API від імені персоналу. Без токена або з простроченим веде на сторінку входу. */
export async function adminApi<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAdminToken();
  if (!token) redirect('/admin/login');
  const res = await fetch(`${SERVER_API_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 401) redirect('/admin/login?expired=1');
  const body = res.status === 204 ? undefined : await res.json().catch(() => undefined);
  if (!res.ok) {
    const raw = (body as { message?: string | string[] } | undefined)?.message;
    throw new ApiError(
      res.status,
      Array.isArray(raw) ? raw.join('; ') : (raw ?? res.statusText),
      body,
    );
  }
  return body as T;
}

export function getMe() {
  return adminApi<Me>('/auth/me');
}
