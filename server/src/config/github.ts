export const githubConfig = {
  clientId: process.env.GITHUB_CLIENT_ID as string,
  clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  callbackUrl:
    process.env.GITHUB_CALLBACK_URL ||
    "http://localhost:5000/api/github/callback",
};