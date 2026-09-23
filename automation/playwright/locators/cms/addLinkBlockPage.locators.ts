import type { Page } from "@playwright/test";

export const cmsAddLinkBlockLocators = {
  /** name="title", placeholder "Title here", required. */
  titleInput: (page: Page) => page.locator('input[name="title"]'),
  /** name="url", placeholder "URL here", required. */
  urlInput: (page: Page) => page.locator('input[name="url"]'),
  /** Same #pic file input pattern as the Image block — Link blocks can also carry a thumbnail. */
  fileInput: (page: Page) => page.locator("#pic"),

  // ---- Scheduled release ----
  /** Enables the start/end date-time fields below. */
  releaseTimeToggle: (page: Page) => page.locator("#release_time"),
  startDateInput: (page: Page) => page.locator("#start_date"),
  startAtInput: (page: Page) => page.locator("#start_at"),
  /** Labeled "(Optional)" in the real UI. */
  endDateInput: (page: Page) => page.locator("#end_date"),
  endAtInput: (page: Page) => page.locator("#end_at"),

  // ---- Block layout ----
  defaultLayoutRadio: (page: Page) => page.locator("#default_block"),
  largeLayoutRadio: (page: Page) => page.locator("#large_block"),

  /** href="/admin/my-lynks/home" — matches Text/Video's Cancel destination, not Image's. See docs/ENGINEERING.md. */
  cancelLink: (page: Page) => page.getByRole("link", { name: "Cancel" }),
  /** Real id="idb" as well as visible text — either is stable here. */
  submitButton: (page: Page) => page.locator("#idb"),

  /**
   * ANTI-BOT HONEYPOT — confirmed via the real HTML:
   * `style="display:none"` and `tabindex="-1"` on a field named
   * "company" that has no business purpose on a Link block. This is a
   * classic bot-detection technique (real users never see or fill it;
   * bots that auto-fill every field often do, and get flagged
   * server-side). Exposed here ONLY so it's documented as a
   * do-not-interact element — no journey should ever fill this, since
   * doing so could trigger spam/bot rejection on submit.
   */
  honeypotCompanyField: (page: Page) => page.locator('input[name="company"]'),
};
