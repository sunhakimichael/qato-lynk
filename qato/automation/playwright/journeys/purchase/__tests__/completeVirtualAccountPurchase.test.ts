import { beforeEach, describe, expect, it } from "vitest";
import type { Page } from "@playwright/test";
import { resetEnvConfigCache } from "@qato/shared";
import { completeVirtualAccountPurchase } from "../completeVirtualAccountPurchase.journey";

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

describe("completeVirtualAccountPurchase — config validation", () => {
  beforeEach(() => {
    resetEnvConfigCache();
    setFixtureEnv();
  });

  it("throws when no product link label is configured or overridden", async () => {
    await expect(completeVirtualAccountPurchase(fakePage)).rejects.toThrow(
      /TEST_PRODUCT_LINK_LABEL/,
    );
  });

  it("throws when no payment method position is configured or overridden", async () => {
    setFixtureEnv({ TEST_PRODUCT_LINK_LABEL: "Fixture Ebook IDR 50k" });
    await expect(completeVirtualAccountPurchase(fakePage)).rejects.toThrow(
      /TEST_PAYMENT_METHOD_POSITION/,
    );
  });

  it("throws when no payment channel label is configured or overridden", async () => {
    // getTestPaymentMethod() is all-or-nothing — it only returns a value
    // once ALL three fields are configured. So to isolate the
    // channel-label check specifically, position must come from an
    // explicit override (bypassing the position check) while channel
    // label remains unavailable from either config or an override.
    setFixtureEnv({ TEST_PRODUCT_LINK_LABEL: "Fixture Ebook IDR 50k" });
    await expect(
      completeVirtualAccountPurchase(fakePage, { paymentMethodPosition: 6 }),
    ).rejects.toThrow(/TEST_PAYMENT_METHOD_CHANNEL_LABEL/);
  });
});
