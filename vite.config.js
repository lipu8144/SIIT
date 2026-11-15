import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: {
    chunkSizeWarningLimit: 600, // recharts is ~534KB — known large chart lib
    rollupOptions: {
      output: {
        manualChunks: {
          supabase: ["@supabase/supabase-js"],
          recharts: ["recharts"],
          framer: ["framer-motion"],
        },
      },
    },
  },
});
