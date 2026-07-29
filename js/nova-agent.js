/**
 * EcoFlow NOVA — Smart AI Agent (Floating Widget)
 * Always-visible AI agent across all pages with:
 * - Context-aware waste management knowledge
 * - Live system actions (navigate, dispatch, report)
 * - Typing animation & streaming effect
 * - Quick action chips
 * - Voice input support
 */

const NovaAgent = {
  isOpen: false,
  isTyping: false,
  messages: [],
  sessionId: Date.now(),
  unreadCount: 0,
  currentContext: 'dashboard',

  // ─── Knowledge Base ───────────────────────────────────────────────
  kb: {
    greet: [
      "Namaste! 🙏 Main **NOVA** hoon — EcoFlow ka Smart AI Agent. Aapki kya madad kar sakta hoon?",
      "Hello! Main **NOVA** hoon. Waste management, fleet, routes, billing — kuch bhi pucho! 😊",
      "Namaste! **NOVA** here. Aaj ke collections kaisi chal rahi hain? Kuch chahiye toh batao! 🤖"
    ],
    intents: [
      {
        name: 'route', weight: 0,
        keywords: ['route', 'rasta', 'path', 'optimize', 'distance', 'traffic', 'collection route', 'map'],
        response: () => `📍 **Route Intelligence**\n\nAbhi **24 routes** active hain:\n- 🟢 Route A-12 (Koramangala) — On time\n- 🟡 Route B-07 (JP Nagar) — 15 min delay\n- 🔴 Route C-03 (Whitefield) — Congestion alert\n\nAI optimization se **12.4 km** fuel savings aaj hua. Route details dekhne chahiye?`,
        action: { label: '🗺️ Routes Dekho', page: 'routes' }
      },
      {
        name: 'fleet', weight: 0,
        keywords: ['truck', 'vehicle', 'fleet', 'driver', 'maintenance', 'fuel', 'gaadi'],
        response: () => `🚛 **Fleet Status** (Live)\n\n- ✅ **18/22** trucks active\n- ⚠️ **2 trucks** maintenance due\n- ⛽ KA-01-CD-5678 — Low fuel (23%)\n- 🔧 PdM Health Score: **94.8%**\n\nSabse urgent: KA-01-CD-5678 ko fueling station bhejo?`,
        action: { label: '🚛 Fleet Dekho', page: 'fleet' }
      },
      {
        name: 'bin', weight: 0,
        keywords: ['bin', 'smart bin', 'sensor', 'fill', 'overflow', 'dustbin', 'kachra'],
        response: () => `📡 **Smart Bin Network**\n\n- 🔴 **${Math.floor(Math.random()*5)+6} bins** critical (>85% full)\n- 🟡 **12 bins** warning level\n- 🟢 **30 bins** normal\n- 🔋 Average battery: **71%**\n\nWhitefield zone mein 3 bins overflow edge par hain — dispatch karoon?`,
        action: { label: '📡 Bins Dekho', page: 'smart-bins' }
      },
      {
        name: 'carbon', weight: 0,
        keywords: ['carbon', 'credit', 'co2', 'green', 'environment', 'offset', 'trade', 'vcs'],
        response: () => `🌿 **Carbon Credits Update**\n\n- 💹 Live price: **₹${(1200 + Math.floor(Math.random()*100)).toLocaleString('en-IN')}/tCO₂e**\n- 📊 Portfolio: **847 credits** held\n- 🌍 CO₂ offset today: **1,247 kg**\n- 📈 Market: +2.1% (bullish)\n\nAaj ka best time hai buying ke liye — price dip par hain!`,
        action: { label: '🌿 Marketplace Dekho', page: 'carbon-trading' }
      },
      {
        name: 'billing', weight: 0,
        keywords: ['bill', 'invoice', 'payment', 'due', 'fee', 'charge', 'paisa', 'rupee', 'amount'],
        response: () => `💰 **Billing Summary**\n\n- 📄 **12 invoices** pending\n- ⚠️ **3 overdue** (>30 days)\n- 💵 Outstanding: **₹2,84,500**\n- ✅ This month collected: **₹18.4 Lakh**\n\nSabse bada outstanding: Infosys Tech Park — ₹45,000 (45 days old)`,
        action: { label: '💰 Billing Dekho', page: 'billing' }
      },
      {
        name: 'command', weight: 0,
        keywords: ['command', 'center', 'war room', 'emergency', 'alert', 'dispatch', 'critical'],
        response: () => `🎯 **Command Center Alert**\n\n- 🚨 **3 active alerts** (1 critical)\n- 🔴 Whitefield overflow — 2 trucks dispatched\n- 🚫 Koramangala illegal dumping reported\n- 🏆 Top ward: Jayanagar (94%)\n\nWar Room kholo emergency handle karne ke liye!`,
        action: { label: '🎯 Command Center', page: 'command-center' }
      },
      {
        name: 'grievance', weight: 0,
        keywords: ['complaint', 'grievance', 'shikayat', 'missed', 'report', 'ward', 'officer', 'problem'],
        response: () => `🧹 **Citizen Grievances**\n\n- 📋 **7 open tickets** today\n- 🔴 2 critical SLA (>24h)\n- 🟡 3 medium priority\n- ✅ 5 resolved today\n\nSabse urgent: Ticket #GRV-0041 — Indiranagar missed collection (32 hours pending)`,
        action: { label: '🧹 Grievances Dekho', page: 'grievances' }
      },
      {
        name: 'sort', weight: 0,
        keywords: ['segregate', 'sort', 'alag', 'wet', 'dry', 'recycle', 'plastic', 'organic', 'kaise', 'kya'],
        response: () => `♻️ **Waste Segregation Guide**\n\n🟢 **Green Bin** — Wet/Organic (kitchen, fruits, leaves)\n🔵 **Blue Bin** — Dry/Recyclable (paper, plastic, metal)\n🔴 **Red Bin** — Hazardous (batteries, chemicals)\n⚡ **E-Waste** — Electronics (phones, chargers)\n\nAI Vision feature se photo upload karke instant classification lo!`,
        action: { label: '📸 AI Vision Try Karo', page: 'ai-vision' }
      },
      {
        name: 'schedule', weight: 0,
        keywords: ['schedule', 'pickup', 'time', 'when', 'kab', 'collection', 'booking', 'appointment'],
        response: () => `📅 **Today's Schedule**\n\n- 🕗 07:00 — Route A-12 (Koramangala) started\n- 🕙 09:30 — Route B-07 (JP Nagar) active\n- 🕛 12:00 — Route C-03 (Whitefield) scheduled\n- 🕒 15:00 — Evening round: HSR Layout\n\nNew schedule add karna hai?`,
        action: { label: '📅 Scheduling Dekho', page: 'scheduling' }
      },
      {
        name: 'analytics', weight: 0,
        keywords: ['report', 'analytics', 'statistics', 'data', 'trend', 'performance', 'stats', 'swachh'],
        response: () => `📊 **Analytics Snapshot**\n\n- 🗑️ Collected: **2,847 tons** (↑12.5%)\n- ♻️ Recycling rate: **67.3%** (↑4.2%)\n- 🌿 CO₂ reduced: **1,247 kg**\n- 💰 Revenue MTD: **₹18.4 Lakh**\n- 🏆 Swachh Bharat Score: **82/100**\n\nFull report dekhna chahoge?`,
        action: { label: '📈 Analytics Dekho', page: 'analytics' }
      },
      {
        name: 'greeting', weight: 0,
        keywords: ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'good', 'help', 'madad', 'kya kar', 'helo'],
        response: () => NovaAgent.kb.greet[Math.floor(Math.random() * NovaAgent.kb.greet.length)],
        action: null
      }
    ],

    fallback: [
      "Hmm, main samajh nahi paya. Kya aap thoda aur detail mein bata sakte hain? 🤔",
      "Interesting question! Mujhe aur context chahiye. Routes, fleet, bins, billing, ya carbon credits — kaunsa topic? 😊",
      "Main abhi seekh raha hoon! Yeh questions try karo: 'truck status kya hai?' ya 'bins overflow ho rahe hain?' 🤖"
    ]
  },

  // ─── Init ────────────────────────────────────────────────────────
  init() {
    this.injectWidget();
    this.loadHistory();
    if (this.messages.length === 0) {
      setTimeout(() => {
        this.addMessage(this.kb.greet[0], 'nova');
        this.showQuickChips();
      }, 800);
    } else {
      this.renderAll();
    }
    this.startContextMonitor();
    console.log('[NOVA] ✅ AI Agent initialized');
  },

  // ─── Widget HTML ─────────────────────────────────────────────────
  injectWidget() {
    const widget = document.createElement('div');
    widget.id = 'nova-widget';
    widget.innerHTML = `
      <!-- Floating Button -->
      <div id="nova-fab" onclick="NovaAgent.toggle()" title="NOVA — EcoFlow AI Agent">
        <div id="nova-fab-icon">🤖</div>
        <span id="nova-unread" class="nova-badge hidden">0</span>
        <div class="nova-pulse-ring"></div>
      </div>

      <!-- Chat Panel -->
      <div id="nova-panel" class="nova-panel hidden">

        <!-- Header -->
        <div class="nova-header">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="position:relative;">
              <div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#10b981,#3b82f6); display:flex; align-items:center; justify-content:center; font-size:20px;">🤖</div>
              <span style="position:absolute; bottom:0; right:0; width:10px; height:10px; background:#10b981; border-radius:50%; border:2px solid #0a0e1a;"></span>
            </div>
            <div>
              <div style="font-weight:800; font-size:15px; color:#f8fafc;">NOVA</div>
              <div style="font-size:11px; color:#34d399; display:flex; align-items:center; gap:4px;">
                <span style="width:6px; height:6px; border-radius:50%; background:#10b981; display:inline-block; animation:pulseRed 1.2s infinite;"></span>
                EcoFlow AI Agent • Online
              </div>
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button onclick="NovaAgent.clearChat()" title="Clear chat" style="background:none; border:none; color:#64748b; font-size:16px; cursor:pointer; padding:4px;" title="Clear">🗑️</button>
            <button onclick="NovaAgent.toggle()" style="background:none; border:none; color:#94a3b8; font-size:20px; cursor:pointer; padding:4px; line-height:1;">×</button>
          </div>
        </div>

        <!-- Messages -->
        <div id="nova-messages" class="nova-messages"></div>

        <!-- Quick Chips -->
        <div id="nova-chips" class="nova-chips-bar"></div>

        <!-- Input -->
        <div class="nova-input-bar">
          <button id="nova-mic" onclick="NovaAgent.toggleVoice()" title="Voice input" style="background:none; border:none; cursor:pointer; font-size:18px; padding:6px; color:#64748b; flex-shrink:0; transition:color 0.2s;">🎙️</button>
          <input id="nova-input" type="text" placeholder="Kuch bhi pucho... (e.g. truck status, bins overflow?)" autocomplete="off" />
          <button id="nova-send" onclick="NovaAgent.send()" style="background:linear-gradient(135deg,#10b981,#059669); border:none; border-radius:10px; padding:8px 14px; color:#fff; font-weight:700; cursor:pointer; font-size:16px; flex-shrink:0; transition:transform 0.15s;">➤</button>
        </div>

      </div>
    `;
    document.body.appendChild(widget);
    this.injectStyles();

    // Enter key
    document.getElementById('nova-input').addEventListener('keypress', e => {
      if (e.key === 'Enter') this.send();
    });
  },

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* ── NOVA Widget ── */
      #nova-widget { position: fixed; bottom: 28px; right: 28px; z-index: 99999; font-family: 'Inter', sans-serif; }

      /* FAB Button */
      #nova-fab {
        width: 62px; height: 62px; border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #3b82f6);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; position: relative;
        box-shadow: 0 8px 32px rgba(16,185,129,0.5);
        transition: transform 0.25s, box-shadow 0.25s;
        animation: novaFloat 3s ease-in-out infinite;
      }
      #nova-fab:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(16,185,129,0.7); }
      #nova-fab-icon { font-size: 28px; }
      .nova-pulse-ring {
        position: absolute; inset: -6px; border-radius: 50%;
        border: 2px solid rgba(16,185,129,0.4);
        animation: novaPulse 2s ease-out infinite;
      }
      .nova-badge {
        position: absolute; top: -4px; right: -4px;
        background: #ef4444; color: #fff; font-size: 10px; font-weight: 800;
        width: 20px; height: 20px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid #0a0e1a;
      }

      /* Panel */
      .nova-panel {
        position: absolute; bottom: 78px; right: 0;
        width: 380px; height: 560px;
        background: rgba(10, 14, 26, 0.97);
        border: 1px solid rgba(16,185,129,0.25);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
        display: flex; flex-direction: column; overflow: hidden;
        backdrop-filter: blur(20px);
        transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        transform-origin: bottom right;
      }
      .nova-panel.hidden { transform: scale(0.85); opacity: 0; pointer-events: none; }
      .nova-panel:not(.hidden) { transform: scale(1); opacity: 1; }

      /* Header */
      .nova-header {
        padding: 16px 18px; display: flex; justify-content: space-between; align-items: center;
        background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.08));
        border-bottom: 1px solid rgba(255,255,255,0.06);
        flex-shrink: 0;
      }

      /* Messages */
      .nova-messages {
        flex: 1; overflow-y: auto; padding: 16px;
        display: flex; flex-direction: column; gap: 12px;
        scroll-behavior: smooth;
      }
      .nova-messages::-webkit-scrollbar { width: 4px; }
      .nova-messages::-webkit-scrollbar-track { background: transparent; }
      .nova-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

      /* Message Bubbles */
      .nova-msg { display: flex; gap: 8px; align-items: flex-end; animation: novaSlideUp 0.3s ease; }
      .nova-msg.user { flex-direction: row-reverse; }
      .nova-msg-avatar {
        width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
        background: linear-gradient(135deg,#10b981,#3b82f6);
        display: flex; align-items: center; justify-content: center; font-size: 14px;
      }
      .nova-msg.user .nova-msg-avatar { background: linear-gradient(135deg,#8b5cf6,#6d28d9); }
      .nova-bubble {
        max-width: 80%; padding: 10px 14px; border-radius: 16px;
        font-size: 13px; line-height: 1.6; color: #e2e8f0;
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.08);
        white-space: pre-wrap; word-break: break-word;
      }
      .nova-msg.user .nova-bubble {
        background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.15));
        border-color: rgba(16,185,129,0.25); color: #f8fafc;
        border-radius: 16px 16px 4px 16px;
      }
      .nova-msg:not(.user) .nova-bubble { border-radius: 16px 16px 16px 4px; }
      .nova-bubble strong { color: #34d399; }
      .nova-bubble em { color: #60a5fa; }

      /* Action Button in bubble */
      .nova-action-btn {
        display: inline-flex; align-items: center; gap: 6px;
        margin-top: 8px; padding: 7px 14px;
        background: linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1));
        border: 1px solid rgba(16,185,129,0.35); border-radius: 8px;
        color: #34d399; font-size: 12px; font-weight: 700; cursor: pointer;
        transition: all 0.2s;
      }
      .nova-action-btn:hover { background: rgba(16,185,129,0.3); transform: translateY(-1px); }

      /* Typing indicator */
      .nova-typing { display: flex; gap: 4px; padding: 12px 14px; align-items: center; }
      .nova-typing span {
        width: 7px; height: 7px; border-radius: 50%; background: #34d399;
        animation: novaDot 1.2s infinite;
      }
      .nova-typing span:nth-child(2) { animation-delay: 0.2s; }
      .nova-typing span:nth-child(3) { animation-delay: 0.4s; }

      /* Chips */
      .nova-chips-bar {
        padding: 8px 12px; display: flex; gap: 7px; flex-wrap: wrap;
        border-top: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; min-height: 0;
      }
      .nova-chip {
        padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700;
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
        color: #94a3b8; cursor: pointer; white-space: nowrap;
        transition: all 0.18s;
      }
      .nova-chip:hover { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.35); color: #34d399; }

      /* Input */
      .nova-input-bar {
        padding: 12px 14px; display: flex; gap: 8px; align-items: center;
        border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
        background: rgba(0,0,0,0.2);
      }
      #nova-input {
        flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; padding: 10px 14px; color: #f8fafc; font-size: 13px;
        outline: none; font-family: 'Inter', sans-serif;
        transition: border-color 0.2s;
      }
      #nova-input:focus { border-color: rgba(16,185,129,0.5); }
      #nova-input::placeholder { color: #475569; }
      #nova-send:hover { transform: scale(1.05); }
      #nova-send:active { transform: scale(0.95); }
      #nova-mic.recording { color: #ef4444 !important; animation: novaMicPulse 1s infinite; }

      /* Keyframes */
      @keyframes novaFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      @keyframes novaPulse { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
      @keyframes novaSlideUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
      @keyframes novaDot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
      @keyframes novaMicPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

      /* Mobile responsive */
      @media (max-width: 480px) {
        .nova-panel { width: calc(100vw - 24px); right: -4px; height: 70vh; }
        #nova-widget { bottom: 16px; right: 16px; }
      }

      .hidden { display: none !important; }
    `;
    document.head.appendChild(style);
  },

  // ─── Toggle ──────────────────────────────────────────────────────
  toggle() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('nova-panel');
    const fab = document.getElementById('nova-fab');
    if (this.isOpen) {
      panel.classList.remove('hidden');
      document.getElementById('nova-fab-icon').textContent = '✕';
      fab.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      this.unreadCount = 0;
      this.updateBadge();
      setTimeout(() => document.getElementById('nova-input')?.focus(), 300);
    } else {
      panel.classList.add('hidden');
      document.getElementById('nova-fab-icon').textContent = '🤖';
      fab.style.background = 'linear-gradient(135deg, #10b981, #3b82f6)';
    }
    this.scrollToBottom();
  },

  // ─── Send Message ────────────────────────────────────────────────
  send() {
    const input = document.getElementById('nova-input');
    const text = input?.value?.trim();
    if (!text || this.isTyping) return;
    input.value = '';
    this.addMessage(text, 'user');
    document.getElementById('nova-chips').innerHTML = '';
    setTimeout(() => this.processAndRespond(text), 300);
  },

  processAndRespond(text) {
    this.showTyping();
    const lower = text.toLowerCase();

    // Score all intents
    this.kb.intents.forEach(intent => {
      intent.weight = 0;
      intent.keywords.forEach(kw => {
        if (lower.includes(kw)) intent.weight += 2;
      });
    });

    const best = this.kb.intents.reduce((a, b) => a.weight > b.weight ? a : b);
    const delay = 800 + Math.random() * 700;

    setTimeout(() => {
      this.hideTyping();
      if (best.weight > 0) {
        const responseText = best.response();
        this.addMessage(responseText, 'nova', best.action);
      } else {
        // Special commands
        if (lower.includes('navigate') || lower.includes('jao') || lower.includes('open') || lower.includes('kholo')) {
          this.handleNavigate(lower);
        } else if (lower.includes('dispatch') || lower.includes('bhejo') || lower.includes('send truck')) {
          this.addMessage("🚛 Emergency truck dispatch ke liye Command Center kholo — main wahan directly dispatch kar sakta hoon!", 'nova', { label: '🎯 Command Center', page: 'command-center' });
        } else if (lower.includes('price') || lower.includes('kitna') || lower.includes('cost')) {
          this.addMessage(`💰 **Current Carbon Price:** ₹${(1200 + Math.floor(Math.random()*150)).toLocaleString('en-IN')}/tCO₂e\n\n📊 Market status: Bullish (+2.1%)\n🕐 Last updated: Just now`, 'nova', { label: '🌿 Marketplace', page: 'carbon-trading' });
        } else {
          const fallback = this.kb.fallback[Math.floor(Math.random() * this.kb.fallback.length)];
          this.addMessage(fallback, 'nova');
          this.showQuickChips();
        }
      }
    }, delay);
  },

  handleNavigate(lower) {
    const navMap = [
      { keys: ['dashboard', 'home', 'ghar'], page: 'dashboard', label: '🏠 Dashboard' },
      { keys: ['route', 'map'], page: 'routes', label: '🗺️ Routes' },
      { keys: ['fleet', 'truck', 'gaadi'], page: 'fleet', label: '🚛 Fleet' },
      { keys: ['billing', 'bill', 'invoice'], page: 'billing', label: '💰 Billing' },
      { keys: ['analytics', 'report'], page: 'analytics', label: '📊 Analytics' },
      { keys: ['command', 'war room', 'alert'], page: 'command-center', label: '🎯 Command Center' },
      { keys: ['carbon', 'credit'], page: 'carbon-trading', label: '🌿 Carbon' },
      { keys: ['bin', 'smart bin'], page: 'smart-bins', label: '📡 Smart Bins' },
      { keys: ['ai', 'chat', 'assistant'], page: 'ai-assistant', label: '🤖 AI Assistant' },
      { keys: ['vision', 'photo', 'image'], page: 'ai-vision', label: '📸 AI Vision' },
      { keys: ['schedule', 'calendar'], page: 'scheduling', label: '📅 Scheduling' },
      { keys: ['grievance', 'complaint'], page: 'grievances', label: '🧹 Grievances' }
    ];
    const match = navMap.find(n => n.keys.some(k => lower.includes(k)));
    if (match) {
      this.addMessage(`✅ ${match.label} par navigate kar raha hoon...`, 'nova');
      setTimeout(() => {
        if (window.EcoFlow) EcoFlow.navigate(match.page);
        window.location.hash = match.page;
      }, 500);
    } else {
      this.addMessage("Kaunsa page open karna hai? Batao main le jaata hoon! 😊", 'nova');
      this.showQuickChips();
    }
  },

  // ─── Message Rendering ───────────────────────────────────────────
  addMessage(text, sender, action = null) {
    const msg = { text, sender, action, time: Date.now() };
    this.messages.push(msg);
    this.saveHistory();
    this.renderMessage(msg);
    this.scrollToBottom();
    if (sender === 'nova' && !this.isOpen) {
      this.unreadCount++;
      this.updateBadge();
    }
  },

  renderMessage(msg) {
    const container = document.getElementById('nova-messages');
    if (!container) return;
    const isUser = msg.sender === 'user';
    const formattedText = this.formatText(msg.text);

    const div = document.createElement('div');
    div.className = `nova-msg ${isUser ? 'user' : ''}`;
    div.innerHTML = `
      <div class="nova-msg-avatar">${isUser ? '👤' : '🤖'}</div>
      <div>
        <div class="nova-bubble">${formattedText}${msg.action ? `<br><button class="nova-action-btn" onclick="NovaAgent.handleAction('${msg.action.page}')">${msg.action.label}</button>` : ''}</div>
        <div style="font-size:10px; color:#475569; margin-top:3px; ${isUser ? 'text-align:right' : ''}">${new Date(msg.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
      </div>
    `;
    container.appendChild(div);
  },

  renderAll() {
    const container = document.getElementById('nova-messages');
    if (!container) return;
    container.innerHTML = '';
    this.messages.forEach(m => this.renderMessage(m));
    this.scrollToBottom();
  },

  formatText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  },

  showTyping() {
    this.isTyping = true;
    const container = document.getElementById('nova-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'nova-msg';
    div.id = 'nova-typing-indicator';
    div.innerHTML = `<div class="nova-msg-avatar">🤖</div><div class="nova-bubble nova-typing"><span></span><span></span><span></span></div>`;
    container.appendChild(div);
    this.scrollToBottom();
  },

  hideTyping() {
    this.isTyping = false;
    document.getElementById('nova-typing-indicator')?.remove();
  },

  showQuickChips() {
    const chips = [
      { label: '🚛 Truck Status', q: 'truck status kya hai?' },
      { label: '📡 Bins Overflow?', q: 'bins overflow ho rahe hain?' },
      { label: '💰 Billing Status', q: 'billing status batao' },
      { label: '🌿 Carbon Price', q: 'carbon credit price kya hai?' },
      { label: '🎯 Alerts', q: 'emergency alerts kya hain?' },
      { label: '♻️ Sort Waste', q: 'waste kaise sort karein?' }
    ];
    const bar = document.getElementById('nova-chips');
    if (!bar) return;
    bar.innerHTML = chips.map(c => `<button class="nova-chip" onclick="NovaAgent.sendChip('${c.q}')">${c.label}</button>`).join('');
  },

  sendChip(text) {
    const input = document.getElementById('nova-input');
    if (input) { input.value = text; this.send(); }
  },

  handleAction(page) {
    if (window.EcoFlow) EcoFlow.navigate(page);
    window.location.hash = page;
    this.toggle();
  },

  scrollToBottom() {
    const container = document.getElementById('nova-messages');
    if (container) container.scrollTop = container.scrollHeight;
  },

  updateBadge() {
    const badge = document.getElementById('nova-unread');
    if (!badge) return;
    if (this.unreadCount > 0) {
      badge.textContent = this.unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  },

  clearChat() {
    this.messages = [];
    sessionStorage.removeItem('nova_messages');
    const container = document.getElementById('nova-messages');
    if (container) container.innerHTML = '';
    setTimeout(() => {
      this.addMessage("Chat clear kar diya! 🗑️ Naya sawaal pucho — main ready hoon! 😊", 'nova');
      this.showQuickChips();
    }, 200);
  },

  // ─── Voice Input ─────────────────────────────────────────────────
  toggleVoice() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      this.addMessage("⚠️ Aapka browser voice input support nahi karta. Chrome use karo! 🎙️", 'nova');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    const micBtn = document.getElementById('nova-mic');
    micBtn.classList.add('recording');
    recognition.start();
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      const input = document.getElementById('nova-input');
      if (input) { input.value = transcript; this.send(); }
      micBtn.classList.remove('recording');
    };
    recognition.onerror = () => micBtn.classList.remove('recording');
    recognition.onend = () => micBtn.classList.remove('recording');
  },

  // ─── Context Monitor ─────────────────────────────────────────────
  startContextMonitor() {
    // Proactive tips based on page
    document.addEventListener('pageLoaded', (e) => {
      const page = e.detail?.page;
      if (!page || page === this.currentContext) return;
      this.currentContext = page;
      if (this.isOpen) return; // Don't intrude if open

      const tips = {
        'command-center': { msg: "🎯 **Command Center** mein aaye! 3 active alerts hain — dekhna chahoge?", delay: 1500 },
        'carbon-trading': { msg: "🌿 Carbon price aaj **+2.1%** hai! Buying ka accha waqt hai.", delay: 1500 },
        'smart-bins': { msg: "📡 **6 bins** critical level par hain! Dispatch karna chahoge?", delay: 1500 },
        'fleet': { msg: "🚛 KA-01-CD-5678 ka fuel **23%** hai — fueling alert bhejoon?", delay: 1500 },
        'billing': { msg: "💰 **12 invoices** pending hain, total **₹2.84 lakh** outstanding!", delay: 1500 }
      };

      const tip = tips[page];
      if (tip) {
        setTimeout(() => {
          this.addMessage(tip.msg, 'nova');
          this.unreadCount++;
          this.updateBadge();
          // Subtle pulse on FAB
          const fab = document.getElementById('nova-fab');
          if (fab) { fab.style.transform = 'scale(1.15)'; setTimeout(() => fab.style.transform = '', 500); }
        }, tip.delay);
      }
    });

    // Proactive greet after 10 seconds on first visit
    if (this.messages.length <= 1) {
      setTimeout(() => {
        if (!this.isOpen && this.messages.length <= 1) {
          this.addMessage("💡 **Tip:** Command Center mein **3 emergency alerts** hain. Dekhna chahoge? 🎯", 'nova', { label: '🎯 Command Center', page: 'command-center' });
          this.unreadCount++;
          this.updateBadge();
        }
      }, 10000);
    }
  },

  // ─── Storage ─────────────────────────────────────────────────────
  saveHistory() {
    try {
      const last20 = this.messages.slice(-20);
      sessionStorage.setItem('nova_messages', JSON.stringify(last20));
    } catch(e) {}
  },

  loadHistory() {
    try {
      const saved = sessionStorage.getItem('nova_messages');
      if (saved) {
        this.messages = JSON.parse(saved);
        this.renderAll();
      }
    } catch(e) {}
  }
};

// Auto-initialize after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => NovaAgent.init());
} else {
  setTimeout(() => NovaAgent.init(), 500);
}

window.NovaAgent = NovaAgent;
