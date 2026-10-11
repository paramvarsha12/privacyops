import { BaseConnector } from './connector.interface'
import { ConnectorResult } from '@/types'

// Simulated Email Provider connector
// Represents a transactional email service

export class EmailConnector extends BaseConnector {
  private simulatedData: Map<string, Record<string, unknown>> = new Map()

  constructor(systemId: string) {
    super(systemId)
    this.initializeSimulatedData()
  }

  private initializeSimulatedData(): void {
    this.simulatedData.set('rahul@example.com', {
      id: 'recipient-001',
      email: 'rahul@example.com',
      suppression_list: false,
      bounce_count: 0,
      last_email_sent: '2024-09-20T10:30:00Z',
      created_at: '2024-01-19T00:00:00Z'
    })
  }

  async getSubjectData(identifier: string): Promise<ConnectorResult> {
    if (this.checkFailure()) {
      return {
        success: false,
        error: 'Simulated email provider connection failure'
      }
    }

    const data = this.simulatedData.get(identifier)
    
    if (!data) {
      return {
        success: false,
        error: 'Email recipient not found'
      }
    }

    return {
      success: true,
      data
    }
  }

  async deleteSubjectData(identifier: string): Promise<ConnectorResult> {
    if (this.checkFailure()) {
      return {
        success: false,
        error: 'Simulated email provider connection failure during deletion'
      }
    }

    const exists = this.simulatedData.has(identifier)
    
    if (!exists) {
      return {
        success: false,
        error: 'Email recipient not found'
      }
    }

    // Add to suppression list instead of deleting
    const data = this.simulatedData.get(identifier)!
    data.suppression_list = true
    this.simulatedData.set(identifier, data)
    
    return {
      success: true,
      data: { message: 'Email added to suppression list' }
    }
  }

  async correctSubjectData(identifier: string, corrections: Record<string, unknown>): Promise<ConnectorResult> {
    if (this.checkFailure()) {
      return {
        success: false,
        error: 'Simulated email provider connection failure during correction'
      }
    }

    const existingData = this.simulatedData.get(identifier)
    
    if (!existingData) {
      return {
        success: false,
        error: 'Email recipient not found'
      }
    }

    const updatedData = { ...existingData, ...corrections }
    this.simulatedData.set(identifier, updatedData)
    
    return {
      success: true,
      data: updatedData
    }
  }

  async verifySubjectData(identifier: string): Promise<ConnectorResult> {
    if (this.checkFailure()) {
      return {
        success: false,
        error: 'Simulated email provider connection failure during verification'
      }
    }

    const data = this.simulatedData.get(identifier)
    const exists = !!data
    
    return {
      success: true,
      data: {
        exists,
        verified: true,
        suppression_list: data?.suppression_list || false,
        timestamp: new Date().toISOString()
      }
    }
  }
}
