import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";

// Protects routes by requiring a valid JWT in the Authorization header.
// On success, attaches the authenticated user's data to req.user.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    // Verification now explicitly pins the accepted algorithm and issuer,
    // matching how the token was signed in generateToken.js. This means
    // a token signed with any algorithm other than HS256, or missing/
    // mismatching the expected issuer, is rejected outright — this is
    // the verification-side half of the algorithm-confusion protection
    // described in generateToken.js, and it changes nothing about how a
    // legitimately-issued token from this same application behaves.
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "skillbridge-api",
    });

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, user no longer exists");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, invalid or expired token");
  }
});

export default protect;