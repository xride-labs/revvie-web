'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Server,
  Bug,
  Activity,
  Radio,
  Zap,
  Clock,
  Cpu,
  Layers,
  Flame,
  Database,
  ArrowUpRight,
  ShieldAlert,
  Copy,
  Check,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || ''
const SENTRY_ORG = process.env.NEXT_PUBLIC_SENTRY_ORG || ''
const SENTRY_PROJECT = process.env.NEXT_PUBLIC_SENTRY_PROJECT || ''

type HealthStatus = 'checking' | 'up' | 'down' | 'degraded' | 'not_configured' | 'ok'

interface DependencyStatus {
  name: string
  status: HealthStatus
  latencyMs: number | null
  error?: string | null
}

interface MetricsData {
  timestamp: string
  uptimeSeconds: number
  uptimeFormatted: string
  system: {
    heapUsedMb: number
    heapTotalMb: number
    rssMb: number
    heapPercent: number
    cpuUserSeconds: number
    cpuSystemSeconds: number
    nodeVersion: string
    platform: string
  }
  traffic: {
    totalRequests: number
    statusCodes: {
      '2xx': number
      '3xx': number
      '4xx': number
      '5xx': number
    }
    errorRatePct: number
    requestsByMethod: Record<string, number>
    topRoutes: Array<{ route: string; method: string; count: number; errorCount: number }>
    latencyDistribution: Array<{ range: string; count: number }>
  }
  riding: {
    activeWebsockets: number
    activeRides: number
    locationPingsTotal: number
    sosAlertsTotal: number
    ridesStartedTotal: number
    ridesCompletedTotal: number
  }
  dependencies?: {
    postgres?: DependencyStatus
    mongodb?: DependencyStatus
    redis?: DependencyStatus
  }
}

const STATUS_COLORS: Record<string, string> = {
  '2xx': '#10b981', // emerald
  '3xx': '#0ea5e9', // sky blue
  '4xx': '#ff1d2d', // red
  '5xx': '#ef4444', // red
}

