// client/src/pages/AuthCallback.tsx

import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { saveAuth } from "../services/auth";

type CallbackResult =
  | {
      ok: true;
      accessToken: string;
      login: string;
      avatarUrl: string | null;
    }
  | {
      ok: false;
      message: string;
    };

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // URL fragment ("#access_token=...") ko render ke time hi parse kar lete hain.
  const result = useMemo<CallbackResult>(() => {
    const params = new URLSearchParams(
      location.hash.replace(/^#/, "")
    );

    const error = params.get("error");
    const accessToken = params.get("access_token");
    const login = params.get("login");
    const avatarUrl = params.get("avatar_url");

    if (error) {
      return {
        ok: false,
        message: error,
      };
    }

    if (!accessToken || !login) {
      return {
        ok: false,
        message:
          "Login response mein GitHub token nahi mila. Dobara login karo.",
      };
    }

    return {
      ok: true,
      accessToken,
      login,
      avatarUrl,
    };
  }, [location.hash]);

  useEffect(() => {
    if (!result.ok) {
      return;
    }

    saveAuth(result.accessToken, {
      login: result.login,
      avatarUrl: result.avatarUrl,
    });

    // replace: true => browser history se token wala URL hat jata hai.
    navigate("/repositories", {
      replace: true,
    });
  }, [result, navigate]);

  if (!result.ok) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900/80 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur">
          
          {/* Error Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
            <svg
              className="h-7 w-7 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86l-7.12 12A2 2 0 004.89 19h14.22a2 2 0 001.72-3.14l-7.12-12a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-white">
            Login failed
          </h1>

          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm leading-6 text-red-300">
            {result.message}
          </p>

          <Link
            to="/login"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 hover:shadow-blue-500/30"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900/80 p-8 text-center shadow-2xl shadow-black/30 backdrop-blur">
        
        {/* Loading Spinner */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-700 border-t-blue-500" />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-white">
          Signing you in
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Connecting your GitHub account...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;