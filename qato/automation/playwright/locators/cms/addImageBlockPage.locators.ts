import type { Page } from "@playwright/test";

export const cmsAddImageBlockLocators = {
  /** name="title", placeholder "Enter Block Name". */
  titleInput: (page: Page) => page.locator('input[name="title"]'),
  /** Real id, type="file". Hidden by default; triggered via uploadImageButton. */
  fileInput: (page: Page) => page.locator("#pic"),
  uploadImageButton: (page: Page) => page.getByRole("button", { name: "Upload Image" }),
  /**
   * href="/admin/my-lynks" — NOTE: this differs from Text/Link/Video's
   * Cancel link, which points to "/admin/my-lynks/home" instead. Same
   * semantic action ("Cancel"), two different destinations depending on
   * which block-type page you're on. See docs/ENGINEERING.md Findings.
   */
  cancelLink: (page: Page) => page.getByRole("link", { name: "Cancel" }),
  submitButton: (page: Page) => page.getByRole("button", { name: "Add Image" }),
};
