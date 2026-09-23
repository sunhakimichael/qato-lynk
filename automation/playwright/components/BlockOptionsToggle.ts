import type { Page } from "@playwright/test";
import { blockOptionsToggleLocators } from "../locators/components/blockOptionsToggle.locators";

/** The "Options" dropdown (Show/Hide + Highlight) on add-block forms. */
export class BlockOptionsToggle {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await blockOptionsToggleLocators.optionsTrigger(this.page).click();
  }

  /** Open the dropdown first via open(). */
  async toggleShowHide(): Promise<void> {
    await blockOptionsToggleLocators.onToggle(this.page).click();
  }

  /** Open the dropdown first via open(). See locator comment re: the wiggle/bold discrepancy. */
  async toggleHighlight(): Promise<void> {
    await blockOptionsToggleLocators.favToggle(this.page).click();
  }
}
