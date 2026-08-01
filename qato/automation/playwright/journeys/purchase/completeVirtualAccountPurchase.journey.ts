import type { Page } from "@playwright/test";
import { PublicStorefrontPage } from "../../pages/public/PublicStorefrontPage";
import { PublicProductDetailPage } from "../../pages/public/PublicProductDetailPage";
import { PublicCheckoutPage } from "../../pages/public/PublicCheckoutPage";
import { PublicPaymentStatusPage } from "../../pages/public/PublicPaymentStatusPage";
import { ThankYouPage } from "../../pages/public/ThankYouPage";
import { DuitkuSandboxPage } from "../../pages/payment-providers/duitku/DuitkuSandboxPage";
import type { VirtualAccountPaymentProvider } from "../../pages/payment-providers/VirtualAccountPaymentProvider";
import { getTestMember } from "../../factories";

export interface VirtualAccountPurchaseOptions {
  /** Exact accessible name of the product link, e.g. "Japan Trip Ebook IDR 85k". */
  productLinkLabel: string;
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
  /** 1-indexed position in the payment method list. Defaults to 6 — confirmed by this session to be "CIMB Niaga Virtual Account". */
  paymentMethodPosition?: number;
  /** Exact channel label in Duitku's sandbox dropdown, e.g. "CIMB NIAGA VA". Passed through to the payment provider. */
  channelLabel?: string;
  /**
   * The amount to transfer in the sandbox. REQUIRED — cannot be derived
   * automatically. No locator was ever captured for the actual Payment
   * Amount value (only its label), and the amount charged is not simply
   * the product price: this session paid 88,000 IDR for an 85,000 IDR
   * product, implying a gateway fee whose exact calculation is unknown.
   * Caller must supply the real amount shown on the payment page.
   */
  transferAmount: string;
  /** Defaults to a new DuitkuSandboxPage — override to use a different provider without touching this journey. */
  paymentProvider?: VirtualAccountPaymentProvider;
}

export interface VirtualAccountPurchaseResult {
  paymentStatusPage: PublicPaymentStatusPage;
  thankYouPage: ThankYouPage;
}

/**
 * Full Virtual Account purchase flow: Storefront -> Product Detail ->
 * Checkout -> VA payment details -> Duitku Sandbox payment -> back to
 * MyLink -> payment status verified -> Thank You page.
 *
 * Does NOT chain into Library/Download itself (see journeys/member/) —
 * those still require a separately-supplied OTP code, so combining them
 * here would just move that requirement rather than remove it. Call
 * downloadPurchasedContent() afterward with the same buyerEmail if you
 * need the full chain.
 */
export async function completeVirtualAccountPurchase(
  page: Page,
  options: VirtualAccountPurchaseOptions,
): Promise<VirtualAccountPurchaseResult> {
  const {
    productLinkLabel,
    buyerEmail,
    paymentMethodPosition = 6,
    channelLabel = "CIMB NIAGA VA",
    transferAmount,
  } = options;

  const storefront = new PublicStorefrontPage(page);
  await storefront.goto();
  await storefront.clickProduct(productLinkLabel);

  const productDetail = new PublicProductDetailPage(page);
  await productDetail.clickBuyNow();

  const checkout = new PublicCheckoutPage(page);
  await checkout.fillEmail(buyerEmail ?? getTestMember().email);
  await checkout.openPaymentMethodSelector();
  await checkout.selectPaymentMethodByPosition(paymentMethodPosition);
  await checkout.confirmPaymentMethod();
  await checkout.acceptTermsOfUse();
  await checkout.acceptCommunicationConsent();
  await checkout.submitPurchase();

  const paymentStatusPage = new PublicPaymentStatusPage(page);
  await paymentStatusPage.waitForLoad();

  // Retrieved via clipboard-read after the recorded "Copy" button click —
  // see PublicPaymentStatusPage.copyVirtualAccountNumber() for why.
  const vaNumber = await paymentStatusPage.copyVirtualAccountNumber();

  const provider: VirtualAccountPaymentProvider =
    options.paymentProvider ?? new DuitkuSandboxPage(page, channelLabel);
  await provider.completeVirtualAccountPayment(vaNumber, transferAmount);

  await paymentStatusPage.clickCheckTransaction();

  const thankYouPage = new ThankYouPage(page);
  await thankYouPage.waitForLoad();

  return { paymentStatusPage, thankYouPage };
}
