const sampleVehicles = [
  { id: 'VEH-001', registration: 'KA-01-AB-1234', type: 'Compactor', make: 'Tata', model: 'LPT 1613', capacity: 8, status: 'active', driver: 'Rajesh Kumar', driverPhone: '+91 98765 43210', fuelLevel: 72, odometer: 45230, todayTrips: 3, todayDistance: 28.5, todayCollections: 28, lastMaintenance: '2024-11-15', nextMaintenance: '2025-01-15', fuelType: 'Diesel', year: 2022, icon: '🚛' },
  { id: 'VEH-002', registration: 'KA-01-CD-5678', type: 'Tipper', make: 'Ashok Leyland', model: 'Boss 1616', capacity: 10, status: 'active', driver: 'Suresh Patel', driverPhone: '+91 97654 32109', fuelLevel: 45, odometer: 62100, todayTrips: 4, todayDistance: 35.2, todayCollections: 35, lastMaintenance: '2024-10-20', nextMaintenance: '2024-12-20', fuelType: 'Diesel', year: 2021, icon: '🚚' },
  { id: 'VEH-003', registration: 'KA-01-EF-9012', type: 'Mini-truck', make: 'Mahindra', model: 'Bolero Pickup', capacity: 3, status: 'maintenance', driver: 'Amit Singh', driverPhone: '+91 96543 21098', fuelLevel: 30, odometer: 38750, todayTrips: 0, todayDistance: 0, todayCollections: 0, lastMaintenance: '2024-12-01', nextMaintenance: '2024-12-15', fuelType: 'Diesel', year: 2023, icon: '🛻' },
  { id: 'VEH-004', registration: 'KA-01-GH-3456', type: 'Compactor', make: 'Tata', model: 'LPT 1613', capacity: 8, status: 'active', driver: 'Pradeep Rao', driverPhone: '+91 95432 10987', fuelLevel: 88, odometer: 29800, todayTrips: 2, todayDistance: 22.1, todayCollections: 42, lastMaintenance: '2024-11-01', nextMaintenance: '2025-01-01', fuelType: 'Diesel', year: 2023, icon: '🚛' },
  { id: 'VEH-005', registration: 'KA-01-IJ-7890', type: 'Tipper', make: 'BharatBenz', model: '1217C', capacity: 12, status: 'idle', driver: 'Mohammed Asif', driverPhone: '+91 94321 09876', fuelLevel: 95, odometer: 18400, todayTrips: 0, todayDistance: 0, todayCollections: 0, lastMaintenance: '2024-11-10', nextMaintenance: '2025-01-10', fuelType: 'Diesel', year: 2024, icon: '🚚' },
  { id: 'VEH-006', registration: 'KA-01-KL-2345', type: 'Mini-truck', make: 'Tata', model: 'Ace Gold', capacity: 2, status: 'active', driver: 'Venkatesh B', driverPhone: '+91 93210 98765', fuelLevel: 55, odometer: 52100, todayTrips: 5, todayDistance: 18.3, todayCollections: 22, lastMaintenance: '2024-10-15', nextMaintenance: '2024-12-15', fuelType: 'CNG', year: 2022, icon: '🛻' },
  { id: 'VEH-007', registration: 'KA-01-MN-6789', type: 'Compactor', make: 'Ashok Leyland', model: 'Guru 1010', capacity: 6, status: 'active', driver: 'Ganesh R', driverPhone: '+91 92109 87654', fuelLevel: 62, odometer: 41300, todayTrips: 3, todayDistance: 25.7, todayCollections: 30, lastMaintenance: '2024-11-20', nextMaintenance: '2025-01-20', fuelType: 'Diesel', year: 2022, icon: '🚛' },
  { id: 'VEH-008', registration: 'KA-01-OP-0123', type: 'Tipper', make: 'Eicher', model: 'Pro 1110', capacity: 8, status: 'active', driver: 'Naveen K', driverPhone: '+91 91098 76543', fuelLevel: 78, odometer: 35600, todayTrips: 1, todayDistance: 14.0, todayCollections: 15, lastMaintenance: '2024-11-05', nextMaintenance: '2025-01-05', fuelType: 'Diesel', year: 2023, icon: '🚚' }
];

class FleetModule {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.vehicles = this.loadData();
    
