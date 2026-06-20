import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Seller() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sellingId, setSellingId] = useState(null)

  // State for purchase requests
  const [purchaseRequests, setPurchaseRequests] = useState([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)

  useEffect(() => {
    fetchAssignedProducts()
    fetchPurchaseRequests()
  }, [user])

  async function fetchPurchaseRequests() {
    try {
      setLoadingPurchases(true)
      const { data, error: fetchErr } = await supabase
        .from('purchase_requests')
        .select('*')
        .order('id', { ascending: false })

      if (fetchErr) throw fetchErr
      setPurchaseRequests(data || [])
    } catch (err) {
      console.error('Error fetching purchase requests:', err)
      setError('حدث خطأ أثناء تحميل طلبات الشراء المطلوبة')
    } finally {
      setLoadingPurchases(false)
    }
  }

  async function fetchAssignedProducts() {
    if (!user) return
    try {
      setLoading(true)
      const { data, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr

      // Filter products assigned to this seller (by username or full name)
      const sellerNameLower = (user.fullName || user.full_name || user.username || '').toLowerCase()
      const usernameLower = (user.username || '').toLowerCase()

      const filtered = (data || []).filter(p => {
        const productSeller = (p.seller || '').toLowerCase()
        return productSeller === sellerNameLower || productSeller === usernameLower
      })

      setProducts(filtered)
    } catch (err) {
      console.error('Error fetching seller products:', err)
      setError('حدث خطأ أثناء تحميل منتجاتك المسندة')
    } finally {
      setLoading(false)
    }
  }

  // Handle Sell One Piece
  async function handleSell(product) {
    const remaining = (product.received || 0) - (product.sold || 0)
    if (remaining <= 0) {
      alert('عذراً، لقد نفذت كمية هذا المنتج!')
      return
    }

    try {
      setSellingId(product.id)
      const { error: updateErr } = await supabase
        .from('products')
        .update({ sold: (product.sold || 0) + 1 })
        .eq('id', product.id)

      if (updateErr) throw updateErr

      // Local state update for immediate feedback
      setProducts(prev =>
        prev.map(p => {
          if (p.id === product.id) {
            return { ...p, sold: (p.sold || 0) + 1 }
          }
          return p
        })
      )
    } catch (err) {
      console.error('Error recording sale:', err)
      alert('فشل تسجيل عملية البيع. يرجى المحاولة مرة أخرى.')
    } finally {
      setSellingId(null)
    }
  }

  // Stats
  const totalSold = products.reduce((sum, p) => sum + (p.sold || 0), 0)
  const totalMoney = products.reduce((sum, p) => sum + ((p.sold || 0) * (p.selling_price || 0)), 0)

  return (
    <div className="animate-fade-in-up">
      {/* Page Title */}
      <h1 className="page-title">🛒 لوحة البائع</h1>

      {/* Cash Box — Highlighted Card */}
      <div className="cashbox-card animate-fade-in-up stagger-1">
        <div className="cashbox-title">
          <span className="cashbox-title-icon">💰</span>
          صندوق النقود الحالي للوردية
        </div>
        <div className="cashbox-stats">
          <div className="cashbox-stat">
            <div className="cashbox-stat-label">المبلغ الإجمالي المحصل</div>
            <div className="cashbox-stat-value">
              {totalMoney.toLocaleString('ar-EG')}
              <span className="currency">ج.م</span>
            </div>
          </div>
          <div className="cashbox-stat">
            <div className="cashbox-stat-label">إجمالي القطع المباعة</div>
            <div className="cashbox-stat-value">{totalSold.toLocaleString('ar-EG')}</div>
          </div>
        </div>
      </div>

      {error && <div className="error-message" style={{ marginBottom: 24 }}>{error}</div>}

      {/* Required Purchase Requests Section */}
      <div className="card animate-fade-in-up stagger-2" style={{ marginBottom: 32, padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">📋 طلبات الشراء المطلوبة (مشتريات للوردية)</h2>
          <button
            onClick={fetchPurchaseRequests}
            className="btn btn-secondary"
            disabled={loadingPurchases}
            style={{ padding: '6px 12px', fontSize: '0.875rem' }}
          >
            {loadingPurchases ? 'جاري التحميل...' : '🔄 تحديث القائمة'}
          </button>
        </div>

        {loadingPurchases ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)' }}>جاري تحميل طلبات الشراء...</div>
        ) : purchaseRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
            💡 لا توجد طلبات شراء مطلوبة حالياً من المدير.
          </div>
        ) : (
          <div className="table-wrapper" style={{ margin: 0, border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>اسم المنتج المطلوب</th>
                  <th>الكمية المطلوبة</th>
                  <th>سعر الشراء المقدر</th>
                  <th>التكلفة الإجمالية</th>
                </tr>
              </thead>
              <tbody>
                {purchaseRequests.map(req => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 600 }}>{req.product_name}</td>
                    <td><span className="badge badge-primary">{req.quantity}</span></td>
                    <td>{req.price} ج.م</td>
                    <td style={{ fontWeight: 600}}>{(req.quantity * req.price).toFixed(2)} ج.م <input type="checkbox"  /> </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>جارٍ التحميل...</div>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 60,
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          💡 لم يتم إسناد أي منتجات لك بعد من قِبل المدير.
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product, i) => {
            const remaining = (product.received || 0) - (product.sold || 0)
            const isSoldOut = remaining <= 0
            const soldPercent = product.received > 0 ? Math.round(((product.sold || 0) / product.received) * 100) : 0

            return (
              <div
                key={product.id}
                className={`product-card animate-fade-in-up stagger-${Math.min(i + 3, 7)}`}
                style={isSoldOut ? { opacity: 0.65 } : {}}
              >
                {/* Product Name */}
                <div className="product-name">
                  <span
                    className="product-name-dot"
                    style={{ background: isSoldOut ? 'var(--color-danger)' : 'var(--color-success)' }}
                  />
                  {product.name}
                </div>

                {/* Stats Grid */}
                <div className="product-details">
                  <div className="product-detail">
                    <span className="product-detail-label">المستلم</span>
                    <span className="product-detail-value">{product.received}</span>
                  </div>
                  <div className="product-detail">
                    <span className="product-detail-label">المباع</span>
                    <span className="product-detail-value highlight">{product.sold}</span>
                  </div>
                  <div className="product-detail">
                    <span className="product-detail-label">المتبقي</span>
                    <span
                      className="product-detail-value"
                      style={{
                        color: remaining <= 5 ? 'var(--color-danger)' : remaining <= 15 ? 'var(--color-warning)' : 'var(--color-text)',
                        fontWeight: remaining <= 15 ? 700 : undefined
                      }}
                    >
                      {remaining}
                    </span>
                  </div>
                  <div className="product-detail">
                    <span className="product-detail-label">نسبة البيع</span>
                    <span className="product-detail-value" style={{ fontSize: '0.95rem' }}>
                      {soldPercent}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  height: 6,
                  background: 'var(--color-border-light)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  marginBottom: 16
                }}>
                  <div style={{
                    width: `${soldPercent}%`,
                    height: '100%',
                    background: isSoldOut
                      ? 'var(--color-danger)'
                      : 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))',
                    borderRadius: 3,
                    transition: 'width 0.4s ease'
                  }} />
                </div>

                {/* Price */}
                <div className="product-price-row">
                  <span className="product-price-label">سعر البيع للقطعة</span>
                  <span className="product-price-value">{product.selling_price} ج.م</span>
                </div>

                {/* Sell Button */}
                <button
                  className="btn-sell"
                  onClick={() => handleSell(product)}
                  disabled={isSoldOut || sellingId === product.id}
                  id={`sell-btn-${product.id}`}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontWeight: 600,
                    cursor: isSoldOut ? 'not-allowed' : 'pointer',
                    backgroundColor: isSoldOut ? 'var(--color-text-muted)' : undefined,
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  {sellingId === product.id ? 'جارٍ تسجيل البيع...' : isSoldOut ? '🚫 نفذت الكمية بالكامل' : '🛒 بيع قطعة واحدة'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
