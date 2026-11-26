// Тестові дані: npm run db:seed
import 'dotenv/config';
import { PasswordHasher } from '@nestjs/authentication';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
  }),
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

  // Майстри: ті самі, що на головній. Графік: Пн–Пт 09:00–21:00, Сб–Нд 10:00–20:00.
  const allServices = await prisma.service.findMany({
    select: { id: true, slug: true },
  });
  const barbers = [
    {
      slug: 'oleh-marchenko',
      name: 'Олег Марченко',
      title: 'Арт-директор',
      specialty: 'Класика, королівське гоління',
      experienceSince: 2014,
      photoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1',
      sortOrder: 1,
      days: [1, 2, 3, 4, 5],
      skip: ['kids'],
    },
    {
      slug: 'denys-koval',
      name: 'Денис Коваль',
      title: 'Топ-барбер',
      specialty: 'Фейди, текстурні стрижки',
      experienceSince: 2018,
      photoUrl: 'https://images.unsplash.com/photo-1512864084360-7c0c4d0a0845',
      sortOrder: 2,
      days: [2, 3, 4, 5, 6],
      skip: ['royal-shave'],
    },
    {
      slug: 'artem-lysenko',
      name: 'Артем Лисенко',
      title: 'Барбер',
      specialty: 'Борода, камуфляж сивини',
      experienceSince: 2019,
      photoUrl: 'https://images.unsplash.com/photo-1708936944985-16f928c5e650',
      sortOrder: 3,
      days: [0, 1, 3, 5, 6],
      skip: [],
    },
  ];
  for (const { days, skip, ...data } of barbers) {
    const barber = await prisma.barber.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });
    await prisma.barberService.createMany({
      data: allServices
        .filter((s) => !skip.includes(s.slug))
        .map((s) => ({ barberId: barber.id, serviceId: s.id })),
      skipDuplicates: true,
    });
    await prisma.workingHours.deleteMany({ where: { barberId: barber.id } });
    await prisma.workingHours.createMany({
      data: days.map((weekday) => ({
        barberId: barber.id,
        weekday,
        startMin: weekday === 0 || weekday === 6 ? 600 : 540,
        endMin: weekday === 0 || weekday === 6 ? 1200 : 1260,
      })),
    });
  }

  // Адміністратор: email і пароль з .env (SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD)
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    const hasher = new PasswordHasher();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email,
          passwordHash: await hasher.hash(password),
          role: 'ADMIN',
        },
      });
      console.log(`Admin created: ${email}`);
    }
  } else {
    console.log(
      'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set: admin user skipped',
    );
  }

  if ((await prisma.review.count()) === 0) {
    const denys = await prisma.barber.findUnique({
      where: { slug: 'denys-koval' },
    });
    const oleh = await prisma.barber.findUnique({
      where: { slug: 'oleh-marchenko' },
    });
    await prisma.review.createMany({
      data: [
        {
          authorName: 'Максим',
          rating: 5,
          text: 'Найкращий фейд у моєму житті. Денис вислухав, порадив і зробив краще, ніж я уявляв.',
          barberId: denys?.id,
          isPublished: true,
        },
        {
          authorName: 'Ігор',
          rating: 5,
          text: 'Королівське гоління від Олега варте кожної гривні. Атмосфера, кава, жодного поспіху.',
          barberId: oleh?.id,
          isPublished: true,
        },
        {
          authorName: 'Андрій',
          rating: 4,
          text: 'Хожу вже рік. Завжди вчасно, завжди чисто. Мінус одна зірка: важко потрапити на суботу.',
          isPublished: true,
        },
      ],
    });
  }
}

main()
  .finally(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
