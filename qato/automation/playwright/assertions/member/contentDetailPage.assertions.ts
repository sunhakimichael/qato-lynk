import { expect } from "@playwright/test";
import type { ContentDetailPage } from "../../pages/member/ContentDetailPage";

/** Matches the recorded assertion: content detail heading contains the product name. */
export async function expectContentDetailHeading(
  contentDetailPage: ContentDetailPage,
  productName: string,
): Promise<void> {
  await expect(contentDetailPage.heading).toContainText(productName);
}
