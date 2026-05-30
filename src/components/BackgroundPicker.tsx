import { Image, Palette, Droplets, X } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { BACKGROUNDS, BG_IMAGES } from '../utils/colors'
import { useState, useRef } from 'react'

export default function BackgroundPicker() {
  const { settings, setBackground } = useSettingsStore()
  const [tab, setTab] = useState<'color' | 'gradient' | 'image'>(
    settings.background.type === 'image' ? 'image' :
    settings.background.type === 'gradient' ? 'gradient' : 'color'
  )
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setBackground({ type: 'image', value: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const bgStyle =
    settings.background.type === 'image'
      ? { backgroundImage: `url(${settings.background.value})` }
      : settings.background.type === 'gradient'
      ? { background: settings.background.value }
      : { backgroundColor: settings.background.value }

  return (
    <div>
      <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ backgroundColor: 'var(--bg)' }}>
        {[
          { id: 'color' as const, icon: Palette, label: 'Colors' },
          { id: 'gradient' as const, icon: Droplets, label: 'Gradients' },
          { id: 'image' as const, icon: Image, label: 'Images' },
        ].map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1 justify-center"
              style={{
                backgroundColor: active ? 'var(--accent)' : 'transparent',
                color: active ? 'white' : 'var(--text-secondary)',
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {(tab === 'color' || tab === 'gradient') && (
        <div className="grid grid-cols-5 gap-2 mb-4">
          {(tab === 'color' ? BACKGROUNDS.colors : BACKGROUNDS.gradients).map((bg) => {
            const isActive =
              tab === 'color'
                ? settings.background.type === 'color' && settings.background.value === bg.value
                : settings.background.type === 'gradient' && settings.background.value === bg.value
            return (
              <button
                key={bg.value}
                onClick={() =>
                  setBackground({
                    type: tab === 'color' ? 'color' : 'gradient',
                    value: bg.value,
                  })
                }
                className="aspect-video rounded-lg transition-transform hover:scale-105 relative overflow-hidden"
                style={{
                  ...(tab === 'gradient' ? { background: bg.value } : { backgroundColor: bg.value }),
                  outline: isActive ? '2px solid var(--accent)' : 'none',
                  outlineOffset: '2px',
                }}
                title={bg.name}
              />
            )
          })}
        </div>
      )}

      {tab === 'image' && (
        <div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {BG_IMAGES.map((url) => (
              <button
                key={url}
                onClick={() => setBackground({ type: 'image', value: url })}
                className="aspect-video rounded-lg bg-cover bg-center transition-transform hover:scale-105"
                style={{
                  backgroundImage: `url(${url})`,
                  outline:
                    settings.background.type === 'image' && settings.background.value === url
                      ? '2px solid var(--accent)'
                      : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 px-3 py-2 rounded-lg text-sm border"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              Upload Image
            </button>
            {settings.background.type === 'image' && settings.background.value.startsWith('data:') && (
              <button
                onClick={() => setBackground({ type: 'color', value: '#0f172a' })}
                className="p-2 rounded-lg"
                style={{ color: '#ef4444' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      <div
        className="mt-4 h-20 rounded-xl border"
        style={{
          ...bgStyle,
          borderColor: 'var(--border)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </div>
  )
}
