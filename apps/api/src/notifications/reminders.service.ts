import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { Env } from '../config/env.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { formatDateTime } from './format.js';
import { SmsClient } from './sms.client.js';

// Нагадування за добу до візиту. Тим, хто записався менш ніж за 6 годин, не надсилаємо.
const REMIND_BEFORE_MIN = 24 * 60;
const MIN_ADVANCE_MIN = 6 * 60;

@Injectable()
export class RemindersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RemindersService.name);
  private readonly shopName: string;
  private readonly shopPhone: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsClient,
    config: ConfigService<Env, true>,
  ) {
    this.shopName = config.get('SHOP_NAME', { infer: true });
    this.shopPhone = config.get('SHOP_PHONE', { infer: true });
  }

  onApplicationBootstrap() {
    if (!this.sms.enabled)
      this.logger.log('TURBOSMS_TOKEN не задано: SMS-нагадування вимкнені');
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async run(now = new Date()): Promise<number> {
    if (!this.sms.enabled) return 0;
    const due = await this.prisma.booking.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        reminderSentAt: null,
        startsAt: {
          gt: now,
          lte: new Date(now.getTime() + REMIND_BEFORE_MIN * 60_000),
        },
      },
      select: {
        id: true,
        startsAt: true,
        createdAt: true,
        barber: { select: { name: true } },
        customer: { select: { phone: true } },
      },
      take: 100,
    });

    let sent = 0;
    for (const b of due) {
      if (
        b.startsAt.getTime() - b.createdAt.getTime() <
        MIN_ADVANCE_MIN * 60_000
      )
        continue;
      // Атомарно «забираємо» нагадування: при кількох інстансах API SMS піде лише раз
      const { count } = await this.prisma.booking.updateMany({
        where: { id: b.id, reminderSentAt: null },
        data: { reminderSentAt: now },
      });
      if (count === 0) continue;
      try {
        await this.sms.send(
          b.customer.phone,
          `${this.shopName}: нагадуємо про візит ${formatDateTime(b.startsAt)} до ${b.barber.name}. ` +
            `Якщо плани змінились, зателефонуйте ${this.shopPhone}`,
        );
        sent++;
      } catch (e) {
        // Не вдалося: знімаємо позначку, наступний запуск спробує ще раз
        await this.prisma.booking.update({
          where: { id: b.id },
          data: { reminderSentAt: null },
        });
        this.logger.warn(`Reminder SMS failed: ${(e as Error).message}`);
      }
    }
    return sent;
  }
}
