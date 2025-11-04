import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { peerDependencies } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["lib"],
      tsconfigPath: "./tsconfig.app.json",
      root: "./",
    }),
  ],
  resolve: {
    alias: {
      lib: path.resolve(__dirname, "lib"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib/index.ts"),
      formats: ["es"],
    },
    rolldownOptions: {
      output: {
        dir: "dist/lib",
        preserveModules: true,
        preserveModulesRoot: "lib",
        assetFileNames: "assets/[name][extname]",
        entryFileNames: "[name].js",
      },
      watch: {
        include: "lib/*",
        clearScreen: true,
      },
      external: [...Object.keys(peerDependencies), "lodash", "react", "react/jsx-runtime", "lodash/*", "bun"],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
