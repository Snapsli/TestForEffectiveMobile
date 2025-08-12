import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let app: any;
let userToken = "";
let userId = "";
let adminToken = "";
let adminId = "";

describe("Users endpoints", () => {
  let mongo: MongoMemoryServer;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongo.getUri();
    process.env.JWT_SECRET = "testsecret";
    const mod = await import("../src/index");
    app = (mod as any).default;

    // Create normal user
    const reg1 = await request(app).post("/api/auth/register").send({
      fullName: "User One",
      birthDate: "1990-01-01",
      email: "user1@example.com",
      password: "password123"
    });
    userToken = reg1.body.token;
    userId = reg1.body.id;

    // Create admin
    const reg2 = await request(app).post("/api/auth/register").send({
      fullName: "Admin",
      birthDate: "1985-05-05",
      email: "admin@example.com",
      password: "password123"
    });
    adminId = reg2.body.id;
    // promote to admin
    await request(app).patch(`/api/users/${adminId}`).set("Authorization", `Bearer ${reg2.body.token}`).send({ role: "admin" });
    // login again to get token with role admin
    const loginAdmin = await request(app).post("/api/auth/login").send({ email: "admin@example.com", password: "password123" });
    adminToken = loginAdmin.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("user can get self", async () => {
    const res = await request(app).get(`/api/users/${userId}`).set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("user1@example.com");
  });

  it("admin lists users", async () => {
    const res = await request(app).get("/api/users").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("user can block and unblock self", async () => {
    const block = await request(app).patch(`/api/users/${userId}/block`).set("Authorization", `Bearer ${userToken}`);
    expect(block.status).toBe(200);
    const unblock = await request(app).patch(`/api/users/${userId}/unblock`).set("Authorization", `Bearer ${userToken}`);
    expect(unblock.status).toBe(200);
  });

  it("user can change password", async () => {
    const change = await request(app)
      .patch(`/api/users/${userId}/password`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ currentPassword: "password123", newPassword: "newpass456" });
    expect(change.status).toBe(200);
  });
});
