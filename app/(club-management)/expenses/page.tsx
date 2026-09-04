'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Receipt,
  Plus,
  Fuel,
  Wrench,
  Utensils,
  Hotel,
  Tag,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Search,
  Sparkles,
  X,
  IndianRupee,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useGetExpenseSplitsQuery,
  useSettleExpenseSplitMutation,
} from '@/features/expenses/api'
import type { ExpenseCategory, CreateExpenseSplitInput } from '@/features/expenses/schemas'

const CATEGORIES: { key: ExpenseCategory | 'ALL'; label: string; icon: any; color: string }[] = [
  { key: 'ALL', label: 'All Categories', icon: Receipt, color: 'text-zinc-400' },
  { key: 'FUEL', label: 'Fuel & Gas', icon: Fuel, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { key: 'SERVICING', label: 'Service & Repairs', icon: Wrench, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { key: 'FOOD', label: 'Food & Refreshments', icon: Utensils, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { key: 'ACCOMMODATION', label: 'Hotels & Stay', icon: Hotel, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { key: 'OTHER', label: 'Gear & Miscellaneous', icon: Tag, color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30' },
]

function getCategoryMeta(cat: ExpenseCategory) {
  const match = CATEGORIES.find((c) => c.key === cat)
  return match || CATEGORIES[5]
}

function formatINR(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(rupees)
}

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'splits'>('expenses')
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  // API queries
  const {
    data: expenses = [],
    isLoading: isExpensesLoading,
    refetch: refetchExpenses,
  } = useGetExpensesQuery({
    category: categoryFilter === 'ALL' ? undefined : categoryFilter,
    month: selectedMonth,
  })

  const {
    data: splitsData,
    isLoading: isSplitsLoading,
    refetch: refetchSplits,
  } = useGetExpenseSplitsQuery()

  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation()
  const [settleSplit, { isLoading: isSettling }] = useSettleExpenseSplitMutation()

  // Form state
  const [amountInput, setAmountInput] = useState('')
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('FUEL')
  const [descriptionInput, setDescriptionInput] = useState('')
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0])
  const [splitWithRiders, setSplitWithRiders] = useState<CreateExpenseSplitInput[]>([])
  const [newSplitUserId, setNewSplitUserId] = useState('')
  const [newSplitAmount, setNewSplitAmount] = useState('')

  // Calculate totals
  const totalSpentPaise = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amountPaise, 0)
  }, [expenses])

  const owedToMePaise = useMemo(() => {
    if (!splitsData?.owedToMe) return 0
    return splitsData.owedToMe
      .filter((s) => s.status === 'PENDING')
      .reduce((sum, s) => sum + s.amountPaise, 0)
  }, [splitsData])

  const owedByMePaise = useMemo(() => {
    if (!splitsData?.owedByMe) return 0
    return splitsData.owedByMe
      .filter((s) => s.status === 'PENDING')
      .reduce((sum, s) => sum + s.amountPaise, 0)
  }, [splitsData])

  // Filter expenses by search query
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses
    const q = searchQuery.toLowerCase()
    return expenses.filter(
      (e) =>
        e.description?.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    )
  }, [expenses, searchQuery])

  // Handle Log Expense submission
  const handleLogExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountVal = parseFloat(amountInput)
    if (!amountVal || amountVal <= 0) {
      toast.error('Please enter a valid expense amount in ₹')
      return
    }

    const amountPaise = Math.round(amountVal * 100)

    try {
      await createExpense({
        amountPaise,
        category: formCategory,
        description: descriptionInput.trim() || undefined,
        date: dateInput ? new Date(dateInput).toISOString() : new Date().toISOString(),
        splits: splitWithRiders.length > 0 ? splitWithRiders : undefined,
      }).unwrap()

      toast.success('Expense recorded successfully!')
      setIsLogModalOpen(false)
      setAmountInput('')
      setDescriptionInput('')
      setSplitWithRiders([])
      refetchExpenses()
      refetchSplits()
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to record expense.')
    }
  }

  // Handle adding a split user
  const handleAddSplit = () => {
    if (!newSplitUserId.trim() || !newSplitAmount) return
    const amt = parseFloat(newSplitAmount)
    if (isNaN(amt) || amt <= 0) return

    setSplitWithRiders((prev) => [
      ...prev,
      {
        userId: newSplitUserId.trim(),
        amountPaise: Math.round(amt * 100),
      },
    ])
    setNewSplitUserId('')
    setNewSplitAmount('')
  }

  // Handle Settle Split
  const handleSettle = async (splitId: string) => {
    try {
      await settleSplit(splitId).unwrap()
      toast.success('Split marked as settled!')
      refetchSplits()
      refetchExpenses()
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to settle split.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white font-[Josefin_Sans]">
                Motorcycle Expenses & Splits
              </h1>
              <span className="bg-red-500/20 text-red-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">
              Log ride fuel, maintenance, servicing, meals, and easily split expenses with fellow club riders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchExpenses()
                refetchSplits()
              }}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 px-3.5 py-2.5 rounded-xl font-medium text-xs transition"
              title="Refresh Expenses"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-red-950/40 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Spent */}
          <div className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Total Recorded</span>
              <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                {formatINR(totalSpentPaise)}
              </span>
              <p className="text-[11px] text-zinc-500 mt-1">
                Across {expenses.length} logged motorcycle {expenses.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          {/* Card 2: You Are Owed */}
          <div className="bg-gradient-to-br from-emerald-950/20 to-white/[0.02] border border-emerald-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">You Are Owed</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-bold text-emerald-300 tracking-tight">
                {formatINR(owedToMePaise)}
              </span>
              <p className="text-[11px] text-zinc-400 mt-1">
                From riders pending settlement
              </p>
            </div>
          </div>

          {/* Card 3: You Owe */}
          <div className="bg-gradient-to-br from-amber-950/20 to-white/[0.02] border border-amber-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">You Owe</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-bold text-amber-300 tracking-tight">
                {formatINR(owedByMePaise)}
              </span>
              <p className="text-[11px] text-zinc-400 mt-1">
                To ride buddies & club members
              </p>
            </div>
          </div>

          {/* Card 4: Fuel & Servicing Dominance */}
          <div className="bg-gradient-to-br from-cyan-950/20 to-white/[0.02] border border-cyan-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Active Splits</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                {(splitsData?.owedByMe?.length || 0) + (splitsData?.owedToMe?.length || 0)}
              </span>
              <p className="text-[11px] text-zinc-500 mt-1">
                Total shared group transactions
              </p>
            </div>
          </div>
        </div>

        {/* View Selection Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>All Expenses ({expenses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('splits')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'splits'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Splits Tracker</span>
              {(owedToMePaise > 0 || owedByMePaise > 0) && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          </div>

          {activeTab === 'expenses' && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setCategoryFilter(cat.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap cursor-pointer ${
                      categoryFilter === cat.key
                        ? 'bg-white/15 border-white/30 text-white'
                        : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Expenses List */}
        {activeTab === 'expenses' && (
          <div>
            {isExpensesLoading ? (
              <div className="py-20 text-center">
                <div className="inline-block animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
                <p className="text-zinc-500 text-sm mt-3">Loading expenses...</p>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-16 text-center max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mx-auto mb-4">
                  <Receipt className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No Expenses Found</h3>
                <p className="text-zinc-400 text-xs mb-6">
                  {searchQuery || categoryFilter !== 'ALL'
                    ? 'No matching expenses found for this filter.'
                    : 'Start tracking your motorcycle fuel, servicing, gear, and ride split expenses.'}
                </p>
                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer"
                >
                  Log Your First Expense
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map((expense) => {
                  const meta = getCategoryMeta(expense.category)
                  const Icon = meta.icon
                  const dateObj = new Date(expense.date)
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })

                  return (
                    <div
                      key={expense.id}
                      className="bg-gradient-to-r from-white/[0.04] to-white/[0.01] hover:from-white/[0.07] hover:to-white/[0.03] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${meta.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-white">
                              {expense.description || meta.label}
                            </h4>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-400">
                              {meta.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                            <span>{formattedDate}</span>
                            {expense.splits && expense.splits.length > 0 && (
                              <span className="flex items-center gap-1 text-cyan-400">
                                <Users className="w-3 h-3" />
                                <span>Split with {expense.splits.length} {expense.splits.length === 1 ? 'rider' : 'riders'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="text-base lg:text-lg font-bold text-white tracking-tight">
                            {formatINR(expense.amountPaise)}
                          </span>
                          {expense.splits && expense.splits.length > 0 && (
                            <p className="text-[10px] text-zinc-400">
                              Your share: {formatINR(expense.amountPaise - expense.splits.reduce((s, x) => s + x.amountPaise, 0))}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Splits Tracker */}
        {activeTab === 'splits' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Owed by Me (I need to pay) */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Splits You Owe</h3>
                    <p className="text-zinc-500 text-xs">Amounts requested by other ride buddies</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  {formatINR(owedByMePaise)} Pending
                </span>
              </div>

              {isSplitsLoading ? (
                <p className="text-xs text-zinc-500 text-center py-8">Loading split items...</p>
              ) : !splitsData?.owedByMe || splitsData.owedByMe.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                  <span>You don&apos;t owe any splits to anyone right now. Clean slate!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {splitsData.owedByMe.map((split) => {
                    const isPending = split.status === 'PENDING'
                    return (
                      <div
                        key={split.id}
                        className={`p-4 rounded-2xl border transition ${
                          isPending
                            ? 'bg-amber-950/10 border-amber-500/20'
                            : 'bg-white/[0.02] border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs text-zinc-400">
                              Owed to <strong className="text-white">{split.expense?.creator?.name || 'Ride Host'}</strong>
                            </span>
                            <h4 className="font-medium text-sm text-white mt-0.5">
                              {split.expense?.description || split.expense?.category || 'Ride Expense'}
                            </h4>
                            <span className="text-[10px] text-zinc-500">
                              Requested on {new Date(split.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="text-right flex flex-col items-end gap-2">
                            <span className="text-sm font-bold text-amber-300">
                              {formatINR(split.amountPaise)}
                            </span>
                            {isPending ? (
                              <button
                                onClick={() => handleSettle(split.id)}
                                disabled={isSettling}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow cursor-pointer"
                              >
                                Mark Settled
                              </button>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Settled</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Owed to Me (People who owe me) */}
            <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Splits Owed to You</h3>
                    <p className="text-zinc-500 text-xs">Reimbursements from friends for your paid bills</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  {formatINR(owedToMePaise)} Pending
                </span>
              </div>

              {isSplitsLoading ? (
                <p className="text-xs text-zinc-500 text-center py-8">Loading split items...</p>
              ) : !splitsData?.owedToMe || splitsData.owedToMe.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <span>No one currently owes you for split expenses.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {splitsData.owedToMe.map((split) => {
                    const isPending = split.status === 'PENDING'
                    return (
                      <div
                        key={split.id}
                        className={`p-4 rounded-2xl border transition ${
                          isPending
                            ? 'bg-emerald-950/10 border-emerald-500/20'
                            : 'bg-white/[0.02] border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs text-zinc-400">
                              Owed by <strong className="text-white">{split.user?.name || split.user?.username || 'Rider'}</strong>
                            </span>
                            <h4 className="font-medium text-sm text-white mt-0.5">
                              {split.expense?.description || split.expense?.category || 'Ride Expense'}
                            </h4>
                            <span className="text-[10px] text-zinc-500">
                              Split recorded on {new Date(split.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="text-right flex flex-col items-end gap-2">
                            <span className="text-sm font-bold text-emerald-300">
                              {formatINR(split.amountPaise)}
                            </span>
                            {isPending ? (
                              <button
                                onClick={() => handleSettle(split.id)}
                                disabled={isSettling}
                                className="bg-white/10 hover:bg-white/20 text-zinc-300 border border-white/15 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                              >
                                Mark Received
                              </button>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Settled</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Log New Expense */}
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#121215] border border-white/15 rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-xl font-bold text-white font-[Josefin_Sans]">Log Motorcycle Expense</h3>
                <p className="text-zinc-400 text-xs mt-1">Record a ride cost, service invoice, or split a meal with buddies.</p>
              </div>

              <form onSubmit={handleLogExpense} className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Amount (₹ INR) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-base">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      placeholder="e.g. 1250"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-base font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                {/* Category Selector */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-2">Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.filter((c) => c.key !== 'ALL').map((c) => {
                      const Icon = c.icon
                      const isSelected = formCategory === c.key
                      return (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setFormCategory(c.key as ExpenseCategory)}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition cursor-pointer ${
                            isSelected
                              ? 'bg-red-600/20 border-red-500 text-white font-semibold'
                              : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-red-400' : 'text-zinc-500'}`} />
                          <span className="text-[11px] leading-tight">{c.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Shell Petrol bunk near highway toll"
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Split Builder Section */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Split with Other Riders</span>
                    </label>
                    <span className="text-[10px] text-zinc-500">Optional</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Rider User ID or username"
                      value={newSplitUserId}
                      onChange={(e) => setNewSplitUserId(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition"
                    />
                    <input
                      type="number"
                      placeholder="₹ Share"
                      value={newSplitAmount}
                      onChange={(e) => setNewSplitAmount(e.target.value)}
                      className="w-24 bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddSplit}
                      className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  {splitWithRiders.length > 0 && (
                    <div className="space-y-1.5">
                      {splitWithRiders.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-xs">
                          <span className="text-zinc-300">{s.userId}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-cyan-300">₹{s.amountPaise / 100}</span>
                            <button
                              type="button"
                              onClick={() => setSplitWithRiders(prev => prev.filter((_, i) => i !== idx))}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-red-950/40 transition disabled:opacity-50 cursor-pointer"
                  >
                    {isCreating ? 'Recording Expense...' : 'Save Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
