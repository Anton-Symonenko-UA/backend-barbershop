import type { ConfigService } from '@nestjs/config';
import type { PrismaService } from '../prisma/prisma.service.js';
import { RemindersService } from './reminders.service.js';
import type { SmsClient } from './sms.client.js';

const now = new Date('2026-01-15T10:00:00Z');
const hours = (h: number) => new Date(now.getTime() + h * 3600_000);

function setup(
  rows: { id: string; startsAt: Date; createdAt: Date }[],
  claimed = 1,
) {
  const prisma = {
    booking: {
      findMany: vi.fn().mockResolvedValue(
        rows.map((r) => ({
          ...r,
          barber: { name: 'Денис' },
          customer: { phone: '+380670000000' },
        })),
      ),
      updateMany: vi.fn().mockResolvedValue({ count: claimed }),
      update: vi.fn().mockResolvedValue({}),
    },
  };
  const sms = { enabled: true, send: vi.fn().mockResolvedValue(undefined) };
  const config = {
    get: (key: string) => (key === 'SHOP_NAME' ? 'KREMEN' : '+380670000000'),
  };
  const service = new RemindersService(
    prisma as unknown as PrismaService,
    sms as unknown as SmsClient,
    config as unknown as ConfigService<never, true>,
  );
  return { service, prisma, sms };
}

describe('RemindersService', () => {
  it('reminds about bookings made in advance, once', async () => {
    const { service, prisma, sms } = setup([
      { id: 'early', startsAt: hours(20), createdAt: hours(-48) },
      { id: 'last-minute', startsAt: hours(4), createdAt: hours(-1) },
    ]);
    await expect(service.run(now)).resolves.toBe(1);
    expect(sms.send).toHaveBeenCalledTimes(1);
    expect(sms.send.mock.calls[0][1]).toContain('Денис');
    // Атомарне «забирання»: умова reminderSentAt: null
    expect(prisma.booking.updateMany).toHaveBeenCalledWith({
      where: { id: 'early', reminderSentAt: null },
      data: { reminderSentAt: now },
    });
  });

  it('skips a booking another instance already claimed', async () => {
    const { service, sms } = setup(
      [{ id: 'b', startsAt: hours(20), createdAt: hours(-48) }],
      0,
    );
    await expect(service.run(now)).resolves.toBe(0);
    expect(sms.send).not.toHaveBeenCalled();
  });

  it('releases the claim when the SMS fails, so the next run retries', async () => {
    const { service, prisma, sms } = setup([
      { id: 'b', startsAt: hours(20), createdAt: hours(-48) },
    ]);
    sms.send.mockRejectedValue(new Error('down'));
    await expect(service.run(now)).resolves.toBe(0);
    expect(prisma.booking.update).toHaveBeenCalledWith({
      where: { id: 'b' },
      data: { reminderSentAt: null },
    });
  });
});
