import type { Page } from "@playwright/test";

/**
 * The shared page header (`<header id="header">`). The `<h1>` inside it
 * shows the current section's title ("Home", presumably others per page)
 * — useful as a lightweight "am I on the right page" check without a
 * full assertion layer.
 */
export const cmsHeaderLocators = {
  /** Current section title, e.g. "Home". Text varies per page. */
  pageTitle: (page: Page) => page.locator("header#header h1"),
  /**
   * href="/admin/notifications". Not using role+name here: the link's
   * only visible content is the notification count badge itself, so its
   * accessible name changes every time the count changes — genuinely
   * unstable. The href is the real, stable route and the better choice.
   */
  notificationsLink: (page: Page) => page.locator('a[href="/admin/notifications"]'),
  /** Real id, holds the unread count as text (e.g. "5"). */
  notificationsBadge: (page: Page) => page.locator("#header-notif-badge"),
};
