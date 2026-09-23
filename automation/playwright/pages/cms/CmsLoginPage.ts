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

  /** Toggles the password field between masked and plain text. */
  async togglePasswordVisibility(): Promise<void> {
    await cmsLoginLocators.togglePasswordVisibilityButton(this.page).click();
  }

  /** Navigates to the password recovery page. */
  async clickForgotPassword(): Promise<void> {
    await cmsLoginLocators.forgotPasswordLink(this.page).click();
  }

  /**
   * Starts the Google OAuth login flow. Only exposes the click — modeling
   * the actual OAuth consent/redirect flow is out of scope here (no
   * codegen or HTML for Google's own consent screen), and would belong
   * to a separate concern if it's ever needed.
   */
  async clickContinueWithGoogle(): Promise<void> {
    await cmsLoginLocators.continueWithGoogleLink(this.page).click();
  }

  /** Navigates to the registration flow. */
  async clickRegister(): Promise<void> {
    await cmsLoginLocators.registerButton(this.page).click();
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
