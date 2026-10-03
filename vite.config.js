import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages base path - change this to your repository name
// Example: if repo is 'mimiko-studio', base should be '/mimiko-studio/'
const basePath = process.env.GITHUB_PAGES === 'true' ? '/mimiko-studio/' : '/';

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
