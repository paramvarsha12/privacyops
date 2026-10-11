import { NextRequest, NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updated = await privacyStore.retryPrivacyRequest(id)
    const timeline = privacyStore.getRequestTimeline(id)
    const actions = privacyStore.getRequestActions(id)

    return NextResponse.json({
      success: true,
      message: `Retried failed actions for request ${id}`,
      data: updated,
      actions,
      timeline
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retry privacy request' },
      { status: 500 }
    )
  }
}
