import { Download, Upload } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useLayoutStore } from '../store/layoutStore'
import { useSettingsStore } from '../store/settingsStore'
import { useRef } from 'react'

export default function ImportExport() {
  const { exportApps, importApps } = useAppStore()
  const categories = useLayoutStore((s) => s.categories)
  const settings = useSettingsStore((s) => s.settings)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const data = {
      version: 1,
      apps: exportApps(),
      categories,
      settings,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heimdall-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.apps) importApps(data.apps)
        if (data.categories) {
          localStorage.setItem('heimdall-categories', JSON.stringify(data.categories))
          window.location.reload()
        }
        if (data.settings) {
          localStorage.setItem('heimdall-settings', JSON.stringify(data.settings))
          window.location.reload()
        }
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        }}
      >
        <Download size={16} /> Export
      </button>
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        }}
      >
        <Upload size={16} /> Import
      </button>
    </div>
  )
}
