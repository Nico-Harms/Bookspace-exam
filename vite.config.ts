import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  ssr: {
    noExternal: command === "build" ? true : undefined,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["@headlessui/react", "@heroicons/react"],
        },
      },
    },
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
}));
