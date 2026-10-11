import { BaseConnector } from './connector.interface'
import { ConnectorResult } from '@/types'

// Simulated Customer Database connector
// Represents a primary customer database storing user information

export class CustomerDatabaseConnector extends BaseConnector {
  private simulatedData: Map<string, Record<string, unknown>> = new Map()

  constructor(systemId: string) {
    super(systemId)
    this.initializeSimulatedData()
  }

  private initializeSimulatedData(): void {
    // Seed with demo data
    this.simulatedData.set('rahul@example.com', {
      id: 'customer-001',
      email: 'rahul@example.com',
      name: 'Rahul Sharma',
      phone: '+1-555-0123',
      address: '123 Demo Street, San Francisco, CA',
      created_at: '2024-01-15T00:00:00Z'
    })
  }

  async getSubjectData(identifier: string): Promise<ConnectorResult> {
    if (this.checkFailure()) {
      return {
        success: false,
        error: 'Simulated connection failure during data retrieval'
      }
    }

    const data = this.simulatedData.get(identifier)
    
    if (!data) {
      return {
        success: false,
        error: 'Subject not found in customer database'
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
        error: 'Simulated connection failure during deletion'
      }
    }

    const exists = this.simulatedData.has(identifier)
    
    if (!exists) {
      return {
        success: false,
        error: 'Subject not found in customer database'
      }
    }

    this.simulatedData.delete(identifier)
    
    return {
      success: true,
      data: { message: 'Subject data deleted successfully' }
    }
  }

  async correctSubjectData(identifier: string, corrections: Record<string, unknown>): Promise<ConnectorResult> {
    if (this.checkFailure()) {
      return {
        success: false,
        error: 'Simulated connection failure during correction'
      }
    }

    const existingData = this.simulatedData.get(identifier)
    
    if (!existingData) {
      return {
        success: false,
        error: 'Subject not found in customer database'
      }
    }

    // Apply corrections
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
        error: 'Simulated connection failure during verification'
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
