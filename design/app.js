/* Shared JS for the design prototype: manager, purchase, seller, reports */

const sampleProducts = [
  { id:1, name:'إندومي', received:50, sold:2, purchasePrice:5, sellingPrice:10, date:'2026-06-01', seller:'أحمد' },
  { id:2, name:'شاي سيلان', received:30, sold:5, purchasePrice:20, sellingPrice:35, date:'2026-06-03', seller:'محمود' },
  { id:3, name:'زيت نباتي', received:100, sold:10, purchasePrice:60, sellingPrice:80, date:'2026-06-02', seller:'سارة' },
];

function formatEGP(v){ return v + ' EGP'; }

// Common: dark mode & RTL toggles
document.addEventListener('DOMContentLoaded', ()=>{
  const darkToggle = document.getElementById('darkToggle');
  if(darkToggle){
    darkToggle.addEventListener('click', ()=> document.documentElement.classList.toggle('dark'));
  }
  const rtlToggle = document.getElementById('rtlToggle');
  if(rtlToggle){
    rtlToggle.addEventListener('click', ()=>{
      document.documentElement.dir = document.documentElement.dir === 'rtl' ? 'ltr' : 'rtl';
    });
  }

  try{
    if(location.pathname.endsWith('manager.html')) initManager();
    if(location.pathname.endsWith('purchase.html')) initPurchase();
    if(location.pathname.endsWith('seller.html')) initSeller();
    if(location.pathname.endsWith('reports.html')) initReports();
  }catch(err){
    console.error('Initialization error:', err);
  }
});

/* Manager */
function initManager(){
  const inventoryBody = document.getElementById('inventoryBody');
  if(!inventoryBody) return; // defensive: abort if page not matching
  const stats = { products:0, quantities:0, sales:0, remaining:0 };
  const products = JSON.parse(JSON.stringify(sampleProducts));

  function render(){
    inventoryBody.innerHTML = '';
    stats.products = products.length;
    stats.quantities = 0; stats.sales = 0; stats.remaining = 0;
    products.forEach(p =>{
      stats.quantities += p.received;
      stats.sales += p.sold * p.sellingPrice;
      stats.remaining += (p.received - p.sold);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-4 py-2">${p.name}</td>
        <td class="px-4 py-2">${p.received}</td>
        <td class="px-4 py-2">${p.purchasePrice} EGP</td>
        <td class="px-4 py-2">${p.sellingPrice} EGP</td>
        <td class="px-4 py-2">${p.date}</td>
        <td class="px-4 py-2">${p.seller}</td>
        <td class="px-4 py-2"><button data-id="${p.id}" class="editBtn px-2 py-1 bg-yellow-400 rounded">تعديل</button> <button data-id="${p.id}" class="delBtn px-2 py-1 bg-red-500 text-white rounded">حذف</button></td>
      `;
      inventoryBody.appendChild(tr);
    });
    document.getElementById('statProducts').innerText = stats.products;
    document.getElementById('statQuantities').innerText = stats.quantities;
    document.getElementById('statSales').innerText = formatEGP(stats.sales);
    document.getElementById('statRemaining').innerText = stats.remaining;

    // attach actions
    document.querySelectorAll('.delBtn').forEach(b=> b.addEventListener('click', e=>{
      const id = Number(e.target.dataset.id);
      const idx = products.findIndex(x=>x.id===id);
      if(idx>=0){ products.splice(idx,1); render(); }
    }));
  }
  render();

  // Modal
  const addModal = document.getElementById('addModal');
  const openAddModal = document.getElementById('openAddModal');
  const closeModal = document.getElementById('closeModal');
  if(openAddModal && addModal) openAddModal.addEventListener('click', ()=> addModal.classList.remove('hidden'));
  if(closeModal && addModal) closeModal.addEventListener('click', ()=> addModal.classList.add('hidden'));

  const addProductForm = document.getElementById('addProductForm');
  if(addProductForm){
    addProductForm.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const fd = new FormData(addProductForm);
    const p = { id: Date.now(), name: fd.get('name'), received: Number(fd.get('quantity')), purchasePrice: Number(fd.get('purchasePrice')), sellingPrice: Number(fd.get('sellingPrice')), date: fd.get('date'), seller: fd.get('seller') };
    products.unshift(p);
    addModal.classList.add('hidden');
    addProductForm.reset();
    render();
    });
  }

  // search
  const searchInput = document.getElementById('searchInput');
  if(searchInput){
    searchInput.addEventListener('input', ()=>{
      const q = searchInput.value.trim();
      if(!q){ render(); return; }
      inventoryBody.innerHTML = '';
      products.filter(p=> p.name.includes(q)).forEach(p=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="px-4 py-2">${p.name}</td>
          <td class="px-4 py-2">${p.received}</td>
          <td class="px-4 py-2">${p.purchasePrice} EGP</td>
          <td class="px-4 py-2">${p.sellingPrice} EGP</td>
          <td class="px-4 py-2">${p.date}</td>
          <td class="px-4 py-2">${p.seller}</td>
          <td class="px-4 py-2"></td>
        `;
        inventoryBody.appendChild(tr);
      });
    });
  }
}

