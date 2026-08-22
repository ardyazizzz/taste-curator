import { requireSupabase } from '../lib/supabase'
import type { Database } from '../types/database'

export async function signInAdmin(email: string, password: string) {
  const supabase = requireSupabase()
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOutAdmin() {
  const supabase = requireSupabase()
  return supabase.auth.signOut()
}

export async function getAdminSession() {
  const supabase = requireSupabase()
  return supabase.auth.getSession()
}

export async function listClients() {
  const supabase = requireSupabase()
  return supabase.from('clients').select('*').order('name')
}

export async function createClient(input: Database['public']['Tables']['clients']['Insert']) {
  const supabase = requireSupabase()
  return supabase.from('clients').insert(input).select().single()
}
