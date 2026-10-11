import { getDb } from '../db'
import { Profile } from '../../types'
import { BaseRepository } from './base'

export class ProfileRepository implements BaseRepository<Profile> {
  async findById(id: string): Promise<Profile | null> {
    const db = await getDb()
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async findAll(filters?: Record<string, unknown>): Promise<Profile[]> {
    const db = await getDb()
    let query = db.from('profiles').select('*')

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async findByOrganization(organizationId: string): Promise<Profile[]> {
    return this.findAll({ organization_id: organizationId })
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    const db = await getDb()
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  async create(data: Partial<Profile>): Promise<Profile> {
    const db = await getDb()
    const { data: created, error } = await db
      .from('profiles')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return created
  }

  async update(id: string, data: Partial<Profile>): Promise<Profile | null> {
    const db = await getDb()
    const { data: updated, error } = await db
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDb()
    const { error } = await db.from('profiles').delete().eq('id', id)
    if (error) throw error
    return true
  }

  async hasPermission(userId: string, requiredRole: Profile['role']): Promise<boolean> {
    const profile = await this.findByUserId(userId)
    if (!profile) return false

    const roleHierarchy: Record<Profile['role'], number> = {
      OWNER: 6,
      ADMIN: 5,
      PRIVACY_OFFICER: 4,
      SECURITY_OFFICER: 4,
      EMPLOYEE: 2,
      AUDITOR: 1
    }

    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole]
  }
}

export const profileRepository = new ProfileRepository()
