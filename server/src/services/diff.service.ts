export interface DiffLine {
  type: "added" | "removed" | "context";
  content: string;
}

/**
 * Parses a GitHub unified diff "patch" string into an array of DiffLine
 * objects compatible with the frontend's existing DiffLine interface.
 *
 * GitHub's patch format looks like:
 *   @@ -1,5 +1,7 @@
 *    context line
 *   -removed line
 *   +added line
 *
 * Hunk header lines (starting with "@@") are metadata, not actual
 * code lines, so they are intentionally skipped from the output.
 *
 * GitHub can omit `patch` entirely for binary files or very large
 * diffs — callers should treat a null/undefined patch as "no diff
 * available" rather than an error.
 */
export const parsePatchToDiffLines = (
  patch: string | null | undefined
): DiffLine[] => {
  if (!patch) {
    return [];
  }

  const rawLines = patch.split("\n");
  const diffLines: DiffLine[] = [];

  for (const rawLine of rawLines) {
    // Skip hunk header lines like "@@ -1,5 +1,7 @@ someFunction()"
    if (rawLine.startsWith("@@")) {
      continue;
    }

    if (rawLine.startsWith("+")) {
      diffLines.push({
        type: "added",
        content: rawLine.slice(1),
      });
    } else if (rawLine.startsWith("-")) {
      diffLines.push({
        type: "removed",
        content: rawLine.slice(1),
      });
    } else if (rawLine.startsWith(" ")) {
      diffLines.push({
        type: "context",
        content: rawLine.slice(1),
      });
    } else if (rawLine.length > 0) {
      // Defensive fallback for any line that doesn't match the
      // expected +/-/space prefix (e.g. "\ No newline at end of file").
      diffLines.push({
        type: "context",
        content: rawLine,
      });
    }
  }

  return diffLines;
};