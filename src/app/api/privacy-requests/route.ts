import { NextRequest, NextResponse } from 'next/server'
import { privacyStore } from '@/lib/store/privacy-store'
import { RequestType } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const subject = searchParams.get('subject')

    let requests = privacyStore.getPrivacyRequests()

    if (status) {
      requests = requests.filter(r => r.status.toLowerCase() === status.toLowerCase())
    }
    if (type) {
      requests = requests.filter(r => r.request_type.toLowerCase() === type.toLowerCase())
    }
    if (subject) {
      requests = requests.filter(r => r.subject_identifier.toLowerCase().includes(subject.toLowerCase()))
    }

    return NextResponse.json({
      success: true,
      data: requests,
      total: requests.length,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch privacy requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject_identifier, request_type = 'DELETE', auto_execute = true } = body

    if (!subject_identifier) {
      return NextResponse.json(
        { success: false, error: 'subject_identifier is required' },
        { status: 400 }
      )
    }

    const validTypes: RequestType[] = ['ACCESS', 'DELETE', 'CORRECT']
    const normalizedType = request_type.toUpperCase() as RequestType
    if (!validTypes.includes(normalizedType)) {
      return NextResponse.json(
        { success: false, error: `Invalid request_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await privacyStore.createPrivacyRequest(
      subject_identifier,
      normalizedType,
      auto_execute
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Privacy request created and processed successfully',
        data: result.request,
        actions: result.actions,
        timeline: privacyStore.getRequestTimeline(result.request.id),
        execution_summary: result.executionSummary
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process privacy request' },
      { status: 500 }
    )
  }
}
