import { PrivacyConnector, ConnectorResult } from '@/types'

// Base connector interface that all integration connectors must implement
// This provides a common abstraction for different system types

export abstract class BaseConnector implements PrivacyConnector {
  protected systemId: string
  protected simulateFailure: boolean = false

  constructor(systemId: string) {
    this.systemId = systemId
  }

  setFailureSimulation(enabled: boolean): void {
    this.simulateFailure = enabled
  }

  abstract getSubjectData(identifier: string): Promise<ConnectorResult>
  abstract deleteSubjectData(identifier: string): Promise<ConnectorResult>
  abstract correctSubjectData(identifier: string, corrections: Record<string, unknown>): Promise<ConnectorResult>
  abstract verifySubjectData(identifier: string): Promise<ConnectorResult>

  protected checkFailure(): boolean {
    return this.simulateFailure
  }
}
