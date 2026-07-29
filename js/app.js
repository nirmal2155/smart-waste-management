// === PERFORMANCE MONITORING ===
window.addEventListener('error', (e) => {
  console.error('[EcoFlow Error]', e.message, e.filename, e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[EcoFlow Promise Error]', e.reason);
});
performance.mark('ecoflow-start');

/**
 * EcoFlow Waste Management System - Core Application Module
 * Handles SPA routing, UI state, global utilities, notifications, and theme management.
 */

// --- GLOBAL UTILITIES ---
const Utils = {
    /**
     * Formats a number to Indian Rupee currency format
     * @param {number} amount - The amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    },

    /**
     * Formats a Date object to a locale date string
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Formats a Date object to a time string
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted time string
     */
    formatTime(date) {
        const d = new Date(date);
        return d.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },

    /**
     * Generates a unique ID
     * @returns {string} Unique ID prefixed with ECF-
     */
    generateId() {
        return 'ECF-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
    },

    /**
     * Creates a debounced function that delays invoking func until after wait milliseconds
     * @param {Function} fn - The function to debounce
     * @param {number} delay - The number of milliseconds to delay
     * @returns {Function} Debounced function
     */
    debounce(fn, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Animates a numerical counter from 0 to target
     * @param {HTMLElement} element - The DOM element to update
     * @param {number} target - The target number
     * @param {number} duration - Animation duration in ms
     */
    animateCounter(element, target, duration = 2000) {
        if (!element) return;
        const start = 0;
        const increment = target / (duration / 16); // Assuming 60fps
        let current = start;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.innerText = Math.ceil(current).toLocaleString('en-IN');
                requestAnimationFrame(updateCounter);
            } else {
                element.innerText = target.toLocaleString('en-IN');
            }
        };
        updateCounter();
    },

    /**
     * Retrieves data from localStorage with JSON parsing
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key doesn't exist
     * @returns {*} Parsed data or default value
     */
    getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage', e);
            return defaultValue;
        }
    },

    /**
     * Saves data to localStorage with JSON stringification
     * @param {string} key - Storage key
     * @param {*} data - Data to save
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Error writing to localStorage', e);
        }
    },

    /**
     * Escapes unsafe HTML characters to prevent XSS injection
     * @param {string} str - Raw string input
     * @returns {string} Escaped safe HTML string
     */
    escapeHTML(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Sanitizes string removing script tags and inline handlers
     * @param {string} str - Input HTML string
     * @returns {string} Sanitized string
     */
    sanitizeHTML(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:[^"']*/gi, '');
    },

    /** Form Validator for Email */
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /** Form Validator for Indian Phone Numbers */
    validatePhone(phone) {
        return /^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/\s+/g, ''));
    },

    /** Form Validator for Indian GSTIN format */
    validateGST(gstin) {
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.trim().toUpperCase());
    }
};

