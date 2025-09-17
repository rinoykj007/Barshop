import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    'process.env': {}
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'https://barshop-backend.vercel.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
