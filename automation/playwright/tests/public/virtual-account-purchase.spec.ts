import { loadEnvConfig, type AppEnv } from "@qato/shared";
import { test } from "../../fixtures";
import { completeVirtualAccountPurchase } from "../../journeys/purchase/completeVirtualAccountPurchase.journey";
import { verifyOrderInCms } from "../../journeys/creator/verifyOrderInCms.journey";
import {
  expectVirtualAccountPaymentDisplayed,
  expectThankYouPageConfirmed,
  expectOrderListedInCms,
  expectOrderDetailsMatchPurchase,
} from "../../assertions";
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
  async ({ page, browser }) => {
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

    const { thankYouPage, purchase } = await test.step("Buy the product and pay via Duitku sandbox", () =>
      completeVirtualAccountPurchase(page, {
        onPaymentPageReady: (paymentStatusPage) =>
          expectVirtualAccountPaymentDisplayed(paymentStatusPage, paymentMethod!.displayName),
      }),
    );
    await expectThankYouPageConfirmed(thankYouPage);
    await test.info().attach("purchase-record", {
      body: JSON.stringify(purchase, null, 2),
      contentType: "application/json",
    });

    // The creator logs in from a separate browser context: MyLink and the CMS
    // share a domain, and the creator session must not mix with the buyer's.
    const creatorContext = await browser.newContext();
    try {
      const { listEntry, details } = await test.step("Verify the order in CMS Orders", async () => {
        const creatorPage = await creatorContext.newPage();
        creatorPage.setDefaultTimeout(loadEnvConfig().DEFAULT_ACTION_TIMEOUT_MS);
        creatorPage.setDefaultNavigationTimeout(loadEnvConfig().DEFAULT_NAVIGATION_TIMEOUT_MS);
        const result = await verifyOrderInCms(creatorPage, purchase);
        expectOrderListedInCms(result.listEntry, purchase);
        expectOrderDetailsMatchPurchase(result.details, purchase);
        return result;
      });
      await test.info().attach("cms-order", {
        body: JSON.stringify({ listEntry, details }, null, 2),
        contentType: "application/json",
      });
    } finally {
      await creatorContext.close();
    }
  },
);
