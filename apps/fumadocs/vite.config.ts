import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import react from '@vitejs/plugin-react'
import mdx from 'fumadocs-mdx/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite-plus'

const shimPath = fileURLToPath(
  new URL('./src/shims/use-sync-external-store-shim.ts', import.meta.url),
)
const shimWithSelectorPath = fileURLToPath(
  new URL('./src/shims/use-sync-external-store-with-selector.ts', import.meta.url),
)

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    mdx(),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          crawlLinks: true,
        },
      },

      pages: [
        {
          path: '/docs',
        },
        {
          path: '/api/search',
        },
        {
          path: 'llms-full.txt',
        },
        {
          path: 'llms.txt',
        },
      ],
    }),
    react(),
    // please see https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro for guides on hosting
    nitro(),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: [
      { find: 'tslib', replacement: 'tslib/tslib.es6.js' },
      {
        find: /^use-sync-external-store\/shim\/with-selector(\.js)?$/,
        replacement: shimWithSelectorPath,
      },
      {
        find: /^use-sync-external-store\/shim(\/index(\.js)?)?$/,
        replacement: shimPath,
      },
      {
        find: /^use-sync-external-store\/with-selector(\.js)?$/,
        replacement: shimWithSelectorPath,
      },
      {
        find: /^use-sync-external-store(\/index(\.js)?)?$/,
        replacement: shimPath,
      },
    ],
  },
})
