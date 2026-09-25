import request from "supertest";
import app from "../src/app.js";
import { createUser, createSkill } from "./helpers/testUtils.js";

const setupExchangePair = async () => {
  const react = await createSkill({ name: "React" });
  const uiDesign = await createSkill({ name: "UI Design" });

  const { user: userA, token: tokenA } = await createUser({ name: "User A" });
  const { user: userB, token: tokenB } = await createUser({ name: "User B" });

  userA.teachingSkills = [react._id];
  await userA.save();

  userB.teachingSkills = [uiDesign._id];
  await userB.save();

  return { userA, tokenA, userB, tokenB, react, uiDesign };
};

describe("Exchange Request API", () => {
  it("creates a valid exchange request", async () => {
    const { tokenA, userB, react, uiDesign } = await setupExchangePair();

    const res = await request(app)
      .post("/api/exchange-requests")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        receiver: userB._id,
        offeredSkill: react._id,
        requestedSkill: uiDesign._id,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("pending");
  });

  it("rejects a request to yourself", async () => {
    const { tokenA, userA, react } = await setupExchangePair();

    const res = await request(app)
      .post("/api/exchange-requests")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ receiver: userA._id, offeredSkill: react._id, requestedSkill: react._id });

    expect(res.status).toBe(400);
  });

  it("rejects offering a skill the requester doesn't teach", async () => {
    const { tokenA, userB, uiDesign } = await setupExchangePair();

    const res = await request(app)
      .post("/api/exchange-requests")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        receiver: userB._id,
        offeredSkill: uiDesign._id, // A doesn't teach this
        requestedSkill: uiDesign._id,
      });

    expect(res.status).toBe(400);
  });

  it("rejects a duplicate pending request for the same pair", async () => {
    const { tokenA, userB, react, uiDesign } = await setupExchangePair();
    const payload = {
      receiver: userB._id,
      offeredSkill: react._id,
      requestedSkill: uiDesign._id,
    };

    await request(app)
      .post("/api/exchange-requests")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(payload);

    const res = await request(app)
      .post("/api/exchange-requests")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(payload);

    expect(res.status).toBe(400);
  });

  it("only allows the receiver to accept, and only once", async () => {
    const { tokenA, tokenB, userB, react, uiDesign } = await setupExchangePair();

    const created = await request(app)
      .post("/api/exchange-requests")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ receiver: userB._id, offeredSkill: react._id, requestedSkill: uiDesign._id });

    const requestId = created.body.data._id;

    const wrongUser = await request(app)
      .patch(`/api/exchange-requests/${requestId}/accept`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(wrongUser.status).toBe(403);

    const accepted = await request(app)
      .patch(`/api/exchange-requests/${requestId}/accept`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(accepted.status).toBe(200);
    expect(accepted.body.data.status).toBe("accepted");

    const secondAttempt = await request(app)
      .patch(`/api/exchange-requests/${requestId}/accept`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(secondAttempt.status).toBe(400);
  });

  it("allows only the requester to cancel a pending request", async () => {
    const { tokenA, tokenB, userB, react, uiDesign } = await setupExchangePair();

    const created = await request(app)
      .post("/api/exchange-requests")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ receiver: userB._id, offeredSkill: react._id, requestedSkill: uiDesign._id });

    const requestId = created.body.data._id;

    const wrongUser = await request(app)
      .patch(`/api/exchange-requests/${requestId}/cancel`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(wrongUser.status).toBe(403);

    const cancelled = await request(app)
      .patch(`/api/exchange-requests/${requestId}/cancel`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe("cancelled");
  });
});