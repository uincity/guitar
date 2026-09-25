import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import type { ViteDevServer } from 'vite'

const toBuildSamplePath = (value: string) => value.replaceAll('\\', '/').replaceAll('#', '-sharp-')

const walkWavFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const absolute = path.join(directory, entry.name)
  if (entry.isDirectory()) return walkWavFiles(absolute)
  return path.extname(entry.name).toLowerCase() === '.wav' ? [absolute] : []
})

const nylonGuitarAssets = () => {
  const sampleRoot = path.resolve('src/audio/nylon-guitar')
  const wavFiles = walkWavFiles(sampleRoot)
  const devFiles = new Map(wavFiles.map((file) => [path.relative(sampleRoot, file).replaceAll('\\', '/'), file]))

  return [
    {
      name: 'nylon-guitar-assets-dev',
      apply: 'serve' as const,
      configureServer(server: ViteDevServer) {
        server.middlewares.use((request, response, next) => {
          const pathname = new URL(request.url ?? '/', 'http://vite.local').pathname
          const prefix = '/@nylon-guitar/'
          if (!pathname.startsWith(prefix)) return next()
          let fileKey: string
          try {
            fileKey = decodeURIComponent(pathname.slice(prefix.length))
          } catch {
            response.statusCode = 400
            return response.end('Invalid sample URL')
          }
          const file = devFiles.get(fileKey)
          if (!file) {
            response.statusCode = 404
            return response.end('Sample not found')
          }
          const contents = readFileSync(file)
          response.statusCode = 200
          response.setHeader('Content-Type', 'audio/wav')
          response.setHeader('Content-Length', String(contents.byteLength))
          return response.end(contents)
        })
      },
    },
    {
      name: 'nylon-guitar-assets-build',
      apply: 'build' as const,
      buildStart(this: { emitFile: (asset: { type: 'asset'; fileName: string; source: Buffer }) => void }) {
        wavFiles.forEach((file) => {
          const relative = path.relative(sampleRoot, file).replaceAll('\\', '/')
          this.emitFile({
            type: 'asset',
          fileName: `assets/nylon-guitar/${toBuildSamplePath(relative)}`,
            source: readFileSync(file),
          })
        })
      },
    },
  ]
}

export default defineConfig({
  base: './',
  plugins: [react(), nylonGuitarAssets()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    css: true,
  },
})
