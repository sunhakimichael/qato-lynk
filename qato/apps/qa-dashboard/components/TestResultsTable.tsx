import { Card } from "./ui/card";
import { StatusBadge } from "./ui/badge";
import type { TestCaseResult } from "../lib/types";

export function TestResultsTable({ testCases }: { testCases: TestCaseResult[] }) {
  return (
    <Card>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs text-muted">
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Test</th>
            <th className="px-5 py-3 font-medium">Spec file</th>
            <th className="px-5 py-3 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody>
          {testCases.map((testCase) => (
            <tr key={`${testCase.suiteName}::${testCase.name}`} className="border-b border-border last:border-0">
              <td className="px-5 py-3 align-top">
                <StatusBadge status={testCase.status} />
              </td>
              <td className="px-5 py-3 align-top">
                <div className="text-foreground">{testCase.name}</div>
                {testCase.failureMessage ? (
                  <div className="mt-1 max-w-xl font-mono text-xs text-fail">
                    {testCase.failureMessage}
                  </div>
                ) : null}
              </td>
              <td className="px-5 py-3 align-top font-mono text-xs text-muted">
                {testCase.suiteName}
              </td>
              <td className="px-5 py-3 align-top font-mono text-xs text-muted">
                {testCase.durationSeconds.toFixed(2)}s
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
