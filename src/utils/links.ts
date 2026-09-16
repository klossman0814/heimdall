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

export interface OpenResult {
  opened: number
  /** Tabs the browser refused, which is what a popup blocker does. */
  blocked: number
}

/**
 * Opens each URL in its own tab, reporting how many actually got through.
 *
 * Browsers allow a page to open exactly one tab per click, so a tile holding
 * three sites with a popup blocker in the way yields one tab and two silences.
 * That is browser policy, not something script can dodge: measured in Chrome
 * with the blocker on, clicking a real <a target="_blank"> per site behaves
 * exactly like a window.open loop — one tab either way. window.open is used
 * regardless because its return value is the only way to notice the refusal, so
 * the caller can report it rather than pretend the other sites opened.
 */
export function openUrls(urls: string[]): OpenResult {
  let opened = 0
  let blocked = 0

  for (const raw of urls) {
    const url = normalizeUrl(raw)
    if (!url) continue

    const tab = window.open(url, '_blank')
    if (!tab) {
      blocked++
      continue
    }

    try {
      // The equivalent of rel="noopener", which cannot be combined with the
      // check above: passing noopener makes window.open return null either way.
      tab.opener = null
    } catch {
      // A cross-origin WindowProxy is not always writable. The tab is open.
    }
    opened++
  }

  return { opened, blocked }
}
