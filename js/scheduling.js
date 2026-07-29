const Scheduling = {
  currentDate: new Date(),
  currentView: 'month',
  schedules: [],

  sampleSchedules: [
    { id: 'SCH-001', zone: 'Koramangala', ward: 'Ward 68', wasteTypes: ['wet', 'dry'], frequency: 'daily', timeSlot: '06:00-08:00', vehicle: 'KA-01-AB-1234', driver: 'Rajesh Kumar', status: 'active', color: '#10b981' },
    { id: 'SCH-002', zone: 'Indiranagar', ward: 'Ward 74', wasteTypes: ['wet', 'dry'], frequency: 'daily', timeSlot: '08:00-10:00', vehicle: 'KA-01-CD-5678', driver: 'Suresh Patel', status: 'active', color: '#3b82f6' },
    { id: 'SCH-003', zone: 'HSR Layout', ward: 'Ward 174', wasteTypes: ['e-waste'], frequency: 'weekly', timeSlot: '10:00-12:00', vehicle: 'KA-01-EF-9012', driver: 'Amit Singh', status: 'active', color: '#f59e0b' },
    { id: 'SCH-004', zone: 'JP Nagar', ward: 'Ward 177', wasteTypes: ['wet', 'dry', 'hazardous'], frequency: 'daily', timeSlot: '06:00-08:00', vehicle: 'KA-01-GH-3456', driver: 'Pradeep Rao', status: 'active', color: '#8b5cf6' },
    { id: 'SCH-005', zone: 'Whitefield', ward: 'Ward 85', wasteTypes: ['bulk'], frequency: 'bi-weekly', timeSlot: '14:00-16:00', vehicle: 'KA-01-IJ-7890', driver: 'Mohammed Asif', status: 'pending', color: '#ef4444' },
    { id: 'SCH-006', zone: 'Jayanagar', ward: 'Ward 170', wasteTypes: ['wet', 'dry'], frequency: 'alternate', timeSlot: '07:00-09:00', vehicle: 'KA-01-KL-2345', driver: 'Venkatesh B', status: 'active', color: '#06d6a0' },
    { id: 'SCH-007', zone: 'Marathahalli', ward: 'Ward 83', wasteTypes: ['wet', 'dry'], frequency: 'daily', timeSlot: '06:30-08:30', vehicle: 'KA-01-MN-6789', driver: 'Ganesh R', status: 'active', color: '#14b8a6' },
    { id: 'SCH-008', zone: 'Electronic City', ward: 'Ward 192', wasteTypes: ['e-waste', 'hazardous'], frequency: 'weekly', timeSlot: '09:00-11:00', vehicle: 'KA-01-OP-0123', driver: 'Naveen K', status: 'active', color: '#fbbf24' }
  ],

  init() {
    this.loadSchedules();
    this.renderCalendar();
    this.renderUpcoming();
    this.bindEvents();
  },

  loadSchedules() {
    const stored = localStorage.getItem('ecoFlow_schedules');
    if (stored) {
      this.schedules = JSON.parse(stored);
    } else {
      this.schedules = [...this.sampleSchedules];
      this.saveSchedules();
    }
  },

  saveSchedules() {
    localStorage.setItem('ecoFlow_schedules', JSON.stringify(this.schedules));
  },

  renderCalendar() {
    const calendarEl = document.getElementById('calendar-grid');
    if (!calendarEl) return;
    
    calendarEl.innerHTML = '';
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayEl = this.createDayElement(prevMonthDays - i, true);
      calendarEl.appendChild(dayEl);
    }
    
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = date.toDateString() === today.toDateString();
      const dayEl = this.createDayElement(i, false, isToday, date);
      calendarEl.appendChild(dayEl);
    }
    
    const totalCells = firstDay + daysInMonth;
    const nextDays = Math.ceil(totalCells / 7) * 7 - totalCells;
    for (let i = 1; i <= nextDays; i++) {
      const dayEl = this.createDayElement(i, true);
      calendarEl.appendChild(dayEl);
    }
    
    const monthYearEl = document.getElementById('calendar-month-year');
    if (monthYearEl) {
      monthYearEl.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
    }
  },

  createDayElement(dayNumber, isTrailing, isToday = false, dateObj = null) {
    const div = document.createElement('div');
    div.className = \`calendar-day p-2 border border-white/10 rounded-lg min-h-[100px] flex flex-col \${isTrailing ? 'opacity-50' : 'bg-white/5 hover:bg-white/10 cursor-pointer transition-colors'} \${isToday ? 'ring-2 ring-blue-500 bg-blue-500/10' : ''}\`;
    
    const header = document.createElement('div');
    header.className = 'text-sm font-semibold mb-2 flex justify-between';
    header.innerHTML = \`<span>\${dayNumber}</span>\`;
    div.appendChild(header);
    
    if (!isTrailing && dateObj) {
      const daySchedules = this.getSchedulesByDate(dateObj);
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'flex flex-wrap gap-1 mt-auto';
      
      daySchedules.slice(0, 3).forEach(sch => {
        const dot = document.createElement('div');
        dot.className = 'w-2 h-2 rounded-full';
        dot.style.backgroundColor = sch.color;
        dot.title = \`\${sch.zone} - \${sch.wasteTypes.join(', ')}\`;
        dotsContainer.appendChild(dot);
      });
      
      if (daySchedules.length > 3) {
        const more = document.createElement('div');
        more.className = 'text-[10px] text-gray-400 leading-none';
        more.textContent = \`+\${daySchedules.length - 3}\`;
        dotsContainer.appendChild(more);
      }
      
      div.appendChild(dotsContainer);
      
      div.addEventListener('click', () => {
        this.showDayDetails(dateObj, daySchedules);
      });
    }
    
    return div;
  },

  getSchedulesByDate(date) {
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    
    return this.schedules.filter(sch => {
      if (sch.status !== 'active') return false;
      if (sch.frequency === 'daily') return true;
      if (sch.frequency === 'alternate') return dayOfMonth % 2 === 0;
      if (sch.frequency === 'weekly') return dayOfWeek === 1; 
      if (sch.frequency === 'bi-weekly') return dayOfWeek === 3 && dayOfMonth < 15; 
      return false;
    });
  },

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.renderCalendar();
  },

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.renderCalendar();
  },

  changeView(view) {
    this.currentView = view;
  },

  renderUpcoming() {
    const listEl = document.getElementById('upcoming-schedules-list');
    if (!listEl) return;
    
    const upcoming = this.getSchedulesByDate(new Date()).slice(0, 5);
    
    listEl.innerHTML = upcoming.map(sch => \`
      <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 mb-2">
        <div class="flex flex-col">
          <span class="font-semibold text-sm">\${sch.zone}</span>
          <div class="flex gap-1 mt-1">
            \${sch.wasteTypes.map(t => \`<span class="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/20 capitalize">\${t}</span>\`).join('')}
          </div>
        </div>
        <div class="text-right flex flex-col items-end">
          <span class="text-sm font-medium" style="color: \${sch.color}">\${sch.timeSlot}</span>
          <span class="text-xs text-gray-400 mt-1">\${sch.vehicle}</span>
        </div>
      </div>
    \`).join('');
  },
  
  showDayDetails(date, schedules) {
    console.log('Day details:', date, schedules);
  },

  addSchedule(data) {
    const id = 'SCH-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newSchedule = {
      id,
      ...data,
      status: 'active',
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    this.schedules.push(newSchedule);
    this.saveSchedules();
    this.renderCalendar();
    this.renderUpcoming();
    this.showToast('Schedule added successfully');
  },

  editSchedule(id, data) {
    const idx = this.schedules.findIndex(s => s.id === id);
    if (idx > -1) {
      this.schedules[idx] = { ...this.schedules[idx], ...data };
      this.saveSchedules();
      this.renderCalendar();
      this.renderUpcoming();
      this.showToast('Schedule updated successfully');
    }
  },

  deleteSchedule(id) {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.schedules = this.schedules.filter(s => s.id !== id);
      this.saveSchedules();
      this.renderCalendar();
      this.renderUpcoming();
      this.showToast('Schedule deleted successfully');
    }
  },
  
  showToast(message) {
    console.log('TOAST:', message);
    alert(message);
  },
  
  bindEvents() {
    const prevBtn = document.getElementById('prev-month-btn');
    const nextBtn = document.getElementById('next-month-btn');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevMonth());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextMonth());
  }
};

export default Scheduling;
