import type { Page, Locator } from "@playwright/test";
import { otpModalLocators } from "../locators/components/otpModal.locators";

export class OtpModal {
  constructor(private readonly page: Page) {}

  get heading(): Locator {
    return otpModalLocators.heading(this.page);
  }

  get description(): Locator {
    return otpModalLocators.description(this.page);
  }

  get modal(): Locator {
    return otpModalLocators.modal(this.page);
  }

  /** FRAGILE — see locators/components/otpModal.locators.ts. */
  get otpDigitsContainer(): Locator {
    return otpModalLocators.otpDigitsContainer(this.page);
  }

  /**
   * Fills the 6 OTP digit inputs with a real one-time code. The code
   * itself must be supplied by the caller — it's a fresh value delivered
   * to the member's real inbox at run time and cannot be sourced from
   * static test data.
   */
  async enterCode(code: string): Promise<void> {
    if (!/^\d{6}$/.test(code)) {
      throw new Error(`OTP code must be exactly 6 digits, received: "${code}"`);
    }

    for (let position = 1; position <= 6; position += 1) {
      const digit = code[position - 1];
      if (digit === undefined) {
        throw new Error(`OTP code is missing digit at position ${position}: "${code}"`);
      }
      await otpModalLocators.otpDigitInput(this.page, position).fill(digit);
    }
  }
}
