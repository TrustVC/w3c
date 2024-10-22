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
  // await cpy(['package.json'], 'dist', {
  //   dot: true,
  //   overwrite: true,
  // });

  // await Promise.all(
  //   ['dist/w3c-vc/', 'dist/esm/w3c-vc'].map(async (path) => {
  //     const r = await new Promise((resolve) => {
  //       const r = rimraf(path);
  //       rimraf.moveRemoveSync(path);
  //       resolve(r);
  //     });
  //   }),
  // );

  // await execa({
  //   stdout: process.stdout,
  //   stderr: process.stderr,
  // })`npx resolve-tspaths -p tsconfig.build.json -s ./dist/cjs -o ./dist/cjs --verbose`;

  // remove .d.mts
  /**
   * Unable to clean up .d.mts files
   * https://github.com/egoist/tsup/pull/1024
   */
  // fs.readdirSync('dist').forEach(async (file) => {
  //   console.log('Removing', file);
  //   if (file.endsWith('.d.mts')) {
  //     await rimraf(file);
  //   }
  // });

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
    dts: false,
    sourcemap: false,
    treeshake: true,
    splitting: false,
    clean: true,
    legacyOutput: true,
    outDir: 'dist',
    platform: 'neutral',
    entry: ['src/**/*.ts', '!tests/**/*.{test,spec}.ts'],
    format: ['cjs'],
    tsconfig: 'tsconfig.build.json',
    shims: false,
    bundle: false,
    minify: false,
    keepNames: true,
    // outExtension,
    onSuccess,
  },
]);