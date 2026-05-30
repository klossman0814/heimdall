import { create } from 'zustand'
import type { Settings } from '../types'

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
}

interface SettingsState {
  settings: Settings
  hydrate: (settings: Settings) => void
  updateSettings: (updates: Partial<Settings>) => void
  updateWidgets: (updates: Partial<Settings['widgets']>) => void
  setBackground: (bg: Settings['background']) => void
  setTheme: (theme: Settings['theme']) => void
  importSettings: (settings: Settings) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,

  hydrate: (settings) => set({ settings }),

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

  setBackground: (bg) =>
    set((state) => ({
      settings: { ...state.settings, background: bg },
    })),

  setTheme: (theme) =>
    set((state) => ({
      settings: { ...state.settings, theme },
    })),

  importSettings: (settings) => {
    set({ settings })
  },
}))
