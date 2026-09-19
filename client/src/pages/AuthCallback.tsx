// client/src/pages/AuthCallback.tsx
import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { saveAuth } from "../services/auth";

type CallbackResult =
  | { ok: true; accessToken: string; login: string; avatarUrl: string | null }
  | { ok: false; message: string };

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // URL fragment ("#access_token=...") ko render ke time hi parse kar lete hain.
  const result = useMemo<CallbackResult>(() => {
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));

    const error = params.get("error");
    const accessToken = params.get("access_token");
    const login = params.get("login");
    const avatarUrl = params.get("avatar_url");

    if (error) {
      return { ok: false, message: error };
    }

    if (!accessToken || !login) {
      return {
        ok: false,
        message: "Login response mein GitHub token nahi mila. Dobara login karo.",
      };
    }

    return { ok: true, accessToken, login, avatarUrl };
  }, [location.hash]);

  useEffect(() => {
    if (!result.ok) {
      return;
    }

    saveAuth(result.accessToken, {
      login: result.login,
      avatarUrl: result.avatarUrl,
    });

    // replace: true => browser history se token wala URL hat jata hai,
    // Back dabane par token wapas nahi dikhega.
    navigate("/repositories", { replace: true });
  }, [result, navigate]);

  if (!result.ok) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <h1 className="text-xl font-semibold text-white">
            Login failed
          </h1>

          <p className="mt-3 text-sm text-red-400">{result.message}</p>

          <Link
            to="/login"
            className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
          >
            Login par wapas jao
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400 text-sm">Signing you in...</p>
    </div>
  );
};

export default AuthCallback;