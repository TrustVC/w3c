import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    'import.meta.vitest': 'undefined',
  },
  plugins: [
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: 'tsconfig.test.json',
    }),
  ],
  cacheDir: './node_modules/.vitest',
  test: {
    include: ['src/**/*.test.{ts,js}'],
    exclude: ['dist', 'node_modules', '*/type{s}.{ts,js}'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: '.coverage',
      ignoreEmptyLines: true,
      reporter: ['text', 'lcov', 'json', 'html'],
      include: ['src/**/*.{ts,js}'],
    },
  },
});
