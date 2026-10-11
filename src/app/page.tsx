import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Database,
  Network,
  Shield,
  CheckCircle2,
  Terminal,
  Layers,
  Search,
  Code2,
  Lock,
  GitFork
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Navigation */}
      <nav className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-cyan-400" />
              </div>
              <span className="text-lg font-bold tracking-tight">PrivacyOps</span>
              <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-[10px] font-mono">
                DPDP Infrastructure
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-300 text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs">
                  Create Tenant Organization
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Developer-First Privacy Operations Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Map your data.
            <br />
            Understand its blast radius.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Automate privacy actions.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            PrivacyOps helps engineering and privacy teams discover where personal data lives across connected databases and APIs, calculate downstream blast radius, and execute verifiable deletion and access workflows.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-sm h-11 px-6">
                Explore the Platform Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-sm h-11 px-6">
                Create Tenant Organization
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Flow: DISCOVER → MAP → ACT → VERIFY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-2">
            The Operational Lifecycle
          </h2>
          <p className="text-2xl font-bold">End-to-End Privacy Execution Architecture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'DISCOVER',
              icon: Search,
              desc: 'Scan databases, CRMs, APIs, and analytics lakes to classify personal and sensitive records automatically.'
            },
            {
              step: '02',
              title: 'MAP',
              icon: Network,
              desc: 'Trace relationships between data subjects, tables, fields, and downstream pipelines to determine blast radius.'
            },
            {
              step: '03',
              title: 'ACT',
              icon: Terminal,
              desc: 'Orchestrate idempotent ACCESS, DELETE, and CORRECT operations across all connected data connectors.'
            },
            {
              step: '04',
              title: 'VERIFY',
              icon: CheckCircle2,
              desc: 'Confirm removal across all nodes, validate anonymization, and seal cryptographic immutable audit trails.'
            }
          ].map((item) => (
            <div key={item.step} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-cyan-500 font-bold">{item.step}</span>
                <div className="h-8 w-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-300">
                  <item.icon className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-zinc-100 mb-2">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Blast Radius Demonstration Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <Badge variant="secondary" className="mb-2 text-[10px] font-mono bg-zinc-800 text-cyan-400">
              Technical Lineage Concept
            </Badge>
            <h3 className="text-2xl font-bold">Understanding the Privacy Blast Radius</h3>
            <p className="text-zinc-400 text-sm mt-1">
              When a subject requests data deletion under DPDP regulations, deleting from the primary database is insufficient. PrivacyOps calculates the complete downstream blast radius.
            </p>
          </div>

          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold">
                  @
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-200">Subject Query: customer@example.com</div>
                  <div className="text-xs text-zinc-500">Querying data graph across 7 registered connectors</div>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
                Discovery Status: 4 Systems Affected
              </Badge>
            </div>

            {/* Downstream propagation visual */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800">
                <div className="text-xs text-zinc-500 font-mono uppercase">Systems Affected</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">4</div>
                <div className="text-[11px] text-zinc-400 mt-1">DB, CRM, Marketing, Warehouse</div>
              </div>
              <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800">
                <div className="text-xs text-zinc-500 font-mono uppercase">PII Records Found</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">7</div>
                <div className="text-[11px] text-zinc-400 mt-1">Email, Phone, Address, UPI</div>
              </div>
              <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800">
                <div className="text-xs text-zinc-500 font-mono uppercase">Deletion Actions</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">4</div>
                <div className="text-[11px] text-zinc-400 mt-1">Targeted API requests</div>
              </div>
              <div className="bg-zinc-900/80 p-4 rounded-lg border border-zinc-800">
                <div className="text-xs text-zinc-500 font-mono uppercase">Verification Checks</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">4 / 4</div>
                <div className="text-[11px] text-zinc-400 mt-1">Post-deletion audit checks</div>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/40 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-400 flex flex-wrap items-center gap-2">
              <span className="text-zinc-500">Execution Chain:</span>
              <span className="text-zinc-200">Customer DB</span>
              <span className="text-cyan-500">&rarr;</span>
              <span className="text-zinc-200">CRM (Salesforce)</span>
              <span className="text-cyan-500">&rarr;</span>
              <span className="text-zinc-200">Marketing (Klaviyo)</span>
              <span className="text-cyan-500">&rarr;</span>
              <span className="text-zinc-200">Analytics (Snowflake)</span>
              <span className="text-cyan-500">&rarr;</span>
              <span className="text-emerald-400 font-semibold">[VERIFIED & AUDITED]</span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer-First API Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs">
              <Code2 className="h-4 w-4" />
              <span>REST API & Webhooks</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Built for Engineering Teams, Not Just Compliance Dashboards
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Integrate privacy operations directly into your CI/CD pipelines, signup endpoints, and microservices. Trigger automated deletions on account cancellation with verifiable proof.
            </p>
            <div className="space-y-2 pt-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>Deterministic PII and sensitive data classification engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>Synchronous and asynchronous execution state machines</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span>Append-only compliance audit ledger for regulatory reporting</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 font-mono text-[11px] text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-zinc-500">POST /api/privacy-requests</span>
              </span>
              <span className="text-cyan-400">201 Created</span>
            </div>
            <pre className="p-4 text-[12px] font-mono text-zinc-300 overflow-x-auto leading-relaxed bg-zinc-950/60">
{`// Create deletion request with auto-execution
POST /api/privacy-requests
Content-Type: application/json

{
  "subject_identifier": "customer@example.com",
  "request_type": "DELETE",
  "auto_execute": true
}

// Response
{
  "success": true,
  "data": {
    "id": "PR-1042",
    "status": "COMPLETED",
    "subject": "customer@example.com",
    "systems_affected": 4
  },
  "execution_summary": "4 deletion operations verified"
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 mt-16 bg-zinc-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <div>
            &copy; 2026 PrivacyOps. Developer-first privacy infrastructure for modern businesses.
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="hover:text-zinc-300">Workspace</Link>
            <Link href="/dashboard/developer" className="hover:text-zinc-300">API Documentation</Link>
            <Link href="/dashboard/data-map" className="hover:text-zinc-300">Lineage Engine</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
