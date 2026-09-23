import type { Page } from "@playwright/test";
import { cmsAddTextBlockLocators } from "../../locators/cms/addTextBlockPage.locators";
import { cmsRoutes } from "../../config";

export class CmsAddTextBlockPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(cmsRoutes.addTextBlock());
  }

  /** Types into the rich-text editor's actual editable area (see locator comment for why). */
  async fillContent(text: string): Promise<void> {
    await cmsAddTextBlockLocators.editableContent(this.page).fill(text);
  }

  async clickCancel(): Promise<void> {
    await cmsAddTextBlockLocators.cancelLink(this.page).click();
  }

  async clickSubmit(): Promise<void> {
    await cmsAddTextBlockLocators.submitButton(this.page).click();
  }
}
