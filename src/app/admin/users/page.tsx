'use client'

import { useState, useEffect, useCallback } from 'react'

interface UserEntry {
  email: string
  member: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserEntry[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setUsers(data.members || [])
      }
    } catch {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail) return

    setAdding(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(`Added ${newEmail}`)
        setNewEmail('')
        await fetchUsers()
      }
    } catch {
      setError('Failed to add user')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(email: string) {
    if (!confirm(`Remove access for ${email}?`)) return

    setRemoving(email)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(`Removed ${email}`)
        await fetchUsers()
      }
    } catch {
      setError('Failed to remove user')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Users &amp; Access</h1>
        <p>Manage IAP access to the Anvil bidding pipeline</p>
      </div>

      {/* Add user form */}
      <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '600px' }}>
        <div className="card-label">Add User</div>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
          <input
            type="email"
            placeholder="user@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={adding || !newEmail}
            style={{
              padding: '0.5rem 1.25rem',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: adding ? 'wait' : 'pointer',
              opacity: adding ? 0.6 : 1,
            }}
          >
            {adding ? 'Adding...' : 'Grant Access'}
          </button>
        </form>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Grants both <code style={{ background: 'var(--bg)', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>roles/run.invoker</code> and{' '}
          <code style={{ background: 'var(--bg)', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>roles/iap.httpsResourceAccessor</code>
        </p>
      </div>

      {/* Status messages */}
      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          color: 'var(--red)',
          fontSize: '0.875rem',
          marginBottom: '1rem',
          maxWidth: '600px',
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '6px',
          color: 'var(--green)',
          fontSize: '0.875rem',
          marginBottom: '1rem',
          maxWidth: '600px',
        }}>
          {success}
        </div>
      )}

      {/* Users table */}
      <div className="table-container">
        <div className="table-header">
          Current Users ({loading ? '...' : users.length})
        </div>
        {loading ? (
          <div className="empty-state">
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p>No users with direct access. Add a user above.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Roles</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email}>
                  <td style={{ fontWeight: 500 }}>{u.email}</td>
                  <td>
                    <span className="badge badge-blue" style={{ marginRight: '0.375rem' }}>run.invoker</span>
                    <span className="badge badge-purple">iap.httpsResourceAccessor</span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleRemove(u.email)}
                      disabled={removing === u.email}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '4px',
                        color: 'var(--red)',
                        fontSize: '0.75rem',
                        cursor: removing === u.email ? 'wait' : 'pointer',
                        opacity: removing === u.email ? 0.5 : 1,
                      }}
                    >
                      {removing === u.email ? 'Removing...' : 'Revoke'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
