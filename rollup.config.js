/* eslint-disable object-curly-newline */
/* eslint-disable import/no-extraneous-dependencies */
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import styles from "rollup-plugin-styles";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import { isReleaseVersion } from './git-functions.js';

const release = isReleaseVersion();
const DEFAULT_FILE_NAME = 'index';
const DEFAULT_ENRTY_PATH = 'src/index.ts';

export default {
  input: DEFAULT_ENRTY_PATH,
  output: [
    {
      format: 'es',
      file: `dist/${DEFAULT_FILE_NAME}.esm.js`,
      inlineDynamicImports: true,
      sourcemap: !release
    },
    {
      format: 'cjs',
      file: `dist/${DEFAULT_FILE_NAME}.cjs.js`,
      inlineDynamicImports: true,
      sourcemap: !release
    },
    {
      format: 'umd',
      name: "tooltipjs",
      file: `dist/${DEFAULT_FILE_NAME}.umd.js`,
      inlineDynamicImports: true,
      sourcemap: !release
    }
  ],

  external: ['intersection-observer', 'resize-observer-polyfill'],
  plugins: [
    tsConfigPaths({ logLevel: release ? 'debug' : undefined, tsConfigPath: './tsconfig.json' }),
    nodePolyfills(),
    nodeResolve({
      extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx', '.d.ts']
    }),
    commonjs({}),
    babel({
      extensions: ['.js', '.ts', '.jsx', '.tsx']
    }),
    styles({
      mode: 'inject',
      include: ['**/*.scss', '**/*.css']
    })
  ]
};
