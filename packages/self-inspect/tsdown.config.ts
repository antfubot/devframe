import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  outExtensions: () => ({ js: '.mjs', dts: '.d.mts' }),
  // client build outputs to dist/client/ — don't wipe the whole dir
  clean: false,
  tsconfig: '../../tsconfig.base.json',
  dts: true,
  platform: 'node',
  deps: {
    neverBundle: [
      'devframe',
      '@devframes/hub',
    ],
  },
})
