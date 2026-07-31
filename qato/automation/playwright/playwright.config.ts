import path from "node:path";
import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@qato/shared";
import { getBaseUrl } from "./config";

// .env.* files live at the monorepo root, two levels up from this file
// (automation/playwright/playwright.config.ts). Resolve explicitly rather
// than trusting process.cwd(), which changes depending on where `playwright
// test` is invoked from.
const REPO_ROOT = path.resolve(__dirname, "../..");

const env = loadEnvConfig(REPO_ROOT);

export default defineConfig({
  testDir: "./tests",

  timeout: env.DEFAULT_ACTION_TIMEOUT_MS,
  fullyParallel: true,
  forbidOnly: env.APP_ENV !== "local",
  retries: env.APP_ENV === "local" ? 0 : 2,

  reporter: [
    [process.env.CI ? "dot" : "list"],
    ["html", { outputFolder: "reports/html", open: "never" }],
    ["junit", { outputFile: "reports/junit/results.xml" }],
  ],

  use: {
    actionTimeout: env.DEFAULT_ACTION_TIMEOUT_MS,
    navigationTimeout: env.DEFAULT_NAVIGATION_TIMEOUT_MS,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "cms",
      testDir: "./tests/cms",
      use: { baseURL: getBaseUrl("cms") },
    },
    {
      name: "public",
      testDir: "./tests/public",
      use: { baseURL: getBaseUrl("public") },
    },
    {
      name: "member",
      testDir: "./tests/member",
      use: { baseURL: getBaseUrl("member") },
    },
  ],
});
