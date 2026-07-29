const sampleInvoices = [
  { id: 'INV-2024-001', customerId: 'CUS-002', customerName: 'Priya Enterprises Pvt Ltd', amount: 12500, date: '2024-12-01', dueDate: '2024-12-15', status: 'pending', items: [
    { description: 'Premium Waste Collection - December 2024', quantity: 1, rate: 8500, amount: 8500 },
    { description: 'E-waste Pickup (Special)', quantity: 2, rate: 1500, amount: 3000 },
    { description: 'Recycling Processing Fee', quantity: 1, rate: 1000, amount: 1000 }
  ]},
  { id: 'INV-2024-002', customerId: 'CUS-004', customerName: 'Bangalore Steel Works', amount: 45000, date: '2024-11-25', dueDate: '2024-12-10', status: 'overdue', items: [
    { description: 'Industrial Waste Collection - November 2024', quantity: 1, rate: 35000, amount: 35000 },
    { description: 'Hazardous Waste Handling', quantity: 1, rate: 8000, amount: 8000 },
    { description: 'Compliance Documentation', quantity: 1, rate: 2000, amount: 2000 }
  ]},
  { id: 'INV-2024-003', customerId: 'CUS-006', customerName: 'Green Valley Apartments', amount: 28000, date: '2024-12-01', dueDate: '2024-12-20', status: 'pending', items: [
    { description: 'Premium Complex Collection - December 2024', quantity: 1, rate: 22000, amount: 22000 },
    { description: 'Composting Service', quantity: 1, rate: 4000, amount: 4000 },
    { description: 'Dry Waste Sorting', quantity: 1, rate: 2000, amount: 2000 }
  ]},
  { id: 'INV-2024-004', customerId: 'CUS-008', customerName: 'TechPark Solutions', amount: 35000, date: '2024-11-15', dueDate: '2024-11-30', status: 'paid', items: [
    { description: 'Premium Corporate Collection - November 2024', quantity: 1, rate: 28000, amount: 28000 },
    { description: 'Paper Recycling Service', quantity: 1, rate: 5000, amount: 5000 },
    { description: 'Monthly Sustainability Report', quantity: 1, rate: 2000, amount: 2000 }
  ]},
  { id: 'INV-2024-005', customerId: 'CUS-001', customerName: 'Rajesh Sharma', amount: 800, date: '2024-12-01', dueDate: '2024-12-15', status: 'paid', items: [
    { description: 'Standard Residential Collection - December 2024', quantity: 1, rate: 800, amount: 800 }
  ]},
  { id: 'INV-2024-006', customerId: 'CUS-010', customerName: 'Kavitha Textiles', amount: 18500, date: '2024-12-05', dueDate: '2024-12-20', status: 'pending', items: [
    { description: 'Industrial Collection - December 2024', quantity: 1, rate: 15000, amount: 15000 },
    { description: 'Textile Waste Processing', quantity: 1, rate: 3500, amount: 3500 }
  ]},
  { id: 'INV-2024-007', customerId: 'CUS-005', customerName: 'Mohammed Khalid', amount: 1200, date: '2024-11-01', dueDate: '2024-11-15', status: 'paid', items: [
    { description: 'Standard Residential Collection - November 2024', quantity: 1, rate: 1200, amount: 1200 }
  ]},
  { id: 'INV-2024-008', customerId: 'CUS-003', customerName: 'Anita Deshmukh', amount: 500, date: '2024-12-01', dueDate: '2024-12-15', status: 'pending', items: [
    { description: 'Basic Residential Collection - December 2024', quantity: 1, rate: 500, amount: 500 }
  ]}
];

class BillingModule {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.invoices = this.loadData();
    this.currentFilter = 'all';
    
