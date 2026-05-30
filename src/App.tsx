import { useEffect } from 'react'
import { useSettingsStore } from './store/settingsStore'
import { useApiData } from './hooks/useApiData'
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
  const { loaded } = useApiData()

  if (!loaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading Heimdall...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <>
      <Dashboard />
      <SettingsPanel />
    </>
  )
}
