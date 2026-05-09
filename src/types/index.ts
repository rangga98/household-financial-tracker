export interface Household {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  householdId: string;
  name: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  householdId: string;
  name: string;
  type: 'fixed' | 'variable';
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  householdId: string;
  userId: string;
  categoryId: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  transactionDate: Date;
  isScheduled: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    name: string;
    type: 'fixed' | 'variable';
    icon?: string;
    color?: string;
  };
  user?: {
    name: string;
  };
}

export interface Balance {
  balance: number;
  totalIn: number;
  totalOut: number;
}

export interface TransactionInput {
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  description?: string;
  transactionDate?: string;
}

export interface TransactionFilters {
  userId?: string;
  startDate?: string;
  endDate?: string;
  categoryType?: 'fixed' | 'variable';
  limit?: number;
  offset?: number;
}
