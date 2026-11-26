import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import type { Env } from '../config/env.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  BookingEvent,
  type BookingEventPayload,
} from '../bookings/booking.events.js';
import { ReviewEvent } from '../reviews/reviews.service.js';
import { formatDateTime, formatPrice } from './format.js';
import { SmsClient } from './sms.client.js';
import { escapeHtml, TelegramClient } from './telegram.client.js';

const STATUS_TITLE: Record<BookingEventPayload['event'], string> = {
  [BookingEvent.Created]: '🆕 Новий запис',
  [BookingEvent.Cancelled]: '❌ Запис скасовано',
  [BookingEvent.Rescheduled]: '🔁 Запис перенесено',
};

// Сповіщення не повинні ламати запис: помилки ловимо й логуємо тут.
@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);
  private readonly webOrigin: string;
  private readonly shopName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegram: TelegramClient,
    private readonly sms: SmsClient,
    config: ConfigService<Env, true>,
  ) {
    this.webOrigin = config.get('WEB_ORIGIN', { infer: true });
    this.shopName = config.get('SHOP_NAME', { infer: true });
  }

  @OnEvent(
    [BookingEvent.Created, BookingEvent.Cancelled, BookingEvent.Rescheduled],
    { async: true },
  )
  async onBookingChange(payload: BookingEventPayload) {
    try {
      await this.notifyStaff(payload);
    } catch (e) {
      this.logger.warn(`Staff notification failed: ${(e as Error).message}`);
    }
  }

  @OnEvent(BookingEvent.Created, { async: true })
  async onBookingCreated(payload: BookingEventPayload) {
    if (!this.sms.enabled || !payload.manageToken) return;
    try {
      const b = await this.booking(payload.bookingId);
      if (!b) return;
      await this.sms.send(
        b.customer.phone,
        `${this.shopName}: ви записані ${formatDateTime(b.startsAt)} до ${b.barber.name}. ` +
          `Змінити чи скасувати: ${this.webOrigin}/booking/${payload.manageToken}`,
      );
    } catch (e) {
      this.logger.warn(`Confirmation SMS failed: ${(e as Error).message}`);
    }
  }

  @OnEvent(ReviewEvent.Created, { async: true })
  async onReview({ reviewId }: { reviewId: string }) {
    try {
      const r = await this.prisma.review.findUnique({
        where: { id: reviewId },
      });
      if (!r) return;
      await this.telegram.send(
        `⭐ Новий відгук ${'★'.repeat(r.rating)}\n<b>${escapeHtml(r.authorName)}</b>: ${escapeHtml(r.text.slice(0, 300))}\n` +
          `Опублікувати: ${this.webOrigin}/admin/reviews`,
      );
    } catch (e) {
      this.logger.warn(`Review notification failed: ${(e as Error).message}`);
    }
  }

  private async notifyStaff(payload: BookingEventPayload) {
    if (!this.telegram.enabled) return;
    const b = await this.booking(payload.bookingId);
    if (!b) return;
    const lines = [
      `<b>${STATUS_TITLE[payload.event]}</b>${payload.by === 'customer' ? ' (клієнт)' : ''}`,
      `🗓 ${formatDateTime(b.startsAt)}`,
      `✂️ ${escapeHtml(b.service.name)}, ${formatPrice(b.priceCents)}`,
      `💈 ${escapeHtml(b.barber.name)}`,
      `👤 ${escapeHtml(b.customer.name)}, ${b.customer.phone}`,
    ];
    if (b.comment) lines.push(`💬 ${escapeHtml(b.comment)}`);
    await this.telegram.send(lines.join('\n'));
  }

  private booking(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
      select: {
        startsAt: true,
        priceCents: true,
        comment: true,
        barber: { select: { name: true } },
        service: { select: { name: true } },
        customer: { select: { name: true, phone: true } },
      },
    });
  }
}
