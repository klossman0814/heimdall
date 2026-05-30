import { ChevronDown, Pencil, Trash2, GripVertical } from 'lucide-react'
import { useState } from 'react'
import type { Category, AppItem } from '../types'
import { TOP_ITEMS_ID } from '../types'
import { useLayoutStore } from '../store/layoutStore'
import { useAppStore } from '../store/appStore'
import Tile from './Tile'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
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
  const { toggleCollapse, renameCategory, removeCategory } = useLayoutStore()
  const { reorderApps } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleRename() {
    if (name.trim()) {
      renameCategory(category.id, name.trim())
    }
    setEditing(false)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = apps.findIndex((a) => a.id === active.id)
    const newIndex = apps.findIndex((a) => a.id === over.id)
    const reordered = [...apps]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    reorderApps(
      category.id,
      reordered.map((a) => a.id)
    )
  }

  const sortedApps = [...apps].sort((a, b) => a.position - b.position)

  return (
    <div ref={setNodeRef} style={categoryStyle} className="mb-8">
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedApps.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={`tile-grid ${tileSize === 'sm' ? 'tile-sm' : tileSize === 'lg' ? 'tile-lg' : ''}`}>
              {sortedApps.map((app) => (
                <Tile
                  key={app.id}
                  app={app}
                  onEdit={onEditApp}
                  onRemove={onRemoveApp}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {!category.collapsed && apps.length === 0 && (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--text-secondary)' }}>
          No applications yet. Click + to add one.
        </p>
      )}
    </div>
  )
}
