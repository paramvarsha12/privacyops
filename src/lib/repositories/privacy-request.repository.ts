import { getDb } from '../db'
import { PrivacyRequest } from '../../types'
import { BaseRepository } from './base'

export class PrivacyRequestRepository implements BaseRepository<PrivacyRequest> {
  async findById(id: string): Promise<PrivacyRequest | null> {
    const db = await getDb()
    const { data, error } = await db
      .from('privacy_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async findAll(filters?: Record<string, unknown>): Promise<PrivacyRequest[]> {
    const db = await getDb()
    let query = db.from('privacy_requests').select('*')

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async findByOrganization(organizationId: string): Promise<PrivacyRequest[]> {
    return this.findAll({ organization_id: organizationId })
  }

  async findBySubject(subjectIdentifier: string): Promise<PrivacyRequest[]> {
    return this.findAll({ subject_identifier: subjectIdentifier })
  }

  async create(data: Partial<PrivacyRequest>): Promise<PrivacyRequest> {
    const db = await getDb()
    const { data: created, error } = await db
      .from('privacy_requests')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created
  }

  async update(id: string, data: Partial<PrivacyRequest>): Promise<PrivacyRequest | null> {
    const db = await getDb()
    const { data: updated, error } = await db
      .from('privacy_requests')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb()
    const { error } = await db.from('privacy_requests').delete().eq('id', id)
    if (error) throw error
    return true
  }

  async updateStatus(id: string, status: PrivacyRequest['status']): Promise<PrivacyRequest | null> {
    const updateData: Partial<PrivacyRequest> = { status }
    
    if (status === 'COMPLETED' || status === 'FAILED') {
      updateData.completed_at = new Date().toISOString()
    }

    return this.update(id, updateData)
  }
}

export const privacyRequestRepository = new PrivacyRequestRepository()
