// server/src/services/review.service.ts
import { getAddedLineNumbers } from "./diff.service.js";
import {
  isESLintSupported,
  runESLint,
  type ESLintFinding,
} from "./eslint.service.js";
import * as aiService from "./ai.service.js";
import * as githubService from "./github.service.js";

// Client ke PullRequestFileReview type se match.
export interface PullRequestFileReview {
  review: aiService.ReviewResult;
  eslintFindings: ESLintFinding[];
}

interface LoadedFile {
  filename: string;
  content: string;
  // PR mein add hui lines. undefined => GitHub ne patch nahi diya, poori file maano.
  changedLines: ReadonlySet<number> | undefined;
}

/* ------------------------------------------------------------------ */
/* Shared step: PR ki file + uska asli content                         */
/* ------------------------------------------------------------------ */

const loadPullRequestFile = async (
  owner: string,
  repo: string,
  number: number,
  filename: string,
  accessToken: string
): Promise<LoadedFile> => {
  // PR details (headSha ke liye) aur files ek saath fetch hote hain.
  const [pullRequest, files] = await Promise.all([
    githubService.getPullRequestDetails(owner, repo, number, accessToken),
    githubService.getPullRequestFiles(owner, repo, number, accessToken),
  ]);

  const file = files.find((item) => item.filename === filename);

  if (!file) {
    throw new githubService.GithubApiError(
      "File is not part of this pull request",
      404
    );
  }

  if (file.status === "deleted") {
    throw new githubService.GithubApiError(
      "Deleted files cannot be reviewed",
      400
    );
  }

  // Path GitHub ki apni list se aata hai (file.filename), user ke bheje string se nahi.
  // Content PR ke latest commit (headSha) par se aata hai, patch se nahi.
  const content = await githubService.getFileContent(
    owner,
    repo,
    file.filename,
    accessToken,
    pullRequest.headSha
  );

  return {
    filename: file.filename,
    content,
    changedLines: file.patch === null ? undefined : getAddedLineNumbers(file.diff),
  };
};

/* ------------------------------------------------------------------ */
/* ESLint                                                              */
/* ------------------------------------------------------------------ */

// ESLint sirf tab chalta hai jab file JS/TS ho.
// Combined review mein ESLint fail ho to review nahi rukta, isliye ye kabhi throw nahi karta.
const runESLintSafely = async (file: LoadedFile): Promise<ESLintFinding[]> => {
  if (!isESLintSupported(file.filename)) {
    return [];
  }

  try {
    return await runESLint(file.content, file.filename, file.changedLines);
  } catch (error) {
    console.error(
      "ESLint failed:",
      error instanceof Error ? error.message : error
    );
    return [];
  }
};

export const runESLintForPullRequestFile = async (
  owner: string,
  repo: string,
  number: number,
  filename: string,
  accessToken: string
): Promise<ESLintFinding[]> => {
  if (!isESLintSupported(filename)) {
    throw new githubService.GithubApiError(
      "ESLint supports only .js, .jsx, .mjs, .cjs, .ts and .tsx files",
      400
    );
  }

  const file = await loadPullRequestFile(
    owner,
    repo,
    number,
    filename,
    accessToken
  );

  // Yahan seedha runESLint: fail hone par user ko error dikhna chahiye, khaali list nahi.
  return runESLint(file.content, file.filename, file.changedLines);
};

/* ------------------------------------------------------------------ */
/* Combine + dedupe                                                    */
/* ------------------------------------------------------------------ */

const dedupeAiFindings = (
  findings: aiService.Finding[],
  eslintFindings: ESLintFinding[]
): aiService.Finding[] => {
  const eslintLines = new Set(eslintFindings.map((finding) => finding.line));
  const seen = new Set<string>();
  const result: aiService.Finding[] = [];

  for (const finding of findings) {
    // Rule 1: ESLint pehle se is line ko flag kar chuka hai aur AI sirf "quality" bol raha hai.
    // ESLint ka finding pakka hota hai, to wahi rakhte hain. bug/security/performance kabhi nahi hatte.
    if (
      finding.category === "quality" &&
      finding.line !== undefined &&
      eslintLines.has(finding.line)
    ) {
      continue;
    }

    // Rule 2: AI ne ek hi finding do baar de di.
    const key = `${finding.category}|${finding.line ?? ""}|${finding.description
      .trim()
      .toLowerCase()}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(finding);
  }

  return result;
};

/* ------------------------------------------------------------------ */
/* Full review                                                         */
/* ------------------------------------------------------------------ */

export const reviewPullRequestFile = async (
  owner: string,
  repo: string,
  number: number,
  filename: string,
  accessToken: string
): Promise<PullRequestFileReview> => {
  const file = await loadPullRequestFile(
    owner,
    repo,
    number,
    filename,
    accessToken
  );

  // Patch hai par koi line add nahi hui (sirf delete hui) => review karne ko naya code hi nahi.
  if (file.changedLines && file.changedLines.size === 0) {
    return {
      review: {
        summary:
          "This file only has removed lines in this pull request, so there is no new code to review.",
        findings: [],
      },
      eslintFindings: [],
    };
  }

  // ESLint aur AI ek saath chalte hain, to total time dono mein se bade wale jitna hota hai.
  const [eslintFindings, aiReview] = await Promise.all([
    runESLintSafely(file),
    aiService.reviewFile({
      filename: file.filename,
      content: file.content,
      // exactOptionalPropertyTypes on hai, isliye undefined ko property ke roop mein nahi bhejte.
      ...(file.changedLines ? { changedLines: file.changedLines } : {}),
    }),
  ]);

  return {
    review: {
      summary: aiReview.summary,
      findings: dedupeAiFindings(aiReview.findings, eslintFindings),
    },
    eslintFindings,
  };
};