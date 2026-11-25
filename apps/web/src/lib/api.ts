// Тонкий клієнт для бекенду (apps/api). Працює і на сервері, і в браузері.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = res.status === 204 ? undefined : await res.json().catch(() => undefined);
  if (!res.ok) {
    const message = (body as { message?: string } | undefined)?.message ?? res.statusText;
    throw new ApiError(res.status, message, body);
  }
  return body as T;
}
