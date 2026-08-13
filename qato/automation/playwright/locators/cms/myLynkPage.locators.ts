import type { Page } from "@playwright/test";

export const cmsMyLynkLocators = {
  /** href="/admin/my-lynks/home" — the active tab in this pill switcher. */
  myLinkInBioTab: (page: Page) => page.getByRole("link", { name: "My Link In Bio" }),
  /** href="/lp/list" — a distinct feature (Landing Pages), not part of this page's scope. */
  landingPagesTab: (page: Page) => page.locator('a.lp-tab-lp[href="/lp/list"]'),

  /** Displayed lynk URL, e.g. "https://lynk.id/qamike". */
  myLynkIdText: (page: Page) => page.locator('a[target="_blank"][href="/qamike"]'),
  /**
   * Opens the Share modal — CONFIRMED to use the exact same
   * data-micromodal-trigger="modalShare" attribute as the Dashboard's
   * share button. Genuine component reuse: components/ShareModal.ts
   * applies here unchanged, not a lookalike that needed its own copy.
   */
  shareButton: (page: Page) => page.locator('[data-micromodal-trigger="modalShare"]'),
  /** href="/admin/settings/site" */
  customizeUrlLink: (page: Page) => page.getByRole("link", { name: "Customize URL" }),

  /** Opens the Add New Block modal (see components/AddNewBlockModal.ts). Real data-micromodal-trigger attribute. */
  addNewBlockTrigger: (page: Page) => page.locator('[data-micromodal-trigger="modal-block"]'),

  /**
   * Page-switcher tabs (this creator has multiple lynk pages, e.g.
   * "Home" and a second custom-named page). Data-dependent: don't
   * hardcode a specific page's name. Use pageTabByName() with whatever
   * name is relevant for the account under test.
   */
  pageTabByName: (page: Page, name: string) =>
    page.locator("[data-pasb-page-link]").filter({ hasText: name }),

  /** The sortable block list container. Confirmed unique on the page. */
  blockList: (page: Page) => page.locator("ul.sortable"),
  /** Every block card in the list — scope one via .nth(index) or .filter({ hasText }) before wrapping in BlockListItem. */
  blockListItems: (page: Page) => page.locator("li[data-block-wrapper]"),
};
