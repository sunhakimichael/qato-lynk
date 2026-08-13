import type { Page } from "@playwright/test";

export const cmsAddTextBlockLocators = {
  /**
   * The real interactive target for the Summernote rich-text editor.
   * NOT the underlying `<textarea id="description">` — that element is
   * hidden and only holds the raw HTML source; two elements share that
   * same id/name in the real markup (a Summernote artifact), so it's
   * ambiguous anyway. `.note-editable[contenteditable]` is confirmed
   * unique and is what the user actually types into.
   */
  editableContent: (page: Page) => page.locator(".note-editable"),
  cancelLink: (page: Page) => page.getByRole("link", { name: "Cancel" }),
  submitButton: (page: Page) => page.getByRole("button", { name: "Add Text" }),
};
