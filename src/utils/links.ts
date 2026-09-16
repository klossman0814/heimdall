import type { AppItem } from '../types'

/** Turns "plex.lan" into "https://plex.lan", leaving absolute http(s) URLs alone. */
export function normalizeUrl(value: string): string {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

/** Fallback label for a site that has no name of its own. */
export function hostLabel(value: string): string {
  const url = normalizeUrl(value)
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '') || 'Link'
  } catch {
    return url
  }
}

export interface ResolvedLink {
  id: string
  label: string
  url: string
  icon: string
  appId: string | null
}

/**
 * Expands a tile's saved links into the rows to render and open.
 *
 * Links that point at another app resolve against the *current* app list, so
 * renaming an app or fixing its URL updates every tile that launches it. The
 * stored label and URL only stand in once that app is gone.
 */
export function resolveLinks(app: AppItem, apps: AppItem[]): ResolvedLink[] {
  const resolved: ResolvedLink[] = []

  for (const link of app.links ?? []) {
    const source = link.appId ? apps.find((a) => a.id === link.appId) : undefined
    const url = normalizeUrl(source?.url || link.url)
    if (!url) continue
    // Trim before falling back: a whitespace-only label is truthy but useless.
    const label = (source?.name || link.label).trim()
    resolved.push({
      id: link.id,
      appId: link.appId,
      url,
      label: label || hostLabel(url),
      icon: source?.icon || '',
    })
  }

  return resolved
}

/**
 * Opens each URL in its own tab.
 *
 * Anchors are clicked rather than calling window.open in a loop: an in-gesture
 * click on a real <a target="_blank"> is the form browsers are most willing to
 * treat as user-initiated, so a tile launching five services is far less likely
 * to be trimmed by the popup blocker.
 */
export function openUrls(urls: string[]) {
  for (const raw of urls) {
    const url = normalizeUrl(raw)
    if (!url) continue

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }
}
