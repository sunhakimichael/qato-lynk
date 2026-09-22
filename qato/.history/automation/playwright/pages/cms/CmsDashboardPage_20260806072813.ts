import type { Page, Locator } from "@playwright/test";
import { cmsDashboardLocators } from "../../locators/cms/dashboardPage.locators";
import { cmsRoutes } from "../../config";

/**
 * The CMS "Home" page — distinct from `CmsHomePage` (which actually
 * models the My Lynk landing page, /admin/my-lynks/home). See
 * docs/ENGINEERING.md's CMS Locator Registry section for the naming
 * ambiguity this surfaced and the recommended follow-up.
 *
 * NOT modeled: the PayMe "Activate" modal (#myModal). Its trigger button
 * is wrapped in an HTML comment in this snapshot — PayMe is already
 * active for this account, so the activation prompt never renders. The
 * modal's own markup exists in the DOM, but there's no way to reach it
 * from this page state. Revisit if HTML from a deactivated-PayMe account
 * becomes available.
 */
export class CmsDashboardPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(cmsRoutes.dashboard());
  }

  // ---- Profile / MyLink card ----

  get creatorDisplayName(): Locator {
    return cmsDashboardLocators.creatorDisplayName(this.page);
  }

  get publicLynkLink(): Locator {
    return cmsDashboardLocators.publicLynkLink(this.page);
  }

  /** Opens the Share modal — instantiate components/ShareModal.ts afterward to interact with it. */
  async clickShare(): Promise<void> {
    await cmsDashboardLocators.shareButton(this.page).click();
  }

  async clickSettingsShortcut(): Promise<void> {
    await cmsDashboardLocators.settingsShortcutLink(this.page).click();
  }

  async clickUpgradeToPro(): Promise<void> {
    await cmsDashboardLocators.upgradeToProLink(this.page).click();
  }

  // ---- Quick-add links ----

  async clickStartCreatingNow(): Promise<void> {
    await cmsDashboardLocators.startCreatingNowLink(this.page).click();
  }

  async clickAddLinkQuickAction(): Promise<void> {
    await cmsDashboardLocators.addLinkQuickAction(this.page).click();
  }

  async clickDigitalProductQuickAction(): Promise<void> {
    await cmsDashboardLocators.digitalProductQuickAction(this.page).click();
  }

  async clickBlogContentQuickAction(): Promise<void> {
    await cmsDashboardLocators.blogContentQuickAction(this.page).click();
  }

  async clickCourseVideoQuickAction(): Promise<void> {
    await cmsDashboardLocators.courseVideoQuickAction(this.page).click();
  }

  async clickMediaKitQuickAction(): Promise<void> {
    await cmsDashboardLocators.mediaKitQuickAction(this.page).click();
  }

  // ---- Earnings / withdraw card ----

  async toggleEarningsVisibility(): Promise<void> {
    await cmsDashboardLocators.toggleEarningsVisibilityButton(this.page).click();
  }

  /** Reads the raw data-earnings attribute value, independent of masked/unmasked display state. */
  async getEarningsAmount(): Promise<string | null> {
    return cmsDashboardLocators.earningsAmount(this.page).getAttribute("data-earnings");
  }

  async clickWithdraw(): Promise<void> {
    await cmsDashboardLocators.withdrawLink(this.page).click();
  }

  get paymeLinkText(): Locator {
    return cmsDashboardLocators.paymeLinkText(this.page);
  }

  async clickCopyPaymeLink(): Promise<void> {
    await cmsDashboardLocators.copyPaymeLinkButton(this.page).click();
  }

  // ---- Views & Clicks chart ----

  async clickDateRangeFilter(): Promise<void> {
    await cmsDashboardLocators.dateRangeToggleIcon(this.page).click();
  }

  async getViewsCount(): Promise<string> {
    return cmsDashboardLocators.viewsValue(this.page).innerText();
  }

  async getClicksCount(): Promise<string> {
    return cmsDashboardLocators.clicksValue(this.page).innerText();
  }

  async toggleViewsSeries(): Promise<void> {
    await cmsDashboardLocators.viewsToggleButton(this.page).click();
  }

  async toggleClicksSeries(): Promise<void> {
    await cmsDashboardLocators.clicksToggleButton(this.page).click();
  }

  get salesChartCanvas(): Locator {
    return cmsDashboardLocators.salesChartCanvas(this.page);
  }

  // ---- Footer ----

  async clickTerms(): Promise<void> {
    await cmsDashboardLocators.termsLink(this.page).click();
  }

  async clickPrivacy(): Promise<void> {
    await cmsDashboardLocators.privacyLink(this.page).click();
  }

  async clickContactUs(): Promise<void> {
    await cmsDashboardLocators.contactUsLink(this.page).click();
  }

  async clickRequestFeature(): Promise<void> {
    await cmsDashboardLocators.requestFeatureLink(this.page).click();
  }
}
