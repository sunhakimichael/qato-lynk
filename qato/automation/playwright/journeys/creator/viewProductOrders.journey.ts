import type { Page } from "@playwright/test";
import { loginAsCreator, type CreatorCredentials } from "../authentication/loginAsCreator.journey";
import { CmsOrdersPage } from "../../pages/cms/CmsOrdersPage";
import { CmsSidebarNav } from "../../components/CmsSidebarNav";

/**
 * Logs in as the creator and navigates to the Product Orders list.
 *
 * FIXED: previously called CmsHomePage.clickOrdersLink(), which used
 * getByRole('link', { name: 'Orders' }) — the same stale locator pattern
 * already found and fixed for the sidebar during the My Lynk work (the
 * real Orders link's accessible name includes a trailing pending-count
 * badge, e.g. "Orders 3", not just "Orders" — see
 * locators/components/cmsSidebarNav.locators.ts). CmsHomePage's own copy
 * of this locator was never updated when that fix was made, since it
 * wasn't on the code path being touched at the time. Now reuses the
 * already-correct CmsSidebarNav component instead of carrying a second,
 * stale copy of the same locator.
 */
export async function viewProductOrders(
  page: Page,
  credentials?: CreatorCredentials,
): Promise<CmsOrdersPage> {
  await loginAsCreator(page, credentials);

  const sidebar = new CmsSidebarNav(page);
  await sidebar.clickOrders();

  const ordersPage = new CmsOrdersPage(page);
  await ordersPage.goto();
  return ordersPage;
}
