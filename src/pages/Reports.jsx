import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function CustomSVGChart({ data, title, xKey, yKey, colorStart, colorEnd, unit = '' }) {
  const maxValue = Math.max(...data.map(d => d[yKey] || 0), 10)

  return (
    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 className="card-title" style={{ marginBottom: 28, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 16, background: colorStart, borderRadius: 4 }} />
        {title}
      </h3>
      <div style={{
        position: 'relative',
        height: 280,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 12,
        paddingBottom: 32,
        borderBottom: '2px solid var(--color-border)',
        marginTop: 'auto'
      }}>
        {data.map((item, idx) => {
          const val = item[yKey] || 0
          const pct = maxValue > 0 ? (val / maxValue) * 100 : 0

          return (
            <div key={idx} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
              position: 'relative'
            }}>
              {/* Tooltip on hover */}
              <div className="chart-tooltip" style={{
                position: 'absolute',
                bottom: `calc(${pct}% + 8px)`,
                background: 'var(--color-text)',
                color: 'var(--color-surface)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                opacity: 0,
                transition: 'opacity var(--transition-fast)',
                pointerEvents: 'none',
                boxShadow: 'var(--shadow-md)',
                zIndex: 10,
                fontWeight: 600
              }}>
                {val.toLocaleString('ar-EG')} {unit}
              </div>

              {/* Bar */}
              <div
                className="chart-bar"
                style={{
                  width: '100%',
                  maxWidth: 36,
                  height: `${pct}%`,
                  background: `linear-gradient(180deg, ${colorStart}, ${colorEnd})`,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.5s ease-out',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={e => {
                  const tooltip = e.currentTarget.previousSibling
                  if (tooltip) tooltip.style.opacity = '1'
                  e.currentTarget.style.filter = 'brightness(1.08)'
                }}
                onMouseLeave={e => {
                  const tooltip = e.currentTarget.previousSibling
                  if (tooltip) tooltip.style.opacity = '0'
                  e.currentTarget.style.filter = 'none'
                }}
              />

              {/* Label */}
              <div style={{
                position: 'absolute',
                bottom: -28,
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                textAlign: 'center'
              }} title={item[xKey]}>
                {item[xKey]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Reports() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProductsData()
  }, [])

  async function fetchProductsData() {
    try {
      setLoading(true)
      const { data, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching reports products data:', err)
      setError('حدث خطأ أثناء تحميل بيانات التقارير')
    } finally {
      setLoading(false)
    }
  }

  // Process data for charts
  const salesRevenueData = products.map(p => ({
    name: p.name,
    revenue: (p.sold || 0) * (p.selling_price || 0)
  })).slice(0, 10) // Limit to top 10 products for clean display

  const stockRemainingData = products.map(p => ({
    name: p.name,
    remaining: Math.max((p.received || 0) - (p.sold || 0), 0)
  })).slice(0, 10) // Limit to top 10 products for clean display

  // Compute stats
  const totalSalesRevenue = products.reduce((acc, p) => acc + ((p.sold || 0) * (p.selling_price || 0)), 0)
  const totalUnitsSold = products.reduce((acc, p) => acc + (p.sold || 0), 0)
  const totalRemainingStock = products.reduce((acc, p) => acc + Math.max((p.received || 0) - (p.sold || 0), 0), 0)

  return (
    <div className="animate-fade-in-up">
      {/* Page Title */}
      <h1 className="page-title">📊 تقارير المبيعات والمخزون</h1>

      {error && <div className="error-message" style={{ marginBottom: 24 }}>{error}</div>}

      {/* Summary stats */}
      <div className="stats-row" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon primary" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>💰</div>
          <div className="stat-info">
            <div className="stat-label">إجمالي الإيرادات</div>
            <div className="stat-value">
              {totalSalesRevenue.toLocaleString('ar-EG')} <span className="currency" style={{ fontSize: '1rem', fontWeight: 'normal' }}>ج.م</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon accent">🛍️</div>
          <div className="stat-info">
            <div className="stat-label">إجمالي القطع المباعة</div>
            <div className="stat-value">{totalUnitsSold.toLocaleString('ar-EG')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon primary" style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }}>📦</div>
          <div className="stat-info">
            <div className="stat-label">المخزون المتبقي بالمستودعات</div>
            <div className="stat-value">{totalRemainingStock.toLocaleString('ar-EG')}</div>
          </div>
        </div>
      </div>

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
          📊 لا توجد منتجات لعرض الرسوم البيانية الخاصة بها. أضف منتجات من لوحة المدير أولاً.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
          {/* Sales Revenue Chart */}
          <CustomSVGChart
            data={salesRevenueData}
            title="إيرادات المبيعات لكل منتج (أعلى 10)"
            xKey="name"
            yKey="revenue"
            colorStart="var(--color-primary)"
            colorEnd="var(--color-primary-dark)"
            unit="ج.م"
          />

          {/* Remaining Stock Chart */}
          <CustomSVGChart
            data={stockRemainingData}
            title="المخزون المتبقي لكل منتج (أعلى 10)"
            xKey="name"
            yKey="remaining"
            colorStart="var(--color-accent)"
            colorEnd="var(--color-accent-dark)"
            unit="قطعة"
          />
        </div>
      )}
    </div>
  )
}
