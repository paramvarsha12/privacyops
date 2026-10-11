'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Users,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  UserPlus,
  Lock,
  ArrowRight
} from 'lucide-react'
import { privacyStore } from '@/lib/store/privacy-store'
import { Role } from '@/types'

const permissionsMatrix: { capability: string; owner: boolean; admin: boolean; privacy: boolean; dev: boolean; viewer: boolean }[] = [
  { capability: 'Manage Organization & Billing', owner: true, admin: false, privacy: false, dev: false, viewer: false },
  { capability: 'Invite & Manage Team Roles', owner: true, admin: true, privacy: false, dev: false, viewer: false },
  { capability: 'Configure Systems & Connectors', owner: true, admin: true, privacy: false, dev: true, viewer: false },
  { capability: 'Trigger Privacy Requests (DELETE/ACCESS)', owner: true, admin: true, privacy: true, dev: false, viewer: false },
  { capability: 'Verify Deletions & Sign Off', owner: true, admin: false, privacy: true, dev: false, viewer: false },
  { capability: 'Run Data Discovery Scans', owner: true, admin: true, privacy: true, dev: true, viewer: false },
  { capability: 'Generate API Keys & Access REST Docs', owner: true, admin: true, privacy: false, dev: true, viewer: false },
  { capability: 'Inspect Immutable Audit Ledger', owner: true, admin: true, privacy: true, dev: true, viewer: true },
]

export default function TeamPage() {
  const [profiles, setProfiles] = useState(privacyStore.getProfiles())
  const [currentRole, setCurrentRole] = useState<Role>(privacyStore.getCurrentRole())
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<Role>('PRIVACY_OFFICER')
  const [showInviteModal, setShowInviteModal] = useState(false)

  const handleRoleSwitch = (role: Role) => {
    privacyStore.setCurrentRole(role)
    setCurrentRole(role)
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail || !newName) return
    const newProfile = {
      id: `prof-${Date.now()}`,
      organization_id: '00000000-0000-0000-0000-000000000001',
      user_id: `usr-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setProfiles([...profiles, newProfile])
    setNewName('')
    setNewEmail('')
    setShowInviteModal(false)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team & Role-Based Access Control</h1>
          <p className="text-zinc-400 text-sm">
            Enforce segregation of duties between Privacy Officers, Developers, and Compliance Auditors
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs h-9"
        >
          <UserPlus className="h-3.5 w-3.5 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Active Role Simulator */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-mono uppercase text-cyan-400 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Active Session Role Simulator
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            Switch your persona to verify RBAC access restrictions across privacy workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { role: 'OWNER' as Role, label: 'Owner', desc: 'Full administration' },
              { role: 'ADMIN' as Role, label: 'Admin', desc: 'Org configs' },
              { role: 'PRIVACY_OFFICER' as Role, label: 'Privacy Officer', desc: 'DPO workflows' },
              { role: 'SECURITY_OFFICER' as Role, label: 'Developer', desc: 'API & Connectors' },
              { role: 'EMPLOYEE' as Role, label: 'Viewer', desc: 'Read-only audit' }
            ].map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => handleRoleSwitch(item.role)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  currentRole === item.role
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="font-semibold text-xs flex items-center justify-between">
                  {item.label}
                  {currentRole === item.role && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">{item.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <CardTitle className="text-sm font-semibold">Active Team Roster</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Assigned credentials within Acme Technologies
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-xs">User Name</TableHead>
                <TableHead className="text-xs">Work Email</TableHead>
                <TableHead className="text-xs">Assigned RBAC Role</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.id} className="border-zinc-800/60 hover:bg-zinc-800/30">
                  <TableCell className="font-medium text-xs text-zinc-200">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 font-mono">
                    {p.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        p.role === 'OWNER'
                          ? 'border-cyan-500/40 text-cyan-400'
                          : p.role === 'PRIVACY_OFFICER'
                          ? 'border-purple-500/40 text-purple-400'
                          : p.role === 'ADMIN'
                          ? 'border-blue-500/40 text-blue-400'
                          : 'border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {p.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <CardTitle className="text-sm font-semibold">RBAC Permissions Matrix</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Fine-grained capability breakdown across role categories
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-xs">Platform Capability</TableHead>
                <TableHead className="text-xs text-center">Owner</TableHead>
                <TableHead className="text-xs text-center">Admin</TableHead>
                <TableHead className="text-xs text-center">Privacy Officer</TableHead>
                <TableHead className="text-xs text-center">Developer</TableHead>
                <TableHead className="text-xs text-center">Viewer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionsMatrix.map((row) => (
                <TableRow key={row.capability} className="border-zinc-800/60 hover:bg-zinc-800/30">
                  <TableCell className="text-xs text-zinc-200 font-medium">
                    {row.capability}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.owner ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.admin ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.privacy ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.dev ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {row.viewer ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-zinc-600 mx-auto" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="bg-zinc-900 border-zinc-800 max-w-md w-full shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Invite Team Member</CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Grant role-based operational permissions to a teammate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="memberName" className="text-xs">Full Name</Label>
                  <Input
                    id="memberName"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Rohit Deshmukh"
                    className="bg-zinc-950 border-zinc-800 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="memberEmail" className="text-xs">Work Email</Label>
                  <Input
                    id="memberEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g., rohit@acme.com"
                    className="bg-zinc-950 border-zinc-800 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="memberRole" className="text-xs">Role Assignment</Label>
                  <select
                    id="memberRole"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="w-full h-9 rounded-md bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="ADMIN">Admin (Technical management)</option>
                    <option value="PRIVACY_OFFICER">Privacy Officer (DPDP execution)</option>
                    <option value="SECURITY_OFFICER">Developer (API & Connectors)</option>
                    <option value="EMPLOYEE">Viewer (Read-only)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 text-xs border-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs"
                  >
                    Send Invitation
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
