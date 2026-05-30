export function weatherCondition(code: number): string {
  if (code === 0) return 'Clear'
  if (code <= 1) return 'Mostly Clear'
  if (code <= 2) return 'Partly Cloudy'
  if (code <= 3) return 'Overcast'
  if (code <= 10) return 'Mist'
  if (code <= 12) return 'Drizzle'
  if (code <= 18) return 'Rain'
  if (code <= 22) return 'Snow'
  if (code <= 25) return 'Freezing Rain'
  if (code <= 28) return 'Hail'
  if (code <= 30) return 'Dust'
  if (code <= 35) return 'Sand'
  if (code <= 40) return 'Haze'
  if (code <= 48) return 'Fog'
  if (code <= 57) return 'Drizzle'
  if (code <= 65) return 'Rain'
  if (code <= 67) return 'Freezing Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Rain Showers'
  if (code <= 86) return 'Snow Showers'
  if (code <= 99) return 'Thunderstorm'
  return 'Unknown'
}

function Sun({ size }: { size?: number }) {
  const s = size || 48
  const c = size && size < 32 ? '#fbbf24' : '#f59e0b'
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="12" fill={c} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="32" y1="6" x2="32" y2="14"
          stroke={c} strokeWidth="3" strokeLinecap="round"
          transform={`rotate(${angle} 32 32)`}
        />
      ))}
    </svg>
  )
}

function PartlyCloudy({ size }: { size?: number }) {
  const s = size || 48
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <circle cx="28" cy="22" r="10" fill="#fbbf24" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <line
          key={angle}
          x1="28" y1="5" x2="28" y2="9"
          stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"
          transform={`rotate(${angle} 28 22)`}
        />
      ))}
      <ellipse cx="34" cy="38" rx="20" ry="13" fill="#94a3b8" />
      <ellipse cx="26" cy="33" rx="13" ry="10" fill="#cbd5e1" />
      <ellipse cx="42" cy="35" rx="11" ry="9" fill="#cbd5e1" />
    </svg>
  )
}

function Overcast({ size }: { size?: number }) {
  const s = size || 48
  return (
    <svg width={s} height={s} viewBox="0 0 64 40" fill="none">
      <ellipse cx="32" cy="26" rx="24" ry="14" fill="#64748b" />
      <ellipse cx="20" cy="20" rx="16" ry="11" fill="#94a3b8" />
      <ellipse cx="44" cy="22" rx="14" ry="10" fill="#94a3b8" />
      <ellipse cx="32" cy="16" rx="12" ry="8" fill="#94a3b8" />
    </svg>
  )
}

function Fog({ size }: { size?: number }) {
  const s = size || 48
  return (
    <svg width={s} height={s} viewBox="0 0 64 48" fill="none">
      {[20, 28, 36].map((y, i) => (
        <line key={i} x1="8" y1={y} x2="56" y2={y} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" opacity={0.7 - i * 0.15} />
      ))}
    </svg>
  )
}

function Drizzle({ size }: { size?: number }) {
  const s = size || 48
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="22" rx="20" ry="12" fill="#94a3b8" />
      <ellipse cx="24" cy="18" rx="12" ry="8" fill="#cbd5e1" />
      {[22, 30, 38].map((x, i) => (
        <line key={i} x1={x} y1="38" x2={x - 3} y2="48" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" opacity={0.7} />
      ))}
    </svg>
  )
}

function Rain({ size }: { size?: number }) {
  const s = size || 48
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="20" rx="22" ry="13" fill="#64748b" />
      <ellipse cx="22" cy="15" rx="14" ry="9" fill="#94a3b8" />
      <ellipse cx="44" cy="17" rx="12" ry="9" fill="#94a3b8" />
      {[18, 28, 38, 48].map((x, i) => (
        <line key={i} x1={x} y1="38" x2={x - 4} y2="52" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" opacity={0.8} />
      ))}
    </svg>
  )
}

function Snow({ size }: { size?: number }) {
  const s = size || 48
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="20" rx="22" ry="13" fill="#94a3b8" />
      <ellipse cx="22" cy="15" rx="14" ry="9" fill="#cbd5e1" />
      <ellipse cx="44" cy="17" rx="12" ry="9" fill="#cbd5e1" />
      {[20, 32, 44].map((x) => (
        <g key={x}>
          <line x1={x} y1="38" x2={x} y2="52" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
          <circle cx={x} cy="38" r="1.5" fill="#bfdbfe" />
          <circle cx={x} cy="44" r="1.5" fill="#bfdbfe" />
          <circle cx={x} cy="50" r="1.5" fill="#bfdbfe" />
        </g>
      ))}
    </svg>
  )
}

function Thunderstorm({ size }: { size?: number }) {
  const s = size || 48
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="18" rx="22" ry="13" fill="#475569" />
      <ellipse cx="22" cy="13" rx="14" ry="9" fill="#64748b" />
      <ellipse cx="44" cy="15" rx="12" ry="9" fill="#64748b" />
      <polygon points="30,30 24,44 32,42 28,56 40,38 30,40" fill="#fbbf24" />
      <line x1="42" y1="42" x2="40" y2="52" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="44" x2="18" y2="52" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function WeatherIcon({ code, size }: { code: number; size?: number }) {
  if (code <= 1) return <Sun size={size} />
  if (code <= 2) return <PartlyCloudy size={size} />
  if (code <= 3) return <Overcast size={size} />
  if (code <= 10) return <Overcast size={size} />
  if (code <= 12) return <Drizzle size={size} />
  if (code <= 18) return <Rain size={size} />
  if (code <= 22) return <Snow size={size} />
  if (code <= 25) return <Rain size={size} />
  if (code <= 28) return <Rain size={size} />
  if (code <= 40) return <Fog size={size} />
  if (code <= 48) return <Fog size={size} />
  if (code <= 57) return <Drizzle size={size} />
  if (code <= 65) return <Rain size={size} />
  if (code <= 67) return <Rain size={size} />
  if (code <= 77) return <Snow size={size} />
  if (code <= 82) return <Rain size={size} />
  if (code <= 86) return <Snow size={size} />
  if (code <= 99) return <Thunderstorm size={size} />
  return <Sun size={size} />
}
