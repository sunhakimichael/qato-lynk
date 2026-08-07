import { beforeEach, describe, expect, it } from "vitest";
import { resetEnvConfigCache } from "@qato/shared";
import { getTestCreator, getTestMember, getTestProduct, getTestPaymentMethod } from "../testData";

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

  // process.env is a shared global across every test in this file —
  // explicitly clear the optional fields so a value set by one test
  // never leaks into a later test that expects it to be absent.
  delete process.env.TEST_PRODUCT_LINK_LABEL;
  delete process.env.TEST_PAYMENT_METHOD_POSITION;
  delete process.env.TEST_PAYMENT_METHOD_CHANNEL_LABEL;
  delete process.env.TEST_PAYMENT_METHOD_DISPLAY_NAME;

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

  it("reads the product link label when configured", () => {
    setFixtureEnv({ TEST_PRODUCT_LINK_LABEL: "Fixture Ebook IDR 50k" });
    expect(getTestProduct().linkLabel).toBe("Fixture Ebook IDR 50k");
  });

  it("returns an undefined link label when not configured (e.g. unverified in production)", () => {
    expect(getTestProduct().linkLabel).toBeUndefined();
  });

  it("treats an empty-string link label the same as unset (dotenv quirk)", () => {
    setFixtureEnv({ TEST_PRODUCT_LINK_LABEL: "" });
    expect(getTestProduct().linkLabel).toBeUndefined();
  });

  it("rejects a link label that doesn't contain the product name (stale-data guard)", () => {
    setFixtureEnv({ TEST_PRODUCT_LINK_LABEL: "Some Other Product IDR 10k" });
    expect(() => getTestProduct()).toThrow(/must contain TEST_PRODUCT_NAME/);
  });

  it("returns the full payment method when all fields are configured", () => {
    setFixtureEnv({
      TEST_PAYMENT_METHOD_POSITION: "6",
      TEST_PAYMENT_METHOD_CHANNEL_LABEL: "CIMB NIAGA VA",
      TEST_PAYMENT_METHOD_DISPLAY_NAME: "CIMB Niaga Virtual Account",
    });

    expect(getTestPaymentMethod()).toEqual({
      position: 6,
      channelLabel: "CIMB NIAGA VA",
      displayName: "CIMB Niaga Virtual Account",
    });
  });

  it("returns undefined when payment method fields are not configured (e.g. production)", () => {
    expect(getTestPaymentMethod()).toBeUndefined();
  });

  it("returns undefined when only some payment method fields are configured", () => {
    setFixtureEnv({ TEST_PAYMENT_METHOD_POSITION: "6" });
    expect(getTestPaymentMethod()).toBeUndefined();
  });
});
