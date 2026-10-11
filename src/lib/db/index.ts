import { createClient } from '../../supabase/client'
import { createClient as createServerClient } from '../../supabase/server'

export async function getDb() {
  if (typeof window !== 'undefined') {
    return createClient()
  }
  return await createServerClient()
}
