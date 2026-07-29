const Customers = {
  customers: [],
  
  sampleCustomers: [
    { id: 'CUS-001', name: 'Rajesh Sharma', phone: '+91 98765 43210', email: 'rajesh.sharma@email.com', type: 'residential', address: '42, 1st Cross, Koramangala 1st Block', ward: 'Ward 68', zone: 'Koramangala', plan: 'standard', status: 'active', outstanding: 0, joinDate: '2023-03-15', avatar: '👨' },
    { id: 'CUS-002', name: 'Priya Enterprises Pvt Ltd', phone: '+91 80 4567 8901', email: 'admin@priyaenterprises.in', type: 'commercial', address: '15, 100 Feet Road, Indiranagar', ward: 'Ward 74', zone: 'Indiranagar', plan: 'premium', status: 'active', outstanding: 12500, joinDate: '2022-11-20', avatar: '🏢' },
    { id: 'CUS-003', name: 'Anita Deshmukh', phone: '+91 99876 54321', email: 'anita.d@email.com', type: 'residential', address: '8, 3rd Main, HSR Layout Sector 2', ward: 'Ward 174', zone: 'HSR Layout', plan: 'basic', status: 'active', outstanding: 500, joinDate: '2024-01-10', avatar: '👩' },
    { id: 'CUS-004', name: 'Bangalore Steel Works', phone: '+91 80 2345 6789', email: 'ops@blrsteelworks.com', type: 'industrial', address: 'Plot 27, Peenya Industrial Area', ward: 'Ward 8', zone: 'Peenya', plan: 'premium', status: 'active', outstanding: 45000, joinDate: '2021-06-05', avatar: '🏭' },
    { id: 'CUS-005', name: 'Mohammed Khalid', phone: '+91 97654 32109', email: 'khalid.m@email.com', type: 'residential', address: '23, 5th Cross, JP Nagar 2nd Phase', ward: 'Ward 177', zone: 'JP Nagar', plan: 'standard', status: 'active', outstanding: 0, joinDate: '2023-08-22', avatar: '👨' },
    { id: 'CUS-006', name: 'Green Valley Apartments', phone: '+91 80 6789 0123', email: 'gva.admin@email.com', type: 'commercial', address: 'Green Valley Complex, Whitefield', ward: 'Ward 85', zone: 'Whitefield', plan: 'premium', status: 'active', outstanding: 28000, joinDate: '2022-04-18', avatar: '🏢' },
    { id: 'CUS-007', name: 'Lakshmi Narayanan', phone: '+91 96543 21098', email: 'lakshmi.n@email.com', type: 'residential', address: '56, 11th Main, Jayanagar 4th Block', ward: 'Ward 170', zone: 'Jayanagar', plan: 'basic', status: 'inactive', outstanding: 2000, joinDate: '2023-05-30', avatar: '👩' },
    { id: 'CUS-008', name: 'TechPark Solutions', phone: '+91 80 3456 7890', email: 'facility@techpark.in', type: 'commercial', address: 'Prestige Tech Park, Marathahalli', ward: 'Ward 83', zone: 'Marathahalli', plan: 'premium', status: 'active', outstanding: 0, joinDate: '2022-09-12', avatar: '🏢' },
    { id: 'CUS-009', name: 'Suresh Reddy', phone: '+91 98765 12345', email: 'suresh.r@email.com', type: 'residential', address: '12, 2nd Cross, Electronic City Phase 1', ward: 'Ward 192', zone: 'Electronic City', plan: 'standard', status: 'active', outstanding: 1500, joinDate: '2024-02-28', avatar: '👨' },
    { id: 'CUS-010', name: 'Kavitha Textiles', phone: '+91 80 7890 1234', email: 'info@kavithatextiles.com', type: 'industrial', address: 'Unit 5, Bommasandra Industrial Area', ward: 'Ward 194', zone: 'Bommasandra', plan: 'standard', status: 'active', outstanding: 8500, joinDate: '2023-01-25', avatar: '🏭' }
  ],

  init() {
    this.loadCustomers();
    this.renderCustomers('all', '');
  },

  loadCustomers() {
    const stored = localStorage.getItem('ecoFlow_customers');
    if (stored) {
      this.customers = JSON.parse(stored);
    } else {
      this.customers = [...this.sampleCustomers];
      this.saveCustomers();
    }
  },

  saveCustomers() {
    localStorage.setItem('ecoFlow_customers', JSON.stringify(this.customers));
  },

  renderCustomers(filterType = 'all', searchQuery = '') {
    const tableBody = document.getElementById('customers-table-body');
    if (!tableBody) return;

    let filtered = this.customers;
    
    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.type === filterType.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.zone.toLowerCase().includes(q) || 
        c.ward.toLowerCase().includes(q)
      );
    }

    tableBody.innerHTML = filtered.map(customer => {
      const typeColor = customer.type === 'residential' ? 'bg-emerald-500/20 text-emerald-400' : 
                        customer.type === 'commercial' ? 'bg-blue-500/20 text-blue-400' : 
                        'bg-purple-500/20 text-purple-400';
                        
      const isOverdue = customer.outstanding > 0;
      
      return \`
        <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
          <td class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                \${customer.avatar}
              </div>
              <div>
                <p class="font-medium text-gray-200">\${customer.name}</p>
                <p class="text-xs text-gray-500">\${customer.email}</p>
              </div>
            </div>
          </td>
          <td class="p-4">
            <span class="px-2 py-1 text-xs rounded-full capitalize font-medium \${typeColor}">
              \${customer.type}
            </span>
          </td>
          <td class="p-4">
            <p class="text-sm text-gray-300">\${customer.zone}</p>
            <p class="text-xs text-gray-500">\${customer.ward}</p>
          </td>
          <td class="p-4">
            <span class="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-300 uppercase tracking-wider">
              \${customer.plan}
            </span>
          </td>
          <td class="p-4">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full \${customer.status === 'active' ? 'bg-green-500' : 'bg-red-500'}"></div>
              <span class="text-sm capitalize">\${customer.status}</span>
            </div>
          </td>
          <td class="p-4 text-right">
            <span class="text-sm font-medium \${isOverdue ? 'text-red-400' : 'text-gray-300'}">
              ₹\${customer.outstanding.toLocaleString()}
            </span>
          </td>
          <td class="p-4 text-right">
            <button onclick="Customers.showCustomerDetail('\${customer.id}')" class="text-blue-400 hover:text-blue-300 mr-2 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
            <button onclick="Customers.deleteCustomer('\${customer.id}')" class="text-red-400 hover:text-red-300 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </td>
        </tr>
      \`;
    }).join('');
  },

  filterByType(type) {
    this.renderCustomers(type, document.getElementById('customer-search')?.value || '');
  },

  searchCustomers(query) {
    this.renderCustomers('all', query);
  },

  showCustomerDetail(id) {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) return;
    
    console.log('Customer Details:', customer);
    alert(\`Viewing details for \${customer.name}\`);
  },

  showAddCustomerForm() {
    console.log('Open add customer modal');
  },

  addCustomer(data) {
    const id = 'CUS-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newCustomer = {
      id,
      ...data,
      status: 'active',
      outstanding: 0,
      joinDate: new Date().toISOString().split('T')[0],
      avatar: data.type === 'residential' ? '👨' : data.type === 'commercial' ? '🏢' : '🏭'
    };
    
    this.customers.push(newCustomer);
    this.saveCustomers();
    this.renderCustomers();
    this.showToast('Customer added successfully');
  },

  editCustomer(id, data) {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx > -1) {
      this.customers[idx] = { ...this.customers[idx], ...data };
      this.saveCustomers();
      this.renderCustomers();
      this.showToast('Customer updated successfully');
    }
  },

  deleteCustomer(id) {
    if (confirm('Are you sure you want to remove this customer?')) {
      this.customers = this.customers.filter(c => c.id !== id);
      this.saveCustomers();
      this.renderCustomers();
      this.showToast('Customer deleted successfully');
    }
  },
  
  showToast(msg) {
    console.log('Toast:', msg);
    alert(msg);
  }
};

export default Customers;
