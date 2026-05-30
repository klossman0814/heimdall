import { useEffect } from 'react'
import { useSettingsStore } from './store/settingsStore'
import Dashboard from './components/Dashboard'
import SettingsPanel from './components/SettingsPanel'

function useTheme() {
  const theme = useSettingsStore((s) => s.settings.theme)

  useEffect(() => {
    const root = document.documentElement

    function applyTheme(t: 'dark' | 'light') {
      if (t === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mq.matches ? 'dark' : 'light')
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      applyTheme(theme)
    }
  }, [theme])
}

export default function App() {
  useTheme()

  return (
    <>
      <Dashboard />
      <SettingsPanel />
    </>
  )
}
