import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      external: ['buffer'],
    },
  },
  server: {
    open: true,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend"),
      buffer: 'buffer',
      process: 'process/browser',
      stream: 'stream-browserify',
      util: 'util',
    },
  },
  optimizeDeps: {
    include: [
      '@wallet-standard/core',
      '@wallet-standard/features', 
      '@wallet-standard/wallet',
      'aptos',
      'react-leaflet',
      'leaflet',
      'framer-motion'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  define: {
    global: 'globalThis',
  },
});
