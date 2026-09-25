import request from "supertest";
import app from "../src/app.js";
import { createUser, createSkill } from "./helpers/testUtils.js";

describe("Skill Management API", () => {
  it("creates a new catalog skill", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .post("/api/skills")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "React", category: "Programming" });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("React");
  });

  it("rejects a duplicate skill name regardless of case", async () => {
    const { token } = await createUser();
    await createSkill({ name: "React" });

    const res = await request(app)
      .post("/api/skills")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "react", category: "Programming" });

    expect(res.status).toBe(400);
  });

  it("rejects an invalid category", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .post("/api/skills")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Something", category: "NotACategory" });

    expect(res.status).toBe(400);
  });

  it("adds a skill to the teaching list and prevents duplicates", async () => {
    const { token } = await createUser();
    const skill = await createSkill({ name: "MySQL" });

    const first = await request(app)
      .post(`/api/skills/teach/${skill._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(first.status).toBe(200);
    expect(first.body.data[0].name).toBe("MySQL");

    const second = await request(app)
      .post(`/api/skills/teach/${skill._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(second.status).toBe(400);
  });

  it("removes a skill from the learning list", async () => {
    const { token } = await createUser();
    const skill = await createSkill({ name: "UI Design" });

    await request(app)
      .post(`/api/skills/learn/${skill._id}`)
      .set("Authorization", `Bearer ${token}`);

    const res = await request(app)
      .delete(`/api/skills/learn/${skill._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const mySkills = await request(app)
      .get("/api/skills/me")
      .set("Authorization", `Bearer ${token}`);

    expect(mySkills.body.data.learningSkills).toHaveLength(0);
  });

  it("rejects a malformed skill ID with 400 via checkObjectId", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .get("/api/skills/not-a-valid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});