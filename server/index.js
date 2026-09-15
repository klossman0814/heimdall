import express from 'express'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { isIP } from 'net'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = process.env.DATA_FILE || '/data/data.json'
const PORT = parseInt(process.env.PORT || '8086', 10)

const defaultData = {
  apps: [],
  categories: [{ id: 'default', name: 'Applications', collapsed: false, position: 0 }],
  settings: {
    theme: 'dark',
    searchProvider: 'google',
    customSearchUrl: '',
    background: { type: 'color', value: '' },
    widgets: {
      clock: true,
      clockFormat: '24h',
      weather: false,
      weatherCityState: '',
      weatherUnit: 'f',
      notes: false,
      notesContent: '',
    },
  },
}

function loadData() {
  if (!existsSync(DATA_FILE)) return structuredClone(defaultData)
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return structuredClone(defaultData)
  }
}

function saveData(data) {
  const dir = dirname(DATA_FILE)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// ---------------------------------------------------------------------------
// Icon discovery (GET /api/fetch-icon?url=...)
//
// Browsers cannot read a page's <link rel="icon"> from another origin (CORS),
// so the server does it: fetch the page, rank the icons it declares, download
// the winner and return it as a data URL the dashboard can store with the app.
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT_MS = 8000
const MAX_REDIRECTS = 4
const MAX_HTML_BYTES = 1024 * 1024
const MAX_MANIFEST_BYTES = 256 * 1024
const MAX_ICON_BYTES = 512 * 1024
const FETCH_USER_AGENT = 'Heimdall-icon-fetcher/1.0'

// Candidate ranking. Kinds are spaced 1000 apart so a large file of a
// lower-ranked kind can never outrank a higher-ranked kind.
const APPLE_TOUCH_ICON_SCORE = 6000
const MANIFEST_ICON_SCORE = 5000
const LINKED_ICON_SCORE = 4000
const LINKED_SVG_ICON_SCORE = 3500
const DEFAULT_FAVICON_SCORE = 500
const MAX_SIZE_BONUS = 999

const MANIFEST_REL_RE = /(?:^|\s)manifest(?:\s|$)/
const APPLE_TOUCH_REL_RE = /(?:^|\s)apple-touch-icon(?:-precomposed)?(?:\s|$)/
const ICON_REL_RE = /(?:^|\s)(?:shortcut\s+)?icon(?:\s|$)/
const SVG_MIME_RE = /svg/
const SVG_EXT_RE = /\.svg(?:[?#].*)?$/i
// Matches both `data:image/svg+xml;base64,...` and `data:image/svg+xml,%3Csvg...`
// (sites such as portainer.io inline the whole icon as a URL-encoded data URL).
const IMAGE_DATA_URL_RE = /^data:(image\/[a-z0-9.+-]+)(?:;[^,]*)?,/i
const MAX_INLINE_DATA_URL_LENGTH = 512 * 1024

const LINK_TAG_RE = /<link\b[^>]*>/gi
const BASE_TAG_RE = /<base\b[^>]*>/i
const TAG_ATTRIBUTE_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g
const HTML_ENTITIES = {
  '&amp;': '&',
  '&#38;': '&',
  '&lt;': '<',
  '&#60;': '<',
  '&gt;': '>',
  '&#62;': '>',
  '&quot;': '"',
  '&#34;': '"',
  '&apos;': "'",
  '&#39;': "'",
}

// Loopback, LAN and other private ranges stay allowed on purpose: homelab
// services usually exist only on the local network. Link-local (cloud metadata),
// unspecified and multicast addresses are refused.
function isBlockedHost(hostname) {
  const version = isIP(hostname)
  if (version === 4) {
    const [a, b] = hostname.split('.').map(Number)
    if (a === 0 || a === 255) return true
    if (a === 169 && b === 254) return true
    if (a >= 224) return true
    return false
  }
  if (version === 6) {
    const host = hostname.toLowerCase()
    if (host === '::') return true
    if (/^fe[89ab]/.test(host)) return true
    if (host.startsWith('ff')) return true
    return false
  }
  return false
}

function toFetchTarget(value, base) {
  let url
  try {
    url = value instanceof URL ? new URL(value.href) : new URL(String(value), base)
  } catch {
    throw new Error('not a valid URL')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('only http and https URLs are supported')
  }
  if (isBlockedHost(url.hostname.replace(/^\[|\]$/g, ''))) {
    throw new Error('that address is not allowed')
  }
  return url
}

async function readBodyWithLimit(response, maxBytes, tooLargeMessage) {
  if (!response.body) return Buffer.alloc(0)
  const chunks = []
  let total = 0
  for await (const chunk of response.body) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buffer.length
    if (total > maxBytes) throw new Error(tooLargeMessage)
    chunks.push(buffer)
  }
  return Buffer.concat(chunks)
}

// Icon declarations live in <head>, so there is no need to download a whole
// multi-megabyte page: read until </head> shows up, or until the cap is hit,
// and hand back whatever was read. Reading the head is also what makes pages
// bigger than the cap still work instead of being dropped entirely
// (jellyfin.org is ~586KB, grafana.com ~660KB).
async function readDocumentHead(response, maxBytes) {
  if (!response.body) return Buffer.alloc(0)
  const chunks = []
  let total = 0
  let previousTail = ''
  for await (const chunk of response.body) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    if (total + buffer.length > maxBytes) {
      chunks.push(buffer.subarray(0, Math.max(0, maxBytes - total)))
      break
    }
    chunks.push(buffer)
    total += buffer.length
    const text = buffer.toString('utf-8')
    if ((previousTail + text).toLowerCase().includes('</head>')) break
    previousTail = text.slice(-16)
  }
  return Buffer.concat(chunks)
}

async function fetchBounded(url, { accept, maxBytes, tooLargeMessage, readBody = readBodyWithLimit }) {
  let current = toFetchTarget(url)
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    try {
      const response = await fetch(current, {
        redirect: 'manual',
        signal: controller.signal,
        headers: { accept, 'user-agent': FETCH_USER_AGENT },
      })
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (response.body) await response.body.cancel().catch(() => {})
        if (!location) throw new Error(`redirect without a location (HTTP ${response.status})`)
        current = toFetchTarget(new URL(location, current))
        continue
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const body = await readBody(response, maxBytes, tooLargeMessage)
      return { url: current, body }
    } finally {
      clearTimeout(timer)
    }
  }
  throw new Error('too many redirects')
}

