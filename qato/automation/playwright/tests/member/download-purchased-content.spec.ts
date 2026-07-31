import { test, expect } from "../../fixtures";
import { downloadPurchasedContent } from "../../journeys/member/downloadPurchasedContent.journey";
import { expectContentDetailHeading } from "../../assertions";
import { getTestProduct } from "../../factories";

/**
 * This test cannot run unattended: it needs a fresh, real OTP code
 * delivered to the member's inbox at run time (see
 * journeys/authentication/loginAsMember.journey.ts for why this can't be
 * automated yet). Supply it via OTP_CODE when running manually:
 *
 *   OTP_CODE=123456 npx playwright test download-purchased-content
 *
 * Deliberately NOT tagged @smoke — it would always fail unattended in CI
 * without a live OTP source, which defeats the point of a smoke suite.
 */
test("member can view content detail and download purchased content", async ({ page }) => {
  const otpCode = process.env.OTP_CODE;
  test.skip(
    !otpCode,
    "OTP_CODE env var not provided — this test requires a fresh, real OTP code and cannot run unattended. See file header comment.",
  );

  const product = getTestProduct();
  const { contentDetailPage, download } = await downloadPurchasedContent(page, {
    otpCode: otpCode as string,
  });

  await expectContentDetailHeading(contentDetailPage, product.name);
  expect(download.suggestedFilename()).toBeTruthy();
});
