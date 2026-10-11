import { NextRequest, NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject') || 'customer@example.com'

    const blast = privacyStore.calculateSubjectBlastRadius(subject)

    return NextResponse.json({
      success: true,
      data: blast,
      summary: {
        subject: blast.subject_identifier,
        systems_affected_count: blast.systems_affected.length,
        pii_records_discovered: blast.pii_records_count,
        deletion_actions_required: blast.deletion_actions_count,
        verification_checks_required: blast.verification_checks_count,
        depth: blast.depth
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to calculate blast radius' },
      { status: 500 }
    )
  }
}
