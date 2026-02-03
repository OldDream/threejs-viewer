import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Demo development mode
  if (mode === 'demo' || process.env.VITE_DEMO === 'true') {
    return {
      plugins: [react()],
      root: resolve(__dirname, 'demo'),
      // Enable HMR for demo development
      // Requirement 6.4: WHEN running in development mode, THE project SHALL support hot module replacement
      server: {
        port: 3000,
        open: true,
        hmr: true
      },
      resolve: {
        alias: {
          // Allow demo to import from src
          '@': resolve(__dirname, 'src')
        }
      }
    }
  }

  // Library build mode (default)
  return {
    plugins: [react()],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'ThreeJSViewer',
        formats: ['es', 'cjs'],
        fileName: (format) => `threejs-viewer.${format === 'es' ? 'mjs' : 'cjs'}`
      },
      rollupOptions: {
        // Externalize deps that shouldn't be bundled into the library
        external: ['react', 'react-dom', 'three', 'three-stdlib'],
        output: {
          // Global variables to use in UMD build for externalized deps
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            three: 'THREE',
            'three-stdlib': 'ThreeStdlib'
          }
        }
      },
      // Generate sourcemaps for debugging
      sourcemap: true
    }
  }
})
