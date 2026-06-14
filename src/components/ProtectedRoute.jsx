import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute
 * ──────────────
 * Guards a route: redirects to /login if unauthenticated,
 * or to the correct dashboard if the user's role doesn't match.
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-lg)',
      }}>
        جارٍ التحقق...
      </div>
    )
  }

  // Not authenticated → go to login
  if (!user) return <Navigate to="/login" replace />

  // Wrong role → redirect to correct dashboard
  if (role && user.role !== role) {
    if (user.role === 'Manager') return <Navigate to="/manager" replace />
    if (user.role === 'Seller') return <Navigate to="/seller" replace />
    return <Navigate to="/login" replace />
  }

  return children
}