function parseTagAttributes(tag) {
  const attributes = {}
  for (const match of tag.matchAll(TAG_ATTRIBUTE_RE)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  return attributes
}

function decodeHtmlEntities(value) {
  return value.replace(
    /&(?:amp|lt|gt|quot|apos|#38|#60|#62|#34|#39);/gi,
    (entity) => HTML_ENTITIES[entity.toLowerCase()] ?? entity
  )
}

function parseIconSizes(sizes) {
  if (!sizes) return 0
  let best = 0
  for (const part of String(sizes).toLowerCase().split(/\s+/)) {
    if (!part) continue
    if (part === 'any') {
      best = Math.max(best, 512)
      continue
    }
    const match = /^(\d+)x(\d+)$/.exec(part)
    if (match) best = Math.max(best, Math.min(Number(match[1]), Number(match[2])))
  }
  return Math.min(best, MAX_SIZE_BONUS)
}

function absolutize(value, base) {
  try {
    return new URL(value, base)
  } catch {
    return null
  }
}

// Candidates must be fetchable over http(s); anything else (chrome-extension://,
// a data: URL we failed to classify, ...) is dropped here rather than turning
// into a confusing download failure later.
function toHttpUrl(value, base) {
  const url = absolutize(value, base)
  if (!url) return null
  return url.protocol === 'http:' || url.protocol === 'https:' ? url : null
}

function resolveDocumentBase(html, fallback) {
  const tag = BASE_TAG_RE.exec(html)
  if (!tag) return fallback
  const href = decodeHtmlEntities(parseTagAttributes(tag[0]).href || '').trim()
  if (!href) return fallback
  return absolutize(href, fallback) ?? fallback
}

function collectIconCandidates(html, responseUrl) {
  const base = resolveDocumentBase(html, responseUrl)
  const ranked = []
  let manifestUrl = null

  for (const tag of html.matchAll(LINK_TAG_RE)) {
    const attributes = parseTagAttributes(tag[0])
    const rel = (attributes.rel || '').toLowerCase()
    const href = decodeHtmlEntities(attributes.href || '').trim()
    if (!href) continue

    if (MANIFEST_REL_RE.test(rel)) {
      if (!manifestUrl) manifestUrl = absolutize(href, base)
      continue
    }
    if (APPLE_TOUCH_REL_RE.test(rel)) {
      ranked.push({ href, score: APPLE_TOUCH_ICON_SCORE + parseIconSizes(attributes.sizes) })
      continue
    }
    if (ICON_REL_RE.test(rel) && !rel.includes('mask-icon')) {
      const isSvg = SVG_MIME_RE.test(attributes.type || '') || SVG_EXT_RE.test(href)
      ranked.push({
        href,
        score: (isSvg ? LINKED_SVG_ICON_SCORE : LINKED_ICON_SCORE) + parseIconSizes(attributes.sizes),
      })
    }
  }

  const candidates = []
  for (const entry of ranked) {
    if (IMAGE_DATA_URL_RE.test(entry.href)) {
      if (entry.href.length <= MAX_INLINE_DATA_URL_LENGTH) {
        candidates.push({ dataUrl: entry.href, score: entry.score })
      }
      continue
    }
    const url = toHttpUrl(entry.href, base)
    if (url) candidates.push({ url, score: entry.score })
  }

  return { candidates, manifestUrl }
}

async function collectManifestCandidates(manifestUrl) {
  try {
    const manifest = await fetchBounded(manifestUrl, {
      accept: 'application/manifest+json,application/json',
      maxBytes: MAX_MANIFEST_BYTES,
      tooLargeMessage: 'web manifest is too large',
    })
    const parsed = JSON.parse(manifest.body.toString('utf-8'))
    if (!Array.isArray(parsed?.icons)) return []

    const candidates = []
    for (const icon of parsed.icons) {
      const src = typeof icon?.src === 'string' ? icon.src.trim() : ''
      if (!src) continue
      const score = MANIFEST_ICON_SCORE + parseIconSizes(icon.sizes || '')
      if (IMAGE_DATA_URL_RE.test(src)) {
        if (src.length <= MAX_INLINE_DATA_URL_LENGTH) candidates.push({ dataUrl: src, score })
        continue
      }
      const url = toHttpUrl(src, manifest.url)
      if (url) candidates.push({ url, score })
    }
    return candidates
  } catch {
    return []
  }
}

function detectImageMime(buffer) {
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG') return 'image/png'
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer.length >= 6 && buffer.toString('ascii', 0, 3) === 'GIF') return 'image/gif'
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  if (buffer.length >= 4 && buffer[0] === 0x00 && buffer[1] === 0x00 && (buffer[2] === 0x01 || buffer[2] === 0x02) && buffer[3] === 0x00) return 'image/x-icon'
  if (buffer.length >= 2 && buffer[0] === 0x42 && buffer[1] === 0x4d) return 'image/bmp'
  if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12)
    if (brand === 'avif' || brand === 'avis') return 'image/avif'
  }

  // Text formats last, and never for an HTML error page served with a 200.
  const head = buffer.toString('utf-8', 0, Math.min(buffer.length, 2048)).trim().toLowerCase()
  if (head.startsWith('<!doctype html') || head.includes('<html')) return ''
  // SVGs often open with a comment, an XML prolog or a DOCTYPE, so look for the
  // root element rather than requiring it first.
  if (head.includes('<svg')) return 'image/svg+xml'
  return ''
}

