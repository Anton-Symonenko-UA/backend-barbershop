// Тестові дані: npm run db:seed
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function category(name: string, sortOrder: number) {
  return (
    (await prisma.serviceCategory.findFirst({ where: { name } })) ??
    (await prisma.serviceCategory.create({ data: { name, sortOrder } }))
  );
}

async function main() {
  const hair = await category('Стрижки', 1);
  const beard = await category('Борода та гоління', 2);
  const care = await category('Догляд', 3);

  const services = [
    {
      slug: 'haircut',
      name: 'Чоловіча стрижка',
      description: 'Консультація, миття, стрижка, укладка',
      durationMin: 60,
      priceCents: 60000,
      categoryId: hair.id,
      sortOrder: 1,
    },
    {
      slug: 'fade',
      name: 'Фейд / скін-фейд',
      description: 'Чистий перехід від нуля, детальна робота машинкою',
      durationMin: 60,
      priceCents: 70000,
      categoryId: hair.id,
      sortOrder: 2,
    },
    {
      slug: 'kids',
      name: 'Дитяча стрижка',
      description: 'До 12 років',
      durationMin: 45,
      priceCents: 45000,
      categoryId: hair.id,
      sortOrder: 3,
    },
    {
      slug: 'beard',
      name: 'Оформлення бороди',
      description: 'Форма, контур небезпечною бритвою, гарячий рушник',
      durationMin: 30,
      priceCents: 40000,
      categoryId: beard.id,
      sortOrder: 1,
    },
    {
      slug: 'royal-shave',
      name: 'Королівське гоління',
      description: 'Розпарювання, два проходи бритвою, холодний компрес',
      durationMin: 45,
      priceCents: 55000,
      categoryId: beard.id,
      sortOrder: 2,
    },
    {
      slug: 'combo',
      name: 'Стрижка + борода',
      description: 'Повний ритуал за один візит',
      durationMin: 90,
      priceCents: 90000,
      categoryId: beard.id,
      sortOrder: 3,
    },
    {
      slug: 'camo',
      name: 'Камуфляж сивини',
      description: 'Природний відтінок без ефекту фарбування',
      durationMin: 30,
      priceCents: 35000,
      categoryId: care.id,
      sortOrder: 1,
    },
    {
      slug: 'face-care',
      name: 'Догляд за обличчям',
      description: 'Очищення, скраб, маска, зволоження',
      durationMin: 30,
      priceCents: 40000,
      categoryId: care.id,
      sortOrder: 2,
    },
  ];
  for (const { slug, ...data } of services) {
    await prisma.service.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
  }
}

main()
  .finally(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
