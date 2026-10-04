import { Router } from "express";
import authRoutes from "./authRoutes.js";
import inventoryRoutes from "./inventoryRoutes.js";
import procurementRoutes from "./procurementRoutes.js";
import resaleRoutes from "./resaleRoutes.js";
import supplierRoutes from "./supplierRoutes.js";
import adminRoutes from "./adminRoutes.js";
import logisticsRoutes from "./logisticsRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import recommendationRoutes from "./recommendationRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/procurement", procurementRoutes);
router.use("/resale", resaleRoutes);
router.use("/supplier", supplierRoutes);
router.use("/admin", adminRoutes);
router.use("/logistics", logisticsRoutes);
router.use("/payments", paymentRoutes);
router.use("/recommendations", recommendationRoutes);

export default router;
