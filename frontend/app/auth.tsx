import * as WebBrowser from "expo-web-browser";

// This screen exists solely to handle the OAuth redirect from Azure Entra.
// Calling maybeCompleteAuthSession() here signals expo-auth-session that the
// auth code has arrived, completing the flow in AuthContext.
WebBrowser.maybeCompleteAuthSession();

export default function AuthCallback() {
  return null;
}
