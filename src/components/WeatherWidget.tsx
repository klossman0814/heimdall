import { useState, useEffect, useRef } from 'react'
import { CloudSun, Droplets, Wind, MapPin } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { WeatherIcon, weatherCondition } from './WeatherIcons'
import type { DailyForecast, CurrentWeather } from '../types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const GEO_CACHE_KEY = 'heimdall-geo-cache'

function readGeoCache(): Record<string, { lat: number; lon: number; name: string }> {
  try {
    return JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || '{}')
  } catch { return {} }
}

function writeGeoCache(key: string, val: { lat: number; lon: number; name: string }) {
  try {
    const cache = readGeoCache()
    cache[key] = val
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache))
  } catch { /* ignore */ }
}

async function geocode(cityState: string): Promise<{ lat: number; lon: number; name: string } | null> {
  const cleaned = cityState.trim()

  const cache = readGeoCache()
  const cached = cache[cleaned] || cache[cleaned.toLowerCase()]
  if (cached) return cached

  const queries = [
    cleaned,
    ...(cleaned.includes(',')
      ? [cleaned.replace(/,.*$/, '').trim()]
      : []),
  ]

  for (const q of queries) {
    if (!q) continue
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`
      )
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        const r = data.results[0]
        const result = {
          lat: r.latitude,
          lon: r.longitude,
          name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
        }
        writeGeoCache(cleaned, result)
        writeGeoCache(cleaned.toLowerCase(), result)
        return result
      }
    } catch { /* try next query */ }
  }
  return null
}

async function fetchForecast(
  lat: number,
  lon: number,
  unit: 'f' | 'c'
): Promise<{ current: CurrentWeather; daily: DailyForecast[] } | null> {
  try {
    const tempUnit = unit === 'f' ? 'fahrenheit' : 'celsius'
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max` +
        `&timezone=auto&temperature_unit=${tempUnit}&wind_speed_unit=mph`
    )
    const data = await res.json()

    const current: CurrentWeather = {
      temp: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      weatherCode: data.current.weather_code,
      cityName: '',
    }

    const daily: DailyForecast[] = data.daily.time.map((date: string, i: number) => {
      const d = new Date(date + 'T12:00:00')
      return {
        date,
        dayName: i === 0 ? 'Today' : DAYS[d.getDay()],
        weatherCode: data.daily.weather_code[i],
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        precipProb: Math.round(data.daily.precipitation_probability_max[i] || 0),
        windSpeed: Math.round(data.daily.wind_speed_10m_max[i] || 0),
      }
    })

    return { current, daily }
  } catch {
    return null
  }
}