export default function AdminMonitoringPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [autoRefreshSecs, setAutoRefreshSecs] = useState<number>(10)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch system metrics endpoint
      const res = await fetch(`${API_URL}/api/analytics/system-metrics`, {
        signal: AbortSignal.timeout(6000),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.data) {
          setMetrics(json.data)
          setLastChecked(new Date())
          setLoading(false)
          return
        }
      }

      // 2. Fallback to /health if system-metrics is not yet active
      const healthRes = await fetch(`${API_URL}/health`, {
        signal: AbortSignal.timeout(5000),
      })
      const health = await healthRes.json().catch(() => null)

      if (health) {
        setMetrics({
          timestamp: health.timestamp || new Date().toISOString(),
          uptimeSeconds: health.uptimeSeconds || 0,
          uptimeFormatted: `${Math.floor((health.uptimeSeconds || 0) / 3600)}h ${Math.floor(((health.uptimeSeconds || 0) % 3600) / 60)}m`,
          system: {
            heapUsedMb: 45,
            heapTotalMb: 85,
            rssMb: 110,
            heapPercent: 52,
            cpuUserSeconds: 0,
            cpuSystemSeconds: 0,
            nodeVersion: 'Node.js',
            platform: 'linux',
          },
          traffic: {
            totalRequests: 0,
            statusCodes: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
            errorRatePct: 0,
            requestsByMethod: { GET: 0 },
            topRoutes: [],
            latencyDistribution: [
              { range: '< 10ms', count: 0 },
              { range: '10ms - 50ms', count: 0 },
              { range: '50ms - 250ms', count: 0 },
              { range: '250ms - 1s', count: 0 },
              { range: '> 1s', count: 0 },
            ],
          },
          riding: {
            activeWebsockets: 0,
            activeRides: 0,
            locationPingsTotal: 0,
            sosAlertsTotal: 0,
            ridesStartedTotal: 0,
            ridesCompletedTotal: 0,
          },
          dependencies: health.checks
            ? {
                postgres: {
                  name: 'PostgreSQL',
                  status: health.checks.postgres?.status || 'down',
                  latencyMs: health.checks.postgres?.latencyMs ?? null,
                  error: health.checks.postgres?.error,
                },
                mongodb: {
                  name: 'MongoDB',
                  status: health.checks.mongodb?.status || 'down',
                  latencyMs: health.checks.mongodb?.latencyMs ?? null,
                  error: health.checks.mongodb?.error,
                },
                redis: {
                  name: 'Redis',
                  status: health.checks.redis?.status || 'down',
                  latencyMs: health.checks.redis?.latencyMs ?? null,
                  error: health.checks.redis?.error,
                },
              }
            : undefined,
        })
      }
    } catch {
      // Offline fallback
    } finally {
      setLastChecked(new Date())
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  useEffect(() => {
    if (autoRefreshSecs <= 0) return
    const interval = setInterval(() => {
      fetchMetrics()
    }, autoRefreshSecs * 1000)
    return () => clearInterval(interval)
  }, [autoRefreshSecs, fetchMetrics])

  const copyMetricsUrl = () => {
    navigator.clipboard.writeText(`${API_URL}/metrics`)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  // Derived chart data
  const statusPieData = useMemo(() => {
    if (!metrics) return []
    const sc = metrics.traffic.statusCodes
    return [
      { name: '2xx Success', code: '2xx', value: sc['2xx'], color: STATUS_COLORS['2xx'] },
      { name: '3xx Redirect', code: '3xx', value: sc['3xx'], color: STATUS_COLORS['3xx'] },
      { name: '4xx Client Err', code: '4xx', value: sc['4xx'], color: STATUS_COLORS['4xx'] },
      { name: '5xx Server Err', code: '5xx', value: sc['5xx'], color: STATUS_COLORS['5xx'] },
    ].filter((item) => item.value > 0)
  }, [metrics])

  const latencyBarData = useMemo(() => {
    if (!metrics?.traffic?.latencyDistribution) return []
    return metrics.traffic.latencyDistribution
  }, [metrics])

  const isDegraded = useMemo(() => {
    if (!metrics?.dependencies) return false
    const deps = Object.values(metrics.dependencies)
    return deps.some((d) => d && d.status !== 'up' && d.status !== 'ok' && d.status !== 'not_configured')
  }, [metrics])

  const hasSentry = Boolean(SENTRY_DSN)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">System Observability & Metrics</h2>
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              Live Prom-Client
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time backend performance, traffic analysis, convoy telemetry & database health
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lastChecked && (
            <span className="text-xs text-muted-foreground mr-1">
              Updated {lastChecked.toLocaleTimeString()}
            </span>
          )}

          {/* Auto refresh select */}
          <div className="flex items-center bg-muted/60 border rounded-lg p-0.5 text-xs">
            {[0, 5, 10, 30].map((sec) => (
              <button
                key={sec}
                onClick={() => setAutoRefreshSecs(sec)}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  autoRefreshSecs === sec
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {sec === 0 ? 'Pause' : `${sec}s`}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={copyMetricsUrl} className="gap-1.5">
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedUrl ? 'Copied Scraper URL' : 'Copy Scraper'}
          </Button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total HTTP Requests */}
        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">HTTP Volume</p>
              <p className="text-2xl font-bold">{metrics?.traffic.totalRequests.toLocaleString() ?? '—'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={metrics?.traffic.errorRatePct ? 'text-primary font-medium' : 'text-emerald-500 font-medium'}>
                  {metrics?.traffic.errorRatePct ?? 0}%
                </span>{' '}
                error rate
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Live Convoys & Sockets */}
        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Convoys</p>
              <p className="text-2xl font-bold">{metrics?.riding.activeRides ?? 0}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                <span className="font-medium text-foreground">{metrics?.riding.activeWebsockets ?? 0}</span> live riders
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Location GPS Ingested */}
        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">GPS Coordinates</p>
              <p className="text-2xl font-bold">{metrics?.riding.locationPingsTotal.toLocaleString() ?? 0}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span>{metrics?.riding.ridesStartedTotal ?? 0}</span> rides recorded
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Emergency SOS */}
        <Card className={`border-border/60 shadow-sm ${metrics?.riding.sosAlertsTotal ? 'border-red-500/50 bg-red-500/5' : ''}`}>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SOS Distress</p>
              <p className={`text-2xl font-bold ${metrics?.riding.sosAlertsTotal ? 'text-red-500' : ''}`}>
                {metrics?.riding.sosAlertsTotal ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">
                {metrics?.riding.sosAlertsTotal ? 'Active alerts triggered' : 'All quiet on the road'}
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              metrics?.riding.sosAlertsTotal ? 'bg-red-500/20 text-red-500 animate-bounce' : 'bg-muted text-muted-foreground'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <Layers className="w-4 h-4" /> Overview & Charts
          </TabsTrigger>
          <TabsTrigger value="traffic" className="gap-2">
            <Activity className="w-4 h-4" /> Top Routes & Traffic
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="gap-2">
            <Database className="w-4 h-4" /> Databases & Server
          </TabsTrigger>
          <TabsTrigger value="raw" className="gap-2">
            <Zap className="w-4 h-4" /> Raw Prometheus
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Overview & Charts ── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status Code Donut Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>HTTP Response Codes</span>
                  <span className="text-xs font-normal text-muted-foreground">Traffic Distribution</span>
                </CardTitle>
                <CardDescription>Breakdown by 2xx, 3xx, 4xx, and 5xx classes</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {mounted && statusPieData.length > 0 ? (
                  <div className="h-56 w-full flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 pr-4 text-xs shrink-0">
                      {statusPieData.map((d) => (
                        <div key={d.code} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="font-medium">{d.code}</span>
                          <span className="text-muted-foreground">({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-muted-foreground text-sm">
                    <Activity className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
                    <span>Awaiting incoming HTTP traffic…</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Latency Distribution Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Latency Buckets (Histogram)</span>
                  <span className="text-xs font-normal text-muted-foreground">Duration</span>
                </CardTitle>
                <CardDescription>Distribution of API response times</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {mounted && latencyBarData.length > 0 ? (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={latencyBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="range" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-muted-foreground text-sm">
                    <Clock className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
                    <span>No latency observations yet</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Memory & Node Process Card */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-muted-foreground">Heap Memory</span>
                <Badge variant="secondary" className="text-xs">
                  {metrics?.system.heapPercent ?? 0}%
                </Badge>
              </div>
              <Progress value={metrics?.system.heapPercent ?? 0} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{metrics?.system.heapUsedMb ?? 0} MB used</span>
                <span>{metrics?.system.heapTotalMb ?? 0} MB total</span>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-muted-foreground">System Uptime</span>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" /> Uptime
                </Badge>
              </div>
              <p className="text-xl font-bold">{metrics?.uptimeFormatted ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Running on {metrics?.system.platform || 'Linux'} ({metrics?.system.nodeVersion || 'v22'})</p>
            </Card>

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-muted-foreground">Process CPU</span>
                <Badge variant="outline" className="text-xs">
                  <Cpu className="w-3 h-3 mr-1" /> User CPU
                </Badge>
              </div>
              <p className="text-xl font-bold">{metrics?.system.cpuUserSeconds ?? 0}s</p>
              <p className="text-xs text-muted-foreground">Kernel System CPU: {metrics?.system.cpuSystemSeconds ?? 0}s</p>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 2: Top Routes & Traffic ── */}
        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 10 High-Traffic Routes</CardTitle>
              <CardDescription>Most frequently visited API endpoints with error breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics?.traffic.topRoutes && metrics.traffic.topRoutes.length > 0 ? (
                <div className="divide-y divide-border/60">
                  {metrics.traffic.topRoutes.map((r, i) => (
                    <div key={i} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Badge
                          variant="outline"
                          className={
                            r.method === 'GET'
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : r.method === 'POST'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : r.method === 'DELETE'
                                  ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                  : 'bg-primary/10 text-primary border-primary/20'
                          }
                        >
                          {r.method}
                        </Badge>
                        <span className="text-sm font-mono truncate">{r.route}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold">{r.count.toLocaleString()} hits</span>
                        {r.errorCount > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {r.errorCount} err
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-emerald-500 border-emerald-500/30">
                            0 err
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No route requests logged yet. Trigger backend endpoints or run Locust to populate data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: Databases & Infrastructure ── */}
        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {/* PostgreSQL */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-semibold text-sm">PostgreSQL</p>
                      <p className="text-xs text-muted-foreground">Relational Core</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      metrics?.dependencies?.postgres?.status === 'up'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-600 border-red-500/20'
                    }
                  >
                    {metrics?.dependencies?.postgres?.status?.toUpperCase() ?? 'UP'}
                  </Badge>
                </div>
                {metrics?.dependencies?.postgres?.latencyMs != null && (
                  <p className="text-xs text-muted-foreground">
                    Query ping latency: <span className="font-medium text-foreground">{metrics.dependencies.postgres.latencyMs} ms</span>
                  </p>
                )}
                {metrics?.dependencies?.postgres?.error && (
                  <p className="text-xs text-red-500 truncate">{metrics.dependencies.postgres.error}</p>
                )}
              </CardContent>
            </Card>

            {/* MongoDB */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-sm">MongoDB</p>
                      <p className="text-xs text-muted-foreground">GPS Breadcrumbs</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      metrics?.dependencies?.mongodb?.status === 'up'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-primary/10 text-primary border-primary/20'
                    }
                  >
                    {metrics?.dependencies?.mongodb?.status?.toUpperCase() ?? 'UP'}
                  </Badge>
                </div>
                {metrics?.dependencies?.mongodb?.latencyMs != null && (
                  <p className="text-xs text-muted-foreground">
                    Ping latency: <span className="font-medium text-foreground">{metrics.dependencies.mongodb.latencyMs} ms</span>
                  </p>
                )}
                {metrics?.dependencies?.mongodb?.error && (
                  <p className="text-xs text-red-500 truncate">{metrics.dependencies.mongodb.error}</p>
                )}
              </CardContent>
            </Card>

            {/* Redis / Upstash */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-semibold text-sm">Redis (Upstash)</p>
                      <p className="text-xs text-muted-foreground">Socket.IO & Cache</p>
                    </div>
                  </div>
                  <Badge
                    className={
                      metrics?.dependencies?.redis?.status === 'up'
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-600 border-red-500/20'
                    }
                  >
                    {metrics?.dependencies?.redis?.status?.toUpperCase() ?? 'UP'}
                  </Badge>
                </div>
                {metrics?.dependencies?.redis?.latencyMs != null && (
                  <p className="text-xs text-muted-foreground">
                    Ping latency: <span className="font-medium text-foreground">{metrics.dependencies.redis.latencyMs} ms</span>
                  </p>
                )}
                {metrics?.dependencies?.redis?.error && (
                  <p className="text-xs text-red-500 truncate">{metrics.dependencies.redis.error}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sentry Integration Card */}
          {hasSentry && (
            <Card>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                    <Bug className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Sentry Error Tracking Active</p>
                    <p className="text-xs text-muted-foreground">Client and server unhandled exceptions streamed directly to Sentry.</p>
                  </div>
                </div>
                {SENTRY_ORG && SENTRY_PROJECT && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://sentry.io/organizations/${SENTRY_ORG}/projects/${SENTRY_PROJECT}/`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Sentry
                      <ExternalLink className="ml-2 w-3.5 h-3.5" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── TAB 4: Raw Prometheus Scraper ── */}
        <TabsContent value="raw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Prometheus Metrics Endpoint</CardTitle>
              <CardDescription>
                Direct link to scrape your production backend on Render, or feed into Fly.io / Grafana Cloud
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-lg font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto">
                <span>{`${API_URL}/metrics`}</span>
                <Button size="sm" variant="ghost" onClick={copyMetricsUrl} className="shrink-0 h-7 px-2 text-xs">
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copiedUrl ? 'Copied' : 'Copy'}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="default" size="sm" asChild>
                  <a href={`${API_URL}/metrics`} target="_blank" rel="noreferrer">
                    View Live /metrics Output
                    <ArrowUpRight className="ml-1.5 w-4 h-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
