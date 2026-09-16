import { create } from 'zustand'
import type { AppItem } from '../types'
import { resolveIconUrl } from '../utils/icons'

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
  hydrate: (apps: AppItem[]) => void
  addApp: (app: Omit<AppItem, 'id' | 'position' | 'clickCount' | 'previousCategoryId'>) => void
  updateApp: (id: string, updates: Partial<AppItem>) => void
  removeApp: (id: string) => void
  setCategoryAppColors: (categoryId: string, color: string) => void
  reorderApps: (categoryId: string, appIds: string[]) => void
  moveAppToCategory: (appId: string, categoryId: string, position: number) => void
  incrementClickCount: (appId: string) => void
  resetAllClickCounts: () => void
  exportApps: () => AppItem[]
  importApps: (apps: AppItem[]) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  apps: [],

  hydrate: (apps) =>
    set({
      apps: apps.map((a) => ({
        ...a,
        clickCount: a.clickCount ?? 0,
        previousCategoryId: a.previousCategoryId ?? null,
        links: a.links ?? [],
      })),
    }),

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
        clickCount: 0,
        previousCategoryId: null,
      }
      return { apps: [...state.apps, newApp] }
    }),

  updateApp: (id, updates) =>
    set((state) => ({
      apps: state.apps.map((a) =>
        a.id === id
          ? { ...a, ...updates, icon: updates.icon || (updates.name ? resolveIcon(updates.name) || a.icon : a.icon) }
          : a
      ),
    })),

  removeApp: (id) =>
    set((state) => ({
      apps: state.apps.filter((a) => a.id !== id),
    })),

  setCategoryAppColors: (categoryId, color) =>
    set((state) => ({
      apps: state.apps.map((a) =>
        a.categoryId === categoryId ? { ...a, color } : a
      ),
    })),

  reorderApps: (categoryId, appIds) =>
    set((state) => ({
      apps: state.apps.map((a) =>
        a.categoryId === categoryId
          ? { ...a, position: appIds.indexOf(a.id) }
          : a
      ),
    })),

  incrementClickCount: (appId) =>
    set((state) => ({
      apps: state.apps.map((a) =>
        a.id === appId ? { ...a, clickCount: a.clickCount + 1 } : a
      ),
    })),

  resetAllClickCounts: () =>
    set((state) => ({
      apps: state.apps.map((a) => ({ ...a, clickCount: 0 })),
    })),

  moveAppToCategory: (appId, categoryId, position) =>
    set((state) => ({
      apps: state.apps.map((a) =>
        a.id === appId
          ? {
              ...a,
              categoryId,
              position,
              previousCategoryId:
                categoryId === a.categoryId
                  ? a.previousCategoryId
                  : a.categoryId,
            }
          : a
      ),
    })),

  exportApps: () => {
    return get().apps
  },

  importApps: (apps) => {
    set({
      apps: apps.map((a) => ({
        ...a,
        clickCount: a.clickCount ?? 0,
        previousCategoryId: a.previousCategoryId ?? null,
        links: a.links ?? [],
      })),
    })
  },
}))
