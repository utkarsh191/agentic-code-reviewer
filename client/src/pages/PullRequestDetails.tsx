// client/src/pages/PullRequestDetails.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getFileESLintFindings,
  getPullRequestDetails,
  getPullRequestFiles,
  reviewPullRequestFile,
  type ChangedFile,
  type ESLintFinding,
  type Finding,
  type PullRequestDetails as PullRequestInfo,
  type ReviewResult,
} from "../services/github.service";
import ChangedFiles from "../components/ChangedFiles";
import DiffViewer from "../components/DiffViewer";
import ESLintFindings from "../components/ESLintFindings";

const ESLINT_SUPPORTED = /\.(js|jsx|mjs|cjs|ts|tsx)$/i;

const getErrorMessage = (err: unknown, fallback: string): string => {
  return err instanceof Error ? err.message : fallback;
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString();
};

const getSeverityClass = (severity: Finding["severity"]) => {
  switch (severity) {
    case "critical":
      return "bg-red-500/10 text-red-400";
    case "high":
      return "bg-orange-500/10 text-orange-400";
    case "medium":
      return "bg-yellow-500/10 text-yellow-400";
    case "low":
      return "bg-blue-500/10 text-blue-400";
  }
};

const getCategoryClass = (category: Finding["category"]) => {
  switch (category) {
    case "bug":
      return "bg-red-500/10 text-red-400";
    case "security":
      return "bg-purple-500/10 text-purple-400";
    case "performance":
      return "bg-green-500/10 text-green-400";
    case "quality":
      return "bg-gray-500/10 text-gray-400";
  }
};

