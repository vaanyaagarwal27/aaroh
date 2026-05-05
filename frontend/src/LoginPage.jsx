import { useState } from 'react'
import { USERS } from './data/users'
import './LoginPage.css'

function ScaleIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="15" y="4" width="2" height="24" fill="currentColor" rx="1"/>
      <rect x="6" y="28" width="20" height="2" fill="currentColor" rx="1"/>
      <path d="M8 12 L16 6 L24 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <ellipse cx="9" cy="18" rx="5" ry="2.5" fill="currentColor" opacity="0.7"/>
      <ellipse cx="23" cy="18" rx="5" ry="2.5" fill="currentColor" opacity="0.7"/>
      <line x1="8" y1="12" x2="9" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="12" x2="23" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const match = USERS.find(
      u => u.username === username.trim() && u.password === password
    )

    setTimeout(() => {
      setLoading(false)
      if (match) {
        const { password: _pw, ...safeUser } = match
        onLogin(safeUser)
      } else {
        setError('Invalid username or password')
      }
    }, 400)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <ScaleIcon />
          </div>
          <h1 className="login-brand">AAROH</h1>
          <p className="login-govt">Government of Karnataka</p>
          <p className="login-system">Court Case Management System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label className="login-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="login-input"
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="e.g. ravi.kumar"
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="login-input"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="login-error" role="alert">{error}</p>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading || !username || !password}
            aria-busy={loading}
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
          <div style={{background:'#f5f5f5', borderRadius:'4px', padding:'10px', marginTop:'16px', fontSize:'12px', color:'#666'}}>
            Demo credentials — Username: vaanya.agarwal / Password: 12345
          </div>
        </form>

        <p className="login-footer">
          Authorised access only — Government of Karnataka
        </p>
      </div>
    </div>
  )
}
