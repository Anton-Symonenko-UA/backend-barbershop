import { ServicesService } from './services.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('ServicesService.listPublic', () => {
  it('maps rows to the public shape and only asks for active services', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: 's1',
        slug: 'haircut',
        name: 'Стрижка',
        description: null,
        durationMin: 60,
        priceCents: 60000,
        isActive: true,
        sortOrder: 0,
        categoryId: 'c1',
        category: { name: 'Стрижки' },
      },
    ]);
    const service = new ServicesService({
      service: { findMany },
    } as unknown as PrismaService);

    await expect(service.listPublic()).resolves.toEqual([
      {
        id: 's1',
        slug: 'haircut',
        name: 'Стрижка',
        description: null,
        durationMin: 60,
        priceCents: 60000,
        category: 'Стрижки',
      },
    ]);
    expect(findMany.mock.calls[0][0].where).toEqual({ isActive: true });
  });
});
