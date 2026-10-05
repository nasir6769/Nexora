import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";
import { SupplierProduct } from "../src/models/SupplierProduct.js";

let merchantToken1;
let merchantToken2;
let supplierToken1;
let supplierToken2;
let adminToken;
let supplier1Id;
let supplier2Id;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Register Merchant 1
  const m1 = await request(app).post("/api/auth/register").send({
    name: "Merchant One",
    email: "merchant1@test.com",
    password: "password123",
    role: "merchant",
  });
  merchantToken1 = m1.body.data.accessToken;

  // Register Merchant 2
  const m2 = await request(app).post("/api/auth/register").send({
    name: "Merchant Two",
    email: "merchant2@test.com",
    password: "password123",
    role: "merchant",
  });
  merchantToken2 = m2.body.data.accessToken;

  // Register Supplier 1
  const s1 = await request(app).post("/api/auth/register").send({
    name: "Supplier One",
    email: "supplier1@test.com",
    password: "password123",
    role: "supplier",
  });
  supplierToken1 = s1.body.data.accessToken;
  supplier1Id = s1.body.data.user.id;

  // Register Supplier 2
  const s2 = await request(app).post("/api/auth/register").send({
    name: "Supplier Two",
    email: "supplier2@test.com",
    password: "password123",
    role: "supplier",
  });
  supplierToken2 = s2.body.data.accessToken;
  supplier2Id = s2.body.data.user.id;

  // Register Admin
  const a = await request(app).post("/api/auth/register").send({
    name: "Admin User",
    email: "admin@test.com",
    password: "password123",
    role: "admin",
  });
  adminToken = a.body.data.accessToken;
});

