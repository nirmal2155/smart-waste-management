/**
 * EcoFlow Smart Bin Network — Digital Twin Dashboard
 * 3D-animated bin grid with predictive fill, automated alerts & maintenance scheduling
 */

const SmartBinNetwork = {
  bins: [],
  totalBins: 48,
  filterStatus: 'all',

  init() {
    this.generateBins();
    this.render();
    this.startSimulation();
    console.log('[SmartBinNetwork] ✅ Digital Twin network online');
  },

  generateBins() {
    const zones = ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Electronic City'];
    const types = ['Organic', 'Recyclable', 'Residual', 'Hazardous'];
    const typeColors = { 'Organic': '#10b981', 'Recyclable': '#3b82f6', 'Residual': '#94a3b8', 'Hazardous': '#ef4444' };
    this.bins = Array.from({ length: this.totalBins }, (_, i) => {
      const zone = zones[Math.floor(i / 8)];
      const type = types[i % 4];
      const fill = Math.floor(Math.random() * 95) + 5;
      const battery = Math.floor(Math.random() * 80) + 20;
      const temp = (22 + Math.random() * 15).toFixed(1);
      const lastPickup = new Date(Date.now() - Math.random() * 86400000 * 3);
      return {
        id: `B-${String(i + 1).padStart(3, '0')}`,
        zone, type, fill, battery, temp: parseFloat(temp),
        lat: (12.85 + Math.random() * 0.35).toFixed(5),
        lng: (77.55 + Math.random() * 0.25).toFixed(5),
        status: fill >= 85 ? 'critical' : fill >= 65 ? 'warning' : 'good',
        lastPickup: lastPickup.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        signal: Math.floor(Math.random() * 3) + 2,
        color: typeColors[type],
        predictedFull: this.predictFull(fill)
      };
    });
  },

  predictFull(currentFill) {
    const fillRate = (1 + Math.random() * 3).toFixed(1); // %/hr
    const hoursLeft = ((100 - currentFill) / fillRate).toFixed(1);
    return `${hoursLeft}h`;
  },

  render() {
    const section = document.getElementById('smart-bins-page');
    if (!section) return;
    const criticalCount = this.bins.filter(b => b.status === 'critical').length;
    const warningCount = this.bins.filter(b => b.status === 'warning').length;
    const goodCount = this.bins.filter(b => b.status === 'good').length;

    section.innerHTML = `
      <div style="max-width:1400px; margin:0 auto; font-family:'Inter',sans-serif;">

        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:24px;">
          <div>
            <span style="background:rgba(96,165,250,0.15); color:#60a5fa; border:1px solid rgba(96,165,250,0.3); padding:3px 12px; border-radius:20px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">
              📡 Digital Twin Network
            </span>
            <h2 style="margin:6px 0 2px; color:#f8fafc; font-family:'Outfit',sans-serif; font-size:26px; font-weight:800;">Smart Bin Network Dashboard</h2>
            <p style="color:#94a3b8; font-size:13px; margin:0;">Real-time IoT monitoring of ${this.totalBins} smart bins across 6 BBMP zones</p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button onclick="SmartBinNetwork.dispatchPickupAll()" class="btn btn-primary" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8); border:none; padding:10px 18px; font-weight:700; display:flex; align-items:center; gap:6px; box-shadow:0 4px 15px rgba(59,130,246,0.4);">
              🚛 Dispatch All Critical
            </button>
            <button onclick="SmartBinNetwork.exportBinReport()" class="btn btn-secondary" style="padding:10px 18px; font-weight:700;">
              📊 Export Report
            </button>
          </div>
        </div>

        <!-- Summary Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:14px; margin-bottom:24px;">
          <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:14px; padding:16px; text-align:center;">
            <div style="font-size:32px; font-weight:800; color:#f87171;">${criticalCount}</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:4px;">🔴 Critical (&gt;85%)</div>
          </div>
          <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.25); border-radius:14px; padding:16px; text-align:center;">
            <div style="font-size:32px; font-weight:800; color:#f59e0b;">${warningCount}</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:4px;">🟡 Warning (65-85%)</div>
          </div>
          <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); border-radius:14px; padding:16px; text-align:center;">
            <div style="font-size:32px; font-weight:800; color:#10b981;">${goodCount}</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:4px;">🟢 Good (&lt;65%)</div>
          </div>
          <div style="background:rgba(96,165,250,0.1); border:1px solid rgba(96,165,250,0.25); border-radius:14px; padding:16px; text-align:center;">
            <div style="font-size:32px; font-weight:800; color:#60a5fa;">${this.totalBins}</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:4px;">📡 Total Online</div>
          </div>
          <div style="background:rgba(167,139,250,0.1); border:1px solid rgba(167,139,250,0.25); border-radius:14px; padding:16px; text-align:center;">
            <div style="font-size:32px; font-weight:800; color:#a78bfa;">${Math.round(this.bins.reduce((s,b) => s + b.fill, 0) / this.bins.length)}%</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:4px;">📊 Avg Fill Level</div>
          </div>
          <div style="background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.25); border-radius:14px; padding:16px; text-align:center;">
            <div style="font-size:32px; font-weight:800; color:#fbbf24;">${Math.round(this.bins.reduce((s,b) => s + b.battery, 0) / this.bins.length)}%</div>
            <div style="font-size:12px; color:#94a3b8; margin-top:4px;">🔋 Avg Battery</div>
          </div>
        </div>

        <!-- Filter Bar -->
        <div style="display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap;">
          ${['all','critical','warning','good'].map(f => `
            <button onclick="SmartBinNetwork.filterBins('${f}')" id="filter-${f}" style="padding:7px 16px; border-radius:20px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid ${this.filterStatus === f ? 'rgba(16,185,129,0.6)' : 'rgba(255,255,255,0.1)'}; background:${this.filterStatus === f ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)'}; color:${this.filterStatus === f ? '#34d399' : '#94a3b8'}; transition:all 0.2s;">
              ${f === 'all' ? '📋 All' : f === 'critical' ? '🔴 Critical' : f === 'warning' ? '🟡 Warning' : '🟢 Good'}
            </button>
          `).join('')}
          <div style="margin-left:auto; display:flex; align-items:center; gap:8px;">
            <span style="font-size:11px; color:#64748b;">Filter by zone:</span>
            <select id="zone-filter" onchange="SmartBinNetwork.filterByZone(this.value)" style="background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:6px 10px; border-radius:8px; font-size:12px;">
              <option value="all">All Zones</option>
              <option>Koramangala</option><option>Indiranagar</option><option>Whitefield</option>
              <option>HSR Layout</option><option>Jayanagar</option><option>Electronic City</option>
            </select>
          </div>
        </div>

        <!-- Bin Grid -->
        <div id="bin-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:14px;"></div>

      </div>
    `;
    this.renderBinGrid();
  },

  renderBinGrid() {
    const container = document.getElementById('bin-grid');
    if (!container) return;
    const filtered = this.filterStatus === 'all' ? this.bins : this.bins.filter(b => b.status === this.filterStatus);
    const zoneFilter = document.getElementById('zone-filter')?.value;
    const display = (zoneFilter && zoneFilter !== 'all') ? filtered.filter(b => b.zone === zoneFilter) : filtered;

    container.innerHTML = display.map(bin => {
      const barColor = bin.fill >= 85 ? '#ef4444' : bin.fill >= 65 ? '#f59e0b' : '#10b981';
      const bgBorder = bin.fill >= 85 ? 'rgba(239,68,68,0.2)' : bin.fill >= 65 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.15)';
      const typeEmoji = { 'Organic': '🟢', 'Recyclable': '🔵', 'Residual': '⚫', 'Hazardous': '🔴' }[bin.type] || '⬜';
      const signalBars = '▮'.repeat(bin.signal) + '▯'.repeat(4 - bin.signal);
      return `
        <div onclick="SmartBinNetwork.showBinDetail('${bin.id}')"
          style="background:rgba(15,23,42,0.9); border:1px solid ${bgBorder}; border-radius:14px; padding:16px; cursor:pointer; transition:all 0.25s; position:relative; overflow:hidden;"
          onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.3)'"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          
          <!-- Bin ID + Type Badge -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <span style="font-size:13px; font-weight:800; color:#f8fafc;">${bin.id}</span>
            <span style="background:${bin.color}22; color:${bin.color}; border:1px solid ${bin.color}44; border-radius:6px; padding:2px 7px; font-size:10px; font-weight:700;">${typeEmoji} ${bin.type}</span>
          </div>

          <!-- Fill Level Visual -->
          <div style="margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span style="font-size:11px; color:#94a3b8;">Fill Level</span>
              <span style="font-size:13px; font-weight:800; color:${barColor};">${bin.fill}%</span>
            </div>
            <div style="height:8px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden; position:relative;">
              <div style="height:100%; width:${bin.fill}%; background:linear-gradient(90deg,${barColor},${barColor}cc); border-radius:4px; transition:width 0.6s ease; box-shadow:0 0 8px ${barColor}66;"></div>
            </div>
          </div>

          <!-- Metrics Row -->
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-bottom:10px;">
            <div style="text-align:center; background:rgba(255,255,255,0.04); border-radius:6px; padding:5px;">
              <div style="font-size:11px; color:#94a3b8;">Bat</div>
              <div style="font-size:12px; font-weight:700; color:${bin.battery < 30 ? '#f87171' : '#34d399'};">${bin.battery}%</div>
            </div>
            <div style="text-align:center; background:rgba(255,255,255,0.04); border-radius:6px; padding:5px;">
              <div style="font-size:11px; color:#94a3b8;">Temp</div>
              <div style="font-size:12px; font-weight:700; color:#60a5fa;">${bin.temp}°C</div>
            </div>
            <div style="text-align:center; background:rgba(255,255,255,0.04); border-radius:6px; padding:5px;">
              <div style="font-size:11px; color:#94a3b8;">Full In</div>
              <div style="font-size:12px; font-weight:700; color:#f59e0b;">${bin.predictedFull}</div>
            </div>
          </div>

          <!-- Footer -->
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; color:#64748b;">${bin.zone} • Last: ${bin.lastPickup}</span>
            <span style="font-size:10px; color:#64748b; font-family:monospace;" title="Signal Strength">${signalBars}</span>
          </div>

          <!-- Overflow pulse glow -->
          ${bin.fill >= 85 ? '<div style="position:absolute; top:8px; right:8px; width:8px; height:8px; border-radius:50%; background:#ef4444; animation:pulseRed 1s infinite;"></div>' : ''}
        </div>
      `;
    }).join('');
  },

  filterBins(status) {
    this.filterStatus = status;
    this.render();
  },

  filterByZone(zone) {
    this.renderBinGrid();
  },

  showBinDetail(binId) {
    const bin = this.bins.find(b => b.id === binId);
    if (!bin) return;
    const barColor = bin.fill >= 85 ? '#ef4444' : bin.fill >= 65 ? '#f59e0b' : '#10b981';
    Utils.showModal(`📡 Smart Bin — ${bin.id} Details`, `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:14px; text-align:center;">
            <div style="font-size:42px; font-weight:800; color:${barColor};">${bin.fill}%</div>
            <div style="font-size:12px; color:#94a3b8;">Fill Level</div>
            <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; margin-top:8px;">
              <div style="height:100%; width:${bin.fill}%; background:${barColor}; border-radius:3px;"></div>
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:14px; text-align:center;">
            <div style="font-size:42px; font-weight:800; color:${bin.battery < 30 ? '#ef4444' : '#34d399'};">${bin.battery}%</div>
            <div style="font-size:12px; color:#94a3b8;">🔋 Battery</div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
          <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:12px; text-align:center;">
            <div style="font-size:20px; font-weight:800; color:#60a5fa;">${bin.temp}°C</div>
            <div style="font-size:11px; color:#94a3b8;">Internal Temp</div>
          </div>
          <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:12px; text-align:center;">
            <div style="font-size:20px; font-weight:800; color:#f59e0b;">${bin.predictedFull}</div>
            <div style="font-size:11px; color:#94a3b8;">Est. Full In</div>
          </div>
          <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:12px; text-align:center;">
            <div style="font-size:20px; font-weight:800; color:#a78bfa;">${bin.signal}/4</div>
            <div style="font-size:11px; color:#94a3b8;">Signal</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:12px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px;">
            <div><span style="color:#64748b;">Zone:</span> <span style="color:#f8fafc;">${bin.zone}</span></div>
            <div><span style="color:#64748b;">Type:</span> <span style="color:${bin.color};">${bin.type}</span></div>
            <div><span style="color:#64748b;">Last Pickup:</span> <span style="color:#f8fafc;">${bin.lastPickup}</span></div>
            <div><span style="color:#64748b;">Status:</span> <span style="color:${barColor}; text-transform:uppercase; font-weight:700;">${bin.status}</span></div>
            <div><span style="color:#64748b;">GPS Lat:</span> <span style="color:#94a3b8;">${bin.lat}°N</span></div>
            <div><span style="color:#64748b;">GPS Lng:</span> <span style="color:#94a3b8;">${bin.lng}°E</span></div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button onclick="SmartBinNetwork.dispatchPickup('${bin.id}'); Utils.hideModal();" class="btn btn-primary" style="flex:1; padding:11px; font-weight:700;">
            🚛 Dispatch Pickup
          </button>
          <button onclick="SmartBinNetwork.scheduleMaintenance('${bin.id}'); Utils.hideModal();" style="flex:1; padding:11px; background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.3); border-radius:8px; font-weight:700; cursor:pointer;">
            🔧 Schedule Maintenance
          </button>
        </div>
      </div>
    `);
  },

  dispatchPickup(binId) {
    const bin = this.bins.find(b => b.id === binId);
    if (!bin) return;
    bin.fill = Math.max(5, bin.fill - 80);
    bin.status = bin.fill >= 85 ? 'critical' : bin.fill >= 65 ? 'warning' : 'good';
    bin.lastPickup = 'Today';
    this.renderBinGrid();
    Utils.showToast(`🚛 Pickup dispatched for ${binId}!`, 'success');
  },

  dispatchPickupAll() {
    const critical = this.bins.filter(b => b.status === 'critical');
    critical.forEach(b => {
      b.fill = Math.max(5, b.fill - 80);
      b.status = 'good';
      b.lastPickup = 'Today';
    });
    this.renderBinGrid();
    Utils.showToast(`🚛 ${critical.length} trucks dispatched for all critical bins!`, 'success');
  },

  scheduleMaintenance(binId) {
    Utils.showToast(`🔧 Maintenance scheduled for ${binId} — tomorrow 08:00 AM`, 'info');
  },

  startSimulation() {
    setInterval(() => {
      if (window.__ecoflowPaused) return;
      const idx = Math.floor(Math.random() * this.bins.length);
      this.bins[idx].fill = Math.min(99, this.bins[idx].fill + Math.floor(Math.random() * 3));
      this.bins[idx].status = this.bins[idx].fill >= 85 ? 'critical' : this.bins[idx].fill >= 65 ? 'warning' : 'good';
      this.bins[idx].battery = Math.max(5, this.bins[idx].battery - 0.1);
      this.renderBinGrid();
    }, 4000);
  },

  exportBinReport() {
    const now = new Date();
    const csv = [
      'Bin ID,Zone,Type,Fill %,Battery %,Temp °C,Status,Last Pickup,Predicted Full In',
      ...this.bins.map(b => `${b.id},${b.zone},${b.type},${b.fill},${b.battery},${b.temp},${b.status},${b.lastPickup},${b.predictedFull}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-bins-${now.toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.showToast('📊 Smart bin report exported!', 'success');
  }
};

window.SmartBinNetwork = SmartBinNetwork;
