import type { Page } from "@playwright/test";

/**
 * The persistent sidebar navigation (`<aside id="aside">`), present on
 * every authenticated CMS page. No nav link has an id or data-testid in
 * the real markup — role+name (visible text) is the best available tier.
 * hrefs are documented per-link as the confirmed ground-truth route for
 * that section, useful when building that section's own Route Registry
 * entry later.
 */
export const cmsSidebarNavLocators = {
  /** href="/v2/admin/dashboard" — the actual "Home" destination, distinct from My Lynk. */
  homeLink: (page: Page) => page.getByRole("link", { name: "Home" }),
  /** href="/admin/my-lynks/home" */
  myLynkLink: (page: Page) => page.getByRole("link", { name: "My Lynk" }),
  /** href="/admin/my-appearance/home" */
  appearanceLink: (page: Page) => page.getByRole("link", { name: "Appearance" }),
  /** href="/admin/product/data" */
  productLink: (page: Page) => page.getByRole("link", { name: "Product" }),
  /** href="/admin/statistics/home" */
  statisticsLink: (page: Page) => page.getByRole("link", { name: "Statistics" }),
  /**
   * href="/admin/orders/home". NOT role+name — verified directly against
   * the real HTML that this link's full accessible name includes a
   * trailing pending-count badge (e.g. "Orders 3", not just "Orders"),
   * which would make getByRole('link', { name: 'Orders' }) fail to match
   * in real execution since Playwright's default name match requires the
   * given string to match the computed accessible name. href sidesteps
   * this entirely and was verified unique within #aside.
   */
  ordersLink: (page: Page) => page.locator('a[href="/admin/orders/home"]'),
  /** Pending-orders count badge, scoped to the Orders link. No id — best available signal. */
  ordersBadge: (page: Page) => page.locator('a[href="/admin/orders/home"] span'),

  /** Same reasoning as ordersLink — verified this link also carries a trailing count badge. */
  myPurchaseLink: (page: Page) => page.locator('a[href="/purchase-contents"]'),
  myPurchaseBadge: (page: Page) => page.locator('a[href="/purchase-contents"] span'),

  /** href="https://lynk.id/faq" — external, opens in a new tab (target="_blank"). */
  tutorialsLink: (page: Page) => page.getByRole("link", { name: "Tutorials" }),
  /** href="/v2/admin/settings" */
  settingsLink: (page: Page) => page.getByRole("link", { name: "Settings" }),
  /** href="/admin/affiliates/select" */
  affiliatesLink: (page: Page) => page.getByRole("link", { name: "Affiliates" }),
  /** href="/marketing-campaign" */
  emailMarketingLink: (page: Page) => page.getByRole("link", { name: "E-Mail Marketing" }),
  /** href="/admin/whatsapp-blast" */
  whatsappBlastLink: (page: Page) => page.getByRole("link", { name: "WhatsApp Blast" }),
  /** Expandable submenu button, not a direct link — reveals clipCampaignCreatorLink/clipCampaignClipperLink. */
  clipCampaignToggle: (page: Page) => page.getByRole("button", { name: "Clip Campaign" }),
  /** href="/admin/clip-campaign" — inside the Clip Campaign submenu. */
  clipCampaignCreatorLink: (page: Page) => page.getByRole("link", { name: "Creator" }),
  /** href="/admin/clip-campaign?persona=clipper" — inside the Clip Campaign submenu. */
  clipCampaignClipperLink: (page: Page) => page.getByRole("link", { name: "Clipper" }),
  /**
   * href="/admin/workflow". NOT role+name — verified this link's
   * accessible name includes a trailing "Beta" tag ("Automate Workflow
   * Beta"), same class of issue as ordersLink above.
   */
  automateWorkflowLink: (page: Page) => page.locator('a[href="/admin/workflow"]'),
  /** href="/admin/voucher" */
  vouchersLink: (page: Page) => page.getByRole("link", { name: "Vouchers" }),
  /** href="/auth/logout" */
  logoutLink: (page: Page) => page.getByRole("link", { name: "Logout" }),
};
