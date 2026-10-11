import { describe, it, expect } from 'vitest'
import { PrivacyRequestStateMachine } from '@/lib/privacy/state-machine'
import { RequestStatus, ActionStatus } from '@/types'

describe('PrivacyRequestStateMachine', () => {
  describe('request state transitions', () => {
    it('should allow transition from PENDING to PROCESSING', () => {
      const canTransition = PrivacyRequestStateMachine.canTransitionRequest('PENDING', 'PROCESSING')
      expect(canTransition).toBe(true)
    })

    it('should allow transition from PENDING to CANCELLED', () => {
      const canTransition = PrivacyRequestStateMachine.canTransitionRequest('PENDING', 'CANCELLED')
      expect(canTransition).toBe(true)
    })

    it('should allow transition from PROCESSING to COMPLETED', () => {
      const canTransition = PrivacyRequestStateMachine.canTransitionRequest('PROCESSING', 'COMPLETED')
      expect(canTransition).toBe(true)
    })

    it('should allow transition from PROCESSING to FAILED', () => {
      const canTransition = PrivacyRequestStateMachine.canTransitionRequest('PROCESSING', 'FAILED')
      expect(canTransition).toBe(true)
    })

    it('should allow transition from PROCESSING to CANCELLED', () => {
      const canTransition = PrivacyRequestStateMachine.canTransitionRequest('PROCESSING', 'CANCELLED')
      expect(canTransition).toBe(true)
    })

    it('should allow transition from FAILED to PROCESSING (retry)', () => {
      const canTransition = PrivacyRequestStateMachine.canTransitionRequest('FAILED', 'PROCESSING')
      expect(canTransition).toBe(true)
    })

    it('should not allow transition from COMPLETED to any other state', () => {
      const states: RequestStatus[] = ['PENDING', 'PROCESSING', 'FAILED', 'CANCELLED']
      states.forEach(state => {
        const canTransition = PrivacyRequestStateMachine.canTransitionRequest('COMPLETED', state)
        expect(canTransition).toBe(false)
      })
    })

    it('should not allow transition from CANCELLED to any other state', () => {
      const states: RequestStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']
      states.forEach(state => {
        const canTransition = PrivacyRequestStateMachine.canTransitionRequest('CANCELLED', state)
        expect(canTransition).toBe(false)
      })
    })

    it('should not allow transition to same state', () => {
      const states: RequestStatus[] = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']
      states.forEach(state => {
        const canTransition = PrivacyRequestStateMachine.canTransitionRequest(state, state)
        expect(canTransition).toBe(false)
      })
    })

    it('should throw error for invalid request transition', () => {
      expect(() => {
        PrivacyRequestStateMachine.validateRequestTransition('COMPLETED', 'PROCESSING')
      }).toThrow('Invalid state transition')
    })
  })

  describe('action state transitions', () => {
    it('should allow transition from PENDING to PROCESSING', () => {
      const canTransition = PrivacyRequestStateMachine.canTransitionAction('PENDING', 'PROCESSING')
      expect(canTransition).toBe(true)
    })

    it('should allow transition from PROCESSING to COMPLETED', () => {
      const canTransition = PrivacyRequestStateMachine.canTransitionAction('PROCESSING', 'COMPLETED')
      expect(canTransition).toBe(true)
    })

    it('should allow transition from PROCESSING to FAILED', () => {
      const canTransition = PrivacyRequestStateMachine.canTransitionAction('PROCESSING', 'FAILED')
      expect(canTransition).toBe(true)
    })

    it('should allow transition from FAILED to PROCESSING (retry)', () => {
      const canTransition = PrivacyRequestStateMachine.canTransitionAction('FAILED', 'PROCESSING')
      expect(canTransition).toBe(true)
    })

    it('should not allow transition from COMPLETED to any other state', () => {
      const states: ActionStatus[] = ['PENDING', 'PROCESSING', 'FAILED']
      states.forEach(state => {
        const canTransition = PrivacyRequestStateMachine.canTransitionAction('COMPLETED', state)
        expect(canTransition).toBe(false)
      })
    })

    it('should not allow transition from FAILED to COMPLETED directly', () => {
      const canTransition = PrivacyRequestStateMachine.canTransitionAction('FAILED', 'COMPLETED')
      expect(canTransition).toBe(false)
    })

    it('should throw error for invalid action transition', () => {
      expect(() => {
        PrivacyRequestStateMachine.validateActionTransition('COMPLETED', 'PROCESSING')
      }).toThrow('Invalid action state transition')
    })
  })

  describe('terminal states', () => {
    it('should identify COMPLETED as terminal request status', () => {
      const isTerminal = PrivacyRequestStateMachine.isTerminalRequestStatus('COMPLETED')
      expect(isTerminal).toBe(true)
    })

    it('should identify FAILED as terminal request status', () => {
      const isTerminal = PrivacyRequestStateMachine.isTerminalRequestStatus('FAILED')
      expect(isTerminal).toBe(true)
    })

    it('should identify CANCELLED as terminal request status', () => {
      const isTerminal = PrivacyRequestStateMachine.isTerminalRequestStatus('CANCELLED')
      expect(isTerminal).toBe(true)
    })

    it('should not identify PENDING as terminal request status', () => {
      const isTerminal = PrivacyRequestStateMachine.isTerminalRequestStatus('PENDING')
      expect(isTerminal).toBe(false)
    })

    it('should not identify PROCESSING as terminal request status', () => {
      const isTerminal = PrivacyRequestStateMachine.isTerminalRequestStatus('PROCESSING')
      expect(isTerminal).toBe(false)
    })

    it('should identify COMPLETED as terminal action status', () => {
      const isTerminal = PrivacyRequestStateMachine.isTerminalActionStatus('COMPLETED')
      expect(isTerminal).toBe(true)
    })

    it('should identify FAILED as terminal action status', () => {
      const isTerminal = PrivacyRequestStateMachine.isTerminalActionStatus('FAILED')
      expect(isTerminal).toBe(true)
    })

    it('should not identify PENDING as terminal action status', () => {
      const isTerminal = PrivacyRequestStateMachine.isTerminalActionStatus('PENDING')
      expect(isTerminal).toBe(false)
    })

    it('should not identify PROCESSING as terminal action status', () => {
      const isTerminal = PrivacyRequestStateMachine.isTerminalActionStatus('PROCESSING')
      expect(isTerminal).toBe(false)
    })
  })

  describe('retry capability', () => {
    it('should allow retry for FAILED request status', () => {
      const canRetry = PrivacyRequestStateMachine.canRetryRequest('FAILED')
      expect(canRetry).toBe(true)
    })

    it('should not allow retry for COMPLETED request status', () => {
      const canRetry = PrivacyRequestStateMachine.canRetryRequest('COMPLETED')
      expect(canRetry).toBe(false)
    })

    it('should not allow retry for PENDING request status', () => {
      const canRetry = PrivacyRequestStateMachine.canRetryRequest('PENDING')
      expect(canRetry).toBe(false)
    })

    it('should allow retry for FAILED action status', () => {
      const canRetry = PrivacyRequestStateMachine.canRetryAction('FAILED')
      expect(canRetry).toBe(true)
    })

    it('should not allow retry for COMPLETED action status', () => {
      const canRetry = PrivacyRequestStateMachine.canRetryAction('COMPLETED')
      expect(canRetry).toBe(false)
    })

    it('should not allow retry for PENDING action status', () => {
      const canRetry = PrivacyRequestStateMachine.canRetryAction('PENDING')
      expect(canRetry).toBe(false)
    })
  })
})
