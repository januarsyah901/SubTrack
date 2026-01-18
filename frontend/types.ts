export enum BillingCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cycle: BillingCycle;
  billing_date: number; // Day of month (1-31)
  category: string;
  icon: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  subscriptions: Subscription[];
}

export interface InsightReport {
  summary: string;
  savingsOpportunities: string[];
  totalProjected: number;
}
