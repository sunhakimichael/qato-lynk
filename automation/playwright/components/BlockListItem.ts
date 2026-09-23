import type { Locator } from "@playwright/test";
import { blockListItemLocators } from "../locators/components/blockListItem.locators";

/**
 * One card in My Lynk's block list. Always constructed from an already-
 * scoped Locator — callers get that scope via position
 * (`myLynkPage.blockListItemByPosition(i)`) or by matching visible text
 * (`myLynkPage.blockListItemByText('time-skip')`) — never by a
 * database-generated block id, which isn't stable across accounts/environments.
 */
export class BlockListItem {
  constructor(private readonly item: Locator) {}

  async open(): Promise<void> {
    await blockListItemLocators.openCardArea(this.item).click();
  }

  async openOtherOptionsMenu(): Promise<void> {
    await blockListItemLocators.otherOptionsTrigger(this.item).click();
  }

  /** Toggles the "Show / Hide" state — open the Other Options menu first. */
  async toggleShowHide(): Promise<void> {
    await blockListItemLocators.showHideToggle(this.item).click();
  }

  /** Toggles the "Highlight" (wiggle effect) state — open the Other Options menu first. */
  async toggleHighlight(): Promise<void> {
    await blockListItemLocators.highlightToggle(this.item).click();
  }

  async clickDuplicate(): Promise<void> {
    await blockListItemLocators.duplicateAction(this.item).click();
  }

  async clickMoveBlock(): Promise<void> {
    await blockListItemLocators.moveBlockAction(this.item).click();
  }

  async clickDelete(): Promise<void> {
    await blockListItemLocators.deleteAction(this.item).click();
  }
}
