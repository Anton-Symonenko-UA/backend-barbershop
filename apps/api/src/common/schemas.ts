import { z } from 'zod';

// Схеми параметрів маршрутів, які потрібні лише API
export const idParam = z.string().trim().min(1).max(64);