// --- CORE APPLICATION ---
const EcoFlow = {
    currentPage: 'dashboard',
    pages: ['dashboard', 'scheduling', 'routes', 'customers', 'billing', 'analytics', 'fleet', 'ai-assistant', 'ai-vision', 'grievances', 'iot-bins', 'command-center', 'carbon-trading', 'smart-bins', 'admin', 'super-admin-login'],
    
    // Sample notifications data
    notifications: [
        { id: 1, type: 'info', title: 'New Collection Assigned', message: 'Route A-12 Koramangala has been assigned to KA-01-AB-1234', time: '5 min ago', read: false },
        { id: 2, type: 'warning', title: 'Vehicle Maintenance Due', message: 'KA-01-CD-5678 maintenance scheduled for tomorrow', time: '1 hour ago', read: false },
        { id: 3, type: 'success', title: 'Payment Received', message: '₹45,000 received from Infosys Tech Park', time: '2 hours ago', read: true },
        { id: 4, type: 'error', title: 'Missed Collection', message: 'Route B-7 JP Nagar collection was missed', time: '3 hours ago', read: false },
        { id: 5, type: 'info', title: 'Swachh Bharat Report', message: 'Monthly compliance report is ready for review', time: '5 hours ago', read: true }
    ],

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.initTheme();
        this.initSidebar();
        this.initNotifications();
        this.handleRouting();
        console.log('EcoFlow Application Initialized');
    },

    cacheDOM() {
        this.body = document.body;
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarToggleBtn = document.getElementById('sidebar-toggle');
        this.pageTitle = document.getElementById('page-title');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.pageSections = document.querySelectorAll('.page-section');
        this.notificationBell = document.getElementById('notification-bell');
        this.notificationDropdown = document.getElementById('notification-dropdown');
        this.notificationBadge = document.getElementById('notification-badge');
        this.notificationList = document.getElementById('notification-list');
        this.markAllReadBtn = document.getElementById('mark-all-read');
        this.searchInput = document.getElementById('global-search');
        this.searchResults = document.getElementById('search-results');
        this.themeToggleBtn = document.getElementById('theme-toggle');
        
        // Modal & Toast Containers (Create if they don't exist)
        if (!document.getElementById('modal-overlay')) {
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'modal-overlay';
            modalOverlay.className = 'modal-overlay hidden';
            modalOverlay.innerHTML = `
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 id="modal-title">Modal Title</h3>
                        <button id="modal-close" class="icon-btn"><i class="fas fa-times"></i></button>
                    </div>
                    <div id="modal-content" class="modal-body"></div>
                    <div id="modal-actions" class="modal-footer"></div>
                </div>
            `;
            document.body.appendChild(modalOverlay);
        }
        this.modalOverlay = document.getElementById('modal-overlay');
        this.modalCloseBtn = document.getElementById('modal-close');

        if (!document.getElementById('toast-container')) {
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        this.toastContainer = document.getElementById('toast-container');
    },

    bindEvents() {
        // Routing
        window.addEventListener('hashchange', () => this.handleRouting());

        // Explicit NavLink click handling
        if (this.navLinks) {
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    const targetAttr = link.getAttribute('data-target');
                    let page = '';

                    if (targetAttr) {
                        page = targetAttr.replace('-page', '');
                    } else if (href && href.startsWith('#')) {
                        page = href.substring(1);
                    }

                    if (page) {
                        this.navigate(page);
                    }
                });
            });
        }

        // Sidebar Toggle
        if (this.sidebarToggleBtn) {
            this.sidebarToggleBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Mobile Sidebar Overlay Close
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && this.sidebar && this.sidebar.classList.contains('active')) {
                if (!this.sidebar.contains(e.target) && e.target !== this.sidebarToggleBtn && !this.sidebarToggleBtn.contains(e.target)) {
                    this.sidebar.classList.remove('active');
                }
            }
        });

        // Notifications
        if (this.notificationBell) {
            this.notificationBell.addEventListener('click', (e) => {
                e.stopPropagation();
                this.notificationDropdown.classList.toggle('show');
            });
        }

        if (this.markAllReadBtn) {
            this.markAllReadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAllNotificationsRead();
            });
        }

        // Close dropdowns on outside click
        document.addEventListener('click', (e) => {
            if (this.notificationDropdown && this.notificationDropdown.classList.contains('show') && !this.notificationBell.contains(e.target)) {
                this.notificationDropdown.classList.remove('show');
            }
            if (this.searchResults && this.searchResults.classList.contains('show') && e.target !== this.searchInput) {
                this.searchResults.classList.remove('show');
            }
        });

        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', Utils.debounce((e) => this.handleSearch(e.target.value), 300));
            this.searchInput.addEventListener('focus', () => {
                if (this.searchInput.value.trim().length > 0) {
                    this.searchResults.classList.add('show');
                }
            });
        }

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.searchInput) this.searchInput.focus();
            }
            // Ctrl/Cmd + Shift + T to launch Test Suite
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'T' || e.key === 't')) {
                e.preventDefault();
                if (window.EcoFlowTestSuite) window.EcoFlowTestSuite.runAll();
            }
            // Escape to close modals/dropdowns
            if (e.key === 'Escape') {
                this.closeModal();
                if (this.notificationDropdown) this.notificationDropdown.classList.remove('show');
                if (this.searchResults) this.searchResults.classList.remove('show');
            }
        });

        // Theme Toggle
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Modal Close
        if (this.modalCloseBtn) {
            this.modalCloseBtn.addEventListener('click', () => this.closeModal());
        }
        if (this.modalOverlay) {
            this.modalOverlay.addEventListener('click', (e) => {
                if (e.target === this.modalOverlay) this.closeModal();
            });
        }
    },

    // --- ROUTING ---
    handleRouting() {
        let hash = window.location.hash.substring(1) || 'dashboard';
        
        // Handle routes with parameters (e.g., customers/123)
        const pathParts = hash.split('/');
        const page = pathParts[0];

        if (!this.pages.includes(page)) {
            hash = 'dashboard';
            window.location.hash = hash;
            return;
        }

        this.navigate(page, pathParts.slice(1));
    },

    navigate(page, params = []) {
        this.currentPage = page;
        performance.mark('nav-' + page);

        // Map route names to section IDs if necessary
        const pageIdMap = {
            'ai-assistant': 'ai-page',
            'ai': 'ai-page',
            'ai-vision': 'ai-vision-page',
            'grievances': 'grievances-page',
            'iot-bins': 'iot-bins-page',
            'command-center': 'command-center-page',
            'carbon-trading': 'carbon-trading-page',
            'smart-bins': 'smart-bins-page',
            'admin': 'admin-page',
            'super-admin-login': 'admin-page'
        };
        const targetId = pageIdMap[page] || `${page}-page`;

        // Hide all sections
        this.pageSections.forEach(section => {
            section.classList.remove('active');
            section.classList.add('hidden');
            section.style.display = 'none';
            section.style.opacity = '0';
        });

        // Show active section
        let activeSection = document.getElementById(targetId) || document.getElementById(`${page}-page`);
        if (activeSection) {
            activeSection.classList.remove('hidden');
            activeSection.classList.add('active');
            activeSection.style.display = 'block';
            activeSection.style.visibility = 'visible';
            void activeSection.offsetWidth;
            activeSection.style.opacity = '1';
        }

        // Update Nav Links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${page}` || (page === 'ai-assistant' && href === '#ai')) {
                link.classList.add('active');
            }
        });

        // Update Title
        if (this.pageTitle) {
            const titleMap = {
                'dashboard': 'Overview',
                'scheduling': 'Collection Scheduling',
                'routes': 'Route Optimization',
                'customers': 'Customer & Ward Management',
                'billing': 'Billing & Invoices',
                'analytics': 'Analytics & Swachh Reports',
                'fleet': 'Fleet Live Tracking',
                'ai-assistant': 'EcoFlow AI Assistant',
                'ai-vision': 'AI Waste Segregation',
                'grievances': 'Citizen Grievances & SLA',
                'iot-bins': 'IoT Sensor Fusion Bins Telemetry',
                'command-center': '🎯 City Command & Control Center',
                'carbon-trading': '🌿 Carbon Credits Marketplace',
                'smart-bins': '📡 Smart Bin Network — Digital Twin',
                'admin': 'Super Admin Authentication & Security Portal',
                'super-admin-login': 'Super Admin Authentication & Security Portal'
            };
            this.pageTitle.textContent = titleMap[page] || 'Overview';

            // Initialize page-specific modules on first load
            if (page === 'command-center' && window.CommandCenter && !CommandCenter.isLive) CommandCenter.init();
            if (page === 'carbon-trading' && window.CarbonTrading && !CarbonTrading._initialized) { CarbonTrading.init(); CarbonTrading._initialized = true; }
            if (page === 'smart-bins' && window.SmartBinNetwork && !SmartBinNetwork._initialized) { SmartBinNetwork.init(); SmartBinNetwork._initialized = true; }
        }

        // Mobile: auto close sidebar on navigation
        if (window.innerWidth <= 768 && this.sidebar) {
            this.sidebar.classList.remove('active');
        }

        // Dispatch custom event for page specific initialization
        const event = new CustomEvent('pageLoaded', { detail: { page, params } });
        document.dispatchEvent(event);
    },

    // --- SIDEBAR ---
    initSidebar() {
        const isCollapsed = Utils.getFromStorage('sidebarCollapsed', false);
        if (isCollapsed && this.sidebar && window.innerWidth > 768) {
            this.sidebar.classList.add('collapsed');
        }
    },

    toggleSidebar() {
        if (window.innerWidth <= 768) {
            // Mobile: slide in/out
            this.sidebar.classList.toggle('active');
        } else {
            // Desktop: collapse/expand
            this.sidebar.classList.toggle('collapsed');
            Utils.saveToStorage('sidebarCollapsed', this.sidebar.classList.contains('collapsed'));
        }
    },

    // --- THEME ---
    initTheme() {
        const theme = Utils.getFromStorage('theme', 'dark');
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            if (this.themeToggleBtn) {
                this.themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }
    },

    toggleTheme() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        Utils.saveToStorage('theme', isLight ? 'light' : 'dark');
        
        if (this.themeToggleBtn) {
            this.themeToggleBtn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        }
    },

    // --- NOTIFICATIONS ---
    initNotifications() {
        this.renderNotifications();
    },

    renderNotifications() {
        if (!this.notificationList || !this.notificationBadge) return;

        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            this.notificationBadge.textContent = unreadCount;
            this.notificationBadge.style.display = 'flex';
        } else {
            this.notificationBadge.style.display = 'none';
        }

        if (this.notifications.length === 0) {
            this.notificationList.innerHTML = '<div class="empty-state">No notifications</div>';
            return;
        }

        const icons = {
            info: 'fa-info-circle text-blue',
            success: 'fa-check-circle text-green',
            warning: 'fa-exclamation-triangle text-yellow',
            error: 'fa-times-circle text-red'
        };

        this.notificationList.innerHTML = this.notifications.map(n => `
            <div class="notification-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
                <div class="notification-icon">
                    <i class="fas ${icons[n.type] || icons.info}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${n.title}</div>
                    <div class="notification-desc">${n.message}</div>
                    <div class="notification-time">${n.time}</div>
                </div>
                ${!n.read ? '<div class="notification-dot"></div>' : ''}
            </div>
        `).join('');

        // Add click listeners to mark individual as read
        this.notificationList.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(item.getAttribute('data-id'));
                this.markNotificationRead(id);
            });
        });
    },

    markNotificationRead(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1 && !this.notifications[index].read) {
            this.notifications[index].read = true;
            this.renderNotifications();
        }
    },

    markAllNotificationsRead() {
        let updated = false;
        this.notifications.forEach(n => {
            if (!n.read) {
                n.read = true;
                updated = true;
            }
        });
        if (updated) {
            this.renderNotifications();
            this.showToast('All notifications marked as read', 'success');
        }
    },

    // --- SEARCH ---
    handleSearch(query) {
        if (!this.searchResults) return;

        if (query.trim().length === 0) {
            this.searchResults.classList.remove('show');
            return;
        }

        // Mock search logic
        const q = query.toLowerCase();
        let resultsHTML = '';
        let found = false;

        // Mock data to search through
        const mockData = [
            { type: 'Customer', name: 'Infosys Tech Park', detail: 'ID: CUST-104' },
            { type: 'Route', name: 'Route A-12 Koramangala', detail: 'Driver: Rajesh K' },
            { type: 'Invoice', name: 'INV-2023-08-01', detail: '₹45,000 - Paid' }
        ];

        mockData.forEach(item => {
            if (item.name.toLowerCase().includes(q) || item.detail.toLowerCase().includes(q)) {
                found = true;
                resultsHTML += `
                    <div class="search-result-item">
                        <span class="search-result-type">${item.type}</span>
                        <div class="search-result-content">
                            <div class="search-result-name">${item.name}</div>
                            <div class="search-result-detail">${item.detail}</div>
                        </div>
                    </div>
                `;
            }
        });

        if (!found) {
            resultsHTML = '<div class="p-4 text-center text-gray">No results found for "' + query + '"</div>';
        }

        this.searchResults.innerHTML = resultsHTML;
        this.searchResults.classList.add('show');
    },

    // --- MODAL SYSTEM ---
    showModal(title, contentHTML, actionsHTML = '') {
        const modalOverlay = document.getElementById('modal-container');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body') || document.getElementById('modal-content');
        const footerEl = document.getElementById('modal-footer') || document.getElementById('modal-actions');

        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.innerHTML = contentHTML;
        if (footerEl && actionsHTML) footerEl.innerHTML = actionsHTML;

        if (modalOverlay) {
            modalOverlay.classList.remove('hidden');
            modalOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    },

    hideModal() {
        const modalOverlay = document.getElementById('modal-container');
        if (modalOverlay) {
            modalOverlay.classList.add('hidden');
            modalOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    },

    closeModal() {
        this.hideModal();
    },

    // --- TOAST SYSTEM ---
    showToast(message, type = 'info', duration = 4000) {
        if (!this.toastContainer) return;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
            <div class="toast-content">${message}</div>
            <button class="toast-close"><i class="fas fa-times"></i></button>
            <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
        `;

        this.toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });

        const closeToast = () => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode === this.toastContainer) {
                    this.toastContainer.removeChild(toast);
                }
            }, 300); // Wait for transition
        };

        // Close on button click
        toast.querySelector('.toast-close').addEventListener('click', closeToast);

        // Auto close
        const timeoutId = setTimeout(closeToast, duration);
        
        // Pause on hover
        toast.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            const progress = toast.querySelector('.toast-progress');
            if(progress) progress.style.animationPlayState = 'paused';
        });
        
        toast.addEventListener('mouseleave', () => {
            // Just close it normally on leave, keeping it simple for now
            closeToast(); 
        });
    }
};

// Expose Utils globally so other scripts can use it easily
window.Utils = Utils;

// --- MODULE INITIALIZATION BRIDGE ---
// Tracks which modules have been initialized to avoid double-init
const _initializedModules = {};

document.addEventListener('pageLoaded', (e) => {
    const { page } = e.detail;
    
    // Initialize modules on first visit to their page
    if (!_initializedModules[page]) {
        switch (page) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined' && Dashboard.init) Dashboard.init();
                break;
            case 'scheduling':
                if (typeof Scheduling !== 'undefined' && Scheduling.init) Scheduling.init();
                break;
            case 'routes':
                if (typeof Routes !== 'undefined' && Routes.init) Routes.init();
                if (typeof EcoFlowMapVisualizer !== 'undefined') {
                    try {
                        const mapVis = new EcoFlowMapVisualizer('gps-map-canvas');
                        mapVis.init();
                    } catch(e) { console.warn('Map Visualizer init warning:', e); }
                }
                break;
            case 'customers':
                if (typeof Customers !== 'undefined' && Customers.init) Customers.init();
                break;
            case 'billing':
                // Draw the revenue chart on the existing canvas without replacing HTML
                try {
                    if (typeof BillingModule !== 'undefined') {
                        const billingInstance = new BillingModule('__billing_offscreen__');
                        if (billingInstance.drawRevenueChart) {
                            billingInstance.drawRevenueChart();
                        }
                    }
                } catch(e) { /* Billing chart enhancement optional */ }
                break;
            case 'analytics':
                // Draw analytics charts on existing canvas elements
                try {
                    if (typeof AnalyticsModule !== 'undefined') {
                        const analyticsInstance = new AnalyticsModule('__analytics_offscreen__');
                        ['wasteTrendsChart', 'zonePerformanceChart', 'monthlyVolumeChart', 'recyclingCategoryChart'].forEach(id => {
                            const canvas = document.getElementById(id);
                            if (canvas) {
                                try { analyticsInstance.drawChart(id); } catch(e) {}
                            }
                        });
                    }
                } catch(e) { /* Analytics chart enhancement optional */ }
                break;
            case 'fleet':
                // Keep existing HTML, no class replacement
                break;
            case 'ai-assistant':
                if (typeof AIAssistant !== 'undefined' && AIAssistant.init) AIAssistant.init();
                break;
        }
        _initializedModules[page] = true;
    }
});

// Helper for Swachh Bharat Ward Star Rating Modal
window.getSwachhRatingHTML = function() {
    return `
      <div style="font-family: 'Inter', sans-serif;">
        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Rate municipal ward performance on Swachh Bharat Mission 2.0 Star Rating Protocol parameters:</p>

        <form id="swachh-rating-form" onsubmit="event.preventDefault(); calculateWardStars();">
          <div style="margin-bottom: 14px;">
            <label style="display: flex; justify-content: space-between; font-weight: 600; color: #f8fafc; font-size: 13px; margin-bottom: 4px;">
              <span>1. Door-to-Door Waste Collection</span>
              <span id="score-val-1">90%</span>
            </label>
            <input type="range" id="score-1" min="0" max="100" value="90" oninput="document.getElementById('score-val-1').textContent = this.value + '%'" style="width: 100%; accent-color: #10b981;">
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: flex; justify-content: space-between; font-weight: 600; color: #f8fafc; font-size: 13px; margin-bottom: 4px;">
              <span>2. Source Segregation (Wet / Dry / Haz)</span>
              <span id="score-val-2">85%</span>
            </label>
            <input type="range" id="score-2" min="0" max="100" value="85" oninput="document.getElementById('score-val-2').textContent = this.value + '%'" style="width: 100%; accent-color: #10b981;">
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: flex; justify-content: space-between; font-weight: 600; color: #f8fafc; font-size: 13px; margin-bottom: 4px;">
              <span>3. Home & Bulk Composting Rate</span>
              <span id="score-val-3">75%</span>
            </label>
            <input type="range" id="score-3" min="0" max="100" value="75" oninput="document.getElementById('score-val-3').textContent = this.value + '%'" style="width: 100%; accent-color: #10b981;">
          </div>

          <div style="margin-bottom: 14px;">
            <label style="display: flex; justify-content: space-between; font-weight: 600; color: #f8fafc; font-size: 13px; margin-bottom: 4px;">
              <span>4. Street Sweeping & Drain Cleanliness</span>
              <span id="score-val-4">95%</span>
            </label>
            <input type="range" id="score-4" min="0" max="100" value="95" oninput="document.getElementById('score-val-4').textContent = this.value + '%'" style="width: 100%; accent-color: #10b981;">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: flex; justify-content: space-between; font-weight: 600; color: #f8fafc; font-size: 13px; margin-bottom: 4px;">
              <span>5. E-Waste & Plastic Ban Enforcement</span>
              <span id="score-val-5">80%</span>
            </label>
            <input type="range" id="score-5" min="0" max="100" value="80" oninput="document.getElementById('score-val-5').textContent = this.value + '%'" style="width: 100%; accent-color: #10b981;">
          </div>

          <div id="star-rating-result" style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px;">
            <div style="font-size: 32px; margin-bottom: 4px;">⭐⭐⭐⭐⭐</div>
            <h4 style="margin: 0; color: #34d399; font-size: 18px;">5-Star Garbage Free City Rating</h4>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">Average Compliance Index: 85.0%</p>
          </div>

          <div style="text-align: right;">
            <button type="submit" class="btn btn-primary" style="padding: 10px 24px;">Submit Official Swachh Rating</button>
          </div>
        </form>
      </div>
    `;
};

window.calculateWardStars = function() {
    const s1 = parseInt(document.getElementById('score-1').value);
    const s2 = parseInt(document.getElementById('score-2').value);
    const s3 = parseInt(document.getElementById('score-3').value);
    const s4 = parseInt(document.getElementById('score-4').value);
    const s5 = parseInt(document.getElementById('score-5').value);

    const avg = (s1 + s2 + s3 + s4 + s5) / 5;
    let stars = '⭐';
    let title = '1-Star Basic Compliance';

    if (avg >= 90) { stars = '⭐⭐⭐⭐⭐'; title = '5-Star Garbage Free City (GFC)'; }
    else if (avg >= 80) { stars = '⭐⭐⭐⭐'; title = '4-Star Exemplary Ward'; }
    else if (avg >= 70) { stars = '⭐⭐⭐'; title = '3-Star Satisfactory Ward'; }
    else if (avg >= 60) { stars = '⭐⭐'; title = '2-Star Moderate Compliance'; }

    const res = document.getElementById('star-rating-result');
    if (res) {
        res.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 4px;">${stars}</div>
            <h4 style="margin: 0; color: #34d399; font-size: 18px;">${title}</h4>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">Average Compliance Index: ${avg.toFixed(1)}%</p>
        `;
    }
    if (typeof Utils !== 'undefined') {
        Utils.showToast(`🇮🇳 Official Ward Rating Submitted: ${stars} (${title})`, 'success');
    }
};

window.switchMapMode = function(mode) {
    const gmapsBox = document.getElementById('google-maps-container');
    const radarBox = document.getElementById('radar-map-container');
    const gmapsBtn = document.getElementById('map-mode-gmaps');
    const radarBtn = document.getElementById('map-mode-radar');

    if (mode === 'gmaps') {
        if (gmapsBox) gmapsBox.style.display = 'block';
        if (radarBox) radarBox.style.display = 'none';
        if (gmapsBtn) { gmapsBtn.className = 'btn btn-sm btn-primary'; }
        if (radarBtn) { radarBtn.className = 'btn btn-sm btn-outline'; }
        if (typeof Utils !== 'undefined') Utils.showToast('🌐 Switched to Google Maps Interactive View', 'info');
    } else {
        if (gmapsBox) gmapsBox.style.display = 'none';
        if (radarBox) radarBox.style.display = 'block';
        if (radarBtn) { radarBtn.className = 'btn btn-sm btn-primary'; }
        if (gmapsBtn) { gmapsBtn.className = 'btn btn-sm btn-outline'; }
        if (typeof Utils !== 'undefined') Utils.showToast('📡 Switched to Vector Fleet Radar View', 'info');
    }
};

window.loadRouteOnGoogleMaps = function(query) {
    const iframe = document.getElementById('gmaps-iframe');
    if (iframe) {
        iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query + ' Bangalore')}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
        switchMapMode('gmaps');
        if (typeof Utils !== 'undefined') Utils.showToast(`🗺️ Loaded Google Maps for ${query}`, 'success');
    }
};

