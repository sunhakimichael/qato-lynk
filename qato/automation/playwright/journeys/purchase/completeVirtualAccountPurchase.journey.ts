import type { Page } from "@playwright/test";
import { PublicStorefrontPage } from "../../pages/public/PublicStorefrontPage";
import { PublicProductDetailPage } from "../../pages/public/PublicProductDetailPage";
import { PublicCheckoutPage } from "../../pages/public/PublicCheckoutPage";
import { PublicPaymentStatusPage } from "../../pages/public/PublicPaymentStatusPage";
import { ThankYouPage } from "../../pages/public/ThankYouPage";
import { DuitkuSandboxPage } from "../../pages/payment-providers/duitku/DuitkuSandboxPage";
import type { VirtualAccountPaymentProvider } from "../../pages/payment-providers/VirtualAccountPaymentProvider";
import { PaymentHelper } from "../../helpers/PaymentHelper";
import { getTestMember, getTestProduct, getTestPaymentMethod } from "../../factories";

export interface VirtualAccountPurchaseOptions {
  /**
   * Exact accessible name of the product link, e.g. "Japan Trip Ebook IDR
   * 85k". Defaults to getTestProduct().linkLabel — pass explicitly only to
   * override the configured product for a specific test.
   */
  productLinkLabel?: string;
  /**
   * Buyer email for guest checkout. Defaults to getTestMember().email
   * (the same account used by the Member Login/Library/Download journeys)
   * rather than the throwaway address seen in the recorded codegen
   * session (a disposable-looking address, likely used to avoid
   * cluttering the real test inbox). This is a deliberate deviation: for
   * "continue with Library and Download verification" to actually work,
   * the purchase must belong to the same account that later logs in to
   * check the library. Override only if you don't need that chaining.
   */
  buyerEmail?: string;
  /** 1-indexed position in the payment method list. Defaults to getTestPaymentMethod().position. */
  paymentMethodPosition?: number;
  /** Exact channel label in Duitku's sandbox dropdown. Defaults to getTestPaymentMethod().channelLabel. */
  channelLabel?: string;
  /** Defaults to a new DuitkuSandboxPage — override to use a different provider without touching this journey. */
  paymentProvider?: VirtualAccountPaymentProvider;
}

export interface VirtualAccountPurchaseResult {
  paymentStatusPage: PublicPaymentStatusPage;
  thankYouPage: ThankYouPage;
}

/**
 * Full Virtual Account purchase flow:
 *
 *   Storefront -> Product Detail -> Checkout -> Generate VA
 *   -> Read VA Number -> Read Amount (from MyLink, source of truth)
 *   -> Open Duitku Sandbox -> Input VA -> Input Amount -> Pay
 *   -> Verify Success -> back to MyLink -> payment status verified
 *   -> Thank You page
 *
 * The payment amount is always read from MyLink — never from test data
 * or hardcoded config — via PaymentHelper.getPaymentAmount(), so this
 * keeps working if product prices, discounts, taxes, or promotions
 * change. DuitkuSandboxPage independently verifies the amount it actually
 * entered matches what it was given, throwing PaymentMismatchError on any
 * discrepancy (see that class for details).
 *
 * Product and payment method both resolve from config (TEST_PRODUCT_LINK_LABEL,
 * TEST_PAYMENT_METHOD_*) by default and throw a clear error if neither
 * config nor an explicit override supplies them — this framework never
 * falls back to a hardcoded product or payment method.
 *
 * Does NOT chain into Library/Download itself (see journeys/member/) —
 * those still require a separately-supplied OTP code, so combining them
 * here would just move that requirement rather than remove it. Call
 * downloadPurchasedContent() afterward with the same buyerEmail if you
 * need the full chain.
 */
export async function completeVirtualAccountPurchase(
  page: Page,
  options: VirtualAccountPurchaseOptions = {},
): Promise<VirtualAccountPurchaseResult> {
  const productLinkLabel = options.productLinkLabel ?? getTestProduct().linkLabel;
  if (!productLinkLabel) {
    throw new Error(
      "No product link label available: set TEST_PRODUCT_LINK_LABEL in your .env file for this " +
        "environment, or pass productLinkLabel explicitly.",
    );
  }

  const testPaymentMethod = getTestPaymentMethod();
  const paymentMethodPosition = options.paymentMethodPosition ?? testPaymentMethod?.position;
  if (paymentMethodPosition === undefined) {
    throw new Error(
      "No payment method position available: set TEST_PAYMENT_METHOD_POSITION in your .env file " +
        "for this environment, or pass paymentMethodPosition explicitly.",
    );
  }

  const channelLabel = options.channelLabel ?? testPaymentMethod?.channelLabel;
  if (!channelLabel) {
    throw new Error(
      "No payment channel label available: set TEST_PAYMENT_METHOD_CHANNEL_LABEL in your .env " +
        "file for this environment, or pass channelLabel explicitly.",
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

  const paymentStatusPage = new PublicPaymentStatusPage(page);
  await paymentStatusPage.waitForLoad();

  const provider: VirtualAccountPaymentProvider =
    options.paymentProvider ?? new DuitkuSandboxPage(page, channelLabel);
  const paymentHelper = new PaymentHelper(paymentStatusPage, provider);

  const vaNumber = await paymentHelper.getVirtualAccountNumber();
  const paymentAmount = await paymentHelper.getPaymentAmount();

  await paymentHelper.payViaDuitkuSandbox(vaNumber, paymentAmount);

  await paymentStatusPage.clickCheckTransaction();

  const thankYouPage = new ThankYouPage(page);
  await thankYouPage.waitForLoad();

  return { paymentStatusPage, thankYouPage };
}
