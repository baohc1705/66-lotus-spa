import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    cssMinify: "esbuild",
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      checks: {
        pluginTimings: false,
      },
      output: {
        codeSplitting: {
          groups: [
            { name: "vendor-react", test: /node_modules[\\/](react|react-dom|scheduler)([\\/]|$)/ },
            { name: "vendor-recharts", test: /node_modules[\\/]recharts([\\/]|$)/ },
            { name: "vendor-leaflet", test: /node_modules[\\/]leaflet([\\/]|$)/ },
            { name: "vendor-calendar", test: /node_modules[\\/]calendarkit-pro([\\/]|$)/ },
            { name: "vendor-motion", test: /node_modules[\\/](motion|framer-motion)([\\/]|$)/ },
            { name: "vendor-tanstack", test: /node_modules[\\/]@tanstack([\\/]|$)/ },
            { name: "vendor-radix", test: /node_modules[\\/](radix-ui|@radix-ui)([\\/]|$)/ },
            { name: "vendor-lucide", test: /node_modules[\\/]lucide-react([\\/]|$)/ },
          ],
        },
      },
    },
  },
})