export default function WeatherWidget() {
  const { settings, updateWidgets } = useSettingsStore()
  const [cityState, setCityState] = useState(settings.widgets.weatherCityState || '')
  const [current, setCurrent] = useState<CurrentWeather | null>(null)
  const [daily, setDaily] = useState<DailyForecast[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cityDisplay, setCityDisplay] = useState('')
  const [suggestions, setSuggestions] = useState<{ lat: number; lon: number; name: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inflightRef = useRef<AbortController | null>(null)

  async function doSearch(query: string, lat?: number, lon?: number, name?: string) {
    if (!query && !lat) return

    inflightRef.current?.abort()
    const controller = new AbortController()
    inflightRef.current = controller

    setLoading(true)
    setError('')

    let targetLat = lat
    let targetLon = lon
    let targetName = name || ''

    if (!lat) {
      const geo = await geocode(query)
      if (controller.signal.aborted) return
      if (!geo) {
        setError('Location not found. Try "City, State" format.')
        setLoading(false)
        return
      }
      targetLat = geo.lat
      targetLon = geo.lon
      targetName = geo.name
    }

    const { weatherUnit } = useSettingsStore.getState().settings.widgets
    const forecast = await fetchForecast(targetLat!, targetLon!, weatherUnit)
    if (controller.signal.aborted) return
    if (!forecast) {
      setError('Failed to load weather data.')
      setLoading(false)
      return
    }

    forecast.current.cityName = targetName
    setCurrent(forecast.current)
    setDaily(forecast.daily)
    setCityDisplay(targetName)
    setLoading(false)
  }

  useEffect(() => {
    const cs = settings.widgets.weatherCityState
    if (cs && cs.trim()) {
      setCityState(cs)
      doSearch(cs)
    }
  }, [])

  useEffect(() => {
    return () => inflightRef.current?.abort()
  }, [])

  async function handleInputChange(value: string) {
    setCityState(value)
    const query = value.replace(/,/g, '').trim()
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      )
      const data = await res.json()
      if (data.results) {
        setSuggestions(
          data.results.map((r: any) => ({
            lat: r.latitude,
            lon: r.longitude,
            name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
          }))
        )
        setShowSuggestions(true)
      }
    } catch { /* ignore */ }
  }

  function handleSelect(s: { lat: number; lon: number; name: string }) {
    setCityState(s.name)
    setShowSuggestions(false)
    updateWidgets({ weatherCityState: s.name })
    doSearch(s.name, s.lat, s.lon, s.name)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setShowSuggestions(false)
    if (cityState.trim()) {
      updateWidgets({ weatherCityState: cityState.trim() })
      doSearch(cityState.trim())
    }
  }

  const tempLabel = settings.widgets.weatherUnit === 'f' ? '°F' : '°C'

  if (!settings.widgets.weather) return null

  return (
    <div
      className="w-full max-w-sm rounded-xl border p-3 shadow-sm"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-card) 60%, transparent)',
        backdropFilter: 'blur(8px)',
        borderColor: 'var(--border)',
      }}
    >
      <form onSubmit={handleSubmit} className="relative mb-2">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} style={{ color: 'var(--accent)' }} />
          <input
            type="text"
            value={cityState}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="City, State (e.g. Austin, TX)"
            className="flex-1 bg-transparent border-b text-[11px] py-0.5 outline-none transition-colors focus:border-[var(--accent)]"
            style={{ color: 'var(--text)', borderColor: 'var(--border)' }}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-2 py-0.5 rounded text-[10px] font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? '...' : 'Go'}
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-0.5 rounded-lg border shadow-lg z-30 overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={() => handleSelect(s)}
                className="w-full text-left px-2.5 py-1.5 text-[11px] transition-colors hover:opacity-80"
                style={{ color: 'var(--text)' }}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </form>

      {loading && (
        <div className="flex items-center justify-center gap-1.5 py-3">
          <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Loading...</span>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-2">
          <p className="text-[11px]" style={{ color: '#ef4444' }}>{error}</p>
        </div>
      )}

      {current && daily.length > 0 && !loading && (
        <>
          <div className="flex items-center gap-3 mb-2">
            <WeatherIcon code={current.weatherCode} size={44} />
            <div className="flex-1 min-w-0 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text)' }}>
                {current.temp}{tempLabel}
              </span>
              <span className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>
                {weatherCondition(current.weatherCode)}
              </span>
              <span className="text-[10px] truncate ml-auto" style={{ color: 'var(--text-secondary)' }}>
                {cityDisplay}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            <span>Feels {current.feelsLike}{tempLabel}</span>
            <span className="opacity-30">|</span>
            <Droplets size={10} style={{ color: '#60a5fa' }} />
            <span>{current.humidity}%</span>
            <span className="opacity-30">|</span>
            <Wind size={10} style={{ color: 'var(--accent)' }} />
            <span>{current.windSpeed} mph</span>
          </div>

          <div className="flex gap-0.5">
            {daily.map((day) => {
              const isToday = day.dayName === 'Today'
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-center transition-all"
                  style={{
                    backgroundColor: isToday ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
                  }}
                >
                  <span className="text-[10px] font-medium" style={{ color: isToday ? 'var(--accent)' : 'var(--text-secondary)' }}>
                    {day.dayName}
                  </span>
                  <WeatherIcon code={day.weatherCode} size={20} />
                  <div className="text-[10px] tabular-nums leading-tight" style={{ color: 'var(--text)' }}>
                    <span className="font-semibold">{day.tempMax}°</span>
                    <span className="opacity-50 ml-0.5">{day.tempMin}°</span>
                  </div>
                  {day.precipProb > 0 && (
                    <div className="flex items-center gap-0.5">
                      <Droplets size={7} style={{ color: '#60a5fa' }} />
                      <span className="text-[9px]" style={{ color: '#60a5fa' }}>{day.precipProb}%</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {!current && !loading && !error && !cityState && (
        <div className="flex items-center justify-center gap-1.5 py-2">
          <CloudSun size={14} style={{ color: 'var(--text-secondary)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Enter a city for 7-day forecast</span>
        </div>
      )}
    </div>
  )
}
