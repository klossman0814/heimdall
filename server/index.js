import express from 'express'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomBytes, scryptSync, randomUUID } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = process.env.DATA_FILE || '/data/data.json'
const PORT = parseInt(process.env.PORT || '8086', 10)

const defaultUserData = {
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
    topItems: {
      enabled: true,
      count: 5,
      resetInterval: 'never',
      lastResetAt: null,
    },
  },
}

function loadData() {
  if (!existsSync(DATA_FILE)) return { users: {} }
  try {
    const raw = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
    if (raw.users) return raw
    if ('apps' in raw) {
      const migrated = {
        users: {
          setup_pending: {
            id: 'setup_pending',
            name: 'Admin',
            pinHash: null,
            isAdmin: true,
            apps: raw.apps || [],
            categories: raw.categories || [{ id: 'default', name: 'Applications', collapsed: false, position: 0 }],
            settings: {
              ...defaultUserData.settings,
              ...(raw.settings || {}),
              topItems: {
                ...defaultUserData.settings.topItems,
                ...((raw.settings && raw.settings.topItems) || {}),
              },
            },
          },
        },
      }
      saveDataDirect(migrated)
      console.log('Migrated legacy data.json to multi-user format')
      return migrated
    }
    return { users: {} }
  } catch {
    return { users: {} }
  }
}

function saveDataDirect(data) {
  const dir = dirname(DATA_FILE)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

let cachedData = null

function getData() {
  if (!cachedData) cachedData = loadData()
  return cachedData
}

function saveData() {
  saveDataDirect(cachedData)
}

function hashPin(pin) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(pin, salt, 64).toString('hex')
  return `${salt}$${hash}`
}

function verifyPin(pin, stored) {
  const [salt, hash] = stored.split('$')
  const computed = scryptSync(pin, salt, 64).toString('hex')
  return computed === hash
}

const sessions = new Map()

function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.slice(7)
  const userId = sessions.get(token)
  if (!userId) return res.status(401).json({ error: 'Invalid session' })
  const data = getData()
  const user = data.users[userId]
  if (!user) {
    sessions.delete(token)
    return res.status(401).json({ error: 'User not found' })
  }
  req.user = { id: userId, ...user }
  req.token = token
  next()
}

function requireAdmin(req, res, next) {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Admin only' })
  next()
}

const app = express()
app.use(express.json({ limit: '10mb' }))

app.get('/api/setup', (_req, res) => {
  const data = getData()
  const users = Object.values(data.users)
  if (users.length === 0) return res.json({ needsSetup: true, users: [] })
  const unconfigured = users.find((u) => u.pinHash === null)
  const userList = Object.entries(data.users).map(([id, u]) => ({ id, name: u.name, isAdmin: u.isAdmin }))
  res.json({ needsSetup: !!unconfigured, hasUnconfigured: !!unconfigured, users: userList })
})

app.post('/api/setup', (req, res) => {
  const { name, pin } = req.body
  if (!name || !pin || pin.length < 1) return res.status(400).json({ error: 'Name and PIN are required' })
  const data = getData()
  const unconfigured = Object.entries(data.users).find(([, u]) => u.pinHash === null)
  let userId, user
  if (unconfigured) {
    userId = unconfigured[0]
    user = unconfigured[1]
    user.name = name
    user.id = userId
  } else {
    userId = `user_${Date.now()}`
    user = { id: userId, name, pinHash: null, isAdmin: true, ...JSON.parse(JSON.stringify(defaultUserData)) }
  }
  if (userId === 'setup_pending') {
    userId = `user_${Date.now()}`
    user.id = userId
  }
  user.pinHash = hashPin(pin)
  delete data.users['setup_pending']
  data.users[userId] = user
  saveData()
  const token = randomUUID()
  sessions.set(token, userId)
  res.json({ token, user: { id: userId, name: user.name, isAdmin: true } })
})

app.post('/api/auth/login', (req, res) => {
  const { name, pin } = req.body
  if (!name || !pin) return res.status(400).json({ error: 'Name and PIN are required' })
  const data = getData()
  const entry = Object.entries(data.users).find(([, u]) => u.name.toLowerCase() === name.toLowerCase())
  if (!entry) return res.status(401).json({ error: 'Invalid name or PIN' })
  const [userId, user] = entry
  if (!user.pinHash || !verifyPin(pin, user.pinHash)) return res.status(401).json({ error: 'Invalid name or PIN' })
  const token = randomUUID()
  sessions.set(token, userId)
  res.json({ token, user: { id: userId, name: user.name, isAdmin: user.isAdmin } })
})

app.post('/api/auth/logout', (req, res) => {
  const auth = req.headers.authorization
  if (auth && auth.startsWith('Bearer ')) sessions.delete(auth.slice(7))
  res.json({ ok: true })
})

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ id: req.user.id, name: req.user.name, isAdmin: req.user.isAdmin })
})

app.get('/api/users', requireAuth, requireAdmin, (req, res) => {
  const data = getData()
  const list = Object.entries(data.users).map(([id, u]) => ({ id, name: u.name, isAdmin: u.isAdmin }))
  res.json(list)
})

app.post('/api/users', requireAuth, requireAdmin, (req, res) => {
  const { name, pin, isAdmin } = req.body
  if (!name || !pin) return res.status(400).json({ error: 'Name and PIN are required' })
  const data = getData()
  const exists = Object.values(data.users).some((u) => u.name.toLowerCase() === name.toLowerCase())
  if (exists) return res.status(409).json({ error: 'User already exists' })
  const id = `user_${Date.now()}`
  const user = { id, name, pinHash: hashPin(pin), isAdmin: !!isAdmin, ...JSON.parse(JSON.stringify(defaultUserData)) }
  data.users[id] = user
  saveData()
  res.json({ id, name: user.name, isAdmin: user.isAdmin })
})

app.put('/api/users/:id', requireAuth, requireAdmin, (req, res) => {
  const data = getData()
  const user = data.users[req.params.id]
  if (!user) return res.status(404).json({ error: 'User not found' })
  if (req.body.name !== undefined) {
    const exists = Object.entries(data.users).some(([id, u]) => u.name.toLowerCase() === req.body.name.toLowerCase() && id !== req.params.id)
    if (exists) return res.status(409).json({ error: 'Name already taken' })
    user.name = req.body.name
  }
  if (req.body.pin !== undefined) user.pinHash = hashPin(req.body.pin)
  if (req.body.isAdmin !== undefined) user.isAdmin = !!req.body.isAdmin
  saveData()
  res.json({ id: req.params.id, name: user.name, isAdmin: user.isAdmin })
})

app.delete('/api/users/:id', requireAuth, requireAdmin, (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot remove yourself' })
  const data = getData()
  if (!data.users[req.params.id]) return res.status(404).json({ error: 'User not found' })
  delete data.users[req.params.id]
  saveData()
  for (const [token, uid] of sessions) {
    if (uid === req.params.id) sessions.delete(token)
  }
  res.json({ ok: true })
})

app.get('/api/data', requireAuth, (req, res) => {
  const { apps, categories, settings } = req.user
  res.json({ apps, categories, settings })
})

app.put('/api/data', requireAuth, (req, res) => {
  const data = getData()
  const user = data.users[req.user.id]
  const { apps, categories, settings } = req.body
  if (apps !== undefined) user.apps = apps
  if (categories !== undefined) user.categories = categories
  if (settings !== undefined) user.settings = settings
  saveData()
  res.json({ ok: true })
})

app.use(express.static(join(__dirname, '..', 'dist')))

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
