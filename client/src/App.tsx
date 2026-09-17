import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Repositories from "./pages/Repositories";
import PullRequests from "./pages/PullRequests";
import PullRequestDetails from "./pages/PullRequestDetails";
import CodeReview from "./pages/CodeReview";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/repositories" element={<Repositories />} />
      <Route path="/pull-requests" element={<PullRequests />} />
      <Route path="/pull-requests/:number" element={<PullRequestDetails />} />
      <Route path="/code-review" element={<CodeReview />} />
    </Routes>
  );
}

export default App;