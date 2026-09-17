import { useNavigate, useParams } from "react-router-dom";

interface PullRequest {
  id: number;
  number: number;
  title: string;
  author: string;
  status: "open" | "closed";
  updatedAt: string;
}

const mockPullRequests: PullRequest[] = [
  { id: 1, number: 25, title: "Fix authentication bug", author: "Utkarsh", status: "open", updatedAt: "2 hours ago" },
  { id: 2, number: 24, title: "Add dashboard UI", author: "Utkarsh", status: "open", updatedAt: "1 day ago" },
  { id: 3, number: 23, title: "Update user API", author: "Utkarsh", status: "closed", updatedAt: "3 days ago" },
];

const PullRequestDetails = () => {
  const { number } = useParams<{ number: string }>();
  const navigate = useNavigate();

  const pullRequest = mockPullRequests.find((pr) => pr.number === Number(number));
  const handleBack = () => navigate("/pull-requests");

  if (!pullRequest) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <button type="button" onClick={handleBack} className="mb-6 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium">Back</button>
        <h1 className="text-2xl font-bold">Pull Request #{number} not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <button type="button" onClick={handleBack} className="mb-6 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium">Back</button>
      <h1 className="text-3xl font-bold">#{pullRequest.number} {pullRequest.title}</h1>
      <p className="mt-3 text-gray-400">Author: {pullRequest.author}</p>
      <p className="mt-1 text-gray-400">Status: {pullRequest.status} · Updated {pullRequest.updatedAt}</p>
    </div>
  );
};

export default PullRequestDetails;