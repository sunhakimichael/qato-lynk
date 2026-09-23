import { errors, type Locator, type Page } from "@playwright/test";
import { loadEnvConfig } from "@qato/shared";

export interface WaitForPageReadyOptions {
  /** Human-readable page name for the error message, e.g. "Checkout". */
  pageName: string;
  /**
   * Reload once and wait again if the page hasn't become ready in time.
   * Only enable for pages whose reload is a harmless GET (storefront,
   * product detail, checkout form) — never for a page reached right after
   * submitting something, where a reload could repeat the action.
   */
  reloadOnTimeout?: boolean;
}

/**
 * Waits for a slow page to actually be usable, instead of relying on the
 * default action timeout. MyLink pages sometimes take a long time to load
 * (storefront, product detail, checkout after Buy Now, payment page), so
 * this waits up to PAGE_LOAD_TIMEOUT_MS for the page's key element to be
 * visible, optionally reloads once if it never shows, and fails with a
 * clear message naming the page and URL.
 */
export async function waitForPageReady(
  page: Page,
  readyLocator: Locator,
  { pageName, reloadOnTimeout = false }: WaitForPageReadyOptions,
): Promise<void> {
  const timeout = loadEnvConfig().PAGE_LOAD_TIMEOUT_MS;

  try {
    await readyLocator.waitFor({ state: "visible", timeout });
    return;
  } catch (error) {
    if (!(error instanceof errors.TimeoutError) || !reloadOnTimeout) {
      throw pageNotReadyError(page, pageName, timeout, error);
    }
  }

  await page.reload({ waitUntil: "domcontentloaded", timeout });
  try {
    await readyLocator.waitFor({ state: "visible", timeout });
  } catch (error) {
    throw pageNotReadyError(page, pageName, timeout, error, " (also after one reload)");
  }
}

/**
 * page.goto() that only waits for DOMContentLoaded rather than the full
 * "load" event — slow images/third-party scripts otherwise block the
 * navigation even though the page is already usable. Pair with
 * waitForPageReady() to wait for the element that actually matters.
 */
export async function gotoSlowPage(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: loadEnvConfig().PAGE_LOAD_TIMEOUT_MS });
}

function pageNotReadyError(
  page: Page,
  pageName: string,
  timeout: number,
  cause: unknown,
  suffix = "",
): Error {
  return new Error(
    `${pageName} page did not finish loading within ${timeout}ms${suffix}. URL: ${page.url()}. ` +
      "Increase PAGE_LOAD_TIMEOUT_MS in the .env file if this environment is consistently slow.",
    { cause },
  );
}