async function toIconAsset(candidate) {
  if (candidate.dataUrl) {
    const match = IMAGE_DATA_URL_RE.exec(candidate.dataUrl)
    if (!match) throw new Error('inline icon is not an image')
    return {
      dataUrl: candidate.dataUrl,
      source: 'inline data URL',
      mime: match[1].toLowerCase(),
      bytes: candidate.dataUrl.length,
    }
  }

  const response = await fetchBounded(candidate.url, {
    accept: 'image/*,*/*;q=0.5',
    maxBytes: MAX_ICON_BYTES,
    tooLargeMessage: `icon is larger than ${Math.round(MAX_ICON_BYTES / 1024)}KB`,
  })
  const mime = detectImageMime(response.body)
  if (!mime) throw new Error('response is not an image')
  return {
    dataUrl: `data:${mime};base64,${response.body.toString('base64')}`,
    source: response.url.href,
    mime,
    bytes: response.body.length,
  }
}

async function downloadFirstIcon(candidates) {
  const seen = new Set()
  for (const candidate of [...candidates].sort((a, b) => b.score - a.score)) {
    const key = candidate.dataUrl ?? candidate.url.href
    if (seen.has(key)) continue
    seen.add(key)
    try {
      return await toIconAsset(candidate)
    } catch {
      // Keep going: a dead or non-image candidate should not fail the lookup.
    }
  }
  return null
}

