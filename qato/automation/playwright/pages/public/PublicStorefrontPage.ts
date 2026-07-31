import type { Page } from "@playwright/test";
import { publicStorefrontLocators } from "../../locators/public/storefrontPage.locators";
import { publicRoutes } from "../../config";

export class PublicStorefrontPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(publicRoutes.storefront());
  }

  /** `label` must be the exact accessible name of the product link. See locators/public/storefrontPage.locators.ts. */
  async clickProduct(label: string): Promise<void> {
    await publicStorefrontLocators.productLink(this.page, label).click();
  }

  async openMenu(): Promise<void> {
    await publicStorefrontLocators.menuButton(this.page).click();
  }

  async clickLoginLink(): Promise<void> {
    await publicStorefrontLocators.loginLink(this.page).click();
  }
}
