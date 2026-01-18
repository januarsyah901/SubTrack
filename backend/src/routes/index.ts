import { Router } from "express";
import { SubscriptionController } from "../controllers/SubscriptionController.js";

const router = Router();

// Subscription routes
router.get("/subscriptions", SubscriptionController.getAll);
router.post("/subscriptions", SubscriptionController.create);
router.get("/subscriptions/:id", SubscriptionController.getById);
router.put("/subscriptions/:id", SubscriptionController.update);
router.delete("/subscriptions/:id", SubscriptionController.delete);
router.get("/subscriptions/date/:date", SubscriptionController.getByDate);
router.get("/stats/monthly-total", SubscriptionController.getMonthlyTotal);

// AI routes
router.get("/ai/insights", SubscriptionController.getInsights);
router.post("/ai/parse-smart-add", SubscriptionController.parseSmartAdd);

export default router;
