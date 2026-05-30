import { useState, useRef, useEffect } from 'react'
import type { AppItem } from '../types'
import { useAppStore } from '../store/appStore'
import { useLayoutStore } from '../store/layoutStore'
import { TILE_COLORS } from '../utils/colors'
import { resolveIconUrl, searchApps, findApp } from '../utils/icons'
import { X } from 'lucide-react'

interface AppFormProps {
  app?: AppItem | null
  onClose: () => void
}

const TILE_SIZES = [
  { id: 'sm', label: 'Small' },
  { id: 'md', label: 'Medium' },
  { id: 'lg', label: 'Large' },
] as const

export default function AppForm({ app, onClose }: AppFormProps) {
  const addApp = useAppStore((s) => s.addApp)
  const updateApp = useAppStore((s) => s.updateApp)
  const categories = useLayoutStore((s) => s.categories)

  const [name, setName] = useState(app?.name || '')
  const [url, setUrl] = useState(app?.url || '')
  const [color, setColor] = useState(app?.color || TILE_COLORS[0].value)
  const [categoryId, setCategoryId] = useState(app?.categoryId || categories[0]?.id || 'default')
  const [tileSize, setTileSize] = useState<'sm' | 'md' | 'lg'>(app?.tileSize || 'md')

  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [iconPreview, setIconPreview] = useState(app?.icon || '')
  const [suggestions, setSuggestions] = useState<ReturnType<typeof searchApps>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [iconError, setIconError] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const suggestRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const known = findApp(name.trim())
    if (known && !iconPreview) {
      const url = resolveIconUrl(known.name)
      setIconPreview(url)
      setIconError(false)
      if (!app && !color) {
        setColor(known.color)
      }
    }
  }, [name, app, iconPreview, color])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleNameChange(value: string) {
    setName(value)
    setIconPreview(resolveIconUrl(value))
    setIconError(false)

    if (value.trim().length >= 1) {
      setSuggestions(searchApps(value))
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  function handleSelectSuggestion(s: ReturnType<typeof searchApps>[0]) {
    setName(s.name)
    setIconPreview(resolveIconUrl(s.name))
    setIconError(false)
    setColor(s.color)
    setShowSuggestions(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    const icon = iconPreview && !iconError ? iconPreview : ''

    if (app) {
      updateApp(app.id, { name: name.trim(), url: url.trim(), icon, color, categoryId, tileSize })
    } else {
      addApp({ name: name.trim(), url: url.trim(), icon, color, categoryId, tileSize })
    }
    onClose()
  }

  function handleUrlFromName() {
    if (url || !name.trim()) return
    const known = findApp(name.trim())
    if (known) {
      setUrl(`https://${known.slug.toLowerCase()}.lan`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl p-6"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-3" style={{ color: 'var(--text)' }}>
            {iconPreview && !iconError && (
              <img
                src={iconPreview}
                alt=""
                className="w-8 h-8 rounded-lg"
                onError={() => setIconError(true)}
              />
            )}
            {app ? 'Edit Application' : 'Add Application'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              Name
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="e.g., Plex, Sonarr..."
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:border-[var(--accent)]"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestRef}
                className="absolute left-0 right-0 top-full mt-1 rounded-lg border shadow-lg z-30 overflow-hidden max-h-60 overflow-y-auto"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                {suggestions.map((s, i) => {
                  const iconUrl = resolveIconUrl(s.name)
                  return (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={() => handleSelectSuggestion(s)}
                      className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm transition-colors hover:opacity-80"
                      style={{ color: 'var(--text)' }}
                    >
                      {iconUrl && (
                        <img src={iconUrl} alt="" className="w-5 h-5 rounded" />
                      )}
                      <span>{s.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:border-[var(--accent)]"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
              <button
                type="button"
                onClick={handleUrlFromName}
                className="px-2 py-1 rounded-lg text-xs whitespace-nowrap"
                style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                title="Guess URL from app name"
              >
                Guess
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              Icon URL (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={iconPreview}
                onChange={(e) => { setIconPreview(e.target.value); setIconError(false) }}
                placeholder="Auto-detected from name"
                className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:border-[var(--accent)]"
                style={{
                  backgroundColor: 'var(--bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              />
              {iconPreview && !iconError && (
                <img
                  src={iconPreview}
                  alt=""
                  className="w-9 h-9 rounded-lg border shrink-0"
                  style={{ borderColor: 'var(--border)' }}
                  onError={() => setIconError(true)}
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {TILE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    outline: color === c.value ? '2px solid var(--accent)' : 'none',
                    outlineOffset: '2px',
                  }}
                  title={c.name}
                />
              ))}
              <button
                type="button"
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                +
              </button>
            </div>
            {colorPickerOpen && (
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="mt-2 w-full h-8 rounded cursor-pointer"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                Tile Size
              </label>
              <select
                value={tileSize}
                onChange={(e) => setTileSize(e.target.value as typeof tileSize)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                {TILE_SIZES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {app ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
