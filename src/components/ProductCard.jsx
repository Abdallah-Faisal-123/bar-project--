import React from 'react'

export default function ProductCard({product, onSell}){
  const remaining = product.quantity - (product.sold || 0)
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold">{product.name}</div>
          <div className="text-sm muted mt-1">السعر: <span className="font-semibold">{product.price}</span></div>
        </div>
        <div className="text-right">
          <div className="text-xs muted">الوارد</div>
          <div className="font-medium">{product.quantity}</div>
        </div>
      </div>

      <div className="mt-3 flex gap-3 text-sm">
        <div className="flex-1">
          <div className="text-xs muted">المباع</div>
          <div className="font-semibold">{product.sold || 0}</div>
        </div>
        <div className="flex-1">
          <div className="text-xs muted">المتبقي</div>
          <div className="font-semibold">{remaining}</div>
        </div>
      </div>

      <div className="mt-4">
        <button disabled={remaining<=0} onClick={()=>onSell(product.id)} className="big-btn w-full">بيع قطعة واحدة</button>
      </div>
    </div>
  )
}
