import { PrivacyRequest, PrivacyRequestAction, RequestType, RequestStatus, ActionStatus } from '../../types'
import { privacyRequestRepository } from '../repositories/privacy-request.repository'
import { privacyRequestActionRepository } from '../repositories/privacy-request-action.repository'
import { systemRepository } from '../repositories/system.repository'
import { dataFlowRepository } from '../repositories/data-flow.repository'
import { dataAssetRepository } from '../repositories/data-asset.repository'
import { auditLogRepository } from '../repositories/audit-log.repository'
import { graphService } from '../services/graph.service'
import { ConnectorFactory } from '../integrations/connector.factory'
import { PrivacyRequestStateMachine } from './state-machine'

// Privacy request orchestration service
// Manages the complete workflow: DISCOVER → MAP → ACT → VERIFY

export class PrivacyRequestService {
  /**
   * Create a new privacy request
   */
  async createRequest(
    organizationId: string,
    subjectIdentifier: string,
    requestType: RequestType,
    createdBy: string
  ): Promise<PrivacyRequest> {
    const request = await privacyRequestRepository.create({
      organization_id: organizationId,
      subject_identifier: subjectIdentifier,
      request_type: requestType,
      status: 'PENDING',
      created_by: createdBy
    })

    // Log the request creation
    await auditLogRepository.logEvent(
      organizationId,
      createdBy,
      'PRIVACY_REQUEST_CREATED',
      'privacy_request',
      request.id,
      'SUCCESS',
      { subject_identifier: subjectIdentifier, request_type: requestType }
    )

    return request
  }

  /**
   * Start processing a privacy request
   */
  async startRequest(requestId: string): Promise<PrivacyRequest> {
    const request = await privacyRequestRepository.findById(requestId)
    if (!request) {
      throw new Error('Privacy request not found')
    }

    PrivacyRequestStateMachine.validateRequestTransition(request.status, 'PROCESSING')

    const updated = await privacyRequestRepository.updateStatus(requestId, 'PROCESSING')

    await auditLogRepository.logEvent(
      request.organization_id,
      request.created_by,
      'PRIVACY_REQUEST_STARTED',
      'privacy_request',
      requestId,
      'SUCCESS'
    )

    return updated!
  }

  /**
   * Discover affected systems for a subject
   */
  async discoverAffectedSystems(requestId: string): Promise<string[]> {
    const request = await privacyRequestRepository.findById(requestId)
    if (!request) {
      throw new Error('Privacy request not found')
    }

    // Get all systems in the organization
    const systems = await systemRepository.findByOrganization(request.organization_id)

    // For the demo, we'll assume all systems could contain the subject's data
    // In production, this would be more sophisticated based on actual data discovery
    return systems.map(s => s.id)
  }

  /**
   * Generate an execution plan for the request
   */
  async generateExecutionPlan(requestId: string): Promise<PrivacyRequestAction[]> {
    const request = await privacyRequestRepository.findById(requestId)
    if (!request) {
      throw new Error('Privacy request not found')
    }

    const affectedSystemIds = await this.discoverAffectedSystems(requestId)
    const actions: PrivacyRequestAction[] = []

    for (const systemId of affectedSystemIds) {
      // Check if action already exists (idempotency)
      const existing = await privacyRequestActionRepository.findAll({
        privacy_request_id: requestId,
        system_id: systemId,
        action_type: request.request_type
      } as Record<string, unknown>)

      if (existing.length === 0) {
        const action = await privacyRequestActionRepository.create({
          privacy_request_id: requestId,
          system_id: systemId,
          action_type: request.request_type,
          status: 'PENDING',
          attempt_count: 0
        })
        actions.push(action)
      } else {
        actions.push(existing[0])
      }
    }

    return actions
  }

