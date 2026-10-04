import { Router } from "express";
import * as supplierController from "../controllers/supplierController.js";
import { createSupplierProductValidator } from "../validators/supplierValidator.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

// Products
router.get("/products", authorize(ROLES.SUPPLIER, ROLES.ADMIN), supplierController.getSupplierProducts);
router.get("/products/:id", authorize(ROLES.SUPPLIER, ROLES.ADMIN), supplierController.getSupplierProduct);
router.post("/products", authorize(ROLES.SUPPLIER), createSupplierProductValidator, validate, supplierController.createSupplierProduct);
router.put("/products/:id", authorize(ROLES.SUPPLIER, ROLES.ADMIN), supplierController.updateSupplierProduct);
router.delete("/products/:id", authorize(ROLES.SUPPLIER, ROLES.ADMIN), supplierController.deleteSupplierProduct);

// Orders
router.get("/orders", authorize(ROLES.SUPPLIER, ROLES.ADMIN), supplierController.getSupplierOrders);
router.get("/orders/:id", authorize(ROLES.SUPPLIER, ROLES.ADMIN), supplierController.getSupplierOrder);
router.patch("/orders/:id/status", authorize(ROLES.SUPPLIER, ROLES.ADMIN), supplierController.updateSupplierOrderStatus);

export default router;
