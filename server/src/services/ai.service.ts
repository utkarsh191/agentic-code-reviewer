import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const reviewCode = async (code: string) => {
  const response = await openai.responses.create({
    model: "gpt-5.6-luna",
    input: `Review this code and tell me if there are any bugs:

${code}`,
  });

  return response.output_text;
};

export default openai;