import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import * as path from "node:path";
import { playwright } from "@vitest/browser-playwright";

const dirname = path.dirname(import.meta.filename);
const screenshotDirectory = path.join(dirname, ".vitest", "screenshots");

// Enable for debugs!
const screenshotFailures = false;

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [tsconfigPaths()],
        test: {
          include: ["src/**/*.{test,spec}.ts"],
          name: "unit",
          environment: "node",
          setupFiles: "./src/features/testing/setup-unit.ts",
        },
      },
      {
        plugins: [
          tsconfigPaths(),
          react({
            babel: {
              plugins: ["babel-plugin-react-compiler"],
            },
          }),
        ],
        test: {
          include: ["src/**/*.ui.{test,spec}.{ts,tsx}"],
          name: "browser",
          browser: {
            provider: playwright(),
            enabled: true,
            headless: true,
            screenshotDirectory,
            screenshotFailures,
            instances: [
              {
                browser: "chromium",

                headless: true,
              },
              {
                browser: "webkit",

                headless: true,
              },
            ],
          },
          setupFiles: "./src/features/testing/setup-ui.tsx",
        },
      },
    ],
  },
});
