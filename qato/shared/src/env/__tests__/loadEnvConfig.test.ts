import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadEnvConfig, resetEnvConfigCache } from "../loadEnvConfig";

const FIXTURES_DIR = path.resolve(__dirname, "fixtures");

describe("loadEnvConfig", () => {
  const originalAppEnv = process.env.APP_ENV;

  beforeEach(() => {
    resetEnvConfigCache();
  });

  afterEach(() => {
    resetEnvConfigCache();
    if (originalAppEnv === undefined) {
      delete process.env.APP_ENV;
    } else {
      process.env.APP_ENV = originalAppEnv;
    }
  });

  it("loads and validates config from the file matching APP_ENV", () => {
    process.env.APP_ENV = "local";

    const config = loadEnvConfig(FIXTURES_DIR);

    expect(config.APP_ENV).toBe("local");
    expect(config.CMS_BASE_URL).toBe("https://cms.fixture.test");
    expect(config.CREATOR_SLUG).toBe("fixture-creator");
    expect(config.DEFAULT_ACTION_TIMEOUT_MS).toBe(5000);
  });

  it("throws a descriptive error for an invalid APP_ENV", () => {
    process.env.APP_ENV = "qa-sandbox";

    expect(() => loadEnvConfig(FIXTURES_DIR)).toThrow(/Invalid APP_ENV "qa-sandbox"/);
  });

  it("caches the resolved config across calls", () => {
    process.env.APP_ENV = "local";

    const first = loadEnvConfig(FIXTURES_DIR);
    const second = loadEnvConfig(FIXTURES_DIR);

    expect(first).toBe(second);
  });
});
