import { describe, expect, it } from "vitest";
import { DEFAULT_RETRY_AFTER_MS, MAX_RETRY_AFTER_MS, parseRetryAfterMs } from "../retryAfter";

describe("parseRetryAfterMs", () => {
  it("converts delta-seconds to milliseconds", () => {
    expect(parseRetryAfterMs("10")).toBe(10_000);
  });

  it("converts an HTTP date relative to now", () => {
    const now = Date.parse("2026-09-23T10:00:00Z");
    expect(parseRetryAfterMs("Wed, 23 Sep 2026 10:00:20 GMT", now)).toBe(20_000);
  });

  it("falls back to the default when missing or unparseable", () => {
    expect(parseRetryAfterMs(undefined)).toBe(DEFAULT_RETRY_AFTER_MS);
    expect(parseRetryAfterMs("")).toBe(DEFAULT_RETRY_AFTER_MS);
    expect(parseRetryAfterMs("soon")).toBe(DEFAULT_RETRY_AFTER_MS);
  });

  it("caps very long waits and never goes negative", () => {
    expect(parseRetryAfterMs("3600")).toBe(MAX_RETRY_AFTER_MS);
    const now = Date.parse("2026-09-23T10:00:00Z");
    expect(parseRetryAfterMs("Wed, 23 Sep 2026 09:59:00 GMT", now)).toBe(0);
  });
});
