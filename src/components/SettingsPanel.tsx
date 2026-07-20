import { X, Settings, Plus, Clock, CloudSun, StickyNote, Zap, LogOut, Shield } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { useLayoutStore } from '../store/layoutStore'
import { useAppStore } from '../store/appStore'
import { useAuthStore } from '../store/authStore'
import { TILE_COLORS } from '../utils/colors'
import ThemeToggle from './ThemeToggle'
import BackgroundPicker from './BackgroundPicker'
import ImportExport from './ImportExport'
import UserManagement from './UserManagement'

export default function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const { settings, updateWidgets, updateSettings, updateTopItems } = useSettingsStore()
  const { categories, addCategory, setCategoryColor } = useLayoutStore()
  const { setCategoryAppColors } = useAppStore()
  const [newCat, setNewCat] = useState('')
  const [newCatColor, setNewCatColor] = useState('')
  const [openCatColor, setOpenCatColor] = useState<string | null>(null)
  const colorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setOpenCatColor(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleAddCategory() {
    if (newCat.trim()) {
      addCategory(newCat.trim(), newCatColor || undefined)
      setNewCat('')
      setNewCatColor('')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg z-40 text-white transition-transform hover:scale-110"
        style={{ backgroundColor: 'var(--accent)' }}
        title="Settings"
      >
        <Settings size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          />
          <div
            className="relative w-full max-w-md h-full overflow-y-auto border-l shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Settings</h2>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-8">
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <Clock size={16} style={{ color: 'var(--accent)' }} />
                  Theme
                </h3>
                <ThemeToggle />
              </section>

              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--accent)' }} />
                  Background
                </h3>
                <BackgroundPicker />
              </section>

              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <span className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--accent)' }} />
                  Widgets
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.widgets.clock}
                      onChange={(e) => updateWidgets({ clock: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--accent)]"
                    />
                    <Clock size={16} style={{ color: 'var(--accent)' }} />
                    <span className="text-sm" style={{ color: 'var(--text)' }}>Show Clock</span>
                  </label>
                  {settings.widgets.clock && (
                    <div className="ml-7">
                      <select
                        value={settings.widgets.clockFormat}
                        onChange={(e) => updateWidgets({ clockFormat: e.target.value as '12h' | '24h' })}
                        className="px-3 py-1.5 rounded-lg text-xs border"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      >
                        <option value="24h">24-hour</option>
                        <option value="12h">12-hour</option>
                      </select>
                    </div>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.widgets.weather}
                      onChange={(e) => updateWidgets({ weather: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--accent)]"
                    />
                    <CloudSun size={16} style={{ color: 'var(--accent)' }} />
                    <span className="text-sm" style={{ color: 'var(--text)' }}>7-Day Weather</span>
                  </label>
                  {settings.widgets.weather && (
                    <div className="ml-7 space-y-2">
                      <input
                        type="text"
                        value={settings.widgets.weatherCityState}
                        onChange={(e) => updateWidgets({ weatherCityState: e.target.value })}
                        placeholder="City, State (e.g., Austin, TX)"
                        className="w-full px-3 py-1.5 rounded-lg text-xs border"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateWidgets({ weatherUnit: 'f' })}
                          className="flex-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: settings.widgets.weatherUnit === 'f' ? 'var(--accent)' : 'var(--bg)',
                            color: settings.widgets.weatherUnit === 'f' ? 'white' : 'var(--text-secondary)',
                          }}
                        >
                          °F
                        </button>
                        <button
                          onClick={() => updateWidgets({ weatherUnit: 'c' })}
                          className="flex-1 px-2 py-1 rounded text-xs font-medium transition-colors"
                          style={{
                            backgroundColor: settings.widgets.weatherUnit === 'c' ? 'var(--accent)' : 'var(--bg)',
                            color: settings.widgets.weatherUnit === 'c' ? 'white' : 'var(--text-secondary)',
                          }}
                        >
                          °C
                        </button>
                      </div>
                    </div>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.widgets.notes}
                      onChange={(e) => updateWidgets({ notes: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--accent)]"
                    />
                    <StickyNote size={16} style={{ color: 'var(--accent)' }} />
                    <span className="text-sm" style={{ color: 'var(--text)' }}>Show Notes</span>
                  </label>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <Zap size={16} style={{ color: 'var(--accent)' }} />
                  Top Items
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.topItems.enabled}
                      onChange={(e) => updateTopItems({ enabled: e.target.checked })}
                      className="w-4 h-4 rounded accent-[var(--accent)]"
                    />
                    <span className="text-sm" style={{ color: 'var(--text)' }}>Auto-rank most-used apps</span>
                  </label>
                  {settings.topItems.enabled && (
                    <div className="ml-7 space-y-3">
                      <div>
                        <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Items to show: {settings.topItems.count}
                        </label>
                        <input
                          type="range"
                          min={3}
                          max={20}
                          value={settings.topItems.count}
                          onChange={(e) => updateTopItems({ count: parseInt(e.target.value) })}
                          className="w-full accent-[var(--accent)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Reset click counts
                        </label>
                        <select
                          value={settings.topItems.resetInterval}
                          onChange={(e) =>
                            updateTopItems({
                              resetInterval: e.target.value as 'never' | 'weekly' | 'monthly',
                              lastResetAt:
                                e.target.value !== 'never' ? new Date().toISOString() : settings.topItems.lastResetAt,
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg text-xs border"
                          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                        >
                          <option value="never">Never</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Rankings refresh every 5 minutes while the dashboard is open.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs"
                    style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >+</span>
                  Categories
                </h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                      placeholder="New category name"
                      className="flex-1 px-3 py-2 rounded-lg text-sm border"
                      style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                    <div className="flex gap-1 items-center">
                      {TILE_COLORS.slice(0, 6).map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setNewCatColor(newCatColor === c.value ? '' : c.value)}
                          className="w-5 h-5 rounded transition-transform hover:scale-110"
                          style={{
                            backgroundColor: c.value,
                            outline: newCatColor === c.value ? '2px solid var(--accent)' : 'none',
                            outlineOffset: '1px',
                          }}
                          title={c.name}
                        />
                      ))}
                    </div>
                    <button
                      onClick={handleAddCategory}
                      className="px-3 py-2 rounded-lg text-sm text-white"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <div key={c.id} className="relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
                      >
                        <button
                          onClick={() => setOpenCatColor(openCatColor === c.id ? null : c.id)}
                          className="w-3 h-3 rounded-full shrink-0 transition-transform hover:scale-125"
                          style={{
                            backgroundColor: c.color || 'var(--border)',
                            outline: c.color ? '1px solid rgba(255,255,255,0.3)' : 'none',
                          }}
                          title="Change category color"
                        />
                        {c.name}
                        {openCatColor === c.id && (
                          <div
                            ref={colorRef}
                            className="absolute top-full left-0 mt-1 p-2 rounded-lg border shadow-lg z-30 grid grid-cols-6 gap-1.5"
                            style={{
                              backgroundColor: 'var(--bg-card)',
                              borderColor: 'var(--border)',
                              boxShadow: 'var(--shadow-lg)',
                            }}
                          >
                            <button
                              onClick={() => { setCategoryColor(c.id, undefined); setOpenCatColor(null) }}
                              className="w-5 h-5 rounded flex items-center justify-center text-[9px]"
                              style={{ backgroundColor: 'var(--border)', color: 'var(--text-secondary)' }}
                              title="No color"
                            >
                              ∅
                            </button>
                            {TILE_COLORS.map((tc) => (
                              <button
                                key={tc.value}
                                onClick={() => {
                                  setCategoryColor(c.id, tc.value)
                                  setCategoryAppColors(c.id, tc.value)
                                  setOpenCatColor(null)
                                }}
                                className="w-5 h-5 rounded transition-transform hover:scale-110"
                                style={{
                                  backgroundColor: tc.value,
                                  outline: c.color === tc.value ? '2px solid var(--accent)' : 'none',
                                  outlineOffset: '1px',
                                }}
                                title={tc.name}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--accent)' }} />
                  Custom Search URL
                </h3>
                <input
                  type="text"
                  value={settings.customSearchUrl}
                  onChange={(e) => updateSettings({ customSearchUrl: e.target.value })}
                  placeholder="https://example.com/search?q=%s"
                  className="w-full px-3 py-2 rounded-lg text-sm border"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Use %s as the query placeholder. Only used when search provider is set to Custom.
                </p>
              </section>

              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <Shield size={16} style={{ color: 'var(--accent)' }} />
                  Account
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {useAuthStore.getState().currentUser?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                      {useAuthStore.getState().currentUser?.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {useAuthStore.getState().currentUser?.isAdmin ? 'Admin' : 'User'}
                    </div>
                  </div>
                  <button
                    onClick={() => { useAuthStore.getState().logout(); setOpen(false) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </section>

              {useAuthStore.getState().currentUser?.isAdmin && (
                <section>
                  <UserManagement />
                </section>
              )}

              <section>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
                  Backup & Restore
                </h3>
                <ImportExport />
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
