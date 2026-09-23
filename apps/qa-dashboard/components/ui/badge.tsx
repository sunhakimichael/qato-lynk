import type { TestCaseStatus } from "../../lib/types";

const STATUS_STYLES: Record<TestCaseStatus, string> = {
  passed: "bg-pass/15 text-pass border-pass/30",
  failed: "bg-fail/15 text-fail border-fail/30",
  skipped: "bg-skip/15 text-skip border-skip/30",
};

const STATUS_LABELS: Record<TestCaseStatus, string> = {
  passed: "Passed",
  failed: "Failed",
  skipped: "Skipped",
};

export function StatusBadge({ status }: { status: TestCaseStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
