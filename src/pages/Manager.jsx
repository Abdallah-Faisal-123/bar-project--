import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Manager() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Form State
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [purchasePrice, setPurchasePrice] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [sellerName, setSellerName] = useState('')

  // Load products and sellers
  useEffect(() => {
    fetchProducts()
    fetchSellers()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      const { data, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('حدث خطأ أثناء تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }

  async function fetchSellers() {
    try {
      const { data, error: profilesErr } = await supabase
        .from('users')
        .select('fullName')
        .eq('role', 'Seller')

      if (profilesErr) throw profilesErr
      setSellers(data || [])
      if (data && data.length > 0) {
        setSellerName(data[0].fullName )
      }
    } catch (err) {
      console.error('Error fetching sellers:', err)
    }
  }

  // Handle Add/Edit Form Submit
  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !quantity || !purchasePrice || !sellingPrice || !date || !sellerName) {
      setError('الرجاء تعبئة جميع الحقول')
      return
    }

    const payload = {
      name: name.trim(),
      received: parseInt(quantity, 10),
      purchase_price: parseFloat(purchasePrice),
      selling_price: parseFloat(sellingPrice),
      date,
      seller: sellerName,
    }

    try {
      if (editingProduct) {
        // Edit existing product
        const { error: updateErr } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id)

        if (updateErr) throw updateErr
      } else {
        // Add new product (sold defaults to 0)
        const { error: insertErr } = await supabase
          .from('products')
          .insert({ ...payload, sold: 0 })

        if (insertErr) throw insertErr
      }

      // Refresh list & reset modal
      fetchProducts()
      closeFormModal()
    } catch (err) {
      console.error('Error saving product:', err)
      setError('فشل حفظ بيانات المنتج. يرجى المحاولة مرة أخرى.')
    }
  }

  // Handle Delete
  async function handleDelete(productId) {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) return
    try {
      const { error: deleteErr } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (deleteErr) throw deleteErr
      fetchProducts()
    } catch (err) {
      console.error('Error deleting product:', err)
      setError('فشل حذف المنتج')
    }
  }

  // Open modal for editing
  function openEditModal(product) {
    setEditingProduct(product)
    setName(product.name)
    setQuantity(product.received)
    setPurchasePrice(product.purchase_price)
    setSellingPrice(product.selling_price)
    setDate(product.date)
    setSellerName(product.seller)
    setIsModalOpen(true)
  }

  // Open modal for adding
  function openAddModal() {
    setEditingProduct(null)
    setName('')
    setQuantity(1)
    setPurchasePrice('')
    setSellingPrice('')
    setDate(new Date().toISOString().split('T')[0])
    if (sellers.length > 0) {
      setSellerName(sellers[0].fullName )
    } else {
      setSellerName('')
    }
    setIsModalOpen(true)
  }

  function closeFormModal() {
    setIsModalOpen(false)
    setEditingProduct(null)
    setError(null)
  }

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.seller.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDate = !dateFilter || p.date === dateFilter
    return matchesSearch && matchesDate
  })

  // Computations
  const totalProducts = products.length
  const totalQuantitiesDelivered = products.reduce((acc, p) => acc + (p.received || 0), 0)
  const totalSalesRevenue = products.reduce((acc, p) => acc + ((p.sold || 0) * (p.selling_price || 0)), 0)
  const totalRemainingStock = products.reduce((acc, p) => acc + ((p.received || 0) - (p.sold || 0)), 0)

  return (
    <div className="animate-fade-in-up">
      {/* Page Title */}
      <h1 className="page-title">📋 لوحة المدير</h1>

      {/* Summary Stats */}
      <div className="stats-row">
        <div className="stat-card animate-fade-in-up stagger-1">
          <div className="stat-icon primary">📦</div>
          <div className="stat-info">
            <div className="stat-label">إجمالي المنتجات</div>
            <div className="stat-value">{totalProducts}</div>
          </div>
        </div>
        <div className="stat-card animate-fade-in-up stagger-2">
          <div className="stat-icon accent">📤</div>
          <div className="stat-info">
            <div className="stat-label">إجمالي الكميات المسلمة</div>
            <div className="stat-value">{totalQuantitiesDelivered}</div>
          </div>
        </div>
        <div className="stat-card animate-fade-in-up stagger-3">
          <div className="stat-icon primary" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>💰</div>
          <div className="stat-info">
            <div className="stat-label">إجمالي المبيعات</div>
            <div className="stat-value">
              {totalSalesRevenue.toLocaleString('ar-EG')} <span className="currency" style={{ fontSize: '1rem', fontWeight: 'normal' }}>ج.م</span>
            </div>
          </div>
        </div>
        <div className="stat-card animate-fade-in-up stagger-4">
          <div className="stat-icon accent" style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }}>🔄</div>
          <div className="stat-info">
            <div className="stat-label">المخزون المتبقي</div>
            <div className="stat-value">{totalRemainingStock}</div>
          </div>
        </div>
      </div>

      {/* Actions / Filter bar */}
      <div className="card animate-fade-in-up stagger-5" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1 }}>
            <input
              type="text"
              placeholder="البحث عن منتج أو بائع..."
              className="form-input"
              style={{ maxWidth: 300, margin: 0 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <input
              type="date"
              className="form-input"
              style={{ maxWidth: 200, margin: 0 }}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            {(searchQuery || dateFilter) && (
              <button
                className="btn btn-secondary"
                onClick={() => { setSearchQuery(''); setDateFilter(''); }}
                style={{ padding: '8px 16px' }}
              >
                تصفية الفلتر
              </button>
            )}
          </div>
          <button className="btn btn-primary" onClick={openAddModal} id="open-add-product-btn">
            ➕ إضافة منتج جديد
          </button>
        </div>
      </div>

      {/* Inventory table */}
      <div className="card animate-fade-in-up stagger-6" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="card-title">📦 مخزون المنتجات المسلمة للبائعين</h2>
        </div>

        {error && <div className="error-message" style={{ margin: '16px 24px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>جارٍ التحميل...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            {products.length === 0 ? 'لا توجد منتجات مسجلة حالياً.' : 'لا توجد منتجات تطابق خيارات البحث.'}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>اسم المنتج</th>
                  <th>الكمية المسلمة</th>
                  <th>المباع</th>
                  <th>المتبقي</th>
                  <th>سعر الشراء</th>
                  <th>سعر البيع</th>
                  <th>التاريخ</th>
                  <th>البائع</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const remaining = (p.received || 0) - (p.sold || 0)
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td><span className="badge badge-primary">{p.received}</span></td>
                      <td><span className="badge badge-success">{p.sold}</span></td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: remaining <= 5 ? 'var(--color-danger-light)' : remaining <= 15 ? 'var(--color-warning-light)' : 'var(--color-primary-50)',
                            color: remaining <= 5 ? 'var(--color-danger)' : remaining <= 15 ? 'var(--color-warning)' : 'var(--color-primary)',
                          }}
                        >
                          {remaining}
                        </span>
                      </td>
                      <td>{p.purchase_price} ج.م</td>
                      <td style={{ fontWeight: 600 }}>{p.selling_price} ج.م</td>
                      <td style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{p.date}</td>
                      <td>👤 {p.seller}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => openEditModal(p)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="btn btn-danger"
                            style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: 500, margin: 16, boxShadow: 'var(--shadow-xl)' }}>
            <div className="card-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title" style={{ fontSize: '1.25rem' }}>
                {editingProduct ? '📝 تعديل المنتج' : '➕ إضافة منتج جديد'}
              </h3>
              <button
                onClick={closeFormModal}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}

              <div className="form-group">
                <label className="form-label">اسم المنتج</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: علبة بسكويت"
                  className="form-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">الكمية المسلمة</label>
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
                  <label className="form-label">تاريخ التسليم</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">سعر الشراء (للوحدة)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="ج.م"
                    className="form-input"
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">سعر البيع (للوحدة)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="ج.م"
                    className="form-input"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">البائع المعين</label>
                {sellers.length === 0 ? (
                  <input
                    type="text"
                    required
                    placeholder="أدخل اسم البائع"
                    className="form-input"
                    value={sellerName}
                    onChange={e => setSellerName(e.target.value)}
                  />
                ) : (
                  <select
                    className="form-input"
                    value={sellerName}
                    onChange={e => setSellerName(e.target.value)}
                    style={{ appearance: 'auto', paddingLeft: 12 }}
                  >
                    {sellers.map((s, idx) => (
                      <option key={idx} value={s.full_name }>
                        {s.full_name }
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={closeFormModal}>
                  إلغاء
                </button>
                <button type="submit" className="btn btn-primary" id="save-product-btn">
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
