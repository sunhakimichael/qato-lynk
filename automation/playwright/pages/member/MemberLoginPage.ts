import type { Page } from "@playwright/test";
import { memberLoginLocators } from "../../locators/member/loginPage.locators";
import { memberRoutes } from "../../config";

export class MemberLoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(memberRoutes.login());
  }

  async fillEmail(email: string): Promise<void> {
    await memberLoginLocators.emailInput(this.page).fill(email);
  }

  async clickSignIn(): Promise<void> {
    await memberLoginLocators.signInButton(this.page).click();
  }

  async login(email: string): Promise<void> {
    await this.fillEmail(email);
    await this.clickSignIn();
  }
}
