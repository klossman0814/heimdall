import { X, Settings, Plus, Clock, CloudSun, StickyNote } from 'lucide-react'
import { useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { useLayoutStore } from '../store/layoutStore'
import ThemeToggle from './ThemeToggle'
import BackgroundPicker from './BackgroundPicker'
import ImportExport from './ImportExport'

export default function SettingsPanel() {
  const [open, setOpen] = useState(false)
  const { settings, updateWidgets, updateSettings } = useSettingsStore()
  const { categories, addCategory } = useLayoutStore()
  const [newCat, setNewCat] = useState('')

  function handleAddCategory() {
    if (newCat.trim()) {
      addCategory(newCat.trim())
      setNewCat('')
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
                      <span
                        key={c.id}
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
                      >
                        {c.name}
                      </span>
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
