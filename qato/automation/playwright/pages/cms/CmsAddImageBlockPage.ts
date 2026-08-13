import type { Page } from "@playwright/test";
import { cmsAddImageBlockLocators } from "../../locators/cms/addImageBlockPage.locators";
import { cmsRoutes } from "../../config";

export class CmsAddImageBlockPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(cmsRoutes.addImageBlock());
  }

  async fillTitle(title: string): Promise<void> {
    await cmsAddImageBlockLocators.titleInput(this.page).fill(title);
  }

  /** Sets the file input directly — Playwright's setInputFiles works even though the input is visually hidden. */
  async uploadImage(filePath: string): Promise<void> {
    await cmsAddImageBlockLocators.fileInput(this.page).setInputFiles(filePath);
  }

  async clickCancel(): Promise<void> {
    await cmsAddImageBlockLocators.cancelLink(this.page).click();
  }

  async clickSubmit(): Promise<void> {
    await cmsAddImageBlockLocators.submitButton(this.page).click();
  }
}
