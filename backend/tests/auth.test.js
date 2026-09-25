import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";

describe("Authentication API", () => {
  describe("POST /api/auth/register", () => {
    it("registers a new user and returns a token", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe("jane@example.com");
      expect(res.body.user.password).toBeUndefined();
    });

    it("rejects a duplicate email", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Jane Doe",
        email: "dupe@example.com",
        password: "Password123",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Another Name",
        email: "dupe@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("rejects a password missing an uppercase letter", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Weak Pass",
        email: "weak@example.com",
        password: "password1",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/validation failed/i);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send({
        name: "Login User",
        email: "login@example.com",
        password: "Password123",
      });
    });

    it("logs in with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "Password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("rejects an incorrect password with a generic message", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "WrongPassword1",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns the current user for a valid token", async () => {
      const registerRes = await request(app).post("/api/auth/register").send({
        name: "Me User",
        email: "me@example.com",
        password: "Password123",
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${registerRes.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("me@example.com");
    });

    it("rejects a request with no token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });

    it("rejects a request with a malformed token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer not-a-real-token");

      expect(res.status).toBe(401);
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
  });
});