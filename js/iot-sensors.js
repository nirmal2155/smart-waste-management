/**
 * EcoFlow IoT Sensor Fusion Bin & Hardware Simulation Engine
 * Simulates Arduino Uno controller with Ultrasonic, Moisture, and Metal Inductive sensors,
 * controlling a servo-driven mechanical segregation gate.
 */
window.EcoFlowIoTSensors = {
  bins: [
    { id: 'BIN-101', location: 'Koramangala 4th Block', fillLevel: 78, moisture: 82, metalDetected: false, temp: 28.5, status: 'OPTIMAL_COLLECT' },
    { id: 'BIN-102', location: 'HSR Sector 3 Commercial', fillLevel: 92, moisture: 15, metalDetected: true, temp: 31.2, status: 'OVERFLOW_ALERT' },
    { id: 'BIN-103', location: 'Indiranagar 100ft Road', fillLevel: 45, moisture: 65, metalDetected: false, temp: 27.0, status: 'NORMAL' },
    { id: 'BIN-104', location: 'Bellandur EcoSpace Gate 2', fillLevel: 88, moisture: 90, metalDetected: false, temp: 34.1, status: 'PRIORITY_BIO' }
  ],

  init() {
    this.renderIoTDashboard();
  },

  renderIoTDashboard() {
    const container = document.getElementById('iot-sensor-grid');
    if (!container) return;

    container.innerHTML = this.bins.map(bin => {
      const isUrgent = bin.fillLevel >= 80;
      return `
        <div style="background: rgba(15,23,42,0.85); border: 1px solid ${isUrgent ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.3)'}; border-radius: 16px; padding: 18px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <strong style="color: #34d399; font-size: 15px;">📡 ${bin.id}</strong>
              <span style="display: block; font-size: 12px; color: #94a3b8;">📍 ${bin.location}</span>
            </div>
            <span style="background: ${isUrgent ? '#ef4444' : '#10b981'}; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 10px; font-weight: 800;">
              ${bin.status}
            </span>
          </div>

          <!-- Ultrasonic Fill Level Bar -->
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #cbd5e1; margin-bottom: 4px;">
              <span>🔊 Ultrasonic Fill Sensor:</span>
              <strong>${bin.fillLevel}% Full</strong>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
              <div style="width: ${bin.fillLevel}%; height: 100%; background: ${bin.fillLevel > 85 ? '#ef4444' : (bin.fillLevel > 60 ? '#f59e0b' : '#10b981')}; transition: width 0.5s ease;"></div>
            </div>
          </div>

          <!-- Sensor Fusion Telemetry -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 11px; text-align: center;">
            <div style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
              <span style="color: #64748b; display: block;">💧 Moisture</span>
              <strong style="color: #60a5fa;">${bin.moisture}%</strong>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
              <span style="color: #64748b; display: block;">🧲 Inductive</span>
              <strong style="color: ${bin.metalDetected ? '#f59e0b' : '#34d399'};">${bin.metalDetected ? 'METAL' : 'NON-METAL'}</strong>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
              <span style="color: #64748b; display: block;">🌡️ Temp</span>
              <strong style="color: #f8fafc;">${bin.temp}°C</strong>
            </div>
          </div>

        </div>
      `;
    }).join('');
  },

  simulateSensorTrigger(binId) {
    const bin = this.bins.find(b => b.id === binId);
    if (!bin) return;

    // Simulate servo gate actuation
    if (typeof Utils !== 'undefined') {
      Utils.showToast(`⚙️ Arduino Servo Actuated for ${binId}: Gate turned to ${bin.moisture > 50 ? 'GREEN (WET)' : 'BLUE (DRY)'} compartment`, 'info');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => EcoFlowIoTSensors.init());
