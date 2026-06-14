import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Purchase() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  // Form states
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [price, setprice] = useState('')
  async function fetchItems() {
  const { data, error } = await supabase
    .from('purchase_requests')
    .select('*')

  if (error) {
    console.error(error)
    setError('فشل تحميل الطلبات')
    return
  }

  setItems(data)
}
  // Add Item to Purchase Order
async function handleAddItem(e) {
  e.preventDefault()
  setError(null)

  if (!name.trim() || !quantity || !price) {
    setError('الرجاء تعبئة جميع الحقول')
    return
  }

  const newItem = {
    product_name: name.trim(),
    quantity: parseInt(quantity),
    price: parseFloat(price),
  }

  const { error } = await supabase
    .from('purchase_requests')
    .insert([newItem])

  if (error) {
    setError('فشل الحفظ')
    return
  }

  await fetchItems() 

  setName('')
  setQuantity(1)
  setprice('')
}

  // Delete Individual Item
  function handleDeleteItem(itemId) {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Clear All Items
  function handleClearAll() {
    if (items.length === 0) return
    if (!window.confirm('هل أنت متأكد من رغبتك في مسح كل عناصر هذا الطلب؟')) return
    setItems([])
  }

  // Stats
  const totalItemsCount = items.length
  const totalQuantity = items.reduce((acc, item) => acc + (item.quantity || 0), 0)
  const totalCost = items.reduce((acc, item) => acc + ((item.quantity || 0) * (item.unit_price || 0)), 0)

  return (
    <div className="animate-fade-in-up">
      {/* Page Title */}
      <h1 className="page-title">🛍️ طلبات الشراء</h1>

      {/* Stats Cards */}
      <div className="stats-row" style={{ marginBottom: 24 }}>
        <div className="stat-card animate-fade-in-up stagger-1">
          <div className="stat-icon primary">🔢</div>
          <div className="stat-info">
            <div className="stat-label">عدد المنتجات بالطلب</div>
            <div className="stat-value">{totalItemsCount}</div>
          </div>
        </div>
        <div className="stat-card animate-fade-in-up stagger-2">
          <div className="stat-icon accent">📦</div>
          <div className="stat-info">
            <div className="stat-label">إجمالي الكمية المطلوبة</div>
            <div className="stat-value">{totalQuantity}</div>
          </div>
        </div>
        <div className="stat-card animate-fade-in-up stagger-3">
          <div className="stat-icon primary" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>💰</div>
          <div className="stat-info">
            <div className="stat-label">التكلفة الإجمالية للطلب</div>
            <div className="stat-value">
              {totalCost.toLocaleString('ar-EG')} <span className="currency" style={{ fontSize: '1rem', fontWeight: 'normal' }}>ج.م</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Add Item Card */}
        <div className="card animate-fade-in-up stagger-4">
          <div className="card-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="card-title">🛒 أضف عنصر للطلب</h2>
          </div>

          <form onSubmit={handleAddItem} style={{ padding: 24 }}>
            {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="form-group">
              <label className="form-label">اسم المنتج</label>
              <input
                type="text"
                required
                placeholder="مثال: شاي لبتون 100 فتلة"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">الكمية</label>
              <input
                type="number"
                min="1"
                required
                className="form-input"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">سعر الشراء للوحدة</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="ج.م"
                className="form-input"
                value={price}
                onChange={e => setprice(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <button type="submit" className="btn btn-primary btn-full" id="add-po-item-btn">
                ➕ أضف عنصر
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => { setName(''); setQuantity(1); setprice(''); }}
                style={{ flex: '0 0 auto' }}
              >
                مسح الحقول
              </button>
            </div>
          </form>
        </div>

        {/* Purchase Items List Table */}
        <div className="card animate-fade-in-up stagger-5" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">📋 عناصر طلب الشراء الحالي</h2>
            <button
              onClick={handleClearAll}
              className="btn btn-danger"
              disabled={items.length === 0}
              style={{ padding: '6px 12px', fontSize: '0.875rem' }}
            >
              🗑️ مسح الكل
            </button>
          </div>

          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
              لا توجد عناصر مضافة لطلب الشراء هذا بعد.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>المنتج</th>
                    <th>الكمية</th>
                    <th>سعر الوحدة</th>
                    <th>الإجمالي</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td><span className="badge badge-primary">{item.quantity}</span></td>
                      <td>{item.unit_price} ج.م</td>
                      <td style={{ fontWeight: 600 }}>{(item.quantity * item.unit_price).toFixed(2)} ج.م</td>
                      <td>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="btn btn-danger"
                          style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
