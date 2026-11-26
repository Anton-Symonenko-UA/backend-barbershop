import type { AdminBarber, PublicBarber } from '@barbershop/shared';

export const publicBarberSelect = {
  id: true,
  slug: true,
  name: true,
  title: true,
  bio: true,
  specialty: true,
  experienceSince: true,
  photoUrl: true,
  instagram: true,
  services: { select: { serviceId: true } },
} as const;

export const adminBarberSelect = {
  ...publicBarberSelect,
  isActive: true,
  sortOrder: true,
  workingHours: {
    select: { weekday: true, startMin: true, endMin: true },
    orderBy: { weekday: 'asc' },
  },
  timeOff: {
    select: { id: true, startsAt: true, endsAt: true, reason: true },
    orderBy: { startsAt: 'asc' },
  },
} as const;

type PublicRow = {
  id: string;
  slug: string;
  name: string;
  title: string | null;
  bio: string | null;
  specialty: string | null;
  experienceSince: number | null;
  photoUrl: string | null;
  instagram: string | null;
  services: { serviceId: string }[];
};

export function toPublicBarber(row: PublicRow, now = new Date()): PublicBarber {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    bio: row.bio,
    specialty: row.specialty,
    experienceYears:
      row.experienceSince === null
        ? null
        : Math.max(0, now.getFullYear() - row.experienceSince),
    photoUrl: row.photoUrl,
    instagram: row.instagram,
    serviceIds: row.services.map((s) => s.serviceId),
  };
}

export function toAdminBarber(
  row: PublicRow & {
    isActive: boolean;
    sortOrder: number;
    workingHours: AdminBarber['workingHours'];
    timeOff: {
      id: string;
      startsAt: Date;
      endsAt: Date;
      reason: string | null;
    }[];
  },
): AdminBarber {
  return {
    ...toPublicBarber(row),
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    experienceSince: row.experienceSince,
    workingHours: row.workingHours,
    timeOff: row.timeOff.map((t) => ({
      id: t.id,
      startsAt: t.startsAt.toISOString(),
      endsAt: t.endsAt.toISOString(),
      reason: t.reason,
    })),
  };
}
