import { NextRequest, NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')

    let records = privacyStore.getConsentRecords()
    if (subject) {
      records = records.filter(c => c.subject_identifier.toLowerCase().includes(subject.toLowerCase()))
    }

    return NextResponse.json({
      success: true,
      data: records,
      total: records.length
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch consent records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !['GRANTED', 'WITHDRAWN'].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Valid 'id' and 'status' ('GRANTED' | 'WITHDRAWN') required" },
        { status: 400 }
      )
    }

    const updated = privacyStore.updateConsent(id, status)
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Consent record not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Consent updated to ${status}`,
      data: updated
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update consent' },
      { status: 500 }
    )
  }
}
