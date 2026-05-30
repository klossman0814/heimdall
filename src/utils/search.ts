export function getSearchUrl(provider: string, customUrl: string, query: string): string {
  const q = encodeURIComponent(query)
  switch (provider) {
    case 'google':
      return `https://www.google.com/search?q=${q}`
    case 'bing':
      return `https://www.bing.com/search?q=${q}`
    case 'duckduckgo':
      return `https://duckduckgo.com/?q=${q}`
    case 'custom':
      return customUrl ? customUrl.replace('%s', q) : `https://www.google.com/search?q=${q}`
    default:
      return `https://www.google.com/search?q=${q}`
  }
}