const PullRequestDetails = () => {
  const {
    owner,
    repo,
    number: numberParam,
  } = useParams<{ owner: string; repo: string; number: string }>();
  const navigate = useNavigate();

  const prNumber = Number(numberParam);

  // PR data
  const [pullRequest, setPullRequest] = useState<PullRequestInfo | null>(null);
  const [files, setFiles] = useState<ChangedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Selected file
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // AI review
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // ESLint
  const [eslintFindings, setESLintFindings] = useState<ESLintFinding[] | null>(
    null
  );
  const [eslintLoading, setESLintLoading] = useState(false);
  const [eslintError, setESLintError] = useState("");

  // Har request ko ek number milta hai. File badalne par number badal jata hai,
  // to purani request ka result naye file par galti se nahi dikhta.
  const eslintRequestRef = useRef(0);
  const reviewRequestRef = useRef(0);

  // PR details + changed files ek saath fetch karna.
  // setState sirf async callbacks ke andar hai, effect ki body mein seedha nahi.
  useEffect(() => {
    if (!owner || !repo || Number.isNaN(prNumber)) {
      return;
    }

    let cancelled = false;

    Promise.all([
      getPullRequestDetails(owner, repo, prNumber),
      getPullRequestFiles(owner, repo, prNumber),
    ])
      .then(([details, changedFiles]) => {
        if (!cancelled) {
          setPullRequest(details);
          setFiles(changedFiles);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load pull request."));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [owner, repo, prNumber, reloadKey]);

  const handleBack = () => {
    if (owner && repo) {
      navigate(
        `/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(
          repo
        )}/pull-requests`
      );
    } else {
      navigate("/repositories");
    }
  };

  const handleRetry = () => {
    setError("");
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  // Hooks ke baad hi early return, taaki hooks ka order na bigde.
  if (!owner || !repo || Number.isNaN(prNumber)) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium"
        >
          Back
        </button>

        <h1 className="text-2xl font-bold">Invalid pull request URL</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <p className="text-gray-400">Loading pull request...</p>
      </div>
    );
  }

  if (error || !pullRequest) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium"
        >
          Back
        </button>

        <div className="rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-red-400">
            {error || "Pull request not found."}
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Koi file select nahi ki to pehli file active maani jayegi.
  const activeFile =
    files.find((f) => f.filename === selectedFile) ?? files[0] ?? null;

  const isDeleted = activeFile?.status === "deleted";
  const canRunESLint =
    activeFile !== null &&
    !isDeleted &&
    ESLINT_SUPPORTED.test(activeFile.filename);

  const handleSelectFile = (filename: string) => {
    // Chal rahi requests ko invalid kar do aur puraana result saaf karo.
    eslintRequestRef.current += 1;
    reviewRequestRef.current += 1;

    setSelectedFile(filename);
    setReview(null);
    setReviewError("");
    setReviewLoading(false);
    setESLintFindings(null);
    setESLintError("");
    setESLintLoading(false);
  };

  const handleRunESLint = async () => {
    if (!activeFile || !canRunESLint) {
      return;
    }

    const requestId = ++eslintRequestRef.current;

    setESLintLoading(true);
    setESLintError("");
    setESLintFindings(null);

    try {
      const findings = await getFileESLintFindings(
        owner,
        repo,
        prNumber,
        activeFile.filename
      );

      if (requestId === eslintRequestRef.current) {
        setESLintFindings(findings);
      }
    } catch (err) {
      if (requestId === eslintRequestRef.current) {
        setESLintError(getErrorMessage(err, "Unable to run ESLint check."));
      }
    } finally {
      if (requestId === eslintRequestRef.current) {
        setESLintLoading(false);
      }
    }
  };

  const handleStartReview = async () => {
    if (!activeFile || isDeleted) {
      return;
    }

    const requestId = ++reviewRequestRef.current;

    setReviewLoading(true);
    setReviewError("");
    setReview(null);

    try {
      const result = await reviewPullRequestFile(
        owner,
        repo,
        prNumber,
        activeFile.filename
      );

      if (requestId === reviewRequestRef.current) {
        setReview(result.review);
        // Server review ke saath ESLint findings bhi bhejta hai.
        setESLintFindings(result.eslintFindings);
      }
    } catch (err) {
      if (requestId === reviewRequestRef.current) {
        setReviewError(getErrorMessage(err, "AI review failed."));
      }
    } finally {
      if (requestId === reviewRequestRef.current) {
        setReviewLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 rounded-lg bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm font-medium"
        >
          Back to pull requests
        </button>

        {/* PR header */}
        <p className="font-mono text-sm text-gray-500">
          {owner}/{repo}
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          #{pullRequest.number} {pullRequest.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
          <span
            className={`px-2.5 py-1 rounded-full text-xs ${
              pullRequest.status === "open"
                ? "bg-green-500/10 text-green-400"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {pullRequest.status}
          </span>

          <span>Author: {pullRequest.author}</span>
          <span>Created {formatDate(pullRequest.createdAt)}</span>
          <span>Updated {formatDate(pullRequest.updatedAt)}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
          <span className="font-mono">
            {pullRequest.headBranch} → {pullRequest.baseBranch}
          </span>

          <span>{pullRequest.changedFiles} files changed</span>
          <span className="text-green-400">+{pullRequest.additions}</span>
          <span className="text-red-400">-{pullRequest.deletions}</span>

          <a
            href={pullRequest.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            View on GitHub
          </a>
        </div>

        {/* PR description: plain text ki tarah dikhta hai (HTML render nahi hota) */}
        {pullRequest.description && (
          <div className="mt-6 rounded-lg border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm leading-6 text-gray-300 whitespace-pre-wrap">
              {pullRequest.description}
            </p>
          </div>
        )}

        {/* Changed files */}
        <ChangedFiles
          files={files}
          selectedFile={activeFile?.filename ?? null}
          onSelectFile={handleSelectFile}
        />

        {activeFile && (
          <>
            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-400">
                {isDeleted
                  ? "Deleted file ka review ya ESLint nahi ho sakta."
                  : !canRunESLint
                  ? "ESLint sirf JS/TS files (.js, .jsx, .ts, .tsx) par chalta hai."
                  : "Selected file par static analysis ya AI review chalao."}
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRunESLint}
                  disabled={eslintLoading || !canRunESLint}
                  className="bg-gray-700 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
                >
                  {eslintLoading ? "Running ESLint..." : "Run ESLint Check"}
                </button>

                <button
                  type="button"
                  onClick={handleStartReview}
                  disabled={reviewLoading || isDeleted}
                  className="bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
                >
                  {reviewLoading ? "Reviewing..." : "Start Review"}
                </button>
              </div>
            </div>

            {/* Diff */}
            <DiffViewer filename={activeFile.filename} diff={activeFile.diff} />

            {/* ESLint error */}
            {eslintError && (
              <div className="mt-4 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {eslintError}
              </div>
            )}

            {/* ESLint findings (run ke baad hi dikhte hain) */}
            {eslintFindings && <ESLintFindings findings={eslintFindings} />}

            {/* AI review error */}
            {reviewError && (
              <div className="mt-4 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {reviewError}
              </div>
            )}

            {/* AI review */}
            {review && (
              <div className="mt-8 space-y-6">
                <h2 className="text-xl font-semibold">AI Review Findings</h2>

                <div className="border border-gray-800 bg-gray-900 rounded-xl p-5">
                  <h3 className="text-base font-semibold mb-3">
                    Review Summary
                  </h3>

                  <p className="text-sm leading-6 text-gray-400">
                    {review.summary}
                  </p>

                  <div className="mt-4 text-sm font-medium">
                    {review.findings.length}{" "}
                    {review.findings.length === 1 ? "finding" : "findings"}{" "}
                    detected
                  </div>
                </div>

                {review.findings.length > 0 ? (
                  <div className="space-y-4">
                    {review.findings.map((finding, index) => (
                      <div
                        key={`${finding.category}-${index}`}
                        className="border border-gray-800 bg-gray-900 rounded-xl p-5"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getCategoryClass(
                              finding.category
                            )}`}
                          >
                            {finding.category}
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getSeverityClass(
                              finding.severity
                            )}`}
                          >
                            {finding.severity}
                          </span>

                          {finding.file && (
                            <span className="text-xs text-gray-500 font-mono">
                              {finding.file}
                              {finding.line ? `:${finding.line}` : ""}
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-2">
                            Description
                          </h4>

                          <p className="text-sm leading-6 text-gray-400">
                            {finding.description}
                          </p>
                        </div>

                        <div className="mt-5">
                          <h4 className="text-sm font-semibold mb-2">
                            Suggested Fix
                          </h4>

                          <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                            <p className="text-sm leading-6 text-gray-400">
                              {finding.suggestedFix}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-green-900 bg-green-950/30 rounded-xl p-5">
                    <h3 className="text-base font-semibold text-green-400">
                      No issues found
                    </h3>

                    <p className="mt-2 text-sm text-green-500">
                      AI did not find any meaningful bugs, security,
                      performance, or quality issues.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PullRequestDetails;