import { getDb } from '../db'
import { DataFlow } from '../../types'
import { BaseRepository } from './base'

export class DataFlowRepository implements BaseRepository<DataFlow> {
  async findById(id: string): Promise<DataFlow | null> {
    const db = await getDb()
    const { data, error } = await db
      .from('data_flows')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async findAll(filters?: Record<string, unknown>): Promise<DataFlow[]> {
    const db = await getDb()
    let query = db.from('data_flows').select('*')

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async findByOrganization(organizationId: string): Promise<DataFlow[]> {
    return this.findAll({ organization_id: organizationId })
  }

  async findBySourceSystem(sourceSystemId: string): Promise<DataFlow[]> {
    return this.findAll({ source_system_id: sourceSystemId })
  }

  async findByDestinationSystem(destinationSystemId: string): Promise<DataFlow[]> {
    return this.findAll({ destination_system_id: destinationSystemId })
  }

  async findByDataAsset(dataAssetId: string): Promise<DataFlow[]> {
    return this.findAll({ data_asset_id: dataAssetId })
  }

  async create(data: Partial<DataFlow>): Promise<DataFlow> {
    const db = await getDb()
    const { data: created, error } = await db
      .from('data_flows')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created
  }

  async update(id: string, data: Partial<DataFlow>): Promise<DataFlow | null> {
    const db = await getDb()
    const { data: updated, error } = await db
      .from('data_flows')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb()
    const { error } = await db.from('data_flows').delete().eq('id', id)
    if (error) throw error
    return true
  }
}

export const dataFlowRepository = new DataFlowRepository()
