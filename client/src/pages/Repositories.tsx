import { useState } from "react";

interface Repository {
  id: number;
  name: string;
  language: string | null;
  private: boolean;
}

const Repositories = () => {
  const [repositories] = useState<Repository[]>([
    {
      id: 1,
      name: "Agentic-Code-Reviewer",
      language: "TypeScript",
      private: false,
    },
    {
      id: 2,
      name: "Ecommerce",
      language: "JavaScript",
      private: true,
    },
    {
      id: 3,
      name: "Portfolio",
      language: "HTML",
      private: false,
    },
  ]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedRepository, setSelectedRepository] =
    useState<Repository | null>(null);

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold">
            Agentic Code Reviewer
          </h1>
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
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter("public")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === "public"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Public
          </button>

          <button
            type="button"
            onClick={() => setFilter("private")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === "private"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Private
          </button>
        </div>

        {/* Repository List */}
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
                <div>
                  <h3 className="font-semibold">
                    {repo.name}
                  </h3>

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
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
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
      </main>
    </div>
  );
};

export default Repositories;