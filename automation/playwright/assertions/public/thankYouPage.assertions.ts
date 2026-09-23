import { expect } from "@playwright/test";
import type { ThankYouPage } from "../../pages/public/ThankYouPage";

/** Matches the recorded assertion: success message visible on the Thank You page. */
export async function expectThankYouPageConfirmed(thankYouPage: ThankYouPage): Promise<void> {
  await expect(thankYouPage.successMessage).toBeVisible();
}
