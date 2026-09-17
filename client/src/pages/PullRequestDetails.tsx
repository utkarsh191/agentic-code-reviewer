interface PullRequestDetailsProps {
  onBack: () => void;
}

const PullRequestDetails = ({
  onBack,
}: PullRequestDetailsProps) => {
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
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Back to Pull Requests
        </button>

        <div className="mt-6 border border-gray-800 bg-gray-900 rounded-xl p-6">
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
      </main>
    </div>
  );
};

export default PullRequestDetails;