async function discoverIcon(target) {
  const candidates = []
  let manifestUrl = null

  try {
    const page = await fetchBounded(target, {
      accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
      maxBytes: MAX_HTML_BYTES,
      readBody: readDocumentHead,
    })
    const collected = collectIconCandidates(page.body.toString('utf-8'), page.url)
    candidates.push(...collected.candidates)
    manifestUrl = collected.manifestUrl
  } catch {
    // The page may not be HTML at all, but a favicon could still be served.
  }

  if (manifestUrl && !candidates.some((candidate) => candidate.score >= LINKED_SVG_ICON_SCORE)) {
    candidates.push(...(await collectManifestCandidates(manifestUrl)))
  }

  candidates.push({ url: new URL('/favicon.ico', target), score: DEFAULT_FAVICON_SCORE })
  return downloadFirstIcon(candidates)
}

const app = express()
app.use(express.json({ limit: '10mb' }))
app.use(express.static(join(__dirname, '..', 'dist')))

app.get('/api/data', (_req, res) => {
  res.json(loadData())
})

app.put('/api/data', (req, res) => {
  const data = loadData()
  const { apps, categories, settings } = req.body
  if (apps !== undefined) data.apps = apps
  if (categories !== undefined) data.categories = categories
  if (settings !== undefined) data.settings = settings
  saveData(data)
  res.json({ ok: true })
})

app.get('/api/fetch-icon', async (req, res) => {
  const queryValue = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url
  if (typeof queryValue !== 'string' || !queryValue.trim()) {
    res.status(400).json({ ok: false, error: 'A url query parameter is required' })
    return
  }

  let target
  try {
    target = toFetchTarget(queryValue.trim())
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message })
    return
  }

  try {
    const asset = await discoverIcon(target)
    if (!asset) {
      res.status(404).json({ ok: false, error: `No icon found on ${target.host}` })
      return
    }
    res.json({
      ok: true,
      icon: asset.dataUrl,
      source: asset.source,
      mime: asset.mime,
      bytes: asset.bytes,
    })
  } catch (error) {
    res.status(502).json({ ok: false, error: `Icon lookup failed for ${target.host}: ${error.message}` })
  }
})

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, '..', 'dist', 'index.html'))
  } else {
    next()
  }
})

app.listen(PORT, () => {
  console.log(`Heimdall running on http://0.0.0.0:${PORT}`)
})
