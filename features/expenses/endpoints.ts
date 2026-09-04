export const EXPENSE_ENDPOINTS = {
  list: '/expenses',
  create: '/expenses',
  splits: '/expenses/splits',
  settleSplit: (id: string) => `/expenses/splits/${id}/settle`,
} as const
