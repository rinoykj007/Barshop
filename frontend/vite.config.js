import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // In production, use the Vercel backend URL directly
  // In development, proxy through Vite dev server
  define: {
    "import.meta.env.VITE_API_BASE_URL":
      process.env.NODE_ENV === "production"
        ? JSON.stringify("https://barshop-backend.vercel.app")
        : JSON.stringify(""),
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "https://barshop-backend.vercel.app",
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
