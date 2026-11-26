import { createHash, randomBytes } from 'node:crypto';

// Посилання «керувати записом» без акаунта: у клієнта токен, у базі лише його SHA-256.
export function createManageToken() {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashManageToken(token) };
}

export function hashManageToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
