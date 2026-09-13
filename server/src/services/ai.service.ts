import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
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
  const response = await openai.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
You are an expert senior software engineer and code reviewer.

Your job is to review code and identify meaningful technical issues.

Analyze the code in four categories:

1. Bug
- Find actual bugs and logical errors.
- Check incorrect conditions, incorrect data handling, runtime errors,
  edge cases, and broken logic.

2. Security
- Find realistic security vulnerabilities.
- Check unsafe input handling, injection risks, authentication problems,
  authorization problems, sensitive data exposure, and insecure operations.

3. Performance
- Find meaningful performance problems.
- Check unnecessary loops, repeated calculations, expensive operations,
  unnecessary API/database calls, memory problems, and poor algorithmic complexity.

4. Quality
- Check maintainability, readability, duplication, naming,
  error handling, structure, and code organization.

Important rules:

- Only report meaningful issues.
- Do not invent problems.
- Do not report personal style preferences as bugs.
- Every finding must have a clear explanation.
- Every finding must have a practical suggested fix.
- Use only these categories:
  bug, security, performance, quality.
- Use only these severities:
  critical, high, medium, low.
- If there are no meaningful issues, return an empty findings array.
- Return ONLY valid JSON matching the provided schema.
        `,
      },
      {
        role: "user",
        content: `
Review the following code:

\`\`\`
${code}
\`\`\`
        `,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "code_review",
        strict: true,
        schema: reviewSchema,
      },
    },
  });

  const output = response.choices[0]?.message?.content;

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

  return result.findings.every((finding) => {
    if (!finding || typeof finding !== "object") {
      return false;
    }

    const item = finding as Record<string, unknown>;

    return (
      validCategories.includes(item.category as string) &&
      validSeverities.includes(item.severity as string) &&
      typeof item.description === "string" &&
      typeof item.suggestedFix === "string"
    );
  });
};

export default openai;