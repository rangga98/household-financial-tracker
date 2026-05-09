# API Contracts: Cash Flow Tracker

**Phase**: 1 | **Date**: 2026-05-09 | **Feature**: Cash Flow Tracker

## Supabase Functions (Server Actions)

### 1. Create Transaction

```typescript
// Action: createTransaction
// Input: { type, amount, categoryId, description?, transactionDate? }
// Output: { data: Transaction, error: null } | { data: null, error: Error }

await createTransaction({
  type: 'expense',
  amount: 50000,
  categoryId: 'uuid-of-dining-out',
  description: 'Lunch with team',
  transactionDate: '2026-05-09'
})
```

### 2. Get Transactions

```typescript
// Action: getTransactions
// Input: { householdId, userId?, startDate?, endDate?, limit?, offset? }
// Output: { data: Transaction[], error: null }

await getTransactions({
  householdId: 'uuid',
  startDate: '2026-05-01',
  endDate: '2026-05-31',
  limit: 50
})
```

### 3. Get Balance

```typescript
// Action: getBalance
// Input: { householdId, asOfDate? }
// Output: { data: { balance: number, totalIn: number, totalOut: number }, error: null }

await getBalance({
  householdId: 'uuid',
  asOfDate: '2026-05-09'
})
```

### 4. Get Categories

```typescript
// Action: getCategories
// Input: { householdId, type?: 'fixed' | 'variable', includeInactive?: boolean }
// Output: { data: Category[], error: null }

await getCategories({
  householdId: 'uuid',
  type: 'variable'
})
```

### 5. Update Transaction

```typescript
// Action: updateTransaction
// Input: { id, updates: Partial<Transaction> }
// Output: { data: Transaction, error: null }

await updateTransaction({
  id: 'transaction-uuid',
  updates: { amount: 75000, description: 'Updated description' }
})
```

### 6. Delete Transaction

```typescript
// Action: deleteTransaction
// Input: { id }
// Output: { data: null, error: null }

await deleteTransaction({ id: 'transaction-uuid' })
```

## Real-Time Subscriptions

### Subscribe to Transaction Changes

```typescript
// Subscribe to all transaction changes for household
const channel = supabase
  .channel('household-transactions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'transactions',
    filter: `household_id=eq.${householdId}`
  }, (payload) => {
    // Handle: INSERT, UPDATE, DELETE
    console.log('Transaction changed:', payload)
  })
  .subscribe()
```

## Database Views (Optional)

### `household_balance` View

```sql
CREATE VIEW household_balance AS
SELECT 
  household_id,
  transaction_date,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_in,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_out,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as running_balance
FROM transactions
GROUP BY household_id, transaction_date;
```

## Error Handling

All actions return standardized response:

```typescript
interface ActionResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
}
```

Common error codes:
- `AUTH_REQUIRED` - User not authenticated
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `RLS_VIOLATION` - Permission denied
