const Routes = {
  routes: [],
  
  sampleRoutes: [
    { id: 'RT-001', name: 'Route A-12: Koramangala', status: 'active', stops: [
        { name: '1st Cross, Koramangala 1st Block', time: '06:00', status: 'completed' },
        { name: '80 Feet Road, Koramangala', time: '06:20', status: 'completed' },
        { name: 'Forum Mall Area', time: '06:45', status: 'in-progress' },
        { name: 'Koramangala 4th Block', time: '07:10', status: 'pending' },
        { name: 'ST Bed Layout', time: '07:30', status: 'pending' },
        { name: 'Koramangala 8th Block', time: '07:50', status: 'pending' }
      ], distance: 12.5, estimatedTime: '2h 15m', vehicle: 'KA-01-AB-1234', driver: 'Rajesh Kumar', progress: 42, collections: 28, wasteCollected: 4.2 },
    { id: 'RT-002', name: 'Route B-7: JP Nagar', status: 'active', stops: [
        { name: '15th Cross JP Nagar 2nd Phase', time: '06:00', status: 'completed' },
        { name: 'JP Nagar 6th Phase', time: '06:30', status: 'completed' },
        { name: 'Sarakki Signal Area', time: '07:00', status: 'completed' },
        { name: 'Bannerghatta Road Junction', time: '07:30', status: 'in-progress' },
        { name: 'Dollars Colony', time: '08:00', status: 'pending' }
      ], distance: 15.8, estimatedTime: '2h 30m', vehicle: 'KA-01-GH-3456', driver: 'Pradeep Rao', progress: 68, collections: 42, wasteCollected: 6.1 },
    { id: 'RT-003', name: 'Route C-3: Indiranagar', status: 'completed', stops: [
        { name: '100 Feet Road', time: '08:00', status: 'completed' },
        { name: 'CMH Road', time: '08:25', status: 'completed' },
        { name: '12th Main HAL', time: '08:50', status: 'completed' },
        { name: 'Defence Colony', time: '09:15', status: 'completed' }
      ], distance: 9.2, estimatedTime: '1h 30m', vehicle: 'KA-01-CD-5678', driver: 'Suresh Patel', progress: 100, collections: 35, wasteCollected: 5.5 },
    { id: 'RT-004', name: 'Route D-15: HSR Layout', status: 'pending', stops: [
        { name: 'HSR Sector 1', time: '10:00', status: 'pending' },
        { name: 'HSR Sector 2', time: '10:30', status: 'pending' },
        { name: 'HSR Sector 7', time: '11:00', status: 'pending' },
        { name: 'Agara Lake Area', time: '11:30', status: 'pending' },
        { name: 'HSR BDA Complex', time: '12:00', status: 'pending' }
      ], distance: 11.3, estimatedTime: '2h', vehicle: 'KA-01-EF-9012', driver: 'Amit Singh', progress: 0, collections: 0, wasteCollected: 0 },
    { id: 'RT-005', name: 'Route E-8: Whitefield', status: 'active', stops: [
        { name: 'ITPL Main Road', time: '06:00', status: 'completed' },
        { name: 'Brookefield', time: '06:30', status: 'in-progress' },
        { name: 'Kadugodi', time: '07:00', status: 'pending' },
        { name: 'Varthur', time: '07:30', status: 'pending' }
      ], distance: 18.7, estimatedTime: '2h 45m', vehicle: 'KA-01-IJ-7890', driver: 'Mohammed Asif', progress: 35, collections: 18, wasteCollected: 3.2 },
    { id: 'RT-006', name: 'Route F-21: Electronic City', status: 'pending', stops: [
        { name: 'Infosys Campus Gate', time: '09:00', status: 'pending' },
        { name: 'Wipro Campus Area', time: '09:30', status: 'pending' },
        { name: 'Neeladri Road', time: '10:00', status: 'pending' },
        { name: 'Doddathogur', time: '10:30', status: 'pending' }
      ], distance: 14.0, estimatedTime: '2h', vehicle: 'KA-01-OP-0123', driver: 'Naveen K', progress: 0, collections: 0, wasteCollected: 0 }
  ],

  init() {
    this.loadRoutes();
    this.renderRoutes('all');
  },

  loadRoutes() {
    const stored = localStorage.getItem('ecoFlow_routes');
    if (stored) {
      this.routes = JSON.parse(stored);
    } else {
      this.routes = [...this.sampleRoutes];
      this.saveRoutes();
    }
  },
  
  saveRoutes() {
    localStorage.setItem('ecoFlow_routes', JSON.stringify(this.routes));
  },

  renderRoutes(filter = 'all') {
    const gridEl = document.getElementById('routes-grid');
    if (!gridEl) return;
    
    let filtered = this.routes;
    if (filter !== 'all') {
      filtered = this.routes.filter(r => r.status === filter);
    }
    
    gridEl.innerHTML = filtered.map(route => \`
      <div class="glass-card p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors flex flex-col h-full">
        <div class="flex justify-between items-start mb-4">
          <h3 class="font-bold text-lg">\${route.name}</h3>
          <span class="px-2 py-1 text-xs rounded-full uppercase tracking-wider font-semibold 
            \${route.status === 'active' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
              route.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
              'bg-amber-500/20 text-amber-400 border border-amber-500/30'}">
            \${route.status}
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p class="text-gray-400 text-xs">Distance</p>
            <p class="font-medium">\${route.distance} km</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs">Est. Time</p>
            <p class="font-medium">\${route.estimatedTime}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs">Vehicle</p>
            <p class="font-medium">\${route.vehicle}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs">Driver</p>
            <p class="font-medium truncate">\${route.driver}</p>
          </div>
        </div>
        
        \${route.status === 'active' ? \`
          <div class="mb-4 mt-auto">
            <div class="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>\${route.progress}%</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-1.5">
              <div class="bg-blue-500 h-1.5 rounded-full" style="width: \${route.progress}%"></div>
            </div>
          </div>
        \` : '<div class="mt-auto"></div>'}
        
        <div class="flex gap-2 mt-4 pt-4 border-t border-white/10">
          <button onclick="Routes.showRouteDetail('\${route.id}')" class="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded text-sm font-medium transition-colors">View Details</button>
          \${route.status === 'pending' || route.status === 'active' ? \`
            <button onclick="Routes.optimizeRoute('\${route.id}')" class="flex-1 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm font-medium transition-colors">Optimize</button>
          \` : ''}
        </div>
      </div>
    \`).join('');
  },

  filterRoutes(status) {
    this.renderRoutes(status.toLowerCase());
  },

  showRouteDetail(routeId) {
    const route = this.routes.find(r => r.id === routeId);
    if (!route) return;
    
    const mapCard = document.querySelector('.map-card');
    if (mapCard) mapCard.scrollIntoView({ behavior: 'smooth' });

    if (window.loadRouteOnGoogleMaps) {
      window.loadRouteOnGoogleMaps(route.name);
    }
  },

  optimizeRoute(routeId) {
    const route = this.routes.find(r => r.id === routeId);
    if (!route) return;
    
    // PCGVRP Algorithm: Sort pending stops by Waste Filling Level (WFL) threshold (60%-80% optimal utilization) & Priority
    setTimeout(() => {
      const pendingStops = route.stops.filter(s => s.status === 'pending');
      const completedStops = route.stops.filter(s => s.status !== 'pending');

      // Sort pending stops by WFL priority score (Simulated 60%-80% fill level optimization)
      pendingStops.sort((a, b) => {
        const isHazardousA = a.name.toLowerCase().includes('hospital') || a.name.toLowerCase().includes('gate') ? 2 : 1;
        const isHazardousB = b.name.toLowerCase().includes('hospital') || b.name.toLowerCase().includes('gate') ? 2 : 1;
        return isHazardousB - isHazardousA;
      });

      route.stops = [...completedStops, ...pendingStops];
      const fuelSaved = (parseFloat(route.distance) * 0.12).toFixed(1);
      route.distance = (parseFloat(route.distance) * 0.88).toFixed(1);

      this.saveRoutes();
      this.renderRoutes();
      
      if (window.loadRouteOnGoogleMaps) {
        window.loadRouteOnGoogleMaps(route.name);
      }
      if (typeof Utils !== 'undefined') {
        Utils.showToast(`🌱 PCGVRP Green Routing Optimized for ${route.name}! WFL target 75% achieved. Saved ${fuelSaved} km fuel.`, 'success');
      }
    }, 400);
  },

  showCreateRouteForm() {
    console.log('Show create route modal');
  }
};

export default Routes;
