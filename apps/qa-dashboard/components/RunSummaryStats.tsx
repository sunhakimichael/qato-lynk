import { Card, CardContent } from "./ui/card";
import type { TestRunSummary } from "../lib/types";

function StatCard({ label, value, accentClass = "text-foreground" }: { label: string; value: string; accentClass?: string }) {
  return (
    <Card>
      <CardContent>
        <div className={`font-display text-2xl font-bold ${accentClass}`}>{value}</div>
        <div className="font-body text-xs text-muted">{label}</div>
      </CardContent>
    </Card>
  );
}

export function RunSummaryStats({ summary }: { summary: TestRunSummary }) {
  const minutes = Math.floor(summary.durationSeconds / 60);
  const seconds = Math.round(summary.durationSeconds % 60);
  const durationLabel = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <StatCard label="Total tests" value={String(summary.total)} />
      <StatCard label="Passed" value={String(summary.passed)} accentClass="text-pass" />
      <StatCard label="Failed" value={String(summary.failed)} accentClass="text-fail" />
      <StatCard label="Skipped" value={String(summary.skipped)} accentClass="text-skip" />
      <StatCard label="Duration" value={durationLabel} />
    </div>
  );
}
