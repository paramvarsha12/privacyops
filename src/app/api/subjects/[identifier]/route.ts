import { NextRequest, NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params
    const decodedSubject = decodeURIComponent(identifier).toLowerCase()

    const blast = privacyStore.calculateSubjectBlastRadius(decodedSubject)
    const consent = privacyStore.getConsentRecords().filter(
      c => c.subject_identifier.toLowerCase() === decodedSubject
    )
    const requests = privacyStore.getPrivacyRequests().filter(
      r => r.subject_identifier.toLowerCase() === decodedSubject
    )

    return NextResponse.json({
      success: true,
      subject_identifier: decodedSubject,
      discovered_in_systems: blast.systems_affected.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        status: s.status
      })),
      consent_records: consent,
      request_history: requests,
      blast_radius: {
        systems_affected_count: blast.systems_affected.length,
        deletion_actions_required: blast.deletion_actions_count,
        verification_checks_required: blast.verification_checks_count,
        lineage_path: blast.lineage_path
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch subject profile' },
      { status: 500 }
    )
  }
}
