import { useEffect, useRef } from 'react'
import { TOP_ITEMS_ID } from '../types'
import { useAppStore } from '../store/appStore'
import { useLayoutStore } from '../store/layoutStore'
import { useSettingsStore } from '../store/settingsStore'

const RESET_INTERVAL_MS = 5 * 60 * 1000

function isTimeForReset(lastResetAt: string | null, interval: string): boolean {
  if (interval === 'never' || !lastResetAt) return false
  const ms = interval === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000
  return Date.now() - new Date(lastResetAt).getTime() > ms
}

export function evaluateTopItems() {
  const { apps, updateApp, resetAllClickCounts } = useAppStore.getState()
  const { settings, updateTopItems } = useSettingsStore.getState()
  const { ensureTopItemsCategory } = useLayoutStore.getState()

  if (!settings.topItems.enabled) return

  ensureTopItemsCategory()

  const hasAnyClick = apps.some((a) => a.clickCount > 0)
  if (!hasAnyClick) return

  if (isTimeForReset(settings.topItems.lastResetAt, settings.topItems.resetInterval)) {
    resetAllClickCounts()
    updateTopItems({ lastResetAt: new Date().toISOString() })
    return
  }

  const count = settings.topItems.count
  const eligible = apps.filter((a) => a.categoryId !== TOP_ITEMS_ID)
  const sorted = [...eligible].sort((a, b) => b.clickCount - a.clickCount)
  const topIds = new Set(sorted.slice(0, count).map((a) => a.id))

  const currentTop = apps.filter((a) => a.categoryId === TOP_ITEMS_ID)
  const currentTopIds = new Set(currentTop.map((a) => a.id))

  let rank = 0
  for (const app of sorted) {
    if (!topIds.has(app.id)) break
    if (app.categoryId !== TOP_ITEMS_ID) {
      updateApp(app.id, {
        categoryId: TOP_ITEMS_ID,
        previousCategoryId: app.categoryId,
        position: rank,
      })
    }
    rank++
  }

  for (const app of currentTop) {
    if (!topIds.has(app.id)) {
      const restoreId = app.previousCategoryId || 'default'
      const catApps = useAppStore
        .getState()
        .apps.filter((a) => a.categoryId === restoreId)
      const maxPos = catApps.reduce((max, a) => Math.max(max, a.position), -1)
      updateApp(app.id, {
        categoryId: restoreId,
        previousCategoryId: null,
        position: maxPos + 1,
      })
    }
  }
}

export function useTopItems() {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      evaluateTopItems()
    }

    const interval = setInterval(evaluateTopItems, RESET_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])
}
