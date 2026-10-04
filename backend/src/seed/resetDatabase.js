import dotenv from "dotenv";
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
import { ROLES } from "../utils/constants.js";

dotenv.config();

const resetDatabase = async () => {
  console.log("[Reset] Starting database reset...");

  await connectDB();

  // Delete all application/business data
  await Promise.all([
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

  // Keep only the admin account.
  // Remove every merchant and supplier account.
  await User.deleteMany({
    role: {
      $in: [ROLES.MERCHANT, ROLES.SUPPLIER],
    },
  });

  // Make sure the platform admin exists.
  const existingAdmin = await User.findOne({
    email: "admin@demo.com",
  });

  if (!existingAdmin) {
    await User.create({
      name: "Platform Admin",
      email: "admin@demo.com",
      password: "password123",
      role: ROLES.ADMIN,
      phone: "+91 9876543210",
      companyName: "Nexora Platform",
    });

    console.log("[Reset] Platform admin created.");
  } else {
    console.log("[Reset] Existing platform admin preserved.");
  }

  console.log("[Reset] Database is now clean.");
  console.log("[Reset] Only the platform admin remains.");

  await disconnectDB();
};

resetDatabase().catch(async (error) => {
  console.error("[Reset] Failed:", error);
  await disconnectDB();
  process.exit(1);
});