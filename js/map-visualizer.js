/**
 * EcoFlow Live Interactive GPS Map & Vehicle Visualizer
 * Canvas-based vector map renderer depicting Bangalore ward routes, street grids,
 * waypoint stops, and real-time moving garbage collection trucks.
 */

class EcoFlowMapVisualizer {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.time = 0;

    // Bangalore Ward Coordinates & Route Waypoints (vector mapped)
    this.routes = [
      {
        id: 'RT-001',
        name: 'Route A-12: Koramangala',
        color: '#10b981', // emerald
        waypoints: [
          { x: 80, y: 120, name: '1st Block Koramangala' },
          { x: 180, y: 150, name: 'Forum Mall Signal' },
          { x: 280, y: 110, name: '4th Block BDA Complex' },
          { x: 380, y: 160, name: 'ST Bed Layout' },
          { x: 480, y: 130, name: 'Koramangala 8th Block' }
        ],
        vehicle: { reg: 'KA-01-AB-1234', speed: '24 km/h', fuel: '78%', load: '65%', driver: 'Ramesh Kumar' }
      },
      {
        id: 'RT-002',
        name: 'Route B-7: JP Nagar',
        color: '#3b82f6', // blue
        waypoints: [
          { x: 100, y: 260, name: 'JP Nagar 2nd Phase' },
          { x: 220, y: 290, name: '6th Phase Sarakki' },
          { x: 340, y: 240, name: 'Bannerghatta Junction' },
          { x: 460, y: 280, name: 'Dollars Colony' }
        ],
        vehicle: { reg: 'KA-01-CD-5678', speed: '18 km/h', fuel: '85%', load: '42%', driver: 'Suresh Patel' }
      },
      {
        id: 'RT-003',
        name: 'Route E-8: Whitefield',
        color: '#f59e0b', // amber
        waypoints: [
          { x: 150, y: 60, name: 'ITPL Main Road' },
          { x: 270, y: 90, name: 'Brookefield Signal' },
          { x: 400, y: 50, name: 'Kadugodi Colony' },
          { x: 520, y: 95, name: 'Varthur Lake Area' }
        ],
        vehicle: { reg: 'KA-01-IJ-7890', speed: '30 km/h', fuel: '62%', load: '88%', driver: 'Mohammed Asif' }
      }
    ];

    this.selectedVehicle = null;
  }

  init() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Handle high-DPI retina display
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = (rect.width || 650) * dpr;
    this.canvas.height = (rect.height || 360) * dpr;
    this.ctx.scale(dpr, dpr);

    this.bindCanvasEvents();
    this.startAnimationLoop();
  }

  bindCanvasEvents() {
    if (!this.canvas) return;
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Check click proximity to moving trucks
      this.routes.forEach(route => {
        const truckPos = this.getTruckPosition(route, this.time);
        const dist = Math.hypot(mouseX - truckPos.x, mouseY - truckPos.y);
        if (dist < 18) {
          this.selectedVehicle = route;
          this.showVehiclePopup(route, mouseX, mouseY);
        }
      });
    });
  }

  showVehiclePopup(route, x, y) {
    const v = route.vehicle;
    if (typeof Utils !== 'undefined') {
      Utils.showToast(
        `🚛 <b>${v.reg}</b> (${route.name})<br>Speed: ${v.speed} | Fuel: ${v.fuel} | Capacity: ${v.load}<br>Driver: ${v.driver}`,
        'info',
        5000
      );
    }
  }

  getTruckPosition(route, t) {
    const pts = route.waypoints;
    const totalSegments = pts.length - 1;
    const cycle = (t * 0.25) % totalSegments;
    const segIndex = Math.floor(cycle);
    const segProgress = cycle - segIndex;

    const p1 = pts[segIndex];
    const p2 = pts[Math.min(segIndex + 1, pts.length - 1)];

    const x = p1.x + (p2.x - p1.x) * segProgress;
    const y = p1.y + (p2.y - p1.y) * segProgress;
    return { x, y };
  }

  drawMapGrid(width, height) {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1;

    // Grid lines
    for (let x = 0; x < width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const width = this.canvas.getBoundingClientRect().width || 650;
    const height = this.canvas.getBoundingClientRect().height || 360;

    this.ctx.clearRect(0, 0, width, height);

    // Map background
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, width, height);

    // Grid
    this.drawMapGrid(width, height);

    this.time += 0.015;

    // Render Routes & Waypoints
    this.routes.forEach(route => {
      // Route line path
      this.ctx.strokeStyle = route.color;
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([6, 4]);
      this.ctx.beginPath();

      route.waypoints.forEach((pt, idx) => {
        if (idx === 0) this.ctx.moveTo(pt.x, pt.y);
        else this.ctx.lineTo(pt.x, pt.y);
      });
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Waypoint Dots & Labels
      route.waypoints.forEach(pt => {
        // Dot
        this.ctx.fillStyle = route.color;
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Label
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '10px Inter, sans-serif';
        this.ctx.fillText(pt.name, pt.x - 20, pt.y - 8);
      });

      // Animated Moving Garbage Truck Marker
      const truckPos = this.getTruckPosition(route, this.time);

      // Glowing aura
      const glow = this.ctx.createRadialGradient(truckPos.x, truckPos.y, 2, truckPos.x, truckPos.y, 14);
      glow.addColorStop(0, `${route.color}99`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');

      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(truckPos.x, truckPos.y, 14, 0, Math.PI * 2);
      this.ctx.fill();

      // Truck Marker Core
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(truckPos.x, truckPos.y, 6, 0, Math.PI * 2);
      this.ctx.fill();

      // Vehicle Registration tag
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.font = 'bold 10px Outfit, sans-serif';
      this.ctx.fillText(`🚛 ${route.vehicle.reg}`, truckPos.x + 10, truckPos.y + 4);
    });

    // Map Legend Overlay
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    this.ctx.fillRect(10, 10, 160, 24);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.strokeRect(10, 10, 160, 24);

    this.ctx.fillStyle = '#34d399';
    this.ctx.font = 'bold 11px Inter, sans-serif';
    this.ctx.fillText('📡 LIVE GPS FLEET TELEMETRY', 18, 26);
  }

  startAnimationLoop() {
    const loop = () => {
      if (window.__ecoflowPaused) return;
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}

window.EcoFlowMapVisualizer = EcoFlowMapVisualizer;
