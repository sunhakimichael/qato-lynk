import type { Page } from "@playwright/test";

const modal = (page: Page) => page.locator("#publish-and-show-block");

export const publishAndShowBlockModalLocators = {
  /** Data-dependent (account may have multiple lynk pages) — filter by the relevant page's name. */
  pageTabByName: (page: Page, name: string) =>
    modal(page).locator("[data-pasb-page-link]").filter({ hasText: name }),
  checkAllPublish: (page: Page) => modal(page).locator("#checkAllPublish"),
  checkAllShow: (page: Page) => modal(page).locator("#checkAllShow"),
  /**
   * Populated asynchronously (observed "Loading..." state in the raw
   * HTML) — the block list inside this modal. Individual row locators
   * aren't captured here; scope into this container the same way as
   * blockListItemLocators if per-row interaction is needed later.
   */
  blockList: (page: Page) => modal(page).locator("#pasbBlockList"),
};
