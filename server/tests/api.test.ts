import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { app } from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { resetDatabase } from "./db.js";

async function registerUser(email = "user@example.com") {
  const response = await request(app).post("/api/auth/register").send({
    username: "Test User",
    email,
    password: "Password123",
    confirmPassword: "Password123",
  });

  return response.body.data as { token: string; user: { id: string; email: string } };
}

async function createTag(token: string, name = "Work") {
  const response = await request(app)
    .post("/api/tags")
    .set("Authorization", `Bearer ${token}`)
    .send({ name, color: "#4F46E5" });
  return response.body.data as { id: string; name: string };
}

async function createSchedule(token: string, tagIds: string[] = []) {
  const response = await request(app)
    .post("/api/schedules")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Ship project",
      description: "Finish the implementation",
      importance: "high",
      urgency: "high",
      status: "pending",
      tagIds,
    });
  return response.body.data as { id: string; title: string; tags: Array<{ id: string }> };
}

describe("Schedule Todo API", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("registers a user and stores a password hash", async () => {
    const response = await request(app).post("/api/auth/register").send({
      username: "Ada",
      email: "ada@example.com",
      password: "Password123",
      confirmPassword: "Password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.token).toBeTruthy();
    expect(response.body.data.user.passwordHash).toBeUndefined();

    const user = await prisma.user.findUnique({ where: { email: "ada@example.com" } });
    expect(user?.passwordHash).toBeTruthy();
    expect(user?.passwordHash).not.toBe("Password123");
    expect(user?.passwordHash.startsWith("$2")).toBe(true);
  });

  it("rejects duplicate email registration", async () => {
    await registerUser("duplicate@example.com");
    const response = await request(app).post("/api/auth/register").send({
      username: "Other",
      email: "duplicate@example.com",
      password: "Password123",
      confirmPassword: "Password123",
    });

    expect(response.status).toBe(409);
  });

  it("logs in with the correct password and rejects the wrong password", async () => {
    await registerUser("login@example.com");

    const failed = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "Wrong123" });
    expect(failed.status).toBe(401);

    const success = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: "Password123" });
    expect(success.status).toBe(200);
    expect(success.body.data.token).toBeTruthy();
  });

  it("rejects unauthenticated schedule access", async () => {
    const response = await request(app).get("/api/schedules");
    expect(response.status).toBe(401);
  });

  it("creates, lists, updates, completes, and deletes schedules for the current user", async () => {
    const { token } = await registerUser();
    const tag = await createTag(token);
    const schedule = await createSchedule(token, [tag.id]);

    const list = await request(app).get("/api/schedules").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.data.items).toHaveLength(1);
    expect(list.body.data.items[0].tags[0].id).toBe(tag.id);

    const update = await request(app)
      .put(`/api/schedules/${schedule.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated", importance: "medium", urgency: "low", status: "in_progress" });
    expect(update.status).toBe(200);
    expect(update.body.data.title).toBe("Updated");

    const complete = await request(app)
      .patch(`/api/schedules/${schedule.id}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true });
    expect(complete.body.data.completed).toBe(true);

    const deleted = await request(app)
      .delete(`/api/schedules/${schedule.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleted.status).toBe(200);
  });

  it("prevents ownership bypass for schedules and tags", async () => {
    const userA = await registerUser("a@example.com");
    const userB = await registerUser("b@example.com");
    const tag = await createTag(userA.token, "Private");
    const schedule = await createSchedule(userA.token, [tag.id]);

    const readOther = await request(app)
      .get(`/api/schedules/${schedule.id}`)
      .set("Authorization", `Bearer ${userB.token}`);
    expect(readOther.status).toBe(404);

    const updateOther = await request(app)
      .put(`/api/schedules/${schedule.id}`)
      .set("Authorization", `Bearer ${userB.token}`)
      .send({ title: "Stolen", importance: "high", urgency: "high", status: "pending" });
    expect(updateOther.status).toBe(404);

    const deleteOtherTag = await request(app)
      .delete(`/api/tags/${tag.id}`)
      .set("Authorization", `Bearer ${userB.token}`);
    expect(deleteOtherTag.status).toBe(404);

    const attachOtherTag = await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${userB.token}`)
      .send({ title: "Invalid", importance: "low", urgency: "low", status: "pending", tagIds: [tag.id] });
    expect(attachOtherTag.status).toBe(400);
  });

  it("validates schedule enums and required title", async () => {
    const { token } = await registerUser();

    const invalidImportance = await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Bad", importance: "critical", urgency: "high", status: "pending" });
    expect(invalidImportance.status).toBe(400);

    const invalidUrgency = await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Bad", importance: "high", urgency: "critical", status: "pending" });
    expect(invalidUrgency.status).toBe(400);

    const emptyTitle = await request(app)
      .post("/api/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "", importance: "high", urgency: "high", status: "pending" });
    expect(emptyTitle.status).toBe(400);
  });

  it("manages tags and removes schedule-tag relations on delete", async () => {
    const { token } = await registerUser();
    const tag = await createTag(token, "Focus");

    const list = await request(app).get("/api/tags").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    const update = await request(app)
      .put(`/api/tags/${tag.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Deep Focus", color: "#0F766E" });
    expect(update.status).toBe(200);
    expect(update.body.data.name).toBe("Deep Focus");

    const duplicate = await request(app)
      .post("/api/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Deep Focus", color: "#0F766E" });
    expect(duplicate.status).toBe(409);

    const schedule = await createSchedule(token, [tag.id]);
    const deleteResponse = await request(app)
      .delete(`/api/tags/${tag.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);

    const detail = await request(app)
      .get(`/api/schedules/${schedule.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(detail.body.data.tags).toHaveLength(0);
  });
});
