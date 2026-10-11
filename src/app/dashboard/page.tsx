'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Shield,
  Database,
  Network,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  HardDrive,
  RefreshCw,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  History,
  Layers
} from 'lucide-react'
import { DashboardMetrics, PrivacyRequest, AuditLog, RequestType } from '@/types'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    data_sources_count: 7,
    pii_records_count: 42186,
    privacy_requests_count: 5,
    pending_requests_count: 2,
    systems_mapped_count: 7,
    audit_events_count: 7,
    completion_rate: 90
  })

  const [recentRequests, setRecentRequests] = useState<PrivacyRequest[]>([])
  const [recentAudit, setRecentAudit] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newSubject, setNewSubject] = useState('customer@example.com')
  const [newType, setNewType] = useState<RequestType>('DELETE')
  const [submitting, setSubmitting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [mRes, rRes, aRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/privacy-requests'),
        fetch('/api/audit-logs?limit=5')
      ])

      const mJson = await mRes.json()
      if (mJson.success) setMetrics(mJson.data)

      const rJson = await rRes.json()
      if (rJson.success) setRecentRequests(rJson.data.slice(0, 4))

      const aJson = await aRes.json()
      if (aJson.success) setRecentAudit(aJson.data)
    } catch (err) {
      console.error('Failed to load dashboard', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await fetch('/api/privacy-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_identifier: newSubject,
          request_type: newType,
          auto_execute: true
        })
      })
      const json = await res.json()
      if (json.success) {
        setActionSuccess(`Request ${json.data.id} created and executed across ${json.actions.length} systems!`)
        setIsCreateOpen(false)
        await loadDashboardData()
        setTimeout(() => setActionSuccess(null), 5000)
      }
    } catch (err) {
      console.error('Error creating request', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleTriggerDiscovery = async () => {
    try {
      const res = await fetch('/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan' })
      })
      const json = await res.json()
      if (json.success) {
        setActionSuccess('Discovery scan complete: all connected schemas indexed!')
        await loadDashboardData()
        setTimeout(() => setActionSuccess(null), 4000)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Privacy Operations Infrastructure</h1>
            <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono">
              DPDP ACTIVE
            </Badge>
          </div>
          <p className="text-zinc-400 text-sm">
            Operational overview of data discovery, lineage blast radius, and automated action verifications
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerDiscovery}
            className="border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Scan Data Sources
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Privacy Request
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <DialogHeader>
                <DialogTitle className="text-base">Initiate Privacy Action</DialogTitle>
                <DialogDescription className="text-xs text-zinc-400">
                  Trigger an automated, verifiable privacy request across all mapped systems
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sub" className="text-xs">Data Subject Identifier</Label>
                  <Input
                    id="sub"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="bg-zinc-950 border-zinc-800 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs">Request Action Type</Label>
                  <Select value={newType} onValueChange={(val) => setNewType(val as RequestType)}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-xs text-zinc-100">
                      <SelectItem value="DELETE">DELETE &bull; Erase from all connected downstream nodes</SelectItem>
                      <SelectItem value="ACCESS">ACCESS &bull; Extract & package subject records</SelectItem>
                      <SelectItem value="CORRECT">CORRECT &bull; Rectify & update subject attributes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <div className="font-semibold text-zinc-200">Execution Plan Preview:</div>
                  <p>&bull; Resolves data blast radius (4 affected systems)</p>
                  <p>&bull; Executes connector actions with failure handling</p>
                  <p>&bull; Performs post-execution verification checks</p>
                  <p>&bull; Generates immutable compliance audit log</p>
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs"
                >
                  {submitting ? 'Executing Operations...' : 'Create & Execute Request'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-zinc-900/80 border-zinc-800">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-[11px] font-mono uppercase text-zinc-400">Data Sources</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-zinc-100">{metrics.data_sources_count}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Connected connectors</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/80 border-zinc-800">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-[11px] font-mono uppercase text-zinc-400">PII Records</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-cyan-400">{metrics.pii_records_count.toLocaleString()}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Identified & classified</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/80 border-zinc-800">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-[11px] font-mono uppercase text-zinc-400">Privacy Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-zinc-100">{metrics.privacy_requests_count}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Lifecycle requests</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/80 border-zinc-800">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-[11px] font-mono uppercase text-zinc-400">Pending Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-amber-400">{metrics.pending_requests_count}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">In flight or awaiting sign-off</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/80 border-zinc-800">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-[11px] font-mono uppercase text-zinc-400">Systems Mapped</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-zinc-100">{metrics.systems_mapped_count}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">In lineage graph</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/80 border-zinc-800">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-[11px] font-mono uppercase text-zinc-400">Audit Events</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-emerald-400">{metrics.audit_events_count}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Immutable log entries</div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Risk & Attention Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start space-x-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-200">Connectors Operational</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              All 7 data connectors (PostgreSQL, CRM, Klaviyo, SendGrid, Snowflake) reporting healthy sync pulses.
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start space-x-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-200">1 Failed Request Requires Retry</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Request <span className="font-mono text-amber-400">PR-1038</span> encountered CRM API timeout. Available for immediate retry.
            </div>
            <Link href="/dashboard/privacy-requests" className="text-[11px] text-cyan-400 hover:underline mt-1 inline-block">
              Review and retry &rarr;
            </Link>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start space-x-3">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-200">DPDP Verification Active</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Automated multi-system deletion checks and cryptographic audit hashes sealed for every completed request.
            </div>
          </div>
        </div>
      </div>

      {/* Main Operational Split: Privacy Requests & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Requests Section */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <CardTitle className="text-sm font-semibold">Active Privacy Workflows</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Real-time DISCOVER &bull; ACT &bull; VERIFY executions
                </CardDescription>
              </div>
              <Link href="/dashboard/privacy-requests">
                <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300">
                  View All &rarr;
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800/60">
                {recentRequests.map((req) => (
                  <div key={req.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-zinc-200">{req.id}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono ${
                            req.request_type === 'DELETE'
                              ? 'border-red-500/40 text-red-400'
                              : req.request_type === 'ACCESS'
                              ? 'border-blue-500/40 text-blue-400'
                              : 'border-amber-500/40 text-amber-400'
                          }`}
                        >
                          {req.request_type}
                        </Badge>
                      </div>
                      <div className="text-xs text-zinc-400 font-mono">{req.subject_identifier}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        className={`text-[10px] ${
                          req.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : req.status === 'FAILED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {req.status === 'COMPLETED' && <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                        {req.status}
                      </Badge>
                      <Link href="/dashboard/privacy-requests">
                        <Button size="sm" variant="ghost" className="text-xs h-7 px-2 text-zinc-400 hover:text-zinc-200">
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log Stream */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <CardTitle className="text-sm font-semibold">Live Audit Trail</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                  Immutable chronological compliance events
                </CardDescription>
              </div>
              <Link href="/dashboard/audit-logs">
                <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300">
                  Full Ledger &rarr;
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800/60">
                {recentAudit.map((log) => (
                  <div key={log.id} className="p-3.5 space-y-1 hover:bg-zinc-800/20 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] text-cyan-400 font-semibold">{log.event_type}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                      <span className="truncate max-w-[200px]">
                        Target: {log.resource_type} ({log.resource_id})
                      </span>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] py-0">
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
