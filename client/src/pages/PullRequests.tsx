// client/src/pages/PullRequests.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPullRequests,
  type PullRequest,
} from "../services/github.service";

type PRFilter = "all" | "open" | "closed";

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString();
};

const PullRequests = () => {
  const { owner, repo } = useParams<{ owner: string; repo: string }>();
  const navigate = useNavigate();

  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PRFilter>("all");
  const [selectedPR, setSelectedPR] = useState<PullRequest | null>(null);

  // PRs fetch karna. owner/repo ya reloadKey badalne par dobara chalta hai.
  // setState sirf async callbacks ke andar hai, effect ki body mein seedha nahi.
  useEffect(() => {
    if (!owner || !repo) {
      return;
    }

    let cancelled = false;

    getPullRequests(owner, repo)
      .then((data) => {
        if (!cancelled) {
          setPullRequests(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load pull requests."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [owner, repo, reloadKey]);

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const handleBack = () => navigate("/repositories");

  const handleViewDetails = () => {
    if (!selectedPR || !owner || !repo) {
      return;
    }

    navigate(
      `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}/pull-requests/${selectedPR.number}`
    );
  };

  // Hooks ke baad hi early return, taaki hooks ka order na bigde.
  if (!owner || !repo) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium"
        >
          Back
        </button>

        <h1 className="text-2xl font-bold">
          Repository not specified
        </h1>
      </div>
    );
  }

  const filteredPullRequests = pullRequests.filter((pr) => {
    const matchesSearch =
      pr.title.toLowerCase().includes(search.toLowerCase()) ||
      pr.number.toString().includes(search);

    const matchesFilter = filter === "all" || pr.status === filter;

    return matchesSearch && matchesFilter;
  });

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
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 rounded-lg bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm font-medium"
        >
          Back to repositories
        </button>

        <h2 className="text-3xl font-bold">
          Pull Requests
        </h2>

        <p className="mt-2 font-mono text-sm text-gray-400">
          {owner}/{repo}
        </p>

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

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-gray-500">
            Loading pull requests...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
            >
              Try again
            </button>
          </div>
        )}

        {/* Pull Request List */}
        {!loading && !error && (
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
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">
                        #{pr.number}
                      </span>

                      <h3 className="text-lg font-semibold truncate">
                        {pr.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                      <span>
                        Author: {pr.author}
                      </span>

                      <span>
                        Updated {formatDate(pr.updatedAt)}
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
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${
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
        )}

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
              onClick={handleViewDetails}
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