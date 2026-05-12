export interface SinkingFund {
  id: string;
  householdId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SinkingFundContribution {
  id: string;
  goalId: string;
  amount: number;
  transactionDate: string;
  notes: string | null;
}

export interface EducationEstimate {
  currentCost: number;
  inflationRate: number;
  years: number;
  futureValue: number;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
