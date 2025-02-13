import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg"], // Exclude FFmpeg from optimization
  },
  build: {
    commonjsOptions: {
      include: [/ffmpeg/, /node_modules/], // Ensure FFmpeg is included in CommonJS
    },
  },
});
