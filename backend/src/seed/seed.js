import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db.js";
import {
  User,
  Inventory,
  InventoryMovement,
  SupplierProduct,
  SupplierOffer,
  ProcurementOrder,
  ResaleListing,
  ResaleOrder,
  Logistics,
  Transaction,
} from "../models/index.js";
import {
  ROLES,
  INVENTORY_STATUS,
  INVENTORY_MOVEMENT_TYPE,
  PROCUREMENT_STATUS,
  RESALE_LISTING_STATUS,
  RESALE_ORDER_STATUS,
  LOGISTICS_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "../utils/constants.js";

dotenv.config();

export const seedDatabase = async () => {
  console.log("[Seed] Starting database seed process...");

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Inventory.deleteMany({}),
    InventoryMovement.deleteMany({}),
    SupplierProduct.deleteMany({}),
    SupplierOffer.deleteMany({}),
    ProcurementOrder.deleteMany({}),
    ResaleListing.deleteMany({}),
    ResaleOrder.deleteMany({}),
    Logistics.deleteMany({}),
    Transaction.deleteMany({}),
  ]);

  console.log("[Seed] Cleared existing data.");

  // 1. Create Users (1 Admin, 3 Merchants, 3 Suppliers)
  const [admin, merchant1, merchant2, merchant3, supplier1, supplier2, supplier3] =
    await User.create([
      {
        name: "Demo Admin",
        email: "admin@demo.com",
        password: "password123",
        role: ROLES.ADMIN,
        phone: "+91 9876543210",
        companyName: "Merchant Network Platform",
      },
      {
        name: "Demo Merchant",
        email: "merchant@demo.com",
        password: "password123",
        role: ROLES.MERCHANT,
        phone: "+91 9811122233",
        companyName: "Demo Merchant Retail Ltd",
        address: {
          addressLine1: "101 Commercial Street",
          addressLine2: "Near Central Metro",
          landmark: "Tower Plaza",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
      },
      {
        name: "City Corner Store",
        email: "citycorner@demo.com",
        password: "password123",
        role: ROLES.MERCHANT,
        phone: "+91 9822233344",
        companyName: "City Corner Retailers",
        address: {
          addressLine1: "45 Market Road",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411001",
        },
      },
      {
        name: "Green Basket",
        email: "greenbasket@demo.com",
        password: "password123",
        role: ROLES.MERCHANT,
        phone: "+91 9833344455",
        companyName: "Green Basket Groceries",
        address: {
          addressLine1: "12 Residency Cross",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
        },
      },
      {
        name: "Demo Supplier",
        email: "supplier@demo.com",
        password: "password123",
        role: ROLES.SUPPLIER,
        phone: "+91 9844455566",
        companyName: "Demo Wholesale Supply Corp",
      },
      {
        name: "FreshMart Suppliers",
        email: "freshmart@demo.com",
        password: "password123",
        role: ROLES.SUPPLIER,
        phone: "+91 9855566677",
        companyName: "FreshMart Agritech & FMCG",
      },
      {
        name: "National Distributors",
        email: "national@demo.com",
        password: "password123",
        role: ROLES.SUPPLIER,
        phone: "+91 9866677788",
        companyName: "National Bulk Distributing Co",
      },
    ]);

  console.log("[Seed] Users created.");

  // 2. Create Merchant Inventories
  const invItems = await Inventory.create([
    {
      merchantId: merchant1._id,
      productId: "prod-001",
      name: "Basmati Rice 5kg",
      productName: "Basmati Rice 5kg",
      sku: "RICE-5KG",
      category: "Groceries",
      description: "Premium long-grain aged basmati rice package.",
      price: 420,
      stock: 18,
      quantity: 18,
      lowStockThreshold: 10,
      status: INVENTORY_STATUS.IN_STOCK,
    },
    {
      merchantId: merchant1._id,
      productId: "prod-002",
      name: "Sunflower Oil 1L",
      productName: "Sunflower Oil 1L",
      sku: "OIL-1L",
      category: "Groceries",
      description: "Refined cooking oil bottle.",
      price: 145,
      stock: 7,
      quantity: 7,
      lowStockThreshold: 10,
      status: INVENTORY_STATUS.LOW_STOCK,
    },
    {
      merchantId: merchant1._id,
      productId: "prod-003",
      name: "Wheat Flour 10kg",
      productName: "Wheat Flour 10kg",
      sku: "FLOUR-10KG",
      category: "Groceries",
      description: "100% whole wheat chakki atta.",
      price: 510,
      stock: 24,
      quantity: 24,
      lowStockThreshold: 8,
      status: INVENTORY_STATUS.IN_STOCK,
    },
    {
      merchantId: merchant1._id,
      productId: "prod-004",
      name: "Toor Dal 1kg",
      productName: "Toor Dal 1kg",
      sku: "DAL-1KG",
      category: "Groceries",
      description: "Unpolished organic yellow toor dal.",
      price: 165,
      stock: 5,
      quantity: 5,
      lowStockThreshold: 10,
      status: INVENTORY_STATUS.LOW_STOCK,
    },
    {
      merchantId: merchant1._id,
      productId: "prod-005",
      name: "Tea 500g",
      productName: "Tea 500g",
      sku: "TEA-500G",
      category: "Beverages",
      description: "Strong Assam blend CTC tea pack.",
      price: 230,
      stock: 42,
      quantity: 42,
      lowStockThreshold: 10,
      status: INVENTORY_STATUS.EXCESS,
    },
  ]);

  // Inventory movements for initial stock
  for (const inv of invItems) {
    await InventoryMovement.create({
      merchantId: inv.merchantId,
      inventoryId: inv._id,
      productName: inv.name,
      sku: inv.sku,
      type: INVENTORY_MOVEMENT_TYPE.INBOUND,
      quantity: inv.stock,
      previousStock: 0,
      newStock: inv.stock,
      reason: "Initial warehouse intake",
    });
  }

  console.log("[Seed] Inventories & movements created.");

  // 3. Create Supplier Products
  const supplierProducts = await SupplierProduct.create([
    {
      supplierId: supplier2._id,
      supplierName: supplier2.name,
      productId: "prod-101",
      name: "Basmati Rice 25kg",
      productName: "Basmati Rice 25kg",
      sku: "BAS-25KG",
      category: "Groceries",
      description: "Wholesale bulk bag of export-quality long grain basmati rice.",
      price: 1850,
      stock: 240,
      availableStock: 240,
      minimumOrderQuantity: 10,
      estimatedDeliveryDays: 2,
      rating: 4.8,
      status: "active",
    },
    {
      supplierId: supplier3._id,
      supplierName: supplier3.name,
      productId: "prod-102",
      name: "Sunflower Oil 15L",
      productName: "Sunflower Oil 15L",
      sku: "OIL-15L",
      category: "Groceries",
      description: "Commercial 15L tin of pure refined sunflower cooking oil.",
      price: 1980,
      stock: 180,
      availableStock: 180,
      minimumOrderQuantity: 5,
      estimatedDeliveryDays: 3,
      rating: 4.6,
      status: "active",
    },
    {
      supplierId: supplier2._id,
      supplierName: supplier2.name,
      productId: "prod-103",
      name: "Wheat Flour 25kg",
      productName: "Wheat Flour 25kg",
      sku: "FLOUR-25KG",
      category: "Groceries",
      description: "Bulk chakki atta bags directly from flour mills.",
      price: 1120,
      stock: 320,
      availableStock: 320,
      minimumOrderQuantity: 10,
      estimatedDeliveryDays: 2,
      rating: 4.8,
      status: "active",
    },
    {
      supplierId: supplier1._id,
      supplierName: supplier1.name,
      productId: "prod-104",
      name: "Toor Dal 25kg",
      productName: "Toor Dal 25kg",
      sku: "DAL-25KG",
      category: "Groceries",
      description: "Wholesale sack of AAA grade toor dal.",
      price: 3150,
      stock: 95,
      availableStock: 95,
      minimumOrderQuantity: 5,
      estimatedDeliveryDays: 1,
      rating: 4.7,
      status: "active",
    },
  ]);

  // 4. Create Supplier Offers
  await SupplierOffer.create([
    {
      supplierId: supplier2._id,
      supplierName: "FreshMart Suppliers",
      productName: "Basmati Rice 25kg",
      price: 1850,
      availableStock: 240,
      minimumOrderQuantity: 10,
      deliveryDays: 2,
      rating: 4.8,
      isActive: true,
    },
    {
      supplierId: supplier3._id,
      supplierName: "National Distributors",
      productName: "Basmati Rice 25kg",
      price: 1790,
      availableStock: 80,
      minimumOrderQuantity: 20,
      deliveryDays: 3,
      rating: 4.6,
      isActive: true,
    },
    {
      supplierId: supplier1._id,
      supplierName: "Wholesale Hub",
      productName: "Basmati Rice 25kg",
      price: 1920,
      availableStock: 300,
      minimumOrderQuantity: 5,
      deliveryDays: 1,
      rating: 4.7,
      isActive: true,
    },
    {
      supplierId: supplier2._id,
      supplierName: "FreshMart Suppliers",
      productName: "Wheat Flour 25kg",
      price: 1120,
      availableStock: 320,
      minimumOrderQuantity: 10,
      deliveryDays: 2,
      rating: 4.8,
      isActive: true,
    },
    {
      supplierId: supplier3._id,
      supplierName: "National Distributors",
      productName: "Wheat Flour 25kg",
      price: 1085,
      availableStock: 140,
      minimumOrderQuantity: 20,
      deliveryDays: 3,
      rating: 4.5,
      isActive: true,
    },
  ]);

  console.log("[Seed] Supplier products & offers created.");

  // 5. Create Transactions & Procurement Orders
  const tx1 = await Transaction.create({
    userId: merchant1._id,
    userName: merchant1.name,
    type: TRANSACTION_TYPE.PROCUREMENT_COMMITMENT,
    amount: 3700,
    percentage: 10,
    referenceId: "prod-101",
    referenceType: "procurement",
    status: TRANSACTION_STATUS.COMPLETED,
  });

  const tx2 = await Transaction.create({
    userId: merchant1._id,
    userName: merchant1.name,
    type: TRANSACTION_TYPE.PROCUREMENT_COMMITMENT,
    amount: 1680,
    percentage: 10,
    referenceId: "prod-103",
    referenceType: "procurement",
    status: TRANSACTION_STATUS.COMPLETED,
  });

  const proc1 = await ProcurementOrder.create({
    requestId: "PR-1001",
    merchantId: merchant1._id,
    merchantName: merchant1.name,
    supplierId: supplier2._id,
    supplierName: supplier2.name,
    productId: "prod-101",
    productName: "Basmati Rice 25kg",
    sku: "BAS-25KG",
    category: "Groceries",
    quantity: 20,
    unitPrice: 1850,
    totalAmount: 37000,
    commitmentPercentage: 10,
    commitmentAmount: 3700,
    paymentId: tx1.transactionId,
    paymentStatus: "paid",
    status: PROCUREMENT_STATUS.PENDING,
    deliveryAddress: merchant1.address,
  });

  const proc2 = await ProcurementOrder.create({
    requestId: "PR-1002",
    merchantId: merchant1._id,
    merchantName: merchant1.name,
    supplierId: supplier2._id,
    supplierName: supplier2.name,
    productId: "prod-103",
    productName: "Wheat Flour 25kg",
    sku: "FLOUR-25KG",
    category: "Groceries",
    quantity: 15,
    unitPrice: 1120,
    totalAmount: 16800,
    commitmentPercentage: 10,
    commitmentAmount: 1680,
    paymentId: tx2.transactionId,
    paymentStatus: "paid",
    status: PROCUREMENT_STATUS.ACCEPTED,
    deliveryAddress: merchant1.address,
  });

  console.log("[Seed] Procurement orders & commitment transactions created.");

  // 6. Create Resale Listings
  const [listing1, listing2, listing3] = await ResaleListing.create([
    {
      listingId: "listing-001",
      merchantId: merchant2._id,
      sellerName: merchant2.name,
      productId: "resale-001",
      productName: "Premium Tea 500g",
      sku: "TEA-500G",
      category: "Beverages",
      description: "Excess stock available for quick resale.",
      price: 185,
      quantity: 35,
      availableQuantity: 35,
      status: RESALE_LISTING_STATUS.ACTIVE,
    },
    {
      listingId: "listing-002",
      merchantId: merchant3._id,
      sellerName: merchant3.name,
      productId: "resale-002",
      productName: "Cooking Oil 5L",
      sku: "OIL-5L",
      category: "Groceries",
      description: "Good condition excess inventory.",
      price: 620,
      quantity: 12,
      availableQuantity: 12,
      status: RESALE_LISTING_STATUS.ACTIVE,
    },
    {
      listingId: "listing-003",
      merchantId: merchant1._id,
      sellerName: merchant1.name,
      inventoryId: invItems[4]._id,
      productId: "resale-003",
      productName: "Tea 500g",
      sku: "TEA-500G",
      category: "Beverages",
      description: "Surplus inventory available at discounted bulk price.",
      price: 190,
      quantity: 10,
      availableQuantity: 10,
      status: RESALE_LISTING_STATUS.ACTIVE,
    },
  ]);

  // 7. Create Resale Orders
  await ResaleOrder.create([
    {
      orderId: "RR-2001",
      listingId: listing1._id,
      buyerId: merchant1._id,
      buyerName: merchant1.name,
      sellerId: merchant2._id,
      sellerName: merchant2.name,
      productName: "Premium Tea 500g",
      sku: "TEA-500G",
      quantity: 10,
      unitPrice: 185,
      totalAmount: 1850,
      status: RESALE_ORDER_STATUS.PENDING,
      paymentStatus: "paid",
    },
    {
      orderId: "RR-2002",
      listingId: listing2._id,
      buyerId: merchant1._id,
      buyerName: merchant1.name,
      sellerId: merchant3._id,
      sellerName: merchant3.name,
      productName: "Cooking Oil 5L",
      sku: "OIL-5L",
      quantity: 5,
      unitPrice: 620,
      totalAmount: 3100,
      status: RESALE_ORDER_STATUS.COMPLETED,
      paymentStatus: "paid",
    },
  ]);

  console.log("[Seed] Resale listings & orders created.");

  // 8. Create Logistics Shipments
  await Logistics.create([
    {
      shipmentId: "SHIP-6001",
      orderId: "ORD-5001",
      orderType: "procurement",
      merchantId: merchant1._id,
      merchantName: merchant1.name,
      supplierId: supplier2._id,
      supplierName: supplier2.name,
      status: LOGISTICS_STATUS.IN_TRANSIT,
      trackingNumber: "MN-TRK-10001",
      currentLocation: "Central Transit Hub - Pune",
      destination: "Mumbai Distribution Store",
      estimatedDelivery: "2026-10-06",
    },
    {
      shipmentId: "SHIP-6002",
      orderId: "ORD-5002",
      orderType: "procurement",
      merchantId: merchant2._id,
      merchantName: merchant2.name,
      supplierId: supplier3._id,
      supplierName: supplier3.name,
      status: LOGISTICS_STATUS.PREPARING,
      trackingNumber: "MN-TRK-10002",
      currentLocation: "Origin Warehouse",
      destination: "Pune Retail Center",
      estimatedDelivery: "2026-10-07",
    },
    {
      shipmentId: "SHIP-6003",
      orderId: "ORD-5003",
      orderType: "procurement",
      merchantId: merchant3._id,
      merchantName: merchant3.name,
      supplierId: supplier1._id,
      supplierName: supplier1.name,
      status: LOGISTICS_STATUS.DELIVERED,
      trackingNumber: "MN-TRK-10003",
      currentLocation: "Delivered to Customer Store",
      destination: "Bangalore Hub",
      estimatedDelivery: "2026-10-02",
    },
  ]);

  console.log("[Seed] Logistics records created.");
  console.log("[Seed] Database seeding completed successfully!");
};

// If run directly from CLI
if (process.argv[1]?.endsWith("seed.js")) {
  connectDB()
    .then(async () => {
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Seed] Error during seeding:", err);
      process.exit(1);
    });
}
