import { useState, useRef, useEffect, useCallback } from 'react'
import type { AppItem, AppLink } from '../types'
import { useAppStore } from '../store/appStore'
import { useLayoutStore } from '../store/layoutStore'
import { TILE_COLORS } from '../utils/colors'
import { resolveIconUrl, searchApps, findApp } from '../utils/icons'
import { fetchIconFromWebsite, describeIconSource } from '../utils/iconFetch'
import { hostLabel } from '../utils/links'
import { X, Upload, Globe, Loader2, Plus, Trash2, Layers } from 'lucide-react'

interface AppFormProps {
  app?: AppItem | null
  onClose: () => void
}

const TILE_SIZES = [
  { id: 'sm', label: 'Small' },
  { id: 'md', label: 'Medium' },
  { id: 'lg', label: 'Large' },
] as const

let nextLinkId = 0
function newLinkId() {
  return `link_${Date.now()}_${nextLinkId++}`
}

function blankLink(url = ''): AppLink {
  return { id: newLinkId(), label: '', url, appId: null }
}

export default function AppForm({ app, onClose }: AppFormProps) {
  const addApp = useAppStore((s) => s.addApp)
  const updateApp = useAppStore((s) => s.updateApp)
  const apps = useAppStore((s) => s.apps)
  const categories = useLayoutStore((s) => s.categories)

  const initCategory = categories.find((c) => c.id === (app?.categoryId || categories[0]?.id || 'default'))
  const initColor = app?.color || initCategory?.color || TILE_COLORS[0].value
  const [name, setName] = useState(app?.name || '')
  const [url, setUrl] = useState(app?.url || '')
  const [color, setColor] = useState(initColor)
  const [categoryId, setCategoryId] = useState(app?.categoryId || categories[0]?.id || 'default')
  const [tileSize, setTileSize] = useState<'sm' | 'md' | 'lg'>(app?.tileSize || 'md')
  const [multi, setMulti] = useState((app?.links?.length ?? 0) > 0)
  const [links, setLinks] = useState<AppLink[]>(app?.links ? app.links.map((l) => ({ ...l })) : [])

  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [iconPreview, setIconPreview] = useState(app?.icon || '')
  const [suggestions, setSuggestions] = useState<ReturnType<typeof searchApps>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [iconError, setIconError] = useState(false)
  const [iconLookupBusy, setIconLookupBusy] = useState(false)
  const [iconLookupNote, setIconLookupNote] = useState<{ tone: 'error' | 'info'; text: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const suggestRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const didManualColor = useRef(false)

  // In multi-site mode the link list owns the URLs; the first one still stands in
  // as the tile's primary URL, so "Fetch from site" and single-URL fallbacks work.
  const iconSourceUrl = multi ? (links[0]?.url ?? '') : url
  const filledLinkCount = links.filter((l) => l.url.trim()).length
  const canSubmit = name.trim().length > 0 && (!multi || filledLinkCount > 0)

  const linkedAppIds = new Set(links.map((l) => l.appId))
  const selectableApps = apps.filter(
    (a) => a.id !== app?.id && !linkedAppIds.has(a.id) && !(a.links?.length)
  )

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

  function toggleMulti() {
    if (multi) {
      setMulti(false)
      return
    }
    setMulti(true)
    // Carry over whatever single URL was already typed so nothing is retyped.
    if (links.length === 0) setLinks([blankLink(url)])
  }

  function addLinkFromApp(appId: string) {
    const source = apps.find((a) => a.id === appId)
    if (!source) return
    setLinks([...links, { id: newLinkId(), label: source.name, url: source.url, appId: source.id }])
  }

  function updateLink(id: string, updates: Partial<AppLink>) {
    setLinks(links.map((l) => (l.id === id ? { ...l, ...updates } : l)))
  }

  function removeLink(id: string) {
    setLinks(links.filter((l) => l.id !== id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    const icon = iconPreview && !iconError ? iconPreview : ''

    // Drop rows with no URL; a blank label falls back to the site's hostname.
    const savedLinks = multi
      ? links
          .map((l) => ({ ...l, url: l.url.trim(), label: l.label.trim() }))
          .filter((l) => l.url)
          .map((l) => ({ ...l, label: l.label || hostLabel(l.url) }))
      : []
    const primaryUrl = multi ? savedLinks[0]?.url ?? '' : url.trim()

    if (app) {
      updateApp(app.id, { name: name.trim(), url: primaryUrl, icon, color, categoryId, tileSize, links: savedLinks })
    } else {
      addApp({ name: name.trim(), url: primaryUrl, icon, color, categoryId, tileSize, links: savedLinks })
    }
    onClose()
  }

  function handleIconFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setIconPreview(dataUrl)
      setIconError(false)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleIconFile(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  function handleBrowseClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleIconFile(file)
  }

  function handleUrlFromName() {
    if (url || !name.trim()) return
    const known = findApp(name.trim())
    if (known) {
      setUrl(`https://${known.slug.toLowerCase()}.lan`)
    }
  }

  async function handleFetchIconFromWebsite() {
    if (iconLookupBusy) return
    setIconLookupBusy(true)
    setIconLookupNote(null)
    try {
      const result = await fetchIconFromWebsite(iconSourceUrl)
      setIconPreview(result.icon)
      setIconError(false)
      setIconLookupNote({
        tone: 'info',
        text:
          result.via === 'website'
            ? `Icon pulled from ${describeIconSource(result.detail)}`
            : `Icon pulled from the public favicon service — ${describeIconSource(iconSourceUrl)} could not be inspected`,
      })
    } catch (err) {
      setIconLookupNote({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Could not fetch an icon from that website',
      })
    } finally {
      setIconLookupBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} />
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6"
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

          {!multi && (
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
          )}

          <div>
            <label
              className="flex items-center gap-2 text-sm font-medium cursor-pointer"
              style={{ color: 'var(--text)' }}
            >
              <input
                type="checkbox"
                checked={multi}
                onChange={toggleMulti}
                className="w-4 h-4 rounded"
                style={{ accentColor: 'var(--accent)' }}
              />
              <Layers size={14} style={{ color: 'var(--text-secondary)' }} />
              Open several sites with one click
            </label>

            {multi && (
              <div className="mt-2 space-y-2">
                {links.length === 0 && (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Add the sites this tile should launch.
                  </p>
                )}

                {links.map((link) => {
                  const source = link.appId ? apps.find((a) => a.id === link.appId) : undefined

                  // Links taken from an app follow that app's name and URL, so they
                  // are shown read-only rather than pretending to be editable here.
                  if (source) {
                    return (
                      <div
                        key={link.id}
                        className="flex items-center gap-2 rounded-lg border px-2 py-1.5"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                      >
                        {source.icon
                          ? <img src={source.icon} alt="" className="w-5 h-5 rounded shrink-0" />
                          : <Globe size={16} className="shrink-0" style={{ color: 'var(--text-secondary)' }} />}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm truncate" style={{ color: 'var(--text)' }}>
                            {source.name}
                          </div>
                          <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                            {source.url}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLink(link.id)}
                          className="p-1 rounded transition-colors hover:opacity-80 shrink-0"
                          style={{ color: '#ef4444' }}
                          title="Remove from this tile"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  }

                  return (
                    <div key={link.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(link.id, { label: e.target.value })}
                        placeholder="Label"
                        className="w-24 px-2 py-1.5 rounded-lg border text-sm outline-none transition-colors focus:border-[var(--accent)]"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border text-sm outline-none transition-colors focus:border-[var(--accent)]"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(link.id)}
                        className="p-1 rounded transition-colors hover:opacity-80 shrink-0"
                        style={{ color: '#ef4444' }}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLinks([...links, blankLink()])}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs whitespace-nowrap"
                    style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  >
                    <Plus size={12} /> Add URL
                  </button>
                  {selectableApps.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => { if (e.target.value) addLinkFromApp(e.target.value) }}
                      className="flex-1 min-w-0 px-2 py-1 rounded-lg border text-xs outline-none"
                      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      title="Add an app you already have on the dashboard"
                    >
                      <option value="">Add an existing app…</option>
                      {selectableApps.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {filledLinkCount === 0
                    ? 'Add at least one site.'
                    : `Clicking this tile opens all ${filledLinkCount} site${filledLinkCount === 1 ? '' : 's'} in new tabs.`}
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="block text-sm font-medium" style={{ color: 'var(--text)' }}>
                Icon
              </label>
              <button
                type="button"
                onClick={handleFetchIconFromWebsite}
                disabled={!iconSourceUrl.trim() || iconLookupBusy}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  opacity: !iconSourceUrl.trim() || iconLookupBusy ? 0.5 : 1,
                  cursor: !iconSourceUrl.trim() || iconLookupBusy ? 'not-allowed' : 'pointer',
                }}
                title={iconSourceUrl.trim() ? "Pull this app's icon from its website" : 'Enter the app URL first'}
              >
                {iconLookupBusy ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                {iconLookupBusy ? 'Fetching…' : 'Fetch from site'}
              </button>
            </div>
            {iconLookupNote && (
              <p
                className="text-xs mb-1"
                style={{ color: iconLookupNote.tone === 'error' ? '#ef4444' : 'var(--text-secondary)' }}
              >
                {iconLookupNote.text}
              </p>
            )}
            <div className="flex gap-2 mb-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={iconPreview}
                  onChange={(e) => { setIconPreview(e.target.value); setIconError(false) }}
                  placeholder="URL or drop an image below"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors focus:border-[var(--accent)]"
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
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded border"
                    style={{ borderColor: 'var(--border)' }}
                    onError={() => setIconError(true)}
                  />
                )}
              </div>
            </div>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleBrowseClick}
              className="relative flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors"
              style={{
                borderColor: dragOver ? 'var(--accent)' : 'var(--border)',
                backgroundColor: dragOver ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload size={18} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Drop an image here or click to browse
              </span>
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
                  onClick={() => { didManualColor.current = true; setColor(c.value) }}
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
                onChange={(e) => { didManualColor.current = true; setColor(e.target.value) }}
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
                onChange={(e) => {
                  const newCatId = e.target.value
                  setCategoryId(newCatId)
                  if (!app && !didManualColor.current) {
                    const cat = categories.find((c) => c.id === newCatId)
                    if (cat?.color) setColor(cat.color)
                  }
                }}
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
              disabled={!canSubmit}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)', opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
            >
              {app ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
