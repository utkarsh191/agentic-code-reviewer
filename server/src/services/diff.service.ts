// server/src/services/diff.service.ts

export interface DiffLine {
  type: "added" | "removed" | "context";
  content: string;
  // Purani file (base) mein is line ka number. Added line par null.
  oldLine: number | null;
  // Nayi file (PR ke baad) mein is line ka number. Removed line par null.
  newLine: number | null;
}

// "@@ -10,5 +12,7 @@ functionName()" se purani aur nayi starting line nikalta hai.
// ",5" wala hissa optional hai, kyunki 1 line ke hunk mein GitHub use nahi likhta.
const HUNK_HEADER = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

/**
 * GitHub ke unified diff "patch" string ko DiffLine ke array mein badalta hai.
 *
 * Patch aisa dikhta hai:
 *   @@ -1,5 +1,7 @@
 *    context line
 *   -removed line
 *   +added line
 *
 * - "@@" header metadata hai, output mein nahi jata, par line counters isi se set hote hain.
 * - Binary ya bahut bade diff mein GitHub patch nahi bhejta (null/undefined), tab [] milta hai.
 */
export const parsePatchToDiffLines = (
  patch: string | null | undefined
): DiffLine[] => {
  if (!patch) {
    return [];
  }

  const rawLines = patch.split("\n");
  const diffLines: DiffLine[] = [];

  let oldLine = 0;
  let newLine = 0;
  let insideHunk = false;

  for (let index = 0; index < rawLines.length; index++) {
    const rawLine = rawLines[index] ?? "";

    const header = HUNK_HEADER.exec(rawLine);

    if (header) {
      oldLine = Number(header[1]);
      newLine = Number(header[2]);
      insideHunk = true;
      continue;
    }

    // Pehle hunk header se pehle ki koi bhi line diff ka hissa nahi hai.
    if (!insideHunk) {
      continue;
    }

    // "\ No newline at end of file" metadata hai, code line nahi.
    if (rawLine.startsWith("\\")) {
      continue;
    }

    if (rawLine.startsWith("+")) {
      diffLines.push({
        type: "added",
        content: rawLine.slice(1),
        oldLine: null,
        newLine,
      });
      newLine++;
      continue;
    }

    if (rawLine.startsWith("-")) {
      diffLines.push({
        type: "removed",
        content: rawLine.slice(1),
        oldLine,
        newLine: null,
      });
      oldLine++;
      continue;
    }

    // patch.split("\n") ka aakhri khaali element (trailing newline se) skip karo.
    if (rawLine === "" && index === rawLines.length - 1) {
      continue;
    }

    // Context line " code" hoti hai. Khaali context line kabhi-kabhi "" aati hai.
    diffLines.push({
      type: "context",
      content: rawLine.startsWith(" ") ? rawLine.slice(1) : rawLine,
      oldLine,
      newLine,
    });
    oldLine++;
    newLine++;
  }

  return diffLines;
};

// PR mein jo lines nayi add hui unke line numbers (nayi file ke hisaab se).
// ESLint/AI ke findings ko sirf PR ki lines tak limit karne ke kaam aayega.
export const getAddedLineNumbers = (diffLines: DiffLine[]): Set<number> => {
  const lineNumbers = new Set<number>();

  for (const line of diffLines) {
    if (line.type === "added" && line.newLine !== null) {
      lineNumbers.add(line.newLine);
    }
  }

  return lineNumbers;
};