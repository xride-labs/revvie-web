import { expensesApi } from '@/core/store/api/services'
import { EXPENSE_ENDPOINTS } from './endpoints'
import type {
  CreateExpenseInput,
  Expense,
  ExpenseSplitsResponse,
  GetExpensesParams,
} from './schemas'

export const expensesApiSlice = expensesApi.injectEndpoints({
  endpoints: (build) => ({
    getExpenses: build.query<Expense[], GetExpensesParams | void>({
      query: (params) => ({
        url: EXPENSE_ENDPOINTS.list,
        params: params || undefined,
      }),
      providesTags: [{ type: 'ExpenseList', id: 'LIST' }],
    }),

    createExpense: build.mutation<Expense, CreateExpenseInput>({
      query: (data) => ({
        url: EXPENSE_ENDPOINTS.create,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'ExpenseList', id: 'LIST' },
        { type: 'ExpenseSplit', id: 'SPLITS' },
      ],
    }),

    getExpenseSplits: build.query<ExpenseSplitsResponse, void>({
      query: () => ({
        url: EXPENSE_ENDPOINTS.splits,
      }),
      providesTags: [{ type: 'ExpenseSplit', id: 'SPLITS' }],
    }),

    settleExpenseSplit: build.mutation<{ id: string; status: string }, string>({
      query: (splitId) => ({
        url: EXPENSE_ENDPOINTS.settleSplit(splitId),
        method: 'PATCH',
      }),
      invalidatesTags: [
        { type: 'ExpenseSplit', id: 'SPLITS' },
        { type: 'ExpenseList', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetExpenseSplitsQuery,
  useSettleExpenseSplitMutation,
} = expensesApiSlice
