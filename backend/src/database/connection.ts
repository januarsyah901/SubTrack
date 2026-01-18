// In-memory storage for subscriptions (no MySQL required)
import { Subscription, BillingCycle } from "../models/types.js";

// In-memory data store
let subscriptions: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    amount: 15.99,
    cycle: BillingCycle.MONTHLY,
    billing_date: 2,
    category: "Entertainment",
    icon: "fa-brands fa-netflix",
    color: "#E50914",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Spotify",
    amount: 9.99,
    cycle: BillingCycle.MONTHLY,
    billing_date: 4,
    category: "Music",
    icon: "fa-solid fa-music",
    color: "#1DB954",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Adobe CC",
    amount: 52.99,
    cycle: BillingCycle.MONTHLY,
    billing_date: 7,
    category: "Design",
    icon: "fa-brands fa-adobe",
    color: "#FF0000",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "iCloud+",
    amount: 0.99,
    cycle: BillingCycle.MONTHLY,
    billing_date: 12,
    category: "Storage",
    icon: "fa-brands fa-apple",
    color: "#FFFFFF",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Dropbox",
    amount: 120.0,
    cycle: BillingCycle.YEARLY,
    billing_date: 10,
    category: "Storage",
    icon: "fa-brands fa-dropbox",
    color: "#0061FF",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "YouTube Premium",
    amount: 11.99,
    cycle: BillingCycle.MONTHLY,
    billing_date: 15,
    category: "Entertainment",
    icon: "fa-brands fa-youtube",
    color: "#FF0000",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "7",
    name: "ChatGPT Plus",
    amount: 20.0,
    cycle: BillingCycle.MONTHLY,
    billing_date: 20,
    category: "AI Tools",
    icon: "fa-solid fa-robot",
    color: "#10A37F",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Initialize function (no-op for in-memory)
export async function initializeDatabase(): Promise<void> {
  console.log("✓ In-memory database initialized with sample data");
  return Promise.resolve();
}

// In-memory database operations
export const db = {
  getAllSubscriptions: (): Subscription[] => {
    return [...subscriptions].sort((a, b) => a.billing_date - b.billing_date);
  },

  getSubscriptionById: (id: string): Subscription | null => {
    return subscriptions.find((s) => s.id === id) || null;
  },

  getSubscriptionsByDate: (date: number): Subscription[] => {
    return subscriptions.filter((s) => s.billing_date === date);
  },

  createSubscription: (
    data: Omit<Subscription, "created_at" | "updated_at">,
  ): Subscription => {
    const newSub: Subscription = {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    subscriptions.push(newSub);
    return newSub;
  },

  updateSubscription: (
    id: string,
    data: Partial<Subscription>,
  ): Subscription | null => {
    const index = subscriptions.findIndex((s) => s.id === id);
    if (index === -1) return null;

    subscriptions[index] = {
      ...subscriptions[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return subscriptions[index];
  },

  deleteSubscription: (id: string): boolean => {
    const index = subscriptions.findIndex((s) => s.id === id);
    if (index === -1) return false;
    subscriptions.splice(index, 1);
    return true;
  },

  getMonthlyTotal: (): number => {
    return subscriptions.reduce((total, sub) => {
      if (sub.cycle === BillingCycle.MONTHLY) {
        return total + sub.amount;
      }
      return total + sub.amount / 12;
    }, 0);
  },
};

export async function closeDatabase(): Promise<void> {
  console.log("✓ Database connection closed");
  return Promise.resolve();
}
