export interface DiffLine {
  type: "added" | "removed" | "context";
  content: string;
}

export const parsePatchToDiffLines = (
  patch?: string
): DiffLine[] => {
  if (!patch) {
    return [];
  }

  const lines = patch.split("\n");

  return lines.map((line) => {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      return {
        type: "added",
        content: line.slice(1),
      };
    }

    if (line.startsWith("-") && !line.startsWith("---")) {
      return {
        type: "removed",
        content: line.slice(1),
      };
    }

    return {
      type: "context",
      content: line,
    };
  });
};

export const getChangedLines = (
  diffLines: DiffLine[]
): DiffLine[] => {
  return diffLines.filter(
    (line) =>
      line.type === "added" ||
      line.type === "removed"
  );
};