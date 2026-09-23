/** Used when a 429 carries no usable Retry-After header. Cloudflare's body suggested 30s. */
export const DEFAULT_RETRY_AFTER_MS = 30_000;
/** Never wait longer than this for one retry, whatever the server says. */
export const MAX_RETRY_AFTER_MS = 60_000;

/**
 * Converts a Retry-After header (delta-seconds, or an HTTP date) into a
 * wait in milliseconds, clamped to [0, MAX_RETRY_AFTER_MS]. Falls back to
 * DEFAULT_RETRY_AFTER_MS when the header is missing or unparseable.
 */
export function parseRetryAfterMs(headerValue: string | undefined, now: number = Date.now()): number {
  const value = headerValue?.trim();
  if (!value) {
    return DEFAULT_RETRY_AFTER_MS;
  }

  let ms: number;
  if (/^\d+$/.test(value)) {
    ms = Number(value) * 1000;
  } else {
    const date = Date.parse(value);
    if (Number.isNaN(date)) {
      return DEFAULT_RETRY_AFTER_MS;
    }
    ms = date - now;
  }

  return Math.min(Math.max(ms, 0), MAX_RETRY_AFTER_MS);
}
