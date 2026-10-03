import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages base path - uses relative path for maximum compatibility
// This works for any repository name or custom domain
const basePath = process.env.VITE_BASE_PATH || './';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: basePath,
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      port: 3000,
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});
