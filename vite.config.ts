import { defineConfig } from 'vite-plus'

export default defineConfig({
  lint: {
    ignorePatterns: [
      'node_modules/**',
      '**/node_modules/**',
      'apps/web/dist/**',
      'apps/web/.vinxi/**',
      'apps/web/.tanstack/**',
      'apps/web/src/routeTree.gen.ts',
      'apps/fumadocs/src/routeTree.gen.ts',
      'apps/server/dist/**',
      'packages/db/dist/**',
      '.alchemy/**',
      '.wrangler/**',
      '.agents/**',
      '**/.wrangler/**',
    ],
    options: {
      typeAware: false,
      typeCheck: false,
    },
  },
  fmt: {
    ignorePatterns: [
      'node_modules/**',
      '**/node_modules/**',
      'apps/web/dist/**',
      'apps/web/.vinxi/**',
      'apps/web/.tanstack/**',
      'apps/web/src/routeTree.gen.ts',
      'apps/fumadocs/src/routeTree.gen.ts',
      'apps/server/dist/**',
      'packages/db/dist/**',
      '.agents/**',
      '.alchemy/**',
      '.wrangler/**',
      '**/.wrangler/**',
    ],
    jsxSingleQuote: true,
    singleQuote: true,
    semi: false,
    sortPackageJson: {
      sortScripts: true,
    },
    sortImports: true,
    sortTailwindcss: true,
  },
  staged: {
    '*.{js,ts,jsx,tsx,vue,svelte,json,jsonc,css,md}': 'vp check --fix',
  },
})
