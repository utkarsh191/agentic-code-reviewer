import { useState } from "react";

interface PullRequestDetailsProps {
  onBack: () => void;
}

const PullRequestDetails = ({
  onBack,
}: PullRequestDetailsProps) => {
  const [selectedFile, setSelectedFile] = useState("src/auth.js");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold">
            Agentic Code Reviewer
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Pull Request Details
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to Pull Requests
        </button>

        {/* PR Information */}
        <div className="mt-6 border border-gray-800 bg-gray-900 rounded-xl p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-lg">
                  #25
                </span>

                <h2 className="text-2xl font-bold">
                  Fix authentication bug
                </h2>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                <span>
                  Author:{" "}
                  <span className="text-gray-300">
                    Utkarsh
                  </span>
                </span>

                <span>
                  Updated 2 hours ago
                </span>

                <span className="px-2.5 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
                  Open
                </span>
              </div>
            </div>

            <button
              type="button"
              className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
            >
              Start Review
            </button>
          </div>
        </div>

        {/* PR Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-800 bg-gray-900 rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Changed Files
            </p>

            <p className="text-2xl font-bold mt-2">
              3
            </p>
          </div>

          <div className="border border-gray-800 bg-gray-900 rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Additions
            </p>

            <p className="text-2xl font-bold mt-2 text-green-400">
              +24
            </p>
          </div>

          <div className="border border-gray-800 bg-gray-900 rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Deletions
            </p>

            <p className="text-2xl font-bold mt-2 text-red-400">
              -8
            </p>
          </div>
        </div>

        {/* Changed Files */}
        <div className="mt-6 border border-gray-800 bg-gray-900 rounded-xl p-6">
          <h3 className="text-lg font-semibold">
            Changed Files
          </h3>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => setSelectedFile("src/auth.js")}
              className={`w-full text-left border rounded-lg p-4 transition ${
                selectedFile === "src/auth.js"
                  ? "border-blue-500 bg-blue-950/20"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              <p className="font-medium">
                src/auth.js
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Authentication changes
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFile("src/user.js")}
              className={`w-full text-left border rounded-lg p-4 transition ${
                selectedFile === "src/user.js"
                  ? "border-blue-500 bg-blue-950/20"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              <p className="font-medium">
                src/user.js
              </p>

              <p className="text-sm text-gray-500 mt-1">
                User logic changes
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedFile("src/api.js")}
              className={`w-full text-left border rounded-lg p-4 transition ${
                selectedFile === "src/api.js"
                  ? "border-blue-500 bg-blue-950/20"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              <p className="font-medium">
                src/api.js
              </p>

              <p className="text-sm text-gray-500 mt-1">
                API changes
              </p>
            </button>
          </div>

          <div className="mt-5 text-sm text-gray-400">
            Selected file:{" "}
            <span className="text-white font-medium">
              {selectedFile}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PullRequestDetails;