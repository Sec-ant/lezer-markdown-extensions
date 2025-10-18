import { constantCase } from "es-toolkit";
import { codes } from "micromark-util-symbol";
import { defineConfig } from "vitest/config";
import { entry } from "./meta";
import { dependencies } from "./package.json";

const CODES_OBJECT = Object.fromEntries(
  Object.entries(codes).map((entry) => [
    `CODES.${constantCase(entry[0])}`,
    JSON.stringify(entry[1]),
  ]),
);

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry,
      formats: ["es"],
      fileName: (_, entryName) => `${entryName}.js`,
    },
    outDir: "dist/es",
    rollupOptions: {
      external: Object.keys(dependencies),
    },
  },
  define: CODES_OBJECT,
  test: {
    globals: true,
    environment: "node",
    forceRerunTriggers: ["**/package.json/**", "**/vite.config.*/**"],
  },
});
