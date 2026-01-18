export enum BillingCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cycle: BillingCycle;
  billing_date: number;
  category: string;
  icon: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

export interface InsightReport {
  summary: string;
  savingsOpportunities: string[];
  totalProjected: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
