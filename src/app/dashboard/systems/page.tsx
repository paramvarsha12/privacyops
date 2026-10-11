'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Search, Database, CheckCircle2, AlertCircle, RefreshCw, Activity, Server } from 'lucide-react'
import { DataSourceSummary } from '@/types'

export default function SystemsPage() {
  const [systems, setSystems] = useState<DataSourceSummary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [toggleNotice, setToggleNotice] = useState<string | null>(null)

  const fetchSystems = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/data-sources')
      const json = await res.json()
      if (json.success) {
        setSystems(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystems()
  }, [])

  const handleToggleFailure = async (systemId: string) => {
    try {
      const res = await fetch('/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_failure', system_id: systemId })
      })
      const json = await res.json()
      if (json.success) {
        setToggleNotice(json.message)
        setSystems(prev =>
          prev.map(s => (s.id === systemId ? { ...s, simulate_failure: json.data.simulate_failure } : s))
        )
        setTimeout(() => setToggleNotice(null), 4000)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = systems.filter(sys =>
    sys.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sys.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Connected Systems & Connectors</h1>
        <p className="text-zinc-400 text-sm">
          Manage system connectors, test failure modes, and verify integration communication
        </p>
      </div>

      {toggleNotice && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{toggleNotice}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Total Systems</CardTitle>
            <Server className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systems.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Configured connectors</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Active Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {systems.filter(s => s.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Ready for requests</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Connector Mode</CardTitle>
            <Database className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">DEMO</div>
            <p className="text-xs text-zinc-500 mt-1">Mock connectors active</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-mono uppercase text-zinc-400">Failure Simulation</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {systems.filter(s => s.simulate_failure).length} Active
            </div>
            <p className="text-xs text-zinc-500 mt-1">Simulating timeout/errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Filter systems by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-zinc-900 border-zinc-800 text-xs text-zinc-200"
        />
      </div>

      {/* Table */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <CardTitle className="text-sm font-semibold">Configured Integration Connectors</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Toggle failure simulation on any connector to test automated retries and resilience
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-500">Loading systems...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-xs">System Name</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Connector Interface</TableHead>
                  <TableHead className="text-xs">Simulate Fault</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sys) => (
                  <TableRow key={sys.id} className="border-zinc-800/60 hover:bg-zinc-800/30">
                    <TableCell>
                      <div>
                        <div className="font-medium text-xs text-zinc-200">{sys.name}</div>
                        <div className="text-[11px] text-zinc-500">{sys.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-300">
                        {sys.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                        <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                        {sys.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {sys.connector_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={sys.simulate_failure}
                          onCheckedChange={() => handleToggleFailure(sys.id)}
                        />
                        {sys.simulate_failure && (
                          <span className="text-[10px] font-bold text-amber-400 font-mono">FAILING</span>
                        )}
                      </div>
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
