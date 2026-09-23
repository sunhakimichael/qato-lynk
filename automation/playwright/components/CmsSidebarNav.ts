import type { Page } from "@playwright/test";
import { cmsSidebarNavLocators } from "../locators/components/cmsSidebarNav.locators";

/**
 * The persistent CMS sidebar navigation. Present on every authenticated
 * CMS page — instantiate this alongside any CMS Page Object that needs
 * to navigate elsewhere via the menu (as opposed to a direct .goto()).
 */
export class CmsSidebarNav {
  constructor(private readonly page: Page) {}

  async clickHome(): Promise<void> {
    await cmsSidebarNavLocators.homeLink(this.page).click();
  }

  async clickMyLynk(): Promise<void> {
    await cmsSidebarNavLocators.myLynkLink(this.page).click();
  }

  async clickAppearance(): Promise<void> {
    await cmsSidebarNavLocators.appearanceLink(this.page).click();
  }

  async clickProduct(): Promise<void> {
    await cmsSidebarNavLocators.productLink(this.page).click();
  }

  async clickStatistics(): Promise<void> {
    await cmsSidebarNavLocators.statisticsLink(this.page).click();
  }

  async clickOrders(): Promise<void> {
    await cmsSidebarNavLocators.ordersLink(this.page).click();
  }

  async clickMyPurchase(): Promise<void> {
    await cmsSidebarNavLocators.myPurchaseLink(this.page).click();
  }

  async clickSettings(): Promise<void> {
    await cmsSidebarNavLocators.settingsLink(this.page).click();
  }

  async clickAffiliates(): Promise<void> {
    await cmsSidebarNavLocators.affiliatesLink(this.page).click();
  }

  async clickEmailMarketing(): Promise<void> {
    await cmsSidebarNavLocators.emailMarketingLink(this.page).click();
  }

  async clickWhatsappBlast(): Promise<void> {
    await cmsSidebarNavLocators.whatsappBlastLink(this.page).click();
  }

  /** Expands the Clip Campaign submenu — call before clicking Creator/Clipper. */
  async expandClipCampaign(): Promise<void> {
    await cmsSidebarNavLocators.clipCampaignToggle(this.page).click();
  }

  async clickClipCampaignCreator(): Promise<void> {
    await cmsSidebarNavLocators.clipCampaignCreatorLink(this.page).click();
  }

  async clickClipCampaignClipper(): Promise<void> {
    await cmsSidebarNavLocators.clipCampaignClipperLink(this.page).click();
  }

  async clickAutomateWorkflow(): Promise<void> {
    await cmsSidebarNavLocators.automateWorkflowLink(this.page).click();
  }

  async clickVouchers(): Promise<void> {
    await cmsSidebarNavLocators.vouchersLink(this.page).click();
  }

  async clickLogout(): Promise<void> {
    await cmsSidebarNavLocators.logoutLink(this.page).click();
  }
}
