import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

let merchantToken;
let merchantId;
let otherMerchantToken;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create primary merchant
  const m1 = await request(app).post("/api/auth/register").send({
    name: "Merchant One",
    email: "m1@example.com",
    password: "password123",
    role: "merchant",
  });
  merchantToken = m1.body.data.accessToken;
  merchantId = m1.body.data.user.id;

  // Create second merchant
  const m2 = await request(app).post("/api/auth/register").send({
    name: "Merchant Two",
    email: "m2@example.com",
    password: "password123",
    role: "merchant",
  });
  otherMerchantToken = m2.body.data.accessToken;
});

describe("Inventory API", () => {
  describe("POST /api/inventory", () => {
    it("should create a new inventory item and log initial movement", async () => {
      const res = await request(app)
        .post("/api/inventory")
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          name: "Organic Tea 500g",
          sku: "TEA-ORG-500",
          category: "Beverages",
          price: 250,
          stock: 50,
          lowStockThreshold: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.sku).toBe("TEA-ORG-500");
      expect(res.body.stock).toBe(50);
      expect(res.body.status).toBe("In Stock");
    });

    it("should prevent duplicate SKU for the same merchant", async () => {
      await request(app)
        .post("/api/inventory")
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          name: "Item One",
          sku: "SKU-DUP-1",
          category: "Grocery",
          price: 100,
          stock: 20,
        });

      const res = await request(app)
        .post("/api/inventory")
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          name: "Item Two",
          sku: "SKU-DUP-1",
          category: "Grocery",
          price: 150,
          stock: 10,
        });

      expect(res.status).toBe(409);
    });
  });

  describe("GET /api/inventory", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/inventory")
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          name: "Rice 5kg",
          sku: "RICE-5KG",
          category: "Groceries",
          price: 400,
          stock: 15,
          lowStockThreshold: 10,
        });

      await request(app)
        .post("/api/inventory")
        .set("Authorization", `Bearer ${otherMerchantToken}`)
        .send({
          name: "Sugar 1kg",
          sku: "SUGAR-1KG",
          category: "Groceries",
          price: 50,
          stock: 30,
        });
    });

    it("should return only merchant's own inventory items (Tenant Isolation)", async () => {
      const res = await request(app)
        .get("/api/inventory")
        .set("Authorization", `Bearer ${merchantToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe("Rice 5kg");
    });
  });

  describe("PATCH /api/inventory/:id/quantity", () => {
    let itemId;

    beforeEach(async () => {
      const created = await request(app)
        .post("/api/inventory")
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          name: "Coffee 200g",
          sku: "COFFEE-200",
          category: "Beverages",
          price: 180,
          stock: 20,
          lowStockThreshold: 5,
        });
      itemId = created.body.id;
    });

    it("should successfully adjust inventory quantity", async () => {
      const res = await request(app)
        .patch(`/api/inventory/${itemId}/quantity`)
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          quantity: -5,
          reason: "Damaged packaging write-off",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.stock).toBe(15);
    });

    it("should prevent negative stock balance", async () => {
      const res = await request(app)
        .patch(`/api/inventory/${itemId}/quantity`)
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          quantity: -30,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