    if (this.container) {
      this.init();
    }
  }

  loadData() {
    const data = localStorage.getItem('ecoflow_invoices');
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem('ecoflow_invoices', JSON.stringify(sampleInvoices));
    return sampleInvoices;
  }

  saveData() {
    localStorage.setItem('ecoflow_invoices', JSON.stringify(this.invoices));
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  init() {
    this.container.innerHTML = `
      <div class="billing-dashboard">
        <div class="stats-container" id="billing-stats"></div>
        
        <div class="chart-container" style="margin: 20px 0; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
          <h3>Revenue Trends</h3>
          <canvas id="revenueChart" width="800" height="200"></canvas>
        </div>

        <div class="actions-bar" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div class="filters">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="paid">Paid</button>
            <button class="filter-btn" data-filter="pending">Pending</button>
            <button class="filter-btn" data-filter="overdue">Overdue</button>
          </div>
          <button class="primary-btn" id="new-invoice-btn">+ New Invoice</button>
        </div>

        <div class="table-container" style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="invoices-tbody"></tbody>
          </table>
        </div>
      </div>
      
      <!-- Modals -->
      <div id="invoice-modal" class="modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; padding: 40px; overflow-y: auto;">
        <div class="modal-content" style="background: #1e1e1e; color: #fff; max-width: 800px; margin: 0 auto; padding: 40px; border-radius: 12px; position: relative;">
          <button class="close-modal" style="position: absolute; right: 20px; top: 20px; background: none; border: none; color: #fff; font-size: 24px; cursor: pointer;">&times;</button>
          <div id="invoice-preview-content" style="background: #fff; color: #000; padding: 40px;"></div>
          <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
            <button id="print-btn" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Print / PDF</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.filterInvoices(e.target.dataset.filter);
      });
    });

    document.getElementById('new-invoice-btn')?.addEventListener('click', () => {
      alert('Generate Invoice Form to be implemented.');
    });

    const modal = document.getElementById('invoice-modal');
    modal?.querySelector('.close-modal')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    document.getElementById('print-btn')?.addEventListener('click', () => {
      const content = document.getElementById('invoice-preview-content').innerHTML;
      const printWindow = window.open('', '', 'height=600,width=800');
      printWindow.document.write('<html><head><title>Print Invoice</title>');
      printWindow.document.write('<style>body{font-family: sans-serif;} table{width: 100%; border-collapse: collapse;} th,td{border: 1px solid #ddd; padding: 8px;}</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(content);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    });
  }

  render() {
    this.renderBillingSummary();
    this.renderInvoices(this.currentFilter);
    this.renderChart();
  }

  renderBillingSummary() {
    let total = 0, outstanding = 0, overdue = 0, thisMonth = 0;
    const currentMonth = '2024-12';

    this.invoices.forEach(inv => {
      total += inv.amount;
      if (inv.status === 'pending') outstanding += inv.amount;
      if (inv.status === 'overdue') overdue += inv.amount;
      if (inv.date.startsWith(currentMonth)) thisMonth += inv.amount;
    });

    const statsHtml = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #4CAF50;">
          <h4 style="margin: 0 0 10px 0; color: #aaa;">Total Revenue</h4>
          <h2 style="margin: 0; font-size: 24px;">${this.formatCurrency(total)}</h2>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #FFC107;">
          <h4 style="margin: 0 0 10px 0; color: #aaa;">Outstanding</h4>
          <h2 style="margin: 0; font-size: 24px;">${this.formatCurrency(outstanding)}</h2>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #F44336;">
          <h4 style="margin: 0 0 10px 0; color: #aaa;">Overdue</h4>
          <h2 style="margin: 0; font-size: 24px;">${this.formatCurrency(overdue)}</h2>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border-left: 4px solid #2196F3;">
          <h4 style="margin: 0 0 10px 0; color: #aaa;">This Month</h4>
          <h2 style="margin: 0; font-size: 24px;">${this.formatCurrency(thisMonth)}</h2>
        </div>
      </div>
    `;
    
    const statsContainer = document.getElementById('billing-stats');
    if (statsContainer) statsContainer.innerHTML = statsHtml;
  }

  filterInvoices(status) {
    this.currentFilter = status;
    this.renderInvoices(status);
  }

  renderInvoices(filter = 'all') {
    const tbody = document.getElementById('invoices-tbody');
    if (!tbody) return;

    let html = '';
    const filtered = filter === 'all' ? this.invoices : this.invoices.filter(i => i.status === filter);

    filtered.forEach(inv => {
      let statusColor = inv.status === 'paid' ? '#4CAF50' : (inv.status === 'pending' ? '#FFC107' : '#F44336');
      
      html += `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
          <td style="padding: 15px 10px;">${inv.id}</td>
          <td style="padding: 15px 10px;">${inv.customerName}</td>
          <td style="padding: 15px 10px;">${inv.date}</td>
          <td style="padding: 15px 10px;">${inv.dueDate}</td>
          <td style="padding: 15px 10px; font-weight: bold;">${this.formatCurrency(inv.amount)}</td>
          <td style="padding: 15px 10px;">
            <span style="background: ${statusColor}22; color: ${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase;">
              ${inv.status}
            </span>
          </td>
          <td style="padding: 15px 10px;">
            <button onclick="window.billingModule.showInvoicePreview('${inv.id}')" style="background: rgba(255,255,255,0.1); border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">View</button>
            ${inv.status !== 'paid' ? `<button onclick="window.billingModule.markAsPaid('${inv.id}')" style="background: #4CAF50; border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Mark Paid</button>` : ''}
            ${inv.status === 'overdue' ? `<button onclick="window.billingModule.sendReminder('${inv.id}')" style="background: #FFC107; border: none; color: black; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Remind</button>` : ''}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  showInvoicePreview(id) {
    const inv = this.invoices.find(i => i.id === id);
    if (!inv) return;

    const modal = document.getElementById('invoice-modal');
    const content = document.getElementById('invoice-preview-content');
    
    let itemsHtml = inv.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${this.formatCurrency(item.rate)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${this.formatCurrency(item.amount)}</td>
      </tr>
    `).join('');

    const subtotal = inv.amount;
    const gst = subtotal * 0.18;
    const grandTotal = subtotal + gst;

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 20px;">
        <div>
          <h1 style="color: #4CAF50; margin: 0; font-size: 28px;">EcoFlow</h1>
          <p style="margin: 5px 0; color: #666;">Smart Waste Management Solutions</p>
          <p style="margin: 0; color: #666;">123 Green Tech Park, Bangalore 560001</p>
          <p style="margin: 0; color: #666;">GSTIN: 29ABCDE1234F1Z5</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 24px; color: #333;">INVOICE</h2>
          <p style="margin: 5px 0;"><strong>Invoice #:</strong> ${inv.id}</p>
          <p style="margin: 0;"><strong>Date:</strong> ${inv.date}</p>
          <p style="margin: 0;"><strong>Due Date:</strong> ${inv.dueDate}</p>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="color: #333; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">Bill To:</h3>
        <p style="margin: 0; font-weight: bold; font-size: 16px;">${inv.customerName}</p>
        <p style="margin: 5px 0; color: #666;">Customer ID: ${inv.customerId}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Description</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Rate</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 20px;">
        <div style="width: 50%;">
          <h4 style="margin: 0 0 10px 0;">Payment Terms & Bank Details</h4>
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">Bank: State Bank of India</p>
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">A/c Name: EcoFlow Waste Mgt</p>
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">A/c No: 31245678901</p>
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">IFSC: SBIN0001234</p>
        </div>
        <div style="width: 40%;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Subtotal:</span>
            <span>${this.formatCurrency(subtotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>GST (18%):</span>
            <span>${this.formatCurrency(gst)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 10px; border-top: 2px solid #333; padding-top: 10px;">
            <span>Grand Total:</span>
            <span>${this.formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'block';
  }

  markAsPaid(id) {
    const inv = this.invoices.find(i => i.id === id);
    if (inv) {
      inv.status = 'paid';
      this.saveData();
      this.render();
      alert(`Invoice ${id} marked as paid.`);
    }
  }

  sendReminder(id) {
    alert(`Payment reminder sent to customer for invoice ${id}`);
  }

  renderChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Simple bar chart by month
    const monthlyData = { '2024-11': 0, '2024-12': 0 };
    this.invoices.forEach(inv => {
      const month = inv.date.substring(0, 7);
      if (monthlyData[month] !== undefined) {
        monthlyData[month] += inv.amount;
      }
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const labels = Object.keys(monthlyData).sort();
    const values = labels.map(l => monthlyData[l]);
    const maxVal = Math.max(...values, 100000);
    
    const barWidth = 60;
    const spacing = 100;
    let startX = 100;
    
    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    
    // Draw Y axis labels
    ctx.fillText(this.formatCurrency(maxVal), 10, 20);
    ctx.fillText(this.formatCurrency(maxVal/2), 10, 100);
    ctx.fillText('0', 10, 180);
    
    // Draw bars
    labels.forEach((label, i) => {
      const val = values[i];
      const barHeight = (val / maxVal) * 160;
      
      // Bar
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(startX, 180 - barHeight, barWidth, barHeight);
      
      // Label
      ctx.fillStyle = '#fff';
      ctx.fillText(label, startX + 5, 195);
      
      startX += spacing;
    });
  }
}

// Global attachment for inline onclick handlers
window.BillingModule = BillingModule;
