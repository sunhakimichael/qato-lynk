import type { Page, Locator } from "@playwright/test";
import { memberLibraryLocators } from "../../locators/member/libraryPage.locators";

export class LibraryPage {
  constructor(private readonly page: Page) {}

  /** Locator for a library item row, matched by product name. */
  itemByProductName(productName: string): Locator {
    return memberLibraryLocators.libraryItemByProductName(this.page, productName);
  }

  /**
   * Clicks the "Check Details" link at the given position (0-indexed,
   * matching Playwright's .nth()). FRAGILE — see
   * locators/member/libraryPage.locators.ts.
   */
  async clickCheckDetailsByPosition(position: number): Promise<void> {
    await memberLibraryLocators.checkDetailsLinkByPosition(this.page, position).click();
  }
}
