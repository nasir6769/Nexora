import request from "supertest";
import app from "../src/app.js";
import { connectTestDB, closeTestDB, clearTestDB } from "./setup.js";

let sellerToken;
let buyerToken;
let listingId;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  // Create Seller Merchant
  const sRes = await request(app).post("/api/auth/register").send({
    name: "Seller Merchant",
    email: "seller@example.com",
    password: "password123",
    role: "merchant",
  });
  sellerToken = sRes.body.data.accessToken;

  // Create Buyer Merchant
  const bRes = await request(app).post("/api/auth/register").send({
    name: "Buyer Merchant",
    email: "buyer@example.com",
    password: "password123",
    role: "merchant",
  });
  buyerToken = bRes.body.data.accessToken;

  // Create listing
  const listRes = await request(app)
    .post("/api/resale/listings")
    .set("Authorization", `Bearer ${sellerToken}`)
    .send({
      productName: "Excess Bluetooth Speakers",
      sku: "SPK-BT-01",
      category: "Electronics",
      price: 800,
      quantity: 10,
    });
  listingId = listRes.body.id;
});

describe("Merchant-to-Merchant Resale API", () => {
  describe("POST /api/resale/requests (Purchase Listing)", () => {
    it("should allow another merchant to purchase listing and decrement available quantity", async () => {
      const res = await request(app)
        .post("/api/resale/requests")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          listingId,
          quantity: 4,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.quantity).toBe(4);
      expect(res.body.totalAmount).toBe(3200);

      // Verify listing quantity decremented
      const checkListing = await request(app)
        .get(`/api/resale/listings/${listingId}`)
        .set("Authorization", `Bearer ${buyerToken}`);

      expect(checkListing.body.availableQuantity).toBe(6);
    });

    it("should prevent seller from buying their own listing", async () => {
      const res = await request(app)
        .post("/api/resale/requests")
        .set("Authorization", `Bearer ${sellerToken}`)
        .send({
          listingId,
          quantity: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should prevent overselling beyond available listing quantity", async () => {
      const res = await request(app)
        .post("/api/resale/requests")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          listingId,
          quantity: 15, // Only 10 available
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
