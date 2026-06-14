import React from 'react'

export default function CashBox({money, soldItems}){
  return (
    <div className="card" style={{background:'linear-gradient(90deg,#06b6d4,#0ea5a4)',color:'#fff'}}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm opacity-90">صندوق النقود</div>
          <div className="text-3xl font-extrabold mt-2">{money} </div>
          <div className="text-sm mt-1 opacity-90">إجمالي القطع المباعة: <span className="font-semibold">{soldItems}</span></div>
        </div>
        <div className="text-right">
          <div className="text-sm">مهم</div>
        </div>
      </div>
    </div>
  )
}
