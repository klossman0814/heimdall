import { create } from 'zustand'
import type { Category } from '../types'

function genId() {
  return `cat_${Date.now()}`
}

interface LayoutState {
  categories: Category[]
  hydrate: (categories: Category[]) => void
  addCategory: (name: string) => void
  renameCategory: (id: string, name: string) => void
  removeCategory: (id: string) => void
  toggleCollapse: (id: string) => void
  reorderCategories: (ids: string[]) => void
  importCategories: (categories: Category[]) => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
  categories: [{ id: 'default', name: 'Applications', collapsed: false, position: 0 }],

  hydrate: (categories) => set({ categories }),

  addCategory: (name) =>
    set((state) => {
      const cat: Category = {
        id: genId(),
        name,
        collapsed: false,
        position: state.categories.length,
      }
      return { categories: [...state.categories, cat] }
    }),

  renameCategory: (id, name) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, name } : c
      ),
    })),

  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, position: i })),
    })),

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

  importCategories: (categories) => {
    set({ categories })
  },
}))
