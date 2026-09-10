import { useState } from "react";

interface Finding {
  category: "bug" | "security" | "performance" | "quality";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  suggestedFix: string;
}

interface ReviewResult {
  summary: string;
  findings: Finding[];
}

const CodeReview = () => {
  const [code, setCode] = useState("");
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReview = async () => {
    if (!code.trim()) {
      setError("Please enter some code to review.");
      setReview(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setReview(null);

      const response = await fetch("http://localhost:5000/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "AI review failed.");
        return;
      }

      setReview(data.review);
    } catch (error) {
      console.error("Review request failed:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityClass = (severity: Finding["severity"]) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";

      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400";

      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400";

      case "low":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
    }
  };

  const getCategoryClass = (category: Finding["category"]) => {
    switch (category) {
      case "bug":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";

      case "security":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400";

      case "performance":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";

      case "quality":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Agentic Code Reviewer
          </h1>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            Code Review
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Review Your Code
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Paste your code below and let AI find bugs and potential issues.
          </p>
        </div>

        {/* Code Input */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <label className="block text-sm font-medium mb-3">
            Your Code
          </label>

          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);

              if (error) {
                setError("");
              }
            }}
            placeholder="Paste your code here..."
            className="w-full h-80 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 p-4 font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleReview}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              {loading ? "Reviewing..." : "Review Code"}
            </button>
          </div>
        </div>

        {/* Review Result */}
        {review && (
          <div className="mt-6 space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-3">
                Review Summary
              </h3>

              <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                {review.summary}
              </p>

              <div className="mt-4 text-sm font-medium">
                {review.findings.length}{" "}
                {review.findings.length === 1
                  ? "finding"
                  : "findings"}{" "}
                detected
              </div>
            </div>

            {/* Findings */}
            {review.findings.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Findings
                </h3>

                <div className="space-y-4">
                  {review.findings.map((finding, index) => (
                    <div
                      key={`${finding.category}-${index}`}
                      className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getCategoryClass(
                            finding.category
                          )}`}
                        >
                          {finding.category}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getSeverityClass(
                            finding.severity
                          )}`}
                        >
                          {finding.severity}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold mb-2">
                          Description
                        </h4>

                        <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                          {finding.description}
                        </p>
                      </div>

                      <div className="mt-5">
                        <h4 className="text-sm font-semibold mb-2">
                          Suggested Fix
                        </h4>

                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
                          <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                            {finding.suggestedFix}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                  No issues found
                </h3>

                <p className="mt-2 text-sm text-green-600 dark:text-green-500">
                  AI did not find any meaningful bugs, security,
                  performance, or quality issues.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CodeReview;