import { Router } from "express";
import * as paymentController from "../controllers/paymentController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

// Simulated 10% commitment deposit
router.post("/commitment", authorize(ROLES.MERCHANT), paymentController.payCommitment);

export default router;
