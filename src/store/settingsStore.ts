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

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem('heimdall-settings')
    if (raw) {
      return { ...defaultSettings, ...JSON.parse(raw) }
    }
  } catch { /* ignore */ }
  return defaultSettings
}

function saveSettings(s: Settings) {
  localStorage.setItem('heimdall-settings', JSON.stringify(s))
}

interface SettingsState {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  updateWidgets: (updates: Partial<Settings['widgets']>) => void
  setBackground: (bg: Settings['background']) => void
  setTheme: (theme: Settings['theme']) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: loadSettings(),

  updateSettings: (updates) =>
    set((state) => {
      const settings = { ...state.settings, ...updates }
      saveSettings(settings)
      return { settings }
    }),

  updateWidgets: (updates) =>
    set((state) => {
      const settings = {
        ...state.settings,
        widgets: { ...state.settings.widgets, ...updates },
      }
      saveSettings(settings)
      return { settings }
    }),

  setBackground: (bg) =>
    set((state) => {
      const settings = { ...state.settings, background: bg }
      saveSettings(settings)
      return { settings }
    }),

  setTheme: (theme) =>
    set((state) => {
      const settings = { ...state.settings, theme }
      saveSettings(settings)
      return { settings }
    }),
}))
