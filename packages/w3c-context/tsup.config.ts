import cpy from 'cpy';
import { defineConfig } from 'tsup';
import updateDependenciesToPublishedVersion from '../../scripts/updateDependenciesToPublishedVersion';

const outExtension = ({ options, format }) => {
  const formatMap = {
    cjs: '.cjs',
    esm: '.mjs',
  };
  return {
    js: formatMap[format],
    dts: `.d.ts`,
  };
};

const onSuccess = async (): Promise<void> => {
  // Copy all json files
  await cpy(['src/**/*.json'], 'dist', {
    overwrite: true,
  });
  await cpy(['src/**/*.json'], 'dist/esm', {
    overwrite: true,
  });

  updateDependenciesToPublishedVersion();
};

export default defineConfig([
  {
    dts: true,
    sourcemap: false,
    treeshake: true,
    splitting: false,
    clean: true,
    legacyOutput: true,
    outDir: 'dist',
    platform: 'node',
    entry: ['src/**/*.ts', '!src/**/*.{test,spec}.ts'],
    format: ['cjs', 'esm'],
    tsconfig: 'tsconfig.build.json',
    shims: true,
    bundle: false,
    minify: false,
    keepNames: true,
    // outExtension,
    onSuccess,
  },
]);
