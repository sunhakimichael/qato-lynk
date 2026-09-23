import { describe, expect, it } from "vitest";
import { parseJunitXml } from "../parseJunitReport";

describe("parseJunitXml", () => {
  it("parses a mixed pass/fail/skip report", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites id="" name="" tests="4" failures="1" skipped="1" time="6.79">
  <testsuite name="cms/login.spec.ts" tests="1" failures="0" skipped="0" time="1.23">
    <testcase name="creator can log in and view the Product Orders list" classname="cms/login.spec.ts" time="1.23"/>
  </testsuite>
  <testsuite name="public/guest-checkout.spec.ts" tests="1" failures="0" skipped="0" time="3.45">
    <testcase name="guest can complete checkout and reach a confirmed payment status" classname="public/guest-checkout.spec.ts" time="3.45"/>
  </testsuite>
  <testsuite name="member/request-otp.spec.ts" tests="1" failures="1" skipped="0" time="2.1">
    <testcase name="member can request an OTP after submitting their email" classname="member/request-otp.spec.ts" time="2.1">
      <failure message="Timed out waiting for element">Error: locator.click: Timeout 30000ms exceeded.</failure>
    </testcase>
  </testsuite>
  <testsuite name="member/download-purchased-content.spec.ts" tests="1" failures="0" skipped="1" time="0.01">
    <testcase name="member can view content detail and download purchased content" classname="member/download-purchased-content.spec.ts" time="0.01">
      <skipped message="OTP_CODE env var not provided"/>
    </testcase>
  </testsuite>
</testsuites>`;

    const summary = parseJunitXml(xml);

    expect(summary.total).toBe(4);
    expect(summary.passed).toBe(2);
    expect(summary.failed).toBe(1);
    expect(summary.skipped).toBe(1);
    expect(summary.durationSeconds).toBeCloseTo(1.23 + 3.45 + 2.1 + 0.01, 5);
  });

  it("extracts the failure message for a failed test", () => {
    const xml = `<testsuites><testsuite name="member/request-otp.spec.ts">
      <testcase name="member can request an OTP" classname="member/request-otp.spec.ts" time="2.1">
        <failure message="Timed out waiting for element">stack trace here</failure>
      </testcase>
    </testsuite></testsuites>`;

    const summary = parseJunitXml(xml);

    expect(summary.testCases[0]?.status).toBe("failed");
    expect(summary.testCases[0]?.failureMessage).toBe("Timed out waiting for element");
  });

  it("handles a single testsuite/testcase without arrays (fast-xml-parser quirk)", () => {
    const xml = `<testsuites><testsuite name="cms/login.spec.ts">
      <testcase name="creator can log in" classname="cms/login.spec.ts" time="1.0"/>
    </testsuite></testsuites>`;

    const summary = parseJunitXml(xml);

    expect(summary.total).toBe(1);
    expect(summary.testCases[0]?.status).toBe("passed");
  });

  it("returns an empty summary for a report with no test suites", () => {
    const xml = `<testsuites></testsuites>`;

    const summary = parseJunitXml(xml);

    expect(summary.total).toBe(0);
    expect(summary.passed).toBe(0);
    expect(summary.failed).toBe(0);
    expect(summary.skipped).toBe(0);
    expect(summary.durationSeconds).toBe(0);
  });

  it("defaults duration to 0 when the time attribute is missing", () => {
    const xml = `<testsuites><testsuite name="cms/login.spec.ts">
      <testcase name="creator can log in" classname="cms/login.spec.ts"/>
    </testsuite></testsuites>`;

    const summary = parseJunitXml(xml);

    expect(summary.testCases[0]?.durationSeconds).toBe(0);
  });
});
