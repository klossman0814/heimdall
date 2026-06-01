import { ChevronDown, Pencil, Trash2, GripVertical, Palette } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { Category, AppItem } from '../types'
import { TOP_ITEMS_ID } from '../types'
import { useLayoutStore } from '../store/layoutStore'
import { useAppStore } from '../store/appStore'
import { TILE_COLORS } from '../utils/colors'
import Tile from './Tile'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CategoryGroupProps {
  category: Category
  apps: AppItem[]
  onEditApp: (app: AppItem) => void
  onRemoveApp: (id: string) => void
  tileSize: 'sm' | 'md' | 'lg'
}

export default function CategoryGroup({
  category,
  apps,
  onEditApp,
  onRemoveApp,
  tileSize,
}: CategoryGroupProps) {
  const { toggleCollapse, renameCategory, removeCategory, setCategoryColor } = useLayoutStore()
  const { setCategoryAppColors } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [colorOpen, setColorOpen] = useState(false)
  const colorRef = useRef<HTMLDivElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id, data: { type: 'category' } })

  const categoryStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setColorOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleRename() {
    if (name.trim()) {
      renameCategory(category.id, name.trim())
    }
    setEditing(false)
  }

  const sortedApps = [...apps].sort((a, b) => a.position - b.position)

  return (
    <div ref={setNodeRef} style={categoryStyle} className="mb-8">
      {category.color && (
        <div className="h-1 rounded-full mb-2" style={{ backgroundColor: category.color }} />
      )}
      <div className="flex items-center gap-2 mb-4 group">
        <button
          className="p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
          title="Drag to reorder category"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
        <button
          onClick={() => toggleCollapse(category.id)}
          className="transition-transform"
          style={{ transform: category.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
        >
          <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />
        </button>

        {editing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="text-lg font-semibold bg-transparent border-b-2 outline-none"
            style={{
              color: 'var(--text)',
              borderColor: 'var(--accent)',
            }}
            autoFocus
          />
        ) : (
          <h2
            className="text-lg font-semibold cursor-pointer"
            style={{ color: 'var(--text)' }}
            onClick={() => toggleCollapse(category.id)}
          >
            {category.name}
          </h2>
        )}

        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          {apps.length}
        </span>

        <div className="relative ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <div className="relative">
              <button
                onClick={() => setColorOpen(!colorOpen)}
                className="p-1 rounded transition-colors hover:opacity-80"
                style={{ color: category.color || 'var(--text-secondary)' }}
                title="Set category color"
              >
                <Palette size={14} />
              </button>
              {colorOpen && (
                <div
                  ref={colorRef}
                  className="absolute top-7 right-0 p-2 rounded-lg border shadow-lg z-30 grid grid-cols-6 gap-1.5"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  <button
                    onClick={() => { setCategoryColor(category.id, undefined); setColorOpen(false) }}
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px]"
                    style={{ backgroundColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    title="No color (use tile defaults)"
                  >
                    ∅
                  </button>
                  {TILE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        setCategoryColor(category.id, c.value)
                        setCategoryAppColors(category.id, c.value)
                        setColorOpen(false)
                      }}
                      className="w-5 h-5 rounded transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c.value,
                        outline: category.color === c.value ? '2px solid var(--accent)' : 'none',
                        outlineOffset: '2px',
                      }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="p-1 rounded transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              title="Rename category"
            >
              <Pencil size={14} />
            </button>
            {category.id !== 'default' && category.id !== TOP_ITEMS_ID && (
              <button
                onClick={() => removeCategory(category.id)}
                className="p-1 rounded transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
                title="Delete category"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {!category.collapsed && (
        <SortableContext
          items={sortedApps.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={`tile-grid ${tileSize === 'sm' ? 'tile-sm' : tileSize === 'lg' ? 'tile-lg' : ''}`}>
            {sortedApps.map((app) => (
              <Tile
                key={app.id}
                app={app}
                categoryColor={category.color}
                onEdit={onEditApp}
                onRemove={onRemoveApp}
              />
            ))}
          </div>
        </SortableContext>
      )}

      {!category.collapsed && apps.length === 0 && (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>
          No applications yet. Click + to add one.
        </p>
      )}
    </div>
  )
}
