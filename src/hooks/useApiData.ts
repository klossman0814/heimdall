import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useLayoutStore } from '../store/layoutStore'
import { useSettingsStore } from '../store/settingsStore'
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

  useEffect(() => {
    fetch('/api/data')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<ApiData>
      })
      .then((data) => {
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
  }, [])

  useEffect(() => {
    if (!loaded) return
    dirty.current = true
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      dirty.current = false
      fetch('/api/data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apps, categories, settings }),
      }).catch((err) => console.error('Failed to save data:', err))
    }, 500)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [apps, categories, settings, loaded])

  return { loaded, error }
}