    if (this.container) {
      this.init();
    }
  }

  loadData() {
    const data = localStorage.getItem('ecoflow_fleet');
    if (data) return JSON.parse(data);
    localStorage.setItem('ecoflow_fleet', JSON.stringify(sampleVehicles));
    return sampleVehicles;
  }

  saveData() {
    localStorage.setItem('ecoflow_fleet', JSON.stringify(this.vehicles));
  }

  init() {
    this.container.innerHTML = `
      <div class="fleet-dashboard">
        <div id="fleet-stats" style="margin-bottom: 25px;"></div>
        
        <div class="actions" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <h2>Vehicle Management</h2>
          <button class="primary-btn" id="add-vehicle-btn" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">+ Add Vehicle</button>
        </div>

        <div id="vehicles-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          <!-- Rendered via JS -->
        </div>

        <div id="maintenance-schedule" style="margin-top: 40px; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
          <h3>Maintenance Schedule</h3>
          <ul id="maintenance-list" style="list-style: none; padding: 0;"></ul>
        </div>
      </div>

      <!-- Vehicle Detail Modal -->
      <div id="vehicle-modal" class="modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; padding: 40px;">
        <div class="modal-content" style="background: #1e1e1e; color: #fff; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 12px; position: relative;">
          <button class="close-modal" style="position: absolute; right: 20px; top: 20px; background: none; border: none; color: #fff; font-size: 24px; cursor: pointer;">&times;</button>
          <div id="vehicle-detail-content"></div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    document.getElementById('add-vehicle-btn')?.addEventListener('click', () => {
      alert('Add Vehicle Form to be implemented.');
    });

    const modal = document.getElementById('vehicle-modal');
    modal?.querySelector('.close-modal')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  render() {
    this.renderFleetOverview();
    this.renderVehicles();
    this.renderMaintenanceSchedule();
  }

  renderFleetOverview() {
    const total = this.vehicles.length;
    const active = this.vehicles.filter(v => v.status === 'active').length;
    const idle = this.vehicles.filter(v => v.status === 'idle').length;
    const maintenance = this.vehicles.filter(v => v.status === 'maintenance').length;

    const html = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #9C27B0;">
          <h4 style="margin: 0 0 10px 0; color: #aaa;">Total Vehicles</h4>
          <h2 style="margin: 0; font-size: 24px;">${total}</h2>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #4CAF50;">
          <h4 style="margin: 0 0 10px 0; color: #aaa;">Active Fleet</h4>
          <h2 style="margin: 0; font-size: 24px;">${active}</h2>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #FFC107;">
          <h4 style="margin: 0 0 10px 0; color: #aaa;">Idle</h4>
          <h2 style="margin: 0; font-size: 24px;">${idle}</h2>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #F44336;">
          <h4 style="margin: 0 0 10px 0; color: #aaa;">In Maintenance</h4>
          <h2 style="margin: 0; font-size: 24px;">${maintenance}</h2>
        </div>
        <div style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 10px 0; color: #34d399;">PdM Health Score</h4>
          <h2 style="margin: 0; font-size: 24px; color: #ffffff;">94.8% <span style="font-size: 12px; color: #34d399;">(Low Risk)</span></h2>
        </div>
      </div>
    `;
    const statsContainer = document.getElementById('fleet-stats');
    if (statsContainer) statsContainer.innerHTML = html;
  }

  renderVehicles() {
    const grid = document.getElementById('vehicles-grid');
    if (!grid) return;

    let html = '';
    this.vehicles.forEach(veh => {
      const statusColor = veh.status === 'active' ? '#4CAF50' : (veh.status === 'idle' ? '#FFC107' : '#F44336');
      const fuelColor = veh.fuelLevel > 50 ? '#4CAF50' : (veh.fuelLevel > 25 ? '#FFC107' : '#F44336');
      
      const capUtil = (veh.todayCollections / (veh.capacity * 10)) * 100 || 0; // arbitrary utilization logic

      html += `
        <div class="vehicle-card" style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; position: relative;">
          <div style="position: absolute; top: 20px; right: 20px; width: 12px; height: 12px; border-radius: 50%; background: ${statusColor};"></div>
          
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
            <div style="font-size: 32px; background: rgba(255,255,255,0.1); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 12px;">
              ${veh.icon}
            </div>
            <div>
              <h3 style="margin: 0 0 5px 0;">${veh.registration}</h3>
              <span style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #aaa;">${veh.type} • ${veh.capacity}T</span>
            </div>
          </div>

          <div style="margin-bottom: 15px; font-size: 14px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
              <span style="color: #aaa;">Driver:</span> ${veh.driver}
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: #aaa;">Phone:</span> ${veh.driverPhone}
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; color: #aaa;">
              <span>Fuel Level</span>
              <span>${veh.fuelLevel}%</span>
            </div>
            <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
              <div style="width: ${veh.fuelLevel}%; height: 100%; background: ${fuelColor};"></div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; margin-bottom: 20px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
            <div>
              <div style="font-size: 18px; font-weight: bold;">${veh.todayTrips}</div>
              <div style="font-size: 10px; color: #aaa;">TRIPS</div>
            </div>
            <div>
              <div style="font-size: 18px; font-weight: bold;">${veh.todayDistance}</div>
              <div style="font-size: 10px; color: #aaa;">KM</div>
            </div>
            <div>
              <div style="font-size: 18px; font-weight: bold;">${veh.todayCollections}</div>
              <div style="font-size: 10px; color: #aaa;">TONS</div>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <button onclick="window.fleetModule.showVehicleDetail('${veh.id}')" style="flex: 1; background: #2196F3; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">View Details</button>
            <button style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">Edit</button>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
  }

  showVehicleDetail(id) {
    const veh = this.vehicles.find(v => v.id === id);
    if (!veh) return;

    const modal = document.getElementById('vehicle-modal');
    const content = document.getElementById('vehicle-detail-content');
    
    content.innerHTML = `
      <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
        <div style="font-size: 48px;">${veh.icon}</div>
        <div>
          <h2 style="margin: 0 0 5px 0;">${veh.registration}</h2>
          <p style="margin: 0; color: #aaa;">${veh.make} ${veh.model} (${veh.year})</p>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <div>
          <h4 style="margin: 0 0 10px 0; color: #aaa;">Specs</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 2;">
            <li><strong>Type:</strong> ${veh.type}</li>
            <li><strong>Capacity:</strong> ${veh.capacity} Tons</li>
            <li><strong>Fuel Type:</strong> ${veh.fuelType}</li>
            <li><strong>Odometer:</strong> ${veh.odometer} km</li>
          </ul>
        </div>
        <div>
          <h4 style="margin: 0 0 10px 0; color: #aaa;">Driver Info</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 2;">
            <li><strong>Name:</strong> ${veh.driver}</li>
            <li><strong>Phone:</strong> ${veh.driverPhone}</li>
            <li><strong>Status:</strong> <span style="text-transform: capitalize;">${veh.status}</span></li>
          </ul>
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: #aaa;">Maintenance Log</h4>
        <div style="display: flex; justify-content: space-between; font-size: 14px;">
          <span>Last Service: <strong>${veh.lastMaintenance}</strong></span>
          <span>Next Due: <strong style="color: #FFC107;">${veh.nextMaintenance}</strong></span>
        </div>
        <div style="margin-top: 15px; text-align: center;">
          <button style="background: #FF9800; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Schedule Maintenance</button>
        </div>
      </div>
    `;
    
    modal.style.display = 'block';
  }

  renderMaintenanceSchedule() {
    const list = document.getElementById('maintenance-list');
    if (!list) return;

    let html = '';
    // Sort by next maintenance date
    const sorted = [...this.vehicles].sort((a,b) => new Date(a.nextMaintenance) - new Date(b.nextMaintenance));
    
    sorted.slice(0, 4).forEach(veh => {
      const dueDate = new Date(veh.nextMaintenance);
      const isOverdue = dueDate < new Date();
      
      html += `
        <li style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 24px;">${veh.icon}</span>
            <div>
              <div style="font-weight: bold;">${veh.registration}</div>
              <div style="font-size: 12px; color: #aaa;">${veh.type}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="color: ${isOverdue ? '#F44336' : '#FFC107'}; font-weight: bold;">
              ${isOverdue ? 'Overdue' : 'Due: ' + veh.nextMaintenance}
            </div>
            <button style="background: none; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-top: 5px; cursor: pointer;">Log Service</button>
          </div>
        </li>
      `;
    });
    
    list.innerHTML = html;
  }
}

// Global attachment
window.FleetModule = FleetModule;
