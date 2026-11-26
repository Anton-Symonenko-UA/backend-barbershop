import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AdminCategory,
  AdminService,
  PublicService,
  ServiceUpsertInput,
} from '@barbershop/shared';
import { isNotFound, isUniqueViolation } from '../common/prisma-errors.js';
import { PrismaService } from '../prisma/prisma.service.js';

const orderBy = [
  { category: { sortOrder: 'asc' } },
  { sortOrder: 'asc' },
  { priceCents: 'asc' },
] as const;

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number;
  isActive: boolean;
  sortOrder: number;
  categoryId: string | null;
  category: { name: string } | null;
};

const toPublic = (s: Row): PublicService => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  description: s.description,
  durationMin: s.durationMin,
  priceCents: s.priceCents,
  category: s.category?.name ?? null,
});

const toAdmin = (s: Row): AdminService => ({
  ...toPublic(s),
  isActive: s.isActive,
  sortOrder: s.sortOrder,
  categoryId: s.categoryId,
});

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(): Promise<PublicService[]> {
    const rows = await this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: [...orderBy],
      include: { category: { select: { name: true } } },
    });
    return rows.map(toPublic);
  }

  async listAdmin(): Promise<AdminService[]> {
    const rows = await this.prisma.service.findMany({
      orderBy: [...orderBy],
      include: { category: { select: { name: true } } },
    });
    return rows.map(toAdmin);
  }

  async listCategories(): Promise<AdminCategory[]> {
    return this.prisma.serviceCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    });
  }

  async create(data: ServiceUpsertInput): Promise<AdminService> {
    try {
      const row = await this.prisma.service.create({
        data,
        include: { category: { select: { name: true } } },
      });
      return toAdmin(row);
    } catch (e) {
      if (isUniqueViolation(e))
        throw new ConflictException('Такий slug уже зайнятий');
      throw e;
    }
  }

  async update(
    id: string,
    data: Partial<ServiceUpsertInput>,
  ): Promise<AdminService> {
    try {
      const row = await this.prisma.service.update({
        where: { id },
        data,
        include: { category: { select: { name: true } } },
      });
      return toAdmin(row);
    } catch (e) {
      if (isNotFound(e)) throw new NotFoundException('Послугу не знайдено');
      if (isUniqueViolation(e))
        throw new ConflictException('Такий slug уже зайнятий');
      throw e;
    }
  }
}
