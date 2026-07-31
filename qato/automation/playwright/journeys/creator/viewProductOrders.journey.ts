import type { Page } from "@playwright/test";
import { loginAsCreator, type CreatorCredentials } from "../authentication/loginAsCreator.journey";
import { CmsOrdersPage } from "../../pages/cms/CmsOrdersPage";

/**
 * Logs in as the creator and navigates to the Product Orders list.
 * Mirrors the recorded flow: sign in -> click Orders link -> orders page.
 */
export async function viewProductOrders(
  page: Page,
  credentials?: CreatorCredentials,
): Promise<CmsOrdersPage> {
  const homePage = await loginAsCreator(page, credentials);
  await homePage.clickOrdersLink();

  const ordersPage = new CmsOrdersPage(page);
  await ordersPage.goto();
  return ordersPage;
}
