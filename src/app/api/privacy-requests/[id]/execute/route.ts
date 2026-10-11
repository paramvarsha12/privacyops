import { NextRequest, NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updated = await privacyStore.executePrivacyRequest(id)
    const timeline = privacyStore.getRequestTimeline(id)
    const actions = privacyStore.getRequestActions(id)

    return NextResponse.json({
      success: true,
      message: `Privacy request ${id} execution completed with status ${updated.status}`,
      data: updated,
      actions,
      timeline
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to execute privacy request' },
      { status: 500 }
    )
  }
}
