import { useState } from 'react'
import { Plus, LayoutGrid } from 'lucide-react'
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
} from '@dnd-kit/sortable'
import type { AppItem } from '../types'
import { useAppStore } from '../store/appStore'
import { useLayoutStore } from '../store/layoutStore'
import { useSettingsStore } from '../store/settingsStore'
import SearchBar from './SearchBar'
import CategoryGroup from './CategoryGroup'
import AppForm from './AppForm'
import Widgets from './Widgets'

export default function Dashboard() {
  const { apps, removeApp } = useAppStore()
  const { categories, reorderCategories } = useLayoutStore()
  const { settings } = useSettingsStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<AppItem | null>(null)
  const [showAll] = useState(false)

  const sortedCats = [...categories].sort((a, b) => a.position - b.position)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleCategoryDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortedCats.findIndex((c) => c.id === active.id)
    const newIndex = sortedCats.findIndex((c) => c.id === over.id)
    const reordered = [...sortedCats]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)

    reorderCategories(reordered.map((c) => c.id))
  }

  const bgStyle =
    settings.background.type === 'image'
      ? { backgroundImage: `url(${settings.background.value})` }
      : settings.background.type === 'gradient'
      ? { background: settings.background.value }
      : settings.background.value
      ? { backgroundColor: settings.background.value }
      : {}

  return (
    <div className="min-h-screen" style={bgStyle}>
      <div
        className="min-h-screen"
        style={{
          backgroundColor:
            settings.background.type === 'image'
              ? 'rgba(0,0,0,0.5)'
              : 'transparent',
          backdropFilter:
            settings.background.type === 'image'
              ? 'blur(2px)'
              : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <LayoutGrid size={28} style={{ color: 'var(--accent)' }} />
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                Heimdall
              </h1>
            </div>
            <button
              onClick={() => { setEditingApp(null); setFormOpen(true) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add App</span>
            </button>
          </div>

          <div className="mb-8">
            <SearchBar />
          </div>

          <Widgets />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleCategoryDragEnd}
          >
            <SortableContext
              items={sortedCats.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedCats.map((cat) => {
                const catApps = apps.filter((a) => a.categoryId === cat.id)
                if (!showAll && catApps.length === 0) return null
                return (
                  <CategoryGroup
                    key={cat.id}
                    category={cat}
                    apps={catApps}
                    onEditApp={(app) => { setEditingApp(app); setFormOpen(true) }}
                    onRemoveApp={removeApp}
                    tileSize="md"
                  />
                )
              })}
            </SortableContext>
          </DndContext>

          {apps.length === 0 && (
            <div className="text-center py-20">
              <LayoutGrid size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--text-secondary)' }} />
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                Welcome to Heimdall
              </h2>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Add your first application to get started.
              </p>
              <button
                onClick={() => setFormOpen(true)}
                className="px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Plus size={18} className="inline mr-2" />
                Add Application
              </button>
            </div>
          )}
        </div>
      </div>

      {formOpen && (
        <AppForm
          app={editingApp}
          onClose={() => { setFormOpen(false); setEditingApp(null) }}
        />
      )}
    </div>
  )
}
