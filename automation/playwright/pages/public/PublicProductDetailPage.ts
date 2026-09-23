import type { Page } from "@playwright/test";
import { publicProductDetailLocators } from "../../locators/public/productDetailPage.locators";
import { waitForPageReady } from "../../helpers/waitForPageReady";

export class PublicProductDetailPage {
  constructor(private readonly page: Page) {}

  /** Waits (with one reload) until the product detail page shows its Buy Now button. */
  async waitForLoad(): Promise<void> {
    await waitForPageReady(this.page, publicProductDetailLocators.buyNowButton(this.page), {
      pageName: "Product detail",
      reloadOnTimeout: true,
    });
  }

  async clickBuyNow(): Promise<void> {
    await this.waitForLoad();
    await publicProductDetailLocators.buyNowButton(this.page).click();
  }
}
