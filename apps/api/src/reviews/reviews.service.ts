import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type {
  AdminReview,
  PublicReview,
  ReviewCreateInput,
  ReviewsSummary,
} from '@barbershop/shared';
import { isNotFound } from '../common/prisma-errors.js';
import { PrismaService } from '../prisma/prisma.service.js';

export const ReviewEvent = { Created: 'review.created' } as const;

const select = {
  id: true,
  authorName: true,
  rating: true,
  text: true,
  isPublished: true,
  createdAt: true,
  barber: { select: { name: true } },
} as const;

type Row = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  isPublished: boolean;
  createdAt: Date;
  barber: { name: string } | null;
};

const toPublic = (r: Row): PublicReview => ({
  id: r.id,
  authorName: r.authorName,
  rating: r.rating,
  text: r.text,
  barberName: r.barber?.name ?? null,
  createdAt: r.createdAt.toISOString(),
});

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async summary(limit = 12): Promise<ReviewsSummary> {
    const where = { isPublished: true };
    const [rows, agg] = await Promise.all([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select,
      }),
      this.prisma.review.aggregate({
        where,
        _avg: { rating: true },
        _count: true,
      }),
    ]);
    return {
      average:
        agg._avg.rating === null ? null : Math.round(agg._avg.rating * 10) / 10,
      count: agg._count,
      items: rows.map(toPublic),
    };
  }

  /** Відгук із сайту: потрапляє на модерацію, на сайті з’явиться після публікації. */
  async submit(input: ReviewCreateInput): Promise<{ ok: true }> {
    if (input.website) throw new BadRequestException();
    const barberId = input.barberId
      ? ((
          await this.prisma.barber.findUnique({
            where: { id: input.barberId },
            select: { id: true },
          })
        )?.id ?? null)
      : null;
    const row = await this.prisma.review.create({
      data: {
        authorName: input.authorName,
        rating: input.rating,
        text: input.text,
        barberId,
      },
      select: { id: true },
    });
    this.events.emit(ReviewEvent.Created, { reviewId: row.id });
    return { ok: true };
  }

  async listAdmin(): Promise<AdminReview[]> {
    const rows = await this.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      select,
    });
    return rows.map((r) => ({ ...toPublic(r), isPublished: r.isPublished }));
  }

  async setPublished(id: string, isPublished: boolean): Promise<AdminReview> {
    try {
      const r = await this.prisma.review.update({
        where: { id },
        data: { isPublished },
        select,
      });
      return { ...toPublic(r), isPublished: r.isPublished };
    } catch (e) {
      if (isNotFound(e)) throw new NotFoundException('Відгук не знайдено');
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    const { count } = await this.prisma.review.deleteMany({ where: { id } });
    if (count === 0) throw new NotFoundException('Відгук не знайдено');
  }
}
