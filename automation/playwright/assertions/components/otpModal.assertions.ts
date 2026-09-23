import { expect } from "@playwright/test";
import type { OtpModal } from "../../components/OtpModal";

/**
 * Matches the 5 recorded codegen assertions after requesting a member OTP.
 * Includes the FRAGILE otpDigitsContainer check — see components/OtpModal.ts
 * for why that locator is flagged.
 */
export async function expectOtpChallengePresented(otpModal: OtpModal): Promise<void> {
  await expect(otpModal.heading).toBeVisible();
  await expect(otpModal.description).toBeVisible();
  await expect(otpModal.otpDigitsContainer).toBeVisible();
  await expect(otpModal.modal).toContainText("OTP Verification");
  await expect(otpModal.modal).toContainText("Input 6 digit verification code sent to");
}
