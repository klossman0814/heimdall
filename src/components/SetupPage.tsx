import { useState, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { Shield } from 'lucide-react'

export default function SetupPage() {
  const { setup } = useAuthStore()
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Enter your name'); nameRef.current?.focus(); return }
    if (pin.length < 1) { setError('Enter a PIN'); return }
    if (pin !== confirmPin) { setError('PINs do not match'); return }
    setLoading(true)
    try {
      await setup(name.trim(), pin)
    } catch (err: any) {
      setError(err.message || 'Setup failed')
      setLoading(false)
    }
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
          maxWidth: 380,
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
            margin: '0 auto 16px',
          }}
        >
          <Shield size={28} color="#fff" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
          Welcome to Heimdall
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 14, lineHeight: 1.5 }}>
          Set up your admin account to get started.
          {name.trim() === '' && ' Your existing dashboard data has been saved and will be assigned to you.'}
        </p>

        <div style={{ textAlign: 'left', marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
            Your Name
          </label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ken"
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text)',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div style={{ textAlign: 'left', marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
            Choose a PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={10}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
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
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div style={{ textAlign: 'left', marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block', color: 'var(--text-secondary)' }}>
            Confirm PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            maxLength={10}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="Re-enter PIN"
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
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim() || !pin || !confirmPin}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: (name.trim() && pin && confirmPin) ? 'var(--accent)' : 'var(--border)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: (name.trim() && pin && confirmPin) ? 'pointer' : 'default',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Setting up...' : 'Create Admin Account'}
        </button>
      </form>
    </div>
  )
}