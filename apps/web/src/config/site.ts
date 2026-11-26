import type { PublicService } from '@barbershop/shared';

// Увесь контент головної сторінки в одному місці.
// Назву, контакти й адресу заміни на справжні перед запуском.

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}`;

export const site = {
  name: 'KREMEN',
  nameUa: 'Кремінь',
  tagline: 'Барбершоп на Подолі',
  description:
    'Чоловічі стрижки, борода та королівське гоління в Києві. Майстри з досвідом від 7 років, онлайн-запис за хвилину.',
  city: 'Київ',
  address: 'вул. Сагайдачного, 12',
  district: 'Поділ',
  phone: '+380 67 000 00 00',
  phoneHref: 'tel:+380670000000',
  instagram: 'https://instagram.com/',
  telegram: 'https://t.me/',
  hours: [
    { days: 'Пн–Пт', time: '09:00–21:00' },
    { days: 'Сб–Нд', time: '10:00–20:00' },
  ],
  geo: { lat: 50.4633, lng: 30.5194 },
  // Колір інтерфейсу браузера: збігається з токеном --background (oklch(0.155 0.006 60)).
  // Meta theme-color не читає CSS-змінні, тому значення продубльоване тут, а не в компонентах.
  themeColor: 'oklch(0.155 0.006 60)',
} as const;

// Кольори для згенерованої OG-картинки: генератор не читає CSS-змінні й не знає oklch,
// тому тут sRGB-еквіваленти токенів --background, --foreground і --primary.
export const ogColors = {
  background: 'rgb(22, 19, 17)',
  foreground: 'rgb(239, 234, 224)',
  primary: 'rgb(212, 180, 125)',
} as const;

export const nav = [
  { href: '/#space', label: 'Простір' },
  { href: '/#approach', label: 'Підхід' },
  { href: '/#services', label: 'Послуги' },
  { href: '/#team', label: 'Майстри' },
  { href: '/reviews', label: 'Відгуки' },
  { href: '/#contacts', label: 'Контакти' },
] as const;

export const images = {
  hero: {
    src: unsplash('1585747860715-2ba37e788b70'),
    alt: 'Барберські крісла біля цегляної стіни під теплими лампами',
  },
} as const;

// Прогулянка простором: кадри змінюються під час скролу
export const walkthrough = [
  {
    label: 'Лаунж',
    title: 'Двері, за якими час сповільнюється',
    text: 'Кава, свіжі журнали і жодного поспіху, поки майстер готує крісло.',
    src: unsplash('1781925856343-c97d0d44f94c'),
    alt: 'Зона очікування барбершопу зі шкіряним диваном і журналами',
  },
  {
    label: 'Зала',
    title: 'Шість крісел. Одна культура',
    text: 'Простір, де чути машинку, а не музику на повну.',
    src: unsplash('1781455793310-8427c96454c7'),
    alt: 'Порожня зала барбершопу з кріслами і дзеркалами',
  },
  {
    label: 'Крісло',
    title: 'Місце, де починається форма',
    text: 'Шкіра, латунь і рівно стільки часу, скільки потрібно.',
    src: unsplash('1792523227995-9ac04cf1d94d'),
    alt: 'Чорні крісла з золотими деталями перед арковими дзеркалами',
  },
  {
    label: 'Ритуал',
    title: 'Гарячий рушник і небезпечна бритва',
    text: 'Королівське гоління так, як його робили сто років тому.',
    src: unsplash('1739302493888-6f96cbc37105'),
    alt: 'Барбер робить гоління під гарячим рушником',
  },
  {
    label: 'Деталі',
    title: 'Інструмент, якому довіряєш',
    text: 'Японські ножиці, перевірені машинки, власна косметика.',
    src: unsplash('1621605815971-fbc98d665033'),
    alt: 'Машинки для стрижки, ножиці, гребінець і косметика на сланцевій дошці',
  },
] as const;

export const stats = [
  { value: '2016', label: 'рік відкриття' },
  { value: '6', label: 'крісел' },
  { value: '48\u00a0000+', label: 'стрижок' },
  { value: '4,9', label: 'рейтинг Google' },
] as const;

// Редакційні панелі «Підхід»: чергуються paper / tan
export const approach = [
  {
    n: '01',
    title: 'Аналіз',
    lead: 'Форма голови, ріст волосся, ваш ритм життя.',
    text: 'Перші 5 хвилин ми не тримаємо ножиці в руках. Дивимось, питаємо, пропонуємо.',
    facts: [
      { value: '5 хв', label: 'консультація' },
      { value: '3', label: 'варіанти форми' },
    ],
    drawing: 'profile',
    tone: 'paper',
  },
  {
    n: '02',
    title: 'Ідея',
    lead: 'Стрижка, яка тримає форму 4 тижні, а не 4 дні.',
    text: 'Підбираємо силует під ваше обличчя й те, скільки часу ви готові витрачати на укладку.',
    facts: [
      { value: '4 тиж', label: 'тримає форму' },
      { value: '2 хв', label: 'укладка вдома' },
    ],
    drawing: 'scissors',
    tone: 'tan',
  },
  {
    n: '03',
    title: 'Техніка',
    lead: 'Ножиці, машинка, бритва: кожен інструмент на своєму місці.',
    text: 'Фейди без сходинок, чистий контур, текстура, що лягає сама.',
    facts: [
      { value: '0,1 мм', label: 'точність контуру' },
      { value: '7+ р', label: 'досвід майстрів' },
    ],
    drawing: 'razor',
    tone: 'paper',
  },
  {
    n: '04',
    title: 'Догляд',
    lead: 'Гарячий рушник, тонік, порада на наступні тижні.',
    text: 'Ви йдете не лише з новою стрижкою, а й з розумінням, як її зберегти.',
    facts: [
      { value: '40°', label: 'гарячий рушник' },
      { value: '1', label: 'засіб, що підходить саме вам' },
    ],
    drawing: 'comb',
    tone: 'tan',
  },
] as const;

export const team = [
  {
    slug: 'oleh-marchenko',
    name: 'Олег Марченко',
    role: 'Арт-директор',
    years: 12,
    specialty: 'Класика, королівське гоління',
    src: unsplash('1503951914875-452162b0f3f1'),
    alt: 'Майстер працює з клієнтом у кріслі',
  },
  {
    slug: 'denys-koval',
    name: 'Денис Коваль',
    role: 'Топ-барбер',
    years: 8,
    specialty: 'Фейди, текстурні стрижки',
    src: unsplash('1512864084360-7c0c4d0a0845'),
    alt: 'Барбер підрівнює волосся клієнту машинкою',
  },
  {
    slug: 'artem-lysenko',
    name: 'Артем Лисенко',
    role: 'Барбер',
    years: 7,
    specialty: 'Борода, камуфляж сивини',
    src: unsplash('1708936944985-16f928c5e650'),
    alt: 'Клієнт у кріслі барбершопу під час стрижки',
  },
] as const;

// Запасний прайс: показується, якщо API недоступне
export const fallbackServices: PublicService[] = [
  {
    id: 'haircut',
    slug: 'haircut',
    name: 'Чоловіча стрижка',
    description: 'Консультація, миття, стрижка, укладка',
    durationMin: 60,
    priceCents: 60000,
    category: 'Стрижки',
  },
  {
    id: 'fade',
    slug: 'fade',
    name: 'Фейд / скін-фейд',
    description: 'Чистий перехід від нуля, детальна робота машинкою',
    durationMin: 60,
    priceCents: 70000,
    category: 'Стрижки',
  },
  {
    id: 'beard',
    slug: 'beard',
    name: 'Оформлення бороди',
    description: 'Форма, контур небезпечною бритвою, гарячий рушник',
    durationMin: 30,
    priceCents: 40000,
    category: 'Борода та гоління',
  },
  {
    id: 'royal-shave',
    slug: 'royal-shave',
    name: 'Королівське гоління',
    description: 'Розпарювання, два проходи бритвою, холодний компрес',
    durationMin: 45,
    priceCents: 55000,
    category: 'Борода та гоління',
  },
  {
    id: 'combo',
    slug: 'combo',
    name: 'Стрижка + борода',
    description: 'Повний ритуал за один візит',
    durationMin: 90,
    priceCents: 90000,
    category: 'Борода та гоління',
  },
];
