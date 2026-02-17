import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const isProd = mode === "production";

  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    // --- Production Build Optimizations ---
    build: {
      target: "es2020",
      minify: "esbuild",
      sourcemap: false,
      // Reduce chunk size warnings threshold
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Manual chunk splitting for optimal caching
          manualChunks(id: string) {
            // Vendor chunks — cached separately, rarely change
            if (id.includes("node_modules")) {
              if (id.includes("react-dom")) return "vendor-react-dom";
              if (id.includes("react-router")) return "vendor-router";
              if (id.includes("framer-motion")) return "vendor-framer";
              if (id.includes("firebase")) return "vendor-firebase";
              if (id.includes("@google/genai")) return "vendor-genai";
              return "vendor"; // All other node_modules
            }
          },
        },
      },
      // Enable CSS code splitting
      cssCodeSplit: true,
    },

    // Strip console.log/debug in production (keep console.error/warn)
    esbuild: isProd
      ? {
          drop: ["debugger"],
          pure: ["console.log", "console.debug"],
        }
      : undefined,
  };
});
