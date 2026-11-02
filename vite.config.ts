import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Connect, type Plugin } from 'vite'

// Dev and preview only. Production serves the S3 key `used-cars`, written by
// scripts/write-home-page.mjs from public/used-cars.html.
function usedCarsPage(): Plugin {
  const serve: Connect.NextHandleFunction = (req, res, next) => {
    const path = req.url?.split('?')[0]
    if (path !== '/used-cars' && path !== '/used-cars/') {
      next()
      return
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.end(readFileSync(new URL('./public/used-cars.html', import.meta.url)))
  }
  return {
    name: 'used-cars-page',
    configureServer(server) {
      server.middlewares.use(serve)
    },
    configurePreviewServer(server) {
      server.middlewares.use(serve)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), usedCarsPage()],
})
