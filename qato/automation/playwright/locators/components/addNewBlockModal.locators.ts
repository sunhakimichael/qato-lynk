import type { Page } from "@playwright/test";

/**
 * The "Add new block" modal (#modal-block). Every block-type link's href
 * is verified against the real HTML — these are the actual navigation
 * targets for each "Add New Block" sub-page.
 */
const modal = (page: Page) => page.locator("#modal-block");

export const addNewBlockModalLocators = {
  allBlocksTab: (page: Page) => modal(page).getByRole("button", { name: "All Blocks" }),
  basicTab: (page: Page) => modal(page).locator('button[onclick*="toggleBlocks(\'basic\'"]'),
  monetizationTab: (page: Page) => modal(page).locator('button[onclick*="toggleBlocks(\'monetization\'"]'),

  // ---- Basic ----
  imageBlockLink: (page: Page) => modal(page).locator('a[href="/admin/image?fk_page_id=home"]'),
  textBlockLink: (page: Page) => modal(page).locator('a[href="/admin/text?fk_page_id=home"]'),
  linkBlockLink: (page: Page) => modal(page).locator('a[href="/admin/my-lynks/add/home"]'),
  videoBlockLink: (page: Page) => modal(page).locator('a[href="/admin/my-embed-video/add?fk_page_id=home"]'),
  socialConnectBlockLink: (page: Page) =>
    modal(page).locator('a[href="/admin/digi/connect/social-connect_v2?fk_page_id=home"]'),

  // ---- Monetization ----
  /**
   * FLAG: unlike every other block type, this link's href is literally
   * "javascript:void(0)" — confirmed against the real HTML, not a
   * markup-extraction error. It likely opens an intermediate step (the
   * uploaded HTML also includes a separate
   * "mylink-digitalproduct-template.html", suggesting a template
   * selector before reaching the actual add-product form). Using
   * text-matching here since href isn't usable; revisit once that
   * intermediate page's HTML is processed.
   */
  digitalProductBlockLink: (page: Page) =>
    modal(page).locator("a").filter({ hasText: "Digital Product" }),
  blogBlockLink: (page: Page) => modal(page).locator('a[href="/admin/content?fk_page_id=home"]'),
  appointmentBlockLink: (page: Page) => modal(page).locator('a[href="/admin/appointment?fk_page_id=home"]'),
  courseVideoBlockLink: (page: Page) => modal(page).locator('a[href="/admin/course-video?fk_page_id=home"]'),
  eventBlockLink: (page: Page) => modal(page).locator('a[href="/admin/event-product?fk_page_id=home"]'),
  supportsBlockLink: (page: Page) => modal(page).locator('a[href="/admin/support?fk_page_id=home"]'),
  affiliateProductsBlockLink: (page: Page) =>
    modal(page).locator('a[href="/admin/affiliate-add?fk_page_id=home"]'),
  physicalProductBlockLink: (page: Page) =>
    modal(page).locator('a[href="/admin/physical-product?fk_page_id=home"]'),
  collectFollowersContactBlockLink: (page: Page) =>
    modal(page).locator('a[href="/admin/collect-mail-contacts"]'),
};
