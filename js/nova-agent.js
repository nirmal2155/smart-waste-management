/**
 * EcoFlow NOVA — Gemini-Powered AI Agent v2.0
 * Real AI using Google Gemini 1.5 Flash API
 * - Streaming responses (character by character)
 * - Full EcoFlow system context via system prompt
 * - Conversation memory (multi-turn)
 * - Voice input + output
 * - Smart action triggers
 * - API key stored in localStorage (never sent to our servers)
 */

const NovaAgent = {
  isOpen: false,
  isTyping: false,
  conversationHistory: [],   // Gemini multi-turn history
  sessionId: Date.now(),
  unreadCount: 0,
  currentContext: 'dashboard',
  apiKey: null,
  isStreaming: false,
  streamController: null,

  // ─── Gemini System Prompt ────────────────────────────────────────
  SYSTEM_PROMPT: `You are NOVA, the intelligent AI Agent for EcoFlow — India's most advanced Smart Waste Management System deployed across BBMP (Bruhat Bengaluru Mahanagara Palike) zones in Bengaluru, Karnataka.

## Your Role
You are a friendly, expert assistant helping municipal officers, fleet managers, and administrators manage waste operations efficiently. You respond in a mix of simple English and Hinglish (Hindi + English blend) to be approachable. Keep responses concise, actionable, and data-driven.

## EcoFlow Platform Modules
- **Dashboard**: KPIs — trucks, waste collected, CO₂ offset, revenue
- **Scheduling**: Collection schedules across 8 BBMP zones
- **Routes (PCGVRP)**: AI-optimized routes minimizing fuel by 12-15%
- **Customers & Wards**: Ward management, bulk generators, residential
- **Billing & Invoices**: ₹ invoicing, GST, payment tracking
- **Analytics**: Swachh Bharat reports, recycling rates, trends
- **Fleet Tracking**: 22 vehicles, PdM health scores, fuel monitoring
- **AI Assistant**: Waste sorting guidance, CPCB 2016 compliance
- **AI Vision**: RegNet-X + EfficientNet-B0 waste classification (18ms latency)
- **Citizen Grievances**: SLA ticket system, ward officer escalation
- **IoT Sensor Bins**: Arduino-based ultrasonic/moisture/metal sensors
- **🆕 Command Center (War Room)**: Real-time city-wide operations, emergency dispatch, zone heatmaps, ward leaderboard
- **🆕 Carbon Marketplace**: CAR/Verra VCS carbon credits, live price ticker, buy/sell/retire
- **🆕 Smart Bin Network**: 48 IoT bins across 6 zones, digital twin monitoring, predictive fill alerts

## Live System Data (Simulate realistic values)
- Active trucks: 18/22
- Waste collected today: ~2,847 tons
- Critical bins: 6 (>85% full)
- Carbon price: ₹1,200–₹1,400/tCO₂e (bullish today)
- Swachh Bharat Score: 82/100
- Pending invoices: 12 (₹2.84 lakh outstanding)
- Open grievance tickets: 7 (2 SLA breach risk)

## Navigation Commands
When users want to go somewhere, end your response with one of these exact tags (these trigger navigation):
[NAV:dashboard] [NAV:scheduling] [NAV:routes] [NAV:customers] [NAV:billing] [NAV:analytics] [NAV:fleet] [NAV:ai-assistant] [NAV:ai-vision] [NAV:grievances] [NAV:iot-bins] [NAV:command-center] [NAV:carbon-trading] [NAV:smart-bins]

## Response Style
- Use emojis naturally (🚛🌿📡🎯💰♻️)
- Use **bold** for important numbers/terms
- Keep responses under 120 words unless asking for detail
- Be proactive — suggest next actions
- Use ₹ for currency, metric system
- Mention specific ward names (Koramangala, JP Nagar, Whitefield, Indiranagar, HSR Layout, Jayanagar, Rajajinagar, Hebbal)
- Never say you're an AI — you ARE NOVA, EcoFlow's AI Agent`,

  // ─── Init ────────────────────────────────────────────────────────
  init() {
    this.apiKey = localStorage.getItem('nova_gemini_key') || null;
    this.loadHistory();
    this.injectWidget();

    if (this.messages.length === 0) {
      setTimeout(() => {
        this.addBubble("Namaste! 🙏 Main **NOVA** hoon — EcoFlow ka AI Agent, powered by **Gemini AI**.\n\n" +
          (this.apiKey ? "Real AI mode ON ✅ — Kuch bhi pucho!" : "⚙️ Setup ke liye niche **API Key** enter karo aur real AI unlock karo!"), 'nova');
        if (!this.apiKey) this.showApiSetup();
        else this.showQuickChips();
      }, 700);
    } else {
      this.renderAll();
    }

    this.startContextMonitor();
    console.log('[NOVA v2] ✅ Gemini AI Agent ready. Key:', this.apiKey ? 'SET' : 'NOT SET');
  },

  // ─── Widget HTML ─────────────────────────────────────────────────
  injectWidget() {
    const widget = document.createElement('div');
    widget.id = 'nova-widget';
    widget.innerHTML = `
      <div id="nova-fab" onclick="NovaAgent.toggle()" title="NOVA — Gemini AI Agent">
        <div id="nova-fab-icon">🤖</div>
        <span id="nova-unread" class="nova-badge hidden">0</span>
        <div class="nova-pulse-ring"></div>
      </div>

      <div id="nova-panel" class="nova-panel hidden">
        <div class="nova-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="position:relative;">
              <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#10b981,#6d28d9);display:flex;align-items:center;justify-content:center;font-size:20px;">🤖</div>
              <span id="nova-status-dot" style="position:absolute;bottom:0;right:0;width:10px;height:10px;background:#10b981;border-radius:50%;border:2px solid #0a0e1a;"></span>
            </div>
            <div>
              <div style="font-weight:800;font-size:15px;color:#f8fafc;display:flex;align-items:center;gap:6px;">
                NOVA
                <span id="nova-model-badge" style="font-size:9px;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:2px 7px;border-radius:20px;font-weight:700;">${this.apiKey ? '✦ GEMINI' : 'BASIC'}</span>
              </div>
              <div style="font-size:11px;color:#34d399;display:flex;align-items:center;gap:4px;">
                <span style="width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;animation:novaBlink 1.5s infinite;"></span>
                EcoFlow AI Agent • Online
              </div>
            </div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <button onclick="NovaAgent.showApiSetup()" title="API Settings" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#94a3b8;font-size:13px;cursor:pointer;padding:5px 8px;" title="Settings">⚙️</button>
            <button onclick="NovaAgent.clearChat()" title="Clear" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#94a3b8;font-size:13px;cursor:pointer;padding:5px 8px;">🗑️</button>
            <button onclick="NovaAgent.toggle()" style="background:none;border:none;color:#64748b;font-size:22px;cursor:pointer;padding:2px 6px;line-height:1;">×</button>
          </div>
        </div>

        <div id="nova-messages" class="nova-messages"></div>
        <div id="nova-chips" class="nova-chips-bar"></div>

        <div class="nova-input-bar">
          <button id="nova-mic" onclick="NovaAgent.toggleVoice()" title="Voice" style="background:none;border:none;cursor:pointer;font-size:18px;padding:6px;color:#64748b;flex-shrink:0;transition:color 0.2s;">🎙️</button>
          <input id="nova-input" type="text" placeholder="Kuch bhi pucho... (Hinglish/English)" autocomplete="off" />
          <button id="nova-send" onclick="NovaAgent.send()" title="Send">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M22 2L15 22 11 13 2 9l20-7z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>

      <!-- API Key Setup Modal -->
      <div id="nova-api-modal" class="nova-api-modal hidden">
        <div class="nova-api-box">
          <div style="font-size:28px;margin-bottom:8px;">🔑</div>
          <h3 style="margin:0 0 6px;color:#f8fafc;font-size:16px;">Gemini AI Unlock Karo</h3>
          <p style="margin:0 0 16px;color:#64748b;font-size:12px;line-height:1.5;">Real AI responses ke liye Google Gemini API key chahiye. <strong>Free hai!</strong><br>Niche link se 2 minute mein lo:</p>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#4285f4,#34a853);color:#fff;text-decoration:none;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;margin-bottom:14px;">🌐 aistudio.google.com → Get API Key</a>
          <p style="margin:-6px 0 14px;color:#ef4444;font-size:10px;line-height:1.4;">⚠️ Dhyaan rahe: Agar '401 Unauthorized' error aaye, toh verify karo ki key Google AI Studio se hi generate ki gayi hai aur active hai.</p>
          <input id="nova-key-input" type="password" placeholder="AIza... (paste your key here)" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:10px;padding:10px 14px;color:#f8fafc;font-size:13px;outline:none;margin-bottom:10px;" />
          <div style="display:flex;gap:8px;">
            <button onclick="NovaAgent.saveApiKey()" style="flex:1;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:10px;padding:10px;color:#fff;font-weight:800;cursor:pointer;font-size:14px;">✅ Save & Activate</button>
            <button onclick="NovaAgent.closeApiModal()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;color:#94a3b8;cursor:pointer;font-size:13px;">Cancel</button>
          </div>
          <p id="nova-key-status" style="margin:8px 0 0;font-size:11px;color:#64748b;text-align:center;"></p>
        </div>
      </div>
    `;
    document.body.appendChild(widget);
    this.injectStyles();
    document.getElementById('nova-input').addEventListener('keypress', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
    });
    document.getElementById('nova-key-input')?.addEventListener('keypress', e => {
      if (e.key === 'Enter') this.saveApiKey();
    });
  },

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #nova-widget{position:fixed;bottom:28px;right:28px;z-index:99999;font-family:'Inter',sans-serif;}
      #nova-fab{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#10b981,#6d28d9);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;box-shadow:0 8px 32px rgba(109,40,217,0.5),0 4px 16px rgba(16,185,129,0.4);transition:transform 0.25s,box-shadow 0.25s;animation:novaFloat 3s ease-in-out infinite;}
      #nova-fab:hover{transform:scale(1.1);}
      #nova-fab-icon{font-size:28px;}
      .nova-pulse-ring{position:absolute;inset:-7px;border-radius:50%;border:2px solid rgba(109,40,217,0.4);animation:novaPulse 2s ease-out infinite;}
      .nova-badge{position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:10px;font-weight:800;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #0a0e1a;}
      .nova-panel{position:absolute;bottom:80px;right:0;width:390px;height:580px;background:rgba(8,12,22,0.98);border:1px solid rgba(109,40,217,0.25);border-radius:22px;box-shadow:0 24px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.04),0 0 60px rgba(109,40,217,0.08);display:flex;flex-direction:column;overflow:hidden;backdrop-filter:blur(20px);transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);transform-origin:bottom right;}
      .nova-panel.hidden{transform:scale(0.82) translateY(8px);opacity:0;pointer-events:none;}
      .nova-panel:not(.hidden){transform:scale(1) translateY(0);opacity:1;}
      .nova-header{padding:14px 16px;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(135deg,rgba(109,40,217,0.12),rgba(16,185,129,0.06));border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0;}
      .nova-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth;}
      .nova-messages::-webkit-scrollbar{width:3px;}
      .nova-messages::-webkit-scrollbar-thumb{background:rgba(109,40,217,0.3);border-radius:2px;}
      .nova-msg{display:flex;gap:8px;align-items:flex-end;animation:novaSlideUp 0.3s ease;}
      .nova-msg.user{flex-direction:row-reverse;}
      .nova-avatar{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:15px;}
      .nova-avatar.bot{background:linear-gradient(135deg,#10b981,#6d28d9);}
      .nova-avatar.user{background:linear-gradient(135deg,#8b5cf6,#6d28d9);}
      .nova-bubble{max-width:82%;padding:10px 14px;border-radius:18px;font-size:13px;line-height:1.65;color:#e2e8f0;word-break:break-word;white-space:pre-wrap;}
      .nova-msg:not(.user) .nova-bubble{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.07);border-radius:18px 18px 18px 4px;}
      .nova-msg.user .nova-bubble{background:linear-gradient(135deg,rgba(109,40,217,0.25),rgba(79,70,229,0.2));border:1px solid rgba(109,40,217,0.3);border-radius:18px 18px 4px 18px;color:#f8fafc;}
      .nova-bubble strong{color:#a78bfa;}
      .nova-bubble em{color:#34d399;}
      .nova-time{font-size:10px;color:#334155;margin-top:3px;}
      .nova-msg.user .nova-time{text-align:right;}
      .nova-action-btn{display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:7px 14px;background:linear-gradient(135deg,rgba(109,40,217,0.2),rgba(16,185,129,0.1));border:1px solid rgba(109,40,217,0.35);border-radius:9px;color:#a78bfa;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s;}
      .nova-action-btn:hover{background:rgba(109,40,217,0.3);transform:translateY(-1px);}
      .nova-typing{display:flex;gap:5px;padding:12px 14px;align-items:center;}
      .nova-typing span{width:7px;height:7px;border-radius:50%;background:linear-gradient(135deg,#10b981,#6d28d9);animation:novaDot 1.3s infinite;}
      .nova-typing span:nth-child(2){animation-delay:0.2s;}
      .nova-typing span:nth-child(3){animation-delay:0.4s;}
      .nova-chips-bar{padding:8px 12px;display:flex;gap:6px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,0.04);flex-shrink:0;}
      .nova-chip{padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(109,40,217,0.1);border:1px solid rgba(109,40,217,0.25);color:#a78bfa;cursor:pointer;white-space:nowrap;transition:all 0.18s;}
      .nova-chip:hover{background:rgba(109,40,217,0.25);color:#c4b5fd;transform:translateY(-1px);}
      .nova-input-bar{padding:12px 14px;display:flex;gap:8px;align-items:center;border-top:1px solid rgba(255,255,255,0.05);flex-shrink:0;background:rgba(0,0,0,0.25);}
      #nova-input{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(109,40,217,0.2);border-radius:12px;padding:10px 14px;color:#f8fafc;font-size:13px;outline:none;font-family:'Inter',sans-serif;transition:border-color 0.2s;}
      #nova-input:focus{border-color:rgba(109,40,217,0.5);}
      #nova-input::placeholder{color:#334155;}
      #nova-send{background:linear-gradient(135deg,#7c3aed,#10b981);border:none;border-radius:12px;padding:10px 14px;color:#fff;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s;}
      #nova-send:hover{transform:scale(1.05);box-shadow:0 4px 20px rgba(109,40,217,0.5);}
      #nova-send:active{transform:scale(0.95);}
      #nova-mic.recording{color:#ef4444!important;animation:novaMicPulse 1s infinite;}
      .nova-api-modal{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;}
      .nova-api-box{background:rgba(10,14,26,0.98);border:1px solid rgba(109,40,217,0.4);border-radius:20px;padding:28px;max-width:340px;width:90%;box-shadow:0 24px 80px rgba(0,0,0,0.8);text-align:center;}
      .nova-streaming-cursor{display:inline-block;width:2px;height:14px;background:#a78bfa;margin-left:1px;animation:novaCursor 0.8s infinite;vertical-align:middle;}
      @keyframes novaFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      @keyframes novaPulse{0%{transform:scale(1);opacity:0.5}100%{transform:scale(1.6);opacity:0}}
      @keyframes novaSlideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes novaDot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1.1);opacity:1}}
      @keyframes novaMicPulse{0%,100%{opacity:1}50%{opacity:0.3}}
      @keyframes novaBlink{0%,100%{opacity:1}50%{opacity:0.3}}
      @keyframes novaCursor{0%,100%{opacity:1}50%{opacity:0}}
      .hidden{display:none!important;}
      @media(max-width:480px){.nova-panel{width:calc(100vw - 20px);right:-4px;height:72vh;bottom:78px;}#nova-widget{bottom:16px;right:12px;}}
    `;
    document.head.appendChild(style);
  },

  // ─── API Key Management ──────────────────────────────────────────
  showApiSetup() {
    document.getElementById('nova-api-modal').classList.remove('hidden');
    document.getElementById('nova-key-input').value = '';
    document.getElementById('nova-key-status').textContent = this.apiKey ? '✅ Key already saved. New key dalne se replace ho jayega.' : '';
  },

  closeApiModal() {
    document.getElementById('nova-api-modal').classList.add('hidden');
  },

  async saveApiKey() {
    const input = document.getElementById('nova-key-input');
    const status = document.getElementById('nova-key-status');
    const key = input.value.trim();
    if (!key || !key.startsWith('AIza')) {
      status.textContent = '❌ Invalid key. AIza... se shuru hona chahiye.';
      status.style.color = '#ef4444';
      return;
    }
    status.textContent = '🔄 Testing key...';
    status.style.color = '#94a3b8';

    // Quick test call
    try {
      const test = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'say "ok"' }] }] })
      });
      
      if (!test.ok) {
        if (test.status === 401) throw new Error('401_UNAUTHORIZED');
        throw new Error('API Error');
      }
      
      this.apiKey = key;
      localStorage.setItem('nova_gemini_key', key);
      status.textContent = '✅ Key valid! Gemini AI activated!';
      status.style.color = '#34d399';
      document.getElementById('nova-model-badge').textContent = '✦ GEMINI';
      document.getElementById('nova-model-badge').style.background = 'linear-gradient(135deg,#7c3aed,#4f46e5)';
      setTimeout(() => {
        this.closeApiModal();
        this.addBubble("🎉 **Gemini AI activated!** Main ab real AI responses de sakta hoon!\n\nEcoFlow ke bare mein kuch bhi pucho — fleet, routes, carbon market, bins, ya kuch aur! 🚀", 'nova');
        this.showQuickChips();
      }, 1500);
    } catch (e) {
      if (e.message === '401_UNAUTHORIZED') {
        status.textContent = '❌ 401 Error: Invalid Key. Google AI Studio se nai key banao.';
      } else {
        status.textContent = '❌ Key invalid ya network error. Check karo.';
      }
      status.style.color = '#ef4444';
    }
  },

  // ─── Send + Gemini Call ──────────────────────────────────────────
  send() {
    const input = document.getElementById('nova-input');
    const text = input?.value?.trim();
    if (!text || this.isStreaming) return;
    input.value = '';
    document.getElementById('nova-chips').innerHTML = '';
    this.addBubble(text, 'user');

    if (this.apiKey) {
      this.callGemini(text);
    } else {
      this.callLocal(text);
    }
  },

  // ─── Real Gemini API Call with Streaming ─────────────────────────
  async callGemini(userText) {
    this.isStreaming = true;
    this.showTyping();

    // Build conversation history for Gemini
    const contents = [];
    const recentHistory = this.conversationHistory.slice(-8); // last 8 turns
    recentHistory.forEach(h => {
      contents.push({ role: h.role === 'nova' ? 'model' : 'user', parts: [{ text: h.text }] });
    });
    contents.push({ role: 'user', parts: [{ text: userText }] });

    const requestBody = {
      system_instruction: { parts: [{ text: this.SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
        topK: 40,
        topP: 0.95
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' }
      ]
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${this.apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'API Error');
      }

      this.hideTyping();
      const bubbleId = 'nova-stream-' + Date.now();
      const div = this.createStreamBubble(bubbleId);

      let fullText = '';
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const token = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (token) {
                fullText += token;
                this.updateStreamBubble(bubbleId, fullText);
                this.scrollToBottom();
              }
            } catch(e) {}
          }
        }
      }

      // Process navigation tags
      const navMatch = fullText.match(/\[NAV:([a-z-]+)\]/);
      let cleanText = fullText.replace(/\[NAV:[a-z-]+\]/g, '').trim();
      this.finalizeStreamBubble(bubbleId, cleanText, navMatch?.[1] || null);

      // Save to history
      this.conversationHistory.push({ role: 'user', text: userText });
      this.conversationHistory.push({ role: 'nova', text: cleanText });
      if (this.conversationHistory.length > 20) this.conversationHistory = this.conversationHistory.slice(-20);
      this.saveHistory();

      if (!this.isOpen) { this.unreadCount++; this.updateBadge(); }
      setTimeout(() => this.showQuickChips(), 300);

    } catch (e) {
      this.hideTyping();
      console.error('[NOVA Gemini Error]', e);
      if (e.message.includes('API key') || e.message.includes('401') || e.message.includes('invalid authentication')) {
        this.addBubble(`❌ **API Error (401 Unauthorized):** Aapki API key invalid hai ya cancel ho chuki hai.\n\n👉 Google AI Studio (aistudio.google.com) par jaake naya project banao aur nayi API key generate karke ⚙️ Settings mein dalo!`, 'nova');
        this.apiKey = null;
        localStorage.removeItem('nova_gemini_key');
        setTimeout(() => this.showApiSetup(), 2000);
      } else {
        this.addBubble(`⚠️ Connection issue: ${e.message}\n\nOffline mode mein switch ho raha hoon...`, 'nova');
        this.callLocal(userText);
      }
    }
    this.isStreaming = false;
  },

  createStreamBubble(id) {
    const container = document.getElementById('nova-messages');
    const div = document.createElement('div');
    div.className = 'nova-msg';
    div.innerHTML = `
      <div class="nova-avatar bot">🤖</div>
      <div>
        <div class="nova-bubble" id="${id}"><span class="nova-streaming-cursor"></span></div>
        <div class="nova-time">${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
      </div>`;
    container.appendChild(div);
    return div;
  },

  updateStreamBubble(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = this.formatText(text) + '<span class="nova-streaming-cursor"></span>';
  },

  finalizeStreamBubble(id, text, navPage) {
    const el = document.getElementById(id);
    if (!el) return;
    let html = this.formatText(text);
    if (navPage) {
      html += `<br><button class="nova-action-btn" onclick="NovaAgent.handleNav('${navPage}')">→ ${navPage.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} Dekho</button>`;
    }
    el.innerHTML = html;
  },

  // ─── Offline Keyword Fallback ─────────────────────────────────────
  callLocal(text) {
    this.showTyping();
    const lower = text.toLowerCase();
    const responses = [
      { keys: ['truck','fleet','vehicle','gaadi'], reply: "🚛 **Fleet Status:**\n- 18/22 trucks active\n- KA-01-CD-5678 low fuel (23%)\n- PdM Health: 94.8%\n\n⚙️ Gemini AI ke liye API key add karo!", nav: 'fleet' },
      { keys: ['bin','sensor','overflow','kachra'], reply: "📡 **Smart Bins:**\n- 🔴 6 bins critical\n- 🟡 12 warning\n- 🟢 30 normal\n\nDispatch karo? Gemini AI se aur detail milegi!", nav: 'smart-bins' },
      { keys: ['carbon','credit','co2'], reply: "🌿 **Carbon Price:** ₹1,247/tCO₂e (↑2.1%)\n\nReal-time analysis ke liye Gemini AI activate karo!", nav: 'carbon-trading' },
      { keys: ['route','rasta','path'], reply: "🗺️ **Routes:** 24 active, 3 zones delayed.\nReal AI analysis ke liye API key chahiye!", nav: 'routes' },
      { keys: ['bill','invoice','paisa'], reply: "💰 **Billing:** ₹2.84L outstanding, 12 pending invoices.\n", nav: 'billing' },
      { keys: ['hello','hi','namaste','help'], reply: "Namaste! 🙏 Main **NOVA** hoon — EcoFlow AI Agent!\n\n🔑 Gemini AI unlock karne ke liye ⚙️ Settings tap karo — **free hai!**", nav: null }
    ];
    const match = responses.find(r => r.keys.some(k => lower.includes(k)));
    setTimeout(() => {
      this.hideTyping();
      if (match) {
        this.addBubble(match.reply, 'nova', match.nav);
      } else {
        this.addBubble("Hmm, samajh nahi aaya! 🤔\n\n💡 Tip: **Gemini AI** activate karo ⚙️ Settings se — real intelligent answers milenge!", 'nova');
        setTimeout(() => this.showApiSetup(), 1500);
      }
      this.showQuickChips();
    }, 800 + Math.random() * 500);
  },

  // ─── Message Rendering ───────────────────────────────────────────
  addBubble(text, sender, navPage = null) {
    const msg = { text, sender, navPage, time: Date.now() };
    if (!this.messages) this.messages = [];
    this.messages.push(msg);
    this.renderMsg(msg);
    this.scrollToBottom();
    if (sender === 'nova' && !this.isOpen) { this.unreadCount++; this.updateBadge(); }
    try { sessionStorage.setItem('nova_msgs', JSON.stringify(this.messages.slice(-20))); } catch(e) {}
  },

  renderMsg(msg) {
    const c = document.getElementById('nova-messages');
    if (!c) return;
    const isUser = msg.sender === 'user';
    const div = document.createElement('div');
    div.className = `nova-msg ${isUser ? 'user' : ''}`;
    div.innerHTML = `
      <div class="nova-avatar ${isUser ? 'user' : 'bot'}">${isUser ? '👤' : '🤖'}</div>
      <div>
        <div class="nova-bubble">${this.formatText(msg.text)}${msg.navPage ? `<br><button class="nova-action-btn" onclick="NovaAgent.handleNav('${msg.navPage}')">→ Go to ${msg.navPage.replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</button>` : ''}</div>
        <div class="nova-time">${new Date(msg.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
      </div>`;
    c.appendChild(div);
  },

  renderAll() {
    const c = document.getElementById('nova-messages');
    if (!c) return;
    c.innerHTML = '';
    (this.messages || []).forEach(m => this.renderMsg(m));
    this.scrollToBottom();
  },

  formatText(t) {
    return (t || '')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  },

  showTyping() {
    const c = document.getElementById('nova-messages');
    if (!c) return;
    const d = document.createElement('div');
    d.id = 'nova-typing-indicator'; d.className = 'nova-msg';
    d.innerHTML = `<div class="nova-avatar bot">🤖</div><div class="nova-bubble nova-typing"><span></span><span></span><span></span></div>`;
    c.appendChild(d);
    this.scrollToBottom();
  },

  hideTyping() { document.getElementById('nova-typing-indicator')?.remove(); },

  showQuickChips() {
    const chips = [
      { label: '🚛 Fleet Status', q: 'Fleet status kya hai? Koi truck issue?' },
      { label: '📡 Bins Critical?', q: 'Kaun se bins overflow level par hain?' },
      { label: '🎯 Today Alerts', q: 'Aaj ke emergency alerts batao' },
      { label: '🌿 Carbon Price', q: 'Carbon credit price aaj kitna hai?' },
      { label: '💰 Outstanding Bills', q: 'Billing outstanding kitna hai?' },
      { label: '📊 Swachh Score', q: 'Aaj ka Swachh Bharat compliance score?' }
    ];
    const bar = document.getElementById('nova-chips');
    if (!bar) return;
    bar.innerHTML = chips.map(c => `<button class="nova-chip" onclick="NovaAgent.chip('${c.q}')">${c.label}</button>`).join('');
  },

  chip(text) {
    const input = document.getElementById('nova-input');
    if (input) { input.value = text; this.send(); }
  },

  handleNav(page) {
    if (window.EcoFlow) EcoFlow.navigate(page);
    window.location.hash = page;
    this.toggle();
  },

  // ─── Voice Input ─────────────────────────────────────────────────
  toggleVoice() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      this.addBubble("⚠️ Voice ke liye Chrome browser use karo!", 'nova'); return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'hi-IN'; recognition.continuous = false; recognition.interimResults = false;
    const mic = document.getElementById('nova-mic');
    mic.classList.add('recording');
    recognition.start();
    recognition.onresult = (e) => {
      const t = e.results[0][0].transcript;
      const input = document.getElementById('nova-input');
      if (input) { input.value = t; this.send(); }
      mic.classList.remove('recording');
    };
    recognition.onerror = () => mic.classList.remove('recording');
    recognition.onend = () => mic.classList.remove('recording');
  },

  // ─── Toggle / UI ─────────────────────────────────────────────────
  toggle() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('nova-panel');
    const icon = document.getElementById('nova-fab-icon');
    const fab = document.getElementById('nova-fab');
    if (this.isOpen) {
      panel.classList.remove('hidden'); icon.textContent = '✕';
      fab.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
      this.unreadCount = 0; this.updateBadge();
      setTimeout(() => document.getElementById('nova-input')?.focus(), 250);
    } else {
      panel.classList.add('hidden'); icon.textContent = '🤖';
      fab.style.background = 'linear-gradient(135deg,#10b981,#6d28d9)';
    }
    this.scrollToBottom();
  },

  scrollToBottom() {
    const c = document.getElementById('nova-messages');
    if (c) c.scrollTop = c.scrollHeight;
  },

  updateBadge() {
    const b = document.getElementById('nova-unread');
    if (!b) return;
    b.textContent = this.unreadCount;
    this.unreadCount > 0 ? b.classList.remove('hidden') : b.classList.add('hidden');
  },

  clearChat() {
    this.messages = []; this.conversationHistory = [];
    sessionStorage.removeItem('nova_msgs');
    const c = document.getElementById('nova-messages');
    if (c) c.innerHTML = '';
    setTimeout(() => {
      this.addBubble("Chat clear! 🗑️ Fresh start — kuch bhi pucho! 😊", 'nova');
      this.showQuickChips();
    }, 150);
  },

  // ─── Context Monitor ─────────────────────────────────────────────
  startContextMonitor() {
    document.addEventListener('pageLoaded', (e) => {
      const page = e.detail?.page;
      if (!page || page === this.currentContext) return;
      this.currentContext = page;
      if (this.isOpen) return;
      const tips = {
        'command-center': "🎯 **Command Center** mein aaye! Koi emergency hai? Main help kar sakta hoon!",
        'carbon-trading': "🌿 Carbon market **bullish** hai aaj! Buy karna chahoge?",
        'smart-bins': "📡 **6 bins** critical level par — dispatch karna chahiye?",
        'fleet': "🚛 KA-01-CD-5678 ka fuel sirf **23%** hai!",
        'billing': "💰 **12 invoices** pending, ₹2.84L outstanding!"
      };
      if (tips[page]) {
        setTimeout(() => {
          this.addBubble(tips[page], 'nova');
          const fab = document.getElementById('nova-fab');
          if (fab) { fab.style.transform='scale(1.18)'; setTimeout(()=>fab.style.transform='',600); }
        }, 1500);
      }
    });
  },

  // ─── Storage ─────────────────────────────────────────────────────
  loadHistory() {
    try {
      this.messages = JSON.parse(sessionStorage.getItem('nova_msgs') || '[]');
    } catch(e) { this.messages = []; }
  },

  saveHistory() {
    try { sessionStorage.setItem('nova_msgs', JSON.stringify((this.messages||[]).slice(-20))); } catch(e) {}
  }
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => NovaAgent.init(), 600));
} else {
  setTimeout(() => NovaAgent.init(), 600);
}
window.NovaAgent = NovaAgent;
