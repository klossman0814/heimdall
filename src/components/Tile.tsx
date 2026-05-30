import { ExternalLink, MoreHorizontal, Edit3, Trash2, GripVertical } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { AppItem } from '../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TileProps {
  app: AppItem
  onEdit: (app: AppItem) => void
  onRemove: (id: string) => void
}

function TileIcon({ app }: { app: AppItem }) {
  const [imgFailed, setImgFailed] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  if (!app.icon || imgFailed) {
    return (
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
      >
        {app.name.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <>
      {!imgLoaded && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
        >
          {app.name.charAt(0).toUpperCase()}
        </div>
      )}
      <img
        src={app.icon}
        alt=""
        className={`w-10 h-10 object-contain rounded-lg shrink-0 ${imgLoaded ? '' : 'hidden'}`}
        onLoad={() => setImgLoaded(true)}
        onError={() => { setImgFailed(true); setImgLoaded(false) }}
      />
    </>
  )
}

export default function Tile({ app, onEdit, onRemove }: TileProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id, data: { type: 'app', app } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const sizeClasses = app.tileSize === 'sm' ? 'p-3' : app.tileSize === 'lg' ? 'p-6' : 'p-4'

  function handleOpen() {
    if (!app.url) return
    window.open(app.url.startsWith('http') ? app.url : `https://${app.url}`, '_blank')
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${sizeClasses}`}
      onClick={handleOpen}
    >
      <div
        className="absolute inset-0 rounded-xl opacity-90 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: app.color }}
      />
      <div className="absolute inset-0 rounded-xl bg-black/10" />

      <div className="relative z-10 flex flex-col items-center gap-2">
        <button
          className="absolute -top-1 -left-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
          style={{ backgroundColor: 'var(--bg-card)' }}
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} style={{ color: 'var(--text-secondary)' }} />
        </button>

        <div
          className="absolute -top-1 -right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
          style={{ backgroundColor: 'var(--bg-card)' }}
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
        >
          <MoreHorizontal size={14} style={{ color: 'var(--text-secondary)' }} />
        </div>

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute top-6 right-0 rounded-lg border shadow-lg z-30 overflow-hidden w-32"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { onEdit(app); setMenuOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--text)' }}
            >
              <Edit3 size={14} /> Edit
            </button>
            <button
              onClick={() => { onRemove(app.id); setMenuOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors hover:opacity-80"
              style={{ color: '#ef4444' }}
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        )}

        <TileIcon app={app} />

        <span className="text-xs font-medium text-center leading-tight text-white drop-shadow-sm max-w-full truncate">
          {app.name}
        </span>
      </div>

      <div
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); handleOpen() }}
      >
        <ExternalLink size={12} className="text-white/70" />
      </div>
    </div>
  )
}
