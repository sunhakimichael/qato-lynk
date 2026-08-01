import type { Page, Locator } from "@playwright/test";
import { thankYouLocators } from "../../locators/public/thankYouPage.locators";

export class ThankYouPage {
  constructor(private readonly page: Page) {}

  /**
   * Waits for the redirect to the Thank You page after a confirmed
   * payment. The recorded codegen script literally `page.goto()`'d a
   * session-encoded URL (`/payment-thankyou?sess=...&token=...`) —
   * replaying that exact URL would fail, since the session/token values
   * are specific to the original recording. Waiting for the URL pattern
   * reflects the actual redirect behavior instead.
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForURL(/\/payment-thankyou/);
  }

  get successMessage(): Locator {
    return thankYouLocators.successMessage(this.page);
  }
}
