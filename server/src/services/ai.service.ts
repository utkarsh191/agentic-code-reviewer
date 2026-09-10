import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Finding {
  category: "bug" | "security" | "performance" | "quality";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  suggestedFix: string;
}

export interface ReviewResult {
  summary: string;
  findings: Finding[];
}

const reviewSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
    },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["bug", "security", "performance", "quality"],
          },
          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low"],
          },
          description: {
            type: "string",
          },
          suggestedFix: {
            type: "string",
          },
        },
        required: [
          "category",
          "severity",
          "description",
          "suggestedFix",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "findings"],
  additionalProperties: false,
};

export const reviewCode = async (
  code: string
): Promise<ReviewResult> => {
  const response = await openai.responses.create({
    model: "gpt-5.6-luna",

    instructions: `
You are an expert senior software engineer and code reviewer.

Review the provided code carefully.

Analyze the code in four areas:

1. Bug analysis
   - Find actual bugs and logical errors.
   - Do not report something as a bug unless there is a reasonable technical basis.

2. Security analysis
   - Look for security vulnerabilities.
   - Check issues such as injection, unsafe input handling, authentication problems,
     authorization problems, sensitive data exposure, and insecure operations.

3. Performance analysis
   - Look for unnecessary expensive operations.
   - Check inefficient loops, repeated calculations, unnecessary database/API calls,
     memory problems, and poor algorithmic complexity.

4. Quality analysis
   - Check readability, maintainability, duplication, naming, structure,
     error handling, and code organization.

Important rules:
- Only report meaningful issues.
- Do not invent problems.
- Do not report style preferences as bugs.
- Every finding must contain a clear explanation and a practical suggested fix.
- Use only these categories: bug, security, performance, quality.
- Use only these severities: critical, high, medium, low.
- If there are no meaningful issues, return an empty findings array.
`,

    input: `
Review the following code:

\`\`\`
${code}
\`\`\`
`,

    text: {
      format: {
        type: "json_schema",
        name: "code_review",
        strict: true,
        schema: reviewSchema,
      },
    },
  });

  const output = response.output_text;

  if (!output) {
    throw new Error("AI returned an empty response");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(output);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  if (!isValidReviewResult(parsed)) {
    throw new Error("AI response failed validation");
  }

  return parsed;
};

const isValidReviewResult = (
  value: unknown
): value is ReviewResult => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Record<string, unknown>;

  if (typeof result.summary !== "string") {
    return false;
  }

  if (!Array.isArray(result.findings)) {
    return false;
  }

  return result.findings.every((finding) => {
    if (!finding || typeof finding !== "object") {
      return false;
    }

    const item = finding as Record<string, unknown>;

    const validCategories = [
      "bug",
      "security",
      "performance",
      "quality",
    ];

    const validSeverities = [
      "critical",
      "high",
      "medium",
      "low",
    ];

    return (
      validCategories.includes(item.category as string) &&
      validSeverities.includes(item.severity as string) &&
      typeof item.description === "string" &&
      typeof item.suggestedFix === "string"
    );
  });
};

export default openai;