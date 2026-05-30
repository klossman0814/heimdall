export interface AppItem {
  id: string
  name: string
  url: string
  icon: string
  color: string
  categoryId: string
  tileSize: 'sm' | 'md' | 'lg'
  position: number
}

export interface Category {
  id: string
  name: string
  collapsed: boolean
  position: number
}

export type Theme = 'dark' | 'light' | 'system'

export type SearchProvider = 'google' | 'bing' | 'duckduckgo' | 'custom'

export interface BackgroundSettings {
  type: 'image' | 'color' | 'gradient'
  value: string
}

export interface WidgetConfig {
  clock: boolean
  clockFormat: '12h' | '24h'
  weather: boolean
  weatherCityState: string
  weatherUnit: 'f' | 'c'
  notes: boolean
  notesContent: string
}

export interface DailyForecast {
  date: string
  dayName: string
  weatherCode: number
  tempMax: number
  tempMin: number
  precipProb: number
  windSpeed: number
}

export interface CurrentWeather {
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  weatherCode: number
  cityName: string
}

export interface Settings {
  theme: Theme
  searchProvider: SearchProvider
  customSearchUrl: string
  background: BackgroundSettings
  widgets: WidgetConfig
}
