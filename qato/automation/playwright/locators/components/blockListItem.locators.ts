import type { Locator } from "@playwright/test";

/**
 * Every block card in My Lynk's list shares this exact template
 * (verified against the real HTML: drag handle, thumbnail/title, an
 * "Other Options" dropdown containing Show/Hide + Highlight toggles,
 * Duplicate, Move Block, and Delete). Each card's own id and every
 * action's onclick handler embed database-generated, per-instance ids
 * (e.g. "686d0adb3e382fe2a6d0794b-1406-...") — these are NOT stable
 * across environments, accounts, or even across a single account's own
 * future edits, so none of them are used here. Every locator below is
 * relative to a caller-supplied `item` Locator (a single scoped `<li>`),
 * never the page as a whole — see components/BlockListItem.ts.
 */
export const blockListItemLocators = {
  handle: (item: Locator) => item.locator("button.handle"),
  /** Clicking the card body (not the handle/options button) opens the block's edit page. */
  openCardArea: (item: Locator) => item.locator("> div").first(),
  otherOptionsTrigger: (item: Locator) => item.getByTitle("Other Options"),
  /** Real onchange handler signature (toggle_showhide) — the checkbox itself has no id/data-testid. */
  showHideToggle: (item: Locator) => item.locator('input[onchange^="toggle_showhide("]'),
  /** Real onchange handler signature (toggle_highlight). */
  highlightToggle: (item: Locator) => item.locator('input[onchange^="toggle_highlight("]'),
  /** Real onclick handler signature (fn_dup). */
  duplicateAction: (item: Locator) => item.locator('a[onclick^="fn_dup("]'),
  /** Real onclick handler signature (showMoveModal). */
  moveBlockAction: (item: Locator) => item.locator('a[onclick^="showMoveModal("]'),
  /**
   * Real onclick handler signature (deleteBlock). Button text varies per
   * block type ("Delete Product", presumably "Delete Link"/"Delete
   * Text"/etc. for others — only "Delete Product" confirmed so far since
   * that's the block type in the first list item inspected), so this
   * intentionally does not match on visible text.
   */
  deleteAction: (item: Locator) => item.locator('button[onclick^="deleteBlock("]'),
};
