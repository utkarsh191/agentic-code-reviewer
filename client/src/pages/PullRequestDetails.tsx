import { useNavigate, useParams } from "react-router-dom";

interface PullRequest {
  id: number;
  number: number;
  title: string;
  author: string;
  status: "open" | "closed";
  updatedAt: string;
}

interface ChangedFile {
  filename: string;
  status: "added" | "modified" | "deleted";
  additions: number;
  deletions: number;
}

const mockPullRequests: PullRequest[] = [
  { id: 1, number: 25, title: "Fix authentication bug", author: "Utkarsh", status: "open", updatedAt: "2 hours ago" },
  { id: 2, number: 24, title: "Add dashboard UI", author: "Utkarsh", status: "open", updatedAt: "1 day ago" },
  { id: 3, number: 23, title: "Update user API", author: "Utkarsh", status: "closed", updatedAt: "3 days ago" },
];

const mockChangedFiles: Record<number, ChangedFile[]> = {
  25: [
    { filename: "src/auth/login.ts", status: "modified", additions: 18, deletions: 6 },
    { filename: "src/auth/session.ts", status: "modified", additions: 9, deletions: 2 },
    { filename: "src/middleware/authGuard.ts", status: "added", additions: 34, deletions: 0 },
  ],
  24: [
    { filename: "src/pages/Dashboard.tsx", status: "modified", additions: 52, deletions: 10 },
    { filename: "src/components/Sidebar.tsx", status: "added", additions: 41, deletions: 0 },
  ],
  23: [
    { filename: "src/api/user.ts", status: "modified", additions: 15, deletions: 15 },
    { filename: "src/types/user.ts", status: "modified", additions: 4, deletions: 1 },
    { filename: "src/api/legacyUser.ts", status: "deleted", additions: 0, deletions: 40 },
  ],
};

const getFileStatusClass = (status: ChangedFile["status"]) => {
  switch (status) {
    case "added":
      return "bg-green-500/10 text-green-400";
    case "modified":
      return "bg-yellow-500/10 text-yellow-400";
    case "deleted":
      return "bg-red-500/10 text-red-400";
  }
};

const PullRequestDetails = () => {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();

  const pullRequest = mockPullRequests.find((pr) => pr.number === Number(number));
  const changedFiles = mockChangedFiles[Number(number)] ?? [];

  const handleBack = () => navigate("/pull-requests");

  if (!pullRequest) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium"
        >
          Back
        </button>
        <h1 className="text-2xl font-bold">Pull Request #{number} not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <button
        type="button"
        onClick={handleBack}
        className="mb-6 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium"
      >
        Back
      </button>

      <h1 className="text-3xl font-bold">
        #{pullRequest.number} {pullRequest.title}
      </h1>

      <p className="mt-3 text-gray-400">Author: {pullRequest.author}</p>

      <p className="mt-1 text-gray-400">
        Status: {pullRequest.status} · Updated {pullRequest.updatedAt}
      </p>

      {/* Changed Files */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Changed Files ({changedFiles.length})
        </h2>

        {changedFiles.length === 0 ? (
          <p className="text-gray-500 text-sm">No changed files found for this pull request.</p>
        ) : (
          <div className="space-y-3">
            {changedFiles.map((file) => (
              <div
                key={file.filename}
                className="flex items-center justify-between border border-gray-800 bg-gray-900 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${getFileStatusClass(
                      file.status
                    )}`}
                  >
                    {file.status}
                  </span>

                  <span className="text-sm font-mono text-gray-200">
                    {file.filename}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="text-green-400">+{file.additions}</span>
                  <span className="text-red-400">-{file.deletions}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PullRequestDetails;