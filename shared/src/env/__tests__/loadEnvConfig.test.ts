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

  it("randomizes a Gmail MEMBER_EMAIL once and keeps it stable across reloads", () => {
    const original = {
      MEMBER_EMAIL: process.env.MEMBER_EMAIL,
      RANDOMIZE_MEMBER_EMAIL: process.env.RANDOMIZE_MEMBER_EMAIL,
    };
    process.env.APP_ENV = "local";
    process.env.MEMBER_EMAIL = "qamember123@gmail.com";
    process.env.RANDOMIZE_MEMBER_EMAIL = "true";

    try {
      const first = loadEnvConfig(FIXTURES_DIR).MEMBER_EMAIL;
      expect(first).not.toBe("qamember123@gmail.com");
      expect(first).not.toContain("+");
      const [localPart = "", domain] = first.split("@");
      expect(localPart).toMatch(/^[^.]+(\.[^.]+){1,3}$/);
      expect(localPart.replace(/\./g, "")).toBe("qamember123");
      expect(domain).toBe("gmail.com");

      // Simulates a Playwright worker: fresh cache, inherited process.env.
      resetEnvConfigCache();
      expect(loadEnvConfig(FIXTURES_DIR).MEMBER_EMAIL).toBe(first);
    } finally {
      for (const [key, value] of Object.entries(original)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  });

  it("rejects RANDOMIZE_MEMBER_EMAIL for a non-Gmail address", () => {
    const original = {
      MEMBER_EMAIL: process.env.MEMBER_EMAIL,
      RANDOMIZE_MEMBER_EMAIL: process.env.RANDOMIZE_MEMBER_EMAIL,
    };
    process.env.APP_ENV = "local";
    process.env.MEMBER_EMAIL = "qa@example.com";
    process.env.RANDOMIZE_MEMBER_EMAIL = "true";

    try {
      expect(() => loadEnvConfig(FIXTURES_DIR)).toThrow(/requires a Gmail MEMBER_EMAIL/);
    } finally {
      for (const [key, value] of Object.entries(original)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  });
});
