/**
 * EcoFlow Autonomous Multi-Agent Engine
 * Orchestrates 4 specialized AI Agents:
 * 1. Fleet Dispatch Agent
 * 2. Swachh Bharat Ward Inspector Agent
 * 3. Financial Auditor Agent
 * 4. Route Optimization Engine Agent
 */

// Agent Event Bus for inter-agent coordination
const AgentEventBus = {
  listeners: {},
  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  },
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
};

function detectAnomaly(metric, value, threshold) {
  const deviation = Math.abs(value - threshold) / threshold * 100;
  if (deviation > 15) {
    return { isAnomaly: true, severity: deviation > 30 ? 'critical' : 'warning', deviation: deviation.toFixed(1) };
  }
  return { isAnomaly: false };
}

class AutonomousAgentSystem {
  constructor() {
    this.executionHistory = [];
    this.logs = [];
    this.agents = {
      dispatch: { name: 'Fleet Dispatch Agent', icon: '🚛', status: 'ACTIVE', tasksCompleted: 142 },
      inspector: { name: 'Swachh Bharat Inspector', icon: '🇮🇳', status: 'ACTIVE', tasksCompleted: 89 },
      auditor: { name: 'Financial Revenue Agent', icon: '💰', status: 'ACTIVE', tasksCompleted: 215 },
      optimizer: { name: 'Route Optimization Engine', icon: '🛣️', status: 'ACTIVE', tasksCompleted: 304 }
    };
    this.isAutoLoopRunning = false;
  }

  init() {
    this.addLog('System', 'Autonomous Agent Control Center initialized.', 'info');
    this.startAutoLoop();
    this.renderAgentDashboard();
  }

  addLog(agentName, message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logItem = { id: Date.now(), agentName, message, type, timestamp };
    this.logs.unshift(logItem);
    if (this.logs.length > 30) this.logs.pop();

    const action = message;
    this.executionHistory.push({ agent: agentName, action: action, time: new Date().toISOString(), priority: Math.random() > 0.7 ? 'HIGH' : 'NORMAL' });
    if (this.executionHistory.length > 50) this.executionHistory.shift();

    this.updateLogUI();
  }

  // Agent 1: Fleet Dispatch Agent
  runFleetDispatchAgent() {
    const zones = ['Koramangala Ward 68', 'HSR Layout Ward 174', 'Indiranagar Ward 74', 'JP Nagar Ward 177'];
    const vehicles = ['KA-01-AB-1234', 'KA-01-CD-5678', 'KA-01-GH-3456', 'KA-01-IJ-7890'];
    
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];

    this.agents.dispatch.tasksCompleted++;
    this.addLog(
      this.agents.dispatch.name,
      `Detected high waste accumulation in ${randomZone}. Dispatched backup vehicle ${randomVehicle}.`,
      'success'
    );

    const wasteLoad = Math.floor(Math.random() * 40 + 75);
    const anomaly = detectAnomaly('wasteLoad', wasteLoad, 80);
    if (anomaly.isAnomaly) {
      this.addLog(
        this.agents.dispatch.name,
        `Anomaly Alert: ${randomZone} waste load deviation at ${anomaly.deviation}% (${anomaly.severity}).`,
        'warning'
      );
    }

