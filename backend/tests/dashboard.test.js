import request from "supertest";
import app from "../src/app.js";
import { createUser, createSkill } from "./helpers/testUtils.js";

describe("Dashboard API", () => {
  it("returns all-zero stats for a brand-new user", async () => {
    const { token } = await createUser();

    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalTeachingSkills).toBe(0);
    expect(res.body.data.totalSentRequests).toBe(0);
    expect(res.body.data.smartMatchCount).toBe(0);
    expect(res.body.data.recentSentRequests).toEqual([]);
    expect(res.body.data.recentMatches).toEqual([]);
  });

  it("reflects skill counts and sent-request activity accurately", async () => {
    const react = await createSkill({ name: "React" });
    const uiDesign = await createSkill({ name: "UI Design" });

    const { user: userA, token: tokenA } = await createUser({ name: "User A" });
    const { user: userB } = await createUser({ name: "User B" });

    userA.teachingSkills = [react._id];
    await userA.save();
    userB.teachingSkills = [uiDesign._id];
    await userB.save();

    await request(app)
      .post("/api/exchange-requests")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ receiver: userB._id, offeredSkill: react._id, requestedSkill: uiDesign._id });

    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.body.data.totalTeachingSkills).toBe(1);
    expect(res.body.data.totalSentRequests).toBe(1);
    expect(res.body.data.pendingRequestsSent).toBe(1);
    expect(res.body.data.recentSentRequests).toHaveLength(1);
    expect(res.body.data.recentSentRequests[0].offeredSkill.name).toBe("React");
  });
});