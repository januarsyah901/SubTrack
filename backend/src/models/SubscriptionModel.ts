import { db } from "../database/connection.js";
import { Subscription } from "../models/types.js";

export class SubscriptionModel {
  static async getAll(): Promise<Subscription[]> {
    return db.getAllSubscriptions();
  }

  static async getById(id: string): Promise<Subscription | null> {
    return db.getSubscriptionById(id);
  }

  static async create(
    subscription: Omit<Subscription, "created_at" | "updated_at">,
  ): Promise<Subscription> {
    return db.createSubscription(subscription);
  }

  static async update(
    id: string,
    subscription: Partial<Subscription>,
  ): Promise<Subscription | null> {
    return db.updateSubscription(id, subscription);
  }

  static async delete(id: string): Promise<boolean> {
    return db.deleteSubscription(id);
  }

  static async getByBillingDate(date: number): Promise<Subscription[]> {
    return db.getSubscriptionsByDate(date);
  }

  static async getMonthlyTotal(): Promise<number> {
    return db.getMonthlyTotal();
  }
}
