import type { Page } from "@playwright/test";

export const cmsDashboardLocators = {
  // ---- Profile / MyLink card ----
  /**
   * FRAGILE — no id/data-testid/semantic role available; this is a
   * generic `<p>` with only Tailwind utility classes, several of which
   * (e.g. "line-clamp-1") are reused elsewhere on the page too, so this
   * selector isn't uniquely anchored to anything semantic. Lowest-value
   * locator on this page — revisit if the app ever adds a data-testid
   * here, and don't rely on it for anything beyond a rough sanity check.
   */
  creatorDisplayName: (page: Page) => page.locator("p.font-bold.text-gray.line-clamp-1"),
  /** target="_blank" link to the live public storefront. */
  publicLynkLink: (page: Page) => page.locator('a[target="_blank"][href="/qamike"]'),
  /** Opens the Share modal (see components/ShareModal.ts). Real data-micromodal-trigger attribute. */
  shareButton: (page: Page) => page.locator('[data-micromodal-trigger="modalShare"]'),
  /**
   * href="/admin/settings" — the small icon-only arrow shortcut next to
   * the profile card. VERIFIED via direct query against the real HTML:
   * two elements share this exact href (this one, and "Upgrade to PRO"
   * below) — neither is the sidebar's Settings link, which uses a
   * different URL entirely (/v2/admin/settings). `.last()` correctly
   * picks this one since "Upgrade to PRO" appears first in DOM order.
   */
  settingsShortcutLink: (page: Page) => page.locator('a[href="/admin/settings"]').last(),
  /** Also routes to /admin/settings despite the "Upgrade to PRO" label — confirmed in the real HTML, not a typo on our part. */
  upgradeToProLink: (page: Page) => page.getByRole("link", { name: "Upgrade to PRO" }),

  // ---- Quick-add links ----
  startCreatingNowLink: (page: Page) => page.getByRole("link", { name: "Start creating now!" }),
  addLinkQuickAction: (page: Page) => page.getByRole("link", { name: "Add Link" }),
  digitalProductQuickAction: (page: Page) => page.getByRole("link", { name: "Digital Product" }),
  blogContentQuickAction: (page: Page) => page.getByRole("link", { name: "Blog Content" }),
  courseVideoQuickAction: (page: Page) => page.getByRole("link", { name: "Course Video" }),
  mediaKitQuickAction: (page: Page) => page.getByRole("link", { name: "Media Kit" }),

  // ---- Earnings / withdraw card ----
  /** title="Show/Hide Earnings" — toggles masking the amount, doesn't navigate. */
  toggleEarningsVisibilityButton: (page: Page) =>
    page.locator('[data-btn-earning]'),
  /**
   * Real data-earnings attribute holds the raw numeric string (e.g.
   * "22,386,888") independent of whether the amount is currently masked
   * on screen — read this attribute directly rather than the visible
   * text, which alternates between the real value and a masked
   * placeholder ("— — . — — —") depending on toggle state.
   */
  earningsAmount: (page: Page) => page.locator("[data-earnings]"),
  /** title="Withdraw", href="/admin/withdraw/manual" */
  withdrawLink: (page: Page) => page.getByTitle("Withdraw"),
  /** The displayed PayMe link text, e.g. "http://.../payme/qamike". */
  paymeLinkText: (page: Page) => page.locator('a[href*="/payme/"]'),
  /**
   * Copy button for the PayMe link. No id/data-testid/aria-label — the
   * onclick handler (real behavior, not structure) is the most stable
   * signal available.
   */
  copyPaymeLinkButton: (page: Page) => page.locator('button[onclick^="copyLink("]'),

  // ---- Views & Clicks chart ----
  /** Real id, scopes the date-range picker's two inputs from anything else on the page. */
  dateRangeFilter: (page: Page) => page.locator("#totalCalendar"),
  /** The visible, interactive date input (the other is a flatpickr-internal hidden input with the same placeholder). */
  dateRangeVisibleInput: (page: Page) => page.locator("#totalCalendar input[readonly]"),
  dateRangeToggleIcon: (page: Page) => page.locator("#totalCalendar [data-toggle]"),
  /** Real data-text-views attribute holds the numeric value as text (e.g. "184"). */
  viewsToggleButton: (page: Page) => page.locator("button:has([data-text-views])"),
  viewsValue: (page: Page) => page.locator("[data-text-views]"),
  /** Real data-text-clicks attribute holds the numeric value as text (e.g. "94"). */
  clicksToggleButton: (page: Page) => page.locator("button:has([data-text-clicks])"),
  clicksValue: (page: Page) => page.locator("[data-text-clicks]"),
  /** Presence/visibility only — chart rendering itself isn't meaningfully assertable via locator. */
  salesChartCanvas: (page: Page) => page.locator("#myChart"),

  // ---- Footer ----
  termsLink: (page: Page) => page.getByRole("link", { name: "Terms & Conditions" }),
  privacyLink: (page: Page) => page.getByRole("link", { name: "Privacy" }),
  contactUsLink: (page: Page) => page.getByRole("link", { name: "Contact Us" }),
  requestFeatureLink: (page: Page) => page.getByRole("link", { name: "Request Feature" }),
};
