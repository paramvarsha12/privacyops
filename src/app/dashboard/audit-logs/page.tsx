'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, CheckCircle2, XCircle, Clock, Shield, FileText, Database, Activity } from 'lucide-react'
import { EventType } from '@/types'

// Mock data for demo
const mockAuditLogs = [
  {
    id: 'audit-1',
    organization_id: 'org-1',
    actor_id: 'user-1',
    event_type: 'PRIVACY_REQUEST_COMPLETED' as EventType,
    resource_type: 'privacy_request',
    resource_id: 'req-1',
    status: 'SUCCESS',
    metadata: { subject_identifier: 'rahul@example.com', request_type: 'DELETE' },
    created_at: '2024-09-20T10:45:00Z'
  },
  {
    id: 'audit-2',
    organization_id: 'org-1',
    actor_id: 'user-1',
    event_type: 'SYSTEM_ACTION_COMPLETED' as EventType,
    resource_type: 'privacy_request_action',
    resource_id: 'action-1',
    status: 'SUCCESS',
    metadata: { system_id: 'sys-2', action_type: 'DELETE' },
    created_at: '2024-09-20T10:44:00Z'
  },
  {
    id: 'audit-3',
    organization_id: 'org-1',
    actor_id: 'user-1',
    event_type: 'PRIVACY_REQUEST_CREATED' as EventType,
    resource_type: 'privacy_request',
    resource_id: 'req-1',
    status: 'SUCCESS',
    metadata: { subject_identifier: 'rahul@example.com', request_type: 'DELETE' },
    created_at: '2024-09-20T10:30:00Z'
  },
  {
    id: 'audit-4',
    organization_id: 'org-1',
    actor_id: 'user-1',
    event_type: 'SYSTEM_ACTION_FAILED' as EventType,
    resource_type: 'privacy_request_action',
    resource_id: 'action-2',
    status: 'FAILURE',
    metadata: { system_id: 'sys-3', action_type: 'DELETE', error: 'Connection timeout' },
    created_at: '2024-09-18T09:25:00Z'
  },
  {
    id: 'audit-5',
    organization_id: 'org-1',
    actor_id: 'user-1',
    event_type: 'DATA_ASSET_DISCOVERED' as EventType,
    resource_type: 'data_asset',
    resource_id: 'asset-1',
    status: 'SUCCESS',
    metadata: { asset_name: 'customer_email', classification: 'PERSONAL' },
    created_at: '2024-09-15T14:20:00Z'
  },
  {
    id: 'audit-6',
    organization_id: 'org-1',
    actor_id: 'user-1',
    event_type: 'SYSTEM_CREATED' as EventType,
    resource_type: 'system',
    resource_id: 'sys-7',
    status: 'SUCCESS',
    metadata: { system_name: 'Analytics Platform', system_type: 'ANALYTICS' },
    created_at: '2024-09-10T11:00:00Z'
  },
  {
    id: 'audit-7',
    organization_id: 'org-1',
    actor_id: 'user-1',
    event_type: 'VERIFICATION_COMPLETED' as EventType,
    resource_type: 'privacy_request',
    resource_id: 'req-2',
    status: 'SUCCESS',
    metadata: { request_id: 'req-2', verification_passed: true },
    created_at: '2024-09-19T14:26:00Z'
  }
]

const eventConfig: Record<EventType, { icon: any; color: string }> = {
  USER_LOGIN: { icon: Shield, color: 'bg-blue-500/10 text-blue-500' },
  SYSTEM_CREATED: { icon: Database, color: 'bg-emerald-500/10 text-emerald-500' },
  DATA_ASSET_DISCOVERED: { icon: FileText, color: 'bg-purple-500/10 text-purple-500' },
  PRIVACY_REQUEST_CREATED: { icon: FileText, color: 'bg-cyan-500/10 text-cyan-500' },
  PRIVACY_REQUEST_STARTED: { icon: Activity, color: 'bg-blue-500/10 text-blue-500' },
  SYSTEM_ACTION_STARTED: { icon: Activity, color: 'bg-blue-500/10 text-blue-500' },
  SYSTEM_ACTION_COMPLETED: { icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-500' },
  SYSTEM_ACTION_FAILED: { icon: XCircle, color: 'bg-red-500/10 text-red-500' },
  SYSTEM_ACTION_RETRIED: { icon: Activity, color: 'bg-amber-500/10 text-amber-500' },
  PRIVACY_REQUEST_COMPLETED: { icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-500' },
  PRIVACY_REQUEST_FAILED: { icon: XCircle, color: 'bg-red-500/10 text-red-500' },
  VERIFICATION_COMPLETED: { icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-500' }
}

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<typeof mockAuditLogs[0] | null>(null)

  const filteredLogs = mockAuditLogs.filter(log =>
    log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
        <p className="text-zinc-400">Immutable record of all privacy operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAuditLogs.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Successful</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {mockAuditLogs.filter(l => l.status === 'SUCCESS').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {mockAuditLogs.filter(l => l.status === 'FAILURE').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Privacy Requests</CardTitle>
            <FileText className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAuditLogs.filter(l => l.resource_type === 'privacy_request').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search audit logs by event, resource, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Chronological record of all system events</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const EventIcon = eventConfig[log.event_type].icon
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-zinc-400">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <EventIcon className="h-4 w-4" />
                        <Badge className={eventConfig[log.event_type].color}>
                          {log.event_type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{log.resource_type}</div>
                        <div className="text-xs text-zinc-400 font-mono">{log.resource_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {log.actor_id}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Audit Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-zinc-900 border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Audit Log Details</CardTitle>
                  <CardDescription className="font-mono text-sm">{selectedLog.id}</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Event Type</div>
                  <Badge className={eventConfig[selectedLog.event_type].color}>
                    {selectedLog.event_type}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Status</div>
                  <Badge className={selectedLog.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}>
                    {selectedLog.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Resource Type</div>
                  <div className="font-medium">{selectedLog.resource_type}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Resource ID</div>
                  <div className="font-mono text-sm">{selectedLog.resource_id}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Actor</div>
                  <div className="font-mono text-sm">{selectedLog.actor_id}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400 mb-1">Timestamp</div>
                  <div className="text-sm">{new Date(selectedLog.created_at).toLocaleString()}</div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-6">
                <h3 className="font-semibold mb-4">Metadata</h3>
                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                  <pre className="text-sm text-zinc-300 overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-500">Immutable Record</div>
                    <div className="text-sm text-zinc-400 mt-1">
                      This audit log cannot be modified or deleted. It serves as a permanent record of this event for compliance and verification purposes.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
