// client/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Repositories from "./pages/Repositories";
import PullRequests from "./pages/PullRequests";
import PullRequestDetails from "./pages/PullRequestDetails";
import CodeReview from "./pages/CodeReview";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes: bina login ke /login par redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/repositories"
        element={
          <ProtectedRoute>
            <Repositories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/repositories/:owner/:repo/pull-requests"
        element={
          <ProtectedRoute>
            <PullRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/repositories/:owner/:repo/pull-requests/:number"
        element={
          <ProtectedRoute>
            <PullRequestDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/code-review"
        element={
          <ProtectedRoute>
            <CodeReview />
          </ProtectedRoute>
        }
      />

      {/* "/" aur koi bhi unknown URL: login hai to repositories, nahi to ProtectedRoute login par bhej dega */}
      <Route path="*" element={<Navigate to="/repositories" replace />} />
    </Routes>
  );
}

export default App;