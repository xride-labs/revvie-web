export type ExpenseCategory =
  | 'FUEL'
  | 'SERVICING'
  | 'FOOD'
  | 'ACCOMMODATION'
  | 'OTHER'

export type ExpenseSplitStatus = 'PENDING' | 'SETTLED'

export interface ExpenseSplitUser {
  id: string
  name?: string | null
  avatar?: string | null
  username?: string | null
}

export interface ExpenseSplit {
  id: string
  expenseId: string
  userId: string
  amountPaise: number
  status: ExpenseSplitStatus
  settledAt?: string | null
  createdAt: string
  user?: ExpenseSplitUser
  expense?: Expense & {
    creator?: ExpenseSplitUser
  }
}

export interface Expense {
  id: string
  creatorId: string
  amountPaise: number
  currency: string
  category: ExpenseCategory
  description?: string | null
  date: string
  rideId?: string | null
  clubId?: string | null
  createdAt: string
  updatedAt: string
  splits?: ExpenseSplit[]
  creator?: ExpenseSplitUser
}

export interface CreateExpenseSplitInput {
  userId: string
  amountPaise: number
}

export interface CreateExpenseInput {
  amountPaise: number
  category: ExpenseCategory
  description?: string
  date?: string
  rideId?: string
  clubId?: string
  splits?: CreateExpenseSplitInput[]
}

export type GetExpensesParams = {
  month?: number
  year?: number
  category?: ExpenseCategory
  [key: string]: string | number | boolean | undefined
}

export interface ExpenseSplitsResponse {
  owedByMe: ExpenseSplit[]
  owedToMe: ExpenseSplit[]
}
