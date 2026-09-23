import type { Page } from "@playwright/test";
import { cmsAddLinkBlockLocators } from "../../locators/cms/addLinkBlockPage.locators";
import { cmsRoutes } from "../../config";

export class CmsAddLinkBlockPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(cmsRoutes.addLinkBlock());
  }

  async fillTitle(title: string): Promise<void> {
    await cmsAddLinkBlockLocators.titleInput(this.page).fill(title);
  }

  async fillUrl(url: string): Promise<void> {
    await cmsAddLinkBlockLocators.urlInput(this.page).fill(url);
  }

  async uploadImage(filePath: string): Promise<void> {
    await cmsAddLinkBlockLocators.fileInput(this.page).setInputFiles(filePath);
  }

  /** Enables the scheduled-release date/time fields. */
  async enableReleaseTime(): Promise<void> {
    await cmsAddLinkBlockLocators.releaseTimeToggle(this.page).click();
  }

  async fillStartDate(date: string): Promise<void> {
    await cmsAddLinkBlockLocators.startDateInput(this.page).fill(date);
  }

  async fillStartAt(time: string): Promise<void> {
    await cmsAddLinkBlockLocators.startAtInput(this.page).fill(time);
  }

  /** Optional in the real UI. */
  async fillEndDate(date: string): Promise<void> {
    await cmsAddLinkBlockLocators.endDateInput(this.page).fill(date);
  }

  /** Optional in the real UI. */
  async fillEndAt(time: string): Promise<void> {
    await cmsAddLinkBlockLocators.endAtInput(this.page).fill(time);
  }

  async selectDefaultLayout(): Promise<void> {
    await cmsAddLinkBlockLocators.defaultLayoutRadio(this.page).check();
  }

  async selectLargeLayout(): Promise<void> {
    await cmsAddLinkBlockLocators.largeLayoutRadio(this.page).check();
  }

  async clickCancel(): Promise<void> {
    await cmsAddLinkBlockLocators.cancelLink(this.page).click();
  }

  async clickSubmit(): Promise<void> {
    await cmsAddLinkBlockLocators.submitButton(this.page).click();
  }
}
