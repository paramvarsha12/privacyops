import { NextRequest, NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get('event_type')
    const resourceType = searchParams.get('resource_type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    let logs = privacyStore.getAuditLogs()

    if (eventType) {
      logs = logs.filter(l => l.event_type.toLowerCase() === eventType.toLowerCase())
    }
    if (resourceType) {
      logs = logs.filter(l => l.resource_type.toLowerCase() === resourceType.toLowerCase())
    }
    if (status) {
      logs = logs.filter(l => l.status.toLowerCase() === status.toLowerCase())
    }

    return NextResponse.json({
      success: true,
      data: logs.slice(0, limit),
      total: logs.length,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
