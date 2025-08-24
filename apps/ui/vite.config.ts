import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vite.dev/config/
export default defineConfig({
  build: {
    target: "esnext",
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate chunk for WASM modules to avoid top-level await issues
          wasm: ["@midnight-ntwrk/onchain-runtime"],
        },
      },
    },
    commonjsOptions: {
      // Transform CommonJS to ESM more aggressively
      transformMixedEsModules: true,
      extensions: [".js", ".cjs"],
      // Needed for Node.js modules
      ignoreDynamicRequires: true,
    },
  },
  plugins: [
    react(),
    wasm(),
    tailwindcss(),

    topLevelAwait({
      // Be more permissive with top-level await
      promiseExportName: "__tla",
      promiseImportName: (i) => `__tla_${i}`,
    }),
    {
      name: "wasm-module-resolver",
      resolveId(source, importer) {
        // Special handling for the problematic module
        if (
          source === "@midnight-ntwrk/onchain-runtime" &&
          importer &&
          importer.includes("@midnight-ntwrk/compact-runtime")
        ) {
          // Force dynamic import for this case
          return {
            id: source,
            external: false,
            moduleSideEffects: true,
          };
        }
        return null;
      },
    },
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
      supported: { "top-level-await": true },
      // Configure ESBuild to handle Node.js-style modules
      platform: "browser",
      format: "esm",
      loader: {
        ".wasm": "binary",
      },
    },
    // Explicitly include these packages for pre-bundling, but force ESM
    include: ["@midnight-ntwrk/compact-runtime"],
    // Exclude WASM files and modules with top-level await from optimization
    exclude: [
      "@midnight-ntwrk/onchain-runtime",
      "@midnight-ntwrk/onchain-runtime/midnight_onchain_runtime_wasm_bg.wasm",
      "@midnight-ntwrk/onchain-runtime/midnight_onchain_runtime_wasm.js",
    ],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [
      ".mjs",
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".json",
      ".wasm",
      ".cjs",
    ],
    // Ensure proper module resolution
    mainFields: ["browser", "module", "main"],
  },
  define: {},
});
