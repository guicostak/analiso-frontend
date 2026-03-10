import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "next/link": path.resolve(__dirname, "src/shims/next-link.tsx"),
    },
  },
});
