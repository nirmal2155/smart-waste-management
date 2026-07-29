const DashboardData = {
  stats: {
    wasteCollected: { value: 2847, unit: 'tons', trend: 12.5, trendDir: 'up' },
    recyclingRate: { value: 67.3, unit: '%', trend: 4.2, trendDir: 'up' },
    activeRoutes: { value: 24, total: 30 },
    revenue: { value: 1840000, trend: 8.7, trendDir: 'up' }
  },
  wasteComposition: [
    { type: 'Organic/Wet', value: 45, color: '#10b981' },
    { type: 'Plastic', value: 18, color: '#f59e0b' },
    { type: 'Paper', value: 14, color: '#b45309' },
    { type: 'Metal', value: 8, color: '#94a3b8' },
    { type: 'Glass', value: 7, color: '#3b82f6' },
    { type: 'E-waste', value: 5, color: '#ef4444' },
    { type: 'Other', value: 3, color: '#8b5cf6' }
  ],
  weeklyCollection: [
    { day: 'Mon', value: 420 },
    { day: 'Tue', value: 380 },
    { day: 'Wed', value: 450 },
    { day: 'Thu', value: 410 },
    { day: 'Fri', value: 470 },
    { day: 'Sat', value: 350 },
    { day: 'Sun', value: 290 }
  ],
  recyclingTrend: [
    { month: 'Jan', value: 58 },
    { month: 'Feb', value: 60 },
    { month: 'Mar', value: 59 },
    { month: 'Apr', value: 62 },
    { month: 'May', value: 61 },
    { month: 'Jun', value: 64 },
    { month: 'Jul', value: 63 },
    { month: 'Aug', value: 65 },
    { month: 'Sep', value: 64 },
    { month: 'Oct', value: 66 },
    { month: 'Nov', value: 65 },
    { month: 'Dec', value: 67.3 }
  ],
  environmentalImpact: {
    co2Reduced: 1247,
    treeSaved: 3420,
    waterConserved: 89500
  },
  recentActivity: [
    { icon: '🚛', text: 'Route A-12 completed collection in Koramangala', time: '10 min ago', type: 'success' },
    { icon: '💰', text: '₹25,000 payment received from Rajesh Enterprises', time: '25 min ago', type: 'info' },
    { icon: '⚠️', text: 'Vehicle KA-01-CD-5678 fuel level low', time: '45 min ago', type: 'warning' },
    { icon: '♻️', text: '2.5 tons of plastic sent to recycling center', time: '1 hour ago', type: 'success' },
    { icon: '📋', text: 'New customer registration: Priya Sharma, HSR Layout', time: '2 hours ago', type: 'info' },
    { icon: '🔧', text: 'Vehicle KA-01-EF-9012 maintenance completed', time: '3 hours ago', type: 'success' },
    { icon: '🚨', text: 'Missed collection reported in Indiranagar Ward 74', time: '4 hours ago', type: 'error' }
  ]
};

