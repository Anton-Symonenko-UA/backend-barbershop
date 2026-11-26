import { PUBLIC_API_URL, SERVER_API_URL } from '@/lib/config';

// Тонкий клієнт для бекенду (apps/api). Працює і на сервері, і в браузері.

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
  }
}

const baseUrl = () => (typeof window === 'undefined' ? SERVER_API_URL : PUBLIC_API_URL);

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    signal: init?.signal ?? AbortSignal.timeout(10_000),
  });
  const body = res.status === 204 ? undefined : await res.json().catch(() => undefined);
  if (!res.ok) {
    const raw = (body as { message?: string | string[] } | undefined)?.message;
    const message = Array.isArray(raw) ? raw.join('; ') : (raw ?? res.statusText);
    throw new ApiError(res.status, message, body);
  }
  return body as T;
}

/** Текст помилки для людини: повідомлення API або загальне. */
export function errorMessage(error: unknown, fallback = 'Щось пішло не так. Спробуйте ще раз.') {
  if (error instanceof ApiError) {
    if (error.status === 429) return 'Забагато спроб. Зачекайте кілька хвилин.';
    if (error.status >= 500) return fallback;
    return error.message || fallback;
  }
  return fallback;
}
