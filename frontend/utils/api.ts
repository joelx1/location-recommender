// Shared fetch helper — automatically attaches the Bearer token to every API request.
//
// Usage in any screen:
//   const { token } = useAuth();
//   const res = await apiFetch(token, "/locations");
//   const locations = await res.json();

import { API_URL } from "@/context/AuthContext";

export async function apiFetch(
  token: string | null,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}
