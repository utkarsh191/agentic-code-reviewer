import { useState } from "react";

const CodeReview = () => {
  const [code, setCode] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReview = async () => {
    if (!code.trim()) {
      setError("Please enter some code to review.");
      setReview("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setReview("");

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      {/* Header */}
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

      {/* Main */}
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

          {/* Error Message */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Review Button */}
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

        {/* AI Review Result */}
        {review && (
          <div className="mt-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4">
              AI Review
            </h3>

            <div className="rounded-lg bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4">
              <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 dark:text-gray-300 font-mono">
                {review}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CodeReview;