window.togglePassVisibility = function() {
    const input = document.getElementById('page-admin-password');
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
};

window.triggerForgotPasswordRecovery = function() {
    const email = document.getElementById('page-admin-email').value || 'admin@ecoflow.in';
    if (typeof Utils !== 'undefined') {
        Utils.showToast(`📩 Password recovery link dispatched to ${email}.`, 'success');
    }
};

window.handlePageAdminLogin = function() {
    const email = document.getElementById('page-admin-email').value;
    const pass = document.getElementById('page-admin-password').value;
    const role = document.getElementById('page-admin-role').value;

    if (typeof window.EcoFlowAuth !== 'undefined') {
        const success = window.EcoFlowAuth.login(email, pass, role);
        if (success) {
            const dashboardBox = document.getElementById('page-super-admin-dashboard');
            const emailDisp = document.getElementById('authenticated-email-display');
            if (dashboardBox) dashboardBox.style.display = 'block';
            if (emailDisp) emailDisp.textContent = email;
            if (typeof Utils !== 'undefined') {
                Utils.showToast(`👑 Super Admin Authenticated! (${role} - ${email})`, 'success');
            }
        }
    }
};

window.switchAuthTab = function(tab) {
    const loginPanel = document.getElementById('panel-login');
    const registerPanel = document.getElementById('panel-register');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');

    if (tab === 'login') {
        if (loginPanel) loginPanel.style.display = 'block';
        if (registerPanel) registerPanel.style.display = 'none';
        if (tabLogin) { tabLogin.style.background = 'linear-gradient(135deg, #10b981, #059669)'; tabLogin.style.color = 'white'; tabLogin.style.boxShadow = '0 2px 10px rgba(16,185,129,0.3)'; }
        if (tabRegister) { tabRegister.style.background = 'transparent'; tabRegister.style.color = '#64748b'; tabRegister.style.boxShadow = 'none'; }
    } else {
        if (loginPanel) loginPanel.style.display = 'none';
        if (registerPanel) registerPanel.style.display = 'block';
        if (tabRegister) { tabRegister.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)'; tabRegister.style.color = 'white'; tabRegister.style.boxShadow = '0 2px 10px rgba(59,130,246,0.3)'; }
        if (tabLogin) { tabLogin.style.background = 'transparent'; tabLogin.style.color = '#64748b'; tabLogin.style.boxShadow = 'none'; }
    }
};

