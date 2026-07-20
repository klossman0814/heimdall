import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { Plus, Trash2, Shield, ShieldOff, Save, X } from 'lucide-react'

export default function UserManagement() {
  const { users, currentUser, fetchUsers, addUser, updateUser, removeUser } = useAuthStore()
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPin, setNewPin] = useState('')
  const [newConfirmPin, setNewConfirmPin] = useState('')
  const [newIsAdmin, setNewIsAdmin] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editPin, setEditPin] = useState('')
  const [editConfirmPin, setEditConfirmPin] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!newName.trim()) { setError('Enter a name'); return }
    if (newPin.length < 1) { setError('Enter a PIN'); return }
    if (newPin !== newConfirmPin) { setError('PINs do not match'); return }
    try {
      await addUser(newName.trim(), newPin, newIsAdmin)
      setNewName(''); setNewPin(''); setNewConfirmPin(''); setNewIsAdmin(false)
      setShowAdd(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleEdit(id: string) {
    setError('')
    const updates: any = {}
    if (editName.trim() && editName.trim() !== users.find((u) => u.id === id)?.name) updates.name = editName.trim()
    if (editPin) {
      if (editPin !== editConfirmPin) { setError('PINs do not match'); return }
      updates.pin = editPin
    }
    if (Object.keys(updates).length === 0) { setEditingId(null); return }
    try {
      await updateUser(id, updates)
      setEditingId(null); setEditPin(''); setEditConfirmPin('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleRemove(id: string) {
    const user = users.find((u) => u.id === id)
    if (!confirm(`Remove ${user?.name}? This cannot be undone.`)) return
    try {
      await removeUser(id)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Users</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            backgroundColor: 'transparent',
            color: 'var(--text)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          <Plus size={14} /> Add User
        </button>
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{error}</p>
      )}

      {showAdd && (
        <form
          onSubmit={handleAdd}
          style={{
            padding: 16,
            borderRadius: 10,
            border: '1px solid var(--border)',
            marginBottom: 16,
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              fontSize: 13,
              outline: 'none',
              marginBottom: 8,
              boxSizing: 'border-box',
            }}
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={10}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="PIN"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              fontSize: 13,
              outline: 'none',
              marginBottom: 8,
              textAlign: 'center',
              letterSpacing: 4,
              boxSizing: 'border-box',
            }}
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={10}
            value={newConfirmPin}
            onChange={(e) => setNewConfirmPin(e.target.value)}
            placeholder="Confirm PIN"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              fontSize: 13,
              outline: 'none',
              marginBottom: 8,
              textAlign: 'center',
              letterSpacing: 4,
              boxSizing: 'border-box',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={newIsAdmin}
              onChange={(e) => setNewIsAdmin(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            Admin
          </label>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Add User
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            {editingId === user.id ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={user.name}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={10}
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    placeholder="New PIN (leave blank to keep)"
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: 12,
                      outline: 'none',
                      textAlign: 'center',
                      letterSpacing: 4,
                    }}
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={10}
                    value={editConfirmPin}
                    onChange={(e) => setEditConfirmPin(e.target.value)}
                    placeholder="Confirm"
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: 12,
                      outline: 'none',
                      textAlign: 'center',
                      letterSpacing: 4,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditingId(null)} style={smallBtnStyle}>
                    <X size={14} /> Cancel
                  </button>
                  <button onClick={() => handleEdit(user.id)} style={{ ...smallBtnStyle, backgroundColor: 'var(--accent)', color: '#fff', border: 'none' }}>
                    <Save size={14} /> Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    {user.name}
                    {user.id === currentUser?.id && (
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>(you)</span>
                    )}
                  </span>
                </div>
                {user.isAdmin ? (
                  <Shield size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                ) : (
                  <ShieldOff size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                )}
                <button
                  onClick={() => { setEditingId(user.id); setEditName(user.name); setEditPin(''); setEditConfirmPin('') }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    backgroundColor: 'transparent',
                    color: 'var(--text)',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                {user.id !== currentUser?.id && (
                  <button
                    onClick={() => handleRemove(user.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid #ef444444',
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const smallBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 10px',
  borderRadius: 6,
  border: '1px solid var(--border)',
  backgroundColor: 'transparent',
  color: 'var(--text)',
  fontSize: 11,
  cursor: 'pointer',
}
