import { create } from 'zustand'
import type { Category } from '../types'
import { TOP_ITEMS_ID } from '../types'

function genId() {
  return `cat_${Date.now()}`
}

interface LayoutState {
  categories: Category[]
  hydrate: (categories: Category[]) => void
  addCategory: (name: string, color?: string) => void
  renameCategory: (id: string, name: string) => void
  setCategoryColor: (id: string, color: string | undefined) => void
  removeCategory: (id: string) => void
  toggleCollapse: (id: string) => void
  reorderCategories: (ids: string[]) => void
  ensureTopItemsCategory: () => void
  importCategories: (categories: Category[]) => void
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  categories: [{ id: 'default', name: 'Applications', collapsed: false, position: 0 }],

  hydrate: (categories) => set({ categories }),

  addCategory: (name, color) =>
    set((state) => {
      const cat: Category = {
        id: genId(),
        name,
        collapsed: false,
        position: state.categories.length,
        ...(color ? { color } : {}),
      }
      return { categories: [...state.categories, cat] }
    }),

  renameCategory: (id, name) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, name } : c
      ),
    })),

  setCategoryColor: (id, color) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...(color ? { color } : { color: undefined }) } : c
      ),
    })),

  removeCategory: (id) => {
    if (id === 'default' || id === TOP_ITEMS_ID) return
    set((state) => ({
      categories: state.categories
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, position: i })),
    }))
  },

  toggleCollapse: (id) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, collapsed: !c.collapsed } : c
      ),
    })),

  reorderCategories: (ids) =>
    set((state) => ({
      categories: ids
        .map((id) => state.categories.find((c) => c.id === id))
        .filter((c): c is Category => c !== undefined)
        .map((c, i) => ({ ...c, position: i })),
    })),

  ensureTopItemsCategory: () => {
    const state = get()
    if (state.categories.some((c) => c.id === TOP_ITEMS_ID)) return
    set((s) => ({
      categories: [
        {
          id: TOP_ITEMS_ID,
          name: 'Top Items',
          collapsed: false,
          position: 0,
        },
        ...s.categories.map((c) => ({ ...c, position: c.position + 1 })),
      ],
    }))
  },

  importCategories: (categories) => {
    set({ categories })
  },
}))
