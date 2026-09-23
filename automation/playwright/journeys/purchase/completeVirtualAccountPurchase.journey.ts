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
  /** Exact channel label in Duitku's sandbox dropdown. Defaults to getTestPaymentMethod().channelLabel. */
  channelLabel?: string;
  /** Defaults to a new DuitkuSandboxPage — override to use a different provider without touching this journey. */
  paymentProvider?: VirtualAccountPaymentProvider;
  /**
   * Runs while the MyLink payment page (VA details) is still displayed,
   * before paying — the page moves to Thank You afterwards, so assertions
   * on the VA details must happen here.
   */
  onPaymentPageReady?: (paymentStatusPage: PublicPaymentStatusPage) => Promise<void>;
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
 *   -> Open Duitku Sandbox (new tab) -> Bank Transfer -> CIMB NIAGA VA
 *   -> Input VA -> Check -> Transfer Amount = Duitku's Amount -> Pay
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
 * The product resolves from config (TEST_PRODUCT_LINK_LABEL) and throws a
 * clear error if neither config nor an explicit override supplies it. The
 * checkout payment method is always CIMB Niaga Virtual Account (selected by
 * code, see PublicCheckoutPage.selectCimbNiagaVirtualAccount) — every other
 * method fails in the sandbox.
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

  const channelLabel = options.channelLabel ?? getTestPaymentMethod()?.channelLabel;
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
  await checkout.waitForLoad();
  await checkout.fillEmail(options.buyerEmail ?? getTestMember().email);
  await checkout.openPaymentMethodSelector();
  await checkout.selectCimbNiagaVirtualAccount();
  await checkout.confirmPaymentMethod();
  await checkout.acceptTermsOfUse();
  await checkout.acceptCommunicationConsent();
  await checkout.submitPurchase();

  const paymentStatusPage = new PublicPaymentStatusPage(page);
  await paymentStatusPage.waitForLoad();
  await options.onPaymentPageReady?.(paymentStatusPage);

  // The sandbox gets its own tab so the MyLink payment page stays open for
  // "Check Transaction" afterwards.
  const sandboxTab = options.paymentProvider ? undefined : await page.context().newPage();
  const provider: VirtualAccountPaymentProvider =
    options.paymentProvider ?? new DuitkuSandboxPage(sandboxTab!, channelLabel);
  const paymentHelper = new PaymentHelper(paymentStatusPage, provider);

  const vaNumber = await paymentHelper.getVirtualAccountNumber();
  const paymentAmount = await paymentHelper.getPaymentAmount();

  try {
    await paymentHelper.payViaDuitkuSandbox(vaNumber, paymentAmount);
  } finally {
    await sandboxTab?.close();
  }
  await page.bringToFront();

  await paymentStatusPage.clickCheckTransaction();

  const thankYouPage = new ThankYouPage(page);
  await thankYouPage.waitForLoad();

  return { paymentStatusPage, thankYouPage };
}
