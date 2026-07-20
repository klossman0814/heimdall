import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useLayoutStore } from '../store/layoutStore'
import { useSettingsStore } from '../store/settingsStore'
import { useAuthStore } from '../store/authStore'
import type { AppItem, Category, Settings } from '../types'

interface ApiData {
  apps: AppItem[]
  categories: Category[]
  settings: Settings
}

export function useApiData() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirty = useRef(false)

  const apps = useAppStore((s) => s.apps)
  const categories = useLayoutStore((s) => s.categories)
  const settings = useSettingsStore((s) => s.settings)
  const token = useAuthStore((s) => s.token)
  const currentUser = useAuthStore((s) => s.currentUser)
  const clearSession = useAuthStore((s) => s.clearSession)

  useEffect(() => {
    if (!currentUser) return
    function authHeaders() {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      return headers
    }
    fetch('/api/data', { headers: authHeaders() })
      .then((r) => {
        if (r.status === 401) { clearSession(); return null }
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<ApiData>
      })
      .then((data) => {
        if (!data) return
        useAppStore.getState().hydrate(data.apps)
        useLayoutStore.getState().hydrate(data.categories)
        useSettingsStore.getState().hydrate(data.settings)
        setLoaded(true)
      })
      .catch((err) => {
        console.error('Failed to load data from API:', err)
        setError(err.message)
        setLoaded(true)
      })
  }, [currentUser, token, clearSession])

  useEffect(() => {
    if (!loaded || !currentUser) return
    dirty.current = true
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      dirty.current = false
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      fetch('/api/data', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ apps, categories, settings }),
      }).catch((err) => console.error('Failed to save data:', err))
    }, 500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [apps, categories, settings, loaded, currentUser, token])

  return { loaded, error }
}
