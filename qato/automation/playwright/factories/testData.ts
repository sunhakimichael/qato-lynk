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
}

function formatZodIssues(issues: { path: (string | number)[]; message: string }[]): string {
  return issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
}

function parseTestDataConfig() {
  // Guarantees the correct .env file for the active APP_ENV has been loaded
  // into process.env, even if this module is imported before playwright.config.ts
  // runs (e.g. a standalone unit test). loadEnvConfig() is cached, so this is cheap.
  loadEnvConfig();

  const parsed = TestDataConfigSchema.safeParse(process.env);
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
  };
}
