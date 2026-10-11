import { NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'

export async function GET() {
  try {
    const metrics = privacyStore.getDashboardMetrics()
    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
