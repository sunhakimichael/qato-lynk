export type TestCaseStatus = "passed" | "failed" | "skipped";

export interface TestCaseResult {
  /** The spec file, e.g. "cms/login.spec.ts" — JUnit's classname field. */
  suiteName: string;
  /** The test's title. */
  name: string;
  status: TestCaseStatus;
  durationSeconds: number;
  /** Present only when status is "failed". */
  failureMessage?: string;
}

export interface TestRunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationSeconds: number;
  testCases: TestCaseResult[];
}
