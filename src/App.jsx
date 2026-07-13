import React from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useTheme } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Manager from './pages/Manager'
import Seller from './pages/Seller'
import Purchase from './pages/Purchase'
import Reports from './pages/Reports'
import './index.css'

/* ── Navigation Bar ── */
function Nav() {
  const { user, logout, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  function isActive(path) {
    return location.pathname === path ? ' active' : ''
  }

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Logo */}
        <Link to={user ? (user.role === 'Manager' ? '/manager' : '/seller') : '/login'} style={{ textDecoration: 'none' }}>
          <div className="app-logo">
            <div className="app-logo-icon">م</div>
            <span className="app-logo-text">نظام المتجر</span>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="nav-links">
          {!loading && !user && (
            <>
              <Link to="/login" className={`nav-link${isActive('/login')}`}>
                <span>🔐</span>
                <span>تسجيل الدخول</span>
              </Link>
              <Link to="/register" className={`nav-link${isActive('/register')}`}>
                <span>✨</span>
                <span>إنشاء حساب</span>
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              {user.role === 'Manager' && (
                <>
                  <Link to="/manager" className={`nav-link${isActive('/manager')}`}>
                    <span>📋</span>
                    <span>لوحة المدير</span>
                  </Link>
                  <Link to="/purchase" className={`nav-link${isActive('/purchase')}`}>
                    <span>🛍️</span>
                    <span>طلبات الشراء</span>
                  </Link>
                  <Link to="/reports" className={`nav-link${isActive('/reports')}`}>
                    <span>📊</span>
                    <span>التقارير</span>
                  </Link>
                </>
              )}
              {user.role === 'Seller' && (
                <Link to="/seller" className={`nav-link${isActive('/seller')}`}>
                  <span>🛒</span>
                  <span>لوحة البائع</span>
                </Link>
              )}

              {/* User info */}
              <span className="nav-link" style={{ cursor: 'default', opacity: 0.8 }}>
                👤 {user.fullName || user.full_name}
              </span>

              {/* Logout */}
              <button
                onClick={logout}
                className="nav-link"
                id="logout-btn"
                style={{ color: 'var(--color-danger)' }}
              >
                🚪 تسجيل الخروج
              </button>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            aria-label="Toggle Theme"
            title={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع المضيء'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  )
}

/* ── App Root ── */
export default function App() {
  const { user, loading } = useAuth()

  return (
    <div className="app-wrapper" dir="rtl">
      <Nav />
      <main className="page-content">
        <div className="app-container">
          <Routes>
            {/* Auth pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected pages */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute role="Manager">
                  <Manager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase"
              element={
                <ProtectedRoute role="Manager">
                  <Purchase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute role="Manager">
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller"
              element={
                <ProtectedRoute role="Seller">
                  <Seller />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect */}
            <Route
              path="*"
              element={
                loading ? null :
                user
                  ? <Navigate to={user.role === 'Manager' ? '/manager' : '/seller'} replace />
                  : <Navigate to="/login" replace />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  )
}
