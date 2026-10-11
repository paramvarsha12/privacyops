import { PrivacyConnector } from '@/types'
import { CustomerDatabaseConnector } from './customer-database.connector'
import { CRMConnector } from './crm.connector'
import { MarketingConnector } from './marketing.connector'
import { SupportConnector } from './support.connector'
import { EmailConnector } from './email.connector'
import { AnalyticsConnector } from './analytics.connector'
import { System } from '@/types'

// Connector factory to create appropriate connectors based on system type
// This provides a centralized way to manage connector instances

export class ConnectorFactory {
  private static connectorCache: Map<string, PrivacyConnector> = new Map()

  static createConnector(system: System): PrivacyConnector {
    // Check cache first
    if (this.connectorCache.has(system.id)) {
      const connector = this.connectorCache.get(system.id)!
      // Update failure simulation if needed
      if (system.simulate_failure) {
        ;(connector as any).setFailureSimulation(true)
      } else {
        ;(connector as any).setFailureSimulation(false)
      }
      return connector
    }

    let connector: PrivacyConnector

    switch (system.type) {
      case 'DATABASE':
        connector = new CustomerDatabaseConnector(system.id)
        break
      case 'CRM':
        connector = new CRMConnector(system.id)
        break
      case 'MARKETING':
        connector = new MarketingConnector(system.id)
        break
      case 'SUPPORT':
        connector = new SupportConnector(system.id)
        break
      case 'EMAIL':
        connector = new EmailConnector(system.id)
        break
      case 'ANALYTICS':
        connector = new AnalyticsConnector(system.id)
        break
      default:
        // Default to customer database for unknown types
        connector = new CustomerDatabaseConnector(system.id)
    }

    // Set failure simulation if enabled
    if (system.simulate_failure) {
      ;(connector as any).setFailureSimulation(true)
    }

    // Cache the connector
    this.connectorCache.set(system.id, connector)

    return connector
  }

  static clearCache(): void {
    this.connectorCache.clear()
  }

  static getConnector(systemId: string): PrivacyConnector | undefined {
    return this.connectorCache.get(systemId)
  }
}
