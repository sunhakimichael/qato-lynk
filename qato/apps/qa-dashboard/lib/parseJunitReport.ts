import { readFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";
import type { TestCaseResult, TestRunSummary } from "./types";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

/** Normalizes fast-xml-parser's "single item vs array" ambiguity. */
function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

interface RawTestCase {
  "@_name": string;
  "@_classname"?: string;
  "@_time"?: string;
  failure?: { "@_message"?: string } | string;
  skipped?: { "@_message"?: string } | string;
}

interface RawTestSuite {
  "@_name"?: string;
  testcase?: RawTestCase | RawTestCase[];
}

interface RawTestSuites {
  testsuites?: {
    testsuite?: RawTestSuite | RawTestSuite[];
  };
}

function parseTestCase(raw: RawTestCase, suiteName: string): TestCaseResult {
  const durationSeconds = Number.parseFloat(raw["@_time"] ?? "0") || 0;

  if (raw.failure !== undefined) {
    const message = typeof raw.failure === "string" ? raw.failure : raw.failure["@_message"];
    return {
      suiteName,
      name: raw["@_name"],
      status: "failed",
      durationSeconds,
      failureMessage: message ?? "No failure message provided.",
    };
  }

  if (raw.skipped !== undefined) {
    return {
      suiteName,
      name: raw["@_name"],
      status: "skipped",
      durationSeconds,
    };
  }

  return {
    suiteName,
    name: raw["@_name"],
    status: "passed",
    durationSeconds,
  };
}

/**
 * Parses a JUnit XML report (as produced by Playwright's junit reporter)
 * into a typed summary. Pure function — no file I/O — so it's fully unit
 * testable without a browser or filesystem.
 */
export function parseJunitXml(xmlText: string): TestRunSummary {
  const parsed = parser.parse(xmlText) as RawTestSuites;
  const suites = toArray(parsed.testsuites?.testsuite);

  const testCases: TestCaseResult[] = suites.flatMap((suite) => {
    const suiteName = suite["@_name"] ?? "unknown";
    return toArray(suite.testcase).map((testcase) => parseTestCase(testcase, suiteName));
  });

  const passed = testCases.filter((tc) => tc.status === "passed").length;
  const failed = testCases.filter((tc) => tc.status === "failed").length;
  const skipped = testCases.filter((tc) => tc.status === "skipped").length;
  const durationSeconds = testCases.reduce((sum, tc) => sum + tc.durationSeconds, 0);

  return {
    total: testCases.length,
    passed,
    failed,
    skipped,
    durationSeconds,
    testCases,
  };
}

/**
 * Reads and parses the JUnit report from disk. Returns null if no report
 * exists yet (e.g. `pnpm test:e2e` hasn't been run) — this is an expected,
 * common state, not an error condition.
 */
export async function readJunitReport(filePath: string): Promise<TestRunSummary | null> {
  let xmlText: string;
  try {
    xmlText = await readFile(filePath, "utf-8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }

  return parseJunitXml(xmlText);
}
