import { NextRequest, NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const privacyRequest = privacyStore.getPrivacyRequest(id)

    if (!privacyRequest) {
      return NextResponse.json(
        { success: false, error: `Privacy request '${id}' not found` },
        { status: 404 }
      )
    }

    const actions = privacyStore.getRequestActions(id)
    const timeline = privacyStore.getRequestTimeline(id)

    return NextResponse.json({
      success: true,
      data: privacyRequest,
      actions,
      timeline,
      systems_affected_count: actions.length
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch privacy request details' },
      { status: 500 }
    )
  }
}
