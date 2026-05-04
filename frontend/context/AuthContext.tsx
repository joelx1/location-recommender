import React, { createContext, useContext, useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth as firebaseAuth } from "@/firebase";

WebBrowser.maybeCompleteAuthSession();

// ── Azure Entra External ID config ───────────────────────────────────────────
const TENANT_NAME = "locationreviewapp";
const FRONTEND_CLIENT_ID = "bdf8ace0-d7a5-4c7b-bd9e-0eeae9ee0881";
const BACKEND_CLIENT_ID = "7a30bda2-0b4d-4b28-803f-6df60ced1f48";
export const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const BACKEND_SCOPE = `api://${BACKEND_CLIENT_ID}/access_as_user`;

const discovery = {
  authorizationEndpoint: `https://${TENANT_NAME}.ciamlogin.com/${TENANT_NAME}.onmicrosoft.com/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://${TENANT_NAME}.ciamlogin.com/${TENANT_NAME}.onmicrosoft.com/oauth2/v2.0/token`,
  endSessionEndpoint: `https://${TENANT_NAME}.ciamlogin.com/${TENANT_NAME}.onmicrosoft.com/oauth2/v2.0/logout`,
};

const AZURE_TOKEN_KEY = "azure_auth_token";
// ─────────────────────────────────────────────────────────────────────────────

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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DbUser | null>(null);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [azureReady, setAzureReady] = useState(false);

  const isLoading = !firebaseReady || !azureReady;

  const redirectUri = AuthSession.makeRedirectUri({ scheme: "frontend", path: "auth" });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: FRONTEND_CLIENT_ID,
      scopes: ["openid", "offline_access", BACKEND_SCOPE],
      redirectUri,
      usePKCE: true,
    },
    discovery
  );

  // Restore Firebase session on startup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser && !token) {
        try { await syncFirebaseUser(firebaseUser); } catch { /* backend unreachable on cold start — user will log in */ }
      }
      setFirebaseReady(true);
    });
    return unsubscribe;
  }, []);

  // Restore Azure session on startup
  useEffect(() => {
    async function restoreAzureSession() {
      try {
        const saved = await SecureStore.getItemAsync(AZURE_TOKEN_KEY);
        if (saved) {
          const dbUser = await fetchDbUser(saved);
          if (dbUser) {
            setToken(saved);
            setUser(dbUser);
          } else {
            await SecureStore.deleteItemAsync(AZURE_TOKEN_KEY);
          }
        }
      } catch {
        // ignore — user will log in again
      } finally {
        setAzureReady(true);
      }
    }
    restoreAzureSession();
  }, []);

  // Handle Azure redirect response
  useEffect(() => {
    if (response?.type === "success") {
      handleAzureAuthResponse(response.params.code);
    }
  }, [response]);

  async function handleAzureAuthResponse(code: string) {
    try {
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
      const dbUser = await fetchDbUser(accessToken);
      if (!dbUser) throw new Error("Failed to resolve database user after login");

      await SecureStore.setItemAsync(AZURE_TOKEN_KEY, accessToken);
      setToken(accessToken);
      setUser(dbUser);
    } catch (e) {
      console.error("Azure auth error:", e);
    }
  }

  async function syncFirebaseUser(firebaseUser: FirebaseUser) {
    const idToken = await firebaseUser.getIdToken();
    const dbUser = await fetchDbUser(idToken);
    if (!dbUser) throw Object.assign(new Error("Could not reach server"), { code: "backend/unavailable" });
    setToken(idToken);
    setUser(dbUser);
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

  async function signInWithEmail(email: string, password: string) {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    await syncFirebaseUser(credential.user);
  }

  async function signUpWithEmail(email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    await syncFirebaseUser(credential.user);
  }

  async function logout() {
    await firebaseSignOut(firebaseAuth);
    await SecureStore.deleteItemAsync(AZURE_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, signInWithEmail, signUpWithEmail, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be called inside AuthProvider");
  return ctx;
}
