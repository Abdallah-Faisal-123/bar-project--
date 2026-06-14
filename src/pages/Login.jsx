import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, error, setError } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password) {
      setError('الرجاء تعبئة اسم المستخدم وكلمة المرور')
      return
    }

    setLoading(true)
    await login({ username: username.trim(), password })
    setLoading(false)
    // Redirect is handled inside login() on success
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-scale-in">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">م</div>
          <div className="auth-logo-title">نظام المتجر البسيط</div>
          <div className="auth-logo-subtitle">إدارة المخزون والمبيعات</div>
        </div>

        {/* Title */}
        <h1 className="auth-title">تسجيل الدخول</h1>

        {/* Error */}
        {error && <div className="error-message" id="login-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">اسم المستخدم</label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              placeholder="أدخل اسم المستخدم"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">كلمة المرور</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            id="login-submit-btn"
            disabled={loading}
          >
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="auth-footer-link">إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
