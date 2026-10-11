import { getDb } from '../db'
import { DataAsset } from '../../types'
import { BaseRepository } from './base'

export class DataAssetRepository implements BaseRepository<DataAsset> {
  async findById(id: string): Promise<DataAsset | null> {
    const db = await getDb()
    const { data, error } = await db
      .from('data_assets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async findAll(filters?: Record<string, unknown>): Promise<DataAsset[]> {
    const db = await getDb()
    let query = db.from('data_assets').select('*')

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async findByOrganization(organizationId: string): Promise<DataAsset[]> {
    return this.findAll({ organization_id: organizationId })
  }

  async findBySystem(systemId: string): Promise<DataAsset[]> {
    return this.findAll({ system_id: systemId })
  }

  async create(data: Partial<DataAsset>): Promise<DataAsset> {
    const db = await getDb()
    const { data: created, error } = await db
      .from('data_assets')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created
  }

  async update(id: string, data: Partial<DataAsset>): Promise<DataAsset | null> {
    const db = await getDb()
    const { data: updated, error } = await db
      .from('data_assets')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb()
    const { error } = await db.from('data_assets').delete().eq('id', id)
    if (error) throw error
    return true
  }
}

export const dataAssetRepository = new DataAssetRepository()
