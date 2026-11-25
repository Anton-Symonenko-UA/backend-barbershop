import { validateEnv } from './env.js';

const base = {
  DATABASE_URL: 'postgresql://u:p@localhost:5432/db',
  AUTH_SECRET: 'x'.repeat(32),
};

describe('validateEnv', () => {
  it('applies defaults', () => {
    const env = validateEnv(base);
    expect(env.PORT).toBe(4000);
    expect(env.NODE_ENV).toBe('development');
  });

  it('rejects a short AUTH_SECRET', () => {
    expect(() => validateEnv({ ...base, AUTH_SECRET: 'short' })).toThrow(
      /AUTH_SECRET/,
    );
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => validateEnv({ AUTH_SECRET: base.AUTH_SECRET })).toThrow(
      /DATABASE_URL/,
    );
  });
});
