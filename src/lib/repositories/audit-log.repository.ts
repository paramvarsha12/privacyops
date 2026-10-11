import { getDb } from '../db'
import { AuditLog } from '../../types'
import { BaseRepository } from './base'

export class AuditLogRepository implements BaseRepository<AuditLog> {
  async findById(id: string): Promise<AuditLog | null> {
    const db = await getDb()
    const { data, error } = await db
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async findAll(filters?: Record<string, unknown>): Promise<AuditLog[]> {
    const db = await getDb()
    let query = db.from('audit_logs').select('*')

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async findByOrganization(organizationId: string): Promise<AuditLog[]> {
    return this.findAll({ organization_id: organizationId })
  }

  async findByActor(actorId: string): Promise<AuditLog[]> {
    return this.findAll({ actor_id: actorId })
  }

  async findByEventType(eventType: AuditLog['event_type']): Promise<AuditLog[]> {
    return this.findAll({ event_type: eventType })
  }

  async findByResource(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    return this.findAll({ resource_type: resourceType, resource_id: resourceId })
  }

  async create(data: Partial<AuditLog>): Promise<AuditLog> {
    const db = await getDb()
    const { data: created, error } = await db
      .from('audit_logs')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created
  }

  async update(id: string, data: Partial<AuditLog>): Promise<AuditLog | null> {
    // Audit logs should be append-only from application perspective
    throw new Error('Audit logs cannot be updated')
  }

  async delete(id: string): Promise<boolean> {
    // Audit logs should be append-only from application perspective
    throw new Error('Audit logs cannot be deleted')
  }

  async logEvent(
    organizationId: string,
    actorId: string,
    eventType: AuditLog['event_type'],
    resourceType: string,
    resourceId: string,
    status: 'SUCCESS' | 'FAILURE',
    metadata?: Record<string, unknown>
  ): Promise<AuditLog> {
    return this.create({
      organization_id: organizationId,
      actor_id: actorId,
      event_type: eventType,
      resource_type: resourceType,
      resource_id: resourceId,
      status,
      metadata: metadata || {}
    })
  }
}

export const auditLogRepository = new AuditLogRepository()
