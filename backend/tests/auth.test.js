import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

describe("Authentication API", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new merchant user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test Merchant",
          email: "merchant@example.com",
          password: "password123",
          role: "merchant",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("merchant@example.com");
      expect(res.body.data.user.role).toBe("merchant");
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should reject duplicate email registration", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "First Merchant",
          email: "duplicate@example.com",
          password: "password123",
          role: "merchant",
        });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Second Merchant",
          email: "duplicate@example.com",
          password: "password456",
          role: "merchant",
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should fail when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "incomplete@example.com",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/auth/register")
        .send({
          name: "Login Merchant",
          email: "login@example.com",
          password: "securepassword123",
          role: "merchant",
        });
    });

    it("should authenticate with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "securepassword123",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe("login@example.com");
    });

    it("should reject incorrect password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return the authenticated user profile", async () => {
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Profile User",
          email: "profile@example.com",
          password: "password123",
          role: "merchant",
        });

      const token = registerRes.body.data.accessToken;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("profile@example.com");
      expect(res.body.role).toBe("merchant");
    });

    it("should reject request without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });
});
