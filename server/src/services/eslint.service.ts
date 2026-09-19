import { ESLint } from "eslint";

export interface ESLintFinding {
  ruleId: string;
  severity: "error" | "warning";
  message: string;
  filePath: string;
  line: number;
  column: number;
}

export const runESLint = async (
  code: string,
  filePath: string
): Promise<ESLintFinding[]> => {
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  });

  const results = await eslint.lintText(code, {
    filePath,
  });

  const findings: ESLintFinding[] = [];

  for (const result of results) {
    for (const message of result.messages) {
      findings.push({
        ruleId: message.ruleId ?? "unknown",
        severity: message.severity === 2 ? "error" : "warning",
        message: message.message,
        filePath,
        line: message.line,
        column: message.column,
      });
    }
  }

  return findings;
};