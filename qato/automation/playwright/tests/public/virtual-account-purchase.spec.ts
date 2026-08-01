import { loadEnvConfig, type AppEnv } from "@qato/shared";
import { test } from "../../fixtures";
import { completeVirtualAccountPurchase } from "../../journeys/purchase/completeVirtualAccountPurchase.journey";
import { expectVirtualAccountPaymentDisplayed, expectThankYouPageConfirmed } from "../../assertions";

/**
 * Milestone 10 scope, per instruction: Development and Staging only. Both
 * currently use the same product ("Japan Trip Ebook"), matching the
 * verified product-link label from Milestone 6's guest-checkout test.
 */
const SUPPORTED_ENVIRONMENTS: AppEnv[] = ["local", "development", "staging"];
const KNOWN_PRODUCT_LINK_LABEL = "Japan Trip Ebook IDR 85k";

/**
 * This test cannot run unattended: TRANSFER_AMOUNT cannot be derived
 * automatically (see completeVirtualAccountPurchase.journey.ts — no
 * locator exists for the actual Payment Amount value, and the charged
 * amount includes an unknown gateway fee on top of the product price).
 * Supply it by reading the real amount off the payment page:
 *
 *   TRANSFER_AMOUNT=88000 npx playwright test virtual-account-purchase
 *
 * Deliberately NOT tagged @smoke, same reasoning as the OTP-dependent
 * download test — it would always fail unattended in CI. Tagged
 * @regression instead: it skips gracefully (not fails) without
 * TRANSFER_AMOUNT, so it's safe in an unattended regression run.
 */
test(
  "guest can complete a Virtual Account purchase via Duitku sandbox",
  { tag: "@regression" },
  async ({ page }) => {
  const { APP_ENV } = loadEnvConfig();

  test.skip(
    !SUPPORTED_ENVIRONMENTS.includes(APP_ENV),
    `Virtual Account payment is only in scope for local/development/staging (Milestone 10). Current APP_ENV="${APP_ENV}".`,
  );

  const transferAmount = process.env.TRANSFER_AMOUNT;
  test.skip(
    !transferAmount,
    "TRANSFER_AMOUNT env var not provided — this test requires the real payment amount from the checkout page and cannot run unattended. See file header comment.",
  );

  const { paymentStatusPage, thankYouPage } = await completeVirtualAccountPurchase(page, {
    productLinkLabel: KNOWN_PRODUCT_LINK_LABEL,
    transferAmount: transferAmount as string,
  });

  await expectVirtualAccountPaymentDisplayed(paymentStatusPage, "CIMB Niaga Virtual Account");
  await expectThankYouPageConfirmed(thankYouPage);
  },
);
