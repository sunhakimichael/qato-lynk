import type { Page } from "@playwright/test";
import { addNewBlockModalLocators } from "../locators/components/addNewBlockModal.locators";

/** Reusable "Add new block" modal, listing every available block type by category. */
export class AddNewBlockModal {
  constructor(private readonly page: Page) {}

  async clickAllBlocksTab(): Promise<void> {
    await addNewBlockModalLocators.allBlocksTab(this.page).click();
  }

  async clickBasicTab(): Promise<void> {
    await addNewBlockModalLocators.basicTab(this.page).click();
  }

  async clickMonetizationTab(): Promise<void> {
    await addNewBlockModalLocators.monetizationTab(this.page).click();
  }

  async clickImageBlock(): Promise<void> {
    await addNewBlockModalLocators.imageBlockLink(this.page).click();
  }

  async clickTextBlock(): Promise<void> {
    await addNewBlockModalLocators.textBlockLink(this.page).click();
  }

  async clickLinkBlock(): Promise<void> {
    await addNewBlockModalLocators.linkBlockLink(this.page).click();
  }

  async clickVideoBlock(): Promise<void> {
    await addNewBlockModalLocators.videoBlockLink(this.page).click();
  }

  async clickSocialConnectBlock(): Promise<void> {
    await addNewBlockModalLocators.socialConnectBlockLink(this.page).click();
  }

  async clickDigitalProductBlock(): Promise<void> {
    await addNewBlockModalLocators.digitalProductBlockLink(this.page).click();
  }

  async clickBlogBlock(): Promise<void> {
    await addNewBlockModalLocators.blogBlockLink(this.page).click();
  }

  async clickAppointmentBlock(): Promise<void> {
    await addNewBlockModalLocators.appointmentBlockLink(this.page).click();
  }

  async clickCourseVideoBlock(): Promise<void> {
    await addNewBlockModalLocators.courseVideoBlockLink(this.page).click();
  }

  async clickEventBlock(): Promise<void> {
    await addNewBlockModalLocators.eventBlockLink(this.page).click();
  }

  async clickSupportsBlock(): Promise<void> {
    await addNewBlockModalLocators.supportsBlockLink(this.page).click();
  }

  async clickAffiliateProductsBlock(): Promise<void> {
    await addNewBlockModalLocators.affiliateProductsBlockLink(this.page).click();
  }

  async clickPhysicalProductBlock(): Promise<void> {
    await addNewBlockModalLocators.physicalProductBlockLink(this.page).click();
  }

  async clickCollectFollowersContactBlock(): Promise<void> {
    await addNewBlockModalLocators.collectFollowersContactBlockLink(this.page).click();
  }
}
