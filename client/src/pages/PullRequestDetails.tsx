import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface PullRequest {
  id: number;
  number: number;
  title: string;
  author: string;
  status: "open" | "closed";
  updatedAt: string;
}

interface DiffLine {
  type: "added" | "removed" | "context";
  content: string;
}

interface ChangedFile {
  filename: string;
  status: "added" | "modified" | "deleted";
  additions: number;
  deletions: number;
  diff: DiffLine[];
}

const mockPullRequests: PullRequest[] = [
  { id: 1, number: 25, title: "Fix authentication bug", author: "Utkarsh", status: "open", updatedAt: "2 hours ago" },
  { id: 2, number: 24, title: "Add dashboard UI", author: "Utkarsh", status: "open", updatedAt: "1 day ago" },
  { id: 3, number: 23, title: "Update user API", author: "Utkarsh", status: "closed", updatedAt: "3 days ago" },
];

const mockChangedFiles: Record<number, ChangedFile[]> = {
  25: [
    {
      filename: "src/auth/login.ts",
      status: "modified",
      additions: 4,
      deletions: 2,
      diff: [
        { type: "context", content: "export const login = async (email: string, password: string) => {" },
        { type: "removed", content: "  const user = await db.findUser(email);" },
        { type: "removed", content: "  if (user.password === password) {" },
        { type: "added", content: "  const user = await db.findUser(email);" },
        { type: "added", content: "  const isValid = await bcrypt.compare(password, user.passwordHash);" },
        { type: "added", content: "  if (isValid) {" },
        { type: "context", content: "    return generateToken(user);" },
        { type: "added", content: "  }" },
        { type: "context", content: "};" },
      ],
    },
    {
      filename: "src/auth/session.ts",
      status: "modified",
      additions: 2,
      deletions: 1,
      diff: [
        { type: "context", content: "export const createSession = (userId: string) => {" },
        { type: "removed", content: "  const expiry = Date.now() + 3600;" },
        { type: "added", content: "  const expiry = Date.now() + 3600 * 1000;" },
        { type: "added", content: "  logSessionCreated(userId);" },
        { type: "context", content: "};" },
      ],
    },
    {
      filename: "src/middleware/authGuard.ts",
      status: "added",
      additions: 5,
      deletions: 0,
      diff: [
        { type: "added", content: "export const authGuard = (req, res, next) => {" },
        { type: "added", content: "  const token = req.headers.authorization;" },
        { type: "added", content: "  if (!token) return res.status(401).send('Unauthorized');" },
        { type: "added", content: "  next();" },
        { type: "added", content: "};" },
      ],
    },
  ],
  24: [
    {
      filename: "src/pages/Dashboard.tsx",
      status: "modified",
      additions: 3,
      deletions: 1,
      diff: [
        { type: "context", content: "const Dashboard = () => {" },
        { type: "removed", content: "  return <div>Dashboard</div>;" },
        { type: "added", content: "  return (" },
        { type: "added", content: "    <div className=\"dashboard-layout\">...</div>" },
        { type: "added", content: "  );" },
        { type: "context", content: "};" },
      ],
    },
    {
      filename: "src/components/Sidebar.tsx",
      status: "added",
      additions: 3,
      deletions: 0,
      diff: [
        { type: "added", content: "const Sidebar = () => {" },
        { type: "added", content: "  return <aside>Sidebar content</aside>;" },
        { type: "added", content: "};" },
      ],
    },
  ],
  23: [
    {
      filename: "src/api/user.ts",
      status: "modified",
      additions: 2,
      deletions: 2,
      diff: [
        { type: "removed", content: "export const getUser = (id) => db.find(id);" },
        { type: "added", content: "export const getUser = (id: string): Promise<User> => db.find(id);" },
        { type: "removed", content: "export const updateUser = (id, data) => db.update(id, data);" },
        { type: "added", content: "export const updateUser = (id: string, data: Partial<User>) => db.update(id, data);" },
      ],
    },
    {
      filename: "src/types/user.ts",
      status: "modified",
      additions: 1,
      deletions: 0,
      diff: [
        { type: "context", content: "interface User {" },
        { type: "added", content: "  email: string;" },
        { type: "context", content: "}" },
      ],
    },
    {
      filename: "src/api/legacyUser.ts",
      status: "deleted",
      additions: 0,
      deletions: 3,
      diff: [
        { type: "removed", content: "export const oldGetUser = (id) => legacyDb.find(id);" },
        { type: "removed", content: "export const oldUpdateUser = (id, data) => legacyDb.update(id, data);" },
        { type: "removed", content: "export default { oldGetUser, oldUpdateUser };" },
      ],
    },
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

const getDiffLineClass = (type: DiffLine["type"]) => {
  switch (type) {
    case "added":
      return "bg-green-500/10 text-green-400";
    case "removed":
      return "bg-red-500/10 text-red-400";
    case "context":
      return "text-gray-400";
  }
};

const getDiffLinePrefix = (type: DiffLine["type"]) => {
  switch (type) {
    case "added":
      return "+";
    case "removed":
      return "-";
    case "context":
      return " ";
  }
};

const PullRequestDetails = () => {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();

  const pullRequest = mockPullRequests.find((pr) => pr.number === Number(number));
  const changedFiles = mockChangedFiles[Number(number)] ?? [];

  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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

  const activeFile = changedFiles.find((f) => f.filename === selectedFile) ?? changedFiles[0] ?? null;

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
              <button
                key={file.filename}
                type="button"
                onClick={() => setSelectedFile(file.filename)}
                className={`w-full flex items-center justify-between border rounded-lg px-4 py-3 text-left transition ${
                  activeFile?.filename === file.filename
                    ? "border-blue-500 bg-blue-950/20"
                    : "border-gray-800 bg-gray-900 hover:border-gray-700"
                }`}
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
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Diff Viewer */}
      {activeFile && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Diff — <span className="font-mono text-gray-300">{activeFile.filename}</span>
          </h2>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-900 font-mono text-sm">
              {activeFile.diff.map((line, index) => (
                <div
                  key={index}
                  className={`px-4 py-1 whitespace-pre-wrap ${getDiffLineClass(line.type)}`}
                >
                  {getDiffLinePrefix(line.type)} {line.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PullRequestDetails;