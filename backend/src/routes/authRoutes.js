import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { registerValidator, loginValidator } from "../validators/authValidator.js";
import { validate } from "../middleware/validate.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.get("/me", authenticate, authController.getMe);
router.post("/logout", optionalAuthenticate, authController.logout);

export default router;
