import type { Page } from "@playwright/test";
import { loadEnvConfig } from "@qato/shared";
import { CmsLoginPage } from "../../pages/cms/CmsLoginPage";
import { CmsHomePage } from "../../pages/cms/CmsHomePage";

export interface CreatorCredentials {
  username: string;
  password: string;
}

/**
 * Logs into the CMS as the creator and lands on the post-login home page.
 *
 * Credentials default to the active environment's CMS_USERNAME/CMS_PASSWORD.
 * The explicit navigation to myLynksHome() after login mirrors the recorded
 * codegen script, which literally navigated there after clicking Sign In —
 * whether that's an automatic redirect or a manual step wasn't confirmed,
 * so this replicates the recorded behavior rather than assuming either way.
 */
export async function loginAsCreator(
  page: Page,
  credentials?: CreatorCredentials,
): Promise<CmsHomePage> {
  const creds = credentials ?? {
    username: loadEnvConfig().CMS_USERNAME,
    password: loadEnvConfig().CMS_PASSWORD,
  };

  const loginPage = new CmsLoginPage(page);
  await loginPage.goto();
  await loginPage.login(creds.username, creds.password);

  const homePage = new CmsHomePage(page);
  await homePage.goto();
  return homePage;
}
