'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Database,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Layers,
  Sparkles,
  Server
} from 'lucide-react'
import { DataSourceSummary } from '@/types'

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSourceSummary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState<string | null>(null)

  const fetchDataSources = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/data-sources')
      const json = await res.json()
      if (json.success) {
        setDataSources(json.data)
      }
    } catch (err) {
      console.error('Failed to load data sources', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDataSources()
  }, [])

  const handleRunScan = async () => {
    try {
      setScanning(true)
      setScanMessage(null)
      const res = await fetch('/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan' })
      })
      const json = await res.json()
      if (json.success) {
        setScanMessage(`Scan complete! ${json.data.newlyScanned} sources scanned, ${json.data.totalAssets} assets indexed.`)
        await fetchDataSources()
      }
    } catch (err) {
      console.error('Scan error', err)
    } finally {
      setScanning(false)
    }
  }

  const handleToggleFailure = async (systemId: string) => {
    try {
      const res = await fetch('/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_failure', system_id: systemId })
      })
      const json = await res.json()
      if (json.success) {
        setDataSources(prev =>
          prev.map(s => (s.id === systemId ? { ...s, simulate_failure: json.data.simulate_failure } : s))
        )
      }
    } catch (err) {
      console.error('Toggle error', err)
    }
  }

  const filteredSources = dataSources.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRecords = dataSources.reduce((acc, curr) => acc + curr.records_count, 0)
  const totalTables = dataSources.reduce((acc, curr) => acc + curr.tables_count, 0)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Sources</h1>
          <p className="text-zinc-400 text-sm">
            Connected databases, CRM objects, marketing datasets, and data warehouse endpoints
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRunScan}
            disabled={scanning}
            className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning Systems...' : 'Run Data Discovery Scan'}
          </Button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Connected Sources</CardTitle>
            <Server className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{dataSources.length}</div>
            <p className="text-xs text-zinc-500 mt-1">All connectors online</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Total Records Monitored</CardTitle>
            <HardDrive className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{totalRecords.toLocaleString()}</div>
            <p className="text-xs text-zinc-500 mt-1">Customer & account entities</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Schemas / Tables</CardTitle>
            <Database className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{totalTables}</div>
            <p className="text-xs text-zinc-500 mt-1">Tables & data objects mapped</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Failure Simulation</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {dataSources.filter(s => s.simulate_failure).length} Active
            </div>
            <p className="text-xs text-zinc-500 mt-1">Testing fault tolerance</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Filter data sources by name, type, or storage description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-zinc-200"
        />
      </div>

      {/* Data Sources Table */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <CardTitle className="text-sm font-semibold">Registered Data Connectors</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Systems configured with automated privacy discovery, access, and deletion capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-500">Loading data sources...</div>
          ) : filteredSources.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">No data sources matched your filter.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-xs">Source System</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Schema Size</TableHead>
                  <TableHead className="text-xs">PII Classifications</TableHead>
                  <TableHead className="text-xs">Last Scanned</TableHead>
                  <TableHead className="text-xs">Simulate Fault</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSources.map((source) => (
                  <TableRow key={source.id} className="border-zinc-800/60 hover:bg-zinc-800/30">
                    <TableCell>
                      <div>
                        <div className="font-medium text-xs text-zinc-200">{source.name}</div>
                        <div className="text-[11px] text-zinc-500 max-w-xs truncate">{source.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-[10px] font-mono">
                        {source.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-zinc-200 font-mono">
                        {source.tables_count} tables &bull; {source.records_count.toLocaleString()} rows
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {source.classification_counts.personal > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {source.classification_counts.personal} PII
                          </span>
                        )}
                        {source.classification_counts.sensitive > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {source.classification_counts.sensitive} Sensitive
                          </span>
                        )}
                        {source.classification_counts.financial > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                            {source.classification_counts.financial} Financial
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {source.last_scanned_at ? new Date(source.last_scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={source.simulate_failure}
                          onCheckedChange={() => handleToggleFailure(source.id)}
                        />
                        {source.simulate_failure ? (
                          <span className="text-[10px] font-mono font-bold text-amber-400">FAULT ON</span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-600">NORMAL</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                        Connected
                      </Badge>
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
