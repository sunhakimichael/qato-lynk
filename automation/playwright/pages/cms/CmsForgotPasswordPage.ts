import type { Page, Locator } from "@playwright/test";
import { cmsForgotPasswordLocators } from "../../locators/cms/forgotPasswordPage.locators";
import { cmsRoutes } from "../../config";

export class CmsForgotPasswordPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(cmsRoutes.forgotPassword());
  }

  async fillEmail(emailOrUsername: string): Promise<void> {
    await cmsForgotPasswordLocators.emailInput(this.page).fill(emailOrUsername);
  }

  async clickSubmit(): Promise<void> {
    await cmsForgotPasswordLocators.submitButton(this.page).click();
  }

  /**
   * Exposed for presence assertions only. See locators/cms/forgotPasswordPage.locators.ts —
   * actual form submission on this page is likely blocked by this
   * Cloudflare Turnstile challenge without a known test bypass.
   */
  get turnstileWidget(): Locator {
    return cmsForgotPasswordLocators.turnstileWidget(this.page);
  }
}
