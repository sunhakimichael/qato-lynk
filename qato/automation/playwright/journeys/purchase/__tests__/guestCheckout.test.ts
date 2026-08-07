import { beforeEach, describe, expect, it } from "vitest";
import type { Page } from "@playwright/test";
import { resetEnvConfigCache } from "@qato/shared";
import { guestCheckout } from "../guestCheckout.journey";

// Never touched: both validation checks throw before guestCheckout ever
// calls a method on `page`, so a bare object satisfies the type without
// needing a real browser.
const fakePage = {} as Page;

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

  delete process.env.TEST_PRODUCT_LINK_LABEL;
  delete process.env.TEST_PAYMENT_METHOD_POSITION;
  delete process.env.TEST_PAYMENT_METHOD_CHANNEL_LABEL;
  delete process.env.TEST_PAYMENT_METHOD_DISPLAY_NAME;

  for (const [key, value] of Object.entries({ ...base, ...overrides })) {
    process.env[key] = value;
  }
}

describe("guestCheckout — config validation", () => {
  beforeEach(() => {
    resetEnvConfigCache();
    setFixtureEnv();
  });

  it("throws a clear, actionable error when no product link label is configured or overridden", async () => {
    await expect(guestCheckout(fakePage)).rejects.toThrow(/TEST_PRODUCT_LINK_LABEL/);
  });

  it("throws a clear, actionable error when no payment method position is configured or overridden", async () => {
    setFixtureEnv({ TEST_PRODUCT_LINK_LABEL: "Fixture Ebook IDR 50k" });
    await expect(guestCheckout(fakePage)).rejects.toThrow(/TEST_PAYMENT_METHOD_POSITION/);
  });

  it("does not complain about the product label once an explicit override is passed", async () => {
    // Still no TEST_PAYMENT_METHOD_POSITION configured, so it should get
    // past the product-label check and fail on payment method instead —
    // proving the override actually takes effect.
    await expect(
      guestCheckout(fakePage, { productLinkLabel: "Explicit Override IDR 1k" }),
    ).rejects.toThrow(/TEST_PAYMENT_METHOD_POSITION/);
  });
});
