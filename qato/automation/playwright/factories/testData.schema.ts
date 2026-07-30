import { z } from "zod";

/** Product types the automation suite currently knows how to handle. */
export const ProductTypeSchema = z.enum(["digital", "physical", "subscription"]);
export type ProductType = z.infer<typeof ProductTypeSchema>;

/**
 * Test-product fixture fields, sourced from the same per-environment .env
 * files as shared/env, but validated separately: this data is specific to
 * QA automation fixtures, not a connectivity concern the dashboard app
 * would ever need.
 */
export const TestDataConfigSchema = z.object({
  TEST_PRODUCT_NAME: z.string().min(1),
  TEST_PRODUCT_TYPE: ProductTypeSchema,
  TEST_PRODUCT_PRICE: z.coerce.number().nonnegative(),
  // ISO 4217 currency code, e.g. "IDR", "USD" — always 3 letters.
  TEST_PRODUCT_CURRENCY: z.string().length(3),
});

export type TestDataConfig = z.infer<typeof TestDataConfigSchema>;
