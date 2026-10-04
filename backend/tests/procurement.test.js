import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";
import { SupplierProduct } from "../src/models/SupplierProduct.js";
import { SupplierOffer } from "../src/models/SupplierOffer.js";

let merchantToken;
let supplierToken;
let adminToken;
let productId;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create Merchant
  const mRes = await request(app).post("/api/auth/register").send({
    name: "Procurement Merchant",
    email: "pmerchant@example.com",
    password: "password123",
    role: "merchant",
  });
  merchantToken = mRes.body.data.accessToken;

  // Create Supplier
  const sRes = await request(app).post("/api/auth/register").send({
    name: "Best Wholesale Supplier",
    email: "bsupplier@example.com",
    password: "password123",
    role: "supplier",
  });
  supplierToken = sRes.body.data.accessToken;
  const supplierId = sRes.body.data.user.id;

  // Create Admin
  const aRes = await request(app).post("/api/auth/register").send({
    name: "Admin User",
    email: "padmin@example.com",
    password: "password123",
    role: "admin",
  });
  adminToken = aRes.body.data.accessToken;

  // Create Supplier Product
  const prod = await SupplierProduct.create({
    supplierId,
    supplierName: "Best Wholesale Supplier",
    name: "Basmati Rice 25kg",
    sku: "BAS-25KG",
    category: "Groceries",
    price: 1800,
    stock: 500,
    minimumOrderQuantity: 10,
    estimatedDeliveryDays: 2,
    rating: 4.9,
  });
  productId = prod._id.toString();

  // Create Supplier Offer
  await SupplierOffer.create({
    supplierId,
    supplierName: "Best Wholesale Supplier",
    productName: "Basmati Rice 25kg",
    price: 1800,
    availableStock: 500,
    minimumOrderQuantity: 10,
    deliveryDays: 2,
    rating: 4.9,
  });
});

describe("Procurement Engine & Commitment API", () => {
  describe("POST /api/payments/commitment", () => {
    it("should simulate 10% commitment payment and return paymentId", async () => {
      const res = await request(app)
        .post("/api/payments/commitment")
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          requestId: productId,
          amount: 3600,
          percentage: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.paymentId).toBeDefined();
      expect(res.body.status).toBe("paid");
      expect(res.body.amount).toBe(3600);
    });
  });

  describe("POST /api/procurement/requests", () => {
    it("should create procurement request with paid 10% commitment", async () => {
      const payRes = await request(app)
        .post("/api/payments/commitment")
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          requestId: productId,
          amount: 3600,
          percentage: 10,
        });

      const res = await request(app)
        .post("/api/procurement/requests")
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          productId,
          productName: "Basmati Rice 25kg",
          quantity: 20,
          unitPrice: 1800,
          totalAmount: 36000,
          commitmentPercentage: 10,
          commitmentAmount: 3600,
          paymentId: payRes.body.paymentId,
          paymentStatus: "paid",
          deliveryAddress: {
            addressLine1: "123 Main St",
            city: "Delhi",
            state: "Delhi",
            pincode: "110001",
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.productName).toBe("Basmati Rice 25kg");
      expect(res.body.quantity).toBe(20);
      expect(res.body.commitmentAmount).toBe(3600);
    });
  });

  describe("GET /api/procurement/aggregate", () => {
    it("should calculate aggregated pooled demand across requests", async () => {
      // Create request 1
      await request(app)
        .post("/api/procurement/requests")
        .set("Authorization", `Bearer ${merchantToken}`)
        .send({
          productId,
          productName: "Basmati Rice 25kg",
          quantity: 30,
          totalAmount: 54000,
          commitmentAmount: 5400,
        });

      const res = await request(app)
        .get("/api/procurement/aggregate")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].totalQuantity).toBe(30);
    });
  });

  describe("Supplier Selection Algorithm", () => {
    it("should select optimal supplier offer deterministically", async () => {
      const res = await request(app)
        .post("/api/procurement/select-supplier")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          productName: "Basmati Rice 25kg",
          quantity: 50,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bestSupplier).toBeDefined();
      expect(res.body.data.bestSupplier.supplierName).toBe("Best Wholesale Supplier");
    });
  });
});
