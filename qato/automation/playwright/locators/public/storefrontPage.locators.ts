import type { Page } from "@playwright/test";

export const publicStorefrontLocators = {
  /**
   * Product link on the storefront. `label` must be the exact accessible
   * name as rendered, e.g. "Japan Trip Ebook IDR 85k" — confirmed only in
   * the dev environment via codegen (matches the dev/staging fixture:
   * "Japan Trip Ebook" at 85,000 IDR).
   *
   * Deliberately NOT auto-composed from getTestProduct() here: the "85k"
   * suffix implies some kind of thousands-abbreviation display rule, but
   * that rule is unverified for values under 1,000 (production's fixture
   * is "Help-PDF" at 10 IDR). Inventing a formatter for an unconfirmed
   * display convention would be exactly the kind of guess this milestone
   * is meant to avoid. Callers must supply the exact label; verify the
   * production label (e.g. re-run codegen against production) before
   * using this in Milestone 7.
   */
  productLink: (page: Page, label: string) => page.getByRole("link", { name: label }),
  menuButton: (page: Page) => page.getByRole("button", { name: "menu-white" }),
  loginLink: (page: Page) => page.getByRole("link", { name: "LOGIN" }),
};
