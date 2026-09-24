interface SemgrepFinding {
  ruleId: string;
  severity: "error" | "warning";
  message: string;
  filePath: string;
  line: number;
  column: number;
}

interface SemgrepFindingsProps {
  findings: SemgrepFinding[];
}

const getSeverityClass = (
  severity: SemgrepFinding["severity"]
) => {
  switch (severity) {
    case "error":
      return "bg-red-500/10 text-red-400 border-red-500/20";

    case "warning":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  }
};

const SemgrepFindings = ({
  findings,
}: SemgrepFindingsProps) => {
  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">
          Security Findings
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Security issues detected by Semgrep static analysis.
        </p>
      </div>

      {findings.length === 0 ? (
        <div className="rounded-xl border border-green-900 bg-green-950/30 p-5">
          <h3 className="text-lg font-semibold text-green-400">
            No security issues found
          </h3>

          <p className="mt-2 text-sm text-green-500">
            Semgrep did not detect any security problems in the analyzed code.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {findings.map((finding, index) => (
            <div
              key={`${finding.ruleId}-${finding.line}-${index}`}
              className="rounded-xl border border-gray-800 bg-gray-900 p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getSeverityClass(
                    finding.severity
                  )}`}
                >
                  {finding.severity}
                </span>

                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                  Security
                </span>

                <span className="rounded-full bg-gray-800 px-3 py-1 font-mono text-xs text-gray-300">
                  {finding.ruleId}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm leading-6 text-gray-300">
                  {finding.message}
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-gray-800 bg-gray-950 p-4">
                <p className="font-mono text-xs text-gray-400">
                  {finding.filePath}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Line {finding.line}, Column {finding.column}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SemgrepFindings;