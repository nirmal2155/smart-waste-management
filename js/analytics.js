class AnalyticsModule {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    if (this.container) {
      this.init();
    }
  }

  init() {
    this.container.innerHTML = `
      <div class="analytics-dashboard">
        <div class="impact-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <!-- Rendered by JS -->
        </div>

        <div class="charts-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div class="chart-box" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
            <h3>Waste Collection Trends (Last 12 Months)</h3>
            <canvas id="wasteTrendsChart" width="400" height="250" style="width:100%;"></canvas>
          </div>
          <div class="chart-box" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
            <h3>Zone Performance Comparison</h3>
            <canvas id="zonePerformanceChart" width="400" height="250" style="width:100%;"></canvas>
          </div>
          <div class="chart-box" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
            <h3>Monthly Volume</h3>
            <canvas id="monthlyVolumeChart" width="400" height="250" style="width:100%;"></canvas>
          </div>
          <div class="chart-box" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
            <h3>Recycling Categories</h3>
            <canvas id="recyclingCategoryChart" width="400" height="250" style="width:100%;"></canvas>
          </div>
        </div>

        <div class="swachh-leaderboard" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15)); border: 1px solid rgba(16, 185, 129, 0.3); padding: 20px; border-radius: 12px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
            <div>
              <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">🇮🇳 Swachh Bharat Mission 2.0</span>
              <h3 style="margin: 8px 0 4px 0; font-size: 20px; color: #f8fafc; font-family: 'Outfit', sans-serif;">Municipal Ward Cleanliness Leaderboard (Bangalore BBMP)</h3>
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">Real-time ranking evaluated on Segregation, Door-to-Door Efficiency, and Composting Index.</p>
            </div>
            <div style="display: flex; gap: 15px; text-align: center;">
              <div style="background: rgba(15,23,42,0.6); padding: 10px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 22px; font-weight: bold; color: #10b981;">🥇 Ward 174</div>
                <div style="font-size: 11px; color: #94a3b8;">#1 Rank: HSR Layout</div>
              </div>
              <div style="background: rgba(15,23,42,0.6); padding: 10px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-size: 22px; font-weight: bold; color: #3b82f6;">⭐ 4.8 / 5.0</div>
                <div style="font-size: 11px; color: #94a3b8;">City Cleanliness Score</div>
              </div>
            </div>
          </div>
        </div>

        <div class="actions-bar" style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 20px;">
          <button class="primary-btn" id="export-csv-btn" style="background: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Export CSV</button>
          <button class="primary-btn" id="export-pdf-btn" style="background: #F44336; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Export PDF Report</button>
        </div>

        <div class="table-container" style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; overflow-x: auto;">
          <h3>Ward Performance Report</h3>
          <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 15px;">
            <thead>
              <tr style="border-bottom: 2px solid rgba(255,255,255,0.1);">
                <th style="padding: 10px;">Ward Name</th>
                <th style="padding: 10px;">Total Collections (Tons)</th>
                <th style="padding: 10px;">Recycling Rate</th>
                <th style="padding: 10px;">Efficiency Score</th>
                <th style="padding: 10px;">Status</th>
              </tr>
            </thead>
            <tbody id="ward-table-body">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    document.getElementById('export-csv-btn')?.addEventListener('click', () => this.exportCSV());
    document.getElementById('export-pdf-btn')?.addEventListener('click', () => this.exportPDF());
  }

  render() {
    this.renderEnvironmentalImpact();
    
    // Add small delay to ensure canvas elements are sized
    setTimeout(() => {
      this.drawWasteTrendsChart('wasteTrendsChart');
      this.drawZonePerformanceChart('zonePerformanceChart');
      this.drawMonthlyVolumeChart('monthlyVolumeChart');
      this.drawRecyclingCategoryChart('recyclingCategoryChart');
    }, 100);

    this.renderWardTable();
  }

  renderEnvironmentalImpact() {
    const cards = [
      { title: 'CO₂ Reduced', value: 1247, suffix: ' tons', color: '#4CAF50', icon: '☁️' },
      { title: 'Landfill Diverted', value: 73.2, suffix: '%', color: '#8BC34A', icon: '♻️' },
      { title: 'Trees Saved', value: 3420, suffix: '', color: '#388E3C', icon: '🌳' },
      { title: 'CAR Carbon Credits', value: 1845, suffix: ' tCO₂e', color: '#10b981', icon: '📜' }
    ];

    const container = this.container.querySelector('.impact-cards');
    let html = '';

    cards.forEach(card => {
      html += `
        <div style="background: rgba(255,255,255,0.05); padding: 25px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid ${card.color};">
          <div>
            <h4 style="margin: 0 0 10px 0; color: #aaa; font-weight: normal;">${card.title}</h4>
            <h2 style="margin: 0; font-size: 32px; font-weight: bold; color: ${card.color};">
              <span class="counter" data-target="${card.value}">0</span>${card.suffix}
            </h2>
          </div>
          <div style="font-size: 40px; opacity: 0.8;">${card.icon}</div>
        </div>
      `;
    });

    container.innerHTML = html;
    this.animateCounters();
  }

  animateCounters() {
    const counters = this.container.querySelectorAll('.counter');
    const speed = 200; // lower is slower

    counters.forEach(counter => {
      const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const inc = target / speed;

        if (count < target) {
          counter.innerText = (count + inc).toFixed(target % 1 !== 0 ? 1 : 0);
          setTimeout(updateCount, 1);
        } else {
          counter.innerText = target;
        }
      };
      updateCount();
    });
  }

  // Simplified Canvas Chart Utilities
  drawWasteTrendsChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0,0,width,height);

    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, height - 20);
    
    for(let i=1; i<12; i++) {
      ctx.lineTo(20 + (i * (width/12)), height - 20 - (Math.random() * 100 + 50));
    }
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText('Line Chart: 6 waste types (Simplified mock)', 50, 50);
  }

  drawZonePerformanceChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const zones = ['Koramangala', 'Indiranagar', 'HSR', 'JP Nagar', 'Whitefield'];
    const values = [85, 70, 95, 60, 80];
    
    ctx.fillStyle = '#2196F3';
    zones.forEach((zone, i) => {
      const y = 30 + (i * 40);
      const barWidth = values[i] * 2;
      ctx.fillRect(100, y, barWidth, 20);
      
      ctx.fillStyle = '#fff';
      ctx.fillText(zone, 10, y + 15);
      ctx.fillStyle = '#2196F3';
    });
  }

  drawMonthlyVolumeChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#FFC107';
    for(let i=0; i<6; i++) {
      const h = Math.random() * 150 + 50;
      ctx.fillRect(30 + (i*60), canvas.height - h - 20, 40, h);
      ctx.fillStyle = '#fff';
      ctx.fillText(`M${i+1}`, 40 + (i*60), canvas.height - 5);
      ctx.fillStyle = '#FFC107';
    }
  }

  drawRecyclingCategoryChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#9C27B0';
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 80, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('Pie/Donut mock', canvas.width/2 - 40, canvas.height/2);
  }

  renderWardTable() {
    const wards = [
      { name: 'Ward 150 - Bellandur', collections: 1245.5, rate: 68.4, score: 92, status: 'excellent' },
      { name: 'Ward 174 - HSR Layout', collections: 980.2, rate: 75.1, score: 88, status: 'excellent' },
      { name: 'Ward 149 - Varthur', collections: 1450.8, rate: 45.2, score: 65, status: 'amber' },
      { name: 'Ward 177 - JP Nagar', collections: 850.4, rate: 62.5, score: 78, status: 'good' },
      { name: 'Ward 111 - Shantala Nagar', collections: 2100.0, rate: 32.1, score: 45, status: 'red' }
    ];

    const tbody = document.getElementById('ward-table-body');
    if (!tbody) return;

    let html = '';
    wards.forEach(w => {
      let color = w.status === 'excellent' ? '#4CAF50' : (w.status === 'amber' || w.status === 'good' ? '#FFC107' : '#F44336');
      html += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 15px 10px;">${w.name}</td>
          <td style="padding: 15px 10px;">${w.collections}</td>
          <td style="padding: 15px 10px;">${w.rate}%</td>
          <td style="padding: 15px 10px;">${w.score}/100</td>
          <td style="padding: 15px 10px;">
            <span style="background: ${color}22; color: ${color}; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">
              ${w.status}
            </span>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  exportCSV() {
    const csvContent = "data:text/csv;charset=utf-8,Ward,Collections,Rate,Score\nBellandur,1245.5,68.4,92\nHSR,980.2,75.1,88";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ecoflow_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportPDF() {
    alert('Simulating PDF export by capturing canvas elements and tables.');
    // In a real scenario, this would use jsPDF + html2canvas
    window.print(); 
  }
}

// Global attachment
window.AnalyticsModule = AnalyticsModule;
