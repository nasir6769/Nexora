import { Router } from "express";
import * as logisticsController from "../controllers/logisticsController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

router.get("/", logisticsController.getLogistics);
router.get("/:id", logisticsController.getLogisticsDetail);
router.post("/", authorize(ROLES.ADMIN), logisticsController.createShipment);
router.patch("/:id/status", authorize(ROLES.ADMIN, ROLES.SUPPLIER), logisticsController.updateStatus);

export default router;