    if (typeof Utils !== 'undefined') {
      Utils.showToast(`🤖 [Fleet Dispatch Agent] Auto-assigned ${randomVehicle} to ${randomZone}`, 'success');
    }
  }

  // Agent 2: Swachh Bharat Inspector Agent
  runWardInspectorAgent() {
    const wards = [
      { name: 'Ward 150 - Bellandur', segregation: 88, status: 'Compliant' },
      { name: 'Ward 174 - HSR Layout', segregation: 94, status: 'Exceeded' },
      { name: 'Ward 149 - Varthur', segregation: 62, status: 'Non-Compliant' },
      { name: 'Ward 111 - Shantala Nagar', segregation: 58, status: 'Non-Compliant' }
    ];

    const randomWard = wards[Math.floor(Math.random() * wards.length)];
    this.agents.inspector.tasksCompleted++;

    if (randomWard.segregation < 70) {
      this.addLog(
        this.agents.inspector.name,
        `⚠️ Audit Alert: ${randomWard.name} segregation dropped to ${randomWard.segregation}%. Generated BBMP inspection ticket #ST-${Math.floor(Math.random()*9000+1000)}.`,
        'warning'
      );
      if (typeof Utils !== 'undefined') {
        Utils.showToast(`🇮🇳 [Ward Inspector Agent] Flagged low segregation in ${randomWard.name} (${randomWard.segregation}%)`, 'warning');
      }
    } else {
      this.addLog(
        this.agents.inspector.name,
        `Verified ${randomWard.name} Swachh Bharat compliance: ${randomWard.segregation}% segregation rate.`,
        'info'
      );
    }

    const anomaly = detectAnomaly('segregationRate', randomWard.segregation, 80);
    if (anomaly.isAnomaly) {
      this.addLog(
        this.agents.inspector.name,
        `Anomaly Alert: ${randomWard.name} segregation deviation at ${anomaly.deviation}% (${anomaly.severity}).`,
        'warning'
      );
    }
  }

  // Agent 3: Financial Revenue Agent
  runFinancialAuditorAgent() {
    const invoices = ['INV-2024-001', 'INV-2024-003', 'INV-2024-006'];
    const randomInv = invoices[Math.floor(Math.random() * invoices.length)];
    const penalty = Math.floor(Math.random() * 500 + 100);

    this.agents.auditor.tasksCompleted++;
    this.addLog(
      this.agents.auditor.name,
      `Audited overdue invoice ${randomInv}. Calculated late fee ₹${penalty} and dispatched automated payment reminder.`,
      'info'
    );

    const anomaly = detectAnomaly('lateFeePenalty', penalty, 250);
    if (anomaly.isAnomaly) {
      this.addLog(
        this.agents.auditor.name,
        `Anomaly Alert: ${randomInv} penalty deviation at ${anomaly.deviation}% (${anomaly.severity}).`,
        'warning'
      );
    }

    if (typeof Utils !== 'undefined') {
      Utils.showToast(`💰 [Financial Agent] Payment reminder & late fee applied to ${randomInv}`, 'info');
    }
  }

  // Agent 4: Route Optimization Engine Agent
  runRouteOptimizerAgent() {
    const routes = ['Route A-12 Koramangala', 'Route B-7 JP Nagar', 'Route E-8 Whitefield'];
    const randomRoute = routes[Math.floor(Math.random() * routes.length)];
    const kmSaved = (Math.random() * 4 + 1.5).toFixed(1);
    const co2Saved = Math.round(kmSaved * 2.3);

    this.agents.optimizer.tasksCompleted++;
    this.addLog(
      this.agents.optimizer.name,
      `Re-optimized ${randomRoute} for live traffic. Saved ${kmSaved} km and reduced ${co2Saved} kg CO₂ emissions.`,
      'success'
    );

    const anomaly = detectAnomaly('kmSaved', parseFloat(kmSaved), 3.0);
    if (anomaly.isAnomaly) {
      this.addLog(
        this.agents.optimizer.name,
        `Anomaly Alert: ${randomRoute} savings deviation at ${anomaly.deviation}% (${anomaly.severity}).`,
        'warning'
      );
    }

    if (typeof Utils !== 'undefined') {
      Utils.showToast(`🛣️ [Route Optimizer] Optimized ${randomRoute}: Saved ${kmSaved} km`, 'success');
    }
  }

  // Trigger all 4 agents on demand
  runAllAgents() {
    this.runFleetDispatchAgent();
    setTimeout(() => this.runWardInspectorAgent(), 400);
    setTimeout(() => this.runFinancialAuditorAgent(), 800);
    setTimeout(() => this.runRouteOptimizerAgent(), 1200);
  }

  startAutoLoop() {
    if (this.isAutoLoopRunning) return;
    this.isAutoLoopRunning = true;

    // Periodically run random autonomous tasks every 20 seconds
    setInterval(() => {
      const taskList = [
        { agent: this.agents.dispatch, action: 'Fleet Dispatch Execution', run: () => this.runFleetDispatchAgent() },
        { agent: this.agents.inspector, action: 'Ward Inspection Execution', run: () => this.runWardInspectorAgent() },
        { agent: this.agents.auditor, action: 'Financial Audit Execution', run: () => this.runFinancialAuditorAgent() },
        { agent: this.agents.optimizer, action: 'Route Optimization Execution', run: () => this.runRouteOptimizerAgent() }
      ];
      const selected = taskList[Math.floor(Math.random() * taskList.length)];
      const agent = selected.agent;
      const action = selected.action;
      selected.run();
      AgentEventBus.emit('agent-action', { agent: agent.name, action: action, timestamp: Date.now() });
    }, 20000);
  }

  updateLogUI() {
    const container = document.getElementById('agent-live-logs');
    if (!container) return;

    let html = '';
    this.logs.slice(0, 8).forEach(log => {
      const badgeColor = log.type === 'success' ? '#10b981' : (log.type === 'warning' ? '#f59e0b' : '#3b82f6');
      html += `
        <div style="padding: 8px 12px; background: rgba(15, 23, 42, 0.6); border-left: 3px solid ${badgeColor}; border-radius: 6px; font-size: 12px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
          <div>
            <span style="font-weight: bold; color: ${badgeColor}; margin-right: 6px;">[${log.agentName}]</span>
            <span style="color: #e2e8f0;">${log.message}</span>
          </div>
          <span style="color: #64748b; font-size: 11px; shrink-0;">${log.timestamp}</span>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  renderAgentDashboard() {
    const container = document.getElementById('agent-status-cards');
    if (!container) return;

    let html = '';
    Object.values(this.agents).forEach(agent => {
      html += `
        <div style="background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 24px; background: rgba(16, 185, 129, 0.1); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(16, 185, 129, 0.3);">
              ${agent.icon}
            </div>
            <div>
              <h4 style="margin: 0; color: #f8fafc; font-size: 14px; font-family: 'Outfit', sans-serif;">${agent.name}</h4>
              <span style="font-size: 11px; color: #34d399; font-weight: 600;">● ${agent.status}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: bold; color: #f8fafc;">${agent.tasksCompleted}</div>
            <div style="font-size: 10px; color: #94a3b8;">Tasks Solved</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
}

window.EcoFlowAgentSystem = new AutonomousAgentSystem();
