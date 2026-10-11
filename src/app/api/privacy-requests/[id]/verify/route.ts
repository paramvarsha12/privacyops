import { NextRequest, NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const verified = await privacyStore.verifyPrivacyRequest(id)
    const privacyRequest = privacyStore.getPrivacyRequest(id)
    const timeline = privacyStore.getRequestTimeline(id)

    return NextResponse.json({
      success: true,
      verified,
      data: privacyRequest,
      timeline,
      message: verified
        ? 'All downstream connector verification checks passed'
        : 'One or more verification checks failed'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Verification execution failed' },
      { status: 500 }
    )
  }
}
