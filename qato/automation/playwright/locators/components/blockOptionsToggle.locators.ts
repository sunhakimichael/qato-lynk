import type { Page } from "@playwright/test";

/**
 * The "Options" dropdown present on add-block forms (confirmed identical
 * on Image and Text; both use the same name="on"/name="fav" checkboxes
 * and the same title="Other Options" trigger). Neither checkbox has an
 * id, so name is the best available tier.
 *
 * This is conceptually the same widget as the block list's own actions
 * menu (see locators/components/blockListItem.locators.ts —
 * showHideToggle/highlightToggle), but kept as a separate component:
 * these are plain form checkboxes submitted with the form on creation,
 * while the block list's toggles fire immediate AJAX calls
 * (toggle_showhide/toggle_highlight) against an existing block's id.
 * Same concept, different interaction mechanics.
 */
export const blockOptionsToggleLocators = {
  optionsTrigger: (page: Page) => page.getByTitle("Other Options"),
  /** "Show / Hide" — checked by default on both pages verified so far. */
  onToggle: (page: Page) => page.locator('input[name="on"]'),
  /**
   * "Highlight". NOTE: on the Text block page, the visible tooltip says
   * "Add wiggle effect to the block", but a developer's own inline HTML
   * comment on that same page says the actual effect is making the text
   * bold — a real discrepancy between what the UI tells the user and
   * what the code comment says it does. See docs/ENGINEERING.md Findings.
   */
  favToggle: (page: Page) => page.locator('input[name="fav"]'),
};
