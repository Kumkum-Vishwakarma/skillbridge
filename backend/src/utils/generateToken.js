import jwt from "jsonwebtoken";

// Signs a JWT containing the user's ID as payload — unchanged payload
// shape from Step 3. This step adds two hardening details that do NOT
// change the external contract at all (the frontend still just receives
// and sends back an opaque token string):
//   - `algorithm: "HS256"` is now pinned explicitly rather than left as
//     the (already-default) implicit choice. This closes off algorithm-
//     confusion attacks, where a token forged with a different or "none"
//     algorithm could otherwise be accepted if verification code was ever
//     written more permissively in the future.
//   - `issuer` identifies which system issued the token, so verification
//     can confirm a token wasn't crafted by, or intended for, a different
//     system entirely.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    issuer: "skillbridge-api",
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export default generateToken;