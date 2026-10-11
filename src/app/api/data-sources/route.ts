import { NextRequest, NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'

export async function GET() {
  try {
    const dataSources = privacyStore.getDataSourcesSummary()
    return NextResponse.json({
      success: true,
      data: dataSources,
      total_sources: dataSources.length,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch data sources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, system_id } = body

    if (action === 'scan') {
      const scanResult = privacyStore.runDataDiscoveryScan()
      return NextResponse.json({
        success: true,
        message: 'Data discovery scan completed across all connected systems',
        data: scanResult
      })
    }

    if (action === 'toggle_failure' && system_id) {
      const updated = privacyStore.toggleSystemFailure(system_id)
      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'System not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        message: `Failure simulation for '${updated.name}' set to ${updated.simulate_failure}`,
        data: updated
      })
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Supported: 'scan', 'toggle_failure'" },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process data sources operation' },
      { status: 500 }
    )
  }
}
