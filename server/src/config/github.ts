// server/src/config/github.ts

// Required variable missing ho to server start hote hi clear error ke saath ruk jaye.
// Isse "login dabane par GitHub ka confusing error" wali problem nahi aati.
const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Add it to server/.env`
    );
  }

  return value;
};

export const githubConfig = {
  clientId: getRequiredEnv("GITHUB_CLIENT_ID"),
  clientSecret: getRequiredEnv("GITHUB_CLIENT_SECRET"),
  callbackUrl:
    process.env.GITHUB_CALLBACK_URL ||
    "http://localhost:5000/api/github/callback",

  // Frontend ka URL: CORS aur login ke baad redirect ke liye.
  // End ka "/" hata dete hain taaki "http://...//auth/callback" na bane.
  clientUrl: (process.env.CLIENT_URL || "http://localhost:5173").replace(
    /\/$/,
    ""
  ),
};