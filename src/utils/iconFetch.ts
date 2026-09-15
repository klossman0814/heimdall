/**
 * Pulls an app's icon from the website it is served from.
 *
 * Reading another origin's HTML is impossible from the browser (CORS), so the
 * heavy lifting happens in the bundled Express server via `/api/fetch-icon`.
 * When that server is not in front of us — `npm run dev` without it, or a plain
 * static deployment — we fall back to a public favicon service for hostnames
 * that are actually reachable from the internet. LAN-only hosts (`plex.lan`,
 * `192.168.1.5`) can only be inspected by the server, so there we say so
 * instead of silently storing a generic globe.
 */

export type IconLookupVia = 'website' | 'favicon-service'

export interface WebsiteIcon {
  /** Data URL (preferred, self-contained) or remote image URL. */
  icon: string
  via: IconLookupVia
  /** Where the bytes came from — the site's own icon, or the public service. */
  detail: string
}

const ENDPOINT = '/api/fetch-icon'
const REQUEST_TIMEOUT_MS = 15000
const FAVICON_SERVICE_URL = 'https://www.google.com/s2/favicons'

const PRIVATE_SUFFIXES = ['.local', '.lan', '.home', '.internal', '.localhost', '.test', '.localdomain', '.home.arpa']

type ServerLookup =
  | { status: 'ok'; icon: string; detail: string }
  | { status: 'unavailable' }
  | { status: 'rejected'; message: string }
  | { status: 'no-icon'; message: string }

function normalizeAppUrl(raw: string): URL {
  const trimmed = raw.trim()
  if (!trimmed) throw new Error('Enter the app URL first')

  // Bare hostnames are common in a homelab ("plex.lan:32400"), so assume http.
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    throw new Error('That URL could not be parsed')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http and https URLs are supported')
  }
  return url
}

/** Hostnames a public favicon service can know about. */
function isPublicHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  if (host.includes(':')) return false
  if (!host.includes('.')) return false
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false
  return !PRIVATE_SUFFIXES.some((suffix) => host.endsWith(suffix))
}

async function requestFromServer(url: URL): Promise<ServerLookup> {
  let response: Response
  try {
    response = await fetch(`${ENDPOINT}?url=${encodeURIComponent(url.href)}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    // No server in front of us (static hosting, or a dev server without the
    // proxy running) or the lookup timed out.
    return { status: 'unavailable' }
  }

  // A static host answers unknown paths with index.html, so the body shape is
  // the only reliable way to tell "handled" from "not implemented here".
  if (!(response.headers.get('content-type') || '').includes('application/json')) {
    return { status: 'unavailable' }
  }

  let payload: { icon?: unknown; source?: unknown; error?: unknown }
  try {
    payload = (await response.json()) as typeof payload
  } catch {
    return { status: 'unavailable' }
  }

  if (response.ok && typeof payload.icon === 'string' && payload.icon.startsWith('data:image/')) {
    return { status: 'ok', icon: payload.icon, detail: typeof payload.source === 'string' ? payload.source : url.href }
  }
  if (typeof payload.error === 'string') {
    // 400 means the server refused the address itself; 404/502 mean it tried and
    // could not produce an icon.
    return response.status === 400
      ? { status: 'rejected', message: payload.error }
      : { status: 'no-icon', message: payload.error }
  }
  return { status: 'unavailable' }
}

/**
 * Best-effort lookup of the icon a website declares for itself.
 *
 * @throws {Error} with a message suitable for showing in the UI.
 */
export async function fetchIconFromWebsite(appUrl: string): Promise<WebsiteIcon> {
  const url = normalizeAppUrl(appUrl)
  const fromServer = await requestFromServer(url)

  if (fromServer.status === 'ok') {
    return { icon: fromServer.icon, via: 'website', detail: fromServer.detail }
  }
  if (fromServer.status === 'rejected') {
    throw new Error(fromServer.message)
  }

  if (isPublicHost(url.hostname)) {
    const service = `${FAVICON_SERVICE_URL}?domain=${encodeURIComponent(url.hostname)}&sz=128`
    return { icon: service, via: 'favicon-service', detail: service }
  }

  if (fromServer.status === 'no-icon') throw new Error(fromServer.message)
  throw new Error(
    `Heimdall's server is not reachable, and ${url.hostname} is a private address, so its icon cannot be read from the browser alone.`
  )
}

/** Short "where did this come from" label for the form. */
export function describeIconSource(detail: string): string {
  try {
    return new URL(detail).host
  } catch {
    return 'an inline image'
  }
}
