const wasteKnowledge = {
  // Waste segregation rules (Indian context - CPCB / BBMP guidelines)
  categories: {
    wet: {
      name: 'Wet Waste (Green Bin)',
      color: '#10b981',
      icon: '🟢',
      items: ['Kitchen waste', 'Fruit & vegetable peels', 'Leftover food', 'Egg shells', 'Tea bags/coffee grounds', 'Flowers', 'Leaves', 'Meat & fish waste', 'Dairy products', 'Coconut shells'],
      tips: ['Wrap in newspaper or use compostable bags', 'Don\'t mix with dry waste', 'Collected daily by BBMP in most wards', 'Can be composted at home']
    },
    dry: {
      name: 'Dry Waste (Blue Bin)',
      color: '#3b82f6',
      icon: '🔵',
      items: ['Paper & cardboard', 'Plastic bottles & containers', 'Metal cans', 'Glass bottles', 'Tetrapak cartons', 'Fabric & cloth', 'Wood pieces', 'Rubber', 'Thermocol', 'Packaging material'],
      tips: ['Clean and dry before disposing', 'Flatten cardboard boxes', 'Remove caps from bottles', 'Collected alternate days or weekly']
    },
    hazardous: {
      name: 'Hazardous Waste (Red Bin)',
      color: '#ef4444',
      icon: '🔴',
      items: ['Batteries', 'CFL/LED bulbs', 'Expired medicines', 'Pesticide containers', 'Paint cans', 'Motor oil', 'Syringes & needles', 'Chemical cleaners', 'Thermometers', 'Aerosol cans'],
      tips: ['Never mix with regular waste', 'Store separately in sealed containers', 'Hand over to authorized collectors only', 'BBMP has special collection drives']
    },
    ewaste: {
      name: 'E-Waste',
      color: '#f59e0b',
      icon: '⚡',
      items: ['Old phones & tablets', 'Laptop/desktop computers', 'Cables & chargers', 'Printers', 'TV & monitors', 'Keyboards & mice', 'Hard drives', 'Circuit boards', 'Small appliances', 'Gaming consoles'],
      tips: ['Never throw in regular bins', 'Contact certified e-waste recyclers', 'Many brands offer take-back programs', 'Schedule pickup through EcoFlow']
    },
    sanitary: {
      name: 'Sanitary Waste',
      color: '#8b5cf6',
      icon: '🟣',
      items: ['Diapers', 'Sanitary pads', 'Tampons', 'Bandages', 'Cotton swabs', 'Face masks'],
      tips: ['Wrap securely in newspaper', 'Mark clearly as sanitary waste', 'Keep separate from wet and dry waste', 'BBMP mandates separate collection']
    }
  },
  
  // Common questions and smart responses
  responses: {
    greetings: [
      'Namaste! 🙏 I\'m your EcoFlow AI Assistant. How can I help you with waste management today?',
      'Hello! I\'m here to help you sort waste correctly and keep our city clean. What would you like to know?'
    ],
    segregation: 'Great question! In India, waste should be segregated at source into: 🟢 Wet Waste (kitchen/organic), 🔵 Dry Waste (recyclable), 🔴 Hazardous Waste, and special categories like E-waste and Sanitary waste. Which category would you like to learn more about?',
    composting: 'Home composting is a great way to reduce waste! Here\'s how to start:\n\n1. 🪣 Get a composting bin or use an old bucket with holes\n2. 🍌 Add kitchen waste (peels, leftover food)\n3. 🍂 Layer with dry leaves or sawdust\n4. 💧 Keep slightly moist, not wet\n5. 🔄 Turn every few days\n6. ⏰ Ready in 45-60 days!\n\nBBMP also provides community composting programs in many wards.',
    recycling: 'Recycling rates in Bangalore:\n\n♻️ Paper: 80% recyclable\n♻️ Plastic (1,2,5): Highly recyclable\n♻️ Glass: 100% recyclable, infinitely!\n♻️ Metal: 95% recyclable\n\n⚠️ Avoid: Multilayer packaging, food-contaminated items, and mixed materials.',
    pickup: 'To schedule a special pickup through EcoFlow:\n\n1. Go to the Scheduling tab\n2. Click "Add Schedule"\n3. Select your zone/ward\n4. Choose waste type\n5. Pick a convenient time slot\n\nOr I can help you schedule right now! Which zone are you in?',
    dumping: 'To report illegal dumping:\n\n📱 BBMP Helpline: 080-22660000\n📱 Swachh Bharat App: Report with photo\n📱 BBMP SWM App: GPS-tagged complaints\n\nYou can also report through EcoFlow - we\'ll escalate to the concerned ward office immediately.',
    rules: 'Key waste management rules in India:\n\n📜 SWM Rules 2016 (amended 2024):\n• Mandatory source segregation\n• Bulk generators (>100kg/day) must process on-site\n• No burning of waste\n• Fines for littering: ₹200-₹25,000\n\n📜 BBMP Bye-laws:\n• 3-bin system mandatory\n• Collection between 6 AM - 10 AM\n• User fees applicable'
  },
  
  ecoFacts: [
    '🌍 India generates over 62 million tonnes of waste annually, but only 43 million tonnes is collected.',
    '♻️ Bangalore generates about 5,000 tonnes of waste daily - one of the highest in India!',
    '🌱 Composting wet waste can reduce your household waste by up to 60%.',
    '📱 India is the 3rd largest e-waste generator in the world. Proper disposal is crucial!',
    '🏭 1 tonne of recycled paper saves 17 trees, 7,000 gallons of water, and 3 cubic yards of landfill space.',
    '🇮🇳 Under Swachh Bharat Mission 2.0, India aims for 100% source segregation by 2026.',
    '💡 Bangalore\'s KCDC (Karnataka Compost Development Corporation) processes 500 tonnes of waste daily.',
    '🚛 India has about 2 million informal waste workers (ragpickers) who recycle 15-20% of waste.'
  ]
};

