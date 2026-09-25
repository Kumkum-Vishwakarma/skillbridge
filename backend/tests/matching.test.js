import request from "supertest";
import app from "../src/app.js";
import { createUser, createSkill } from "./helpers/testUtils.js";
import User from "../src/models/User.js";

describe("Smart Matching API", () => {
  it("classifies a perfect match, a partial match, and excludes a non-match", async () => {
    const react = await createSkill({ name: "React" });
    const uiDesign = await createSkill({ name: "UI Design" });
    const mysql = await createSkill({ name: "MySQL" });

    const { user: userA, token: tokenA } = await createUser({ name: "User A" });
    const { user: userB } = await createUser({ name: "User B" });
    const { user: userC } = await createUser({ name: "User C" });

    // User A teaches React, wants UI Design
    userA.teachingSkills = [react._id];
    userA.learningSkills = [uiDesign._id];
    await userA.save();

    // User B teaches UI Design, wants React → PERFECT match with A
    userB.teachingSkills = [uiDesign._id];
    userB.learningSkills = [react._id];
    await userB.save();

    // User C teaches MySQL, wants nothing A offers, and A wants nothing
    // C offers → NO match with A, must be excluded entirely
    userC.teachingSkills = [mysql._id];
    await userC.save();

    const res = await request(app)
      .get("/api/matches")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);

    const matchedUserIds = res.body.data.map((m) => m.user._id.toString());
    expect(matchedUserIds).toContain(userB._id.toString());
    expect(matchedUserIds).not.toContain(userC._id.toString());
    expect(matchedUserIds).not.toContain(userA._id.toString());

    const matchWithB = res.body.data.find(
      (m) => m.user._id.toString() === userB._id.toString()
    );
    expect(matchWithB.matchType).toBe("perfect");
    expect(matchWithB.matchScore).toBe(100);
  });

  it("requires authentication", async () => {
    const res = await request(app).get("/api/matches");
    expect(res.status).toBe(401);
  });
});