import { BaseConnector } from './connector.interface'
import { ConnectorResult } from '@/types'

// Simulated CRM connector
// Represents a customer relationship management system

export class CRMConnector extends BaseConnector {
  private simulatedData: Map<string, Record<string, unknown>> = new Map()

  constructor(systemId: string) {
    super(systemId)
    this.initializeSimulatedData()
  }

  private initializeSimulatedData(): void {
    this.simulatedData.set('rahul@example.com', {
      id: 'contact-001',
      email: 'rahul@example.com',
      name: 'Rahul Sharma',
      phone: '+1-555-0123',
      company: 'Demo Corp',
      status: 'active',
      lead_score: 85,
      created_at: '2024-01-16T00:00:00Z'
    })
  }

  async getSubjectData(identifier: string): Promise<ConnectorResult> {
    if (this.checkFailure()) {
      return {
        success: false,
        error: 'Simulated CRM connection failure during data retrieval'
      }
    }

    const data = this.simulatedData.get(identifier)
    
    if (!data) {
      return {
        success: false,
        error: 'Contact not found in CRM'
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
        error: 'Simulated CRM connection failure during deletion'
      }
    }

    const exists = this.simulatedData.has(identifier)
    
    if (!exists) {
      return {
        success: false,
        error: 'Contact not found in CRM'
      }
    }

    this.simulatedData.delete(identifier)
    
    return {
      success: true,
      data: { message: 'Contact deleted successfully from CRM' }
    }
  }

  async correctSubjectData(identifier: string, corrections: Record<string, unknown>): Promise<ConnectorResult> {
    if (this.checkFailure()) {
      return {
        success: false,
        error: 'Simulated CRM connection failure during correction'
      }
    }

    const existingData = this.simulatedData.get(identifier)
    
    if (!existingData) {
      return {
        success: false,
        error: 'Contact not found in CRM'
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
        error: 'Simulated CRM connection failure during verification'
      }
    }

    const exists = this.simulatedData.has(identifier)
    
    return {
      success: true,
      data: {
        exists,
        verified: true,
        timestamp: new Date().toISOString()
      }
    }
  }
}
