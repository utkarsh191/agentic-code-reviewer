import { useState } from "react";

interface PullRequestDetailsProps {
  number: number;
  title: string;
  author: string;
  status: "open" | "closed";
  updatedAt: string;
  onBack: () => void;
}

const PullRequestDetails = ({
  number,
  title,
  author,
  status,
  updatedAt,
  onBack,
}: PullRequestDetailsProps) => (
  <div className="min-h-screen bg-gray-950 text-white p-6">
    <button
      type="button"
      onClick={onBack}
      className="mb-6 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium"
    >
      Back
    </button>
    <h1 className="text-3xl font-bold">
      #{number} {title}
    </h1>
    <p className="mt-3 text-gray-400">Author: {author}</p>
    <p className="mt-1 text-gray-400">
      Status: {status} · Updated {updatedAt}
    </p>
  </div>
);

interface PullRequest {
  id: number;
  number: number;
  title: string;
  author: string;
  status: "open" | "closed";
  updatedAt: string;
}

const PullRequests = () => {
  const [pullRequests] = useState<PullRequest[]>([
    {
      id: 1,
      number: 25,
      title: "Fix authentication bug",
      author: "Utkarsh",
      status: "open",
      updatedAt: "2 hours ago",
    },
    {
      id: 2,
      number: 24,
      title: "Add dashboard UI",
      author: "Utkarsh",
      status: "open",
      updatedAt: "1 day ago",
    },
    {
      id: 3,
      number: 23,
      title: "Update user API",
      author: "Utkarsh",
      status: "closed",
      updatedAt: "3 days ago",
    },
  ]);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "all" | "open" | "closed"
  >("all");

  const [selectedPR, setSelectedPR] =
    useState<PullRequest | null>(null);

  const [showDetails, setShowDetails] = useState(false);

  const filteredPullRequests = pullRequests.filter((pr) => {
    const matchesSearch =
      pr.title.toLowerCase().includes(search.toLowerCase()) ||
      pr.number.toString().includes(search);

    const matchesFilter =
      filter === "all" || pr.status === filter;

    return matchesSearch && matchesFilter;
  });

  if (showDetails && selectedPR) {
    return (
      <PullRequestDetails
        number={selectedPR.number}
        title={selectedPR.title}
        author={selectedPR.author}
        status={selectedPR.status}
        updatedAt={selectedPR.updatedAt}
        onBack={() => setShowDetails(false)}
      />
    );
  }

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

        {/* Search */}
        <div className="mt-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pull requests..."
            className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter("open")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === "open"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            Open
          </button>

          <button
            type="button"
            onClick={() => setFilter("closed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === "closed"
                ? "bg-gray-600 text-white"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            Closed
          </button>
        </div>

        {/* Pull Request List */}
        <div className="mt-6 space-y-4">
          {filteredPullRequests.map((pr) => (
            <div
              key={pr.id}
              className={`border rounded-xl p-5 ${
                selectedPR?.id === pr.id
                  ? "border-blue-500 bg-blue-950/20"
                  : "border-gray-800 bg-gray-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">
                      #{pr.number}
                    </span>

                    <h3 className="text-lg font-semibold">
                      {pr.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span>
                      Author: {pr.author}
                    </span>

                    <span>
                      Updated {pr.updatedAt}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs ${
                        pr.status === "open"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {pr.status}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPR(pr)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedPR?.id === pr.id
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {selectedPR?.id === pr.id
                    ? "Selected"
                    : "Select PR"}
                </button>
              </div>
            </div>
          ))}

          {filteredPullRequests.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No pull requests found.
            </div>
          )}
        </div>

        {/* Selected PR */}
        {selectedPR && (
          <div className="mt-6 border border-blue-500/30 bg-blue-950/10 rounded-xl p-5">
            <p className="text-sm text-gray-400">
              Selected Pull Request
            </p>

            <h3 className="text-lg font-semibold mt-1">
              #{selectedPR.number} {selectedPR.title}
            </h3>

            <p className="text-sm text-gray-400 mt-2">
              Author: {selectedPR.author}
            </p>

            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
            >
              View PR Details
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PullRequests;