export type MaritalStatus = 'single' | 'married';

export interface UserProfile {
  id: string;
  householdId: string;
  maritalStatus: MaritalStatus | null;
  dependents: number | null;
  monthlyLivingExpenseEstimate: number | null;
  emergencyFundTarget: number | null;
  emergencyFundTargetOverride: number | null;
  emergencyFundTargetOverridden: boolean;
}

export interface FinancialGoal {
  id: string;
  householdId: string;
  goalType: 'emergency' | 'sinking' | 'savings' | 'debt';
  name: string;
  targetAmount: number;
  currentAmount: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyFundState {
  profile: UserProfile | null;
  emergencyGoal: FinancialGoal | null;
  totalFunds: number;
  isLoading: boolean;
  error: string | null;
}

export interface EmergencyFundSetupInput {
  maritalStatus: MaritalStatus;
  dependents: number;
  monthlyLivingExpenseEstimate: number;
}

export interface EmergencyFundContributionInput {
  goalId: string;
  amount: number;
  type: 'add' | 'withdraw';
}
