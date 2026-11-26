import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { addDays, utcToZoned, weekdayOf } from '@barbershop/shared';
import { AppModule } from '../src/app.module.js';
import { isBookingOverlap } from '../src/common/prisma-errors.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { configureApp } from '../src/setup.js';

// Працює з базою з DATABASE_URL (npm run db:start && npm run db:migrate).
// Створює власні дані з префіксом e2e- і прибирає їх після себе.

const run = `e2e-${Date.now().toString(36)}`;

describe('Booking flow (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let http: ReturnType<typeof request>;
  let serviceId: string;
  let barberA: string;
  let barberB: string;
  let date: string;
  let barberToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PasswordHasher)
      .useValue(new PasswordHasher({ logN: 10 }))
      .compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
    http = request(app.getHttpServer());
    prisma = app.get(PrismaService);

    // Дата через 3 дні, щоб усі слоти були в майбутньому
    date = addDays(utcToZoned(new Date()).date, 3);
    const weekday = weekdayOf(date);
    const service = await prisma.service.create({
      data: {
        slug: `${run}-cut`,
        name: 'E2E стрижка',
        durationMin: 60,
        priceCents: 50000,
      },
    });
    serviceId = service.id;
    const mk = (n: string) =>
      prisma.barber.create({
        data: {
          slug: `${run}-${n}`,
          name: `E2E ${n}`,
          sortOrder: 999,
          services: { create: { serviceId } },
          workingHours: { create: { weekday, startMin: 600, endMin: 840 } }, // 10:00–14:00
        },
      });
    barberA = (await mk('a')).id;
    barberB = (await mk('b')).id;

    const hasher = app.get(PasswordHasher);
    const barberUser = await prisma.user.create({
      data: {
        email: `${run}-barber@example.com`,
        passwordHash: await hasher.hash('barber-pass-123'),
        role: 'BARBER',
        barber: { connect: { id: barberA } },
      },
    });
    const adminUser = await prisma.user.create({
      data: {
        email: `${run}-admin@example.com`,
        passwordHash: await hasher.hash('admin-pass-123'),
        role: 'ADMIN',
      },
    });
    const tokens = app.get(TokenService);
    barberToken = (await tokens.issue(barberUser.id)).accessToken;
    adminToken = (await tokens.issue(adminUser.id)).accessToken;
  });

  afterAll(async () => {
    const barberIds = [barberA, barberB].filter(Boolean);
    await prisma.booking.deleteMany({ where: { barberId: { in: barberIds } } });
    await prisma.customer.deleteMany({
      where: { name: { startsWith: 'E2E' } },
    });
    await prisma.user.deleteMany({ where: { email: { startsWith: run } } });
    await prisma.barber.deleteMany({ where: { id: { in: barberIds } } });
    await prisma.service.deleteMany({ where: { slug: { startsWith: run } } });
    await app.close();
  });

  const book = (barberId: string, startsAt: string, phone = '067 000 00 01') =>
    http.post('/api/bookings').send({
      barberId,
      serviceId,
      startsAt,
      customerName: 'E2E Клієнт',
      customerPhone: phone,
    });

  it('lists free slots for every barber who does the service', async () => {
    const res = await http
      .get('/api/availability')
      .query({ serviceId, date })
      .expect(200);
    // 10:00–14:00, послуга 60 хв, крок 15: від 10:00 до 13:00 включно
    expect(res.body.slots).toHaveLength(13);
    expect(res.body.slots[0].barberIds.sort()).toEqual(
      [barberA, barberB].sort(),
    );
  });

  it('books a slot, then refuses an overlapping one with 409', async () => {
    const { body: avail } = await http
      .get('/api/availability')
      .query({ serviceId, date, barberId: barberA });
    const first = avail.slots[0].startsAt;
    const created = await book(barberA, first).expect(201);
    expect(created.body).toMatchObject({
      status: 'PENDING',
      priceCents: 50000,
      canChange: true,
    });
    expect(created.body.manageToken).toMatch(/^[A-Za-z0-9_-]{43}$/);

    // 10:30 перетинається з 10:00–11:00
    await book(barberA, avail.slots[2].startsAt, '067 000 00 02').expect(409);
    // Інший майстер у той самий час вільний
    await book(barberB, first, '067 000 00 03').expect(201);

    const after = await http
      .get('/api/availability')
      .query({ serviceId, date, barberId: barberA });
    expect(
      after.body.slots.map((s: { startsAt: string }) => s.startsAt),
    ).not.toContain(first);
  });

  it('lets only one of several simultaneous requests take a slot', async () => {
    const { body: avail } = await http
      .get('/api/availability')
      .query({ serviceId, date, barberId: barberB });
    const slot = avail.slots.at(-1).startsAt;
    const results = await Promise.all(
      [1, 2, 3, 4].map((i) => book(barberB, slot, `067 000 01 0${i}`)),
    );
    expect(results.map((r) => r.status).sort((a, b) => a - b)).toEqual([
      201, 409, 409, 409,
    ]);
  });

  it('is backed by the database: overlapping inserts violate the exclusion constraint', async () => {
    const customer = await prisma.customer.create({
      data: { name: 'E2E direct', phone: `+${Date.now()}` },
    });
    const base = {
      barberId: barberA,
      serviceId,
      customerId: customer.id,
      priceCents: 1,
    };
    const startsAt = new Date(`${addDays(date, 1)}T08:00:00Z`);
    await prisma.booking.create({
      data: {
        ...base,
        startsAt,
        endsAt: new Date(startsAt.getTime() + 3600_000),
        manageTokenHash: `${run}-1`,
      },
    });
    const clash = prisma.booking.create({
      data: {
        ...base,
        startsAt: new Date(startsAt.getTime() + 1800_000),
        endsAt: new Date(startsAt.getTime() + 5400_000),
        manageTokenHash: `${run}-2`,
      },
    });
    await expect(clash).rejects.toSatisfy(isBookingOverlap);
  });

  it('manages a booking by its secret link: view, reschedule, cancel', async () => {
    const { body: avail } = await http
      .get('/api/availability')
      .query({ serviceId, date, barberId: barberB });
    const created = await book(
      barberB,
      avail.slots[0].startsAt,
      '067 000 02 01',
    ).expect(201);
    const token = created.body.manageToken;

    await http.get(`/api/bookings/manage/${token}`).expect(200);
    await http.get(`/api/bookings/manage/${'x'.repeat(43)}`).expect(404);

    const { body: free } = await http
      .get('/api/availability')
      .query({ serviceId, date, barberId: barberB });
    // Перенесення на 15 хвилин пізніше перетинається лише з самим собою: дозволено
    const moved = await http
      .post(`/api/bookings/manage/${token}/reschedule`)
      .send({
        startsAt: new Date(
          new Date(created.body.startsAt).getTime() + 15 * 60_000,
        ).toISOString(),
      });
    expect(moved.status, JSON.stringify(free)).toBe(200);

    const cancelled = await http
      .post(`/api/bookings/manage/${token}/cancel`)
      .expect(200);
    expect(cancelled.body).toMatchObject({
      status: 'CANCELLED',
      canChange: false,
    });
    await http.post(`/api/bookings/manage/${token}/cancel`).expect(409);
  });

  it('rejects bad input and bots', async () => {
    await http.post('/api/bookings').send({ barberId: barberA }).expect(400);
    const { body: avail } = await http
      .get('/api/availability')
      .query({ serviceId, date, barberId: barberA });
    await http
      .post('/api/bookings')
      .send({
        barberId: barberA,
        serviceId,
        startsAt: avail.slots.at(-1).startsAt,
        customerName: 'E2E Бот',
        customerPhone: '0670000000',
        website: 'spam',
      })
      .expect(400);
  });

  describe('admin', () => {
    it('requires sign-in', async () => {
      await http
        .get('/api/admin/bookings')
        .query({ from: date, to: date })
        .expect(401);
      await http
        .post('/api/auth/login')
        .send({ email: `${run}-admin@example.com`, password: 'nope' })
        .expect(401);
      const login = await http
        .post('/api/auth/login')
        .send({ email: `${run}-ADMIN@example.com`, password: 'admin-pass-123' })
        .expect(200);
      const me = await http
        .get('/api/auth/me')
        .auth(login.body.accessToken, { type: 'bearer' })
        .expect(200);
      expect(me.body.role).toBe('ADMIN');
    });

    it('shows a barber only their own bookings, an admin all of them', async () => {
      const mine = await http
        .get('/api/admin/bookings')
        .query({ from: date, to: date, barberId: barberB })
        .auth(barberToken, { type: 'bearer' })
        .expect(200);
      expect(mine.body.length).toBeGreaterThan(0);
      expect(
        mine.body.every(
          (b: { barber: { id: string } }) => b.barber.id === barberA,
        ),
      ).toBe(true);

      const all = await http
        .get('/api/admin/bookings')
        .query({ from: date, to: date })
        .auth(adminToken, { type: 'bearer' })
        .expect(200);
      const ids = new Set(
        all.body.map((b: { barber: { id: string } }) => b.barber.id),
      );
      expect(ids.has(barberA) && ids.has(barberB)).toBe(true);
    });

    it('lets a barber change only their own bookings and schedule', async () => {
      const { body } = await http
        .get('/api/admin/bookings')
        .query({ from: date, to: date })
        .auth(adminToken, { type: 'bearer' });
      const own = body.find(
        (b: { barber: { id: string } }) => b.barber.id === barberA,
      );
      const other = body.find(
        (b: { barber: { id: string }; status: string }) =>
          b.barber.id === barberB && b.status === 'PENDING',
      );

      await http
        .patch(`/api/admin/bookings/${own.id}/status`)
        .send({ status: 'CONFIRMED' })
        .auth(barberToken, { type: 'bearer' })
        .expect(200);
      await http
        .patch(`/api/admin/bookings/${other.id}/status`)
        .send({ status: 'CONFIRMED' })
        .auth(barberToken, { type: 'bearer' })
        .expect(403);

      await http
        .put(`/api/admin/barbers/${barberB}/hours`)
        .send([{ weekday: 1, startMin: 600, endMin: 720 }])
        .auth(barberToken, { type: 'bearer' })
        .expect(403);
      await http
        .post('/api/admin/services')
        .send({
          slug: `${run}-x`,
          name: 'Нова',
          durationMin: 30,
          priceCents: 100,
        })
        .auth(barberToken, { type: 'bearer' })
        .expect(403);
      await http
        .post('/api/admin/services')
        .send({
          slug: `${run}-x`,
          name: 'Нова',
          durationMin: 30,
          priceCents: 100,
        })
        .auth(adminToken, { type: 'bearer' })
        .expect(201);
    });

    it('does not allow reviving a cancelled booking', async () => {
      const { body } = await http
        .get('/api/admin/bookings')
        .query({ from: date, to: date, status: 'CANCELLED' })
        .auth(adminToken, { type: 'bearer' });
      await http
        .patch(`/api/admin/bookings/${body[0].id}/status`)
        .send({ status: 'CONFIRMED' })
        .auth(adminToken, { type: 'bearer' })
        .expect(409);
    });
  });
});
