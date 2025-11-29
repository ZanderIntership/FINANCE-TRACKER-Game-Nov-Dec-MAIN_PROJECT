// Client-side app to interact with Node API
async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  return res.json();
}

function drawPie(canvas, labels, values) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const total = values.reduce((s,v)=>s+(Number(v)||0),0);
  const colors = ['#7c3aed','#a78bfa','#c4b5fd','#7dd3fc','#60a5fa','#34d399','#f472b6','#f97316'];
  let start = 0;
  for (let i=0;i<values.length;i++){
    const v = Number(values[i])||0;
    const slice = total ? (v/total)*Math.PI*2 : 0;
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, canvas.height/2);
    ctx.arc(canvas.width/2, canvas.height/2, Math.min(canvas.width, canvas.height)/2 - 4, start, start+slice);
    ctx.closePath();
    ctx.fillStyle = colors[i%colors.length];
    ctx.fill();
    start += slice;
  }
  // center label
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, Math.min(canvas.width, canvas.height)/4, 0, Math.PI*2);
  ctx.fillStyle = '#ffffffcc'; ctx.fill();
  ctx.fillStyle = '#111827'; ctx.font='14px system-ui, Arial'; ctx.textAlign='center';
  ctx.fillText('R'+(total).toFixed(2), canvas.width/2, canvas.height/2+6);
}

async function loadMetrics(){
  try{
    const m = await fetchJSON('/api/metrics');
    document.getElementById('totalBalance').textContent = 'R'+Number(m.total_balance||0).toFixed(2);
    document.getElementById('monthlyIncome').textContent = 'R'+Number(m.monthly_income||0).toFixed(2);
    document.getElementById('monthlyExpenses').textContent = 'R'+Number(m.monthly_expenses||0).toFixed(2);
    document.getElementById('savingsRate').textContent = m.savings_rate||'—';
  }catch(e){console.error(e)}
}

async function loadRecent(){
  try{
    const txs = await fetchJSON('/api/transactions');
    const ul = document.getElementById('recentList');
    ul.innerHTML = '';
    if(!txs || txs.length===0){
      ul.innerHTML = '<li>R0.00 — No transactions yet.</li>';
      return;
    }
    for (const t of txs.slice(0,5)){
      const li = document.createElement('li');
      li.style.padding='6px 0';
      li.textContent = `${t.date} — ${t.description} — R${Number(t.amount).toFixed(2)} — ${t.category}`;
      ul.appendChild(li);
    }
  }catch(e){console.error(e)}
}

async function setupTrackForm(){
  const btn = document.getElementById('txSubmit');
  if(!btn) return;
  btn.addEventListener('click', async ()=>{
    const payload = {
      date: document.getElementById('txDate').value,
      description: document.getElementById('txDescription').value,
      amount: document.getElementById('txAmount').value,
      category: document.getElementById('txCategory').value,
      type: document.getElementById('txType').value
    };
    await fetchJSON('/api/transactions', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    await loadMetrics(); await loadRecent();
  });
}

async function setupAssetForm(){
  const btn = document.getElementById('assetSubmit');
  if(!btn) return;
  btn.addEventListener('click', async (e)=>{
    e.preventDefault();
    const payload = {name: document.getElementById('assetName').value, price: document.getElementById('assetPrice').value, account: document.getElementById('assetAccount').value};
    await fetchJSON('/api/assets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    document.getElementById('assetName').value=''; document.getElementById('assetPrice').value=''; document.getElementById('assetAccount').value='';
    await loadAssets();
  });
}

async function loadAssets(){
  try{
    const assets = await fetchJSON('/api/assets');
    const history = await fetchJSON('/api/assets/history');
    const labels = assets.map(a=>a.name);
    const values = assets.map(a=>a.price);
    document.getElementById('assetsTotal').textContent = (values.reduce((s,v)=>s+v,0)).toFixed(2);
    const list = document.getElementById('assetList');
    list.innerHTML = '';
    if(!assets || assets.length===0){ list.innerHTML = '<li>R0.00 — No assets yet.</li>'; return }
    assets.forEach((a, idx)=>{
      const li=document.createElement('li'); li.style.padding='6px 0';
      // find most recent history entry for this asset that is not an undo and not undone
      const last = history.find(h=>h.assetIndex===idx && h.action!=='undo' && !h.undone);
      let undoHtml = '';
      if (last){
        undoHtml = `<button data-history="${last.id}" class="undo-btn">Undo</button>`;
      }
      li.innerHTML = `${a.name} — R${Number(a.price).toFixed(2)} — ${a.account} <button data-idx="${idx}" class="add-amount" style="margin-left:8px">+Add</button> <button data-idx="${idx}" class="reduce-amount" style="margin-left:6px">−Reduce</button> ${undoHtml}`;
      list.appendChild(li);
    });
    const canvas = document.getElementById('assetChart');
    if (canvas) drawPie(canvas, labels, values);
    // Also update home page chart if present
    const homeCanvas = document.getElementById('chart');
    if (homeCanvas) {
      // create small pie into the div by creating a canvas child
      let c = homeCanvas.querySelector('canvas');
      if (!c) { c = document.createElement('canvas'); c.width=200; c.height=200; homeCanvas.innerHTML=''; homeCanvas.appendChild(c); }
      drawPie(c, labels, values);
    }
    // bind add buttons
    document.querySelectorAll('.add-amount').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const idx = btn.getAttribute('data-idx');
        const add = prompt('Add amount to this asset (numeric):','0');
        if (add===null) return;
        await fetchJSON('/api/assets/add-amount',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({index:idx, amount:add})});
        await loadAssets(); await loadMetrics();
      });
    });

    // bind reduce buttons (subtract from asset price) with confirmation
    document.querySelectorAll('.reduce-amount').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const idx = Number(btn.getAttribute('data-idx'));
        let amt = prompt('Reduce amount from this asset (numeric):','0');
        if (amt===null) return;
        const n = Number(amt);
        if (Number.isNaN(n) || n <= 0) { alert('Please enter a valid positive number'); return }
        const assetName = (assets && assets[idx] && assets[idx].name) ? assets[idx].name : 'asset';
        const ok = confirm(`Are you sure you want to reduce ${assetName} by R${n.toFixed(2)}? This action will decrease the asset's value.`);
        if (!ok) return;
        const neg = -Math.abs(n);
        const resp = await fetchJSON('/api/assets/add-amount',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({index:idx, amount:neg})});
        if (!resp || resp.success === false){
          alert('Error applying reduction: ' + (resp && resp.error ? resp.error : 'Unknown error'));
          return;
        }
        await loadAssets(); await loadMetrics();
      });
    });

    // bind undo buttons
    document.querySelectorAll('.undo-btn').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const hid = btn.getAttribute('data-history');
        if (!hid) return;
        const ok = confirm('Undo this change? This will revert the last adjustment for the asset.');
        if (!ok) return;
        const resp = await fetchJSON('/api/assets/undo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({historyId:hid})});
        if (!resp || resp.success === false){
          alert('Unable to undo: ' + (resp && resp.error ? resp.error : 'Unknown error'));
          return;
        }
        await loadAssets(); await loadMetrics();
      });
    });
  }catch(e){console.error(e)}
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadMetrics(); loadRecent(); setupTrackForm(); setupAssetForm(); loadAssets();
});
