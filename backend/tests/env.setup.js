// Runs BEFORE any test file (and therefore before app.js) is imported —
// this is critical, because app.js reads process.env.CLIENT_URL at
// module-load time to configure cors(). Setting these here, in Jest's
// "setupFiles" phase (which runs before the test framework itself is
// even installed), guarantees every value app.js needs is already in
// place the moment it's first imported by a test file.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_only_jwt_secret_key_at_least_32_characters_long";
process.env.JWT_EXPIRES_IN = "1h";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.PORT = "5000";