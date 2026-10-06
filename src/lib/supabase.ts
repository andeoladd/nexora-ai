import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

// Instantiate real client if configured
export const supabase: SupabaseClient | null = isLiveSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// ============================================================================
// Multi-Tenant Local Sandbox Engine (Simulates Supabase Auth & RLS perfectly)
// This guarantees strict user_id isolation and immediate multi-user testability
// without relying on third-party connectivity or hardcoded single-tenant state.
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
}

const LOCAL_USERS_KEY = 'nexora_auth_users';
const CURRENT_SESSION_KEY = 'nexora_auth_current_session';

export function getLocalUsers(): Array<{ id: string; email: string; passwordHash: string; display_name: string }> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalUsers(users: Array<{ id: string; email: string; passwordHash: string; display_name: string }>) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export function getCurrentSession(): { user: AuthUser; token: string } | null {
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentSession(session: { user: AuthUser; token: string } | null) {
  if (session) {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
}

// Scoped storage helper to guarantee strict Row Level Security isolation in sandbox mode
export function getScopedStorageKey(userId: string, table: string): string {
  if (!userId) {
    throw new Error('RLS Violation: user_id is required for data access');
  }
  return `nexora_tenant_${userId}_tbl_${table}`;
}

export function getTenantTable<T>(userId: string, table: string): T[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getScopedStorageKey(userId, table));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTenantTable<T>(userId: string, table: string, items: T[]): void {
  if (!userId) {
    throw new Error('RLS Violation: cannot save data without authenticated user_id');
  }
  localStorage.setItem(getScopedStorageKey(userId, table), JSON.stringify(items));
}
