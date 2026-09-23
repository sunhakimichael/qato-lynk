import { test as pageObjectTest } from "./pages.fixture";
import { loginAsCreator } from "../journeys/authentication/loginAsCreator.journey";
import type { CmsDashboardPage } from "../pages/cms/CmsDashboardPage";

export interface JourneyFixtures {
  /**
   * CMS Home/Dashboard page after logging in as the creator, via the
   * loginAsCreator journey. Uses the active environment's
   * CMS_USERNAME/CMS_PASSWORD — tests using this fixture will fail with a
   * clear validation error until real CMS credentials are set (see
   * shared/env/schema.ts), same as calling loginAsCreator() directly.
   *
   * Type corrected from CmsHomePage to CmsDashboardPage, matching
   * loginAsCreator's fix (see that journey's docstring). Fixture key name
   * kept as "authenticatedCreatorHome" — still descriptively accurate
   * ("creator authenticated and on their home screen") even though the
   * underlying Page Object class is now CmsDashboardPage.
   */
  authenticatedCreatorHome: CmsDashboardPage;
}

export const test = pageObjectTest.extend<JourneyFixtures>({
  authenticatedCreatorHome: async ({ page }, use) => {
    const dashboardPage = await loginAsCreator(page);
    await use(dashboardPage);
  },
});