window.handlePageAdminRegister = function() {
    const firstName = document.getElementById('reg-first-name').value;
    const lastName = document.getElementById('reg-last-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const confirmPass = document.getElementById('reg-confirm-password').value;
    const role = document.getElementById('reg-role').value;

    if (!firstName || !lastName || !email || !pass) {
        if (typeof Utils !== 'undefined') Utils.showToast('⚠️ Please fill in all required fields.', 'warning');
        return;
    }
    if (pass !== confirmPass) {
        if (typeof Utils !== 'undefined') Utils.showToast('⚠️ Passwords do not match.', 'warning');
        return;
    }
    if (typeof Utils !== 'undefined') {
        Utils.showToast(`✅ Account created for ${firstName} ${lastName} (${role}). Pending admin approval.`, 'success');
    }
    switchAuthTab('login');
};

window.handleAdminLogout = function() {
    const dashboard = document.getElementById('page-super-admin-dashboard');
    if (dashboard) dashboard.style.display = 'none';
    if (typeof window.EcoFlowAuth !== 'undefined') window.EcoFlowAuth.logout();
    if (typeof Utils !== 'undefined') Utils.showToast('🔒 Session terminated. Logged out successfully.', 'info');
};

window.openSuperAdminPortal = function() {
    EcoFlow.navigate('admin');
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    EcoFlow.init();
    
    // Initialize Super Admin Auth System
    if (typeof window.EcoFlowAuth !== 'undefined' && window.EcoFlowAuth.init) {
        window.EcoFlowAuth.init();
    }

    // Initialize Autonomous AI Agent System
    if (typeof window.EcoFlowAgentSystem !== 'undefined' && window.EcoFlowAgentSystem.init) {
        window.EcoFlowAgentSystem.init();
    }

    // Initialize notifications globally
    if (typeof Notifications !== 'undefined' && Notifications.init) {
        Notifications.init();
    }
    // Unregister stale service worker if cache version mismatch and register fresh worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.update();
            }
        });
        navigator.serviceWorker.register('./sw.js?v=4')
            .then(reg => console.log('[Service Worker] Updated and Registered:', reg.scope))
            .catch(err => console.warn('[Service Worker] Registration failed:', err));
    }

    // Performance measurement
    performance.mark('ecoflow-ready');
    performance.measure('EcoFlow Init Time', 'ecoflow-start', 'ecoflow-ready');
    const initTime = performance.getEntriesByName('EcoFlow Init Time')[0];
    console.log(`⚡ EcoFlow initialized in ${Math.round(initTime.duration)}ms`);

    // Pause canvas animations when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.__ecoflowPaused = true;
      } else {
        window.__ecoflowPaused = false;
      }
    });
});
