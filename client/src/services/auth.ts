// client/src/services/auth.ts

// Backend ka base URL (sirf origin, "/api" ke bina).
// client/.env mein VITE_API_URL set nahi hai to local default use hoga.
export const API_URL: string = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

// Login button is URL par redirect karta hai.
export const GITHUB_LOGIN_URL = `${API_URL}/api/github/login`;

const TOKEN_KEY = "github_access_token";
const USER_KEY = "github_user";

export interface AuthUser {
  login: string;
  avatarUrl: string | null;
}

export const saveAuth = (accessToken: string, user: AuthUser): void => {
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getAccessToken = (): string | null => {
  return sessionStorage.getItem(TOKEN_KEY);
};

export const getUser = (): AuthUser | null => {
  const raw = sessionStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null;
};

export const clearAuth = (): void => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};