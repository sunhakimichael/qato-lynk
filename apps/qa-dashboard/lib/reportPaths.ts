import path from "node:path";

/**
 * Absolute path to the JUnit XML report the Playwright suite produces.
 *
 * process.cwd() is the app's own directory (apps/qa-dashboard) under the
 * standard `next dev`/`next build`/`next start` invocation — using
 * __dirname here would be unreliable, since Next's bundler can rewrite it
 * in ways that don't reflect the original source location.
 */
export function getJunitReportPath(): string {
  return path.resolve(
    process.cwd(),
    "../../automation/playwright/reports/junit/results.xml",
  );
}
