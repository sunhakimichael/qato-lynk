import type { Page } from "@playwright/test";
import { cmsLoginLocators } from "../../locators/cms/loginPage.locators";
import { cmsRoutes } from "../../config";

export class CmsLoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(cmsRoutes.login());
  }

  async fillUsername(username: string): Promise<void> {
    await cmsLoginLocators.usernameInput(this.page).fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await cmsLoginLocators.passwordInput(this.page).fill(password);
  }

  async clickSignIn(): Promise<void> {
    await cmsLoginLocators.signInButton(this.page).click();
  }

  /**
   * Fills credentials and submits. Still page-local UI interaction (not a
   * cross-page business workflow), so it's fine to live here rather than
   * in a Journey.
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickSignIn();
  }
}
