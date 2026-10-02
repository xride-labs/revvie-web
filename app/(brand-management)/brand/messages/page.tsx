'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MessageSquare,
  Search,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  RefreshCw,
  User,
  Filter,
} from 'lucide-react'
import { useBusinessContext } from '@/contexts/business-context'
import {
  useGetBusinessInquiriesQuery,
  useUpdateInquiryStatusMutation,
} from '@/features/business/api'
import type { BusinessInquiry } from '@/features/business/schemas'
import { formatRelativeTime, useNow } from '@/shared/lib/relative-time'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type InquiryFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

const STATUS_CONFIG: Record<
  BusinessInquiry['status'],
  { label: string; bg: string; text: string; border: string }
> = {
  OPEN: {
    label: 'Open',
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/20',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  RESOLVED: {
    label: 'Resolved',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-neutral-800',
    text: 'text-neutral-400',
    border: 'border-[#3a3a3c]',
  },
}

export default function BrandMessagesPage() {
  const now = useNow()
  const { business, loading: businessLoading } = useBusinessContext()
  const businessId = business?.id ?? ''

  const {
    data: inquiries = [],
    isLoading: inquiriesLoading,
    refetch,
  } = useGetBusinessInquiriesQuery(businessId, {
    skip: !businessId,
  })

  const [updateStatus, { isLoading: isUpdating }] = useUpdateInquiryStatusMutation()

  const [activeFilter, setActiveFilter] = useState<InquiryFilter>('ALL')
  const [search, setSearch] = useState('')
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null)

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      const matchesFilter =
        activeFilter === 'ALL' ? true : inquiry.status === activeFilter

      const matchesSearch =
        !search.trim() ||
        inquiry.subject.toLowerCase().includes(search.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(search.toLowerCase()) ||
        (inquiry.fromUser?.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (inquiry.fromUser?.email?.toLowerCase().includes(search.toLowerCase()) ?? false)

      return matchesFilter && matchesSearch
    })
  }, [inquiries, activeFilter, search])

  const selectedInquiry = useMemo(() => {
    return inquiries.find((i) => i.id === selectedInquiryId) ?? null
  }, [inquiries, selectedInquiryId])

  const handleStatusChange = async (
    inquiryId: string,
    newStatus: BusinessInquiry['status'],
  ) => {
    if (!businessId) return
    try {
      await updateStatus({
        businessId,
        inquiryId,
        data: { status: newStatus },
      }).unwrap()
      toast.success(`Inquiry marked as ${newStatus.replace('_', ' ').toLowerCase()}`)
    } catch {
      toast.error('Failed to update inquiry status')
    }
  }

  const formatTime = (iso?: string) => formatRelativeTime(iso, now)

  const counts = useMemo(() => {
    return {
      ALL: inquiries.length,
      OPEN: inquiries.filter((i) => i.status === 'OPEN').length,
      IN_PROGRESS: inquiries.filter((i) => i.status === 'IN_PROGRESS').length,
      RESOLVED: inquiries.filter((i) => i.status === 'RESOLVED').length,
      CLOSED: inquiries.filter((i) => i.status === 'CLOSED').length,
    }
  }, [inquiries])

  if (businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Clock className="w-8 h-8 animate-spin text-[#ff1d2d]" />
          <p className="text-sm font-mono text-neutral-400">Loading business inquiries...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Active Business Profile</h2>
        <p className="text-sm text-neutral-400">
          Please select or register a business profile to view customer inquiries.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 h-[calc(100vh-64px)] flex flex-col gap-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#ff1d2d]" />
            Customer Inquiries
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            Rider inquiries and direct communications for {business.displayName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={inquiriesLoading}
            className="border-[#3a3a3c] bg-[#1c1c1e] text-white hover:bg-neutral-800 gap-1.5"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', inquiriesLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left List Pane */}
        <Card
          className={cn(
            'flex flex-col w-full lg:w-96 shrink-0 border-[#3a3a3c] bg-[#1c1c1e]/60 backdrop-blur-xl',
            selectedInquiry ? 'hidden lg:flex' : 'flex',
          )}
        >
          {/* Filter & Search Bar */}
          <div className="p-3 border-b border-[#3a3a3c] space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                className="pl-9 bg-[#0d0d0f] border-[#3a3a3c] text-white text-xs h-9 focus-visible:ring-[#ff1d2d]"
                placeholder="Search by rider, email or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as InquiryFilter[]).map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition-colors flex items-center gap-1.5',
                      activeFilter === filter
                        ? 'bg-[#ff1d2d] text-white font-medium'
                        : 'bg-[#2c2c2e] text-neutral-400 hover:text-white hover:bg-neutral-700',
                    )}
                  >
                    <span>{filter.replace('_', ' ')}</span>
                    <span className="text-[10px] opacity-75">({counts[filter]})</span>
                  </button>
                ),
              )}
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#3a3a3c]/50">
            {inquiriesLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-neutral-400">
                <Clock className="w-6 h-6 animate-spin text-[#ff1d2d]" />
                <p className="text-xs font-mono">Fetching inquiries...</p>
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <MessageSquare className="w-10 h-10 text-neutral-600 mb-2" />
                <p className="text-sm text-neutral-300 font-medium">No inquiries found</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {search || activeFilter !== 'ALL'
                    ? 'Try adjusting your search query or filter'
                    : 'When riders send an inquiry to your business, they appear here.'}
                </p>
              </div>
            ) : (
              filteredInquiries.map((inquiry) => {
                const isSelected = selectedInquiryId === inquiry.id
                const statusStyle = STATUS_CONFIG[inquiry.status]
                const senderName = inquiry.fromUser?.name || 'Rider'
                const initials = senderName.charAt(0).toUpperCase()

                return (
                  <button
                    key={inquiry.id}
                    onClick={() => setSelectedInquiryId(inquiry.id)}
                    className={cn(
                      'w-full text-left p-3.5 transition-colors flex items-start gap-3 hover:bg-white/[0.03]',
                      isSelected && 'bg-white/[0.05] border-l-2 border-l-[#ff1d2d]',
                    )}
                  >
                    <Avatar className="w-9 h-9 border border-[#3a3a3c] shrink-0 mt-0.5">
                      {inquiry.fromUser?.avatar && (
                        <AvatarImage src={inquiry.fromUser.avatar} alt={senderName} />
                      )}
                      <AvatarFallback className="bg-neutral-800 text-neutral-200 text-xs font-mono">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-white truncate">
                          {senderName}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                          {formatTime(inquiry.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-neutral-200 truncate mb-1">
                        {inquiry.subject}
                      </p>

                      <p className="text-[11px] text-neutral-400 line-clamp-2">
                        {inquiry.message}
                      </p>

                      <div className="mt-2 flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-1.5 py-0 font-mono uppercase tracking-wider',
                            statusStyle.bg,
                            statusStyle.text,
                            statusStyle.border,
                          )}
                        >
                          {statusStyle.label}
                        </Badge>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </Card>

        {/* Right Detail Pane */}
        {selectedInquiry ? (
          <Card className="flex-1 flex flex-col border-[#3a3a3c] bg-[#1c1c1e]/60 backdrop-blur-xl overflow-hidden">
            {/* Thread Header */}
            <div className="p-4 border-b border-[#3a3a3c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-[#161618]">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-neutral-400 hover:text-white"
                  onClick={() => setSelectedInquiryId(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>

                <Avatar className="w-10 h-10 border border-[#3a3a3c]">
                  {selectedInquiry.fromUser?.avatar && (
                    <AvatarImage
                      src={selectedInquiry.fromUser.avatar}
                      alt={selectedInquiry.fromUser?.name || 'Rider'}
                    />
                  )}
                  <AvatarFallback className="bg-neutral-800 text-[#ff1d2d] text-sm font-bold font-mono">
                    {(selectedInquiry.fromUser?.name || 'R').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    {selectedInquiry.fromUser?.name || 'Anonymous Rider'}
                  </h2>
                  <p className="text-xs text-neutral-400 font-mono">
                    {selectedInquiry.fromUser?.email || 'No email provided'}
                  </p>
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-mono">Status:</span>
                <Select
                  value={selectedInquiry.status}
                  disabled={isUpdating}
                  onValueChange={(val) =>
                    handleStatusChange(
                      selectedInquiry.id,
                      val as BusinessInquiry['status'],
                    )
                  }
                >
                  <SelectTrigger className="w-[140px] h-8 bg-[#0d0d0f] border-[#3a3a3c] text-xs font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1c1e] border-[#3a3a3c] text-white">
                    <SelectItem value="OPEN" className="text-primary">
                      Open
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS" className="text-blue-400">
                      In Progress
                    </SelectItem>
                    <SelectItem value="RESOLVED" className="text-emerald-400">
                      Resolved
                    </SelectItem>
                    <SelectItem value="CLOSED" className="text-neutral-400">
                      Closed
                    </SelectItem>
                  </SelectContent>
                </Select>

                {selectedInquiry.fromUser?.email && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-[#2c2c2e] hover:bg-neutral-700 text-white text-xs gap-1.5 h-8"
                    asChild
                  >
                    <a
                      href={`mailto:${selectedInquiry.fromUser.email}?subject=Re: ${encodeURIComponent(
                        selectedInquiry.subject,
                      )}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#ff1d2d]" />
                      Reply via Email
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Subject and Metadata Banner */}
            <div className="px-6 py-4 border-b border-[#3a3a3c]/60 bg-white/[0.01]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-white">
                  {selectedInquiry.subject}
                </h3>
                <span className="text-xs text-neutral-500 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Received {new Date(selectedInquiry.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Inquiry Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="rounded-xl border border-[#3a3a3c] bg-[#0d0d0f] p-5 shadow-inner">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#2c2c2e]">
                  <User className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs font-mono text-neutral-400">
                    Message from{' '}
                    <strong className="text-white">
                      {selectedInquiry.fromUser?.name || 'Rider'}
                    </strong>
                  </span>
                </div>
                <div className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Status Management Quick Actions */}
              <div className="rounded-xl border border-[#3a3a3c] bg-[#1c1c1e]/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                    Workflow Actions
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs px-2 py-0.5 font-mono',
                      STATUS_CONFIG[selectedInquiry.status].bg,
                      STATUS_CONFIG[selectedInquiry.status].text,
                      STATUS_CONFIG[selectedInquiry.status].border,
                    )}
                  >
                    Current: {STATUS_CONFIG[selectedInquiry.status].label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedInquiry.status === 'OPEN' || isUpdating}
                    onClick={() => handleStatusChange(selectedInquiry.id, 'OPEN')}
                    className="border-[#3a3a3c] bg-[#0d0d0f] hover:bg-neutral-800 text-xs font-mono text-primary"
                  >
                    Mark Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedInquiry.status === 'IN_PROGRESS' || isUpdating}
                    onClick={() => handleStatusChange(selectedInquiry.id, 'IN_PROGRESS')}
                    className="border-[#3a3a3c] bg-[#0d0d0f] hover:bg-neutral-800 text-xs font-mono text-blue-400"
                  >
                    In Progress
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedInquiry.status === 'RESOLVED' || isUpdating}
                    onClick={() => handleStatusChange(selectedInquiry.id, 'RESOLVED')}
                    className="border-[#3a3a3c] bg-[#0d0d0f] hover:bg-neutral-800 text-xs font-mono text-emerald-400 gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedInquiry.status === 'CLOSED' || isUpdating}
                    onClick={() => handleStatusChange(selectedInquiry.id, 'CLOSED')}
                    className="border-[#3a3a3c] bg-[#0d0d0f] hover:bg-neutral-800 text-xs font-mono text-neutral-400"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center rounded-xl border border-[#3a3a3c] bg-[#1c1c1e]/30">
            <div className="text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-[#3a3a3c] flex items-center justify-center mx-auto mb-4 text-neutral-500">
                <MessageSquare className="w-7 h-7 text-[#ff1d2d]" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">
                Select an Inquiry
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm">
                Choose an inquiry from the list on the left to inspect customer details, reply directly, or manage workflow status.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

