import React, { createContext, useContext, useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

// Required for Android — closes the browser tab after the redirect back to the app
WebBrowser.maybeCompleteAuthSession();

// ── Azure Entra External ID config ───────────────────────────────────────────
const TENANT_NAME = "locationreviewapp";
const FRONTEND_CLIENT_ID = "e3c530ac-8ace-43b9-b9ee-3be7f9dd5b8e";
const BACKEND_CLIENT_ID = "8f332368-f2de-45b4-82c5-931007a5c671";
export const API_URL = "http://localhost:8080"; // swap this for the deployed URL when you go live
// ─────────────────────────────────────────────────────────────────────────────

// This is the scope the frontend requests — it asks for a token scoped to our backend API
const BACKEND_SCOPE = `api://${BACKEND_CLIENT_ID}/access_as_user`;

// Entra External ID uses ciamlogin.com — no policy name in the URL unlike old B2C
const discovery = {
  authorizationEndpoint: `https://${TENANT_NAME}.ciamlogin.com/${TENANT_NAME}.onmicrosoft.com/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://${TENANT_NAME}.ciamlogin.com/${TENANT_NAME}.onmicrosoft.com/oauth2/v2.0/token`,
  endSessionEndpoint: `https://${TENANT_NAME}.ciamlogin.com/${TENANT_NAME}.onmicrosoft.com/oauth2/v2.0/logout`,
};

const TOKEN_KEY = "auth_token";

// Matches the User model fields we get back from the backend
export type DbUser = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  profilePic: string | null;
  createdAt: string;
};

type AuthContextType = {
  token: string | null;
  user: DbUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const redirectUri = AuthSession.makeRedirectUri({ scheme: "frontend" });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: FRONTEND_CLIENT_ID,
      scopes: ["openid", "offline_access", BACKEND_SCOPE],
      redirectUri,
      usePKCE: true,
    },
    discovery
  );

  // On app startup: check SecureStore for a saved token and restore the session
  // This is why users don't have to log in every time they open the app
  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (saved) {
          const dbUser = await fetchDbUser(saved);
          if (dbUser) {
            setToken(saved);
            setUser(dbUser);
          } else {
            // Token was invalid or expired — clear it so the user sees the login screen
            await SecureStore.deleteItemAsync(TOKEN_KEY);
          }
        }
      } catch {
        // Ignore errors on restore — user will just log in again
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  // When Entra redirects back to the app with an auth code, exchange it for a token
  useEffect(() => {
    if (response?.type === "success") {
      handleAuthResponse(response.params.code);
    }
  }, [response]);

  async function handleAuthResponse(code: string) {
    try {
      // Exchange the authorization code for an access token
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: FRONTEND_CLIENT_ID,
          code,
          redirectUri,
          extraParams: { code_verifier: request!.codeVerifier! },
        },
        discovery
      );

      const accessToken = tokenResponse.accessToken;

      // Call /auth/me to get our DB user (creates them on first login)
      const dbUser = await fetchDbUser(accessToken);
      if (!dbUser) throw new Error("Failed to resolve database user after login");

      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      setToken(accessToken);
      setUser(dbUser);
    } catch (e) {
      console.error("Auth error:", e);
    }
  }

  async function fetchDbUser(accessToken: string): Promise<DbUser | null> {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function login() {
    await promptAsync();
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Any screen can call useAuth() to get token, user, login, logout, isLoading
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be called inside AuthProvider");
  return ctx;
}
