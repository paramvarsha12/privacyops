import { Classification } from '@/types'

// Deterministic data classification service
// This classifies data fields based on field name patterns
// In production, this could be enhanced with ML models, but for demo purposes
// we use a deterministic rule-based approach

export class ClassificationService {
  private classificationRules: Map<string, Classification> = new Map()

  constructor() {
    this.initializeRules()
  }

  private initializeRules(): void {
    // Email patterns
    this.classificationRules.set('email', 'PERSONAL')
    this.classificationRules.set('customer_email', 'PERSONAL')
    this.classificationRules.set('user_email', 'PERSONAL')
    this.classificationRules.set('contact_email', 'PERSONAL')

    // Name patterns
    this.classificationRules.set('name', 'PERSONAL')
    this.classificationRules.set('customer_name', 'PERSONAL')
    this.classificationRules.set('first_name', 'PERSONAL')
    this.classificationRules.set('last_name', 'PERSONAL')
    this.classificationRules.set('full_name', 'PERSONAL')

    // Phone patterns
    this.classificationRules.set('phone', 'PERSONAL')
    this.classificationRules.set('phone_number', 'PERSONAL')
    this.classificationRules.set('mobile', 'PERSONAL')
    this.classificationRules.set('telephone', 'PERSONAL')

    // Address patterns
    this.classificationRules.set('address', 'PERSONAL')
    this.classificationRules.set('billing_address', 'PERSONAL')
    this.classificationRules.set('shipping_address', 'PERSONAL')
    this.classificationRules.set('street_address', 'PERSONAL')

    // Sensitive personal data
    this.classificationRules.set('date_of_birth', 'SENSITIVE')
    this.classificationRules.set('dob', 'SENSITIVE')
    this.classificationRules.set('birth_date', 'SENSITIVE')
    this.classificationRules.set('ssn', 'SENSITIVE')
    this.classificationRules.set('social_security', 'SENSITIVE')
    this.classificationRules.set('national_id', 'SENSITIVE')
    this.classificationRules.set('passport', 'SENSITIVE')
    this.classificationRules.set('license', 'SENSITIVE')

    // Financial data
    this.classificationRules.set('card_number', 'FINANCIAL')
    this.classificationRules.set('credit_card', 'FINANCIAL')
    this.classificationRules.set('payment_reference', 'FINANCIAL')
    this.classificationRules.set('bank_account', 'FINANCIAL')
    this.classificationRules.set('iban', 'FINANCIAL')
    this.classificationRules.set('routing_number', 'FINANCIAL')

    // Credential data
    this.classificationRules.set('password', 'CREDENTIAL')
    this.classificationRules.set('api_key', 'CREDENTIAL')
    this.classificationRules.set('secret', 'CREDENTIAL')
    this.classificationRules.set('token', 'CREDENTIAL')
    this.classificationRules.set('auth_token', 'CREDENTIAL')

    // Consent patterns
    this.classificationRules.set('consent', 'PERSONAL')
    this.classificationRules.set('marketing_consent', 'PERSONAL')
    this.classificationRules.set('privacy_consent', 'PERSONAL')

    // Support/ticket data
    this.classificationRules.set('ticket', 'PERSONAL')
    this.classificationRules.set('support_ticket', 'PERSONAL')
    this.classificationRules.set('issue', 'PERSONAL')
  }

  classify(fieldName: string): { classification: Classification; reason: string } {
    const normalizedFieldName = fieldName.toLowerCase().replace(/[_\s]/g, '')

    // Direct match
    for (const [pattern, classification] of this.classificationRules) {
      const normalizedPattern = pattern.toLowerCase().replace(/[_\s]/g, '')
      if (normalizedFieldName === normalizedPattern) {
        return {
          classification,
          reason: `Direct match with known pattern: ${pattern}`
        }
      }
    }

    // Contains match
    for (const [pattern, classification] of this.classificationRules) {
      const normalizedPattern = pattern.toLowerCase().replace(/[_\s]/g, '')
      if (normalizedFieldName.includes(normalizedPattern)) {
        return {
          classification,
          reason: `Contains known pattern: ${pattern}`
        }
      }
    }

    // Email detection
    if (normalizedFieldName.includes('email') || normalizedFieldName.includes('mail')) {
      return {
        classification: 'PERSONAL',
        reason: 'Contains email-related keywords'
      }
    }

    // Phone detection
    if (normalizedFieldName.includes('phone') || normalizedFieldName.includes('mobile')) {
      return {
        classification: 'PERSONAL',
        reason: 'Contains phone-related keywords'
      }
    }

    // Name detection
    if (normalizedFieldName.includes('name')) {
      return {
        classification: 'PERSONAL',
        reason: 'Contains name-related keywords'
      }
    }

    // Default to UNKNOWN for unrecognized fields
    return {
      classification: 'UNKNOWN',
      reason: 'No matching classification pattern found'
    }
  }

  determineSensitivity(classification: Classification): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const sensitivityMap: Record<Classification, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
      PERSONAL: 'MEDIUM',
      SENSITIVE: 'HIGH',
      FINANCIAL: 'HIGH',
      CREDENTIAL: 'CRITICAL',
      PUBLIC: 'LOW',
      UNKNOWN: 'LOW'
    }

    return sensitivityMap[classification]
  }

  determineRiskLevel(classification: Classification): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Risk level aligns with sensitivity for most cases
    return this.determineSensitivity(classification)
  }
}

export const classificationService = new ClassificationService()
