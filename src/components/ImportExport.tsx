import { Download, Upload, Database } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useLayoutStore } from '../store/layoutStore'
import { useSettingsStore } from '../store/settingsStore'
import { useAuthStore } from '../store/authStore'
import { useRef } from 'react'

export default function ImportExport() {
  const { exportApps, importApps } = useAppStore()
  const categories = useLayoutStore((s) => s.categories)
  const settings = useSettingsStore((s) => s.settings)
  const importCategories = useLayoutStore((s) => s.importCategories)
  const importSettings = useSettingsStore((s) => s.importSettings)
  const currentUser = useAuthStore((s) => s.currentUser)
  const token = useAuthStore((s) => s.token)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const data = {
      version: 1,
      apps: exportApps(),
      categories,
      settings,
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.name || 'unknown',
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heimdall-backup-${currentUser?.name || 'user'}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleExportAll() {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch('/api/data', { headers })
      if (!res.ok) throw new Error('Failed to fetch data')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `heimdall-full-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to export full backup')
    }
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.apps) importApps(data.apps)
        if (data.categories) importCategories(data.categories)
        if (data.settings) importSettings(data.settings)
      } catch {
        alert('Invalid backup file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col gap-2">
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
        {currentUser?.isAdmin && (
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
              border: 'none',
            }}
          >
            <Database size={16} /> Export All
          </button>
        )}
      </div>
      {currentUser?.isAdmin && (
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          "Export All" saves all users' data. Use "Export" for just your data.
        </p>
      )}
    </div>
  )
}
