import { Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { getSearchUrl } from '../utils/search'

const providers = [
  { id: 'google', label: 'Google' },
  { id: 'bing', label: 'Bing' },
  { id: 'duckduckgo', label: 'DuckDuckGo' },
  { id: 'custom', label: 'Custom' },
] as const

export default function SearchBar() {
  const { settings } = useSettingsStore()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    const url = getSearchUrl(settings.searchProvider, settings.customSearchUrl, query)
    window.open(url, '_blank')
    setQuery('')
  }

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 p-3 rounded-xl border"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow)',
          }}
        >
          <Search size={20} style={{ color: 'var(--text-secondary)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search with ${providers.find(p => p.id === settings.searchProvider)?.label || 'Google'}...  (Ctrl+K)`}
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--text)' }}
          />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg)',
              color: 'var(--text-secondary)',
            }}
          >
            {providers.find(p => p.id === settings.searchProvider)?.label || 'Google'}
          </button>
        </div>
      </form>

      {open && (
        <div
          className="absolute right-0 mt-1 w-40 rounded-lg border shadow-lg z-50 overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                useSettingsStore.getState().updateSettings({ searchProvider: p.id })
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm transition-colors hover:opacity-80"
              style={{
                color: settings.searchProvider === p.id ? 'var(--accent)' : 'var(--text)',
                backgroundColor: settings.searchProvider === p.id ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
