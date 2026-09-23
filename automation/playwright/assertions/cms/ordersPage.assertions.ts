import { expect } from "@playwright/test";
import type { CmsOrdersPage } from "../../pages/cms/CmsOrdersPage";

/** Matches the recorded codegen assertion: Product Orders heading visible. */
export async function expectProductOrdersPageLoaded(ordersPage: CmsOrdersPage): Promise<void> {
  await expect(ordersPage.productOrdersHeading).toBeVisible();
}
