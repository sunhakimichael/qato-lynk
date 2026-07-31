import { loadEnvConfig, type AppEnv } from "@qato/shared";
import { test } from "../../fixtures";
import { guestCheckout } from "../../journeys/purchase/guestCheckout.journey";
import { expectPaymentConfirmed } from "../../assertions";

/**
 * Verified product link accessible-name labels, per environment, sourced
 * directly from the Milestone 3 codegen session.
 *
 * Production is intentionally absent: the "85k" thousands-abbreviation
 * format was only confirmed for prices >= 1,000 (dev/staging's fixture,
 * "Japan Trip Ebook" at 85,000 IDR). Production's fixture ("Help-PDF" at
 * 10 IDR) has an unverified display format for sub-1,000 values — do not
 * guess it here. Add it once confirmed (e.g. via codegen against production).
 */
const KNOWN_PRODUCT_LINK_LABELS: Partial<Record<AppEnv, string>> = {
  local: "Japan Trip Ebook IDR 85k",
  development: "Japan Trip Ebook IDR 85k",
  staging: "Japan Trip Ebook IDR 85k",
};

test(
  "guest can complete checkout and reach a confirmed payment status",
  { tag: "@smoke" },
  async ({ page }) => {
    const { APP_ENV } = loadEnvConfig();
    const productLinkLabel = KNOWN_PRODUCT_LINK_LABELS[APP_ENV];

    test.skip(
      !productLinkLabel,
      `Product link label unverified for APP_ENV="${APP_ENV}" — see locators/public/storefrontPage.locators.ts`,
    );

    const paymentStatusPage = await guestCheckout(page, {
      productLinkLabel: productLinkLabel as string,
    });
    await expectPaymentConfirmed(paymentStatusPage);
  },
);
