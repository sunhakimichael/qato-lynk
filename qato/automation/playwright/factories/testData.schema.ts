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
export const TestDataConfigSchema = z
  .object({
    TEST_PRODUCT_NAME: z.string().min(1),
    TEST_PRODUCT_TYPE: ProductTypeSchema,
    TEST_PRODUCT_PRICE: z.coerce.number().nonnegative(),
    // ISO 4217 currency code, e.g. "IDR", "USD" — always 3 letters.
    TEST_PRODUCT_CURRENCY: z.string().length(3),

    /**
     * Exact accessible-name text of the product link as it appears on the
     * storefront, e.g. "Japan Trip Ebook IDR 85k". Optional: left unset in
     * environments where the display-price formatting hasn't been
     * verified (e.g. production — see docs/ENGINEERING.md). Tests that
     * need this must check for its presence and skip with a clear reason
     * if it's absent, rather than guess.
     */
    TEST_PRODUCT_LINK_LABEL: z.string().min(1).optional(),

    /** 1-indexed position in the storefront's payment method list. Optional — only meaningful where Virtual Account payment is in scope. */
    TEST_PAYMENT_METHOD_POSITION: z.coerce.number().int().positive().optional(),
    /** Exact channel label as shown in the payment provider's own UI, e.g. "CIMB NIAGA VA". */
    TEST_PAYMENT_METHOD_CHANNEL_LABEL: z.string().min(1).optional(),
    /** Exact payment method display text on the MyLink payment page, e.g. "CIMB Niaga Virtual Account". */
    TEST_PAYMENT_METHOD_DISPLAY_NAME: z.string().min(1).optional(),
  })
  .refine(
    (data) =>
      !data.TEST_PRODUCT_LINK_LABEL ||
      data.TEST_PRODUCT_LINK_LABEL.toLowerCase().includes(data.TEST_PRODUCT_NAME.toLowerCase()),
    {
      message:
        "TEST_PRODUCT_LINK_LABEL must contain TEST_PRODUCT_NAME — likely stale data if it doesn't " +
        "(e.g. the product name was updated but the link label wasn't).",
      path: ["TEST_PRODUCT_LINK_LABEL"],
    },
  );

export type TestDataConfig = z.infer<typeof TestDataConfigSchema>;
