'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Layers,
  Database,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  Network,
  RotateCcw
} from 'lucide-react'
import { SubjectBlastRadius } from '@/types'

const initialNodes: Node[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    position: { x: 260, y: 30 },
    data: {
      label: (
        <div className="p-3">
          <div className="font-semibold text-xs text-zinc-100">Website Gateway</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">WEB PORTAL</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">4 endpoints &bull; 850 rows</div>
        </div>
      )
    },
    style: { background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fafafa', width: 190 }
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    position: { x: 260, y: 170 },
    data: {
      label: (
        <div className="p-3">
          <div className="font-semibold text-xs text-cyan-400">Customer Database</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">POSTGRESQL (PRIMARY)</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">12 tables &bull; 8,420 rows</div>
        </div>
      )
    },
    style: { background: '#09090b', border: '2px solid #06b6d4', borderRadius: '8px', color: '#fafafa', width: 190 }
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    position: { x: 80, y: 310 },
    data: {
      label: (
        <div className="p-3">
          <div className="font-semibold text-xs text-zinc-100">CRM (Salesforce)</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">CUSTOMER RELATIONS</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">6 objects &bull; 3,201 rows</div>
        </div>
      )
    },
    style: { background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fafafa', width: 190 }
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    position: { x: 440, y: 310 },
    data: {
      label: (
        <div className="p-3">
          <div className="font-semibold text-xs text-zinc-100">Support Desk</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">TICKETS & CHAT</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">5 queues &bull; 4,120 rows</div>
        </div>
      )
    },
    style: { background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fafafa', width: 190 }
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    position: { x: 80, y: 460 },
    data: {
      label: (
        <div className="p-3">
          <div className="font-semibold text-xs text-zinc-100">Marketing Platform</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">CAMPAIGNS & LISTS</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">4 datasets &bull; 1,892 rows</div>
        </div>
      )
    },
    style: { background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fafafa', width: 190 }
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    position: { x: 80, y: 600 },
    data: {
      label: (
        <div className="p-3">
          <div className="font-semibold text-xs text-zinc-100">Email Provider</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">TRANSACTIONAL DISPATCH</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">2 pools &bull; 9,500 rows</div>
        </div>
      )
    },
    style: { background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fafafa', width: 190 }
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    position: { x: 380, y: 460 },
    data: {
      label: (
        <div className="p-3">
          <div className="font-semibold text-xs text-zinc-100">Analytics Warehouse</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">SNOWFLAKE TELEMETRY</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">9 tables &bull; 14,203 rows</div>
        </div>
      )
    },
    style: { background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', color: '#fafafa', width: 190 }
  }
]

const initialEdges: Edge[] = [
  {
    id: 'e-1-2',
    source: '00000000-0000-0000-0000-000000000001',
    target: '00000000-0000-0000-0000-000000000002',
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
    label: 'PUSH (Signup)',
    labelStyle: { fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' },
    labelBgStyle: { fill: '#18181b', fillOpacity: 0.9 }
  },
  {
    id: 'e-2-3',
    source: '00000000-0000-0000-0000-000000000002',
    target: '00000000-0000-0000-0000-000000000003',
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
    label: 'SYNC (Accounts)',
    labelStyle: { fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' },
    labelBgStyle: { fill: '#18181b', fillOpacity: 0.9 }
  },
  {
    id: 'e-2-5',
    source: '00000000-0000-0000-0000-000000000002',
    target: '00000000-0000-0000-0000-000000000005',
    animated: true,
    style: { stroke: '#71717a', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#71717a' },
    label: 'SYNC (Caller ID)',
    labelStyle: { fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' },
    labelBgStyle: { fill: '#18181b', fillOpacity: 0.9 }
  },
  {
    id: 'e-3-4',
    source: '00000000-0000-0000-0000-000000000003',
    target: '00000000-0000-0000-0000-000000000004',
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
    label: 'SYNC (Audiences)',
    labelStyle: { fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' },
    labelBgStyle: { fill: '#18181b', fillOpacity: 0.9 }
  },
  {
    id: 'e-4-6',
    source: '00000000-0000-0000-0000-000000000004',
    target: '00000000-0000-0000-0000-000000000006',
    animated: true,
    style: { stroke: '#71717a', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#71717a' },
    label: 'PUSH (Campaigns)',
    labelStyle: { fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' },
    labelBgStyle: { fill: '#18181b', fillOpacity: 0.9 }
  },
  {
    id: 'e-2-7',
    source: '00000000-0000-0000-0000-000000000002',
    target: '00000000-0000-0000-0000-000000000007',
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
    label: 'ASYNC (Telemetry)',
    labelStyle: { fill: '#a1a1aa', fontSize: 10, fontFamily: 'monospace' },
    labelBgStyle: { fill: '#18181b', fillOpacity: 0.9 }
  }
]

export default function DataMapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string>('00000000-0000-0000-0000-000000000002')

  // Subject Blast Radius Query
  const [subjectQuery, setSubjectQuery] = useState('customer@example.com')
  const [blastResult, setBlastResult] = useState<SubjectBlastRadius | null>(null)
  const [blastLoading, setBlastLoading] = useState(false)

  const handleComputeBlastRadius = async () => {
    try {
      setBlastLoading(true)
      const res = await fetch(`/api/blast-radius?subject=${encodeURIComponent(subjectQuery)}`)
      const json = await res.json()
      if (json.success) {
        setBlastResult(json.data)

        // Highlight affected nodes in graph
        const affectedIds = new Set(json.data.systems_affected.map((s: any) => s.id))
        setNodes((nds) =>
          nds.map((n) => {
            const isAffected = affectedIds.has(n.id)
            return {
              ...n,
              style: {
                ...n.style,
                border: isAffected ? '2px solid #06b6d4' : '1px solid #3f3f46',
                boxShadow: isAffected ? '0 0 15px rgba(6, 182, 212, 0.4)' : 'none'
              }
            }
          })
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBlastLoading(false)
    }
  }

  useEffect(() => {
    handleComputeBlastRadius()
  }, [])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
  }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Lineage & Blast Radius Map</h1>
          <p className="text-zinc-400 text-sm">
            Interactive graph showing how personal data propagates through connected data systems
          </p>
        </div>
      </div>

      {/* Blast Radius Query Bar */}
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
            <Input
              value={subjectQuery}
              onChange={(e) => setSubjectQuery(e.target.value)}
              placeholder="Search data subject (e.g., customer@example.com, rahul@example.com)..."
              className="pl-9 bg-zinc-950 border-zinc-800 text-xs font-mono"
            />
          </div>
          <Button
            onClick={handleComputeBlastRadius}
            disabled={blastLoading}
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs h-9 px-4 shrink-0"
          >
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            {blastLoading ? 'Calculating...' : 'Calculate Blast Radius'}
          </Button>
        </div>

        {blastResult && (
          <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Systems Affected</span>
              <span className="text-lg font-bold text-cyan-400">{blastResult.systems_affected.length} Systems</span>
            </div>
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">PII Discovered</span>
              <span className="text-lg font-bold text-cyan-400">{blastResult.pii_records_count} Records</span>
            </div>
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Deletion Operations</span>
              <span className="text-lg font-bold text-cyan-400">{blastResult.deletion_actions_count} Actions</span>
            </div>
            <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
              <span className="text-[10px] uppercase font-mono text-zinc-500 block">Verification Checks</span>
              <span className="text-lg font-bold text-emerald-400">{blastResult.verification_checks_count} Checks</span>
            </div>
          </div>
        )}
      </Card>

      {/* Main Graph & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-8">
          <Card className="bg-zinc-900 border-zinc-800 h-[680px] overflow-hidden flex flex-col">
            <CardHeader className="bg-zinc-950/60 border-b border-zinc-800 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-mono uppercase text-zinc-300">Data Lineage Canvas</CardTitle>
                <CardDescription className="text-[11px] text-zinc-500">
                  Highlighted nodes indicate active blast radius impact for {subjectQuery}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-400">
                Interactive Graph
              </Badge>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative bg-zinc-950">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
                className="bg-zinc-950"
              >
                <Controls className="bg-zinc-900 border-zinc-800 text-zinc-300 fill-zinc-300" />
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#27272a" />
              </ReactFlow>
            </CardContent>
          </Card>
        </div>

        {/* Node & Blast Radius Details Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3 border-b border-zinc-800/80">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Selected System Details</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                  ACTIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">System Identifier</span>
                <span className="font-mono text-zinc-300 text-[11px]">{selectedNodeId}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">System Role</span>
                <span className="font-semibold text-zinc-200">
                  {selectedNodeId.endsWith('2') ? 'Customer Database (Primary PostgreSQL)' :
                   selectedNodeId.endsWith('3') ? 'CRM (Salesforce Contacts)' :
                   selectedNodeId.endsWith('4') ? 'Marketing Platform (Campaign Audiences)' :
                   selectedNodeId.endsWith('7') ? 'Analytics Warehouse (Snowflake)' : 'Connected Integration Node'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">Data Lineage Classification</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px]">
                    PII (Personal)
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                    Sensitive
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">
                    Financial
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>Downstream Depth:</span>
                  <span className="font-mono text-zinc-200">3 Hops</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Deletion Method:</span>
                  <span className="font-mono text-cyan-400">Targeted Connector Purge</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Verification Check:</span>
                  <span className="font-mono text-emerald-400">Automated Post-Purge Scan</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Lineage Legend */}
          <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-2.5 text-xs text-zinc-400">
            <div className="font-semibold text-zinc-200 text-xs flex items-center gap-2">
              <Network className="h-4 w-4 text-cyan-400" />
              Lineage Propagation Rules
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span><strong className="text-zinc-300">PUSH:</strong> Synchronous account ingest</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span><strong className="text-zinc-300">SYNC:</strong> Scheduled pipeline sync</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span><strong className="text-zinc-300">ASYNC:</strong> Event stream into telemetry lake</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
