import { create } from 'zustand'
import type { AppItem } from '../types'
import { resolveIconUrl } from '../utils/icons'

function loadApps(): AppItem[] {
  try {
    const raw = localStorage.getItem('heimdall-apps')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveApps(apps: AppItem[]) {
  localStorage.setItem('heimdall-apps', JSON.stringify(apps))
}

let nextId = Date.now()
function genId() {
  return `app_${nextId++}`
}

function resolveIcon(name: string): string {
  const url = resolveIconUrl(name)
  if (url) return url
  const key = name.toLowerCase().trim()
  const legacy: Record<string, string> = {
    plex: 'https://raw.githubusercontent.com/linuxserver/Heimdall-Apps/master/icons/plex/icon.svg',
    sonarr: 'https://raw.githubusercontent.com/linuxserver/Heimdall-Apps/master/icons/sonarr/icon.svg',
    radarr: 'https://raw.githubusercontent.com/linuxserver/Heimdall-Apps/master/icons/radarr/icon.svg',
    sabnzbd: 'https://raw.githubusercontent.com/linuxserver/Heimdall-Apps/master/icons/sabnzbd/icon.svg',
  }
  return legacy[key] || ''
}

const defaultColors = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4',
  '#3b82f6', '#2563eb', '#64748b',
]

function pickColor(index: number): string {
  return defaultColors[index % defaultColors.length]
}

interface AppState {
  apps: AppItem[]
  addApp: (app: Omit<AppItem, 'id' | 'position'>) => void
  updateApp: (id: string, updates: Partial<AppItem>) => void
  removeApp: (id: string) => void
  reorderApps: (categoryId: string, appIds: string[]) => void
  moveAppToCategory: (appId: string, categoryId: string, position: number) => void
  exportApps: () => AppItem[]
  importApps: (apps: AppItem[]) => void
}

export const useAppStore = create<AppState>((set) => ({
  apps: loadApps(),

  addApp: (app) =>
    set((state) => {
      const icon = app.icon || resolveIcon(app.name)
      const color = app.color || pickColor(state.apps.length)
      const maxPos = state.apps
        .filter((a) => a.categoryId === app.categoryId)
        .reduce((max, a) => Math.max(max, a.position), -1)
      const newApp: AppItem = {
        ...app,
        id: genId(),
        icon,
        color,
        position: maxPos + 1,
      }
      const apps = [...state.apps, newApp]
      saveApps(apps)
      return { apps }
    }),

  updateApp: (id, updates) =>
    set((state) => {
      const apps = state.apps.map((a) =>
        a.id === id
          ? { ...a, ...updates, icon: updates.icon || (updates.name ? resolveIcon(updates.name) || a.icon : a.icon) }
          : a
      )
      saveApps(apps)
      return { apps }
    }),

  removeApp: (id) =>
    set((state) => {
      const apps = state.apps.filter((a) => a.id !== id)
      saveApps(apps)
      return { apps }
    }),

  reorderApps: (categoryId, appIds) =>
    set((state) => {
      const apps = state.apps.map((a) =>
        a.categoryId === categoryId
          ? { ...a, position: appIds.indexOf(a.id) }
          : a
      )
      saveApps(apps)
      return { apps }
    }),

  moveAppToCategory: (appId, categoryId, position) =>
    set((state) => {
      const apps = state.apps.map((a) =>
        a.id === appId ? { ...a, categoryId, position } : a
      )
      saveApps(apps)
      return { apps }
    }),

  exportApps: () => {
    try {
      return JSON.parse(localStorage.getItem('heimdall-apps') || '[]')
    } catch {
      return []
    }
  },

  importApps: (apps) => {
    saveApps(apps)
    set({ apps })
  },
}))
