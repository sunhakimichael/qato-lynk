import { test } from "../../fixtures";
import { requestMemberOtp } from "../../journeys/authentication/requestMemberOtp.journey";
import { expectOtpChallengePresented } from "../../assertions";

test(
  "member can request an OTP after submitting their email",
  { tag: ["@member", "@smoke", "@regression"] },
  async ({ page }) => {
    const otpModal = await requestMemberOtp(page);
    await expectOtpChallengePresented(otpModal);
  },
);
