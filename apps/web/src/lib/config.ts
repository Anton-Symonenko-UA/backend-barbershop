// Адреси API. На сервері можна ходити внутрішньою адресою (API_URL), у браузері лише публічною.
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
export const SERVER_API_URL = process.env.API_URL ?? PUBLIC_API_URL;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
