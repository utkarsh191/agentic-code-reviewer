const PullRequests = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold">
            Agentic Code Reviewer
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Pull Requests
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold">
          Pull Requests
        </h2>

        <p className="mt-2 text-gray-400">
          Select a pull request to review its code changes.
        </p>
      </main>
    </div>
  );
};

export default PullRequests;