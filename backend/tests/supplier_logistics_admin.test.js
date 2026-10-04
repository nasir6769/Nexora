import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";
import { Logistics } from "../src/models/Logistics.js";

let adminToken;
let supplierToken;
let merchantToken;
let supplierId;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Admin
  const aRes = await request(app).post("/api/auth/register").send({
    name: "Admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  });
  adminToken = aRes.body.data.accessToken;

  // Supplier
  const sRes = await request(app).post("/api/auth/register").send({
    name: "Wholesale Supplier",
    email: "supplier@example.com",
    password: "password123",
    role: "supplier",
  });
  supplierToken = sRes.body.data.accessToken;
  supplierId = sRes.body.data.user.id;

  // Merchant
  const mRes = await request(app).post("/api/auth/register").send({
    name: "Merchant",
    email: "merchant@example.com",
    password: "password123",
    role: "merchant",
  });
  merchantToken = mRes.body.data.accessToken;
});

describe("Supplier, Admin & Logistics Security Tests", () => {
  describe("Supplier Products Management", () => {
    it("should allow supplier to create and list supplier products", async () => {
      const res = await request(app)
        .post("/api/supplier/products")
        .set("Authorization", `Bearer ${supplierToken}`)
        .send({
          name: "Bulk Sugar 50kg",
          sku: "SUGAR-50KG",
          category: "Groceries",
          price: 2200,
          stock: 100,
          minimumOrderQuantity: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.sku).toBe("SUGAR-50KG");
    });

    it("should deny merchant from creating supplier products", async () => {
      const res = await request(app)
        .post("/api/supplier/products")
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          name: "Invalid Supplier Product",
          sku: "INV-SUP-01",
          category: "General",
          price: 100,
          stock: 10,
        });

      expect(res.status).toBe(403);
    });
  });

  describe("Admin Portal Access Control", () => {
    it("should allow admin to access dashboard metrics", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalMerchants).toBeDefined();
    });

    it("should deny merchant from accessing admin dashboard", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${merchantToken}`);

      expect(res.status).toBe(403);
    });

    it("should deny supplier from accessing admin dashboard", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${supplierToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe("Logistics Tracking", () => {
    let shipmentId;

    beforeEach(async () => {
      const s = await Logistics.create({
        orderId: "ORD-9999",
        orderType: "procurement",
        merchantName: "Merchant",
        supplierName: "Supplier",
        status: "assigned",
      });
      shipmentId = s.shipmentId;
    });

    it("should update logistics tracking status", async () => {
      const res = await request(app)
        .patch(`/api/logistics/${shipmentId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          status: "in_transit",
          location: "Transit Hub Mumbai",
          note: "Departed sorting facility",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("in_transit");
      expect(res.body.currentLocation).toBe("Transit Hub Mumbai");
    });
  });
});