  /**
   * Execute a single action against a system
   */
  async executeAction(actionId: string): Promise<PrivacyRequestAction> {
    const action = await privacyRequestActionRepository.findById(actionId)
    if (!action) {
      throw new Error('Action not found')
    }

    const request = await privacyRequestRepository.findById(action.privacy_request_id)
    if (!request) {
      throw new Error('Request not found')
    }

    // Validate state transition
    PrivacyRequestStateMachine.validateActionTransition(action.status, 'PROCESSING')

    // Update to processing
    await privacyRequestActionRepository.updateStatus(actionId, 'PROCESSING')
    await privacyRequestActionRepository.incrementAttemptCount(actionId)

    // Log action start
    await auditLogRepository.logEvent(
      request.organization_id,
      request.created_by,
      'SYSTEM_ACTION_STARTED',
      'privacy_request_action',
      actionId,
      'SUCCESS',
      { system_id: action.system_id, action_type: action.action_type }
    )

    // Get the system and connector
    const system = await systemRepository.findById(action.system_id)
    if (!system) {
      throw new Error('System not found')
    }

    const connector = ConnectorFactory.createConnector(system)

    let result
    try {
      // Execute the appropriate action
      switch (action.action_type) {
        case 'DELETE':
          result = await connector.deleteSubjectData(request.subject_identifier)
          break
        case 'ACCESS':
          result = await connector.getSubjectData(request.subject_identifier)
          break
        case 'CORRECT':
          // For demo, no corrections provided
          result = await connector.correctSubjectData(request.subject_identifier, {})
          break
        default:
          throw new Error(`Unknown action type: ${action.action_type}`)
      }
    } catch (error) {
      result = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Update action status based on result
    if (result.success) {
      await privacyRequestActionRepository.updateStatus(actionId, 'COMPLETED')
      await auditLogRepository.logEvent(
        request.organization_id,
        request.created_by,
        'SYSTEM_ACTION_COMPLETED',
        'privacy_request_action',
        actionId,
        'SUCCESS',
        { system_id: action.system_id }
      )
    } else {
      await privacyRequestActionRepository.updateStatus(actionId, 'FAILED')
      await privacyRequestActionRepository.setError(actionId, result.error || 'Unknown error')
      await auditLogRepository.logEvent(
        request.organization_id,
        request.created_by,
        'SYSTEM_ACTION_FAILED',
        'privacy_request_action',
        actionId,
        'FAILURE',
        { system_id: action.system_id, error: result.error }
      )
    }

    return (await privacyRequestActionRepository.findById(actionId))!
  }

  /**
   * Execute all actions for a request
   */
  async executeAllActions(requestId: string): Promise<PrivacyRequestAction[]> {
    const actions = await privacyRequestActionRepository.findByPrivacyRequest(requestId)
    const results: PrivacyRequestAction[] = []

    for (const action of actions) {
      // Only execute pending or failed actions (idempotency)
      if (action.status === 'PENDING' || action.status === 'FAILED') {
        const result = await this.executeAction(action.id)
        results.push(result)
      } else {
        results.push(action)
      }
    }

    return results
  }

  /**
   * Verify execution of actions
   */
  async verifyActions(requestId: string): Promise<boolean> {
    const request = await privacyRequestRepository.findById(requestId)
    if (!request) {
      throw new Error('Request not found')
    }

    const actions = await privacyRequestActionRepository.findByPrivacyRequest(requestId)
    let allVerified = true

    for (const action of actions) {
      if (action.status !== 'COMPLETED') {
        continue
      }

      const system = await systemRepository.findById(action.system_id)
      if (!system) {
        continue
      }

      const connector = ConnectorFactory.createConnector(system)
      const result = await connector.verifySubjectData(request.subject_identifier)

      if (!result.success) {
        allVerified = false
      }
    }

    if (allVerified) {
      await auditLogRepository.logEvent(
        request.organization_id,
        request.created_by,
        'VERIFICATION_COMPLETED',
        'privacy_request',
        requestId,
        'SUCCESS'
      )
    }

    return allVerified
  }

  /**
   * Complete a privacy request
   */
  async completeRequest(requestId: string): Promise<PrivacyRequest> {
    const request = await privacyRequestRepository.findById(requestId)
    if (!request) {
      throw new Error('Privacy request not found')
    }

    // Check if all actions are completed
    const actions = await privacyRequestActionRepository.findByPrivacyRequest(requestId)
    const hasFailed = actions.some(a => a.status === 'FAILED')
    const hasPending = actions.some(a => a.status === 'PENDING')

    let finalStatus: RequestStatus

    if (hasFailed) {
      finalStatus = 'FAILED'
    } else if (hasPending) {
      throw new Error('Cannot complete request with pending actions')
    } else {
      finalStatus = 'COMPLETED'
    }

    PrivacyRequestStateMachine.validateRequestTransition(request.status, finalStatus)

    const updated = await privacyRequestRepository.updateStatus(requestId, finalStatus)

    await auditLogRepository.logEvent(
      request.organization_id,
      request.created_by,
      finalStatus === 'COMPLETED' ? 'PRIVACY_REQUEST_COMPLETED' : 'PRIVACY_REQUEST_FAILED',
      'privacy_request',
      requestId,
      finalStatus === 'COMPLETED' ? 'SUCCESS' : 'FAILURE'
    )

    return updated!
  }

  /**
   * Retry failed actions for a request
   */
  async retryFailedActions(requestId: string): Promise<PrivacyRequestAction[]> {
    const request = await privacyRequestRepository.findById(requestId)
    if (!request) {
      throw new Error('Privacy request not found')
    }

    const failedActions = await privacyRequestActionRepository.findFailedActions(requestId)

    for (const action of failedActions) {
      await auditLogRepository.logEvent(
        request.organization_id,
        request.created_by,
        'SYSTEM_ACTION_RETRIED',
        'privacy_request_action',
        action.id,
        'SUCCESS',
        { system_id: action.system_id, attempt: action.attempt_count + 1 }
      )
    }

    // Re-execute failed actions
    return this.executeAllActions(requestId)
  }

  /**
   * Get the execution status of a request
   */
  async getExecutionStatus(requestId: string): Promise<{
    request: PrivacyRequest
    actions: PrivacyRequestAction[]
    summary: {
      total: number
      completed: number
      failed: number
      pending: number
      processing: number
    }
  }> {
    const request = await privacyRequestRepository.findById(requestId)
    if (!request) {
      throw new Error('Privacy request not found')
    }

    const actions = await privacyRequestActionRepository.findByPrivacyRequest(requestId)

    const summary = {
      total: actions.length,
      completed: actions.filter((a: PrivacyRequestAction) => a.status === 'COMPLETED').length,
      failed: actions.filter((a: PrivacyRequestAction) => a.status === 'FAILED').length,
      pending: actions.filter((a: PrivacyRequestAction) => a.status === 'PENDING').length,
      processing: actions.filter((a: PrivacyRequestAction) => a.status === 'PROCESSING').length
    }

    return { request, actions, summary }
  }
}

export const privacyRequestService = new PrivacyRequestService()
