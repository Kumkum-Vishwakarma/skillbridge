import request from "supertest";
import app from "../src/app.js";
import { createUser } from "./helpers/testUtils.js";

describe("User Profile API", () => {
  it("returns the logged-in user's own profile", async () => {
    const { token } = await createUser({ name: "Profile Owner" });

    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Profile Owner");
  });

  it("updates only the fields provided (partial update)", async () => {
    const { token } = await createUser({
      name: "Original Name",
      location: "Original City",
    });

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ bio: "Updated bio only" });

    expect(res.status).toBe(200);
    expect(res.body.data.bio).toBe("Updated bio only");
    expect(res.body.data.name).toBe("Original Name");
    expect(res.body.data.location).toBe("Original City");
  });

  it("rejects an invalid experienceLevel", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ experienceLevel: "Expert" });

    expect(res.status).toBe(400);
  });

  it("returns another user's public profile by ID", async () => {
    const { token } = await createUser({ name: "Viewer" });
    const { user: otherUser } = await createUser({ name: "Target User" });

    const res = await request(app)
      .get(`/api/users/${otherUser._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Target User");
  });

  it("returns 404 for a well-formed but nonexistent user ID", async () => {
    const { token } = await createUser();
    const fakeId = "000000000000000000000000";

    const res = await request(app)
      .get(`/api/users/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});