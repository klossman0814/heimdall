import { Moon, Sun, Monitor } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import type { Theme } from '../types'

export default function ThemeToggle() {
  const { settings, setTheme } = useSettingsStore()

  const options: { id: Theme; icon: typeof Sun; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg)' }}>
      {options.map((opt) => {
        const Icon = opt.icon
        const active = settings.theme === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            style={{
              backgroundColor: active ? 'var(--accent)' : 'transparent',
              color: active ? 'white' : 'var(--text-secondary)',
            }}
            title={opt.label}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
