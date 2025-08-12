import { beforeAll, afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let app: any;

describe("Auth flow", () => {
  let mongo: MongoMemoryServer;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongo.getUri();
    process.env.JWT_SECRET = "testsecret";
    const mod = await import("../src/index");
    app = (mod as any).default;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("registers and logs in a user", async () => {
    const reg = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      birthDate: "1990-01-01",
      email: "user@example.com",
      password: "password123"
    });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeTruthy();

    const login = await request(app).post("/api/auth/login").send({
      email: "user@example.com",
      password: "password123"
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });
});
