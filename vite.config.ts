import { defineConfig } from 'vite'
import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import cloudflare from '@hono/vite-dev-server/cloudflare'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      publicDir: './webapp/public',
      esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'hono/jsx',
      },
      plugins: [
        devServer({
          entry: './webapp/src/index.tsx',
          adapter: cloudflare,
        }),
      ],
    }
  }

  return {
    publicDir: './webapp/public',
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'hono/jsx',
    },
    plugins: [
      build({
        entry: './webapp/src/index.tsx',
        outputDir: './dist',
      }),
    ],
  }
})
