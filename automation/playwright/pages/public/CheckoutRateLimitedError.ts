/**
 * Thrown when MyLink's payment inquiry (the request that creates the VA
 * at Duitku) keeps getting HTTP 429 from Cloudflare's rate limiter
 * (Error 1015). The checkout page shows no error of its own in this case —
 * it just stays put — so without this the test would only fail later with
 * an unexplained payment-page timeout.
 */
export class CheckoutRateLimitedError extends Error {
  constructor(attempts: number, url: string) {
    super(
      `Checkout was rate-limited by Cloudflare (HTTP 429) on the payment inquiry after ${attempts} ` +
        `attempt(s): ${url}. This is an environment issue, not a test failure — wait a few minutes ` +
        "and re-run, or ask infra to exempt the automation traffic from the dev/staging rate limit.",
    );
    this.name = "CheckoutRateLimitedError";
  }
}
