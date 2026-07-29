/**
 * EcoFlow Carbon Credits Marketplace
 * Live price ticker, portfolio tracker, and VCU trading interface
 * Standard: CAR (Climate Action Reserve) & Verra VCS
 */

const CarbonTrading = {
  basePrice: 1240,
  currentPrice: 1240,
  portfolio: {
    totalCredits: 847,
    totalValue: 0,
    issued: 1240,
    retired: 393,
    pending: 150,
    history: []
  },
  priceHistory: [],
  listings: [
    { id: 'VCU-001', type: 'Solid Waste Methane Avoidance', standard: 'Verra VCS', vintage: 2024, price: 1250, qty: 120, seller: 'BMP Ward 68', verified: true },
    { id: 'VCU-002', type: 'Composting GHG Reduction',      standard: 'CAR v4.0',  vintage: 2024, price: 1230, qty: 85,  seller: 'BMP Ward 74', verified: true },
    { id: 'VCU-003', type: 'Landfill Gas Capture',          standard: 'CDM ACM',   vintage: 2023, price: 980,  qty: 200, seller: 'Karnataka PCB', verified: true },
    { id: 'VCU-004', type: 'Plastic Waste Diversion',       standard: 'Verra VCS', vintage: 2024, price: 1420, qty: 45,  seller: 'Hasiru Dala', verified: true },
    { id: 'VCU-005', type: 'E-Waste Recycling Credits',     standard: 'I-REC',     vintage: 2024, price: 1680, qty: 30,  seller: 'E-Parisaraa', verified: true },
    { id: 'VCU-006', type: 'Biogas from Wet Waste',         standard: 'CAR v4.0',  vintage: 2023, price: 1100, qty: 300, seller: 'BBMP Composting', verified: false }
  ],

  init() {
    this.portfolio.totalValue = this.portfolio.totalCredits * this.basePrice;
    this.generatePriceHistory();
    this.render();
    this.startPriceTicker();
    console.log('[CarbonTrading] ✅ Marketplace initialized');
  },

  generatePriceHistory() {
    let price = 1100;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this.priceHistory = months.map(m => {
      price += (Math.random() - 0.45) * 60;
      price = Math.max(900, Math.min(1800, price));
      return { month: m, price: Math.round(price) };
    });
    this.priceHistory[11].price = this.basePrice;
  },

  render() {
    const section = document.getElementById('carbon-trading-page');
    if (!section) return;
    section.innerHTML = `
      <div style="max-width:1300px; margin:0 auto; font-family:'Inter',sans-serif;">

        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:24px;">
          <div>
            <span style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); padding:3px 12px; border-radius:20px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">
              🌿 CAR &amp; Verra VCS Certified
            </span>
            <h2 style="margin:6px 0 2px; color:#f8fafc; font-family:'Outfit',sans-serif; font-size:26px; font-weight:800;">Carbon Credits Marketplace</h2>
            <p style="color:#94a3b8; font-size:13px; margin:0;">Trade verified carbon credits from municipal waste operations</p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button onclick="CarbonTrading.showIssueModal()" class="btn btn-primary" style="background:linear-gradient(135deg,#10b981,#059669); border:none; padding:10px 18px; font-weight:700; display:flex; align-items:center; gap:6px; box-shadow:0 4px 15px rgba(16,185,129,0.4);">
              ➕ Issue Credits
            </button>
            <button onclick="CarbonTrading.exportPortfolio()" class="btn btn-secondary" style="padding:10px 18px; font-weight:700; display:flex; align-items:center; gap:6px;">
              📥 Export Report
            </button>
          </div>
        </div>

        <!-- Live Price Ticker Bar -->
        <div style="background:rgba(10,14,26,0.95); border:1px solid rgba(16,185,129,0.2); border-radius:12px; padding:14px 20px; margin-bottom:20px; display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:#34d399; font-size:11px; font-weight:800; text-transform:uppercase; white-space:nowrap;">📈 LIVE PRICE</span>
            <span id="ct-live-price" style="font-size:24px; font-weight:800; color:#f8fafc;">₹1,240</span>
            <span id="ct-price-change" style="font-size:13px; font-weight:700; color:#34d399;">▲ +2.1%</span>
          </div>
          <div style="height:30px; width:1px; background:rgba(255,255,255,0.08);"></div>
          <div style="display:flex; gap:24px; flex-wrap:wrap; flex:1; overflow-x:auto;">
            <div style="white-space:nowrap;"><span style="color:#64748b; font-size:11px;">24h High</span><br><span id="ct-high" style="color:#34d399; font-weight:700; font-size:14px;">₹1,290</span></div>
            <div style="white-space:nowrap;"><span style="color:#64748b; font-size:11px;">24h Low</span><br><span id="ct-low" style="color:#f87171; font-weight:700; font-size:14px;">₹1,195</span></div>
            <div style="white-space:nowrap;"><span style="color:#64748b; font-size:11px;">Volume (tCO₂e)</span><br><span style="color:#f8fafc; font-weight:700; font-size:14px;">4,280</span></div>
            <div style="white-space:nowrap;"><span style="color:#64748b; font-size:11px;">Market Cap</span><br><span style="color:#f8fafc; font-weight:700; font-size:14px;">₹53.2 Cr</span></div>
            <div style="white-space:nowrap;"><span style="color:#64748b; font-size:11px;">Standard</span><br><span style="color:#a78bfa; font-weight:700; font-size:14px;">VCS + CAR</span></div>
          </div>
        </div>

        <!-- Portfolio + Chart Row -->
        <div style="display:grid; grid-template-columns:1fr 1.4fr; gap:20px; margin-bottom:20px;">

          <!-- Portfolio Summary -->
          <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:22px;">
            <h3 style="margin:0 0 18px; color:#f8fafc; font-size:16px; font-weight:700;">📊 Your Portfolio</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px;">
              <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:12px; padding:14px; text-align:center;">
                <div style="font-size:26px; font-weight:800; color:#10b981;" id="ptf-credits">847</div>
                <div style="font-size:11px; color:#94a3b8;">Credits Held (tCO₂e)</div>
              </div>
              <div style="background:rgba(96,165,250,0.08); border:1px solid rgba(96,165,250,0.2); border-radius:12px; padding:14px; text-align:center;">
                <div style="font-size:22px; font-weight:800; color:#60a5fa;">₹10.5L</div>
                <div style="font-size:11px; color:#94a3b8;">Portfolio Value</div>
              </div>
              <div style="background:rgba(167,139,250,0.08); border:1px solid rgba(167,139,250,0.2); border-radius:12px; padding:14px; text-align:center;">
                <div style="font-size:26px; font-weight:800; color:#a78bfa;">1,240</div>
                <div style="font-size:11px; color:#94a3b8;">Total Issued</div>
              </div>
              <div style="background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.2); border-radius:12px; padding:14px; text-align:center;">
                <div style="font-size:26px; font-weight:800; color:#f87171;">393</div>
                <div style="font-size:11px; color:#94a3b8;">Retired (Offset)</div>
              </div>
            </div>
            <!-- Progress bar -->
            <div style="margin-bottom:14px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span style="font-size:12px; color:#94a3b8;">Retirement Progress</span>
                <span style="font-size:12px; color:#34d399; font-weight:700;">31.7%</span>
              </div>
              <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
                <div style="height:100%; width:31.7%; background:linear-gradient(90deg,#10b981,#34d399); border-radius:3px;"></div>
              </div>
            </div>
            <div style="display:flex; gap:8px;">
              <button onclick="CarbonTrading.showRetireModal()" style="flex:1; padding:10px; background:rgba(167,139,250,0.15); color:#a78bfa; border:1px solid rgba(167,139,250,0.3); border-radius:8px; font-weight:700; font-size:13px; cursor:pointer;">
                🌿 Retire Credits
              </button>
              <button onclick="CarbonTrading.showTransferModal()" style="flex:1; padding:10px; background:rgba(96,165,250,0.15); color:#60a5fa; border:1px solid rgba(96,165,250,0.3); border-radius:8px; font-weight:700; font-size:13px; cursor:pointer;">
                🔄 Transfer
              </button>
            </div>
          </div>

          <!-- Price Chart (Canvas) -->
          <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:22px;">
            <h3 style="margin:0 0 16px; color:#f8fafc; font-size:16px; font-weight:700;">📈 12-Month Price Chart (₹/tCO₂e)</h3>
            <canvas id="carbon-price-canvas" height="180" style="width:100%; border-radius:8px;"></canvas>
          </div>

        </div>

        <!-- Marketplace Listings -->
        <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:22px;">
          <h3 style="margin:0 0 18px; color:#f8fafc; font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
            🏪 Live Marketplace Listings
            <span style="font-size:11px; color:#64748b; font-weight:400; margin-left:auto;">${this.listings.length} listings available</span>
          </h3>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                  <th style="padding:10px 12px; color:#64748b; font-weight:600; text-align:left;">Credit Type</th>
                  <th style="padding:10px 12px; color:#64748b; font-weight:600; text-align:left;">Standard</th>
                  <th style="padding:10px 12px; color:#64748b; font-weight:600; text-align:left;">Vintage</th>
                  <th style="padding:10px 12px; color:#64748b; font-weight:600; text-align:right;">Price/tCO₂e</th>
                  <th style="padding:10px 12px; color:#64748b; font-weight:600; text-align:right;">Qty</th>
                  <th style="padding:10px 12px; color:#64748b; font-weight:600; text-align:left;">Seller</th>
                  <th style="padding:10px 12px; color:#64748b; font-weight:600; text-align:center;">Status</th>
                  <th style="padding:10px 12px; color:#64748b; font-weight:600; text-align:center;">Action</th>
                </tr>
              </thead>
              <tbody id="ct-listings-tbody"></tbody>
            </table>
          </div>
        </div>

      </div>
    `;
    this.renderListings();
    this.drawPriceChart();
  },

  renderListings() {
    const tbody = document.getElementById('ct-listings-tbody');
    if (!tbody) return;
    tbody.innerHTML = this.listings.map(l => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
        <td style="padding:12px; color:#f8fafc; font-weight:600;">${l.type}</td>
        <td style="padding:12px; color:#a78bfa;">${l.standard}</td>
        <td style="padding:12px; color:#94a3b8;">${l.vintage}</td>
        <td style="padding:12px; color:#34d399; font-weight:700; text-align:right;">₹${l.price.toLocaleString('en-IN')}</td>
        <td style="padding:12px; color:#f8fafc; text-align:right;">${l.qty}</td>
        <td style="padding:12px; color:#94a3b8;">${l.seller}</td>
        <td style="padding:12px; text-align:center;">
          ${l.verified ? '<span style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); border-radius:6px; padding:2px 8px; font-size:10px; font-weight:700;">✅ Verified</span>'
                       : '<span style="background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.3); border-radius:6px; padding:2px 8px; font-size:10px; font-weight:700;">⏳ Pending</span>'}
        </td>
        <td style="padding:12px; text-align:center;">
          <button onclick="CarbonTrading.buyCredits('${l.id}')" style="background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:7px; padding:6px 14px; font-size:12px; font-weight:700; cursor:pointer; box-shadow:0 2px 8px rgba(16,185,129,0.3);">
            🛒 Buy
          </button>
        </td>
      </tr>
    `).join('');
  },

  drawPriceChart() {
    const canvas = document.getElementById('carbon-price-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = 180 * dpr;
    ctx.scale(dpr, dpr);
    const W = canvas.offsetWidth, H = 180;
    const prices = this.priceHistory.map(p => p.price);
    const months = this.priceHistory.map(p => p.month);
    const min = Math.min(...prices) - 80;
    const max = Math.max(...prices) + 80;
    const toY = v => H - 40 - ((v - min) / (max - min)) * (H - 60);
    const toX = i => 30 + (i / (prices.length - 1)) * (W - 50);

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = 10 + (i / 4) * (H - 50);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 20, y); ctx.stroke();
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(16,185,129,0.3)');
    grad.addColorStop(1, 'rgba(16,185,129,0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(toX(0), H - 40);
    prices.forEach((p, i) => ctx.lineTo(toX(i), toY(p)));
    ctx.lineTo(toX(prices.length - 1), H - 40);
    ctx.closePath();
    ctx.fill();

    // Line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    prices.forEach((p, i) => i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p)));
    ctx.stroke();

    // Month labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    months.forEach((m, i) => ctx.fillText(m, toX(i), H - 5));

    // Last point marker
    const lastX = toX(prices.length - 1), lastY = toY(prices[prices.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`₹${prices[prices.length - 1].toLocaleString('en-IN')}`, lastX, lastY - 10);
  },

  startPriceTicker() {
    setInterval(() => {
      if (window.__ecoflowPaused) return;
      const change = (Math.random() - 0.48) * 25;
      this.currentPrice = Math.max(900, Math.min(2000, Math.round(this.currentPrice + change)));
      const pct = ((this.currentPrice - this.basePrice) / this.basePrice * 100).toFixed(2);
      const el = document.getElementById('ct-live-price');
      const chEl = document.getElementById('ct-price-change');
      if (el) el.textContent = `₹${this.currentPrice.toLocaleString('en-IN')}`;
      if (chEl) {
        chEl.textContent = `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct)}%`;
        chEl.style.color = pct >= 0 ? '#34d399' : '#f87171';
      }
    }, 3000);
  },

  buyCredits(listingId) {
    const listing = this.listings.find(l => l.id === listingId);
    if (!listing) return;
    Utils.showModal(`🛒 Buy Carbon Credits — ${listing.id}`, `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:10px; padding:14px;">
          <div style="font-size:13px; color:#94a3b8; margin-bottom:4px;">${listing.type}</div>
          <div style="font-size:13px; color:#a78bfa;">${listing.standard} • Vintage ${listing.vintage}</div>
          <div style="font-size:13px; color:#34d399; font-weight:700; margin-top:4px;">₹${listing.price.toLocaleString('en-IN')} / tCO₂e</div>
        </div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Quantity to Buy (tCO₂e) — max ${listing.qty}</label>
          <input id="buy-qty" type="number" min="1" max="${listing.qty}" value="10" style="width:100%; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:10px; border-radius:8px; box-sizing:border-box;">
        </div>
        <div id="buy-total" style="background:rgba(255,255,255,0.04); border-radius:10px; padding:12px; text-align:center;">
          <span style="color:#94a3b8; font-size:12px;">Total Cost</span><br>
          <span style="font-size:24px; font-weight:800; color:#f8fafc;">₹${(listing.price * 10).toLocaleString('en-IN')}</span>
        </div>
        <button onclick="CarbonTrading.confirmBuy('${listingId}')" class="btn btn-primary" style="width:100%; padding:12px; font-weight:700; background:linear-gradient(135deg,#10b981,#059669); border:none; box-shadow:0 4px 15px rgba(16,185,129,0.4);">
          ✅ Confirm Purchase
        </button>
      </div>
    `);
    document.getElementById('buy-qty')?.addEventListener('input', e => {
      const total = document.getElementById('buy-total');
      if (total) total.querySelector('span:last-child').textContent = `₹${(listing.price * (parseInt(e.target.value) || 0)).toLocaleString('en-IN')}`;
    });
  },

  confirmBuy(listingId) {
    const listing = this.listings.find(l => l.id === listingId);
    const qty = parseInt(document.getElementById('buy-qty')?.value || 0);
    if (!listing || qty <= 0) return;
    Utils.hideModal();
    this.portfolio.totalCredits += qty;
    this.portfolio.issued += qty;
    listing.qty -= qty;
    if (listing.qty <= 0) this.listings = this.listings.filter(l => l.id !== listingId);
    setTimeout(() => {
      Utils.showToast(`✅ Purchased ${qty} tCO₂e credits from ${listing.seller}!`, 'success');
      document.getElementById('ptf-credits').textContent = this.portfolio.totalCredits;
    }, 400);
  },

  showRetireModal() {
    Utils.showModal('🌿 Retire Carbon Credits', `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div style="background:rgba(167,139,250,0.08); border:1px solid rgba(167,139,250,0.2); border-radius:10px; padding:14px;">
          <p style="color:#c4b5fd; font-size:13px; margin:0;">Retiring credits permanently removes them from the registry, claiming the environmental offset for your organization.</p>
        </div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Quantity to Retire</label>
          <input id="retire-qty" type="number" min="1" max="${this.portfolio.totalCredits}" value="50" style="width:100%; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:10px; border-radius:8px; box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Retirement Reason</label>
          <select id="retire-reason" style="width:100%; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:10px; border-radius:8px;">
            <option>BBMP Annual Sustainability Report</option>
            <option>Corporate Net-Zero Commitment</option>
            <option>Swachh Bharat Green Pledge</option>
            <option>Voluntary Offset — Public Events</option>
          </select>
        </div>
        <button onclick="CarbonTrading.confirmRetire()" class="btn btn-primary" style="width:100%; padding:12px; font-weight:700; background:linear-gradient(135deg,#7c3aed,#6d28d9); border:none;">
          🌿 Confirm Retirement
        </button>
      </div>
    `);
  },

  confirmRetire() {
    const qty = parseInt(document.getElementById('retire-qty')?.value || 0);
    if (qty <= 0 || qty > this.portfolio.totalCredits) return;
    Utils.hideModal();
    this.portfolio.totalCredits -= qty;
    this.portfolio.retired += qty;
    setTimeout(() => {
      Utils.showToast(`🌿 ${qty} tCO₂e credits retired — Certificate issued!`, 'success');
      document.getElementById('ptf-credits').textContent = this.portfolio.totalCredits;
    }, 400);
  },

  showTransferModal() {
    Utils.showModal('🔄 Transfer Carbon Credits', `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Recipient Registry ID / BBMP Ward</label>
          <input id="transfer-to" type="text" placeholder="e.g. BBMP-W068 or registry@org.in" style="width:100%; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:10px; border-radius:8px; box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Quantity (tCO₂e)</label>
          <input id="transfer-qty" type="number" min="1" max="${this.portfolio.totalCredits}" value="25" style="width:100%; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:10px; border-radius:8px; box-sizing:border-box;">
        </div>
        <button onclick="CarbonTrading.confirmTransfer()" class="btn btn-primary" style="width:100%; padding:12px; font-weight:700;">
          🔄 Confirm Transfer
        </button>
      </div>
    `);
  },

  confirmTransfer() {
    const qty = parseInt(document.getElementById('transfer-qty')?.value || 0);
    const to = document.getElementById('transfer-to')?.value?.trim();
    if (!qty || !to) return;
    Utils.hideModal();
    this.portfolio.totalCredits -= qty;
    setTimeout(() => {
      Utils.showToast(`🔄 ${qty} tCO₂e credits transferred to ${to}`, 'info');
      document.getElementById('ptf-credits').textContent = this.portfolio.totalCredits;
    }, 400);
  },

  showIssueModal() {
    Utils.showModal('➕ Issue New Carbon Credits', `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Credit Type</label>
          <select id="issue-type" style="width:100%; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:10px; border-radius:8px;">
            <option>Solid Waste Methane Avoidance</option>
            <option>Composting GHG Reduction</option>
            <option>Plastic Waste Diversion</option>
            <option>E-Waste Recycling Credits</option>
          </select>
        </div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Quantity (tCO₂e)</label>
          <input id="issue-qty" type="number" min="1" value="100" style="width:100%; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:10px; border-radius:8px; box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Verification Standard</label>
          <select id="issue-standard" style="width:100%; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:10px; border-radius:8px;">
            <option>Verra VCS</option>
            <option>CAR v4.0</option>
            <option>Gold Standard</option>
            <option>CDM ACM</option>
          </select>
        </div>
        <button onclick="CarbonTrading.confirmIssue()" class="btn btn-primary" style="width:100%; padding:12px; font-weight:700; background:linear-gradient(135deg,#10b981,#059669); border:none; box-shadow:0 4px 15px rgba(16,185,129,0.4);">
          ➕ Issue Credits
        </button>
      </div>
    `);
  },

  confirmIssue() {
    const qty = parseInt(document.getElementById('issue-qty')?.value || 0);
    const type = document.getElementById('issue-type')?.value;
    const standard = document.getElementById('issue-standard')?.value;
    if (!qty) return;
    Utils.hideModal();
    this.portfolio.totalCredits += qty;
    this.portfolio.issued += qty;
    this.portfolio.pending += qty;
    const newListing = {
      id: 'VCU-' + String(this.listings.length + 1).padStart(3, '0'),
      type, standard, vintage: 2025,
      price: this.currentPrice,
      qty, seller: 'BBMP EcoFlow', verified: false
    };
    this.listings.push(newListing);
    setTimeout(() => {
      Utils.showToast(`➕ ${qty} tCO₂e credits issued — Pending verification`, 'success');
      this.renderListings();
      document.getElementById('ptf-credits').textContent = this.portfolio.totalCredits;
    }, 400);
  },

  exportPortfolio() {
    const now = new Date();
    const csv = [
      'Credit ID,Type,Standard,Vintage,Price (₹),Qty (tCO₂e),Seller,Verified',
      ...this.listings.map(l => `${l.id},"${l.type}",${l.standard},${l.vintage},${l.price},${l.qty},"${l.seller}",${l.verified}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon-portfolio-${now.toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.showToast('📥 Carbon portfolio exported as CSV!', 'success');
  }
};

window.CarbonTrading = CarbonTrading;
