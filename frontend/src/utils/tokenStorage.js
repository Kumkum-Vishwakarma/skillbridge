const TOKEN_KEY = "skillbridge_token";

// A JWT always has exactly three dot-separated, base64url-encoded
// segments (header.payload.signature). This is a cheap, purely
// structural sanity check — it does NOT verify the token's signature
// (only the backend, which holds the secret, can do that) — it simply
// protects the app from treating obviously-corrupted localStorage
// content (a truncated value, a value from an unrelated app if the
// origin were ever shared, or manual tampering via dev tools) as if it
// were a usable token, which could otherwise cause confusing runtime
// errors deeper in the app instead of a clean "not logged in" state.
const isWellFormedJwt = (value) => {
  if (typeof value !== "string") return false;
  const segments = value.split(".");
  return segments.length === 3 && segments.every((s) => s.length > 0);
};

export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) return null;

  if (!isWellFormedJwt(token)) {
    // Corrupted or tampered value — do not trust it. Clear it so the
    // app consistently falls back to the logged-out state rather than
    // repeatedly attempting to use an unusable value.
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }

  return token;
};

export const setToken = (token) => {
  if (!isWellFormedJwt(token)) {
    // Defensive guard against ever persisting something that isn't
    // actually a JWT — this should never happen given the backend's
    // own response shape, but failing loudly here is safer than
    // silently storing garbage.
    console.error("Attempted to store a malformed token; ignoring.");
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};