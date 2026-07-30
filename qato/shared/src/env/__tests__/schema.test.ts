import { describe, expect, it } from "vitest";
import { EnvConfigSchema } from "../schema";

const validConfig = {
  APP_ENV: "local",
  CMS_BASE_URL: "https://cms.example.com",
  PUBLIC_BASE_URL: "https://public.example.com",
  MEMBER_BASE_URL: "https://member.example.com",
  CREATOR_SLUG: "acme-creator",
  DEFAULT_ACTION_TIMEOUT_MS: "15000",
  DEFAULT_NAVIGATION_TIMEOUT_MS: "30000",
  CMS_USERNAME: "qa-user",
  CMS_PASSWORD: "qa-pass",
  MEMBER_EMAIL: "qa@example.com",
};

describe("EnvConfigSchema", () => {
  it("accepts a fully valid config", () => {
    const result = EnvConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it("coerces numeric timeout strings to numbers", () => {
    const result = EnvConfigSchema.parse(validConfig);
    expect(result.DEFAULT_ACTION_TIMEOUT_MS).toBe(15000);
    expect(result.DEFAULT_NAVIGATION_TIMEOUT_MS).toBe(30000);
  });

  it("allows API_BASE_URL to be omitted", () => {
    const { API_BASE_URL, ...rest } = validConfig as Record<string, unknown>;
    const result = EnvConfigSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it("rejects a missing CMS_BASE_URL", () => {
    const { CMS_BASE_URL, ...rest } = validConfig;
    const result = EnvConfigSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects a non-URL value for a base URL field", () => {
    const result = EnvConfigSchema.safeParse({ ...validConfig, PUBLIC_BASE_URL: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty CREATOR_SLUG", () => {
    const result = EnvConfigSchema.safeParse({ ...validConfig, CREATOR_SLUG: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid MEMBER_EMAIL", () => {
    const result = EnvConfigSchema.safeParse({ ...validConfig, MEMBER_EMAIL: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid APP_ENV value", () => {
    const result = EnvConfigSchema.safeParse({ ...validConfig, APP_ENV: "qa-sandbox" });
    expect(result.success).toBe(false);
  });
});
