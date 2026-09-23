export function NoReportFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
      <p className="font-display text-xl font-semibold text-foreground">No test run found</p>
      <p className="mt-2 max-w-md font-body text-sm text-muted">
        This dashboard reads the JUnit report your Playwright suite produces after a run. Run the
        smoke suite, then refresh this page.
      </p>
      <code className="mt-4 rounded border border-border bg-background px-3 py-1.5 font-mono text-sm text-accent">
        pnpm test:smoke
      </code>
    </div>
  );
}
