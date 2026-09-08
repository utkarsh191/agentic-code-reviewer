const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600">
            <span className="font-bold text-white">AI</span>
          </div>

          <h1 className="font-bold text-lg">
            Code Reviewer
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">

          <a
            href="#"
            className="block px-4 py-3 rounded-lg bg-blue-600 text-white font-medium"
          >
            Dashboard
          </a>

          <a
            href="#"
            className="block px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            Repositories
          </a>

          <a
            href="#"
            className="block px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            Reviews
          </a>

          <a
            href="#"
            className="block px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            Settings
          </a>

        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64">

        {/* Topbar */}
        <header className="h-20 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8">

          <div>
            <h2 className="text-2xl font-semibold">
              Dashboard
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Overview of your code reviews
            </p>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium">
                U
              </span>
            </div>

            <span className="text-sm font-medium">
              GitHub User
            </span>
          </div>

        </header>

        {/* Dashboard Content */}
        <div className="p-8">

          {/* Welcome */}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold">
              Welcome back 👋
            </h3>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Here's what's happening with your code reviews.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* Repositories */}
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Repositories
              </p>

              <h4 className="text-3xl font-bold mt-2">
                12
              </h4>
            </div>

            {/* Reviews */}
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Reviews
              </p>

              <h4 className="text-3xl font-bold mt-2">
                48
              </h4>
            </div>

            {/* Issues */}
            <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Issues Found
              </p>

              <h4 className="text-3xl font-bold mt-2">
                126
              </h4>
            </div>

          </div>

          {/* Recent Reviews */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">

            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold">
                Recent Reviews
              </h3>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-800">

              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    ecommerce-api
                  </h4>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Pull Request #42
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Passed
                </span>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    payment-service
                  </h4>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Pull Request #18
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  Issues Found
                </span>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    frontend-app
                  </h4>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Pull Request #31
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Passed
                </span>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;