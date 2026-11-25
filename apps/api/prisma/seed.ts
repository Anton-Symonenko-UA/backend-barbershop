// Тестові дані: npm run db:seed
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const haircuts =
    (await prisma.serviceCategory.findFirst({ where: { name: 'Стрижки' } })) ??
    (await prisma.serviceCategory.create({
      data: { name: 'Стрижки', sortOrder: 1 },
    }));
  await prisma.service.createMany({
    data: [
      {
        slug: 'haircut',
        name: 'Чоловіча стрижка',
        durationMin: 60,
        priceCents: 60000,
        categoryId: haircuts.id,
      },
      {
        slug: 'beard',
        name: 'Оформлення бороди',
        durationMin: 30,
        priceCents: 40000,
        categoryId: haircuts.id,
      },
      {
        slug: 'combo',
        name: 'Стрижка + борода',
        durationMin: 90,
        priceCents: 90000,
        categoryId: haircuts.id,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .finally(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
