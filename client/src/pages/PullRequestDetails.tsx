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
      </main>
    </div>
  );
};

export default PullRequestDetails;