import type { Page, Locator } from "@playwright/test";
import { publishAndShowBlockModalLocators } from "../locators/components/publishAndShowBlockModal.locators";

/** Batch publish/show management modal, scoped per lynk page. */
export class PublishAndShowBlockModal {
  constructor(private readonly page: Page) {}

  async clickPageTab(name: string): Promise<void> {
    await publishAndShowBlockModalLocators.pageTabByName(this.page, name).click();
  }

  async toggleAllPublish(): Promise<void> {
    await publishAndShowBlockModalLocators.checkAllPublish(this.page).click();
  }

  async toggleAllShow(): Promise<void> {
    await publishAndShowBlockModalLocators.checkAllShow(this.page).click();
  }

  get blockList(): Locator {
    return publishAndShowBlockModalLocators.blockList(this.page);
  }
}
