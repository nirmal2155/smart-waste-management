/**
 * EcoFlow Command Center Module
 * Real-time Operational War Room — Live KPIs, Emergency Dispatch, City-wide Heatmap
 */

const CommandCenter = {
  isLive: false,
  liveInterval: null,
  alertQueue: [],
  kpiHistory: [],
  cityZones: [
    { id: 'Z1', name: 'Koramangala',   ward: 68,  fillLevel: 78, status: 'critical', trucks: 3, lat: 12.9279, lng: 77.6271 },
    { id: 'Z2', name: 'Indiranagar',   ward: 74,  fillLevel: 55, status: 'normal',   trucks: 2, lat: 12.9784, lng: 77.6408 },
    { id: 'Z3', name: 'Whitefield',    ward: 84,  fillLevel: 91, status: 'overflow', trucks: 4, lat: 12.9698, lng: 77.7499 },
    { id: 'Z4', name: 'HSR Layout',    ward: 149, fillLevel: 62, status: 'normal',   trucks: 2, lat: 12.9116, lng: 77.6473 },
    { id: 'Z5', name: 'Jayanagar',     ward: 155, fillLevel: 44, status: 'good',     trucks: 1, lat: 12.9250, lng: 77.5938 },
    { id: 'Z6', name: 'Electronic City', ward: 191, fillLevel: 83, status: 'warning', trucks: 3, lat: 12.8399, lng: 77.6770 },
    { id: 'Z7', name: 'Marathahalli',  ward: 88,  fillLevel: 70, status: 'warning',  trucks: 2, lat: 12.9591, lng: 77.6971 },
    { id: 'Z8', name: 'Yelahanka',     ward: 6,   fillLevel: 38, status: 'good',     trucks: 1, lat: 13.1007, lng: 77.5963 }
  ],
  emergencyAlerts: [
    { id: 'A001', time: '09:12', zone: 'Whitefield', type: 'overflow',   msg: 'Bin overflow detected — Ward 84. 2 emergency trucks dispatched.', severity: 'critical', resolved: false },
    { id: 'A002', time: '09:34', zone: 'Koramangala', type: 'illegal',   msg: 'Illegal dumping spotted near BDA Complex. Ward officer notified.', severity: 'high',     resolved: false },
    { id: 'A003', time: '10:01', zone: 'Electronic City', type: 'vehicle', msg: 'Vehicle KA-01-CD-5678 engine fault. Backup dispatched.',         severity: 'medium',   resolved: true  },
    { id: 'A004', time: '10:45', zone: 'Marathahalli', type: 'missed',   msg: 'Missed collection at 3 stops — Route M-07. Rescheduled 14:00.',  severity: 'medium',   resolved: false }
  ],

  init() {
    this.render();
    this.startLiveFeed();
    console.log('[CommandCenter] ✅ War Room initialized');
  },

  render() {
    const section = document.getElementById('command-center-page');
    if (!section) return;
    section.innerHTML = `
      <div style="max-width: 1400px; margin: 0 auto; font-family: 'Inter', sans-serif;">

        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:24px;">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
              <span style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.35); padding:3px 12px; border-radius:20px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:1px;">
                🎯 Operational War Room
              </span>
              <span id="cc-live-badge" style="display:flex; align-items:center; gap:5px; font-size:12px; color:#34d399; font-weight:700;">
                <span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;animation:pulseRed 1.2s infinite;"></span>
                LIVE
              </span>
            </div>
            <h2 style="margin:0; color:#f8fafc; font-family:'Outfit',sans-serif; font-size:26px; font-weight:800;">City Command &amp; Control Center</h2>
            <p style="color:#94a3b8; font-size:13px; margin:4px 0 0;">Real-time operational intelligence across all 8 BBMP zones</p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button onclick="CommandCenter.dispatchEmergency()" class="btn btn-primary" style="background:linear-gradient(135deg,#ef4444,#dc2626); border:none; display:flex; align-items:center; gap:6px; padding:10px 18px; font-weight:700; box-shadow:0 4px 20px rgba(239,68,68,0.4);">
              🚨 Emergency Dispatch
            </button>
            <button onclick="CommandCenter.exportSitRep()" class="btn btn-secondary" style="display:flex; align-items:center; gap:6px; padding:10px 18px; font-weight:700;">
              📄 Situation Report
            </button>
          </div>
        </div>

        <!-- Live KPI Ticker -->
        <div style="background:rgba(10,14,26,0.95); border:1px solid rgba(16,185,129,0.2); border-radius:12px; padding:14px 20px; margin-bottom:20px; overflow:hidden;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="color:#34d399; font-size:11px; font-weight:800; text-transform:uppercase; white-space:nowrap;">📡 LIVE KPI</span>
            <div id="kpi-ticker" style="display:flex; gap:32px; overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none; flex:1;">
              <div class="kpi-tick" style="white-space:nowrap;"><span style="color:#94a3b8; font-size:11px;">🗑️ Collected Today</span><br><strong id="kpi-collected" style="color:#f8fafc; font-size:18px;">2,847 T</strong></div>
              <div class="kpi-tick" style="white-space:nowrap;"><span style="color:#94a3b8; font-size:11px;">🚛 Trucks Active</span><br><strong id="kpi-trucks" style="color:#10b981; font-size:18px;">18/22</strong></div>
              <div class="kpi-tick" style="white-space:nowrap;"><span style="color:#94a3b8; font-size:11px;">♻️ Recycling Rate</span><br><strong id="kpi-recycle" style="color:#f59e0b; font-size:18px;">67.3%</strong></div>
              <div class="kpi-tick" style="white-space:nowrap;"><span style="color:#94a3b8; font-size:11px;">🌿 CO₂ Saved</span><br><strong id="kpi-co2" style="color:#34d399; font-size:18px;">1,247 kg</strong></div>
              <div class="kpi-tick" style="white-space:nowrap;"><span style="color:#94a3b8; font-size:11px;">💰 Revenue (MTD)</span><br><strong id="kpi-revenue" style="color:#f8fafc; font-size:18px;">₹18.4L</strong></div>
              <div class="kpi-tick" style="white-space:nowrap;"><span style="color:#94a3b8; font-size:11px;">🚨 Active Alerts</span><br><strong id="kpi-alerts" style="color:#ef4444; font-size:18px;">3</strong></div>
              <div class="kpi-tick" style="white-space:nowrap;"><span style="color:#94a3b8; font-size:11px;">📋 Grievances Open</span><br><strong id="kpi-grievances" style="color:#8b5cf6; font-size:18px;">7</strong></div>
              <div class="kpi-tick" style="white-space:nowrap;"><span style="color:#94a3b8; font-size:11px;">🕐 Last Sync</span><br><strong id="kpi-time" style="color:#64748b; font-size:18px;">--:--</strong></div>
            </div>
          </div>
        </div>

        <!-- 3-Column Layout: Zone Grid + Alerts + Activity -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">

          <!-- Zone Status Heatmap -->
          <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:20px;">
            <h3 style="margin:0 0 16px; color:#f8fafc; font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
              🗺️ Zone Fill-Level Heatmap
              <span style="margin-left:auto; font-size:11px; color:#64748b; font-weight:400;">8 zones monitored</span>
            </h3>
            <div id="zone-heatmap" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;"></div>
            <!-- Legend -->
            <div style="display:flex; gap:12px; margin-top:14px; flex-wrap:wrap;">
              <span style="font-size:11px; color:#34d399;">● Good (&lt;60%)</span>
              <span style="font-size:11px; color:#f59e0b;">● Warning (60-79%)</span>
              <span style="font-size:11px; color:#ef4444;">● Critical (80%+)</span>
            </div>
          </div>

          <!-- Emergency Alerts Panel -->
          <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(239,68,68,0.2); border-radius:16px; padding:20px;">
            <h3 style="margin:0 0 16px; color:#f8fafc; font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
              🚨 Active Emergency Alerts
              <span id="alert-count-badge" style="background:rgba(239,68,68,0.2); color:#f87171; border:1px solid rgba(239,68,68,0.3); border-radius:20px; padding:2px 8px; font-size:11px; margin-left:auto;">3 active</span>
            </h3>
            <div id="alert-list" style="display:flex; flex-direction:column; gap:10px; max-height:320px; overflow-y:auto;"></div>
            <button onclick="CommandCenter.clearAllAlerts()" style="margin-top:12px; width:100%; padding:8px; background:rgba(239,68,68,0.1); color:#f87171; border:1px solid rgba(239,68,68,0.25); border-radius:8px; font-size:12px; font-weight:700; cursor:pointer;">
              ✅ Mark All Resolved
            </button>
          </div>

        </div>

        <!-- Performance Leaderboard + Command Log -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">

          <!-- Ward Leaderboard -->
          <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:20px;">
            <h3 style="margin:0 0 16px; color:#f8fafc; font-size:16px; font-weight:700;">🏆 Ward Performance Leaderboard</h3>
            <div id="ward-leaderboard" style="display:flex; flex-direction:column; gap:8px;"></div>
          </div>

          <!-- Live Command Log -->
          <div style="background:rgba(10,14,26,0.95); border:1px solid rgba(16,185,129,0.15); border-radius:16px; padding:20px;">
            <h3 style="margin:0 0 16px; color:#f8fafc; font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
              ⚡ Live Command Log
              <span style="width:8px;height:8px;border-radius:50%;background:#10b981;display:inline-block;animation:pulseRed 1.2s infinite;margin-left:auto;"></span>
            </h3>
            <div id="command-log" style="max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:6px; font-family:'Courier New', monospace; font-size:12px;"></div>
          </div>

        </div>

      </div>
    `;
    this.renderZoneHeatmap();
    this.renderAlertList();
    this.renderLeaderboard();
    this.updateKPIs();
  },

  renderZoneHeatmap() {
    const container = document.getElementById('zone-heatmap');
    if (!container) return;
    container.innerHTML = this.cityZones.map(zone => {
      const color = zone.fillLevel >= 80 ? '#ef4444' : zone.fillLevel >= 60 ? '#f59e0b' : '#10b981';
      const bgColor = zone.fillLevel >= 80 ? 'rgba(239,68,68,0.1)' : zone.fillLevel >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)';
      const border = zone.fillLevel >= 80 ? 'rgba(239,68,68,0.3)' : zone.fillLevel >= 60 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.25)';
      return `
        <div style="background:${bgColor}; border:1px solid ${border}; border-radius:10px; padding:12px; cursor:pointer; transition:all 0.2s;" onclick="CommandCenter.showZoneDetail('${zone.id}')" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:12px; font-weight:700; color:#f8fafc;">${zone.name}</span>
            <span style="font-size:11px; color:${color}; font-weight:700;">${zone.fillLevel}%</span>
          </div>
          <div style="height:4px; background:rgba(255,255,255,0.08); border-radius:2px; overflow:hidden;">
            <div style="height:100%; width:${zone.fillLevel}%; background:${color}; border-radius:2px; transition:width 0.5s;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:6px;">
            <span style="font-size:10px; color:#64748b;">Ward ${zone.ward}</span>
            <span style="font-size:10px; color:#94a3b8;">🚛 ${zone.trucks} trucks</span>
          </div>
        </div>
      `;
    }).join('');
  },

  renderAlertList() {
    const container = document.getElementById('alert-list');
    if (!container) return;
    const typeIcons = { overflow: '🌊', illegal: '🚫', vehicle: '🔧', missed: '📍' };
    const severityColors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b' };
    container.innerHTML = this.emergencyAlerts.map(alert => `
      <div style="background:rgba(239,68,68,0.06); border:1px solid ${alert.resolved ? 'rgba(100,116,139,0.2)' : 'rgba(239,68,68,0.2)'}; border-radius:10px; padding:12px; opacity:${alert.resolved ? '0.5' : '1'};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              <span>${typeIcons[alert.type] || '⚠️'}</span>
              <span style="font-size:11px; color:${severityColors[alert.severity] || '#f59e0b'}; font-weight:800; text-transform:uppercase;">${alert.severity}</span>
              <span style="font-size:10px; color:#64748b;">• ${alert.time} • ${alert.zone}</span>
            </div>
            <p style="margin:0; font-size:12px; color:#cbd5e1; line-height:1.5;">${alert.msg}</p>
          </div>
          ${!alert.resolved ? `<button onclick="CommandCenter.resolveAlert('${alert.id}')" style="flex-shrink:0; background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.25); border-radius:6px; padding:4px 8px; font-size:10px; font-weight:700; cursor:pointer; white-space:nowrap;">✅ Resolve</button>` : '<span style="color:#34d399; font-size:10px;">✅ Done</span>'}
        </div>
      </div>
    `).join('');
  },

  renderLeaderboard() {
    const container = document.getElementById('ward-leaderboard');
    if (!container) return;
    const wards = [
      { name: 'Jayanagar (W155)',     score: 94, trend: '↑', grade: 'A+' },
      { name: 'Yelahanka (W006)',      score: 91, trend: '↑', grade: 'A+' },
      { name: 'Indiranagar (W074)',    score: 87, trend: '↑', grade: 'A'  },
      { name: 'HSR Layout (W149)',     score: 83, trend: '→', grade: 'A'  },
      { name: 'Koramangala (W068)',    score: 76, trend: '↓', grade: 'B+' },
      { name: 'Marathahalli (W088)',   score: 71, trend: '→', grade: 'B'  },
      { name: 'Electronic City (W191)',score: 68, trend: '↑', grade: 'B'  },
      { name: 'Whitefield (W084)',     score: 55, trend: '↓', grade: 'C'  }
    ];
    container.innerHTML = wards.map((w, i) => {
      const barColor = w.score >= 90 ? '#10b981' : w.score >= 75 ? '#f59e0b' : '#ef4444';
      const medals = ['🥇', '🥈', '🥉'];
      const medal = i < 3 ? medals[i] : `${i+1}.`;
      return `
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:14px; width:22px; text-align:center;">${medal}</span>
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
              <span style="font-size:12px; color:#cbd5e1; font-weight:600;">${w.name}</span>
              <span style="font-size:12px; font-weight:800; color:${barColor};">${w.score}% <span style="font-size:10px; color:#64748b;">${w.trend}</span></span>
            </div>
            <div style="height:4px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden;">
              <div style="height:100%; width:${w.score}%; background:${barColor}; border-radius:2px;"></div>
            </div>
          </div>
          <span style="font-size:11px; background:rgba(255,255,255,0.06); color:#94a3b8; padding:2px 6px; border-radius:4px; font-weight:700;">${w.grade}</span>
        </div>
      `;
    }).join('');
  },

  updateKPIs() {
    const now = new Date();
    const el = id => document.getElementById(id);
    if (el('kpi-time')) el('kpi-time').textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    // Slight random fluctuation for live feel
    if (el('kpi-trucks')) {
      const active = 16 + Math.floor(Math.random() * 5);
      el('kpi-trucks').textContent = `${active}/22`;
    }
    if (el('kpi-co2')) {
      const co2 = (1247 + Math.random() * 10).toFixed(0);
      el('kpi-co2').textContent = `${Number(co2).toLocaleString('en-IN')} kg`;
    }
    if (el('kpi-collected')) {
      const collected = (2847 + Math.random() * 3).toFixed(0);
      el('kpi-collected').textContent = `${Number(collected).toLocaleString('en-IN')} T`;
    }
  },

  startLiveFeed() {
    this.isLive = true;
    const logMsgs = [
      '🚛 Truck KA-01-AB-1234 → Koramangala pickup ✅',
      '📡 IoT Bin W068-B04: 89% full → Dispatch triggered',
      '🤖 RouteAgent: Optimized path via Sarjapur saves 12 km',
      '♻️ 340 kg plastic sorted → Recycling center batch confirmed',
      '💧 Moisture sensor W084-B12: Wet waste 94% → Overflow risk',
      '📋 Grievance #GRV-0041 resolved by Ward Officer Suresh K.',
      '🌿 Carbon credit: 0.34 tCO₂e calculated for today batch',
      '⚡ BillingAgent: ₹12,500 invoice auto-generated — Ramesh Enterprises',
      '🔧 Vehicle KA-01-EF-9012: PdM score 91% → Service in 18 days',
      '🏆 Ward 155 (Jayanagar): 94% collection target achieved!',
      '🚨 Geofence alert: Truck W3 exited Zone 3 boundary — rerouting',
      '📊 Weekly recycling trend: +3.2% vs last week',
      '🤖 AI Vision: 98.4% confidence — Wet Organic @ Ward 68 Station 3',
      '💰 Carbon credit price: ₹1,240/tCO₂e (+2.1% today)',
      '📡 SmartBin B-077: Battery 23% → Maintenance alert sent'
    ];
    let logIdx = 0;
    this.liveInterval = setInterval(() => {
      if (window.__ecoflowPaused) return;
      this.updateKPIs();
      // Add log entry
      const container = document.getElementById('command-log');
      if (container) {
        const msg = logMsgs[logIdx % logMsgs.length];
        const colors = ['#34d399', '#60a5fa', '#f59e0b', '#a78bfa', '#f87171'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        const entry = document.createElement('div');
        entry.style.cssText = `color:${color}; padding:3px 0; border-bottom:1px solid rgba(255,255,255,0.04);`;
        entry.innerHTML = `<span style="color:#475569; margin-right:8px;">${time}</span>${msg}`;
        container.prepend(entry);
        // Keep only 30 entries
        while (container.children.length > 30) container.removeChild(container.lastChild);
        logIdx++;
      }
      // Randomly update one zone fill level
      const zoneIdx = Math.floor(Math.random() * this.cityZones.length);
      this.cityZones[zoneIdx].fillLevel = Math.max(20, Math.min(99, this.cityZones[zoneIdx].fillLevel + (Math.random() > 0.5 ? 1 : -1)));
      this.renderZoneHeatmap();
    }, 2500);
  },

  stopLiveFeed() {
    this.isLive = false;
    clearInterval(this.liveInterval);
  },

  resolveAlert(alertId) {
    const alert = this.emergencyAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.renderAlertList();
      const badge = document.getElementById('alert-count-badge');
      const openAlerts = this.emergencyAlerts.filter(a => !a.resolved).length;
      if (badge) badge.textContent = `${openAlerts} active`;
      const kpiEl = document.getElementById('kpi-alerts');
      if (kpiEl) kpiEl.textContent = openAlerts;
      if (typeof Utils !== 'undefined') Utils.showToast(`✅ Alert ${alertId} resolved`, 'success');
    }
  },

  clearAllAlerts() {
    this.emergencyAlerts.forEach(a => a.resolved = true);
    this.renderAlertList();
    const badge = document.getElementById('alert-count-badge');
    if (badge) badge.textContent = '0 active';
    const kpiEl = document.getElementById('kpi-alerts');
    if (kpiEl) kpiEl.textContent = '0';
    if (typeof Utils !== 'undefined') Utils.showToast('✅ All alerts cleared', 'success');
  },

  showZoneDetail(zoneId) {
    const zone = this.cityZones.find(z => z.id === zoneId);
    if (!zone) return;
    const color = zone.fillLevel >= 80 ? '#ef4444' : zone.fillLevel >= 60 ? '#f59e0b' : '#10b981';
    Utils.showModal(`🗺️ ${zone.name} — Zone ${zoneId} Details`, `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:14px; text-align:center;">
            <div style="font-size:36px; font-weight:800; color:${color};">${zone.fillLevel}%</div>
            <div style="font-size:12px; color:#94a3b8;">Bin Fill Level</div>
          </div>
          <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:14px; text-align:center;">
            <div style="font-size:36px; font-weight:800; color:#60a5fa;">${zone.trucks}</div>
            <div style="font-size:12px; color:#94a3b8;">Active Trucks</div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:14px;">
          <div style="font-size:12px; color:#94a3b8; margin-bottom:8px;">Zone Status</div>
          <span style="background:${color}22; color:${color}; border:1px solid ${color}44; border-radius:8px; padding:4px 12px; font-size:13px; font-weight:700; text-transform:uppercase;">${zone.status}</span>
        </div>
        <div style="background:rgba(255,255,255,0.04); border-radius:10px; padding:14px;">
          <div style="font-size:12px; color:#94a3b8; margin-bottom:6px;">GPS Coordinates</div>
          <div style="font-size:13px; color:#f8fafc; font-family:monospace;">Lat: ${zone.lat}° N &nbsp;|&nbsp; Lng: ${zone.lng}° E</div>
        </div>
        <button onclick="CommandCenter.dispatchTruckToZone('${zone.id}')" class="btn btn-primary" style="width:100%; padding:12px; font-weight:700;">
          🚛 Dispatch Emergency Truck to ${zone.name}
        </button>
      </div>
    `);
  },

  dispatchTruckToZone(zoneId) {
    const zone = this.cityZones.find(z => z.id === zoneId);
    if (!zone) return;
    Utils.hideModal();
    setTimeout(() => {
      Utils.showToast(`🚛 Emergency truck dispatched to ${zone.name}!`, 'success');
      zone.fillLevel = Math.max(20, zone.fillLevel - 15);
      this.renderZoneHeatmap();
    }, 500);
  },

  dispatchEmergency() {
    Utils.showModal('🚨 Emergency Fleet Dispatch', `
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:10px; padding:14px;">
          <p style="color:#fca5a5; margin:0; font-size:13px; font-weight:600;">⚠️ This will activate emergency protocols for the selected zone. All available backup trucks will be re-routed.</p>
        </div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Select Zone</label>
          <select id="em-zone-select" style="width:100%; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:10px; border-radius:8px;">
            ${this.cityZones.map(z => `<option value="${z.id}">${z.name} — Ward ${z.ward} (${z.fillLevel}% full)</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Emergency Type</label>
          <select id="em-type-select" style="width:100%; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:10px; border-radius:8px;">
            <option value="overflow">🌊 Bin Overflow</option>
            <option value="illegal">🚫 Illegal Dumping</option>
            <option value="hazardous">☣️ Hazardous Waste</option>
            <option value="missed">📍 Missed Collection</option>
          </select>
        </div>
        <div>
          <label style="font-size:12px; color:#94a3b8; display:block; margin-bottom:6px;">Trucks to Dispatch</label>
          <input id="em-trucks-count" type="number" min="1" max="5" value="2" style="width:100%; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.1); color:#f8fafc; padding:10px; border-radius:8px; box-sizing:border-box;">
        </div>
        <button onclick="CommandCenter.confirmEmergencyDispatch()" class="btn btn-primary" style="width:100%; padding:12px; font-weight:700; background:linear-gradient(135deg,#ef4444,#dc2626); border:none; box-shadow:0 4px 15px rgba(239,68,68,0.4);">
          🚨 CONFIRM EMERGENCY DISPATCH
        </button>
      </div>
    `);
  },

  confirmEmergencyDispatch() {
    const zone = document.getElementById('em-zone-select')?.value;
    const type = document.getElementById('em-type-select')?.value;
    const trucks = document.getElementById('em-trucks-count')?.value || 2;
    const zoneObj = this.cityZones.find(z => z.id === zone);
    if (!zoneObj) return;
    Utils.hideModal();
    const alertId = 'A' + (100 + this.emergencyAlerts.length);
    const typeLabels = { overflow: 'Bin overflow', illegal: 'Illegal dumping', hazardous: 'Hazardous waste', missed: 'Missed collection' };
    this.emergencyAlerts.unshift({
      id: alertId, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      zone: zoneObj.name, type, msg: `${typeLabels[type]} response — ${trucks} trucks dispatched to ${zoneObj.name} (Ward ${zoneObj.ward}).`, severity: 'high', resolved: false
    });
    this.renderAlertList();
    setTimeout(() => Utils.showToast(`🚨 ${trucks} emergency trucks dispatched to ${zoneObj.name}!`, 'error'), 400);
  },

  exportSitRep() {
    const now = new Date();
    const openAlerts = this.emergencyAlerts.filter(a => !a.resolved).length;
    const zoneReport = this.cityZones.map(z => `  ${z.name} (Ward ${z.ward}): ${z.fillLevel}% full — ${z.status.toUpperCase()}`).join('\n');
    const report = `ECOFLOW CITY SITUATION REPORT
Generated: ${now.toLocaleString('en-IN')}
==================================

OPERATIONAL STATUS: ${openAlerts > 0 ? 'ALERT' : 'NORMAL'}
Active Alerts: ${openAlerts}
Trucks Deployed: 18/22
Collection Rate: 67.3% (↑4.2%)
CO₂ Offset Today: 1,247 kg

ZONE STATUS:
${zoneReport}

PRIORITY ACTIONS:
1. Whitefield Zone — Overflow risk, 2 trucks en route
2. Koramangala — Illegal dumping report filed
3. Electronic City — Route optimization applied

Generated by EcoFlow Command Center v3.0`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sitrep-${now.toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.showToast('📄 Situation Report downloaded!', 'success');
  }
};

window.CommandCenter = CommandCenter;
