import { ExternalLink, MoreHorizontal, Edit3, Trash2, GripVertical, Layers, Globe, ListPlus } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { AppItem } from '../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAppStore } from '../store/appStore'
import { resolveLinks, openUrls } from '../utils/links'

interface TileProps {
  app: AppItem
  categoryColor?: string
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

export default function Tile({ app, categoryColor, onEdit, onRemove }: TileProps) {
  const apps = useAppStore((s) => s.apps)
  const [menuOpen, setMenuOpen] = useState(false)
  const [linksOpen, setLinksOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  // A tile with links launches every one of them; an ordinary tile launches its
  // single URL. Links are resolved against the live app list so a renamed or
  // fixed-up app shows through here.
  const links = resolveLinks(app, apps)
  const isMulti = links.length > 0

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

  const isDraggingRef = useRef(false)
  useEffect(() => {
    if (isDragging) {
      isDraggingRef.current = true
    }
  }, [isDragging])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false)
      }
      if (linksRef.current && !linksRef.current.contains(target)) {
        setLinksOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const resolvedColor = app.color || categoryColor || '#6366f1'
  const sizeClasses = app.tileSize === 'sm' ? 'p-3' : app.tileSize === 'lg' ? 'p-6' : 'p-4'

  function openAll() {
    if (links.length === 0) return
    useAppStore.getState().incrementClickCount(app.id)
    openUrls(links.map((link) => link.url))
    setLinksOpen(false)
  }

  function openOne(url: string) {
    useAppStore.getState().incrementClickCount(app.id)
    openUrls([url])
    setLinksOpen(false)
  }

  function handleOpen() {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      return
    }
    if (isMulti) {
      openAll()
      return
    }
    if (!app.url) return
    useAppStore.getState().incrementClickCount(app.id)
    openUrls([app.url])
  }

  function handleClick(e: React.MouseEvent) {
    if (!isDragging) {
      e.stopPropagation()
      handleOpen()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 hover:shadow-lg ${sizeClasses}`}
      {...attributes}
      {...listeners}
      onClick={handleClick}
    >
      <div
        className="absolute inset-0 rounded-xl opacity-90 transition-opacity group-hover:opacity-100"
        style={{ backgroundColor: resolvedColor }}
      />
      <div className="absolute inset-0 rounded-xl bg-black/10" />

      <div className="relative z-10 flex flex-col items-center gap-2">
        {categoryColor && !app.color && (
          <div
            className="absolute top-1 left-1 px-1 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold z-20"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.8)' }}
            title="Using category color"
          >
            cat
          </div>
        )}
        <div
          className="absolute -top-1 -left-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <GripVertical size={14} style={{ color: 'var(--text-secondary)' }} />
        </div>

        <button
          type="button"
          className="absolute -top-1 -right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity z-20 cursor-pointer"
          style={{ backgroundColor: 'var(--bg-card)' }}
          aria-label="Edit or remove this tile"
          title="Edit or remove"
          onClick={(e) => {
            e.stopPropagation()
            setLinksOpen(false)
            setMenuOpen(!menuOpen)
          }}
        >
          <MoreHorizontal size={14} style={{ color: 'var(--text-secondary)' }} />
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute top-6 right-0 rounded-lg border shadow-lg z-40 overflow-hidden w-32"
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

      {isMulti && (
        <div
          className="absolute bottom-1 left-1 z-20 flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-semibold"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.85)' }}
          title={`Opens ${links.length} sites`}
        >
          <Layers size={9} />
          {links.length}
        </div>
      )}

      {!isMulti && (
        <div
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); handleOpen() }}
        >
          <ExternalLink size={12} className="text-white/70" />
        </div>
      )}

      {/*
        The per-site menu lives in the bottom-right corner, well away from the
        top-right edit/remove control. The corners used to collide: this wrapper
        sat at top-1 right-1 with z-20 while the edit button sits in the z-10
        content layer at -top-1 -right-1, so it painted over the edit button's
        centre and swallowed every click meant for it — which made a multi-site
        tile impossible to edit or delete.
      */}
      {isMulti && (
        <div
          ref={linksRef}
          className="absolute bottom-1 right-1 z-20 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => { setLinksOpen(!linksOpen); setMenuOpen(false) }}
            className="p-1 rounded transition-colors cursor-pointer"
            style={{ backgroundColor: linksOpen ? 'rgba(0,0,0,0.45)' : 'transparent' }}
            aria-label={`Open one of the ${links.length} sites`}
            title="Open just one of these sites"
          >
            <ListPlus size={13} className="text-white/80" />
          </button>

          {linksOpen && (
            <div
              className="absolute top-6 right-0 w-52 rounded-lg border shadow-lg z-30 max-h-64 overflow-y-auto scrollbar-thin"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <button
                onClick={openAll}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-left transition-colors hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                <Layers size={13} /> Open all ({links.length})
              </button>
              <div style={{ height: 1, backgroundColor: 'var(--border)' }} />
              {links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => openOne(link.url)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors hover:opacity-80"
                  style={{ color: 'var(--text)' }}
                  title={link.url}
                >
                  {link.icon
                    ? <img src={link.icon} alt="" className="w-4 h-4 rounded shrink-0" />
                    : <Globe size={13} className="shrink-0" style={{ color: 'var(--text-secondary)' }} />}
                  <span className="truncate">{link.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
