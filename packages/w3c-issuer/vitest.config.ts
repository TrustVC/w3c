import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  define: {
    "import.meta.vitest": "undefined",
  },
  plugins: [tsconfigPaths({
    projects: ['./tsconfig.test.json'],
  })],
  test: {
    cache: {
      dir: './node_modules/.vitest',
    },
    include: ['src/**/*.test.{ts,js}'],
    exclude: ['dist', 'node_modules', '*/type{s}.{ts,js}'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: '.coverage',
      ignoreEmptyLines: true,
      reporter: ['text', 'lcov', 'json', 'html'],
      include: ['src/**/*.{ts,js}']
    },
  },
});
