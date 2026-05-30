import { create } from 'zustand'
import type { Settings, TopItemsConfig } from '../types'

const defaultTopItems: TopItemsConfig = {
  enabled: true,
  count: 5,
  resetInterval: 'never',
  lastResetAt: null,
}

const defaultSettings: Settings = {
  theme: 'dark',
  searchProvider: 'google',
  customSearchUrl: '',
  background: { type: 'color', value: '' },
  widgets: {
    clock: true,
    clockFormat: '24h',
    weather: false,
    weatherCityState: '',
    weatherUnit: 'f',
    notes: false,
    notesContent: '',
  },
  topItems: { ...defaultTopItems },
}

interface SettingsState {
  settings: Settings
  hydrate: (settings: Settings) => void
  updateSettings: (updates: Partial<Settings>) => void
  updateWidgets: (updates: Partial<Settings['widgets']>) => void
  updateTopItems: (updates: Partial<TopItemsConfig>) => void
  setBackground: (bg: Settings['background']) => void
  setTheme: (theme: Settings['theme']) => void
  importSettings: (settings: Settings) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,

  hydrate: (settings) =>
    set({
      settings: {
        ...defaultSettings,
        ...settings,
        topItems: {
          ...defaultTopItems,
          ...(settings.topItems ?? {}),
        },
      },
    }),

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),

  updateWidgets: (updates) =>
    set((state) => ({
      settings: {
        ...state.settings,
        widgets: { ...state.settings.widgets, ...updates },
      },
    })),

  updateTopItems: (updates) =>
    set((state) => ({
      settings: {
        ...state.settings,
        topItems: { ...state.settings.topItems, ...updates },
      },
    })),

  setBackground: (bg) =>
    set((state) => ({
      settings: { ...state.settings, background: bg },
    })),

  setTheme: (theme) =>
    set((state) => ({
      settings: { ...state.settings, theme },
    })),

  importSettings: (settings) => {
    set({
      settings: {
        ...defaultSettings,
        ...settings,
        topItems: {
          ...defaultTopItems,
          ...(settings.topItems ?? {}),
        },
      },
    })
  },
}))
