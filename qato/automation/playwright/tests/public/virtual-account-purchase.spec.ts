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
 * No longer requires manual input — the payment amount is read directly
 * from MyLink's invoice section via PaymentHelper.getPaymentAmount(),
 * matching your source-of-truth requirement (see
 * journeys/purchase/completeVirtualAccountPurchase.journey.ts and
 * helpers/PaymentHelper.ts).
 *
 * Still tagged @regression, not @smoke — that's now a deliberate choice,
 * not a technical limitation. Every run of this test creates a real
 * transaction in Duitku's sandbox and a real order in dev/staging.
 * Running it on every push (via @smoke) would accumulate that data
 * indefinitely with no cleanup anywhere in this project. Promoting it to
 * @smoke is a real option now, but it's a test-data-hygiene decision to
 * make deliberately, not a side effect of this fix.
 */
test(
  "guest can complete a Virtual Account purchase via Duitku sandbox",
  { tag: ["@mylink", "@payment", "@regression"] },
  async ({ page }) => {
    const { APP_ENV } = loadEnvConfig();

    test.skip(
      !SUPPORTED_ENVIRONMENTS.includes(APP_ENV),
      `Virtual Account payment is only in scope for local/development/staging (Milestone 10). Current APP_ENV="${APP_ENV}".`,
    );

    const { paymentStatusPage, thankYouPage } = await completeVirtualAccountPurchase(page, {
      productLinkLabel: KNOWN_PRODUCT_LINK_LABEL,
    });

    await expectVirtualAccountPaymentDisplayed(paymentStatusPage, "CIMB Niaga Virtual Account");
    await expectThankYouPageConfirmed(thankYouPage);
  },
);
