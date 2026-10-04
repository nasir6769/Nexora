import { Router } from "express";
import * as inventoryController from "../controllers/inventoryController.js";
import { createInventoryValidator, updateQuantityValidator } from "../validators/inventoryValidator.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

// Alerts and Analytics routes (must be before /:id)
router.get("/alerts/low-stock", authorize(ROLES.MERCHANT, ROLES.ADMIN), inventoryController.getLowStockAlerts);
router.get("/alerts/slow-moving", authorize(ROLES.MERCHANT, ROLES.ADMIN), inventoryController.getSlowMovingAlerts);
router.get("/low-stock", authorize(ROLES.MERCHANT, ROLES.ADMIN), inventoryController.getLowStockAlerts);
router.get("/slow-moving", authorize(ROLES.MERCHANT, ROLES.ADMIN), inventoryController.getSlowMovingAlerts);
router.get("/analytics", authorize(ROLES.MERCHANT, ROLES.ADMIN), inventoryController.getInventoryAnalytics);
router.get("/expiry-risk", authorize(ROLES.MERCHANT, ROLES.ADMIN), inventoryController.getExpiryRiskItems);

// CRUD
router.get("/", authorize(ROLES.MERCHANT, ROLES.ADMIN), inventoryController.getInventory);
router.get("/:id", authorize(ROLES.MERCHANT, ROLES.ADMIN), inventoryController.getInventoryItem);
router.post("/", authorize(ROLES.MERCHANT), createInventoryValidator, validate, inventoryController.createInventoryItem);
router.put("/:id", authorize(ROLES.MERCHANT, ROLES.ADMIN), inventoryController.updateInventoryItem);
router.delete("/:id", authorize(ROLES.MERCHANT, ROLES.ADMIN), inventoryController.deleteInventoryItem);
router.patch("/:id/quantity", authorize(ROLES.MERCHANT, ROLES.ADMIN), updateQuantityValidator, validate, inventoryController.updateQuantity);

export default router;
