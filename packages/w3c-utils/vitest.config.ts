import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,js}'],
    coverage: {
      enabled: true,
      reportsDirectory: '.coverage',
      exclude: ['*/type.{ts,js}'],
      reporter: ['text', 'json', 'html'],
    },
  },
});
