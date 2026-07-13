import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, error, setError } = useAuth()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Seller')
  const [managerPassword, setManagerPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim() || !username.trim() || !password) {
      setError('الرجاء تعبئة جميع الحقول')
      return
    }

    // Require manager code/password for Sellers and Managers
    if (role === 'Seller' || role === 'Manager') {
      if (!managerPassword) {
        setError('الرجاء إدخال رمز تفويض المدير')
        return
      }
      const SECRET_CODE = 'Eng.Abdallah-Faisal' // Default authorization password
      if (managerPassword !== SECRET_CODE) {
        setError('رمز تفويض المدير غير صحيح!')
        return
      }
    }

    setLoading(true)
    await register({
      fullName: fullName.trim(),
      username: username.trim(),
      password,
      role
    })
    setLoading(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-scale-in" style={{ maxWidth: 460 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">م</div>
          <div className="auth-logo-title">نظام المتجر البسيط</div>
          <div className="auth-logo-subtitle">إنشاء حساب جديد للبدء</div>
        </div>

        {/* Title */}
        <h1 className="auth-title">إنشاء حساب</h1>

        {/* Error */}
        {error && <div className="error-message" id="register-error" style={{ marginBottom: 16 }}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-fullname">الاسم الكامل</label>
            <input
              id="reg-fullname"
              className="form-input"
              type="text"
              placeholder="أدخل اسمك الكامل"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-username"> البريد الالكتروني</label>
            <input
              id="reg-username"
              className="form-input"
              type="text"
              placeholder="أدخل البريدالالكتروني"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">كلمة المرور </label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">اختر الدور</label>
            <div className="role-selector">
              <div
                className={`role-option${role === 'Manager' ? ' selected' : ''}`}
                onClick={() => !loading && setRole('Manager')}
                id="role-option-manager"
              >
                <div className="role-option-icon">📋</div>
                <span className="role-option-label">مدير</span>
              </div>
              <div
                className={`role-option${role === 'Seller' ? ' selected' : ''}`}
                onClick={() => !loading && setRole('Seller')}
                id="role-option-seller"
              >
                <div className="role-option-icon">🛒</div>
                <span className="role-option-label">بائع</span>
              </div>
            </div>
          </div>

          {/* Manager Code Input */}
          {(role === 'Seller' || role === 'Manager') && (
            <div className="form-group animate-fade-in">
              <label className="form-label" htmlFor="reg-manager-password">رمز تفويض المدير</label>
              <input
                id="reg-manager-password"
                className="form-input"
                type="password"
                placeholder="أدخل رمز تفويض المدير لإتمام التسجيل"
                value={managerPassword}
                onChange={e => setManagerPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            id="register-submit-btn"
            disabled={loading}
          >
            {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            لديك حساب بالفعل؟{' '}
            <Link to="/" className="auth-footer-link">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
