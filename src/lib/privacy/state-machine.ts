import { RequestStatus, ActionStatus } from '@/types'

// State machine for privacy requests and actions
// Ensures valid state transitions and prevents invalid operations

export class PrivacyRequestStateMachine {
  private static validTransitions: Record<RequestStatus, RequestStatus[]> = {
    PENDING: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['COMPLETED', 'FAILED', 'CANCELLED'],
    COMPLETED: [], // Terminal state
    FAILED: ['PROCESSING'], // Can retry
    CANCELLED: [] // Terminal state
  }

  private static actionValidTransitions: Record<ActionStatus, ActionStatus[]> = {
    PENDING: ['PROCESSING'],
    PROCESSING: ['COMPLETED', 'FAILED'],
    COMPLETED: [], // Terminal state
    FAILED: ['PROCESSING'] // Can retry
  }

  static canTransitionRequest(
    from: RequestStatus,
    to: RequestStatus
  ): boolean {
    if (from === to) return false
    return this.validTransitions[from].includes(to)
  }

  static canTransitionAction(
    from: ActionStatus,
    to: ActionStatus
  ): boolean {
    if (from === to) return false
    return this.actionValidTransitions[from].includes(to)
  }

  static validateRequestTransition(
    from: RequestStatus,
    to: RequestStatus
  ): void {
    if (!this.canTransitionRequest(from, to)) {
      throw new Error(
        `Invalid state transition from ${from} to ${to}. Valid transitions: ${this.validTransitions[from].join(', ')}`
      )
    }
  }

  static validateActionTransition(
    from: ActionStatus,
    to: ActionStatus
  ): void {
    if (!this.canTransitionAction(from, to)) {
      throw new Error(
        `Invalid action state transition from ${from} to ${to}. Valid transitions: ${this.actionValidTransitions[from].join(', ')}`
      )
    }
  }

  static isTerminalRequestStatus(status: RequestStatus): boolean {
    return status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED'
  }

  static isTerminalActionStatus(status: ActionStatus): boolean {
    return status === 'COMPLETED' || status === 'FAILED'
  }

  static canRetryRequest(status: RequestStatus): boolean {
    return status === 'FAILED'
  }

  static canRetryAction(status: ActionStatus): boolean {
    return status === 'FAILED'
  }
}
