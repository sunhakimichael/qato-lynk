import type { Page } from "@playwright/test";
import { publicStorefrontLocators } from "../../locators/public/storefrontPage.locators";
import { publicRoutes } from "../../config";
import { gotoSlowPage, waitForPageReady } from "../../helpers/waitForPageReady";

export class PublicStorefrontPage {
  constructor(private readonly page: Page) {}

  /** Opens the MyLink storefront and waits (with one reload) until it has rendered. */
  async goto(): Promise<void> {
    await gotoSlowPage(this.page, publicRoutes.storefront());
    await waitForPageReady(this.page, publicStorefrontLocators.menuButton(this.page), {
      pageName: "MyLink storefront",
      reloadOnTimeout: true,
    });
  }

  /** `label` must be the exact accessible name of the product link. See locators/public/storefrontPage.locators.ts. */
  async clickProduct(label: string): Promise<void> {
    const productLink = publicStorefrontLocators.productLink(this.page, label);
    // The product list can render well after the storefront shell.
    await waitForPageReady(this.page, productLink, {
      pageName: `MyLink storefront (product "${label}")`,
      reloadOnTimeout: true,
    });
    await productLink.click();
  }

  async openMenu(): Promise<void> {
    await publicStorefrontLocators.menuButton(this.page).click();
  }

  async clickLoginLink(): Promise<void> {
    await publicStorefrontLocators.loginLink(this.page).click();
  }
}
