'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CheckSquare,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileCheck2,
  TrendingDown,
  TrendingUp
} from 'lucide-react'
import { ConsentRecord, ConsentStatus } from '@/types'

export default function ConsentPage() {
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [filterPurpose, setFilterPurpose] = useState<string>('ALL')

  const fetchConsent = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/consent')
      const json = await res.json()
      if (json.success) {
        setConsentRecords(json.data)
      }
    } catch (err) {
      console.error('Failed to load consent', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConsent()
  }, [])

  const handleToggleConsent = async (record: ConsentRecord) => {
    const newStatus: ConsentStatus = record.status === 'GRANTED' ? 'WITHDRAWN' : 'GRANTED'
    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: record.id, status: newStatus })
      })
      const json = await res.json()
      if (json.success) {
        setConsentRecords(prev =>
          prev.map(c => (c.id === record.id ? json.data : c))
        )
      }
    } catch (err) {
      console.error('Consent update error', err)
    }
  }

  const filtered = consentRecords.filter(c => {
    const matchesSearch =
      c.subject_identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.source.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPurpose = filterPurpose === 'ALL' || c.purpose === filterPurpose
    return matchesSearch && matchesPurpose
  })

  const grantedCount = consentRecords.filter(c => c.status === 'GRANTED').length
  const withdrawnCount = consentRecords.filter(c => c.status === 'WITHDRAWN').length

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Consent Management</h1>
        <p className="text-zinc-400 text-sm">
          Track, verify, and enforce purpose-based consent records under DPDP compliance rules
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Total Consent Records</CardTitle>
            <CheckSquare className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{consentRecords.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Across 4 distinct processing purposes</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Active Granted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{grantedCount}</div>
            <p className="text-xs text-zinc-500 mt-1">Permitted processing pipelines</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Withdrawn / Opted Out</CardTitle>
            <XCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{withdrawnCount}</div>
            <p className="text-xs text-zinc-500 mt-1">Suppression & automated stop enforced</p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Purpose Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by data subject email or capture source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-zinc-200"
          />
        </div>
        <div className="flex gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
          {['ALL', 'Marketing', 'Analytics', 'Personalization', 'Telemetry'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPurpose(p)}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                filterPurpose === p ? 'bg-zinc-800 text-cyan-400' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <CardTitle className="text-sm font-semibold">Consent Ledger</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Real-time status of data processing authorizations by data subject
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-500">Loading consent records...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">No consent records matched.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-xs">Data Subject</TableHead>
                  <TableHead className="text-xs">Processing Purpose</TableHead>
                  <TableHead className="text-xs">Consent Status</TableHead>
                  <TableHead className="text-xs">Capture Source Notice</TableHead>
                  <TableHead className="text-xs">Timestamp Granted</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((record) => (
                  <TableRow key={record.id} className="border-zinc-800/60 hover:bg-zinc-800/30">
                    <TableCell className="font-mono text-xs text-zinc-200">
                      {record.subject_identifier}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-[10px]">
                        {record.purpose}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.status === 'GRANTED' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                          Granted
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                          <XCircle className="h-2.5 w-2.5 mr-1" />
                          Withdrawn
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-400">
                      {record.source}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500 font-mono">
                      {new Date(record.granted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleConsent(record)}
                        className={`text-xs h-7 px-2 ${
                          record.status === 'GRANTED'
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                            : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                        }`}
                      >
                        {record.status === 'GRANTED' ? 'Withdraw' : 'Re-Grant'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
