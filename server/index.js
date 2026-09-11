import express from 'express'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
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
