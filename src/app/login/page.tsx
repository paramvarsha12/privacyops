'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Building2, UserCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { privacyStore } from '@/lib/store/privacy-store'
import { Role } from '@/types'

export default function LoginPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'signin' | 'tenant'>('signin')
  const [email, setEmail] = useState('demo@acme.com')
  const [password, setPassword] = useState('••••••••')
  const [selectedRole, setSelectedRole] = useState<Role>('OWNER')
  const [loading, setLoading] = useState(false)

  // Tenant onboarding form
  const [tenantName, setTenantName] = useState('Acme Technologies')
  const [tenantWebsite, setTenantWebsite] = useState('https://acmetech.io')
  const [tenantEmail, setTenantEmail] = useState('privacy@acmetech.io')

  const handleLaunchDemoRole = (role: Role) => {
    setLoading(true)
    privacyStore.setCurrentRole(role)
    document.cookie = 'demo_session=true; path=/; max-age=86400'
    setTimeout(() => {
      router.push('/dashboard')
    }, 300)
  }

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (tenantName) {
      privacyStore.setOrganization(tenantName)
    }
    privacyStore.setCurrentRole('OWNER')
    document.cookie = 'demo_session=true; path=/; max-age=86400'
    setTimeout(() => {
      router.push('/dashboard')
    }, 400)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 selection:bg-cyan-500/20">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">PrivacyOps</h1>
          <p className="text-xs text-zinc-400 font-mono">
            DEVELOPER-FIRST PRIVACY INFRASTRUCTURE &bull; DPDP WORKFLOWS
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2 text-center rounded-md font-medium transition-colors ${
              activeTab === 'signin' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Access Existing Workspace
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tenant')}
            className={`flex-1 py-2 text-center rounded-md font-medium transition-colors ${
              activeTab === 'tenant' ? 'bg-zinc-800 text-zinc-100 shadow' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Tenant Organization
          </button>
        </div>

        {activeTab === 'signin' ? (
          <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sign in or Launch Instant Demo</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                Select your operational role to explore privacy workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* 1-Click Role Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    Instant Demo Roles (RBAC Enabled)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { role: 'OWNER' as Role, label: 'Organization Owner', desc: 'Full administration' },
                    { role: 'PRIVACY_OFFICER' as Role, label: 'Privacy Officer', desc: 'Executes & verifies requests' },
                    { role: 'SECURITY_OFFICER' as Role, label: 'Developer', desc: 'API & connector debugging' },
                    { role: 'EMPLOYEE' as Role, label: 'Viewer', desc: 'Read-only compliance audit' },
                  ].map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleLaunchDemoRole(item.role)}
                      disabled={loading}
                      className="p-3 text-left rounded-lg bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900 transition-all text-xs group"
                    >
                      <div className="font-semibold text-zinc-200 group-hover:text-cyan-400 flex items-center justify-between">
                        {item.label}
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-zinc-900 px-2 text-zinc-500 font-mono">Or with credentials</span>
                </div>
              </div>

              {/* Standard Email / Password Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleLaunchDemoRole(selectedRole)
                }}
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 text-xs"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs mt-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Workspace'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Create Tenant Organization</CardTitle>
              <CardDescription className="text-zinc-400 text-xs">
                Set up a dedicated isolated privacy operations environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTenant} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tenantName" className="text-xs">Organization Name</Label>
                  <Input
                    id="tenantName"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    placeholder="e.g., Acme Technologies"
                    className="bg-zinc-950 border-zinc-800 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tenantWebsite" className="text-xs">Company Website</Label>
                  <Input
                    id="tenantWebsite"
                    value={tenantWebsite}
                    onChange={(e) => setTenantWebsite(e.target.value)}
                    placeholder="e.g., https://acmetech.io"
                    className="bg-zinc-950 border-zinc-800 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tenantEmail" className="text-xs">Data Protection Officer / Admin Email</Label>
                  <Input
                    id="tenantEmail"
                    type="email"
                    value={tenantEmail}
                    onChange={(e) => setTenantEmail(e.target.value)}
                    placeholder="e.g., dpo@acmetech.io"
                    className="bg-zinc-950 border-zinc-800 text-xs"
                    required
                  />
                </div>

                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs space-y-1.5 text-zinc-400">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Automatic Provisioning
                  </div>
                  <p className="text-[11px]">
                    Includes pre-configured demo connectors (PostgreSQL, CRM, Marketing, SendGrid, Snowflake) and deterministic DPDP classification rules.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs"
                >
                  {loading ? 'Creating Organization...' : 'Create Organization & Launch Infrastructure'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="text-center text-xs text-zinc-500">
          <Link href="/" className="text-cyan-400 hover:underline">
            &larr; Back to Product Overview
          </Link>
        </div>
      </div>
    </div>
  )
}
