import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  AdminBarber,
  BarberUpsertInput,
  PublicBarber,
  TimeOffCreateInput,
  WorkingHoursInput,
} from '@barbershop/shared';
import { isNotFound, isUniqueViolation } from '../common/prisma-errors.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  adminBarberSelect,
  publicBarberSelect,
  toAdminBarber,
  toPublicBarber,
} from './barbers.mapper.js';

@Injectable()
export class BarbersService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(): Promise<PublicBarber[]> {
    const rows = await this.prisma.barber.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        ...publicBarberSelect,
        services: {
          where: { service: { isActive: true } },
          select: { serviceId: true },
        },
      },
    });
    return rows.map((r) => toPublicBarber(r));
  }

  async findPublic(slug: string): Promise<PublicBarber> {
    const row = await this.prisma.barber.findFirst({
      where: { slug, isActive: true },
      select: publicBarberSelect,
    });
    if (!row) throw new NotFoundException('Майстра не знайдено');
    return toPublicBarber(row);
  }

  async listAdmin(onlyBarberId?: string): Promise<AdminBarber[]> {
    const rows = await this.prisma.barber.findMany({
      where: onlyBarberId ? { id: onlyBarberId } : {},
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: this.adminSelect(),
    });
    return rows.map(toAdminBarber);
  }

  async findAdmin(id: string): Promise<AdminBarber> {
    const row = await this.prisma.barber.findUnique({
      where: { id },
      select: this.adminSelect(),
    });
    if (!row) throw new NotFoundException('Майстра не знайдено');
    return toAdminBarber(row);
  }

  async create({
    serviceIds,
    ...data
  }: BarberUpsertInput): Promise<AdminBarber> {
    try {
      const row = await this.prisma.barber.create({
        data: {
          ...data,
          ...(serviceIds && {
            services: {
              create: serviceIds.map((serviceId) => ({ serviceId })),
            },
          }),
        },
        select: { id: true },
      });
      return this.findAdmin(row.id);
    } catch (e) {
      if (isUniqueViolation(e))
        throw new ConflictException('Такий slug уже зайнятий');
      throw e;
    }
  }

  async update(
    id: string,
    { serviceIds, ...data }: Partial<BarberUpsertInput>,
  ): Promise<AdminBarber> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.barber.update({ where: { id }, data });
        if (serviceIds) {
          // Індивідуальні ціни для послуг, що лишаються, зберігаємо
          await tx.barberService.deleteMany({
            where: { barberId: id, serviceId: { notIn: serviceIds } },
          });
          await tx.barberService.createMany({
            data: serviceIds.map((serviceId) => ({ barberId: id, serviceId })),
            skipDuplicates: true,
          });
        }
      });
    } catch (e) {
      if (isNotFound(e)) throw new NotFoundException('Майстра не знайдено');
      if (isUniqueViolation(e))
        throw new ConflictException('Такий slug уже зайнятий');
      throw e;
    }
    return this.findAdmin(id);
  }

  /** Повна заміна тижневого графіка. */
  async setWorkingHours(
    barberId: string,
    days: WorkingHoursInput,
  ): Promise<AdminBarber> {
    await this.ensureExists(barberId);
    await this.prisma.$transaction([
      this.prisma.workingHours.deleteMany({ where: { barberId } }),
      this.prisma.workingHours.createMany({
        data: days.map((d) => ({ ...d, barberId })),
      }),
    ]);
    return this.findAdmin(barberId);
  }

  async addTimeOff(
    barberId: string,
    input: TimeOffCreateInput,
  ): Promise<AdminBarber> {
    await this.ensureExists(barberId);
    await this.prisma.timeOff.create({
      data: {
        barberId,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        reason: input.reason,
      },
    });
    return this.findAdmin(barberId);
  }

  async removeTimeOff(barberId: string, timeOffId: string): Promise<void> {
    const { count } = await this.prisma.timeOff.deleteMany({
      where: { id: timeOffId, barberId },
    });
    if (count === 0) throw new NotFoundException('Вихідний не знайдено');
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.barber.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Майстра не знайдено');
  }

  // Минулі вихідні в адмінці не потрібні
  private adminSelect() {
    return {
      ...adminBarberSelect,
      timeOff: {
        ...adminBarberSelect.timeOff,
        where: { endsAt: { gt: new Date() } },
      },
    };
  }
}
