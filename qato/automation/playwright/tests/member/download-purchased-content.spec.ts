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
 * Tagged @regression, not @smoke — safe to include in an unattended
 * regression run since it skips gracefully (rather than failing) without
 * a live OTP code. Not @smoke because a suite meant to run on every push
 * shouldn't depend on manual input at all.
 */
test(
  "member can view content detail and download purchased content",
  { tag: "@regression" },
  async ({ page }) => {
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
  },
);
