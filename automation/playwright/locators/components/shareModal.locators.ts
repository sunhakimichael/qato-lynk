import type { Page } from "@playwright/test";

/**
 * The "Share to your friends" modal (#modalShare). Triggered from the
 * profile card on the Dashboard via a button with
 * data-micromodal-trigger="modalShare" — that trigger is page-specific
 * (see dashboardPage.locators.ts), but the modal itself is a generic,
 * reusable component if it turns out to be triggered from elsewhere too.
 *
 * Every locator here is scoped within #modalShare deliberately:
 * data-micromodal-close is reused by #myModal's Cancel button too
 * (confirmed in the real HTML — both modals share that attribute), so an
 * unscoped selector would match two elements and violate Playwright's
 * strict-mode uniqueness requirement.
 */
const modal = (page: Page) => page.locator("#modalShare");

export const shareModalLocators = {
  copyLinkButton: (page: Page) => modal(page).locator("#copyLink"),
  whatsappLink: (page: Page) => modal(page).locator("#whatsappLink"),
  twitterLink: (page: Page) => modal(page).locator("#twitterLink"),
  telegramLink: (page: Page) => modal(page).locator("#telegramLink"),
  cancelButton: (page: Page) => modal(page).locator("[data-micromodal-close]"),
};
