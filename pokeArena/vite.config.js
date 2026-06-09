import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    watch: {
      usePolling: true, // fix HMR di beberapa environment Windows
    },
  },
});
