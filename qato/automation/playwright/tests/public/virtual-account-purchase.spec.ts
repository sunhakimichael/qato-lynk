import { loadEnvConfig, type AppEnv } from "@qato/shared";
import { test } from "../../fixtures";
import { completeVirtualAccountPurchase } from "../../journeys/purchase/completeVirtualAccountPurchase.journey";
import { expectVirtualAccountPaymentDisplayed, expectThankYouPageConfirmed } from "../../assertions";
import { getTestProduct, getTestPaymentMethod } from "../../factories";

/**
 * Business-scope decision (ADR-001, docs/ENGINEERING.md), not test data —
 * a sandbox payment flow has no reason to run against production
 * regardless of what's configured. Stays code-level deliberately.
 */
const SUPPORTED_ENVIRONMENTS: AppEnv[] = ["local", "development", "staging"];

/**
 * No longer requires manual input — the payment amount is read directly
 * from MyLink's invoice section via PaymentHelper.getPaymentAmount().
 * Product and payment method are both fully config-driven now
 * (TEST_PRODUCT_LINK_LABEL, TEST_PAYMENT_METHOD_*) — changing either in
 * an .env file is enough, no code change needed.
 *
 * Tagged @regression, not @smoke — a deliberate decision, not a
 * technical limitation. Every run creates a real transaction in Duitku's
 * sandbox and a real order in dev/staging. See ADR-001.
 */
test(
  "guest can complete a Virtual Account purchase via Duitku sandbox",
  { tag: ["@mylink", "@payment", "@regression"] },
  async ({ page }) => {
    const { APP_ENV } = loadEnvConfig();

    test.skip(
      !SUPPORTED_ENVIRONMENTS.includes(APP_ENV),
      `Virtual Account payment is only in scope for local/development/staging (ADR-001). Current APP_ENV="${APP_ENV}".`,
    );

    const { linkLabel } = getTestProduct();
    const paymentMethod = getTestPaymentMethod();

    test.skip(
      !linkLabel || !paymentMethod,
      "TEST_PRODUCT_LINK_LABEL or TEST_PAYMENT_METHOD_* is not configured for this environment — see .env.example.",
    );

    const { paymentStatusPage, thankYouPage } = await completeVirtualAccountPurchase(page);

    await expectVirtualAccountPaymentDisplayed(paymentStatusPage, paymentMethod!.displayName);
    await expectThankYouPageConfirmed(thankYouPage);
  },
);
