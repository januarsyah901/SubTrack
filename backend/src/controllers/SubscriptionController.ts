import { Request, Response } from "express";
import { SubscriptionModel } from "../models/SubscriptionModel.js";
import { GeminiService } from "../services/GeminiService.js";
import { Subscription, ApiResponse } from "../models/types.js";

export class SubscriptionController {
  static async getAll(req: Request, res: Response) {
    try {
      const subscriptions = await SubscriptionModel.getAll();
      const response: ApiResponse<Subscription[]> = {
        success: true,
        data: subscriptions,
      };
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch subscriptions",
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subscription = await SubscriptionModel.getById(id);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: "Subscription not found",
        });
      }

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch subscription",
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, amount, cycle, billing_date, category, icon, color } =
        req.body;

      // Validation
      if (
        !name ||
        !amount ||
        !cycle ||
        billing_date === undefined ||
        !category
      ) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      const id = Math.random().toString(36).substr(2, 9);
      const subscription = await SubscriptionModel.create({
        id,
        name,
        amount: parseFloat(amount),
        cycle,
        billing_date: parseInt(billing_date),
        category,
        icon: icon || "fa-solid fa-cube",
        color: color || "#ff7f50",
      });

      res.status(201).json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to create subscription",
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const subscription = await SubscriptionModel.update(id, updates);

      if (!subscription) {
        return res.status(404).json({
          success: false,
          error: "Subscription not found",
        });
      }

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to update subscription",
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await SubscriptionModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Subscription not found",
        });
      }

      res.json({
        success: true,
        message: "Subscription deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to delete subscription",
      });
    }
  }

  static async getByDate(req: Request, res: Response) {
    try {
      const { date } = req.params;
      const billingDate = parseInt(date);

      if (isNaN(billingDate) || billingDate < 1 || billingDate > 31) {
        return res.status(400).json({
          success: false,
          error: "Invalid date. Must be between 1-31",
        });
      }

      const subscriptions =
        await SubscriptionModel.getByBillingDate(billingDate);
      res.json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to fetch subscriptions",
      });
    }
  }

  static async getMonthlyTotal(req: Request, res: Response) {
    try {
      const total = await SubscriptionModel.getMonthlyTotal();
      res.json({
        success: true,
        data: { total },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to calculate total",
      });
    }
  }

  static async getInsights(req: Request, res: Response) {
    try {
      const subscriptions = await SubscriptionModel.getAll();

      if (subscriptions.length === 0) {
        return res.json({
          success: true,
          data: {
            summary: "Add subscriptions to get insights.",
            savingsOpportunities: [],
            totalProjected: 0,
          },
        });
      }

      const insights =
        await GeminiService.getSubscriptionInsights(subscriptions);
      res.json({
        success: true,
        data: insights,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to generate insights",
      });
    }
  }

  static async parseSmartAdd(req: Request, res: Response) {
    try {
      const { input } = req.body;

      if (!input || typeof input !== "string") {
        return res.status(400).json({
          success: false,
          error: "Invalid input",
        });
      }

      const parsed = await GeminiService.parseSmartAdd(input);

      if (!parsed) {
        return res.status(400).json({
          success: false,
          error: "Could not parse input. Try a different format.",
        });
      }

      res.json({
        success: true,
        data: parsed,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to parse subscription",
      });
    }
  }
}
