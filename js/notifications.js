const Notifications = {
  items: [],
  
  notificationPool: [
    { type: 'success', title: 'Collection Complete', message: 'Route {route} completed all stops in {area}' },
    { type: 'info', title: 'New Customer', message: '{name} registered from {area}' },
    { type: 'warning', title: 'Low Fuel Alert', message: 'Vehicle {reg} fuel below 25%' },
    { type: 'success', title: 'Payment Received', message: '₹{amount} from {customer}' },
    { type: 'info', title: 'Schedule Updated', message: '{area} collection rescheduled to {time}' },
    { type: 'warning', title: 'Capacity Alert', message: 'Vehicle {reg} reaching 90% capacity' },
    { type: 'error', title: 'Missed Collection', message: 'Route {route} missed stop at {location}' },
    { type: 'success', title: 'Recycling Milestone', message: '{area} achieved {rate}% recycling rate!' }
  ],

  // Mock data for notification substitution
  mockData: {
    routes: ['RT-01', 'RT-05', 'RT-12', 'RT-42'],
    areas: ['Indiranagar', 'Koramangala', 'Jayanagar', 'Whitefield', 'HSR Layout'],
    names: ['Rahul S.', 'Priya M.', 'Amit K.', 'Sneha P.'],
    regs: ['KA-01-AB-1234', 'KA-53-XY-9876', 'KA-05-MN-4567'],
    amounts: ['500', '1250', '3000', '450'],
    customers: ['Eco Apartments', 'Tech Park Zeta', 'Green Villa Society'],
    times: ['06:00 AM', '14:30 PM', 'Tomorrow 08:00 AM'],
    locations: ['Sector 4 Gate', 'Main Road Bin', 'Block B Basement'],
    rates: ['45', '60', '75', '85']
  },

  init() {
    // Attempt to load from global app if available, else initialize empty
    if (typeof window !== 'undefined' && window.app && window.app.sampleNotifications) {
      this.items = [...window.app.sampleNotifications];
    } else {
      this.items = [];
    }
    
    this.renderNotificationDropdown();
    this.updateBadgeCount();
    this.bindEvents();
    
    // Simulate real-time notifications every 45 seconds
    setInterval(() => this.simulateNewNotification(), 45000);
  },

  bindEvents() {
    const markAllBtn = document.getElementById('mark-all-read-btn');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.markAllAsRead();
      });
    }
  },

  getRandomMock(key) {
    const arr = this.mockData[key];
    return arr[Math.floor(Math.random() * arr.length)];
  },

  simulateNewNotification() {
    const template = this.notificationPool[Math.floor(Math.random() * this.notificationPool.length)];
    
    let msg = template.message
      .replace('{route}', this.getRandomMock('routes'))
      .replace('{area}', this.getRandomMock('areas'))
      .replace('{name}', this.getRandomMock('names'))
      .replace('{reg}', this.getRandomMock('regs'))
      .replace('{amount}', this.getRandomMock('amounts'))
      .replace('{customer}', this.getRandomMock('customers'))
      .replace('{time}', this.getRandomMock('times'))
      .replace('{location}', this.getRandomMock('locations'))
      .replace('{rate}', this.getRandomMock('rates'));
      
    const newNotif = {
      id: Date.now().toString(),
      type: template.type,
      title: template.title,
      message: msg,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    this.addNotification(newNotif);
  },

  addNotification(notification) {
    this.items.unshift(notification);
    
    // Keep max 50 notifications
    if (this.items.length > 50) {
      this.items.pop();
    }
    
    this.renderNotificationDropdown();
    this.updateBadgeCount();
    this.showToast(notification);
    this.playNotificationSound();
  },

  renderNotificationDropdown() {
    const container = document.getElementById('notifications-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="px-4 py-6 text-center text-gray-500">
          <div class="mb-2">📭</div>
          <p class="text-sm">No notifications yet</p>
        </div>
      `;
      return;
    }
    
    this.items.forEach(notif => {
      const typeIcons = {
        success: '✅',
        info: 'ℹ️',
        warning: '⚠️',
        error: '🚨'
      };
      
      const typeColors = {
        success: 'text-emerald-500',
        info: 'text-blue-500',
        warning: 'text-amber-500',
        error: 'text-red-500'
      };
      
      const notifEl = document.createElement('div');
      notifEl.className = `p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`;
      notifEl.onclick = () => this.markAsRead(notif.id);
      
      notifEl.innerHTML = `
        <div class="shrink-0 mt-1 ${typeColors[notif.type] || 'text-gray-500'}">
          ${typeIcons[notif.type] || '🔔'}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start mb-1">
            <h4 class="text-sm font-semibold text-gray-800 truncate ${!notif.read ? 'font-bold' : ''}">${notif.title}</h4>
            <span class="text-xs text-gray-500 whitespace-nowrap ml-2">${this.formatRelativeTime(notif.timestamp)}</span>
          </div>
          <p class="text-sm text-gray-600 line-clamp-2">${notif.message}</p>
        </div>
        ${!notif.read ? '<div class="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>' : ''}
      `;
      
      container.appendChild(notifEl);
    });
  },

  updateBadgeCount() {
    const badge = document.getElementById('notifications-badge');
    if (!badge) return;
    
    const unreadCount = this.items.filter(item => !item.read).length;
    
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.classList.remove('hidden');
      
      // Animate badge
      badge.classList.add('animate-pulse');
      setTimeout(() => badge.classList.remove('animate-pulse'), 1000);
    } else {
      badge.classList.add('hidden');
    }
  },

  markAsRead(id) {
    const notif = this.items.find(item => item.id === id);
    if (notif && !notif.read) {
      notif.read = true;
      this.renderNotificationDropdown();
      this.updateBadgeCount();
    }
  },

  markAllAsRead() {
    let changed = false;
    this.items.forEach(item => {
      if (!item.read) {
        item.read = true;
        changed = true;
      }
    });
    
    if (changed) {
      this.renderNotificationDropdown();
      this.updateBadgeCount();
    }
  },

  showToast(notification) {
    // Simple toast implementation
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = 'bg-white border border-gray-100 shadow-lg rounded-lg p-4 mb-3 flex items-start gap-3 transform transition-all duration-300 translate-x-full';
    
    toast.innerHTML = `
      <div class="flex-1">
        <h4 class="text-sm font-bold text-gray-800">${notification.title}</h4>
        <p class="text-sm text-gray-600">${notification.message}</p>
      </div>
      <button class="text-gray-400 hover:text-gray-600">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 10);
    
    // Add close listener
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => {
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), 300);
    });
    
    // Auto remove after 5s
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
          if (toast.parentNode) toast.remove();
        }, 300);
      }
    }, 5000);
  },

  playNotificationSound() {
    // Subtle, optional sound
    try {
      // Just an example, requires valid audio file context in real app
      // const audio = new Audio('/assets/sounds/notification.mp3');
      // audio.volume = 0.2;
      // audio.play().catch(e => console.log('Audio autoplay prevented'));
    } catch (e) {
      // Ignore audio errors
    }
  },

  formatRelativeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    return `${diffDay}d ago`;
  }
};

if (typeof window !== 'undefined') {
  window.Notifications = Notifications;
}
export default Notifications;
