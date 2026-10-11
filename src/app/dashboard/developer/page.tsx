'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Code2,
  Terminal,
  Play,
  Copy,
  Check,
  Key,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'

interface ApiEndpointDoc {
  method: 'GET' | 'POST'
  path: string
  title: string
  description: string
  sampleBody?: string
}

const endpoints: ApiEndpointDoc[] = [
  {
    method: 'POST',
    path: '/api/privacy-requests',
    title: 'Create Privacy Request',
    description: 'Trigger an automated, verifiable deletion or access request across connected systems',
    sampleBody: JSON.stringify(
      {
        subject_identifier: 'customer@example.com',
        request_type: 'DELETE',
        auto_execute: true
      },
      null,
      2
    )
  },
  {
    method: 'GET',
    path: '/api/privacy-requests',
    title: 'List Privacy Requests',
    description: 'Query all privacy requests with status, type, and timeline summaries'
  },
  {
    method: 'GET',
    path: '/api/blast-radius?subject=customer@example.com',
    title: 'Compute Blast Radius',
    description: 'Calculate downstream systems affected and PII counts for a given data subject'
  },
  {
    method: 'GET',
    path: '/api/data-sources',
    title: 'List Data Sources',
    description: 'Fetch all connected database, CRM, and analytics endpoints with schema sizes'
  },
  {
    method: 'GET',
    path: '/api/data-map',
    title: 'Query Data Lineage Graph',
    description: 'Retrieve graph nodes and directional edges representing privacy data flows'
  },
  {
    method: 'GET',
    path: '/api/subjects/customer@example.com',
    title: 'Lookup Data Subject',
    description: 'Retrieve connected system memberships, consent authorizations, and history'
  },
  {
    method: 'GET',
    path: '/api/audit-logs',
    title: 'Retrieve Audit Ledger',
    description: 'Fetch immutable event stream records for regulatory reporting'
  },
  {
    method: 'GET',
    path: '/api/consent',
    title: 'List Consent Authorizations',
    description: 'Query active and withdrawn DPDP purpose-based consent records'
  }
]

export default function DeveloperPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDoc>(endpoints[0])
  const [requestBody, setRequestBody] = useState(endpoints[0].sampleBody || '')
  const [responseOutput, setResponseOutput] = useState<string | null>(null)
  const [responseStatus, setResponseStatus] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  const handleSelectEndpoint = (ep: ApiEndpointDoc) => {
    setSelectedEndpoint(ep)
    setRequestBody(ep.sampleBody || '')
    setResponseOutput(null)
    setResponseStatus(null)
  }

  const handleExecuteRequest = async () => {
    try {
      setLoading(true)
      setResponseOutput(null)
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk_live_privops_demo9812'
        }
      }

      if (selectedEndpoint.method === 'POST' && requestBody) {
        options.body = requestBody
      }

      const res = await fetch(selectedEndpoint.path, options)
      setResponseStatus(res.status)
      const json = await res.json()
      setResponseOutput(JSON.stringify(json, null, 2))
    } catch (err: any) {
      setResponseStatus(500)
      setResponseOutput(JSON.stringify({ error: err?.message || 'Network error' }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText('sk_live_privops_acme_74219bfe2891')
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Developer & API Infrastructure</h1>
            <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 font-mono text-[10px]">
              REST v1
            </Badge>
          </div>
          <p className="text-zinc-400 text-sm">
            Programmatically query data lineage, trigger verifiable deletions, and extract audit records
          </p>
        </div>

        {/* API Key box */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs">
          <Key className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-zinc-400 font-mono">sk_live_privops_acme_••••••••</span>
          <Button size="sm" variant="ghost" onClick={handleCopyKey} className="h-7 px-2 text-zinc-300">
            {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Main Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoint Selector Sidebar */}
        <div className="lg:col-span-5 space-y-2">
          <div className="text-xs font-mono uppercase text-zinc-400 font-semibold mb-3">
            Available Operations
          </div>
          <div className="space-y-1.5">
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method
              return (
                <button
                  key={`${ep.method}-${ep.path}`}
                  type="button"
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex items-center justify-between ${
                    isSelected
                      ? 'bg-zinc-900 border-cyan-500/50 shadow-md'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-2">
                    <div className="font-semibold text-zinc-200 truncate">{ep.title}</div>
                    <div className="font-mono text-[11px] text-zinc-400 truncate flex items-center gap-2">
                      <span
                        className={`font-bold ${
                          ep.method === 'POST' ? 'text-amber-400' : 'text-cyan-400'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="text-zinc-500">{ep.path}</span>
                    </div>
                  </div>
                  {isSelected && <div className="h-2 w-2 rounded-full bg-cyan-400 shrink-0" />}
                </button>
              )
            })}
          </div>

          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs space-y-2 text-zinc-400 mt-6">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              API Security & Authentication
            </div>
            <p className="text-[11px]">
              Authenticate all HTTP requests using Bearer tokens in the <code className="text-zinc-200">Authorization</code> header. All privacy operations emit immutable audit trail events.
            </p>
          </div>
        </div>

        {/* Live Interactive Tester */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
            <CardHeader className="bg-zinc-950/60 border-b border-zinc-800 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <Badge
                    className={
                      selectedEndpoint.method === 'POST'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    }
                  >
                    {selectedEndpoint.method}
                  </Badge>
                  <span className="text-zinc-200 font-semibold">{selectedEndpoint.path}</span>
                </div>
                <Button
                  onClick={handleExecuteRequest}
                  disabled={loading}
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs h-7 px-3"
                >
                  <Play className="h-3 w-3 mr-1 fill-current" />
                  {loading ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
              <CardDescription className="text-zinc-400 text-xs mt-1">
                {selectedEndpoint.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Request Body if POST */}
              {selectedEndpoint.method === 'POST' && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                    Request Payload (JSON)
                  </div>
                  <textarea
                    rows={6}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-zinc-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* Response Output Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                  <span>Live API Response</span>
                  {responseStatus && (
                    <span
                      className={`font-bold ${
                        responseStatus < 300 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      HTTP {responseStatus}
                    </span>
                  )}
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 min-h-[220px] max-h-[360px] overflow-auto font-mono text-xs text-zinc-300">
                  {loading ? (
                    <div className="text-zinc-500 italic p-4">Executing request against PrivacyOps engine...</div>
                  ) : responseOutput ? (
                    <pre className="whitespace-pre-wrap">{responseOutput}</pre>
                  ) : (
                    <div className="text-zinc-600 italic p-4">
                      Click &ldquo;Send Request&rdquo; to execute this endpoint live.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
