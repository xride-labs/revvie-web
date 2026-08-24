'use client'

import { useState, useMemo, type ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertTriangle,
  Flag,
  MessageSquare,
  User,
  ShoppingBag,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { useGetReportsQuery, useUpdateReportMutation } from '@/features/admin/api'
import { AdminCRUDPopover, CRUDActionBuilders } from '@/components/admin/crud-popover'
import type { AdminReportRecord } from '@/entities/admin/model'

const typeIcons: Record<string, LucideIcon> = {
  user: User,
  listing: ShoppingBag,
  club: Shield,
  message: MessageSquare,
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  investigating: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  dismissed: 'bg-gray-100 text-gray-700',
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-700',
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [viewReport, setViewReport] = useState<AdminReportRecord | null>(null)

  const queryParams = useMemo(
    () => (activeTab === 'all' ? undefined : { status: activeTab }),
    [activeTab],
  )
  const { data } = useGetReportsQuery(queryParams)
  const [updateReport] = useUpdateReportMutation()

  const reports = data?.items ?? []

  const handleUpdateReport = async (reportId: string, status: string) => {
    await updateReport({ reportId, data: { status } }).unwrap()
  }

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'pending').length,
    investigating: reports.filter((r) => r.status === 'investigating').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  }

  const filteredReports =
    activeTab === 'all' ? reports : reports.filter((r) => r.status === activeTab)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Flag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.investigating}</p>
                <p className="text-sm text-muted-foreground">Investigating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports & Moderation</CardTitle>
          <CardDescription>Review and handle user reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">
                Pending
                <Badge variant="secondary" className="ml-2">
                  {stats.pending}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="investigating">Investigating</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Reported Item</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const TypeIcon =
                    typeIcons[report.type as keyof typeof typeIcons] || AlertTriangle
                  return (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <TypeIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{report.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {report.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{report.reportedItem.name}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {report.reportedItem.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">
                              {report.reporter.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.reporter.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            priorityColors[report.priority as keyof typeof priorityColors]
                          }
                        >
                          {report.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColors[report.status as keyof typeof statusColors]
                          }
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(report.createdAt)}
                      </TableCell>
                      <TableCell>
                        <AdminCRUDPopover
                          actions={[
                            CRUDActionBuilders.view(() => setViewReport(report)),
                            ...(report.status === 'pending'
                              ? [
                                  CRUDActionBuilders.custom(
                                    'investigate',
                                    'Start Investigation',
                                    () => handleUpdateReport(report.id, 'investigating'),
                                    {
                                      icon: <AlertTriangle className="h-4 w-4" />,
                                    },
                                  ),
                                ]
                              : []),
                            CRUDActionBuilders.custom(
                              'resolve',
                              'Mark Resolved',
                              () => handleUpdateReport(report.id, 'resolved'),
                              {
                                icon: <CheckCircle className="h-4 w-4" />,
                              },
                            ),
                            CRUDActionBuilders.custom(
                              'dismiss',
                              'Dismiss',
                              () => handleUpdateReport(report.id, 'dismissed'),
                              {
                                icon: <XCircle className="h-4 w-4" />,
                              },
                            ),
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!viewReport}
        onOpenChange={(open) => {
          if (!open) setViewReport(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>Full details for this moderation report</DialogDescription>
          </DialogHeader>
          {viewReport && (
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg shrink-0">
                  {(() => {
                    const TypeIcon =
                      typeIcons[viewReport.type as keyof typeof typeIcons] ||
                      AlertTriangle
                    return <TypeIcon className="w-4 h-4 text-muted-foreground" />
                  })()}
                </div>
                <div>
                  <p className="font-semibold text-base">{viewReport.title}</p>
                  {viewReport.description && (
                    <p className="text-muted-foreground mt-1">{viewReport.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ReportField label="Status">
                  <Badge
                    className={
                      statusColors[viewReport.status as keyof typeof statusColors]
                    }
                  >
                    {viewReport.status}
                  </Badge>
                </ReportField>
                <ReportField label="Priority">
                  <Badge
                    className={
                      priorityColors[viewReport.priority as keyof typeof priorityColors]
                    }
                  >
                    {viewReport.priority}
                  </Badge>
                </ReportField>
                <ReportField label="Type">
                  <span className="font-medium capitalize">{viewReport.type}</span>
                </ReportField>
                <ReportField label="Date">
                  <span className="font-medium">{formatDate(viewReport.createdAt)}</span>
                </ReportField>
              </div>

              <div className="rounded-md border p-3 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Reported Item
                </p>
                <p className="font-medium">{viewReport.reportedItem.name}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {viewReport.reportedItem.id} · Type: {viewReport.reportedItem.type}
                </p>
              </div>

              <div className="rounded-md border p-3 space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Reported By
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {viewReport.reporter.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{viewReport.reporter.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {viewReport.reporter.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReportField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      {children}
    </div>
  )
}
