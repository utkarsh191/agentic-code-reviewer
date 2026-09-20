// client/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  getRepositories,
  type Repository,
} from "../services/github.service";
import { clearAuth, getUser } from "../services/auth";

const getNavClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-3 rounded-lg font-medium ${
    isActive
      ? "bg-blue-600 text-white"
      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
  }`;

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

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

  const totalCount = repositories.length;
  const privateCount = repositories.filter((repo) => repo.private).length;
  const publicCount = totalCount - privateCount;

  // Server repos "recently updated" order mein bhejta hai, to pehle 5 hi latest hain.
  const recentRepositories = repositories.slice(0, 5);

  // Loading ya error mein number ki jagah "-" dikhate hain.
  const showStat = (value: number): string =>
    loading || error ? "-" : String(value);

  const displayName = user?.login ?? "GitHub User";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600">
            <span className="font-bold text-white">AI</span>
          </div>

          <h1 className="font-bold text-lg">
            Code Reviewer
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavLink to="/dashboard" end className={getNavClass}>
            Dashboard
          </NavLink>

          <NavLink to="/repositories" className={getNavClass}>
            Repositories
          </NavLink>

          <NavLink to="/code-review" className={getNavClass}>
            Code Review
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64">

        {/* Topbar */}
        <header className="h-20 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8">

          <div>
            <h2 className="text-2xl font-semibold">
              Dashboard
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Overview of your GitHub repositories
            </p>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {avatarInitial}
                </span>
              </div>
            )}

            <span className="text-sm font-medium">
              {displayName}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Logout
            </button>
          </div>

        </header>

        {/* Dashboard Content */}
        <div className="p-8">

          {/* Welcome */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold">
              Welcome back, {displayName} 👋
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Pick a repository and review its pull requests with AI.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-8 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3 flex items-center justify-between gap-4">
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

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* Total */}
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Repositories
              </p>

              <h4 className="text-3xl font-bold mt-2">
                {showStat(totalCount)}
              </h4>
            </div>

            {/* Public */}
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Public
              </p>

              <h4 className="text-3xl font-bold mt-2">
                {showStat(publicCount)}
              </h4>
            </div>

            {/* Private */}
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Private
              </p>

              <h4 className="text-3xl font-bold mt-2">
                {showStat(privateCount)}
              </h4>
            </div>

          </div>

          {/* Recently Updated Repositories */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">

            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Recently Updated Repositories
              </h3>

              <Link
                to="/repositories"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </Link>
            </div>

            {loading && (
              <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                Loading repositories...
              </div>
            )}

            {!loading && !error && recentRepositories.length === 0 && (
              <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                No repositories found.
              </div>
            )}

            {!loading && !error && recentRepositories.length > 0 && (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {recentRepositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="p-6 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h4 className="font-medium truncate">
                        {repo.fullName}
                      </h4>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {repo.language || "Unknown"} ·{" "}
                        {repo.private ? "Private" : "Public"}
                      </p>
                    </div>

                    <Link
                      to={`/repositories/${encodeURIComponent(
                        repo.owner
                      )}/${encodeURIComponent(repo.name)}/pull-requests`}
                      className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View Pull Requests
                    </Link>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;