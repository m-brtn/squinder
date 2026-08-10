import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Squinder's local port range is 713x; 7132 belongs to the CRM.
    port: 7132,
    strictPort: true,
  },
  resolve: {
    alias: {
      // Use the shared package sources directly so the dev server picks
      // up edits without rebuilding packages/shared.
      '@squinder/shared': resolve(
        __dirname,
        '../../packages/shared/src/index.ts',
      ),
    },
  },
})
