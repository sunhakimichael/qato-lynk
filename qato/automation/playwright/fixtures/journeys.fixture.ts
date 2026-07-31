import { test as pageObjectTest } from "./pages.fixture";
import { loginAsCreator } from "../journeys/authentication/loginAsCreator.journey";
import type { CmsHomePage } from "../pages/cms/CmsHomePage";

export interface JourneyFixtures {
  /**
   * CMS home page after logging in as the creator, via the
   * loginAsCreator journey. Uses the active environment's
   * CMS_USERNAME/CMS_PASSWORD — tests using this fixture will fail with a
   * clear validation error until real CMS credentials are set (see
   * shared/env/schema.ts), same as calling loginAsCreator() directly.
   */
  authenticatedCreatorHome: CmsHomePage;
}

export const test = pageObjectTest.extend<JourneyFixtures>({
  authenticatedCreatorHome: async ({ page }, use) => {
    const homePage = await loginAsCreator(page);
    await use(homePage);
  },
});
