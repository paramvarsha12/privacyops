import { getDb } from '../db'
import { PrivacyRequestAction } from '../../types'
import { BaseRepository } from './base'

export class PrivacyRequestActionRepository implements BaseRepository<PrivacyRequestAction> {
  async findById(id: string): Promise<PrivacyRequestAction | null> {
    const db = await getDb()
    const { data, error } = await db
      .from('privacy_request_actions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async findAll(filters?: Record<string, unknown>): Promise<PrivacyRequestAction[]> {
    const db = await getDb()
    let query = db.from('privacy_request_actions').select('*')

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async findByPrivacyRequest(privacyRequestId: string): Promise<PrivacyRequestAction[]> {
    return this.findAll({ privacy_request_id: privacyRequestId })
  }

  async findBySystem(systemId: string): Promise<PrivacyRequestAction[]> {
    return this.findAll({ system_id: systemId })
  }

  async findByStatus(status: PrivacyRequestAction['status']): Promise<PrivacyRequestAction[]> {
    return this.findAll({ status })
  }

  async findFailedActions(privacyRequestId: string): Promise<PrivacyRequestAction[]> {
    return this.findAll({ 
      privacy_request_id: privacyRequestId, 
      status: 'FAILED' 
    })
  }

  async findPendingActions(privacyRequestId: string): Promise<PrivacyRequestAction[]> {
    return this.findAll({ 
      privacy_request_id: privacyRequestId, 
      status: 'PENDING' 
    })
  }

  async create(data: Partial<PrivacyRequestAction>): Promise<PrivacyRequestAction> {
    const db = await getDb()
    const { data: created, error } = await db
      .from('privacy_request_actions')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created
  }

  async update(id: string, data: Partial<PrivacyRequestAction>): Promise<PrivacyRequestAction | null> {
    const db = await getDb()
    const { data: updated, error } = await db
      .from('privacy_request_actions')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb()
    const { error } = await db.from('privacy_request_actions').delete().eq('id', id)
    if (error) throw error
    return true
  }

  async updateStatus(id: string, status: PrivacyRequestAction['status']): Promise<PrivacyRequestAction | null> {
    const updateData: Partial<PrivacyRequestAction> = { status }
    
    if (status === 'PROCESSING') {
      updateData.started_at = new Date().toISOString()
    } else if (status === 'COMPLETED' || status === 'FAILED') {
      updateData.completed_at = new Date().toISOString()
    }

    return this.update(id, updateData)
  }

  async incrementAttemptCount(id: string): Promise<PrivacyRequestAction | null> {
    const action = await this.findById(id)
    if (!action) return null

    return this.update(id, { attempt_count: action.attempt_count + 1 })
  }

  async setError(id: string, errorMessage: string): Promise<PrivacyRequestAction | null> {
    return this.update(id, { error_message: errorMessage })
  }
}

export const privacyRequestActionRepository = new PrivacyRequestActionRepository()
