import { test } from "../../fixtures";
import { guestCheckout } from "../../journeys/purchase/guestCheckout.journey";
import { expectPaymentConfirmed } from "../../assertions";
import { getTestProduct } from "../../factories";

test(
  "guest can complete checkout and reach a confirmed payment status",
  { tag: ["@mylink", "@smoke", "@regression"] },
  async ({ page }) => {
    const { linkLabel } = getTestProduct();

    // Skips cleanly (not fails) if TEST_PRODUCT_LINK_LABEL isn't
    // configured for this environment — e.g. production, where the
    // storefront's price-display formatting hasn't been verified. See
    // .env.example and docs/ENGINEERING.md.
    test.skip(
      !linkLabel,
      "TEST_PRODUCT_LINK_LABEL is not configured for this environment — see .env.example.",
    );

    const paymentStatusPage = await guestCheckout(page);
    await expectPaymentConfirmed(paymentStatusPage);
  },
);
