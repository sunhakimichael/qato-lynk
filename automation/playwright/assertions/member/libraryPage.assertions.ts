import { expect } from "@playwright/test";
import type { LibraryPage } from "../../pages/member/LibraryPage";

/**
 * Matches the recorded assertion that a purchased item appears in the
 * library. Matched by product name only — the recorded text also included
 * a transaction-specific date, intentionally excluded (see
 * locators/member/libraryPage.locators.ts).
 */
export async function expectProductInLibrary(
  libraryPage: LibraryPage,
  productName: string,
): Promise<void> {
  await expect(libraryPage.itemByProductName(productName).first()).toBeVisible();
}
