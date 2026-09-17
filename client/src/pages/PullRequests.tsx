import { useState } from "react";

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

        <div className="mt-6 space-y-4">
          {pullRequests.map((pr) => (
            <div
              key={pr.id}
              className="border border-gray-800 bg-gray-900 rounded-xl p-5"
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
                >
                  Select PR
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PullRequests;