'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Plus,
  Play,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { RequestType, RequestStatus, PrivacyRequest, PrivacyRequestAction, TimelineStep } from '@/types'

const statusConfig: Record<RequestStatus, { icon: any; color: string }> = {
  PENDING: { icon: Clock, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  PROCESSING: { icon: Play, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  COMPLETED: { icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  FAILED: { icon: XCircle, color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  CANCELLED: { icon: XCircle, color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' }
}

const typeConfig: Record<RequestType, { color: string }> = {
  ACCESS: { color: 'border-blue-500/40 text-blue-400' },
  DELETE: { color: 'border-red-500/40 text-red-400' },
  CORRECT: { color: 'border-amber-500/40 text-amber-400' }
}

export default function PrivacyRequestsPage() {
  const [requests, setRequests] = useState<PrivacyRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [newType, setNewType] = useState<RequestType>('DELETE')
  const [submitting, setSubmitting] = useState(false)

  // Request inspection detail
  const [selectedRequest, setSelectedRequest] = useState<PrivacyRequest | null>(null)
  const [selectedActions, setSelectedActions] = useState<PrivacyRequestAction[]>([])
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineStep[]>([])
  const [inspectLoading, setInspectLoading] = useState(false)
  const [actionNotice, setActionNotice] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/privacy-requests')
      const json = await res.json()
      if (json.success) {
        setRequests(json.data)
      }
    } catch (err) {
      console.error('Failed to load requests', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleInspect = async (req: PrivacyRequest) => {
    try {
      setSelectedRequest(req)
      setInspectLoading(true)
      setActionNotice(null)
      const res = await fetch(`/api/privacy-requests/${req.id}`)
      const json = await res.json()
      if (json.success) {
        setSelectedRequest(json.data)
        setSelectedActions(json.actions)
        setSelectedTimeline(json.timeline)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setInspectLoading(false)
    }
  }

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject) return
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
        setIsCreateOpen(false)
        setNewSubject('')
        await fetchRequests()
        handleInspect(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleExecuteRequest = async (id: string) => {
    try {
      setInspectLoading(true)
      const res = await fetch(`/api/privacy-requests/${id}/execute`, { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setSelectedRequest(json.data)
        setSelectedActions(json.actions)
        setSelectedTimeline(json.timeline)
        setActionNotice(json.message)
        await fetchRequests()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setInspectLoading(false)
    }
  }

  const handleVerifyRequest = async (id: string) => {
    try {
      setInspectLoading(true)
      const res = await fetch(`/api/privacy-requests/${id}/verify`, { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setSelectedRequest(json.data)
        setSelectedTimeline(json.timeline)
        setActionNotice(json.message)
        await fetchRequests()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setInspectLoading(false)
    }
  }

  const handleRetryRequest = async (id: string) => {
    try {
      setInspectLoading(true)
      const res = await fetch(`/api/privacy-requests/${id}/retry`, { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setSelectedRequest(json.data)
        setSelectedActions(json.actions)
        setSelectedTimeline(json.timeline)
        setActionNotice(json.message)
        await fetchRequests()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setInspectLoading(false)
    }
  }

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.subject_identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'ALL' || r.request_type === filterType
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Privacy Requests</h1>
          <p className="text-zinc-400 text-sm">
            Orchestrate and verify ACCESS, DELETE, and CORRECT operations across connected systems
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs h-9">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create Request
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle className="text-base">Initiate Privacy Request</DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Executes multi-system data deletion or access workflow with verification
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="subId" className="text-xs">Subject Identifier (Email)</Label>
                <Input
                  id="subId"
                  placeholder="e.g., customer@example.com"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reqType" className="text-xs">Request Action Type</Label>
                <Select value={newType} onValueChange={(val) => setNewType(val as RequestType)}>
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-xs text-zinc-100">
                    <SelectItem value="DELETE">DELETE &bull; Remove from database, CRM, marketing & analytics</SelectItem>
                    <SelectItem value="ACCESS">ACCESS &bull; Compile and return subject data package</SelectItem>
                    <SelectItem value="CORRECT">CORRECT &bull; Rectify subject record attributes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs space-y-1.5 text-zinc-400">
                <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  Automated Pipeline
                </div>
                <p className="text-[11px]">
                  PrivacyOps will automatically compute the blast radius, trigger connector actions, verify completion on all affected nodes, and write an immutable audit trail entry.
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs"
              >
                {submitting ? 'Executing Pipeline...' : 'Generate & Execute Plan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Total Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-zinc-100">{requests.length}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Recorded operations</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-emerald-400">
              {requests.filter(r => r.status === 'COMPLETED').length}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Verified & sealed</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Pending / In Flight</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-amber-400">
              {requests.filter(r => r.status === 'PENDING' || r.status === 'PROCESSING').length}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Awaiting completion</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Failed / Retries</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold text-red-400">
              {requests.filter(r => r.status === 'FAILED').length}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Requires retry</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by request ID or data subject identifier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-zinc-200"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800 text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-xs text-zinc-100">
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="ACCESS">ACCESS</SelectItem>
              <SelectItem value="CORRECT">CORRECT</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36 bg-zinc-900 border-zinc-800 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-xs text-zinc-100">
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="COMPLETED">COMPLETED</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="PROCESSING">PROCESSING</SelectItem>
              <SelectItem value="FAILED">FAILED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Requests Table */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <CardTitle className="text-sm font-semibold">Active Privacy Requests</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Click on any request to view its complete multi-system execution timeline and audit trail
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-500">Loading privacy requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">No requests matched your filter.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-xs">Request ID</TableHead>
                  <TableHead className="text-xs">Data Subject</TableHead>
                  <TableHead className="text-xs">Action Type</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Timestamp</TableHead>
                  <TableHead className="text-xs">Execution Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => {
                  const StatusIcon = statusConfig[req.status]?.icon || Clock
                  return (
                    <TableRow key={req.id} className="border-zinc-800/60 hover:bg-zinc-800/30">
                      <TableCell className="font-mono text-xs font-semibold text-zinc-200">
                        {req.id}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-300 font-mono">
                        {req.subject_identifier}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] font-mono ${typeConfig[req.request_type]?.color}`}>
                          {req.request_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${statusConfig[req.status]?.color}`}>
                          <StatusIcon className="h-2.5 w-2.5 mr-1" />
                          {req.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-500 font-mono">
                        {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInspect(req)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-7 px-2.5"
                        >
                          View Timeline &rarr;
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Execution Timeline Inspection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="bg-zinc-900 border-zinc-800 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <CardHeader className="border-b border-zinc-800/80 pb-4 bg-zinc-950/60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold">Request #{selectedRequest.id}</CardTitle>
                    <Badge variant="outline" className={`text-[10px] font-mono ${typeConfig[selectedRequest.request_type]?.color}`}>
                      {selectedRequest.request_type}
                    </Badge>
                    <Badge className={`text-[10px] ${statusConfig[selectedRequest.status]?.color}`}>
                      {selectedRequest.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-zinc-400 mt-1 font-mono">
                    Subject: {selectedRequest.subject_identifier}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRequest(null)}
                  className="text-zinc-400 hover:text-zinc-100 h-8 w-8 p-0"
                >
                  &times;
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto space-y-6">
              {actionNotice && (
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs text-cyan-400">
                  {actionNotice}
                </div>
              )}

              {/* Multi-System Stepper / Timeline */}
              <div>
                <div className="text-xs font-mono uppercase text-zinc-400 font-semibold mb-4">
                  Multi-System Execution Timeline
                </div>

                {inspectLoading ? (
                  <div className="p-8 text-center text-xs text-zinc-500">Loading timeline...</div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                    {selectedTimeline.map((step) => {
                      const isComplete = step.status === 'COMPLETED'
                      const isFailed = step.status === 'FAILED'
                      const isProcessing = step.status === 'PROCESSING'

                      return (
                        <div key={step.id} className="relative flex items-start space-x-3">
                          <div
                            className={`absolute -left-6 mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center text-[9px] ${
                              isComplete
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : isFailed
                                ? 'bg-red-500/20 border-red-500 text-red-400'
                                : isProcessing
                                ? 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse'
                                : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                            }`}
                          >
                            {isComplete && '✓'}
                            {isFailed && '✕'}
                            {isProcessing && '•'}
                          </div>

                          <div className="flex-1 bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-zinc-200">{step.label}</span>
                              <span className="font-mono text-[10px] text-zinc-500">{step.timestamp}</span>
                            </div>
                            {step.detail && (
                              <div className="text-[11px] text-zinc-400 mt-1 font-mono">{step.detail}</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex flex-wrap gap-2 justify-end">
                {selectedRequest.status === 'FAILED' && (
                  <Button
                    onClick={() => handleRetryRequest(selectedRequest.id)}
                    disabled={inspectLoading}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs h-8"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Retry Failed System Actions
                  </Button>
                )}

                {selectedRequest.status === 'PENDING' && (
                  <Button
                    onClick={() => handleExecuteRequest(selectedRequest.id)}
                    disabled={inspectLoading}
                    className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs h-8"
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                    Execute Plan
                  </Button>
                )}

                {selectedRequest.status === 'PROCESSING' && (
                  <Button
                    onClick={() => handleVerifyRequest(selectedRequest.id)}
                    disabled={inspectLoading}
                    className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs h-8"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                    Run Multi-System Verification
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRequest(null)}
                  className="border-zinc-800 text-xs h-8"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
