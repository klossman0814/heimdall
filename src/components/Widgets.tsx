import { StickyNote } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import WeatherWidget from './WeatherWidget'

function ClockWidget() {
  const { settings } = useSettingsStore()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const formatTime = () => {
    const hours = time.getHours()
    const minutes = time.getMinutes().toString().padStart(2, '0')
    if (settings.widgets.clockFormat === '12h') {
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const h12 = hours % 12 || 12
      return `${h12}:${minutes} ${ampm}`
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="text-center">
      <div className="text-4xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>
        {formatTime()}
      </div>
      <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
        {days[time.getDay()]}, {months[time.getMonth()]} {time.getDate()}
      </div>
    </div>
  )
}

function NotesWidget() {
  const { settings, updateWidgets } = useSettingsStore()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(settings.widgets.notesContent)

  function handleSave() {
    updateWidgets({ notesContent: content })
    setEditing(false)
  }

  return (
    <div className="w-full max-w-md text-sm">
      <div className="flex items-center gap-2 mb-2">
        <StickyNote size={16} style={{ color: 'var(--accent)' }} />
        <span className="font-medium" style={{ color: 'var(--text)' }}>Notes</span>
      </div>
      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-sm p-2 rounded-lg border resize-none outline-none"
            rows={4}
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Save
            </button>
            <button
              onClick={() => { setEditing(false); setContent(settings.widgets.notesContent) }}
              className="px-3 py-1 rounded text-xs"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div
          className="p-3 rounded-lg cursor-pointer whitespace-pre-wrap"
          style={{ backgroundColor: 'var(--bg)' }}
          onClick={() => setEditing(true)}
        >
          {content || <span style={{ color: 'var(--text-secondary)' }}>Click to add a note...</span>}
        </div>
      )}
    </div>
  )
}

export default function Widgets() {
  const { settings } = useSettingsStore()

  return (
    <div className="flex flex-col items-center gap-6 mb-8">
      {settings.widgets.clock && <ClockWidget />}
      {settings.widgets.weather && <WeatherWidget />}
      {settings.widgets.notes && <NotesWidget />}
    </div>
  )
}
