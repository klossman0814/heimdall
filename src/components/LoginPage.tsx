import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const { login, users } = useAuthStore()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const pinRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selectedUser) pinRef.current?.focus()
  }, [selectedUser])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser || !pin) return
    setError('')
    setLoading(true)
    try {
      await login(selectedUser, pin)
    } catch (err: any) {
      setError(err.message || 'Invalid PIN')
      setPin('')
      setLoading(false)
    }
  }

  if (!selectedUser) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Heimdall</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>
            Choose your profile
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text)',
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: 500 }}>{u.name}</span>
                {u.isAdmin && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 6,
                      backgroundColor: 'var(--accent)',
                      color: '#fff',
                      opacity: 0.8,
                    }}
                  >
                    Admin
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            fontWeight: 600,
            color: '#fff',
            margin: '0 auto 16px',
          }}
        >
          {selectedUser.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{selectedUser}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>Enter your PIN</p>
        <input
          ref={pinRef}
          type="password"
          inputMode="numeric"
          maxLength={10}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          autoFocus
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text)',
            fontSize: 20,
            textAlign: 'center',
            letterSpacing: 8,
            outline: 'none',
            marginBottom: 16,
            boxSizing: 'border-box',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
        />
        {error && (
          <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => { setSelectedUser(null); setPin(''); setError('') }}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text)',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!pin || loading}
            style={{
              flex: 2,
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: pin ? 'var(--accent)' : 'var(--border)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: pin ? 'pointer' : 'default',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  )
}