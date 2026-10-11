import { describe, it, expect } from 'vitest'
import { classificationService } from '@/lib/services/classification.service'
import { Classification } from '@/types'

describe('ClassificationService', () => {
  describe('classify', () => {
    it('should classify email fields as PERSONAL', () => {
      const result = classificationService.classify('email')
      expect(result.classification).toBe('PERSONAL')
      expect(result.reason).toContain('email')
    })

    it('should classify customer_email as PERSONAL', () => {
      const result = classificationService.classify('customer_email')
      expect(result.classification).toBe('PERSONAL')
    })

    it('should classify password as CREDENTIAL', () => {
      const result = classificationService.classify('password')
      expect(result.classification).toBe('CREDENTIAL')
    })

    it('should classify card_number as FINANCIAL', () => {
      const result = classificationService.classify('card_number')
      expect(result.classification).toBe('FINANCIAL')
    })

    it('should classify date_of_birth as SENSITIVE', () => {
      const result = classificationService.classify('date_of_birth')
      expect(result.classification).toBe('SENSITIVE')
    })

    it('should classify phone_number as PERSONAL', () => {
      const result = classificationService.classify('phone_number')
      expect(result.classification).toBe('PERSONAL')
    })

    it('should classify unknown fields as UNKNOWN', () => {
      const result = classificationService.classify('random_field_xyz')
      expect(result.classification).toBe('UNKNOWN')
      expect(result.reason).toContain('No matching classification pattern')
    })

    it('should be case-insensitive', () => {
      const result1 = classificationService.classify('EMAIL')
      const result2 = classificationService.classify('Email')
      const result3 = classificationService.classify('email')
      
      expect(result1.classification).toBe('PERSONAL')
      expect(result2.classification).toBe('PERSONAL')
      expect(result3.classification).toBe('PERSONAL')
    })

    it('should handle underscores and spaces', () => {
      const result1 = classificationService.classify('customer_email')
      const result2 = classificationService.classify('customer email')
      
      expect(result1.classification).toBe('PERSONAL')
      expect(result2.classification).toBe('PERSONAL')
    })
  })

  describe('determineSensitivity', () => {
    it('should return HIGH for FINANCIAL classification', () => {
      const sensitivity = classificationService.determineSensitivity('FINANCIAL')
      expect(sensitivity).toBe('HIGH')
    })

    it('should return HIGH for SENSITIVE classification', () => {
      const sensitivity = classificationService.determineSensitivity('SENSITIVE')
      expect(sensitivity).toBe('HIGH')
    })

    it('should return CRITICAL for CREDENTIAL classification', () => {
      const sensitivity = classificationService.determineSensitivity('CREDENTIAL')
      expect(sensitivity).toBe('CRITICAL')
    })

    it('should return MEDIUM for PERSONAL classification', () => {
      const sensitivity = classificationService.determineSensitivity('PERSONAL')
      expect(sensitivity).toBe('MEDIUM')
    })

    it('should return LOW for PUBLIC classification', () => {
      const sensitivity = classificationService.determineSensitivity('PUBLIC')
      expect(sensitivity).toBe('LOW')
    })

    it('should return LOW for UNKNOWN classification', () => {
      const sensitivity = classificationService.determineSensitivity('UNKNOWN')
      expect(sensitivity).toBe('LOW')
    })
  })

  describe('determineRiskLevel', () => {
    it('should align risk level with sensitivity', () => {
      const riskMap: Record<Classification, string> = {
        PERSONAL: 'MEDIUM',
        SENSITIVE: 'HIGH',
        FINANCIAL: 'HIGH',
        CREDENTIAL: 'CRITICAL',
        PUBLIC: 'LOW',
        UNKNOWN: 'LOW'
      }

      for (const [classification, expectedRisk] of Object.entries(riskMap)) {
        const risk = classificationService.determineRiskLevel(classification as Classification)
        expect(risk).toBe(expectedRisk)
      }
    })
  })
})
