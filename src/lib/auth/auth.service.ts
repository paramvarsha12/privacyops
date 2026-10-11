import { createClient } from '../../supabase/client'
import { createClient as createServerClient } from '../../supabase/server'
import { Profile } from '../../types'
import { profileRepository } from '../repositories/profile.repository'

// Authentication service for managing user sessions and profiles

export class AuthService {
  /**
   * Get the current authenticated user
   */
  async getCurrentUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) throw error
    return user
  }

  /**
   * Get the current user's profile
   */
  async getCurrentProfile(): Promise<Profile | null> {
    const user = await this.getCurrentUser()
    if (!user) return null

    return profileRepository.findByUserId(user.id)
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, name: string) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })

    if (error) throw error
    return data
  }

  /**
   * Sign out
   */
  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * Create a user profile for a new user
   */
  async createProfile(
    userId: string,
    organizationId: string,
    name: string,
    email: string,
    role: Profile['role'] = 'EMPLOYEE'
  ): Promise<Profile> {
    return profileRepository.create({
      user_id: userId,
      organization_id: organizationId,
      name,
      email,
      role
    })
  }

  /**
   * Check if user has required role
   */
  async hasRole(requiredRole: Profile['role']): Promise<boolean> {
    const profile = await this.getCurrentProfile()
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

  /**
   * Server-side auth check
   */
  static async getServerUser() {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) throw error
    return user
  }

  /**
   * Server-side profile check
   */
  static async getServerProfile(): Promise<Profile | null> {
    const user = await this.getServerUser()
    if (!user) return null

    return profileRepository.findByUserId(user.id)
  }
}

export const authService = new AuthService()
