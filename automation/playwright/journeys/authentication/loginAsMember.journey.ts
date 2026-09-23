import type { Page } from "@playwright/test";
import { requestMemberOtp } from "./requestMemberOtp.journey";

/**
 * Completes member login: requests an OTP (see requestMemberOtp), then
 * submits the provided one-time code.
 *
 * The OTP code cannot be sourced automatically — it's a fresh, real
 * one-time code delivered to the member's actual inbox (MEMBER_EMAIL) at
 * run time. No email-polling integration exists in this project, so the
 * caller must supply a real code obtained out-of-band (checking the test
 * inbox manually, or wiring up an IMAP/test-email service in a future
 * milestone). See tests/member/download-purchased-content.spec.ts for how
 * this is handled at the test level (an explicit skip, not a fake value).
 */
export async function loginAsMember(page: Page, otpCode: string, email?: string): Promise<void> {
  const otpModal = await requestMemberOtp(page, email);
  await otpModal.enterCode(otpCode);
}
