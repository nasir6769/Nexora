import { Router } from "express";
import * as procurementController from "../controllers/procurementController.js";
import { createProcurementRequestValidator, selectSupplierValidator } from "../validators/procurementValidator.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

// Catalog of products available for bulk procurement
router.get("/products", procurementController.getProcurementProducts);
router.get("/products/:id", procurementController.getProcurementProduct);

// Demand aggregation and supplier selection engine
router.get("/aggregate", authorize(ROLES.ADMIN, ROLES.MERCHANT), procurementController.getAggregatedDemand);
router.get("/suppliers", authorize(ROLES.ADMIN, ROLES.MERCHANT), procurementController.getProcurementSuppliersOrOffers);
router.post("/select-supplier", authorize(ROLES.ADMIN, ROLES.MERCHANT), procurementController.selectSupplier);

// Procurement requests (Merchant & Admin)
router.post("/requests", authorize(ROLES.MERCHANT), createProcurementRequestValidator, validate, procurementController.createProcurementRequest);
router.post("/request", authorize(ROLES.MERCHANT), createProcurementRequestValidator, validate, procurementController.createProcurementRequest);

router.get("/requests", procurementController.getProcurementRequests);
router.get("/orders", procurementController.getProcurementRequests);

router.get("/requests/:id", procurementController.getProcurementRequest);
router.get("/orders/:id", procurementController.getProcurementRequest);

router.patch("/requests/:id/cancel", authorize(ROLES.MERCHANT, ROLES.ADMIN), procurementController.cancelProcurementRequest);

export default router;
