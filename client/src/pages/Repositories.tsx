// client/src/pages/Repositories.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRepositories,
  type Repository,
} from "../services/github.service";
import { clearAuth, getUser } from "../services/auth";

type RepoFilter = "all" | "public" | "private";

const Repositories = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RepoFilter>("all");
  const [selectedRepository, setSelectedRepository] =
    useState<Repository | null>(null);

  // Repos fetch karna. reloadKey badalne par dobara chalta hai ("Try again" ke liye).
  // setState sirf async callbacks ke andar hai, effect ki body mein seedha nahi.
  useEffect(() => {
    let cancelled = false;

    getRepositories()
      .then((data) => {
        if (!cancelled) {
          setRepositories(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load repositories."
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    // Component hat jaye ya effect dobara chale to purani request ka result ignore.
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  const handleViewPullRequests = () => {
    if (!selectedRepository) {
      return;
    }

    navigate(
      `/repositories/${encodeURIComponent(
        selectedRepository.owner
      )}/${encodeURIComponent(selectedRepository.name)}/pull-requests`
    );
  };

  const filteredRepositories = repositories.filter((repo) => {
    const matchesSearch = repo.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "public" && !repo.private) ||
      (filter === "private" && repo.private);

    return matchesSearch && matchesFilter;
  });

  const getFilterClass = (value: RepoFilter) =>
    filter === value
      ? "bg-blue-600 text-white"
      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Agentic Code Reviewer
          </h1>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {user.login}
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold">
          My Repositories
        </h2>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Select a GitHub repository to continue.
        </p>

        {/* Search */}
        <div className="mt-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${getFilterClass("all")}`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter("public")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${getFilterClass("public")}`}
          >
            Public
          </button>

          <button
            type="button"
            onClick={() => setFilter("private")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${getFilterClass("private")}`}
          >
            Private
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Loading repositories...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-red-600 dark:text-red-400">
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

        {/* Repository List */}
        {!loading && !error && (
          <div className="grid gap-4 mt-6">
            {filteredRepositories.map((repo) => (
              <div
                key={repo.id}
                className={`border rounded-xl p-5 ${
                  selectedRepository?.id === repo.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">
                      {repo.fullName}
                    </h3>

                    {repo.description && (
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {repo.language || "Unknown"}
                      </span>

                      <span>
                        {repo.private ? "Private" : "Public"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRepository(repo)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedRepository?.id === repo.id
                        ? "bg-green-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {selectedRepository?.id === repo.id
                      ? "Selected"
                      : "Select"}
                  </button>
                </div>
              </div>
            ))}

            {filteredRepositories.length === 0 && (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No repositories found.
              </div>
            )}
          </div>
        )}

        {/* Selected Repository */}
        {selectedRepository && (
          <div className="mt-6 border border-blue-500/30 bg-blue-50 dark:bg-blue-950/10 rounded-xl p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selected Repository
            </p>

            <h3 className="text-lg font-semibold mt-1">
              {selectedRepository.fullName}
            </h3>

            <button
              type="button"
              onClick={handleViewPullRequests}
              className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
            >
              View Pull Requests
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Repositories;