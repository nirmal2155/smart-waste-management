/**
 * EcoFlow Citizen Swachh Bharat Grievance & Ticket Portal
 * Public complaint filing, priority SLA tracking, and resolution management.
 */
window.EcoFlowGrievances = {
  tickets: [
    {
      id: 'TICK-8842',
      citizen: 'Ananya Roy',
      ward: 'Ward 150 (Bellandur)',
      issue: 'Overflowing Community Bin near Tech Park Gate 3',
      priority: 'HIGH',
      slaHours: 24,
      elapsedHours: 19.5,
      status: 'DISPATCHED',
      officer: 'Inspector Vikram Singh',
      truck: 'KA-01-EQ-4402',
      date: '2026-07-28 09:30'
    },
    {
      id: 'TICK-8843',
      citizen: 'Prakash Rao',
      ward: 'Ward 174 (HSR Layout)',
      issue: 'Missed Door-to-Door Wet Waste Collection (Sector 3)',
      priority: 'MEDIUM',
      slaHours: 48,
      elapsedHours: 12.0,
      status: 'PENDING',
      officer: 'Inspector Ramesh Kumar',
      truck: 'Unassigned',
      date: '2026-07-28 14:15'
    },
    {
      id: 'TICK-8840',
      citizen: 'Suresh Menon',
      ward: 'Ward 12 (Indiranagar)',
      issue: 'Illegal Commercial Plastic Waste Dumping on 100ft Road',
      priority: 'CRITICAL',
      slaHours: 12,
      elapsedHours: 11.8,
      status: 'RESOLVED',
      officer: 'Inspector Anitha Reddy',
      truck: 'KA-01-EQ-1108',
      date: '2026-07-27 18:00'
    }
  ],

  init() {
    this.renderTickets();
  },

  renderTickets() {
    const listEl = document.getElementById('grievance-ticket-list');
    if (!listEl) return;

    listEl.innerHTML = this.tickets.map(ticket => {
      const remaining = Math.max(0, (ticket.slaHours - ticket.elapsedHours)).toFixed(1);
      const isUrgent = remaining < 5 && ticket.status !== 'RESOLVED';

      let statusBadge = '';
      if (ticket.status === 'RESOLVED') {
        statusBadge = '<span style="background: rgba(16,185,129,0.2); color: #34d399; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800;">✓ RESOLVED</span>';
      } else if (ticket.status === 'DISPATCHED') {
        statusBadge = '<span style="background: rgba(59,130,246,0.2); color: #60a5fa; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800;">🚛 DISPATCHED</span>';
      } else {
        statusBadge = '<span style="background: rgba(234,179,8,0.2); color: #facc15; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800;">⏳ PENDING</span>';
      }

      let priorityBadge = '';
      if (ticket.priority === 'CRITICAL') {
        priorityBadge = '<span style="background: #ef4444; color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;">🔥 CRITICAL</span>';
      } else if (ticket.priority === 'HIGH') {
        priorityBadge = '<span style="background: #f97316; color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;">⚠️ HIGH</span>';
      } else {
        priorityBadge = '<span style="background: #3b82f6; color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 800;">ℹ️ MEDIUM</span>';
      }

      return `
        <div style="background: rgba(15,23,42,0.85); border: 1px solid ${isUrgent ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}; border-radius: 16px; padding: 20px; margin-bottom: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="color: #10b981; font-size: 15px;">${ticket.id}</strong>
                ${priorityBadge}
                ${statusBadge}
              </div>
              <h4 style="margin: 6px 0 2px 0; color: #f8fafc; font-size: 15px;">${ticket.issue}</h4>
              <span style="font-size: 12px; color: #94a3b8;">📍 ${ticket.ward} · Filed by: <strong>${ticket.citizen}</strong></span>
            </div>

            <div style="text-align: right; background: rgba(0,0,0,0.3); padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
              <span style="font-size: 10px; color: #64748b; font-weight: 700; display: block;">SLA REMAINING</span>
              <strong style="font-size: 16px; color: ${isUrgent ? '#ef4444' : '#34d399'};">${ticket.status === 'RESOLVED' ? 'N/A' : remaining + 'h'}</strong>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; margin-top: 10px; font-size: 12px; color: #cbd5e1; flex-wrap: wrap; gap: 8px;">
            <div>
              <span>👮 Assigned Officer: <strong>${ticket.officer}</strong></span>
              <span style="margin-left: 14px;">🚛 Truck: <strong>${ticket.truck}</strong></span>
            </div>
            ${ticket.status !== 'RESOLVED' ? `
              <button onclick="EcoFlowGrievances.resolveTicket('${ticket.id}')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700;">
                ✓ Mark Resolved
              </button>
            ` : ''}
          </div>

        </div>
      `;
    }).join('');
  },

  submitNewGrievance(event) {
    event.preventDefault();
    const citizen = document.getElementById('grv-name')?.value || 'Citizen';
    const ward = document.getElementById('grv-ward')?.value || 'Ward 150';
    const issue = document.getElementById('grv-issue')?.value || 'Uncollected waste';
    const priority = document.getElementById('grv-priority')?.value || 'HIGH';

    const newTicket = {
      id: 'TICK-' + Math.floor(1000 + Math.random() * 9000),
      citizen: citizen,
      ward: ward,
      issue: issue,
      priority: priority,
      slaHours: priority === 'CRITICAL' ? 12 : (priority === 'HIGH' ? 24 : 48),
      elapsedHours: 0.1,
      status: 'PENDING',
      officer: 'Inspector Auto-Assigned',
      truck: 'KA-01-EQ-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    this.tickets.unshift(newTicket);
    this.renderTickets();

    if (typeof Utils !== 'undefined') {
      Utils.showToast(`📩 Grievance Registered! Ticket ID: ${newTicket.id} (SLA: ${newTicket.slaHours}h)`, 'success');
    }

    const form = document.getElementById('new-grievance-form');
    if (form) form.reset();
  },

  resolveTicket(id) {
    const ticket = this.tickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = 'RESOLVED';
      this.renderTickets();
      if (typeof Utils !== 'undefined') {
        Utils.showToast(`✅ Ticket ${id} marked RESOLVED! Swachh Survekshan log updated.`, 'success');
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => EcoFlowGrievances.init());
