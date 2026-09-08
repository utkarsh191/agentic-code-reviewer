const Login = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <span className="text-2xl font-bold text-white">
              AI
            </span>
          </div>

          <h1 className="text-3xl font-bold text-white">
            Agentic Code Reviewer
          </h1>

          <p className="mt-3 text-gray-400 text-sm">
            AI-powered code review for your GitHub pull requests
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl">

          <h2 className="text-2xl font-semibold text-white text-center">
            Welcome back
          </h2>

          <p className="mt-2 text-gray-400 text-center text-sm">
            Sign in to review your code with AI
          </p>

          {/* GitHub Login Button */}
          <button
            type="button"
            className="mt-8 w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            {/* GitHub Icon */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.466-1.11-1.466-.908-.621.069-.609.069-.609 1.004.071 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.087.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.338 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .269.18.58.688.482A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z" />
            </svg>

            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="h-px flex-1 bg-gray-800"></div>

            <span className="text-xs text-gray-500">
              SECURE LOGIN
            </span>

            <div className="h-px flex-1 bg-gray-800"></div>
          </div>

          {/* Information */}
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span>Connect your GitHub repositories</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span>Analyze pull requests with AI</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span>Get actionable code suggestions</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>

      </div>
    </div>
  );
};

export default Login;