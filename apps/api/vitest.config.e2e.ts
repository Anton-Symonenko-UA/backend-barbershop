import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Файли по черзі: локальний prisma dev тримає одне з'єднання, а дані тестів спільна база
    fileParallelism: false,
  },
});