describe("THREE BUSINESS-LOGIC BUG FIXES VERIFICATION", () => {
  it("TEST 1 & TEST 7: Supplier stock does NOT reduce on admin assign, but reduces on ACCEPT (300 -> 200)", async () => {
    const prod = await SupplierProduct.create({
      supplierId: supplier1Id,
      supplierName: "Supplier One",
      name: "Product A",
      productName: "Product A",
      sku: "PROD-A",
      category: "Electronics",
      price: 100,
      stock: 300,
      availableStock: 300,
      minimumOrderQuantity: 1,
    });

    const reqRes = await request(app)
      .post("/api/procurement/requests")
      .set("Authorization", `Bearer ${merchantToken1}`)
      .send({
        productId: prod._id.toString(),
        productName: "Product A",
        quantity: 100,
        unitPrice: 100,
        totalAmount: 10000,
      });

    const orderId = reqRes.body.requestId || reqRes.body.id || reqRes.body._id;

    // Admin assigns order to Supplier 1
    const assignRes = await request(app)
      .post("/api/admin/procurement/supplier-order")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        requestId: orderId,
        supplierId: prod._id.toString(),
        supplierName: "Supplier One",
        quantity: 100,
        unitPrice: 100,
      });

    expect(assignRes.status).toBe(201);
    expect(assignRes.body.data.status).toBe("waiting_for_supplier");

    // Stock remains 300 BEFORE acceptance
    let checkProd = await SupplierProduct.findById(prod._id);
    expect(checkProd.availableStock).toBe(300);

    // Supplier 1 ACCEPTS the order
    const acceptRes = await request(app)
      .patch(`/api/supplier/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${supplierToken1}`)
      .send({ status: "accepted" });

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.status).toBe("supplier_accepted");

    // Stock reduces to 200
    checkProd = await SupplierProduct.findById(prod._id);
    expect(checkProd.availableStock).toBe(200);
  });

  it("TEST 2: Reject acceptance if stock is insufficient (50 available < 100 requested)", async () => {
    const prod = await SupplierProduct.create({
      supplierId: supplier1Id,
      supplierName: "Supplier One",
      name: "Product A",
      productName: "Product A",
      sku: "PROD-A",
      category: "Electronics",
      price: 100,
      stock: 50,
      availableStock: 50,
      minimumOrderQuantity: 1,
    });

    const reqRes = await request(app)
      .post("/api/procurement/requests")
      .set("Authorization", `Bearer ${merchantToken1}`)
      .send({
        productId: prod._id.toString(),
        productName: "Product A",
        quantity: 100,
        unitPrice: 100,
        totalAmount: 10000,
      });

    const orderId = reqRes.body.requestId || reqRes.body.id;

    await request(app)
      .post("/api/admin/procurement/supplier-order")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        requestId: orderId,
        supplierId: prod._id.toString(),
        supplierName: "Supplier One",
        quantity: 100,
        unitPrice: 100,
      });

    const acceptRes = await request(app)
      .patch(`/api/supplier/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${supplierToken1}`)
      .send({ status: "accepted" });

    expect(acceptRes.status).toBe(400);
    expect(acceptRes.body.message).toContain("Insufficient supplier stock to accept this order.");

    const checkProd = await SupplierProduct.findById(prod._id);
    expect(checkProd.availableStock).toBe(50);
  });

  it("TEST 3: Duplicate ACCEPT request must be rejected and stock must not deduct twice", async () => {
    const prod = await SupplierProduct.create({
      supplierId: supplier1Id,
      supplierName: "Supplier One",
      name: "Product A",
      productName: "Product A",
      sku: "PROD-A",
      category: "Electronics",
      price: 100,
      stock: 300,
      availableStock: 300,
      minimumOrderQuantity: 1,
    });

    const reqRes = await request(app)
      .post("/api/procurement/requests")
      .set("Authorization", `Bearer ${merchantToken1}`)
      .send({
        productId: prod._id.toString(),
        productName: "Product A",
        quantity: 100,
        unitPrice: 100,
        totalAmount: 10000,
      });

    const orderId = reqRes.body.requestId || reqRes.body.id;

    await request(app)
      .post("/api/admin/procurement/supplier-order")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        requestId: orderId,
        supplierId: prod._id.toString(),
        supplierName: "Supplier One",
        quantity: 100,
        unitPrice: 100,
      });

    // First Accept
    const acceptRes1 = await request(app)
      .patch(`/api/supplier/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${supplierToken1}`)
      .send({ status: "accepted" });

    expect(acceptRes1.status).toBe(200);

    let checkProd = await SupplierProduct.findById(prod._id);
    expect(checkProd.availableStock).toBe(200);

    // Duplicate Accept
    const acceptRes2 = await request(app)
      .patch(`/api/supplier/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${supplierToken1}`)
      .send({ status: "accepted" });

    expect(acceptRes2.status).toBe(400);

    checkProd = await SupplierProduct.findById(prod._id);
    expect(checkProd.availableStock).toBe(200);
  });

  it("TEST 6: Supplier REJECTION sets status to supplier_rejected and stock remains unchanged", async () => {
    const prod = await SupplierProduct.create({
      supplierId: supplier1Id,
      supplierName: "Supplier One",
      name: "Product A",
      productName: "Product A",
      sku: "PROD-A",
      category: "Electronics",
      price: 100,
      stock: 300,
      availableStock: 300,
      minimumOrderQuantity: 1,
    });

    const reqRes = await request(app)
      .post("/api/procurement/requests")
      .set("Authorization", `Bearer ${merchantToken1}`)
      .send({
        productId: prod._id.toString(),
        productName: "Product A",
        quantity: 100,
        unitPrice: 100,
        totalAmount: 10000,
      });

    const orderId = reqRes.body.requestId || reqRes.body.id;

    await request(app)
      .post("/api/admin/procurement/supplier-order")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        requestId: orderId,
        supplierId: prod._id.toString(),
        supplierName: "Supplier One",
        quantity: 100,
        unitPrice: 100,
      });

    const rejectRes = await request(app)
      .patch(`/api/supplier/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${supplierToken1}`)
      .send({ status: "rejected" });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.data.status).toBe("supplier_rejected");

    const checkProd = await SupplierProduct.findById(prod._id);
    expect(checkProd.availableStock).toBe(300);

    const prepRes = await request(app)
      .patch(`/api/supplier/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${supplierToken1}`)
      .send({ status: "preparing" });

    expect(prepRes.status).toBe(400);
  });

  it("TEST 4 & TEST 5 & TEST 8: Same product demand aggregation, invalid allocation validation, and multi-supplier split allocation", async () => {
    const prod1 = await SupplierProduct.create({
      supplierId: supplier1Id,
      supplierName: "Supplier One",
      name: "Product A",
      productName: "Product A",
      sku: "PROD-A",
      category: "Electronics",
      price: 95,
      stock: 100,
      availableStock: 100,
      minimumOrderQuantity: 10,
    });

    const prod2 = await SupplierProduct.create({
      supplierId: supplier2Id,
      supplierName: "Supplier Two",
      name: "Product A",
      productName: "Product A",
      sku: "PROD-A",
      category: "Electronics",
      price: 98,
      stock: 50,
      availableStock: 50,
      minimumOrderQuantity: 10,
    });

    const req1 = await request(app)
      .post("/api/procurement/requests")
      .set("Authorization", `Bearer ${merchantToken1}`)
      .send({
        productId: prod1._id.toString(),
        productName: "Product A",
        quantity: 30,
        unitPrice: 100,
        totalAmount: 3000,
      });

    const req2 = await request(app)
      .post("/api/procurement/requests")
      .set("Authorization", `Bearer ${merchantToken2}`)
      .send({
        productId: prod1._id.toString(),
        productName: "Product A",
        quantity: 50,
        unitPrice: 100,
        totalAmount: 5000,
      });

    const reqId1 = req1.body.requestId || req1.body.id;
    const reqId2 = req2.body.requestId || req2.body.id;

    // TEST 5: Invalid allocation (50 + 20 = 70 != 80 total demand)
    const invalidAllocRes = await request(app)
      .post("/api/admin/procurement/allocate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        productName: "Product A",
        requestIds: [reqId1, reqId2],
        allocations: [
          { supplierId: prod1._id.toString(), supplierName: "Supplier One", quantity: 50 },
          { supplierId: prod2._id.toString(), supplierName: "Supplier Two", quantity: 20 },
        ],
      });

    expect(invalidAllocRes.status).toBe(400);
    expect(invalidAllocRes.body.message).toBe("Supplier allocation must equal total requested quantity.");

    // TEST 8 & TEST 4: Valid Multi-Supplier Allocation (Supplier 1 -> 30, Supplier 2 -> 50)
    const validAllocRes = await request(app)
      .post("/api/admin/procurement/allocate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        productName: "Product A",
        requestIds: [reqId1, reqId2],
        allocations: [
          { supplierId: prod1._id.toString(), supplierName: "Supplier One", quantity: 30 },
          { supplierId: prod2._id.toString(), supplierName: "Supplier Two", quantity: 50 },
        ],
      });

    expect(validAllocRes.status).toBe(200);
    expect(validAllocRes.body.success).toBe(true);

    const sup1Orders = await request(app)
      .get("/api/supplier/orders")
      .set("Authorization", `Bearer ${supplierToken1}`);

    const sup2Orders = await request(app)
      .get("/api/supplier/orders")
      .set("Authorization", `Bearer ${supplierToken2}`);

    const sup2TotalQty = sup2Orders.body.data.reduce((sum, o) => sum + o.quantity, 0);
    expect(sup2TotalQty).toBe(50);

    // Supplier 1 accepts their order (30 units)
    const sup1OrderId = sup1Orders.body.data[0].requestId || sup1Orders.body.data[0].id;
    await request(app)
      .patch(`/api/supplier/orders/${sup1OrderId}/status`)
      .set("Authorization", `Bearer ${supplierToken1}`)
      .send({ status: "accepted" });

    const checkProd1 = await SupplierProduct.findById(prod1._id);
    const checkProd2 = await SupplierProduct.findById(prod2._id);
    expect(checkProd1.availableStock).toBe(70);
    expect(checkProd2.availableStock).toBe(50);
  });
});