const AIAssistant = {
  messages: [],
  conversationHistory: [],
  maxHistory: 10,
  
  init() {
    this.messages = JSON.parse(sessionStorage.getItem('ecoflow_ai_chat') || '[]');
    
    // Add welcome message if new session
    if (this.messages.length === 0) {
      this.addMessage(wasteKnowledge.responses.greetings[0], 'ai', false);
    }
    
    this.bindEvents();
    this.renderChatHistory();
    this.renderWasteGuide();
    this.initVoiceOrb();

    // Load conversation history from sessionStorage
    try {
      const saved = sessionStorage.getItem('ecoflow_ai_history');
      if (saved) this.conversationHistory = JSON.parse(saved);
    } catch(e) {}
  },
  
  bindEvents() {
    const inputField = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const micBtn = document.getElementById('ai-mic-btn');
    const quickActions = document.querySelectorAll('.quick-action-chip');
    
    if (sendBtn && inputField) {
      sendBtn.addEventListener('click', () => this.sendMessage());
      
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    if (micBtn) {
      micBtn.addEventListener('click', () => this.startVoiceInput());
    }
    
    quickActions.forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (inputField) {
          inputField.value = e.target.textContent;
          this.sendMessage();
        }
      });
    });
  },

  orbState: 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking'
  orbTime: 0,

  initVoiceOrb() {
    const canvas = document.getElementById('ai-voice-orb');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const render = () => {
      this.orbTime += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      ctx.clearRect(0, 0, width, height);

      let baseRadius = 14;
      let primaryColor = '16, 185, 129'; // emerald
      let secondaryColor = '52, 211, 153';

      if (this.orbState === 'listening') {
        baseRadius = 15 + Math.sin(this.orbTime * 6) * 4;
        primaryColor = '239, 68, 68'; // red pulse
        secondaryColor = '251, 191, 36';
      } else if (this.orbState === 'thinking') {
        baseRadius = 14 + Math.cos(this.orbTime * 4) * 3;
        primaryColor = '139, 92, 246'; // purple pulse
        secondaryColor = '59, 130, 246';
      } else if (this.orbState === 'speaking') {
        baseRadius = 16 + Math.sin(this.orbTime * 8) * 3;
        primaryColor = '59, 130, 246'; // cyan/blue pulse
        secondaryColor = '45, 212, 191';
      } else {
        baseRadius = 13 + Math.sin(this.orbTime * 1.5) * 1.5;
      }

      // Outer Glow Aura
      const outerGradient = ctx.createRadialGradient(cx, cy, baseRadius * 0.4, cx, cy, baseRadius * 1.7);
      outerGradient.addColorStop(0, `rgba(${primaryColor}, 0.6)`);
      outerGradient.addColorStop(0.6, `rgba(${secondaryColor}, 0.25)`);
      outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = outerGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.7, 0, Math.PI * 2);
      ctx.fill();

      // Inner Glowing Core Ball
      const coreGradient = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, baseRadius);
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.35, `rgb(${secondaryColor})`);
      coreGradient.addColorStop(1, `rgb(${primaryColor})`);

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Orbital Rings
      for (let i = 0; i < 3; i++) {
        const angle = this.orbTime * (i + 1) * 0.7;
        const orbitRadius = baseRadius + 3 + i * 2;
        const px = cx + Math.cos(angle) * orbitRadius;
        const py = cy + Math.sin(angle) * orbitRadius;

        ctx.fillStyle = `rgba(${secondaryColor}, 0.7)`;
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(render);
    };

    render();
  },

  setOrbState(state, statusText, color) {
    this.orbState = state;
    const statusLabel = document.getElementById('ai-voice-status');
    if (statusLabel) {
      statusLabel.textContent = statusText;
      if (color) statusLabel.style.color = color;
    }
  },

  startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const micBtn = document.getElementById('ai-mic-btn');
    const inputField = document.getElementById('ai-chat-input');

    if (!SpeechRecognition) {
      if (typeof Utils !== 'undefined') {
        Utils.showToast('Voice input is not supported in this browser. Please use Chrome/Edge.', 'warning');
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      if (micBtn) micBtn.classList.add('animate-pulse');
      this.setOrbState('listening', '🔴 Listening... Speak now!', '#ef4444');
      if (typeof Utils !== 'undefined') Utils.showToast('Listening... Speak your waste query now.', 'info');

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (inputField) {
          inputField.value = transcript;
          this.sendMessage();
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error', event.error);
        if (micBtn) micBtn.classList.remove('animate-pulse');
        this.setOrbState('idle', 'AI Ready (Click 🎙️)', '#34d399');
      };

      recognition.onend = () => {
        if (micBtn) micBtn.classList.remove('animate-pulse');
        if (this.orbState === 'listening') {
          this.setOrbState('idle', 'AI Ready (Click 🎙️)', '#34d399');
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition exception', err);
      this.setOrbState('idle', 'AI Ready (Click 🎙️)', '#34d399');
    }
  },
  
  saveChat() {
    sessionStorage.setItem('ecoflow_ai_chat', JSON.stringify(this.messages));
  },
  
  addMessage(text, sender = 'user', save = true) {
    const message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(message);
    if (save) this.saveChat();
    
    this.appendMessageToUI(message);
    return message;
  },
  
  appendMessageToUI(message) {
    const chatContainer = document.getElementById('ai-chat-messages');
    if (!chatContainer) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex w-full mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`;
    
    if (message.sender === 'user') {
      msgDiv.innerHTML = `
        <div class="bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] shadow-md whitespace-pre-wrap">
          ${this.escapeHTML(message.text)}
        </div>
      `;
    } else {
      msgDiv.innerHTML = `
        <div class="flex items-end space-x-2 max-w-[80%]">
          <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
            <span class="text-emerald-600 text-sm font-bold">AI</span>
          </div>
          <div class="bg-white/80 backdrop-blur-md border border-white/20 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm whitespace-pre-wrap">
            ${this.formatAIText(message.text)}
            <div style="display:flex;gap:8px;margin-top:6px;opacity:0.6;"><button onclick="rateAIResponse(this,'up')" style="background:none;border:none;cursor:pointer;font-size:14px;" title="Helpful">👍</button><button onclick="rateAIResponse(this,'down')" style="background:none;border:none;cursor:pointer;font-size:14px;" title="Not helpful">👎</button></div>
          </div>
        </div>
      `;
    }
    
    chatContainer.appendChild(msgDiv);
    this.scrollToBottom();
  },
  
  showTypingIndicator() {
    const chatContainer = document.getElementById('ai-chat-messages');
    if (!chatContainer) return null;
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.id = 'typing-indicator';
    indicatorDiv.className = `flex w-full mb-4 justify-start`;
    indicatorDiv.innerHTML = `
      <div class="flex items-end space-x-2 max-w-[80%]">
        <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
          <span class="text-emerald-600 text-sm font-bold">AI</span>
        </div>
        <div class="bg-white/80 backdrop-blur-md border border-white/20 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex space-x-1">
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style="animation-delay: 300ms"></div>
        </div>
      </div>
    `;
    
    chatContainer.appendChild(indicatorDiv);
    this.scrollToBottom();
    return indicatorDiv;
  },
  
  removeTypingIndicator(indicatorDiv) {
    if (indicatorDiv && indicatorDiv.parentNode) {
      indicatorDiv.parentNode.removeChild(indicatorDiv);
    }
  },
  
  scrollToBottom() {
    const chatContainer = document.getElementById('ai-chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  },
  
  async sendMessage() {
    const inputField = document.getElementById('ai-chat-input');
    if (!inputField) return;
    
    const text = inputField.value.trim();
    if (!text) return;
    
    inputField.value = '';
    
    this.conversationHistory.push({role: 'user', text: text, time: Date.now()});

    // Add user message
    this.addMessage(text, 'user');
    this.setOrbState('thinking', '🟣 AI Processing Query...', '#a78bfa');
    
    // Show typing indicator
    const indicator = this.showTypingIndicator();
    
    // Simulate AI processing delay (0.5s - 1.2s)
    const delay = Math.floor(Math.random() * 700) + 500;
    
    setTimeout(() => {
      this.removeTypingIndicator(indicator);
      const response = this.processMessage(text);
      this.addMessage(response, 'ai');
      this.speakText(response);
      
      this.conversationHistory.push({role: 'ai', text: response, time: Date.now()});
      if (this.conversationHistory.length > this.maxHistory) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistory);
      }
      sessionStorage.setItem('ecoflow_ai_history', JSON.stringify(this.conversationHistory));
    }, delay);
  },

  speakText(text) {
    if (!('speechSynthesis' in window)) {
      this.setOrbState('idle', 'AI Ready (Click 🎙️)', '#34d399');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      // Strip emojis and markdown formatting for clean speech synthesis
      const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 250));
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;

      utterance.onstart = () => {
        this.setOrbState('speaking', '🔊 AI Speaking...', '#60a5fa');
      };
      utterance.onend = () => {
        this.setOrbState('idle', 'AI Ready (Click 🎙️)', '#34d399');
      };
      utterance.onerror = () => {
        this.setOrbState('idle', 'AI Ready (Click 🎙️)', '#34d399');
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.setOrbState('idle', 'AI Ready (Click 🎙️)', '#34d399');
    }
  },
  
  processMessage(text) {
    // Weighted intent classification
    const intents = [
      { name: 'route_optimization', keywords: ['route', 'optimize', 'path', 'distance', 'traffic', 'shortest'], weight: 0 },
      { name: 'waste_sorting', keywords: ['sort', 'segregate', 'recycle', 'compost', 'wet', 'dry', 'hazardous', 'e-waste'], weight: 0 },
      { name: 'billing', keywords: ['bill', 'invoice', 'payment', 'due', 'fee', 'charge', 'cost'], weight: 0 },
      { name: 'fleet', keywords: ['vehicle', 'truck', 'fleet', 'driver', 'maintenance', 'fuel'], weight: 0 },
      { name: 'compliance', keywords: ['swachh', 'bharat', 'bbmp', 'regulation', 'compliance', 'penalty', 'fine'], weight: 0 },
      { name: 'schedule', keywords: ['schedule', 'collection', 'pickup', 'timing', 'when', 'calendar'], weight: 0 },
      { name: 'analytics', keywords: ['report', 'analytics', 'statistics', 'data', 'trend', 'performance'], weight: 0 },
      { name: 'greeting', keywords: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'help'], weight: 0 }
    ];
    const lowerMsg = text.toLowerCase();
    intents.forEach(intent => {
      intent.keywords.forEach(kw => {
        if (lowerMsg.includes(kw)) intent.weight += 2;
      });
      // Context boost: if user asked about same topic recently
      if (this.conversationHistory && this.conversationHistory.length > 0) {
        const lastMsg = this.conversationHistory[this.conversationHistory.length - 1];
        if (lastMsg && lastMsg.role === 'user') {
          intent.keywords.forEach(kw => {
            if (lastMsg.text.toLowerCase().includes(kw)) intent.weight += 1;
          });
        }
      }
    });
    const topIntent = intents.reduce((a, b) => a.weight > b.weight ? a : b);

    const lowerText = text.toLowerCase();
    
    // 1. Check for greetings
    if (/^(hi|hello|namaste|hey|hola)/.test(lowerText)) {
      const g = wasteKnowledge.responses.greetings;
      return g[Math.floor(Math.random() * g.length)];
    }
    
    // 2. Check for action queries
    if (lowerText.includes('schedule') || lowerText.includes('pickup')) {
      return wasteKnowledge.responses.pickup;
    }
    if (lowerText.includes('compost') || lowerText.includes('composting')) {
      return wasteKnowledge.responses.composting;
    }
    if (lowerText.includes('recycle') || lowerText.includes('recycling')) {
      return wasteKnowledge.responses.recycling;
    }
    if (lowerText.includes('rule') || lowerText.includes('regulation') || lowerText.includes('fine')) {
      return wasteKnowledge.responses.rules;
    }
    if (lowerText.includes('report') || lowerText.includes('dumping') || lowerText.includes('illegal')) {
      return wasteKnowledge.responses.dumping;
    }
    if (lowerText.includes('fact') || lowerText.includes('tip') || lowerText.includes('did you know')) {
      const facts = wasteKnowledge.ecoFacts;
      return "Here's an Eco Fact for you:\n\n" + facts[Math.floor(Math.random() * facts.length)];
    }
    
    // 3. Check for specific categories
    if (lowerText.includes('segregate') || lowerText.includes('segregation')) {
      return wasteKnowledge.responses.segregation;
    }
    
    // 4. Check for specific items to identify the bin
    for (const [key, category] of Object.entries(wasteKnowledge.categories)) {
      if (lowerText.includes(key + ' waste')) {
        return `**${category.name}**\n\nItems included: ${category.items.join(', ')}\n\nTips: ${category.tips.join('. ')}.`;
      }
      
      for (const item of category.items) {
        if (lowerText.includes(item.toLowerCase().split(' ')[0])) {
          return `You should put "${item}" in the **${category.name}** ${category.icon}.\n\nTips for this category:\n• ${category.tips.join('\n• ')}`;
        }
      }
    }
    
    // Default response if nothing matches
    return "I'm not quite sure about that item. Generally, waste is divided into 🟢 Wet, 🔵 Dry, and 🔴 Hazardous. Could you provide more details, or try asking about specific items like 'plastic bottle', 'food waste', or 'batteries'?";
  },
  
  renderChatHistory() {
    const chatContainer = document.getElementById('ai-chat-messages');
    if (!chatContainer) return;
    
    chatContainer.innerHTML = '';
    this.messages.forEach(msg => this.appendMessageToUI(msg));
  },
  
  renderWasteGuide() {
    const guideContainer = document.getElementById('waste-sorting-guide');
    if (!guideContainer) return;
    
    let html = '';
    for (const [key, category] of Object.entries(wasteKnowledge.categories)) {
      html += `
        <div class="bg-white/40 backdrop-blur-sm border border-white/20 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer" onclick="AIAssistant.showCategoryDetails('${key}')">
          <div class="flex items-center space-x-3 mb-2">
            <span class="text-2xl">${category.icon}</span>
            <h3 class="font-semibold text-gray-800" style="color: ${category.color}">${category.name}</h3>
          </div>
          <p class="text-sm text-gray-600 line-clamp-2">${category.items.slice(0, 3).join(', ')}...</p>
        </div>
      `;
    }
    guideContainer.innerHTML = html;
  },
  
  showCategoryDetails(categoryKey) {
    const category = wasteKnowledge.categories[categoryKey];
    if (!category) return;
    
    const inputField = document.getElementById('ai-chat-input');
    if (inputField) {
      inputField.value = `Tell me about ${category.name}`;
      this.sendMessage();
    }
  },
  
  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag])
    );
  },
  
  formatAIText(text) {
    let formatted = this.escapeHTML(text);
    // Bold formatting for markdown-like syntax
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return formatted;
  }
};

window.rateAIResponse = function(btn, rating) {
  const container = btn.parentElement;
  container.innerHTML = rating === 'up' ? '<span style="color:#34d399;font-size:12px;">✅ Thanks for the feedback!</span>' : '<span style="color:#f87171;font-size:12px;">📝 We\\'ll improve this response.</span>';
};

// Export or attach to window for modules / script tags
if (typeof window !== 'undefined') {
  window.AIAssistant = AIAssistant;
}
export default AIAssistant;
