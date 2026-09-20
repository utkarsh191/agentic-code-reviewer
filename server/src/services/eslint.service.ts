// server/src/services/eslint.service.ts
import { ESLint } from "eslint";
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export interface ESLintFinding {
  ruleId: string;
  severity: "error" | "warning";
  message: string;
  filePath: string;
  line: number;
  column: number;
}

// Client ke ESLINT_SUPPORTED wale check se same extensions.
const SUPPORTED_FILE = /\.(js|jsx|mjs|cjs|ts|tsx)$/i;

export const isESLintSupported = (filename: string): boolean => {
  return SUPPORTED_FILE.test(filename);
};

// Ye config sirf hamari hai. Repo ka apna eslint.config.js kabhi load nahi hota,
// kyunki wo untrusted code hai (config file ke andar kuch bhi chal sakta hai).
const eslintConfig = defineConfig([
  {
    files: ["**/*.{js,jsx,mjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    // Browser/Node ke globals (console, window, process...) ki list hamare paas nahi hai.
    // no-undef on rakhte to har console.log par galat error aata.
    rules: { "no-undef": "off" },
  },
  {
    files: ["**/*.cjs"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
    },
    rules: { "no-undef": "off" },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
]);

// ESLint instance ek baar banta hai, phir har call mein reuse hota hai.
let eslintInstance: ESLint | null = null;

const getESLint = (): ESLint => {
  eslintInstance ??= new ESLint({
    // true => disk par koi eslint.config.js dhundhna band, sirf overrideConfig chalega.
    overrideConfigFile: true,
    overrideConfig: eslintConfig,
  });

  return eslintInstance;
};

// Finding ki line (ya uski range) PR ki added lines mein aati hai ya nahi.
const touchesChangedLines = (
  line: number,
  endLine: number | undefined,
  changedLines: ReadonlySet<number>
): boolean => {
  const last = endLine ?? line;

  for (let current = line; current <= last; current++) {
    if (changedLines.has(current)) {
      return true;
    }
  }

  return false;
};

/**
 * Asli file content par ESLint chalata hai (GitHub patch par nahi).
 *
 * @param code          file ka poora content
 * @param filePath      repo ke andar ka path, jaise "src/auth/login.ts" (extension se rule set chunta hai)
 * @param changedLines  optional. Diya to sirf in lines ke findings wapas aate hain.
 */
export const runESLint = async (
  code: string,
  filePath: string,
  changedLines?: ReadonlySet<number>
): Promise<ESLintFinding[]> => {
  if (!isESLintSupported(filePath)) {
    return [];
  }

  const results = await getESLint().lintText(code, { filePath });

  const findings: ESLintFinding[] = [];

  for (const result of results) {
    for (const message of result.messages) {
      const isParseError = message.fatal === true;

      // ruleId nahi + fatal nahi => ESLint ka apna notice hota hai (jaise "file ignored").
      // Ye code ka issue nahi hai, to skip.
      if (!message.ruleId && !isParseError) {
        continue;
      }

      // Parse error hamesha dikhao. Baaki findings sirf PR ki lines tak limit karo.
      if (
        !isParseError &&
        changedLines &&
        !touchesChangedLines(message.line, message.endLine, changedLines)
      ) {
        continue;
      }

      findings.push({
        ruleId: message.ruleId ?? "parse-error",
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