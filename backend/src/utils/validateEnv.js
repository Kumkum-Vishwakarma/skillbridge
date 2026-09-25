// Fails the application fast, at startup, if required environment
// variables are missing or obviously insecure — rather than allowing
// the server to boot into a broken or dangerously misconfigured state
// (e.g. a weak JWT secret that would make every issued token forgeable).
const REQUIRED_VARS = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "CLIENT_URL",
];

const MIN_JWT_SECRET_LENGTH = 32;

const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
    console.error(
      `❌ JWT_SECRET is too short (${process.env.JWT_SECRET.length} characters). ` +
        `It must be at least ${MIN_JWT_SECRET_LENGTH} characters to resist brute-force guessing.`
    );
    process.exit(1);
  }

  const insecureDefaults = ["secret", "changeme", "your_jwt_secret_key_here"];
  if (insecureDefaults.includes(process.env.JWT_SECRET.toLowerCase())) {
    console.error(
      "❌ JWT_SECRET is set to a known placeholder value. Generate a real random secret."
    );
    process.exit(1);
  }

  console.log("✅ Environment variables validated");
};

export default validateEnv;