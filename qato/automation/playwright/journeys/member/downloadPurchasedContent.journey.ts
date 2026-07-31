import type { Page, Download } from "@playwright/test";
import { loginAsMember } from "../authentication/loginAsMember.journey";
import { LibraryPage } from "../../pages/member/LibraryPage";
import { ContentDetailPage } from "../../pages/member/ContentDetailPage";

export interface DownloadPurchasedContentOptions {
  otpCode: string;
  email?: string;
  /**
   * 0-indexed position of the "Check Details" link to click. Defaults to
   * 2 — the position confirmed in the recorded session to lead to a
   * successful detail view and download.
   *
   * JUDGMENT CALL: the recorded codegen session clicked "Check Details"
   * at position 4 first, then "Go Back", then position 2 — and only the
   * position-2 click is followed by confirmed success (the h2 assertion,
   * "Continue Reading", and a completed download). I'm treating the
   * position-4-then-back sequence as recording exploration (e.g. an
   * initial wrong click that was corrected), not two intentional steps,
   * and did not replay it. This is an interpretation, not a confirmed
   * fact — flagging it explicitly rather than silently picking one path.
   * A trailing `getByText('Content detail Japan Trip').click()` after the
   * download completed was dropped for the same reason: no demonstrated
   * purpose, likely incidental.
   */
  checkDetailsPosition?: number;
}

export interface DownloadResult {
  contentDetailPage: ContentDetailPage;
  download: Download;
}

/**
 * Full flow: member login (OTP) -> Library -> Content Detail -> download.
 */
export async function downloadPurchasedContent(
  page: Page,
  options: DownloadPurchasedContentOptions,
): Promise<DownloadResult> {
  const { otpCode, email, checkDetailsPosition = 2 } = options;

  await loginAsMember(page, otpCode, email);

  const libraryPage = new LibraryPage(page);
  await libraryPage.clickCheckDetailsByPosition(checkDetailsPosition);

  const contentDetailPage = new ContentDetailPage(page);
  const download = await contentDetailPage.continueReadingAndDownload();

  return { contentDetailPage, download };
}
