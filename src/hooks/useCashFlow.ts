import { create } from 'zustand'
import type { Profile, Transaction, Category, Balance } from '@/types'

interface CashFlowState {
  // Current user
  currentUserId: string | null
  currentUser: Profile | null
  users: Profile[]
  
  // Household
  householdId: string | null
  
  // Data
  transactions: Transaction[]
  categories: Category[]
  balance: Balance | null
  
  // Filters
  userFilter: string | null
  categoryTypeFilter: 'fixed' | 'variable' | null
  
  // Actions
  setCurrentUser: (userId: string) => void
  setUsers: (users: Profile[]) => void
  setHouseholdId: (id: string) => void
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  setCategories: (categories: Category[]) => void
  setBalance: (balance: Balance) => void
  setUserFilter: (userId: string | null) => void
  setCategoryTypeFilter: (type: 'fixed' | 'variable' | null) => void
}

export const useCashFlowStore = create<CashFlowState>((set) => ({
  currentUserId: null,
  currentUser: null,
  users: [],
  householdId: null,
  transactions: [],
  categories: [],
  balance: null,
  userFilter: null,
  categoryTypeFilter: null,

  setCurrentUser: (userId) =>
    set((state) => ({
      currentUserId: userId,
      currentUser: state.users.find((u) => u.id === userId) || null,
    })),

  setUsers: (users) =>
    set((state) => ({
      users,
      currentUser: users.length > 0 
        ? (state.currentUserId 
            ? users.find((u) => u.id === state.currentUserId) || users[0]
            : users[0])
        : null,
      currentUserId: state.currentUserId || (users.length > 0 ? users[0].id : null),
    })),

  setHouseholdId: (id) => set({ householdId: id }),

  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  setCategories: (categories) => set({ categories }),

  setBalance: (balance) => set({ balance }),

  setUserFilter: (userId) => set({ userFilter: userId }),

  setCategoryTypeFilter: (type) => set({ categoryTypeFilter: type }),
}))
