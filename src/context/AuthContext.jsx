import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

/**
 * AuthProvider
 * ─────────────
 * Manages authentication state (login, register, logout, session persistence).
 * Stores: user { id, full_name, role }
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  /* ── Fetch profile from `users` table ── */
  const fetchProfile = useCallback(async (uid) => {
    try {
      const { data, error: profileError } = await supabase
        .from('users')
        .select('id, fullName, role,')
        .eq('id', uid)
        .limit(1)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        setError('فشل تحميل بيانات المستخدم')
        setUser(null)
        return null
      }

      const profile = {
        id: data.id,
        full_name: data.fullName,
        role: data.role,
      }
      setUser(profile)
      return profile
    } catch (err) {
      console.error('Unexpected profile error:', err)
      setError('حدث خطأ غير متوقع أثناء جلب بيانات المستخدم')
      setUser(null)
      return null
    }
  }, [])

  /* ── Session persistence — check session on mount ── */
  useEffect(() => {
    let isMounted = true
 
    async function initSession() {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data?.session
        if (session?.user && isMounted) {
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error('Session init error:', err)
        if (isMounted) setError('فشل الحصول على الجلسة')
      }
      if (isMounted) setLoading(false)
    }

    initSession()

    /* Listen for auth state changes (login/logout/token refresh) */
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [fetchProfile])

  /* ── Register ── */
  async function register({ fullName, username, password, role }) {
    setError(null)
    try {
      // Normalize: treat input with @ as email, otherwise append @store.local
      const cleaned = (username || '').trim().toLowerCase()
      if (!cleaned || !password || !fullName) {
        setError('الرجاء تعبئة جميع الحقول المطلوبة')
        return { error: true }
      }
      const email = cleaned.includes('@') ? cleaned : `${cleaned}@store.local`

      // 1. Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        console.error('Supabase signUp error:', signUpError)
        if (signUpError.status === 429 || signUpError.code === 'over_email_send_rate_limit') {
          setError('تم تجاوز حد الإرسال. يرجى الانتظار بضع دقائق ثم المحاولة مرة أخرى.')
        } else if (signUpError.message?.includes('already registered')) {
          setError('اسم المستخدم مسجل بالفعل. الرجاء استخدام اسم آخر.')
        } else {
          setError('فشل التسجيل: ' + (signUpError.message || 'خطأ غير معروف'))
        }
        return { error: signUpError }
      }

      const uid = data?.user?.id
      if (!uid) {
        setError('فشل إنشاء الحساب')
        return { error: true }
      }

      // 2. Create user row in users table
      const { error: profileError } = await supabase.from('users').insert({
        id: uid,
        fullName: fullName,
        role,
      })

      if (profileError) {
        console.error('Profile insert error:', profileError)
        setError('فشل إنشاء الملف الشخصي: ' + (profileError.message || 'خطأ'))
        return { error: profileError }
      }

      // 3. Fetch profile and redirect
      const profile = await fetchProfile(uid)
      if (profile) {
        navigate(profile.role === 'Manager' ? '/manager' : '/seller', { replace: true })
      }

      return { user: uid }
    } catch (err) {
      console.error('Register error:', err)
      setError('حدث خطأ أثناء التسجيل')
      return { error: err }
    }
  }

  /* ── Login ── */
  async function login({ username, password }) {
    setError(null)
    try {
      const cleaned = (username || '').trim().toLowerCase()
      if (!cleaned || !password) {
        setError('الرجاء تعبئة اسم المستخدم وكلمة المرور')
        return { error: true }
      }
      const email = cleaned.includes('@') ? cleaned : `${cleaned}@store.local`

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('Supabase signIn error:', signInError)
        if (signInError.message?.includes('Invalid login credentials')) {
          setError('اسم المستخدم أو كلمة المرور غير صحيحة')
        } else {
          setError('فشل تسجيل الدخول: ' + (signInError.message || 'خطأ غير معروف'))
        }
        return { error: signInError }
      }

      const uid = data?.user?.id
      if (!uid) {
        setError('فشل تسجيل الدخول')
        return { error: true }
      }

      // Fetch profile & redirect based on role
      const profile = await fetchProfile(uid)
      if (profile) {
        navigate(profile.role === 'Manager' ? '/manager' : '/seller', { replace: true })
      }

      return { user: uid }
    } catch (err) {
      console.error('Login error:', err)
      setError('حدث خطأ أثناء تسجيل الدخول')
      return { error: err }
    }
  }

  /* ── Logout ── */
  async function logout() {
    setError(null)
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.error('Logout error:', signOutError)
        setError('فشل تسجيل الخروج')
      }
      setUser(null)
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Logout error:', err)
      setError('حدث خطأ أثناء تسجيل الخروج')
    }
  }

  const value = {
    user,
    loading,
    error,
    setError,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
