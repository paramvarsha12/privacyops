import { DashboardSidebar } from '@/components/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex text-zinc-50 antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-zinc-950 min-h-screen">
        {children}
      </main>
    </div>
  )
}
