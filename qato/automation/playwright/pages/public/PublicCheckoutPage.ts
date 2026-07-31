import type { Page } from "@playwright/test";
import { publicCheckoutLocators } from "../../locators/public/checkoutPage.locators";

export class PublicCheckoutPage {
  constructor(private readonly page: Page) {}

  async fillEmail(email: string): Promise<void> {
    await publicCheckoutLocators.emailInput(this.page).fill(email);
  }

  async openPaymentMethodSelector(): Promise<void> {
    await publicCheckoutLocators.selectPaymentMethodButton(this.page).click();
  }

  /**
   * Selects a payment method by its position in the list (1-indexed).
   * FRAGILE — see locators/public/checkoutPage.locators.ts for why this
   * is positional rather than name-based.
   */
  async selectPaymentMethodByPosition(position: number): Promise<void> {
    await publicCheckoutLocators.paymentMethodOptionByPosition(this.page, position).click();
  }

  async confirmPaymentMethod(): Promise<void> {
    await publicCheckoutLocators.confirmMethodButton(this.page).click();
  }

  async acceptTermsOfUse(): Promise<void> {
    await publicCheckoutLocators.termsCheckbox(this.page).check();
  }

  async acceptCommunicationConsent(): Promise<void> {
    await publicCheckoutLocators.communicationConsentCheckbox(this.page).check();
  }

  async submitPurchase(): Promise<void> {
    await publicCheckoutLocators.submitPurchaseButton(this.page).click();
  }
}
