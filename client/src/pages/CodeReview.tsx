const CodeReview = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Agentic Code Reviewer
          </h1>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            Code Review
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Review Your Code
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Paste your code below and let AI find bugs and potential issues.
          </p>
        </div>

        {/* Code Input */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          
          <label className="block text-sm font-medium mb-3">
            Your Code
          </label>

          <textarea
            placeholder="Paste your code here..."
            className="w-full h-80 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 p-4 font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Review Button */}
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Review Code
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default CodeReview;