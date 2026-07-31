import type { Page } from "@playwright/test";

export const memberLibraryLocators = {
  /**
   * A purchased-item row in the library list, matched by product name
   * only. The recorded codegen text also included a specific date
   * ("Japan Trip Ebook 08 July 2026") — that date is transaction-specific
   * (almost certainly a purchase/access date) and not something a reusable
   * locator should hardcode. Matching on product name alone is the stable
   * part of that string.
   */
  libraryItemByProductName: (page: Page, productName: string) =>
    page.locator("div").filter({ hasText: productName }),

  /**
   * FRAGILE — positional index into every "Check Details" link across all
   * library items (0-indexed, matching Playwright's .nth()). The recorded
   * session clicked position 4, then "Go Back", then position 2 — only
   * the position-2 path is confirmed to lead to a successful detail view
   * and download. Library ordering is not guaranteed stable across runs
   * or environments; revisit if a per-item-scoped locator becomes
   * available (e.g. scoped within libraryItemByProductName's matched row).
   */
  checkDetailsLinkByPosition: (page: Page, position: number) =>
    page.getByRole("link", { name: "Check Details" }).nth(position),
};
