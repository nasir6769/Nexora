import { Router } from "express";
import * as recommendationController from "../controllers/recommendationController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

router.get("/procurement", authorize(ROLES.MERCHANT, ROLES.ADMIN), recommendationController.getProcurementRecommendations);
router.get("/resale", authorize(ROLES.MERCHANT, ROLES.ADMIN), recommendationController.getResaleRecommendations);

export default router;
