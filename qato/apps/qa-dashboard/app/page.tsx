import { readJunitReport } from "../lib/parseJunitReport";
import { getJunitReportPath } from "../lib/reportPaths";
import { PassRateGauge } from "../components/PassRateGauge";
import { RunSummaryStats } from "../components/RunSummaryStats";
import { TestResultsTable } from "../components/TestResultsTable";
import { NoReportFound } from "../components/NoReportFound";

// Reads a file fresh on every request — there's no data to go stale
// against yet (no DB), so caching would just show an old run.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await readJunitReport(getJunitReportPath());

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Qato QA Dashboard</h1>
        <p className="mt-1 font-body text-sm text-muted">
          Latest automation run — reads directly from the Playwright JUnit report on disk.
        </p>
      </header>

      {summary === null ? (
        <NoReportFound />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <PassRateGauge passed={summary.passed} total={summary.total} />
            <div className="flex-1">
              <RunSummaryStats summary={summary} />
            </div>
          </div>

          <TestResultsTable testCases={summary.testCases} />

          <p className="font-body text-xs text-muted">
            Full traces, screenshots, and videos for failed runs:{" "}
            <code className="font-mono text-accent">
              automation/playwright/reports/html/index.html
            </code>
          </p>
        </div>
      )}
    </main>
  );
}
