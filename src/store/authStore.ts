import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  token: string | null
  currentUser: User | null
  users: User[]
  needsSetup: boolean
  loading: boolean
  checkSetup: () => Promise<void>
  login: (name: string, pin: string) => Promise<void>
  setup: (name: string, pin: string) => Promise<void>
  logout: () => Promise<void>
  fetchUsers: () => Promise<void>
  addUser: (name: string, pin: string, isAdmin: boolean) => Promise<void>
  updateUser: (id: string, data: { name?: string; pin?: string; isAdmin?: boolean }) => Promise<void>
  removeUser: (id: string) => Promise<void>
  clearSession: () => void
}

const API = ''

async function api(path: string, options: RequestInit = {}): Promise<any> {
  const token = useAuthStore.getState().token
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(`${API}${path}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  currentUser: null,
  users: [],
  needsSetup: false,
  loading: true,

  checkSetup: async () => {
    try {
      const { needsSetup, users } = await api('/api/setup')
      set({ needsSetup, users: users || [], loading: false })
    } catch {
      set({ needsSetup: true, loading: false })
    }
  },

  login: async (name, pin) => {
    const { token, user } = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, pin }),
    })
    set({ token, currentUser: user, needsSetup: false })
  },

  setup: async (name, pin) => {
    const { token, user } = await api('/api/setup', {
      method: 'POST',
      body: JSON.stringify({ name, pin }),
    })
    set({ token, currentUser: user, needsSetup: false })
  },

  logout: async () => {
    try { await api('/api/auth/logout', { method: 'POST' }) } catch {}
    set({ token: null, currentUser: null, users: [] })
  },

  fetchUsers: async () => {
    const users = await api('/api/users')
    set({ users })
  },

  addUser: async (name, pin, isAdmin) => {
    await api('/api/users', {
      method: 'POST',
      body: JSON.stringify({ name, pin, isAdmin }),
    })
    await get().fetchUsers()
  },

  updateUser: async (id, data) => {
    await api(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    await get().fetchUsers()
  },

  removeUser: async (id) => {
    await api(`/api/users/${id}`, { method: 'DELETE' })
    await get().fetchUsers()
  },

  clearSession: () => {
    set({ token: null, currentUser: null, users: [] })
  },
}))
