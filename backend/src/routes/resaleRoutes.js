import { Router } from "express";
import * as resaleController from "../controllers/resaleController.js";
import { createResaleListingValidator, createResaleRequestValidator } from "../validators/resaleValidator.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";
import { ROLES } from "../utils/constants.js";

const router = Router();

router.use(authenticate);

// Marketplace Listings
router.get("/listings", resaleController.getResaleListings);
router.get("/listings/my", authorize(ROLES.MERCHANT), resaleController.getMyResaleListings);
router.get("/listings/:id", resaleController.getResaleListing);
router.post("/listings", authorize(ROLES.MERCHANT), createResaleListingValidator, validate, resaleController.createResaleListing);
router.put("/listings/:id", authorize(ROLES.MERCHANT), resaleController.updateResaleListing);
router.delete("/listings/:id", authorize(ROLES.MERCHANT), resaleController.deleteResaleListing);

// Orders / Requests
router.post("/requests", authorize(ROLES.MERCHANT), createResaleRequestValidator, validate, resaleController.createResaleRequestOrOrder);
router.post("/orders", authorize(ROLES.MERCHANT), createResaleRequestValidator, validate, resaleController.createResaleRequestOrOrder);

router.get("/requests", authorize(ROLES.MERCHANT, ROLES.ADMIN), resaleController.getResaleRequestsOrOrders);
router.get("/orders", authorize(ROLES.MERCHANT, ROLES.ADMIN), resaleController.getResaleRequestsOrOrders);

router.get("/requests/:id", authorize(ROLES.MERCHANT, ROLES.ADMIN), resaleController.getResaleRequestOrOrder);
router.get("/orders/:id", authorize(ROLES.MERCHANT, ROLES.ADMIN), resaleController.getResaleRequestOrOrder);

router.patch("/requests/:id/cancel", authorize(ROLES.MERCHANT, ROLES.ADMIN), resaleController.cancelResaleRequestOrOrder);

export default router;