const Dashboard = {
  charts: {},
  canvasCache: {},

  predictionEngine: {
    // Simple linear regression for trend prediction
    predict(dataPoints, futureSteps = 7) {
      const n = dataPoints.length;
      if (n < 2) return dataPoints;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (let i = 0; i < n; i++) {
        sumX += i; sumY += dataPoints[i];
        sumXY += i * dataPoints[i]; sumX2 += i * i;
      }
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      const predictions = [];
      for (let i = 0; i < futureSteps; i++) {
        predictions.push(Math.round(Math.max(0, slope * (n + i) + intercept)));
      }
      return predictions;
    }
  },

  init() {
    this.animateCounters();
    this.drawWasteComposition();
    this.drawWeeklyCollection();
    this.drawRecyclingTrend();
    this.renderActivityFeed();
    this.animateEnvironmentalImpact();

    window.addEventListener('resize', this.debounce(() => this.redrawCharts(), 250));
    
    // Auto-refresh simulation
    setInterval(() => this.simulateDataUpdate(), 30000);
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  formatIndianNumber(num, isCurrency = false) {
    if (isNaN(num)) return num;
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 1
    }).format(num);
    return isCurrency ? `₹${formatted}` : formatted;
  },

  easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  },

  animateCounters() {
    const counters = document.querySelectorAll('.counter-value, [data-counter-target]');
    counters.forEach(counter => {
      const targetStr = counter.getAttribute('data-counter-target') || counter.getAttribute('data-target');
      if (!targetStr) return;
      
      const target = parseFloat(targetStr);
      if (isNaN(target)) return; // Skip non-numeric data-target attributes like page IDs
      const isCurrency = counter.hasAttribute('data-currency');
      const isPercent = counter.hasAttribute('data-percent');
      
      const duration = 2000;
      let start = null;
      
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const easedProgress = this.easeOutCubic(progress);
        
        let currentVal = target * easedProgress;
        
        // Formatting
        let displayVal = this.formatIndianNumber(currentVal, isCurrency);
        if (isPercent) displayVal += '%';
        
        counter.textContent = displayVal;
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          counter.textContent = isCurrency ? `₹${this.formatIndianNumber(target)}` : 
                                (isPercent ? `${target}%` : this.formatIndianNumber(target));
        }
      };
      
      window.requestAnimationFrame(step);
    });

    // Calculate Efficiency Score
    const routeCompletion = 87; // From route data
    const recyclingRate = 64; // From analytics
    const vehicleUtil = 78; // From fleet data
    const efficiencyScore = Math.round((routeCompletion * 0.4 + recyclingRate * 0.3 + vehicleUtil * 0.3));
    const effScoreEl = document.getElementById('efficiency-score');
    if (effScoreEl) effScoreEl.textContent = efficiencyScore + '%';
    
    // Smart Alerts — check for anomalies
    const metrics = [
      { name: 'Daily Collections', current: parseInt(document.getElementById('total-collections')?.textContent?.replace(/,/g,'') || '0'), avg: 2500 },
      { name: 'Active Vehicles', current: parseInt(document.getElementById('active-vehicles')?.textContent || '0'), avg: 42 },
      { name: 'Recycling Rate', current: parseFloat(document.getElementById('recycling-rate')?.textContent || '0'), avg: 60 }
    ];
    metrics.forEach(m => {
      if (m.current > 0 && Math.abs(m.current - m.avg) / m.avg > 0.15) {
        const direction = m.current > m.avg ? '⬆️ up' : '⬇️ down';
        const pct = Math.round(Math.abs(m.current - m.avg) / m.avg * 100);
        console.log(`⚠️ Smart Alert: ${m.name} is ${pct}% ${direction} from average (${m.current} vs avg ${m.avg})`);
      }
    });
  },

  setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Normalize coordinate system to use css pixels
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    return { canvas, ctx, width: rect.width, height: rect.height };
  },

  drawWasteComposition() {
    this.drawDonutChart('wasteCompositionChart', DashboardData.wasteComposition);
  },

  drawDonutChart(canvasId, data) {
    const setup = this.setupCanvas(canvasId);
    if (!setup) return;
    const { canvas, ctx, width, height } = setup;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    const innerRadius = radius * 0.6;
    
    let total = data.reduce((acc, curr) => acc + curr.value, 0);
    
    let startAngle = -Math.PI / 2;
    const duration = 1500;
    let startTime = null;

    const render = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = this.easeOutCubic(progress);
      
      ctx.clearRect(0, 0, width, height);
      
      let currentAngle = -Math.PI / 2;
      
      data.forEach((item) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI * easedProgress;
        const endAngle = currentAngle + sliceAngle;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, currentAngle, true);
        ctx.closePath();
        
        ctx.fillStyle = item.color;
        ctx.fill();
        
        // Add subtle border between slices
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary') || '#111827';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        currentAngle += sliceAngle;
      });
      
      // Draw center text
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary') || '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.formatIndianNumber(DashboardData.stats.wasteCollected.value), centerX, centerY - 10);
      
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary') || '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.fillText('tons', centerX, centerY + 15);
      
      if (progress < 1) {
        window.requestAnimationFrame(render);
      } else {
        // Setup hover interactions after animation completes
        this.charts[canvasId] = { data, total, centerX, centerY, radius, innerRadius };
        this.setupDonutHover(canvas, ctx, canvasId, width, height);
      }
    };
    
    window.requestAnimationFrame(render);
    
    // Render Legend
    this.renderDonutLegend(canvasId, data);
  },

  setupDonutHover(canvas, ctx, canvasId, width, height) {
    let hoveredIndex = -1;
    
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const { data, total, centerX, centerY, radius, innerRadius } = this.charts[canvasId];
      
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      let newHoveredIndex = -1;
      
      if (dist >= innerRadius && dist <= radius) {
        let angle = Math.atan2(dy, dx);
        if (angle < -Math.PI / 2) angle += 2 * Math.PI;
        
        let currentAngle = -Math.PI / 2;
        for (let i = 0; i < data.length; i++) {
          const sliceAngle = (data[i].value / total) * 2 * Math.PI;
          const endAngle = currentAngle + sliceAngle;
          
          if (angle >= currentAngle && angle <= endAngle) {
            newHoveredIndex = i;
            break;
          }
          currentAngle += sliceAngle;
        }
      }
      
      if (hoveredIndex !== newHoveredIndex) {
        hoveredIndex = newHoveredIndex;
        
        ctx.clearRect(0, 0, width, height);
        let currentAngle = -Math.PI / 2;
        
        data.forEach((item, i) => {
          const sliceAngle = (item.value / total) * 2 * Math.PI;
          const endAngle = currentAngle + sliceAngle;
          
          const isHovered = i === hoveredIndex;
          const r = isHovered ? radius * 1.05 : radius;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, currentAngle, endAngle);
          ctx.arc(centerX, centerY, innerRadius, endAngle, currentAngle, true);
          ctx.closePath();
          
          ctx.fillStyle = item.color;
          ctx.fill();
          
          ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary') || '#111827';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          currentAngle += sliceAngle;
        });
        
        // Draw center text again
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary') || '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (hoveredIndex > -1) {
          ctx.fillText(`${data[hoveredIndex].value}%`, centerX, centerY - 10);
          ctx.fillStyle = data[hoveredIndex].color;
          ctx.font = '14px sans-serif';
          ctx.fillText(data[hoveredIndex].type, centerX, centerY + 15);
        } else {
          ctx.fillText(this.formatIndianNumber(DashboardData.stats.wasteCollected.value), centerX, centerY - 10);
          ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary') || '#9ca3af';
          ctx.font = '14px sans-serif';
          ctx.fillText('tons', centerX, centerY + 15);
        }
      }
    });
    
    canvas.addEventListener('mouseleave', () => {
       if (hoveredIndex !== -1) {
           canvas.dispatchEvent(new MouseEvent('mousemove', {
               clientX: 0,
               clientY: 0
           }));
       }
    });
  },

  renderDonutLegend(canvasId, data) {
    const legendContainerId = `${canvasId}-legend`;
    const legendContainer = document.getElementById(legendContainerId);
    if (!legendContainer) return;
    
    legendContainer.innerHTML = '';
    legendContainer.style.display = 'flex';
    legendContainer.style.flexWrap = 'wrap';
    legendContainer.style.gap = '12px';
    legendContainer.style.justifyContent = 'center';
    legendContainer.style.marginTop = '16px';
    
    data.forEach(item => {
      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.fontSize = '12px';
      el.style.color = 'var(--text-secondary, #9ca3af)';
      
      const dot = document.createElement('div');
      dot.style.width = '10px';
      dot.style.height = '10px';
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = item.color;
      dot.style.marginRight = '6px';
      
      el.appendChild(dot);
      el.appendChild(document.createTextNode(`${item.type} (${item.value}%)`));
      legendContainer.appendChild(el);
    });
  },

  drawWeeklyCollection() {
    this.drawBarChart('weeklyCollectionChart', DashboardData.weeklyCollection);
  },

  drawBarChart(canvasId, data) {
    const setup = this.setupCanvas(canvasId);
    if (!setup) return;
    const { canvas, ctx, width, height } = setup;
    
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const maxValue = Math.max(...data.map(d => d.value)) * 1.1; // 10% headroom
    const barWidth = chartWidth / data.length * 0.6; // 60% of available space
    const gap = chartWidth / data.length * 0.4;
    
    const duration = 1200;
    let startTime = null;

    const render = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = this.easeOutCubic(progress);
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw Grid & Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      // Y-axis grid lines & labels
      ctx.fillStyle = 'var(--text-secondary, #9ca3af)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      const ySteps = 4;
      for (let i = 0; i <= ySteps; i++) {
        const yValue = (maxValue / ySteps) * i;
        const y = height - padding.bottom - (yValue / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.moveTo(padding.left - 5, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        
        ctx.fillText(Math.round(yValue), padding.left - 10, y);
      }
      
      // X-axis labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      data.forEach((item, i) => {
        const x = padding.left + (gap / 2) + i * (barWidth + gap);
        
        // Draw Label
        ctx.fillText(item.day, x + barWidth / 2, height - padding.bottom + 10);
        
        // Draw Bar
        const barHeight = (item.value / maxValue) * chartHeight * easedProgress;
        const y = height - padding.bottom - barHeight;
        
        // Emerald gradient
        const gradient = ctx.createLinearGradient(0, y, 0, height - padding.bottom);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.3)');
        
        ctx.fillStyle = gradient;
        
        // Draw rounded rect
        const radius = Math.min(barWidth / 2, barHeight);
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, height - padding.bottom);
        ctx.lineTo(x + barWidth, height - padding.bottom);
        ctx.lineTo(x + barWidth, y + radius);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.quadraticCurveTo(x, y, x, y + radius);
        ctx.closePath();
        ctx.fill();
      });
      
      if (progress < 1) {
        window.requestAnimationFrame(render);
      } else {
          this.charts[canvasId] = { data, padding, chartWidth, chartHeight, maxValue, barWidth, gap };
          this.setupBarHover(canvas, ctx, canvasId, width, height);
      }
    };
    
    window.requestAnimationFrame(render);
  },
  
  setupBarHover(canvas, ctx, canvasId, width, height) {
      let hoveredIndex = -1;
      
      canvas.addEventListener('mousemove', (e) => {
          const rect = canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          
          const { data, padding, chartHeight, maxValue, barWidth, gap } = this.charts[canvasId];
          
          let newHoveredIndex = -1;
          
          data.forEach((item, i) => {
              const x = padding.left + (gap / 2) + i * (barWidth + gap);
              const barHeight = (item.value / maxValue) * chartHeight;
              const y = height - padding.bottom - barHeight;
              
              if (mouseX >= x && mouseX <= x + barWidth && mouseY >= y && mouseY <= height - padding.bottom) {
                  newHoveredIndex = i;
              }
          });
          
          if (newHoveredIndex !== hoveredIndex) {
              hoveredIndex = newHoveredIndex;
              this.redrawBarChartStatic(canvas, ctx, canvasId, width, height, hoveredIndex);
          }
      });
      
      canvas.addEventListener('mouseleave', () => {
          if (hoveredIndex !== -1) {
              hoveredIndex = -1;
              this.redrawBarChartStatic(canvas, ctx, canvasId, width, height, -1);
          }
      });
  },
  
  redrawBarChartStatic(canvas, ctx, canvasId, width, height, hoveredIndex) {
      const { data, padding, chartHeight, maxValue, barWidth, gap } = this.charts[canvasId];
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw Grid & Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      ctx.fillStyle = 'var(--text-secondary, #9ca3af)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      const ySteps = 4;
      for (let i = 0; i <= ySteps; i++) {
        const yValue = (maxValue / ySteps) * i;
        const y = height - padding.bottom - (yValue / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.moveTo(padding.left - 5, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        
        ctx.fillText(Math.round(yValue), padding.left - 10, y);
      }
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      data.forEach((item, i) => {
        const x = padding.left + (gap / 2) + i * (barWidth + gap);
        
        ctx.fillStyle = 'var(--text-secondary, #9ca3af)';
        ctx.fillText(item.day, x + barWidth / 2, height - padding.bottom + 10);
        
        const barHeight = (item.value / maxValue) * chartHeight;
        const y = height - padding.bottom - barHeight;
        
        const gradient = ctx.createLinearGradient(0, y, 0, height - padding.bottom);
        if (i === hoveredIndex) {
             gradient.addColorStop(0, '#34d399'); // Lighter emerald on hover
             gradient.addColorStop(1, 'rgba(52, 211, 153, 0.5)');
        } else {
             gradient.addColorStop(0, '#10b981');
             gradient.addColorStop(1, 'rgba(16, 185, 129, 0.3)');
        }
        
        ctx.fillStyle = gradient;
        
        const radius = Math.min(barWidth / 2, barHeight);
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, height - padding.bottom);
        ctx.lineTo(x + barWidth, height - padding.bottom);
        ctx.lineTo(x + barWidth, y + radius);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.quadraticCurveTo(x, y, x, y + radius);
        ctx.closePath();
        ctx.fill();
        
        if (i === hoveredIndex) {
             // Draw tooltip
             ctx.fillStyle = 'rgba(17, 24, 39, 0.9)'; // Dark bg
             ctx.beginPath();
             ctx.roundRect(x + barWidth / 2 - 25, y - 35, 50, 25, 4);
             ctx.fill();
             ctx.fillStyle = '#fff';
             ctx.font = '12px sans-serif';
             ctx.textBaseline = 'middle';
             ctx.fillText(item.value, x + barWidth / 2, y - 22);
        }
      });
  },

  drawRecyclingTrend() {
    this.drawLineChart('recyclingTrendChart', DashboardData.recyclingTrend);
  },

  drawLineChart(canvasId, data) {
    const setup = this.setupCanvas(canvasId);
    if (!setup) return;
    const { canvas, ctx, width, height } = setup;
    
    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const minVal = 55; // Fixed Y axis minimum
    const maxVal = 70; // Fixed Y axis maximum
    const yRange = maxVal - minVal;
    
    const duration = 1500;
    let startTime = null;
    
    // Calculate points
    const points = data.map((item, i) => {
        return {
            x: padding.left + (i / (data.length - 1)) * chartWidth,
            y: height - padding.bottom - ((item.value - minVal) / yRange) * chartHeight,
            value: item.value,
            month: item.month
        };
    });

    const render = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = this.easeOutCubic(progress);
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw Grid & Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]); // Dashed grid lines
      
      // Y-axis
      ctx.fillStyle = 'var(--text-secondary, #9ca3af)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      const ySteps = 3;
      for (let i = 0; i <= ySteps; i++) {
        const yValue = minVal + (yRange / ySteps) * i;
        const y = height - padding.bottom - ((yValue - minVal) / yRange) * chartHeight;
        
        ctx.beginPath();
        ctx.moveTo(padding.left - 5, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        
        ctx.fillText(`${yValue}%`, padding.left - 10, y);
      }
      
      ctx.setLineDash([]); // Reset dash for drawing paths
      
      // X-axis labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      points.forEach((p, i) => {
          if (i % 2 === 0) { // Show every other label to avoid crowding
              ctx.fillText(p.month, p.x, height - padding.bottom + 10);
          }
      });
      
      // Determine how many points to draw based on progress
      const currentPoints = Math.max(2, Math.floor(points.length * easedProgress));
      
      if (currentPoints > 0) {
          // Draw area fill
          ctx.beginPath();
          ctx.moveTo(points[0].x, height - padding.bottom);
          
          ctx.lineTo(points[0].x, points[0].y);
          
          for (let i = 0; i < currentPoints - 1; i++) {
              const p0 = points[i];
              const p1 = points[i + 1];
              const xc = (p0.x + p1.x) / 2;
              const yc = (p0.y + p1.y) / 2;
              
              if (i === 0) {
                   ctx.quadraticCurveTo(p0.x, p0.y, xc, yc);
              } else {
                   ctx.quadraticCurveTo(p0.x, p0.y, xc, yc);
              }
          }
          
          if (currentPoints > 1) {
              const pLast = points[currentPoints - 1];
              const pPrev = points[currentPoints - 2];
              ctx.quadraticCurveTo(pPrev.x, pPrev.y, pLast.x, pLast.y);
          }
          
          const lastX = points[currentPoints - 1].x;
          ctx.lineTo(lastX, height - padding.bottom);
          ctx.closePath();
          
          const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Draw Line
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 0; i < currentPoints - 1; i++) {
              const p0 = points[i];
              const p1 = points[i + 1];
              const xc = (p0.x + p1.x) / 2;
              const yc = (p0.y + p1.y) / 2;
              
              if (i === 0) {
                   ctx.quadraticCurveTo(p0.x, p0.y, xc, yc);
              } else {
                   ctx.quadraticCurveTo(p0.x, p0.y, xc, yc);
              }
          }
          if (currentPoints > 1) {
              const pLast = points[currentPoints - 1];
              const pPrev = points[currentPoints - 2];
              ctx.quadraticCurveTo(pPrev.x, pPrev.y, pLast.x, pLast.y);
          }
          
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Draw points
          ctx.fillStyle = '#111827';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          
          for (let i = 0; i < currentPoints; i++) {
              ctx.beginPath();
              ctx.arc(points[i].x, points[i].y, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
          }
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(render);
      } else {
          this.charts[canvasId] = { points, padding, minVal, maxVal, yRange, chartHeight };
          this.setupLineHover(canvas, ctx, canvasId, width, height);
      }
    };
    
    window.requestAnimationFrame(render);
  },

  setupLineHover(canvas, ctx, canvasId, width, height) {
      let hoveredIndex = -1;
      
      canvas.addEventListener('mousemove', (e) => {
          const rect = canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          
          const { points } = this.charts[canvasId];
          
          let newHoveredIndex = -1;
          let minDistance = Infinity;
          
          points.forEach((p, i) => {
              const distance = Math.abs(p.x - mouseX);
              if (distance < 20 && distance < minDistance) {
                  minDistance = distance;
                  newHoveredIndex = i;
              }
          });
          
          if (newHoveredIndex !== hoveredIndex) {
              hoveredIndex = newHoveredIndex;
              this.redrawLineChartStatic(canvas, ctx, canvasId, width, height, hoveredIndex);
          }
      });
      
      canvas.addEventListener('mouseleave', () => {
          if (hoveredIndex !== -1) {
              hoveredIndex = -1;
              this.redrawLineChartStatic(canvas, ctx, canvasId, width, height, -1);
          }
      });
  },

  redrawLineChartStatic(canvas, ctx, canvasId, width, height, hoveredIndex) {
      const { points, padding, minVal, yRange, chartHeight } = this.charts[canvasId];
      
      ctx.clearRect(0, 0, width, height);
      
      // Grid & Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      
      ctx.fillStyle = 'var(--text-secondary, #9ca3af)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      const ySteps = 3;
      for (let i = 0; i <= ySteps; i++) {
        const yValue = minVal + (yRange / ySteps) * i;
        const y = height - padding.bottom - ((yValue - minVal) / yRange) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding.left - 5, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        ctx.fillText(`${yValue}%`, padding.left - 10, y);
      }
      
      ctx.setLineDash([]);
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      points.forEach((p, i) => {
          if (i % 2 === 0) {
              ctx.fillText(p.month, p.x, height - padding.bottom + 10);
          }
      });
      
      // Fill
      ctx.beginPath();
      ctx.moveTo(points[0].x, height - padding.bottom);
      ctx.lineTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i+1].x) / 2;
          const yc = (points[i].y + points[i+1].y) / 2;
          if (i === 0) ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
          else ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.quadraticCurveTo(points[points.length-2].x, points[points.length-2].y, points[points.length-1].x, points[points.length-1].y);
      ctx.lineTo(points[points.length-1].x, height - padding.bottom);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i+1].x) / 2;
          const yc = (points[i].y + points[i+1].y) / 2;
          if (i === 0) ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
          else ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.quadraticCurveTo(points[points.length-2].x, points[points.length-2].y, points[points.length-1].x, points[points.length-1].y);
      
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Points & Hover Effect
      for (let i = 0; i < points.length; i++) {
          const isHovered = i === hoveredIndex;
          
          if (isHovered) {
              // Vertical line for hovered point
              ctx.beginPath();
              ctx.moveTo(points[i].x, padding.top);
              ctx.lineTo(points[i].x, height - padding.bottom);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
              ctx.lineWidth = 1;
              ctx.stroke();
          }
          
          ctx.beginPath();
          ctx.arc(points[i].x, points[i].y, isHovered ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = isHovered ? '#10b981' : '#111827';
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          if (isHovered) {
              // Tooltip
              ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
              ctx.beginPath();
              ctx.roundRect(points[i].x - 30, points[i].y - 40, 60, 25, 4);
              ctx.fill();
              
              ctx.fillStyle = '#fff';
              ctx.font = 'bold 12px sans-serif';
              ctx.textBaseline = 'middle';
              ctx.textAlign = 'center';
              ctx.fillText(`${points[i].value}%`, points[i].x, points[i].y - 27);
          }
      }
  },

  renderActivityFeed() {
    const feedContainer = document.getElementById('activityFeed');
    if (!feedContainer) return;
    
    feedContainer.innerHTML = '';
    
    DashboardData.recentActivity.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = `activity-item flex items-start gap-4 p-3 rounded-lg bg-white/5 border border-white/5 mb-3 translate-y-4 opacity-0 transition-all duration-500 ease-out`;
      el.style.transitionDelay = `${index * 100}ms`;
      
      // Map colors
      let colorClass = 'text-gray-400';
      let bgClass = 'bg-gray-800';
      if (item.type === 'success') { colorClass = 'text-emerald-400'; bgClass = 'bg-emerald-400/10'; }
      if (item.type === 'info') { colorClass = 'text-blue-400'; bgClass = 'bg-blue-400/10'; }
      if (item.type === 'warning') { colorClass = 'text-amber-400'; bgClass = 'bg-amber-400/10'; }
      if (item.type === 'error') { colorClass = 'text-red-400'; bgClass = 'bg-red-400/10'; }
      
      el.innerHTML = `
        <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${bgClass}">
          ${item.icon}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-200">${item.text}</p>
          <p class="text-xs text-gray-500 mt-1">${item.time}</p>
        </div>
      `;
      
      feedContainer.appendChild(el);
      
      // Trigger animation
      setTimeout(() => {
        el.classList.remove('translate-y-4', 'opacity-0');
      }, 50);
    });
  },

  animateEnvironmentalImpact() {
      // Use intersection observer or simple timeout for now (handled via animateCounters generally)
      // Custom animation logic if needed, but 'data-target' attributes on HTML elements should suffice.
  },

  redrawCharts() {
    this.drawWasteComposition();
    this.drawWeeklyCollection();
    this.drawRecyclingTrend();
  },
  
  simulateDataUpdate() {
      // Randomly adjust weekly collection today (Sun) slightly
      const today = DashboardData.weeklyCollection[6];
      today.value += Math.floor(Math.random() * 20 - 5); 
      if (today.value < 0) today.value = 10;
      
      this.drawWeeklyCollection();
  }
};

// Export for usage
window.Dashboard = Dashboard;
