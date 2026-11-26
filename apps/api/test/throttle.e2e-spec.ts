import 'dotenv/config';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/setup.js';

describe('Rate limits (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    process.env.THROTTLE_IN_TESTS = 'true';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    delete process.env.THROTTLE_IN_TESTS;
    await app.close();
  });

  it('limits sign-in attempts to 5 per 15 minutes', async () => {
    const http = request(app.getHttpServer());
    const attempt = () =>
      http
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'x' });
    for (let i = 0; i < 5; i++) await attempt().expect(401);
    const blocked = await attempt().expect(429);
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
  });
});
