'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield,
  Database,
  Network,
  FileText,
  Activity,
  Layers,
  Code2,
  Users,
  LayoutDashboard,
  History,
  CheckSquare,
  Building2,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { privacyStore } from '@/lib/store/privacy-store'
import { Role } from '@/types'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Data Sources', href: '/dashboard/data-sources', icon: Database },
  { name: 'Data Assets', href: '/dashboard/data-assets', icon: Layers },
  { name: 'Data Map', href: '/dashboard/data-map', icon: Network },
  { name: 'Privacy Requests', href: '/dashboard/privacy-requests', icon: FileText },
  { name: 'Consent Management', href: '/dashboard/consent', icon: CheckSquare },
  { name: 'Systems & Connectors', href: '/dashboard/systems', icon: Activity },
  { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: History },
  { name: 'Developer & APIs', href: '/dashboard/developer', icon: Code2 },
  { name: 'Team & RBAC', href: '/dashboard/team', icon: Users },
]

const roleOptions: { role: Role; label: string; desc: string }[] = [
  { role: 'OWNER', label: 'Owner', desc: 'Full tenant control' },
  { role: 'ADMIN', label: 'Admin', desc: 'Manage users & systems' },
  { role: 'PRIVACY_OFFICER', label: 'Privacy Officer', desc: 'Manage DPDP operations' },
  { role: 'SECURITY_OFFICER', label: 'Developer', desc: 'API & connector configs' },
  { role: 'EMPLOYEE', label: 'Viewer', desc: 'Read-only access' }
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const org = privacyStore.getOrganization()
  const [currentRole, setCurrentRole] = useState<Role>(privacyStore.getCurrentRole())
  const [showRoleMenu, setShowRoleMenu] = useState(false)

  const handleRoleChange = (role: Role) => {
    privacyStore.setCurrentRole(role)
    setCurrentRole(role)
    setShowRoleMenu(false)
  }

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-900/70 backdrop-blur-md flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-base font-bold text-zinc-100 tracking-tight">PrivacyOps</span>
            <span className="block text-[10px] uppercase font-mono tracking-widest text-cyan-500 font-semibold">
              Infrastructure
            </span>
          </div>
        </Link>
      </div>

      {/* Tenant / Organization Box */}
      <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/40">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-zinc-200 truncate">{org.name}</div>
            <div className="text-[10px] text-zinc-500 font-mono">Tenant ID: {org.slug}</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          Privacy Lifecycle
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-all group',
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 font-semibold border-l-2 border-cyan-500 rounded-l-none'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300')} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Role Switcher & User Profile Footer */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 relative">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors text-left"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="h-7 w-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                {currentRole.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-zinc-200 truncate">Demo Operator</div>
                <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                  <span>Role:</span>
                  <span className="font-semibold">{currentRole}</span>
                </div>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          </button>

          {/* Role selector dropdown */}
          {showRoleMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-1 z-50">
              <div className="px-2 py-1 text-[10px] font-mono text-zinc-400 border-b border-zinc-800">
                Switch Demo Role (RBAC)
              </div>
              {roleOptions.map((opt) => (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => handleRoleChange(opt.role)}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center justify-between',
                    currentRole === opt.role
                      ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  )}
                >
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-[10px] text-zinc-500">{opt.desc}</div>
                  </div>
                  {currentRole === opt.role && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
