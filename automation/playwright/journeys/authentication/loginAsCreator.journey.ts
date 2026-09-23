import type { Page } from "@playwright/test";
import { loadEnvConfig } from "@qato/shared";
import { CmsLoginPage } from "../../pages/cms/CmsLoginPage";
import { CmsDashboardPage } from "../../pages/cms/CmsDashboardPage";

export interface CreatorCredentials {
  username: string;
  password: string;
}

/**
 * Logs into the CMS as the creator and lands on the real Home/Dashboard
 * page (/v2/admin/dashboard).
 *
 * Credentials default to the active environment's CMS_USERNAME/CMS_PASSWORD.
 *
 * CORRECTED (not codegen-confirmed): the original Milestone 3 codegen
 * recorded navigating to /admin/my-lynks/home after login — that's the
 * My Lynk section, not Home, and codegen never actually captured a
 * navigation to /v2/admin/dashboard. This function now deliberately
 * navigates there instead, based on the sidebar's own "Home" link
 * (confirmed via real HTML during the My Lynk work) and a real reported
 * test failure tracing back to this exact mislabeling. Whether the app
 * auto-redirects here after login, or a real user always lands on My
 * Lynk first and navigates to Home separately, is still not confirmed —
 * flagging this as an assumption, not a verified fact.
 *
 * CmsHomePage is kept as-is (still models My Lynk under its original
 * name, per an explicit decision not to rename it without broader cause)
 * but is no longer used here. See docs/ENGINEERING.md's CMS Locator
 * Registry section for the full naming-collision writeup.
 */
export async function loginAsCreator(
  page: Page,
  credentials?: CreatorCredentials,
): Promise<CmsDashboardPage> {
  const creds = credentials ?? {
    username: loadEnvConfig().CMS_USERNAME,
    password: loadEnvConfig().CMS_PASSWORD,
  };

  const loginPage = new CmsLoginPage(page);
  await loginPage.goto();
  await loginPage.login(creds.username, creds.password);

  const dashboardPage = new CmsDashboardPage(page);
  await dashboardPage.goto();
  return dashboardPage;
}
