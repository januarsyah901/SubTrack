import { getPool } from "../database/connection.js";
import { Subscription } from "../models/types.js";

export class SubscriptionModel {
  static async getAll(): Promise<Subscription[]> {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT * FROM subscriptions ORDER BY billing_date ASC",
    );
    return rows as Subscription[];
  }

  static async getById(id: string): Promise<Subscription | null> {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT * FROM subscriptions WHERE id = ?",
      [id],
    );
    const results = rows as Subscription[];
    return results.length > 0 ? results[0] : null;
  }

  static async create(
    subscription: Omit<Subscription, "created_at" | "updated_at">,
  ): Promise<Subscription> {
    const pool = getPool();
    const { id, name, amount, cycle, billing_date, category, icon, color } =
      subscription;

    await pool.execute(
      "INSERT INTO subscriptions (id, name, amount, cycle, billing_date, category, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id, name, amount, cycle, billing_date, category, icon, color],
    );

    return this.getById(id) as Promise<Subscription>;
  }

  static async update(
    id: string,
    subscription: Partial<Subscription>,
  ): Promise<Subscription | null> {
    const pool = getPool();
    const updates: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(subscription)) {
      if (
        key !== "id" &&
        key !== "created_at" &&
        key !== "updated_at" &&
        value !== undefined
      ) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE subscriptions SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    return this.getById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const pool = getPool();
    const [result] = await pool.execute(
      "DELETE FROM subscriptions WHERE id = ?",
      [id],
    );
    return (result as any).affectedRows > 0;
  }

  static async getByBillingDate(date: number): Promise<Subscription[]> {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT * FROM subscriptions WHERE billing_date = ? ORDER BY name ASC",
      [date],
    );
    return rows as Subscription[];
  }

  static async getMonthlyTotal(): Promise<number> {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT SUM(CASE 
        WHEN cycle = 'MONTHLY' THEN amount 
        WHEN cycle = 'YEARLY' THEN amount / 12 
        ELSE 0 
      END) as total FROM subscriptions`,
    );
    const total = (rows as any[])[0].total || 0;
    return parseFloat(total);
  }
}
