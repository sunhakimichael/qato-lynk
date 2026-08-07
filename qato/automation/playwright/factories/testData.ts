import { loadEnvConfig } from "@qato/shared";
import { getCreatorSlug } from "../config/environments";
import { TestDataConfigSchema, type ProductType } from "./testData.schema";

export interface TestCreator {
  slug: string;
}

export interface TestMember {
  email: string;
}

export interface TestProduct {
  name: string;
  type: ProductType;
  price: number;
  currency: string;
  /**
   * Exact storefront link text, e.g. "Japan Trip Ebook IDR 85k". Undefined
   * in environments where the display-price format hasn't been verified
   * (see docs/ENGINEERING.md) — callers must check for this and skip with
   * a clear reason rather than guess.
   */
  linkLabel?: string;
}

export interface TestPaymentMethod {
  /** 1-indexed position in the storefront's payment method list. */
  position: number;
  /** Exact channel label as shown in the payment provider's own UI. */
  channelLabel: string;
  /** Exact payment method display text on the MyLink payment page. */
  displayName: string;
}

function formatZodIssues(issues: { path: (string | number)[]; message: string }[]): string {
  return issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
}

function parseTestDataConfig() {
  // Guarantees the correct .env file for the active APP_ENV has been loaded
  // into process.env, even if this module is imported before playwright.config.ts
  // runs (e.g. a standalone unit test). loadEnvConfig() is cached, so this is cheap.
  loadEnvConfig();

  // dotenv leaves unset-but-declared variables as empty strings (e.g.
  // "TEST_PRODUCT_LINK_LABEL="). Treat those as absent so the optional
  // fields validate correctly instead of failing min(1) checks on "" —
  // same fix as shared/env/loadEnvConfig.ts.
  const rawMerged: Record<string, string | undefined> = { ...process.env };
  const normalized = Object.fromEntries(
    Object.entries(rawMerged).map(([key, value]) => [key, value === "" ? undefined : value]),
  );

  const parsed = TestDataConfigSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new Error(`Test data validation failed:\n${formatZodIssues(parsed.error.issues)}`);
  }
  return parsed.data;
}

/** The creator whose CMS/storefront the active environment's fixtures belong to. */
export function getTestCreator(): TestCreator {
  return { slug: getCreatorSlug() };
}

/** The Member Area test account for the active environment. */
export function getTestMember(): TestMember {
  return { email: loadEnvConfig().MEMBER_EMAIL };
}

/** The fixture product used for purchase-flow journeys in the active environment. */
export function getTestProduct(): TestProduct {
  const config = parseTestDataConfig();
  return {
    name: config.TEST_PRODUCT_NAME,
    type: config.TEST_PRODUCT_TYPE,
    price: config.TEST_PRODUCT_PRICE,
    currency: config.TEST_PRODUCT_CURRENCY,
    linkLabel: config.TEST_PRODUCT_LINK_LABEL,
  };
}

/**
 * The payment method used for Virtual Account purchase-flow journeys.
 * Returns undefined if not configured for the active environment (e.g.
 * production, where the payment flow is out of scope by design — see
 * ADR-001 in docs/ENGINEERING.md). Callers must check for this and skip
 * with a clear reason rather than fall back to a hardcoded default.
 */
export function getTestPaymentMethod(): TestPaymentMethod | undefined {
  const config = parseTestDataConfig();
  const { TEST_PAYMENT_METHOD_POSITION, TEST_PAYMENT_METHOD_CHANNEL_LABEL, TEST_PAYMENT_METHOD_DISPLAY_NAME } =
    config;

  if (
    TEST_PAYMENT_METHOD_POSITION === undefined ||
    TEST_PAYMENT_METHOD_CHANNEL_LABEL === undefined ||
    TEST_PAYMENT_METHOD_DISPLAY_NAME === undefined
  ) {
    return undefined;
  }

  return {
    position: TEST_PAYMENT_METHOD_POSITION,
    channelLabel: TEST_PAYMENT_METHOD_CHANNEL_LABEL,
    displayName: TEST_PAYMENT_METHOD_DISPLAY_NAME,
  };
}
