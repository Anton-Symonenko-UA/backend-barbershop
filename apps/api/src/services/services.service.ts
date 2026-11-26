import { Injectable } from '@nestjs/common';
import type { PublicService } from '@barbershop/shared';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(): Promise<PublicService[]> {
    const rows = await this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
        { priceCents: 'asc' },
      ],
      include: { category: { select: { name: true } } },
    });
    return rows.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      description: s.description,
      durationMin: s.durationMin,
      priceCents: s.priceCents,
      category: s.category?.name ?? null,
    }));
  }
}
