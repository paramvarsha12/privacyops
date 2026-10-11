import { getDb } from '../db'
import { Organization } from '../../types'
import { BaseRepository } from './base'

export class OrganizationRepository implements BaseRepository<Organization> {
  async findById(id: string): Promise<Organization | null> {
    const db = await getDb()
    const { data, error } = await db
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const db = await getDb()
    const { data, error } = await db
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  }

  async findAll(filters?: Record<string, unknown>): Promise<Organization[]> {
    const db = await getDb()
    let query = db.from('organizations').select('*')

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async create(data: Partial<Organization>): Promise<Organization> {
    const db = await getDb()
    const { data: created, error } = await db
      .from('organizations')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created
  }

  async update(id: string, data: Partial<Organization>): Promise<Organization | null> {
    const db = await getDb()
    const { data: updated, error } = await db
      .from('organizations')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb()
    const { error } = await db.from('organizations').delete().eq('id', id)
    if (error) throw error
    return true
  }
}

export const organizationRepository = new OrganizationRepository()
