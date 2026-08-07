import type { Page } from "@playwright/test";
import { PublicStorefrontPage } from "../../pages/public/PublicStorefrontPage";
import { PublicProductDetailPage } from "../../pages/public/PublicProductDetailPage";
import { PublicCheckoutPage } from "../../pages/public/PublicCheckoutPage";
import { PublicPaymentStatusPage } from "../../pages/public/PublicPaymentStatusPage";
import { getTestMember, getTestProduct, getTestPaymentMethod } from "../../factories";

export interface GuestCheckoutOptions {
  /**
   * Exact accessible name of the product link as rendered on the
   * storefront, e.g. "Japan Trip Ebook IDR 85k". Defaults to
   * getTestProduct().linkLabel (TEST_PRODUCT_LINK_LABEL in config) — pass
   * this explicitly only to override the configured product for a
   * specific test. Throws if neither is available: this framework never
   * falls back to a hardcoded product, so changing test data never
   * requires a code change.
   */
  productLinkLabel?: string;
  buyerEmail?: string;
  /**
   * 1-indexed position in the payment method list. FRAGILE — see
   * locators/public/checkoutPage.locators.ts. Defaults to
   * getTestPaymentMethod().position (TEST_PAYMENT_METHOD_POSITION in
   * config), same reasoning as productLinkLabel above.
   */
  paymentMethodPosition?: number;
}

/**
 * Guest checkout: Storefront -> Product Detail -> Checkout -> Payment
 * confirmation. Matches the recorded codegen session exactly.
 *
 * This is NOT the full "Purchase Journey" from the project brief, which
 * continues Member Login -> Library -> Download. Those steps need Page
 * Objects for the Library/Download pages, and no codegen has been
 * recorded for them yet. This journey covers only what's been verified:
 * guest checkout through invoice confirmation. Extend it (or compose it
 * with a member-login journey) once those pages exist.
 */
export async function guestCheckout(
  page: Page,
  options: GuestCheckoutOptions = {},
): Promise<PublicPaymentStatusPage> {
  const productLinkLabel = options.productLinkLabel ?? getTestProduct().linkLabel;
  if (!productLinkLabel) {
    throw new Error(
      "No product link label available: set TEST_PRODUCT_LINK_LABEL in your .env file for this " +
        "environment, or pass productLinkLabel explicitly.",
    );
  }

  const paymentMethodPosition = options.paymentMethodPosition ?? getTestPaymentMethod()?.position;
  if (paymentMethodPosition === undefined) {
    throw new Error(
      "No payment method position available: set TEST_PAYMENT_METHOD_POSITION in your .env file " +
        "for this environment, or pass paymentMethodPosition explicitly.",
    );
  }

  const storefront = new PublicStorefrontPage(page);
  await storefront.goto();
  await storefront.clickProduct(productLinkLabel);

  const productDetail = new PublicProductDetailPage(page);
  await productDetail.clickBuyNow();

  const checkout = new PublicCheckoutPage(page);
  await checkout.fillEmail(options.buyerEmail ?? getTestMember().email);
  await checkout.openPaymentMethodSelector();
  await checkout.selectPaymentMethodByPosition(paymentMethodPosition);
  await checkout.confirmPaymentMethod();
  await checkout.acceptTermsOfUse();
  await checkout.acceptCommunicationConsent();
  await checkout.submitPurchase();

  const paymentStatus = new PublicPaymentStatusPage(page);
  await paymentStatus.waitForLoad();
  return paymentStatus;
}
