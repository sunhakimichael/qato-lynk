import type { Page } from "@playwright/test";
import { PublicStorefrontPage } from "../../pages/public/PublicStorefrontPage";
import { MemberLoginPage } from "../../pages/member/MemberLoginPage";
import { OtpModal } from "../../components/OtpModal";
import { getTestMember } from "../../factories";

/**
 * Navigates from the storefront to Member Area login and submits the
 * member's email, triggering an OTP challenge.
 *
 * Stops here deliberately: completing OTP verification requires entering a
 * real one-time code delivered via email/SMS, and the recorded codegen
 * session never captured the OTP digit-entry UI (only a FRAGILE, unlabeled
 * container — see components/OtpModal.ts). Returns the OtpModal so the
 * caller can assert it appeared. Extend this journey once the OTP entry
 * flow is known.
 */
export async function requestMemberOtp(page: Page, email?: string): Promise<OtpModal> {
  const storefront = new PublicStorefrontPage(page);
  await storefront.goto();
  await storefront.openMenu();
  await storefront.clickLoginLink();

  const loginPage = new MemberLoginPage(page);
  await loginPage.goto();
  await loginPage.login(email ?? getTestMember().email);

  return new OtpModal(page);
}
