import { create } from 'zustand'
import type { Category } from '../types'

function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem('heimdall-categories')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return [{ id: 'default', name: 'Applications', collapsed: false, position: 0 }]
}

function saveCategories(c: Category[]) {
  localStorage.setItem('heimdall-categories', JSON.stringify(c))
}

function genId() {
  return `cat_${Date.now()}`
}

interface LayoutState {
  categories: Category[]
  addCategory: (name: string) => void
  renameCategory: (id: string, name: string) => void
  removeCategory: (id: string) => void
  toggleCollapse: (id: string) => void
  reorderCategories: (ids: string[]) => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
  categories: loadCategories(),

  addCategory: (name) =>
    set((state) => {
      const cat: Category = {
        id: genId(),
        name,
        collapsed: false,
        position: state.categories.length,
      }
      const categories = [...state.categories, cat]
      saveCategories(categories)
      return { categories }
    }),

  renameCategory: (id, name) =>
    set((state) => {
      const categories = state.categories.map((c) =>
        c.id === id ? { ...c, name } : c
      )
      saveCategories(categories)
      return { categories }
    }),

  removeCategory: (id) =>
    set((state) => {
      const categories = state.categories
        .filter((c) => c.id !== id)
        .map((c, i) => ({ ...c, position: i }))
      saveCategories(categories)
      return { categories }
    }),

  toggleCollapse: (id) =>
    set((state) => {
      const categories = state.categories.map((c) =>
        c.id === id ? { ...c, collapsed: !c.collapsed } : c
      )
      saveCategories(categories)
      return { categories }
    }),

  reorderCategories: (ids) =>
    set((state) => {
      const categories = ids
        .map((id) => state.categories.find((c) => c.id === id))
        .filter((c): c is Category => c !== undefined)
        .map((c, i) => ({ ...c, position: i }))
      saveCategories(categories)
      return { categories }
    }),
}))
