// Розпізнавання помилок Postgres, які приходять через драйвер-адаптер Prisma.

type MaybePrismaError = {
  code?: string;
  message?: string;
  meta?: { driverAdapterError?: { cause?: { code?: string } } };
};

function pgCode(error: unknown): string | undefined {
  const e = error as MaybePrismaError | null;
  return e?.meta?.driverAdapterError?.cause?.code;
}

/** Порушено exclusion constraint "Booking_no_overlap": слот уже зайнятий. */
export function isBookingOverlap(error: unknown): boolean {
  const e = error as MaybePrismaError | null;
  return (
    pgCode(error) === '23P01' ||
    (typeof e?.message === 'string' && e.message.includes('Booking_no_overlap'))
  );
}

/** Порушено унікальний індекс. */
export function isUniqueViolation(error: unknown): boolean {
  const e = error as MaybePrismaError | null;
  return e?.code === 'P2002' || pgCode(error) === '23505';
}

/** Запис для update/delete не знайдено. */
export function isNotFound(error: unknown): boolean {
  return (error as MaybePrismaError | null)?.code === 'P2025';
}
