import { beforeEach, describe, expect, it } from "vitest";
import { resetEnvConfigCache } from "@qato/shared";
import { getTestCreator, getTestMember, getTestProduct } from "../testData";

function setFixtureEnv(overrides: Partial<Record<string, string>> = {}): void {
  const base: Record<string, string> = {
    APP_ENV: "local",
    CMS_BASE_URL: "https://cms.fixture.test",
    PUBLIC_BASE_URL: "https://public.fixture.test",
    MEMBER_BASE_URL: "https://member.fixture.test",
    CREATOR_SLUG: "fixture-creator",
    DEFAULT_ACTION_TIMEOUT_MS: "5000",
    DEFAULT_NAVIGATION_TIMEOUT_MS: "10000",
    CMS_USERNAME: "fixture-user",
    CMS_PASSWORD: "fixture-pass",
    MEMBER_EMAIL: "fixture-member@example.com",
    TEST_PRODUCT_NAME: "Fixture Ebook",
    TEST_PRODUCT_TYPE: "digital",
    TEST_PRODUCT_PRICE: "50000",
    TEST_PRODUCT_CURRENCY: "IDR",
  };

  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    process.env[key] = value;
  }
}

describe("Test Data factory", () => {
  beforeEach(() => {
    resetEnvConfigCache();
    setFixtureEnv();
  });

  it("reads the creator slug from environment config", () => {
    expect(getTestCreator()).toEqual({ slug: "fixture-creator" });
  });

  it("reads the member test account from environment config", () => {
    expect(getTestMember()).toEqual({ email: "fixture-member@example.com" });
  });

  it("reads and coerces the test product from environment config", () => {
    expect(getTestProduct()).toEqual({
      name: "Fixture Ebook",
      type: "digital",
      price: 50000,
      currency: "IDR",
    });
  });

  it("reflects different fixture values per environment (e.g. production)", () => {
    resetEnvConfigCache();
    setFixtureEnv({
      CREATOR_SLUG: "prod-creator",
      TEST_PRODUCT_NAME: "Help-PDF",
      TEST_PRODUCT_PRICE: "10",
    });

    expect(getTestCreator()).toEqual({ slug: "prod-creator" });
    expect(getTestProduct()).toMatchObject({ name: "Help-PDF", price: 10 });
  });

  it("rejects an invalid product type", () => {
    setFixtureEnv({ TEST_PRODUCT_TYPE: "not-a-real-type" });
    expect(() => getTestProduct()).toThrow(/TEST_PRODUCT_TYPE/);
  });

  it("rejects a non-numeric product price", () => {
    setFixtureEnv({ TEST_PRODUCT_PRICE: "not-a-number" });
    expect(() => getTestProduct()).toThrow(/TEST_PRODUCT_PRICE/);
  });
});
