import { getDb } from '../db'
import { System } from '../../types'
import { BaseRepository } from './base'

export class SystemRepository implements BaseRepository<System> {
  async findById(id: string): Promise<System | null> {
    const db = await getDb()
    const { data, error } = await db
      .from('systems')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async findAll(filters?: Record<string, unknown>): Promise<System[]> {
    const db = await getDb()
    let query = db.from('systems').select('*')

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async findByOrganization(organizationId: string): Promise<System[]> {
    return this.findAll({ organization_id: organizationId })
  }

  async create(data: Partial<System>): Promise<System> {
    const db = await getDb()
    const { data: created, error } = await db
      .from('systems')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created
  }

  async update(id: string, data: Partial<System>): Promise<System | null> {
    const db = await getDb()
    const { data: updated, error } = await db
      .from('systems')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb()
    const { error } = await db.from('systems').delete().eq('id', id)
    if (error) throw error
    return true
  }

  async toggleFailureSimulation(id: string): Promise<System | null> {
    const system = await this.findById(id)
    if (!system) return null

    return this.update(id, { simulate_failure: !system.simulate_failure })
  }
}

export const systemRepository = new SystemRepository()
