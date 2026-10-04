import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get("/dashboard", adminController.getDashboard);

router.get("/suppliers", adminController.getSuppliers);
router.get("/suppliers/:id", adminController.getSupplierDetail);

router.get("/orders", adminController.getOrders);
router.get("/orders/:id", adminController.getOrderDetail);

router.get("/procurement", adminController.getProcurement);
router.get("/procurement/supplier-offers", adminController.getSupplierOffers);
router.post("/procurement/supplier-order", adminController.createSupplierOrder);
router.get("/procurement/:id", adminController.getProcurementDetail);

router.get("/logistics", adminController.getLogistics);
router.get("/logistics/:id", adminController.getShipmentDetail);

export default router;
