import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages base path - MUST match your repository name exactly
// Your repo: MimikoStudioWebsite
// Your site: https://mimikostudio.github.io/MimikoStudioWebsite/
// This uses the environment variable from GitHub Actions, or defaults to your repo name
const basePath = process.env.VITE_BASE_PATH || '/MimikoStudioWebsite/';

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
