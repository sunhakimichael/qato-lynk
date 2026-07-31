import type { Page } from "@playwright/test";
import { publicProductDetailLocators } from "../../locators/public/productDetailPage.locators";

export class PublicProductDetailPage {
  constructor(private readonly page: Page) {}

  async clickBuyNow(): Promise<void> {
    await publicProductDetailLocators.buyNowButton(this.page).click();
  }
}
