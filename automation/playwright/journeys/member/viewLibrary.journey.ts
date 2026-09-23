import type { Page } from "@playwright/test";
import { loginAsMember } from "../authentication/loginAsMember.journey";
import { LibraryPage } from "../../pages/member/LibraryPage";

/** Logs in as the member (OTP required) and returns the Library page. */
export async function viewLibrary(page: Page, otpCode: string, email?: string): Promise<LibraryPage> {
  await loginAsMember(page, otpCode, email);
  return new LibraryPage(page);
}