/* Purchase Orders */
function initPurchase(){
  const po = [];
  const poBody = document.getElementById('poBody');
  const poCount = document.getElementById('poCount');
  const poQuantity = document.getElementById('poQuantity');
  const poTotal = document.getElementById('poTotal');
  const poForm = document.getElementById('poForm');
  const clearPo = document.getElementById('clearPo');

  function render(){
    poBody.innerHTML = '';
    let totalQty=0, totalCost=0;
    po.forEach((item, idx)=>{
      totalQty += item.quantity;
      totalCost += item.quantity * item.unitPrice;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-4 py-2">${item.name}</td>
        <td class="px-4 py-2">${item.quantity}</td>
        <td class="px-4 py-2">${item.unitPrice} EGP</td>
        <td class="px-4 py-2">${(item.quantity*item.unitPrice).toFixed(2)} EGP</td>
        <td class="px-4 py-2"><button data-idx="${idx}" class="delPo px-2 py-1 bg-red-500 text-white rounded">حذف</button></td>
      `;
      poBody.appendChild(tr);
    });
    poCount.innerText = po.length;
    poQuantity.innerText = totalQty;
    poTotal.innerText = totalCost.toFixed(2) + ' EGP';
    document.querySelectorAll('.delPo').forEach(b=> b.addEventListener('click', e=>{ po.splice(Number(e.target.dataset.idx),1); render(); }));
  }

  poForm.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const fd = new FormData(poForm);
    const item = { name: fd.get('name'), quantity: Number(fd.get('quantity')), unitPrice: Number(fd.get('unitPrice')) };
    po.push(item); render(); poForm.reset();
  });
  clearPo.addEventListener('click', ()=>{ po.length=0; render(); });
  render();
}

/* Seller */
function initSeller(){
  const products = JSON.parse(JSON.stringify(sampleProducts));
  const sellerBody = document.getElementById('sellerBody');
  const cashBox = document.getElementById('cashBox');
  const todaySales = document.getElementById('todaySales');
  const sellerProductsCount = document.getElementById('sellerProductsCount');

  function compute(){
    let cash=0;
    products.forEach(p=> cash += p.sold * p.sellingPrice);
    cashBox.innerText = cash + ' EGP';
    todaySales.innerText = cash + ' EGP';
    sellerProductsCount.innerText = products.length;
  }

  function render(){
    sellerBody.innerHTML = '';
    products.forEach(p=>{
      const remaining = p.received - p.sold;
      const revenue = p.sold * p.sellingPrice;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="px-4 py-2">${p.name}</td>
        <td class="px-4 py-2">${p.received}</td>
        <td class="px-4 py-2"><span id="sold-${p.id}">${p.sold}</span></td>
        <td class="px-4 py-2"><span id="rem-${p.id}">${remaining}</span></td>
        <td class="px-4 py-2">${p.sellingPrice} EGP</td>
        <td class="px-4 py-2"><span id="rev-${p.id}">${revenue} EGP</span></td>
        <td class="px-4 py-2"><button data-id="${p.id}" class="sellOne px-4 py-2 bg-green-500 text-white rounded">بيع واحد</button></td>
      `;
      sellerBody.appendChild(tr);
    });

    document.querySelectorAll('.sellOne').forEach(b=> b.addEventListener('click', e=>{
      const id = Number(e.target.dataset.id);
      const prod = products.find(x=>x.id===id);
      if(prod && (prod.received - prod.sold) > 0){
        prod.sold += 1;
        document.getElementById(`sold-${id}`).innerText = prod.sold;
        document.getElementById(`rem-${id}`).innerText = prod.received - prod.sold;
        document.getElementById(`rev-${id}`).innerText = (prod.sold * prod.sellingPrice) + ' EGP';
        compute();
      } else {
        alert('انتهى المخزون');
      }
    }));
    compute();
  }
  render();
}

/* Reports */
function initReports(){
  // simple demo charts based on sampleProducts
  const labels = sampleProducts.map(p=>p.name);
  const sales = sampleProducts.map(p=> p.sold * p.sellingPrice);
  const remaining = sampleProducts.map(p=> p.received - p.sold);

  const ctx = document.getElementById('salesChart').getContext('2d');
  new Chart(ctx, { type:'bar', data:{ labels, datasets:[{ label:'إيراد المنتج (EGP)', data: sales, backgroundColor:'#3b82f6' }] }, options:{ responsive:true } });

  const ctx2 = document.getElementById('stockChart').getContext('2d');
  new Chart(ctx2, { type:'line', data:{ labels, datasets:[{ label:'المتبقي', data: remaining, borderColor:'#10b981', fill:true }] }, options:{ responsive:true } });
}
