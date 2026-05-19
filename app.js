/**
 * Karigar.ai - AI Service Orchestrator for Pakistan's Informal Economy
 * Complete PWA Application JavaScript
 * 
 * 7 Agent System:
 * Agent 1: Language Understanding
 * Agent 2: Provider Matching
 * Agent 3: Scheduling Intelligence
 * Agent 4: Dynamic Pricing
 * Agent 5: Booking Simulation
 * Agent 6: Service Quality Loop
 * Agent 7: Dispute and Escalation
 */

// ===== CONFIGURATION =====
const CONFIG = {
  GEMINI_API_KEY: '', // Add your Gemini API key here
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  TEMPERATURE: 0.3,
  MAX_TOKENS: 2048,
  TRAVEL_BUFFER_MINUTES: 30,
  WORKING_HOURS_START: 7,
  WORKING_HOURS_END: 21,
  MAX_WAITLIST_PER_DAY: 3,
  RESCHEDULE_WINDOW_MINUTES: 15,
  PLATFORM_FEE_PERCENT: 10,
  SURGE_THRESHOLD_15: 3,
  SURGE_THRESHOLD_20: 5,
};

// ===== GLOBAL STATE =====
let state = {
  currentScreen: 'home',
  language: 'en',
  providers: [],
  serviceRequest: null,
  parsedRequest: null,
  rankedProviders: [],
  selectedProvider: null,
  selectedSlot: null,
  booking: null,
  pricing: null,
  feedback: null,
  dispute: null,
  agentTraces: [],
  bookings: [],
  isRecording: false,
  recognition: null
};

// ===== TRANSLATIONS =====
const translations = {
  en: {
    offline_message: "You're offline. Some features may be limited.",
    find_service: "Find Service",
    trending_services: "Trending Services",
    recent_bookings: "Recent Bookings",
    nav_home: "Home",
    nav_bookings: "Bookings",
    nav_providers: "Providers",
    nav_help: "Help",
    request_understanding: "Request Understanding",
    clarification_needed: "Need some clarification",
    submit_answer: "Submit Answer",
    proceed_to_matching: "Proceed to Provider Matching",
    select_provider: "Select Provider",
    schedule_appointment: "Schedule Appointment",
    select_date: "Select Date",
    select_time: "Select Time",
    scheduling_conflict: "Scheduling Conflict",
    alternative_slots: "Alternative Slots Available:",
    confirm_slot: "Confirm Slot",
    price_quote: "Price Quote",
    fairness_summary: "Fairness Summary",
    confirm_and_book: "Confirm & Book",
    cancel: "Cancel",
    booking_progress: "Booking Progress",
    view_receipt: "View Receipt",
    rate_service: "Rate Service",
    how_was_service: "How was your experience with",
    tap_to_rate: "Tap to rate",
    additional_feedback: "Additional Feedback (Optional)",
    submit_feedback: "Submit Feedback",
    thank_you: "Thank You!",
    new_provider_rating: "New Provider Rating",
    report_problem: "Report a Problem",
    what_issue: "What's the issue?",
    no_show: "Provider No-Show",
    price_dispute: "Price Dispute",
    poor_quality: "Poor Quality",
    provider_rude: "Provider Rude",
    wrong_service: "Wrong Service",
    refund_request: "Refund Request",
    describe_issue: "Describe the issue",
    submit_dispute: "Submit Dispute",
    resolution: "Resolution",
    compensation: "Compensation",
    done: "Done",
    my_bookings: "My Bookings",
    export_logs: "Export Logs",
    processing: "Processing...",
    no_providers: "No providers available for this service in your area.",
    try_again: "Please try again with a different location or service type.",
    booking_confirmed: "Booking Confirmed!",
    booking_id: "Booking ID",
    provider_en_route: "Provider is on the way",
    job_started: "Job Started",
    job_completed: "Job Completed",
    service_type: "Service Type",
    issue_severity: "Issue Severity",
    location: "Location",
    preferred_time: "Preferred Time",
    budget: "Budget Sensitivity",
    match_score: "Match Score",
    estimated_arrival: "Est. Arrival",
    on_time_score: "On-Time",
    reviews: "Reviews",
    visit_fee: "Visit Fee",
    distance_cost: "Distance Cost",
    complexity_adjustment: "Complexity",
    urgency_surcharge: "Urgency",
    time_premium: "Time Premium",
    loyalty_discount: "Loyalty Discount",
    surge_adjustment: "Demand Surge",
    platform_fee: "Platform Fee",
    total: "Total",
    budget_alternative: "Budget Alternative",
    saving: "Saving"
  },
  'ur-rom': {
    offline_message: "Tum offline ho. Kuch features limited ho sakte hain.",
    find_service: "Service Doondho",
    trending_services: "Trending Services",
    recent_bookings: "Recent Bookings",
    nav_home: "Home",
    nav_bookings: "Bookings",
    nav_providers: "Providers",
    nav_help: "Help",
    request_understanding: "Request Samajhna",
    clarification_needed: "Thoda sa clarification chahiye",
    submit_answer: "Jawab Do",
    proceed_to_matching: "Provider Matching Pe Jao",
    select_provider: "Provider Select Karo",
    schedule_appointment: "Appointment Schedule Karo",
    select_date: "Tareekh Select Karo",
    select_time: "Waqt Select Karo",
    scheduling_conflict: "Scheduling Conflict",
    alternative_slots: "Alternative Slots Available:",
    confirm_slot: "Slot Confirm Karo",
    price_quote: "Price Quote",
    fairness_summary: "Fairness Summary",
    confirm_and_book: "Confirm & Book Karo",
    cancel: "Cancel",
    booking_progress: "Booking Progress",
    view_receipt: "Receipt Dekho",
    rate_service: "Service Rate Karo",
    how_was_service: "Kaisa raha experience",
    tap_to_rate: "Rate karne ke liye tap karo",
    additional_feedback: "Extra Feedback (Optional)",
    submit_feedback: "Feedback Do",
    thank_you: "Shukriya!",
    new_provider_rating: "Naya Provider Rating",
    report_problem: "Problem Report Karo",
    what_issue: "Kya problem hai?",
    no_show: "Provider Nahi Aaya",
    price_dispute: "Price Ki Problem",
    poor_quality: "Kam Quality",
    provider_rude: "Provider Rude",
    wrong_service: "Galat Service",
    refund_request: "Refund Ki Request",
    describe_issue: "Problem Likho",
    submit_dispute: "Dispute Submit Karo",
    resolution: "Resolution",
    compensation: "Compensation",
    done: "Ho Gaya",
    my_bookings: "Mere Bookings",
    export_logs: "Logs Export Karo",
    processing: "Processing...",
    no_providers: "Is area mein koi provider available nahi hai.",
    try_again: "Doosra location ya service type try karo.",
    booking_confirmed: "Booking Confirm Ho Gayi!",
    booking_id: "Booking ID",
    provider_en_route: "Provider rasta mein hai",
    job_started: "Kaam Shuru",
    job_completed: "Kaam Khatam",
    service_type: "Service Type",
    issue_severity: "Problem Ki Grade",
    location: "Location",
    preferred_time: "Preferred Waqt",
    budget: "Budget Sensitivity",
    match_score: "Match Score",
    estimated_arrival: "Est. Arrival",
    on_time_score: "On-Time",
    reviews: "Reviews",
    visit_fee: "Visit Fee",
    distance_cost: "Distance Cost",
    complexity_adjustment: "Complexity",
    urgency_surcharge: "Urgency",
    time_premium: "Time Premium",
    loyalty_discount: "Loyalty Discount",
    surge_adjustment: "Demand Surge",
    platform_fee: "Platform Fee",
    total: "Total",
    budget_alternative: "Budget Alternative",
    saving: "Saving"
  },
  ur: {
    offline_message: "آپ آف لائن ہیں۔ کچھ فیچرز محدود ہو سکتے ہیں۔",
    find_service: "سروس تلاش کریں",
    trending_services: "ٹرینڈنگ سروسز",
    recent_bookings: "حالیہ بکنگز",
    nav_home: "ہوم",
    nav_bookings: "بکنگز",
    nav_providers: "فراہم کنندہ",
    nav_help: "مدد",
    request_understanding: "درخواست کی سمجھ",
    clarification_needed: "تھوڑی وضاحت درکار ہے",
    submit_answer: "جواب دیں",
    proceed_to_matching: "میچنگ پر جائیں",
    select_provider: "فراہم کنندہ منتخب کریں",
    schedule_appointment: "اپائنٹمنٹ شیڈول کریں",
    select_date: "تاریخ منتخب کریں",
    select_time: "وقت منتخب کریں",
    scheduling_conflict: "شیڈولنگ کا تنازعہ",
    alternative_slots: "متبادل سلاٹس دستیاب ہیں",
    confirm_slot: "سلاٹ کنفرم کریں",
    price_quote: "قیمت کا تخمینہ",
    fairness_summary: "انصاف کا خلاصہ",
    confirm_and_book: "کنفرم اور بک کریں",
    cancel: "منسوخ کریں",
    booking_progress: "بکنگ کی پیش رفت",
    view_receipt: "رسیپٹ دیکھیں",
    rate_service: "سروس کی درجہ بندی کریں",
    how_was_service: "آپ کا تجربہ کیسا رہا",
    tap_to_rate: "ریٹ کرنے کے لیے ٹیپ کریں",
    additional_feedback: "اضافی رائے (اختیاری)",
    submit_feedback: "رائے جمع کروائیں",
    thank_you: "شکریہ!",
    new_provider_rating: "نیا فراہم کنندہ ریٹنگ",
    report_problem: "مسئلہ رپورٹ کریں",
    what_issue: "کیا مسئلہ ہے؟",
    no_show: "فراہم کنندہ نہیں آیا",
    price_dispute: "قیمت کا مسئلہ",
    poor_quality: "کم معیار",
    provider_rude: "فراہم کنندہ بدتمیز",
    wrong_service: "غلط سروس",
    refund_request: "رقم واپسی کی درخواست",
    describe_issue: "مسئلہ بیان کریں",
    submit_dispute: "مناقشہ جمع کروائیں",
    resolution: "حل",
    compensation: "معاوضہ",
    done: "ہو گیا",
    my_bookings: "میری بکنگز",
    export_logs: "لاگز برآمد کریں",
    processing: "پروسیسنگ...",
    no_providers: "اس علاقے میں کوئی فراہم کنندہ دستیاب نہیں ہے۔",
    try_again: "دوسرا مقام یا سروس کی قسم آزمائیں۔",
    booking_confirmed: "بکنگ کی تصدیق ہو گئی!",
    booking_id: "بکنگ آئی ڈی",
    provider_en_route: "فراہم کنندہ راستے میں ہے",
    job_started: "کام شروع",
    job_completed: "کام مکمل",
    service_type: "سروس کی قسم",
    issue_severity: "مسئلے کی شدت",
    location: "مقام",
    preferred_time: "ترجیحی وقت",
    budget: " بجٹ کی حساسیت",
    match_score: "میچ سکور",
    estimated_arrival: "تخمینی آمد",
    on_time_score: "وقت پر",
    reviews: "رائے",
    visit_fee: "ویزٹ فیس",
    distance_cost: "فاصلہ لاگت",
    complexity_adjustment: "پیچیدگی",
    urgency_surcharge: "فوری",
    time_premium: "وقت کی اضافی قیمت",
    loyalty_discount: "لوئلٹی ڈسکاؤنٹ",
    surge_adjustment: "طلب میں اضافہ",
    platform_fee: "پلیٹ فارم فیس",
    total: "کل",
    budget_alternative: "بجٹ متبادل",
    saving: "بچت"
  }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Karigar.ai initializing...');
  
  // Load providers data
  await loadProviders();
  
  // Load existing bookings from localStorage
  loadBookings();
  
  // Initialize service worker
  initServiceWorker();
  
  // Initialize speech recognition
  initSpeechRecognition();
  
  // Setup event listeners
  setupEventListeners();
  
  // Render recent bookings
  renderRecentBookings();
  
  // Check online status
  updateOnlineStatus();
  
  console.log('Karigar.ai ready!');
});

// ===== LOAD PROVIDERS =====
async function loadProviders() {
  try {
    const response = await fetch('providers.json');
    if (response.ok) {
      const data = await response.json();
      state.providers = data.providers;
      console.log(`Loaded ${state.providers.length} providers`);
    } else {
      console.error('Failed to load providers');
    }
  } catch (error) {
    console.error('Error loading providers:', error);
    // Use cached data from localStorage as fallback
    const cached = localStorage.getItem('cachedProviders');
    if (cached) {
      state.providers = JSON.parse(cached).providers;
    }
  }
}

// ===== LOAD BOOKINGS =====
function loadBookings() {
  const stored = localStorage.getItem('karigarBookings');
  if (stored) {
    state.bookings = JSON.parse(stored);
  }
}

// ===== SAVE BOOKINGS =====
function saveBookings() {
  localStorage.setItem('karigarBookings', JSON.stringify(state.bookings));
}

// ===== SERVICE WORKER =====
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }
}

// ===== SPEECH RECOGNITION =====
function initSpeechRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    state.recognition = new SpeechRecognition();
    
    state.recognition.continuous = false;
    state.recognition.interimResults = false;
    
    state.recognition.onstart = () => {
      state.isRecording = true;
      document.getElementById('mic-btn').classList.add('recording');
    };
    
    state.recognition.onend = () => {
      state.isRecording = false;
      document.getElementById('mic-btn').classList.remove('recording');
    };
    
    state.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('search-input').value = transcript;
      console.log('Voice input:', transcript);
    };
    
    state.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      showToast('Voice input failed. Please type instead.', 'error');
      state.isRecording = false;
      document.getElementById('mic-btn').classList.remove('recording');
    };
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Mic button
  document.getElementById('mic-btn').addEventListener('click', toggleVoiceInput);
  
  // Search input
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleServiceRequest();
    }
  });
  
  // Submit request button
  document.getElementById('submit-request').addEventListener('click', handleServiceRequest);
  
  // Service chips
  document.querySelectorAll('.service-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const service = chip.dataset.service;
      document.getElementById('search-input').value = `I need a ${service} service`;
      document.querySelectorAll('.service-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });
  
  // Language toggle
  document.querySelectorAll('.header-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      setLanguage(lang);
    });
  });
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const screen = item.dataset.screen;
      if (screen) navigateTo(screen);
    });
  });
  
  // Back button
  document.getElementById('back-to-home').addEventListener('click', () => navigateTo('home'));
  
  // Proceed to matching
  document.getElementById('proceed-matching').addEventListener('click', handleProviderMatching);
  
  // Clarification submit
  document.getElementById('submit-clarification').addEventListener('click', handleClarification);
  
  // Confirm slot
  document.getElementById('confirm-slot').addEventListener('click', handleSlotConfirmation);
  
  // Confirm booking
  document.getElementById('confirm-booking').addEventListener('click', handleBookingConfirmation);
  document.getElementById('cancel-booking').addEventListener('click', () => navigateTo('home'));
  
  // Rating stars
  document.querySelectorAll('.rating-star').forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.dataset.rating);
      setRating(rating);
    });
  });
  
  // Submit feedback
  document.getElementById('submit-feedback').addEventListener('click', handleFeedbackSubmission);
  
  // Dispute types
  document.querySelectorAll('.dispute-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dispute-type-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      checkDisputeSubmit();
    });
  });
  
  // Dispute description
  document.getElementById('dispute-description').addEventListener('input', checkDisputeSubmit);
  
  // Submit dispute
  document.getElementById('submit-dispute').addEventListener('click', handleDisputeSubmission);
  
  // Resolution done
  document.getElementById('resolution-done').addEventListener('click', () => navigateTo('home'));
  
  // Trace panel
  document.getElementById('trace-fab').addEventListener('click', toggleTracePanel);
  document.getElementById('close-trace').addEventListener('click', toggleTracePanel);
  document.getElementById('export-trace').addEventListener('click', exportTraces);
  
  // Modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  // Online/offline status
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
}

// ===== VOICE INPUT =====
function toggleVoiceInput() {
  if (!state.recognition) {
    showToast('Voice input not supported in this browser', 'warning');
    return;
  }
  
  if (state.isRecording) {
    state.recognition.stop();
  } else {
    const langCode = state.language === 'ur' || state.language === 'ur-rom' ? 'ur-PK' : 'en-US';
    state.recognition.lang = langCode;
    state.recognition.start();
  }
}

// ===== LANGUAGE =====
function setLanguage(lang) {
  state.language = lang;
  
  // Update active button
  document.querySelectorAll('.header-lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  // Set RTL for Urdu
  document.body.dir = lang === 'ur' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  
  // Update placeholders
  const input = document.getElementById('search-input');
  if (input) {
    input.placeholder = input.dataset[`placeholder-${lang}`] || input.placeholder;
  }
  
  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  
  console.log(`Language set to: ${lang}`);
}

// ===== UPDATE ONLINE STATUS =====
function updateOnlineStatus() {
  const isOnline = navigator.onLine;
  document.body.classList.toggle('offline', !isOnline);
}

// ===== NAVIGATION =====
function navigateTo(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show target screen
  const targetScreen = document.getElementById(`screen-${screenId}`);
  if (targetScreen) {
    targetScreen.classList.add('active');
    state.currentScreen = screenId;
  }
  
  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.screen === screenId);
  });
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// ===== HANDLE SERVICE REQUEST =====
async function handleServiceRequest() {
  const input = document.getElementById('search-input').value.trim();
  
  if (!input) {
    showToast('Please describe your service need', 'warning');
    return;
  }
  
  // Show loading
  showLoading('Agent 1: Language Understanding');
  
  try {
    // Run Agent 1: Language Understanding
    state.parsedRequest = await agent1LanguageUnderstanding(input);
    
    // Log agent trace
    logAgentTrace(1, 'Language Understanding', {
      input: input,
      output: state.parsedRequest,
      confidence: state.parsedRequest.confidenceScore
    });
    
    hideLoading();
    
    // Check if clarification needed
    if (state.parsedRequest.clarificationNeeded) {
      showClarification(state.parsedRequest.clarificationQuestion);
    } else {
      // Show parsed summary
      showParsedSummary(state.parsedRequest);
      navigateTo('request');
    }
    
  } catch (error) {
    hideLoading();
    console.error('Agent 1 error:', error);
    showToast('Failed to understand request. Please try again.', 'error');
  }
}

// ===== HANDLE CLARIFICATION =====
async function handleClarification() {
  const answer = document.getElementById('clarification-input').value.trim();
  
  if (!answer) {
    showToast('Please provide an answer', 'warning');
    return;
  }
  
  // Append answer to original request
  state.serviceRequest = state.serviceRequest || document.getElementById('search-input').value;
  const updatedRequest = `${state.serviceRequest} ${answer}`;
  
  // Re-run Agent 1 with updated input
  document.getElementById('clarification-input').value = '';
  document.getElementById('clarification-section').style.display = 'none';
  
  showLoading('Agent 1: Language Understanding');
  
  try {
    state.parsedRequest = await agent1LanguageUnderstanding(updatedRequest);
    
    logAgentTrace(1, 'Language Understanding', {
      input: updatedRequest,
      output: state.parsedRequest,
      confidence: state.parsedRequest.confidenceScore
    });
    
    hideLoading();
    showParsedSummary(state.parsedRequest);
    
  } catch (error) {
    hideLoading();
    showToast('Failed to process clarification. Please try again.', 'error');
  }
}

// ===== SHOW CLARIFICATION =====
function showClarification(question) {
  document.getElementById('clarification-question').textContent = question;
  document.getElementById('clarification-section').style.display = 'block';
  document.getElementById('proceed-matching').style.display = 'none';
}

// ===== SHOW PARSED SUMMARY =====
function showParsedSummary(parsed) {
  const container = document.getElementById('parsed-summary');
  const confidenceBadge = document.getElementById('confidence-badge');
  const confidenceScore = document.getElementById('confidence-score');
  
  // Update confidence badge
  confidenceScore.textContent = `${parsed.confidenceScore}%`;
  confidenceBadge.className = `confidence-badge ${
    parsed.confidenceScore >= 80 ? 'confidence-high' :
    parsed.confidenceScore >= 60 ? 'confidence-medium' : 'confidence-low'
  }`;
  
  // Build summary HTML
  container.innerHTML = `
    <div class="parsed-header">
      <h3 class="parsed-title">Service Request Summary</h3>
    </div>
    
    <div class="parsed-item">
      <div class="parsed-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>
        </svg>
      </div>
      <div class="parsed-content">
        <p class="parsed-label">Service Type</p>
        <p class="parsed-value">${parsed.serviceType || 'Not specified'}</p>
      </div>
    </div>
    
    <div class="parsed-item">
      <div class="parsed-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div class="parsed-content">
        <p class="parsed-label">Location</p>
        <p class="parsed-value">${parsed.location || 'Not specified'}</p>
      </div>
    </div>
    
    <div class="parsed-item">
      <div class="parsed-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <div class="parsed-content">
        <p class="parsed-label">Preferred Time</p>
        <p class="parsed-value">${parsed.preferredTimeWindow || 'Flexible'}</p>
      </div>
    </div>
    
    <div class="parsed-item">
      <div class="parsed-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        </svg>
      </div>
      <div class="parsed-content">
        <p class="parsed-label">Issue Severity</p>
        <p class="parsed-value" style="text-transform: capitalize;">${parsed.severity || 'Medium'}</p>
      </div>
    </div>
    
    <div class="parsed-item">
      <div class="parsed-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </div>
      <div class="parsed-content">
        <p class="parsed-label">Budget Sensitivity</p>
        <p class="parsed-value" style="text-transform: capitalize;">${parsed.priceSensitivity || 'Medium'}</p>
      </div>
    </div>
    
    <div class="parsed-item">
      <div class="parsed-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </div>
      <div class="parsed-content">
        <p class="parsed-label">Detected Language</p>
        <p class="parsed-value">${parsed.detectedLanguage || 'Mixed'}</p>
      </div>
    </div>
  `;
  
  document.getElementById('proceed-matching').style.display = 'block';
  document.getElementById('clarification-section').style.display = 'none';
}

// ===== HANDLE PROVIDER MATCHING =====
async function handleProviderMatching() {
  showLoading('Agent 2: Provider Matching');
  
  try {
    // Run Agent 2: Provider Matching
    state.rankedProviders = await agent2ProviderMatching(state.parsedRequest, state.providers);
    
    logAgentTrace(2, 'Provider Matching', {
      input: state.parsedRequest,
      output: state.rankedProviders,
      totalEvaluated: state.rankedProviders.totalProvidersEvaluated
    });
    
    hideLoading();
    
    if (state.rankedProviders.rankedProviders && state.rankedProviders.rankedProviders.length > 0) {
      renderProviderList(state.rankedProviders.rankedProviders);
      navigateTo('providers');
    } else {
      showToast(translations[state.language].no_providers, 'warning');
      showModal(
        translations[state.language].no_providers,
        `<p>${translations[state.language].try_again}</p>
         <button class="btn btn-primary btn-block" onclick="closeModal(); navigateTo('home');">
           ${translations[state.language].try_again}
         </button>`
      );
    }
    
  } catch (error) {
    hideLoading();
    console.error('Agent 2 error:', error);
    showToast('Failed to find providers. Please try again.', 'error');
  }
}

// ===== RENDER PROVIDER LIST =====
function renderProviderList(providers) {
  const container = document.getElementById('provider-list');
  
  container.innerHTML = providers.map((provider, index) => {
    const providerData = state.providers.find(p => p.id === provider.providerId) || {};
    const initials = providerData.name ? providerData.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '??';
    
    return `
      <div class="card" style="position: relative;">
        ${provider.riskFlag ? '<div class="card-badge risk" style="position: absolute; top: 16px; right: 16px;">⚠️ Risk Flag</div>' : ''}
        
        <div class="card-header">
          <div class="card-avatar">${initials}</div>
          <div class="card-info">
            <h4 class="card-title">${providerData.name || 'Provider'}</h4>
            <div class="card-subtitle">
              <span class="card-rating">
                <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${providerData.rating || 'N/A'}
              </span>
              <span>• ${providerData.totalReviews || 0} reviews</span>
            </div>
          </div>
          <div class="card-badge match-score">${provider.matchScore}%</div>
        </div>
        
        <div class="card-body">
          <p style="color: var(--color-text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-md);">
            ${provider.rankingRationale}
          </p>
          
          <div class="card-stats">
            <div class="card-stat">
              <div class="card-stat-value">${providerData.onTimeScore || 'N/A'}%</div>
              <div class="card-stat-label">On-Time</div>
            </div>
            <div class="card-stat">
              <div class="card-stat-value">${providerData.yearsExperience || '?'}</div>
              <div class="card-stat-label">Years Exp</div>
            </div>
            <div class="card-stat">
              <div class="card-stat-value">${providerData.cancellationRate || '?'}%</div>
              <div class="card-stat-label">Cancel Rate</div>
            </div>
          </div>
          
          ${providerData.certifications && providerData.certifications.length > 0 ? `
            <div style="margin-top: var(--space-md); display: flex; gap: var(--space-xs); flex-wrap: wrap;">
              ${providerData.certifications.slice(0, 2).map(cert => `
                <span class="card-badge verified">✓ ${cert}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>
        
        <div class="card-footer">
          <div>
            <div class="card-price">PKR ${providerData.visitFee || '?'}</div>
            <div class="card-arrival">${provider.estimatedArrival || 'Est. soon'}</div>
          </div>
          <button class="btn btn-primary" onclick="selectProvider('${provider.providerId}')">
            Select
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ===== SELECT PROVIDER =====
function selectProvider(providerId) {
  state.selectedProvider = state.providers.find(p => p.id === providerId);
  
  if (!state.selectedProvider) {
    showToast('Provider not found', 'error');
    return;
  }
  
  // Show provider info and scheduling
  const providerInfo = document.getElementById('selected-provider-info');
  providerInfo.innerHTML = `
    <div class="card-header">
      <div class="card-avatar">${state.selectedProvider.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
      <div class="card-info">
        <h4 class="card-title">${state.selectedProvider.name}</h4>
        <div class="card-subtitle">
          <span class="card-rating">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${state.selectedProvider.rating}
          </span>
          <span>• ${state.selectedProvider.totalReviews} reviews</span>
        </div>
      </div>
    </div>
    <p style="color: var(--color-text-secondary); font-size: var(--text-sm);">
      <strong>Service:</strong> ${state.selectedProvider.skill}<br>
      <strong>Experience:</strong> ${state.selectedProvider.yearsExperience} years<br>
      <strong>Specializations:</strong> ${state.selectedProvider.specializations.join(', ')}
    </p>
  `;
  
  // Generate calendar and time slots
  generateCalendar();
  generateTimeSlots();
  
  navigateTo('scheduling');
}

// ===== GENERATE CALENDAR =====
function generateCalendar() {
  const container = document.getElementById('calendar-grid');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  let html = days.map(day => `<div class="calendar-day-header">${day}</div>`).join('');
  
  // Get first day of month and total days
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day" style="visibility: hidden;"></div>';
  }
  
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const isToday = day === today.getDate();
    const isPast = date < today;
    
    html += `
      <button class="calendar-day ${isToday ? 'today' : ''}" 
              ${isPast ? 'disabled' : ''} 
              onclick="selectDate(${day})"
              data-day="${day}">
        ${day}
      </button>
    `;
  }
  
  container.innerHTML = html;
}

// ===== SELECT DATE =====
function selectDate(day) {
  // Update calendar UI
  document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
  document.querySelector(`[data-day="${day}"]`).classList.add('selected');
  
  // Store selected date
  const today = new Date();
  state.selectedDate = new Date(today.getFullYear(), today.getMonth(), day);
  
  // Regenerate time slots for selected date
  generateTimeSlots();
}

// ===== GENERATE TIME SLOTS =====
function generateTimeSlots() {
  const container = document.getElementById('time-slots');
  const bookedSlots = state.selectedProvider?.bookedSlots || [];
  
  // Filter booked slots for selected date
  const dateStr = state.selectedDate ? state.selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const dayBooked = bookedSlots.filter(slot => slot.startsWith(dateStr));
  
  const slots = [];
  for (let hour = CONFIG.WORKING_HOURS_START; hour <= CONFIG.WORKING_HOURS_END; hour++) {
    for (let minute = 0; minute < 60; minute += 60) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotDate = state.selectedDate ? 
        `${state.selectedDate.toISOString().split('T')[0]} ${time}` : 
        `${new Date().toISOString().split('T')[0]} ${time}`;
      
      const isBooked = dayBooked.includes(slotDate);
      
      slots.push({
        time: time,
        display: `${hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`,
        available: !isBooked
      });
    }
  }
  
  container.innerHTML = slots.map(slot => `
    <button class="time-slot ${slot.available ? '' : 'unavailable'}" 
            ${slot.available ? `onclick="selectTimeSlot('${slot.time}')"` : 'disabled'}
            data-time="${slot.time}">
      ${slot.display}
    </button>
  `).join('');
}

// ===== SELECT TIME SLOT =====
function selectTimeSlot(time) {
  state.selectedSlot = {
    date: state.selectedDate,
    time: time
  };
  
  // Update UI
  document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
  document.querySelector(`[data-time="${time}"]`).classList.add('selected');
  
  // Enable confirm button
  document.getElementById('confirm-slot').disabled = false;
}

// ===== HANDLE SLOT CONFIRMATION =====
async function handleSlotConfirmation() {
  showLoading('Agent 3: Scheduling Intelligence');
  
  try {
    // Run Agent 3: Scheduling Intelligence
    const schedulingResult = await agent3Scheduling(
      state.selectedProvider,
      state.selectedSlot,
      state.parsedRequest
    );
    
    logAgentTrace(3, 'Scheduling Intelligence', {
      input: { provider: state.selectedProvider.id, slot: state.selectedSlot },
      output: schedulingResult
    });
    
    hideLoading();
    
    if (schedulingResult.status === 'conflict') {
      // Show conflict message
      document.getElementById('conflict-reason').textContent = schedulingResult.conflictReason;
      document.getElementById('conflict-message').style.display = 'block';
      
      // Show alternative slots
      const alternatives = document.getElementById('alternative-slots');
      alternatives.innerHTML = schedulingResult.alternativeSlots.map(slot => `
        <button class="time-slot" onclick="selectAlternativeSlot('${slot}')">
          ${slot}
        </button>
      `).join('');
      
    } else {
      // Proceed to pricing
      handlePricing();
    }
    
  } catch (error) {
    hideLoading();
    console.error('Agent 3 error:', error);
    showToast('Failed to confirm slot. Please try again.', 'error');
  }
}

// ===== SELECT ALTERNATIVE SLOT =====
function selectAlternativeSlot(slotTime) {
  // Parse the slot time (format: "HH:MM on Day, Month Date")
  const timeMatch = slotTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    if (timeMatch[3]?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (timeMatch[3]?.toUpperCase() === 'AM' && hour === 12) hour = 0;
    
    state.selectedSlot = {
      date: state.selectedDate,
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    };
    
    document.getElementById('conflict-message').style.display = 'none';
    handlePricing();
  }
}

// ===== HANDLE PRICING =====
async function handlePricing() {
  showLoading('Agent 4: Dynamic Pricing');
  
  try {
    // Run Agent 4: Dynamic Pricing
    state.pricing = await agent4DynamicPricing(
      state.selectedProvider,
      state.parsedRequest,
      state.selectedSlot
    );
    
    logAgentTrace(4, 'Dynamic Pricing', {
      input: { provider: state.selectedProvider.id, request: state.parsedRequest },
      output: state.pricing
    });
    
    hideLoading();
    
    // Render pricing breakdown
    renderPricingBreakdown(state.pricing);
    navigateTo('pricing');
    
  } catch (error) {
    hideLoading();
    console.error('Agent 4 error:', error);
    showToast('Failed to calculate price. Please try again.', 'error');
  }
}

// ===== RENDER PRICING BREAKDOWN =====
function renderPricingBreakdown(pricing) {
  const container = document.getElementById('pricing-breakdown');
  const t = translations[state.language];
  
  const breakdownItems = pricing.breakdown.map(item => `
    <div class="pricing-item">
      <span class="pricing-item-label">${item.label}</span>
      <span class="pricing-item-value">PKR ${item.amountPKR.toLocaleString()}</span>
    </div>
  `).join('');
  
  const budgetAlternative = pricing.budgetAlternative ? `
    <div class="pricing-alternative" style="margin-top: var(--space-lg);">
      <h5 class="pricing-alternative-title">💡 ${t.budget_alternative}</h5>
      <p class="pricing-alternative-desc">${pricing.budgetAlternative.description}</p>
      <p class="pricing-savings">Save PKR ${pricing.budgetAlternative.savingPKR.toLocaleString()}</p>
    </div>
  ` : '';
  
  container.innerHTML = `
    <div class="pricing-header">
      <div class="pricing-total">PKR ${pricing.totalEstimatedPKR.toLocaleString()}</div>
      <div class="pricing-label">${t.total}</div>
    </div>
    
    <div class="pricing-breakdown">
      ${breakdownItems}
      
      <div class="pricing-total-row">
        <span>${t.total}</span>
        <span style="color: var(--color-accent-success);">PKR ${pricing.totalEstimatedPKR.toLocaleString()}</span>
      </div>
    </div>
    
    <div style="margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px dashed var(--color-border);">
      <p style="font-size: var(--text-xs); color: var(--color-text-muted);">
        ${t.platform_fee}: PKR ${pricing.platformFeePKR.toLocaleString()} (includes provider earning: PKR ${pricing.providerEarningPKR.toLocaleString()})
      </p>
      ${pricing.surgeApplied ? `<p style="color: var(--color-accent-warning); font-size: var(--text-xs); margin-top: var(--space-xs);">⚡ ${pricing.surgeReason}</p>` : ''}
    </div>
    
    ${budgetAlternative}
  `;
  
  // Update fairness summary
  document.getElementById('fairness-user').textContent = pricing.fairnessSummaryUser;
  document.getElementById('fairness-provider').textContent = pricing.fairnessSummaryProvider;
}

// ===== HANDLE BOOKING CONFIRMATION =====
async function handleBookingConfirmation() {
  showLoading('Agent 5: Booking Simulation');
  
  try {
    // Run Agent 5: Booking Simulation
    state.booking = await agent5BookingSimulation(
      state.selectedProvider,
      state.selectedSlot,
      state.pricing,
      state.parsedRequest
    );
    
    logAgentTrace(5, 'Booking Simulation', {
      input: { provider: state.selectedProvider.id, slot: state.selectedSlot, pricing: state.pricing },
      output: state.booking,
      steps: state.booking.simulationSteps
    });
    
    hideLoading();
    
    // Save booking to state
    state.bookings.push(state.booking);
    saveBookings();
    
    // Render booking progress
    renderBookingProgress(state.booking);
    navigateTo('tracker');
    
    // Simulate the booking lifecycle
    simulateBookingLifecycle(state.booking);
    
  } catch (error) {
    hideLoading();
    console.error('Agent 5 error:', error);
    showToast('Failed to confirm booking. Please try again.', 'error');
  }
}

// ===== RENDER BOOKING PROGRESS =====
function renderBookingProgress(booking) {
  const details = document.getElementById('booking-details');
  details.innerHTML = `
    <div class="card-header">
      <div class="card-avatar">${state.selectedProvider.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
      <div class="card-info">
        <h4 class="card-title">${state.selectedProvider.name}</h4>
        <div class="card-subtitle">${state.selectedProvider.skill}</div>
      </div>
    </div>
    <div style="margin-top: var(--space-md); display: flex; justify-content: space-between;">
      <div>
        <p style="font-size: var(--text-xs); color: var(--color-text-muted);">Date & Time</p>
        <p style="font-weight: 600;">${booking.slot.date} at ${booking.slot.time}</p>
      </div>
      <div style="text-align: right;">
        <p style="font-size: var(--text-xs); color: var(--color-text-muted);">Booking ID</p>
        <p style="font-weight: 600;">${booking.bookingId}</p>
      </div>
    </div>
  `;
  
  const timeline = document.getElementById('booking-timeline');
  const steps = [
    { id: 'created', title: 'Booking Created', icon: '✓' },
    { id: 'notified', title: 'Provider Notified', icon: '📱' },
    { id: 'accepted', title: 'Provider Accepted', icon: '✓' },
    { id: 'calendar', title: 'Calendar Updated', icon: '📅' },
    { id: 'confirmed', title: 'Confirmation Sent', icon: '✉️' },
    { id: 'reminder', title: 'Reminder Scheduled', icon: '⏰' },
    { id: 'enroute', title: 'Provider En Route', icon: '🚗' },
    { id: 'arrived', title: 'Provider Arrived', icon: '✓' },
    { id: 'started', title: 'Job Started', icon: '🔧' },
    { id: 'completed', title: 'Job Completed', icon: '✅' },
    { id: 'invoice', title: 'Invoice Generated', icon: '📄' },
    { id: 'feedback', title: 'Feedback Requested', icon: '⭐' }
  ];
  
  timeline.innerHTML = steps.map((step, index) => `
    <div class="timeline-item" id="step-${step.id}" data-step="${step.id}">
      <div class="timeline-dot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div class="timeline-content">
        <h5 class="timeline-title">${step.title}</h5>
        <p class="timeline-time">Step ${index + 1} of ${steps.length}</p>
      </div>
    </div>
  `).join('');
}

// ===== SIMULATE BOOKING LIFECYCLE =====
async function simulateBookingLifecycle(booking) {
  const steps = [
    'created', 'notified', 'accepted', 'calendar', 'confirmed', 
    'reminder', 'enroute', 'arrived', 'started', 'completed', 'invoice', 'feedback'
  ];
  
  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const stepEl = document.getElementById(`step-${steps[i]}`);
    if (stepEl) {
      stepEl.classList.add('completed');
      stepEl.classList.remove('pending');
      
      // Add notification bubbles for some steps
      if (steps[i] === 'notified') {
        showNotificationBubble('Provider notified via WhatsApp', 'Usman AC Services will arrive as scheduled');
      } else if (steps[i] === 'confirmed') {
        showNotificationBubble('SMS sent to your phone', 'Booking confirmed for tomorrow at 10:00 AM');
      } else if (steps[i] === 'enroute') {
        showMapPlaceholder();
      } else if (steps[i] === 'completed') {
        showNotificationBubble('Job completed successfully!', 'Please rate your experience');
        document.getElementById('view-receipt').style.display = 'block';
      }
    }
  }
  
  // Navigate to feedback after 2 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));
  navigateTo('feedback');
}

// ===== SHOW NOTIFICATION BUBBLE =====
function showNotificationBubble(title, message) {
  const container = document.getElementById('notification-bubbles');
  const bubble = document.createElement('div');
  bubble.className = 'notification-bubble';
  bubble.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <div class="notification-content">
      <p class="notification-title">${title}</p>
      <p class="notification-message">${message}</p>
    </div>
  `;
  container.appendChild(bubble);
}

// ===== SHOW MAP PLACEHOLDER =====
function showMapPlaceholder() {
  const container = document.getElementById('notification-bubbles');
  const map = document.createElement('div');
  map.className = 'map-placeholder';
  map.innerHTML = `
    <div class="map-route"></div>
    <div class="map-marker">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    </div>
    <p style="font-size: var(--text-sm); color: var(--color-text-secondary);">
      Provider is on the way • ETA 15 mins
    </p>
  `;
  container.appendChild(map);
}

// ===== SET RATING =====
function setRating(rating) {
  const stars = document.querySelectorAll('.rating-star');
  
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('filled');
      star.style.fill = 'currentColor';
    } else {
      star.classList.remove('filled');
      star.style.fill = 'none';
    }
  });
  
  const labels = [
    'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'
  ];
  
  document.getElementById('rating-label').textContent = labels[rating - 1];
  document.getElementById('submit-feedback').disabled = false;
  state.feedback = { rating: rating };
}

// ===== HANDLE FEEDBACK SUBMISSION =====
async function handleFeedbackSubmission() {
  if (!state.feedback || !state.feedback.rating) {
    showToast('Please select a rating', 'warning');
    return;
  }
  
  showLoading('Agent 6: Service Quality Loop');
  
  try {
    const comment = document.getElementById('feedback-comment').value.trim();
    state.feedback.comment = comment;
    
    // Run Agent 6: Service Quality Loop
    const qualityResult = await agent6ServiceQuality(
      state.selectedProvider,
      state.booking,
      state.feedback.rating,
      state.feedback.comment
    );
    
    logAgentTrace(6, 'Service Quality Loop', {
      input: { provider: state.selectedProvider.id, rating: state.feedback.rating, comment: state.feedback.comment },
      output: qualityResult
    });
    
    hideLoading();
    
    // Show thank you message
    document.getElementById('feedback-provider-name').textContent = state.selectedProvider.name;
    document.getElementById('thank-you-message').textContent = qualityResult.thankYouMessageEnglish;
    document.getElementById('new-rating-display').textContent = `${qualityResult.updatedRating.toFixed(1)} ⭐`;
    
    document.querySelector('.card').style.display = 'none';
    document.getElementById('feedback-result').style.display = 'block';
    
    // Update provider rating in local state
    const providerIndex = state.providers.findIndex(p => p.id === state.selectedProvider.id);
    if (providerIndex >= 0) {
      state.providers[providerIndex].rating = qualityResult.updatedRating;
    }
    
  } catch (error) {
    hideLoading();
    console.error('Agent 6 error:', error);
    showToast('Failed to submit feedback. Please try again.', 'error');
  }
}

// ===== CHECK DISPUTE SUBMIT =====
function checkDisputeSubmit() {
  const selectedType = document.querySelector('.dispute-type-btn.selected');
  const description = document.getElementById('dispute-description').value.trim();
  
  document.getElementById('submit-dispute').disabled = !(selectedType && description);
}

// ===== HANDLE DISPUTE SUBMISSION =====
async function handleDisputeSubmission() {
  const selectedType = document.querySelector('.dispute-type-btn.selected');
  const description = document.getElementById('dispute-description').value.trim();
  
  if (!selectedType || !description) {
    showToast('Please select a dispute type and provide description', 'warning');
    return;
  }
  
  showLoading('Agent 7: Dispute Resolution');
  
  try {
    // Run Agent 7: Dispute Resolution
    const disputeResult = await agent7DisputeResolution(
      selectedType.dataset.type,
      description,
      state.selectedProvider,
      state.booking,
      state.pricing
    );
    
    logAgentTrace(7, 'Dispute Resolution', {
      input: { type: selectedType.dataset.type, description: description },
      output: disputeResult
    });
    
    hideLoading();
    
    // Show resolution
    document.getElementById('resolution-title').textContent = disputeResult.recommendedAction.toUpperCase();
    document.getElementById('resolution-message').textContent = disputeResult.messageToUser;
    
    if (disputeResult.compensationPKR > 0) {
      document.getElementById('resolution-compensation').style.display = 'block';
      document.getElementById('compensation-amount').textContent = `PKR ${disputeResult.compensationPKR.toLocaleString()}`;
    } else {
      document.getElementById('resolution-compensation').style.display = 'none';
    }
    
    document.querySelector('.card').style.display = 'none';
    document.getElementById('dispute-resolution').style.display = 'block';
    
    // Update booking status
    if (state.booking) {
      state.booking.status = 'disputed';
      saveBookings();
    }
    
  } catch (error) {
    hideLoading();
    console.error('Agent 7 error:', error);
    showToast('Failed to submit dispute. Please try again.', 'error');
  }
}

// ===== RENDER RECENT BOOKINGS =====
function renderRecentBookings() {
  const container = document.getElementById('recent-bookings-list');
  
  if (state.bookings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <h4 class="empty-state-title">No bookings yet</h4>
        <p class="empty-state-message">Your recent bookings will appear here</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = state.bookings.slice(0, 5).map(booking => {
    const provider = state.providers.find(p => p.id === booking.providerId) || {};
    const initials = provider.name ? provider.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '??';
    
    return `
      <div class="booking-card" onclick="viewBooking('${booking.bookingId}')">
        <div class="booking-icon">${initials}</div>
        <div class="booking-info">
          <p class="booking-service">${provider.skill || 'Service'}</p>
          <p class="booking-provider">${provider.name || 'Provider'}</p>
        </div>
        <div>
          <p class="booking-date">${booking.slot?.date || 'Date'}</p>
          <span class="booking-status ${booking.status}">${booking.status}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ===== VIEW BOOKING =====
function viewBooking(bookingId) {
  const booking = state.bookings.find(b => b.bookingId === bookingId);
  if (!booking) return;
  
  state.selectedProvider = state.providers.find(p => p.id === booking.providerId);
  state.booking = booking;
  
  if (booking.status === 'completed') {
    navigateTo('feedback');
  } else if (booking.status === 'disputed') {
    navigateTo('dispute');
  } else {
    renderBookingProgress(booking);
    navigateTo('tracker');
  }
}

// ===== TOGGLE TRACE PANEL =====
function toggleTracePanel() {
  const panel = document.getElementById('trace-panel');
  panel.classList.toggle('open');
}

// ===== LOG AGENT TRACE =====
function logAgentTrace(agentId, agentName, data) {
  const trace = {
    agentId: `agent_${agentId}`,
    agentName: agentName,
    timestamp: new Date().toISOString(),
    inputSummary: typeof data.input === 'string' ? data.input : JSON.stringify(data.input).substring(0, 100),
    decision: data.output ? (data.output.decision || data.output.status || 'Completed') : 'N/A',
    rationale: data.output?.rankingRationale || data.output?.message || '',
    outputSummary: JSON.stringify(data.output || {}).substring(0, 200),
    confidenceScore: data.confidence || data.output?.confidenceScore || null,
    fallbackTriggered: false,
    processingTimeMs: Math.floor(Math.random() * 1000) + 500
  };
  
  state.agentTraces.push(trace);
  
  // Update trace count badge
  document.getElementById('trace-count').textContent = state.agentTraces.length;
  
  // Render trace item
  renderTraceItem(trace);
  
  // Save to localStorage
  localStorage.setItem('karigarAgentTraces', JSON.stringify(state.agentTraces));
}

// ===== RENDER TRACE ITEM =====
function renderTraceItem(trace) {
  const container = document.getElementById('trace-list');
  const item = document.createElement('div');
  item.className = `trace-item agent-${trace.agentId.replace('agent_', '')}`;
  
  item.innerHTML = `
    <div class="trace-agent-name">${trace.agentName}</div>
    <div class="trace-time">${new Date(trace.timestamp).toLocaleTimeString()}</div>
    <div class="trace-decision">
      <strong>Decision:</strong> ${trace.decision}
      ${trace.rationale ? `<br><small>${trace.rationale}</small>` : ''}
    </div>
    ${trace.confidenceScore !== null ? `
      <div class="trace-confidence">
        <span class="confidence-badge ${trace.confidenceScore >= 80 ? 'confidence-high' : 'confidence-medium'}">
          ${trace.confidenceScore}% confidence
        </span>
      </div>
    ` : ''}
  `;
  
  container.insertBefore(item, container.firstChild);
}

// ===== EXPORT TRACES =====
function exportTraces() {
  const text = state.agentTraces.map(trace => `
=== ${trace.agentName} ===
Time: ${trace.timestamp}
Decision: ${trace.decision}
Rationale: ${trace.rationale}
Confidence: ${trace.confidenceScore}%
Processing: ${trace.processingTimeMs}ms
`).join('\n\n');
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `karigar-traces-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  
  showToast('Traces exported successfully', 'success');
}

// ===== SHOW LOADING =====
function showLoading(agentName) {
  document.getElementById('loading-agent-name').textContent = agentName;
  document.getElementById('loading-overlay').classList.add('active');
}

// ===== HIDE LOADING =====
function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('active');
}

// ===== SHOW TOAST =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== SHOW MODAL =====
function showModal(title, content) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = content;
  document.getElementById('modal-overlay').classList.add('open');
}

// ===== CLOSE MODAL =====
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// ======================== AGENT IMPLEMENTATIONS ========================

// ===== AGENT 1: LANGUAGE UNDERSTANDING =====
async function agent1LanguageUnderstanding(input) {
  // Use Gemini API or fallback to rule-based parsing
  if (CONFIG.GEMINI_API_KEY && navigator.onLine) {
    try {
      const prompt = `You are a multilingual service request parser for Pakistan.
Parse this user input: "${input}"
Handle Urdu, Roman Urdu, English, misspellings, slang, and code-switching.
Return ONLY valid JSON (no markdown, no explanation):
{
  "serviceType": "",
  "issueDescription": "",
  "severity": "low | medium | high",
  "location": "",
  "preferredDate": "",
  "preferredTimeWindow": "",
  "isoTimeFrom": "",
  "isoTimeTo": "",
  "priceSensitivity": "low | medium | high",
  "detectedLanguage": "",
  "confidenceScore": 0-100,
  "clarificationNeeded": true | false,
  "clarificationQuestion": ""
}`;

      const response = await callGemini(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Gemini API error, using fallback:', error);
    }
  }
  
  // Fallback: Rule-based parsing
  return parseInputRuleBased(input);
}

// ===== RULE-BASED INPUT PARSING =====
function parseInputRuleBased(input) {
  const inputLower = input.toLowerCase();
  
  // Detect language
  let detectedLanguage = 'english';
  if (/[\u0600-\u06FF]/.test(input)) {
    detectedLanguage = 'urdu';
  } else if (/[a-z]+/.test(input) && (input.match(/[kglsh]/gi) || input.match(/\b(kal|aaj|ac|ke liye|main|mein|chaiye|chahiye)\b/i))) {
    detectedLanguage = 'roman_urdu';
  }
  
  // Service type detection
  let serviceType = '';
  const servicePatterns = {
    'ac repair': /ac\s*(repair|service|fix|thik|kaam|karna|sync)/i,
    'ac service': /ac\s*(service|cleaning|maintenance)/i,
    'electrician': /electrician|electrical|wiring|switchboard|fan/i,
    'plumber': /plumber|pipe|leak|tap|bathroom|fitting/i,
    'home tutor': /tutor|tuition|teaching|padhna|padhana/i,
    'mechanic': /mechanic|car\s*repair|bike\s*repair|engine|garage/i
  };
  
  for (const [service, pattern] of Object.entries(servicePatterns)) {
    if (pattern.test(input)) {
      serviceType = service;
      break;
    }
  }
  
  // Location detection
  let location = '';
  const locationPatterns = [
    /(?:in|at|around)\s+([A-Z][\w-]*\s*(?:G-\d+|F-\d+|Sector\s*\w+|Area\s*\w+|[A-Z][a-z]+\s*(?:Area|Block|Phase))/i,
    /G-(\d+)/i,
    /F-(\d+)/i,
    /(?:Defence|Clifton|Gulshan|DHA|Cantt)/i
  ];
  
  for (const pattern of locationPatterns) {
    const match = input.match(pattern);
    if (match) {
      location = match[0];
      break;
    }
  }
  
  // Time detection
  let preferredTimeWindow = 'Flexible';
  let preferredDate = '';
  
  if (/kal\s*(subah|shaam| Morning|evening)?/i.test(input) || /tomorrow/i.test(input)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    preferredDate = tomorrow.toISOString().split('T')[0];
    preferredTimeWindow = /subah|morning/i.test(input) ? 'Morning (7AM-12PM)' : 
                          /shaam|evening/i.test(input) ? 'Evening (5PM-9PM)' : 'Anytime';
  } else if (/aaj|today/i.test(input)) {
    preferredDate = new Date().toISOString().split('T')[0];
    preferredTimeWindow = /subah|morning/i.test(input) ? 'Morning' : 
                          /shaam|evening/i.test(input) ? 'Evening' : 'Anytime';
  }
  
  // Severity detection
  let severity = 'medium';
  if (/bilkul\s*kaam\s*nahi|not\s*working|emergency|urgent|immediately/i.test(input)) {
    severity = 'high';
  } else if (/thoda\s*sai|minor|slight/i.test(input)) {
    severity = 'low';
  }
  
  // Price sensitivity
  let priceSensitivity = 'medium';
  if (/budget|zyada\s*nahi|affordable|cheap|kam\s*hai/i.test(input)) {
    priceSensitivity = 'high';
  } else if (/premium|best|top\s*quality|no\s*issue/i.test(input)) {
    priceSensitivity = 'low';
  }
  
  // Confidence calculation
  let confidence = 60;
  if (serviceType) confidence += 15;
  if (location) confidence += 10;
  if (preferredDate) confidence += 10;
  if (severity !== 'medium') confidence += 5;
  
  return {
    serviceType,
    issueDescription: input,
    severity,
    location,
    preferredDate,
    preferredTimeWindow,
    isoTimeFrom: '',
    isoTimeTo: '',
    priceSensitivity,
    detectedLanguage,
    confidenceScore: Math.min(confidence, 95),
    clarificationNeeded: !serviceType || !location,
    clarificationQuestion: !serviceType && !location ? 
      'Can you tell me what service you need and your area?' :
      !serviceType ? 'What type of service are you looking for?' :
      'Which area are you located in?'
  };
}

// ===== AGENT 2: PROVIDER MATCHING =====
async function agent2ProviderMatching(request, providers) {
  if (CONFIG.GEMINI_API_KEY && navigator.onLine) {
    try {
      const prompt = `You are a provider matching engine for Karigar.ai in Pakistan.
Service Request: ${JSON.stringify(request)}
Available Providers: ${JSON.stringify(providers)}

Step 1: Classify job complexity as basic, intermediate, or complex.
Step 2: Filter providers who can handle this service type and location.
Step 3: Score each provider using the weighted factors below.
Step 4: Rank and return top 3 with rationale.

Scoring Weights:
- Skill match to job complexity: 20%
- Overall rating: 20%
- On time score: 15%
- Review recency and sentiment: 10%
- Cancellation rate (inverted): 10%
- Distance and travel time: 10%
- Risk score (inverted): 5%
- Price competitiveness: 5%
- Capacity availability: 3%
- Certifications: 2%

Return ONLY valid JSON:
{
  "jobComplexity": "",
  "totalProvidersEvaluated": 0,
  "rankedProviders": [
    {
      "providerId": "",
      "matchScore": 0-100,
      "rankingRationale": "",
      "whyNotFirst": "",
      "estimatedArrival": "",
      "riskFlag": true | false,
      "riskReason": ""
    }
  ]
}`;

      const response = await callGemini(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Gemini API error, using fallback:', error);
    }
  }
  
  // Fallback: Rule-based matching
  return matchProvidersRuleBased(request, providers);
}

// ===== RULE-BASED PROVIDER MATCHING =====
function matchProvidersRuleBased(request, providers) {
  const serviceType = request.serviceType?.toLowerCase() || '';
  
  // Filter by service type
  let filtered = providers.filter(p => 
    p.skill.toLowerCase().includes(serviceType) ||
    p.specializations.some(s => s.toLowerCase().includes(serviceType))
  );
  
  // If no exact match, use fuzzy matching
  if (filtered.length === 0) {
    filtered = providers.filter(p => 
      p.skill.toLowerCase().includes(serviceType.split(' ')[0])
    );
  }
  
  // Classify job complexity
  let jobComplexity = 'basic';
  if (request.severity === 'high' || /complex|emergency|urgent/i.test(request.issueDescription)) {
    jobComplexity = 'complex';
  } else if (request.severity === 'medium') {
    jobComplexity = 'intermediate';
  }
  
  // Score and rank providers
  const scored = filtered.map(provider => {
    let score = 0;
    
    // Skill match (20%)
    if (provider.jobComplexityHandled.includes(jobComplexity)) {
      score += 20;
    } else if (provider.jobComplexityHandled.includes('basic') && jobComplexity === 'basic') {
      score += 15;
    }
    
    // Rating (20%)
    score += (provider.rating / 5) * 20;
    
    // On-time score (15%)
    score += (provider.onTimeScore / 100) * 15;
    
    // Review recency (10%)
    const recentDate = new Date(provider.recentReviewDate);
    const daysSince = (Date.now() - recentDate) / (1000 * 60 * 60 * 24);
    if (provider.recentReviewSentiment === 'positive') {
      score += daysSince < 7 ? 10 : daysSince < 30 ? 8 : 5;
    } else if (provider.recentReviewSentiment === 'neutral') {
      score += 5;
    } else {
      score += 2;
    }
    
    // Cancellation rate (10%)
    score += (100 - provider.cancellationRate * 5) / 10;
    
    // Distance (10%) - mock, assume 5-15km
    const distance = Math.random() * 10 + 5;
    if (distance < 5) score += 10;
    else if (distance < 10) score += 7;
    else if (distance < 20) score += 4;
    else score += 1;
    
    // Risk score (5%)
    if (provider.riskScore === 'low') score += 5;
    else if (provider.riskScore === 'medium') score += 3;
    else score += 1;
    
    // Price competitiveness (5%) - based on visit fee
    const avgFee = providers.reduce((sum, p) => sum + p.visitFee, 0) / providers.length;
    if (provider.visitFee < avgFee * 0.8) score += 5;
    else if (provider.visitFee < avgFee) score += 3;
    else score += 1;
    
    // Capacity (3%)
    if (provider.available && provider.currentDayBookings < provider.maxDailyCapacity) {
      score += 3;
    }
    
    // Certifications (2%)
    if (provider.certifications && provider.certifications.length > 0) {
      score += 2;
    }
    
    return {
      providerId: provider.id,
      matchScore: Math.round(score),
      rankingRationale: provider.rating >= 4.5 ? 
        `Highly rated (${provider.rating}/5) with ${provider.totalReviews} positive reviews` :
        `Reliable provider with ${provider.onTimeScore}% on-time delivery`,
      whyNotFirst: '',
      estimatedArrival: `${Math.floor(Math.random() * 30) + 15} minutes`,
      riskFlag: provider.riskScore !== 'low' || provider.disputeCount > 3,
      riskReason: provider.riskScore !== 'low' ? `Risk score: ${provider.riskScore}` : ''
    };
  });
  
  // Sort by score
  scored.sort((a, b) => b.matchScore - a.matchScore);
  
  return {
    jobComplexity,
    totalProvidersEvaluated: filtered.length,
    rankedProviders: scored.slice(0, 3)
  };
}

// ===== AGENT 3: SCHEDULING INTELLIGENCE =====
async function agent3Scheduling(provider, slot, request) {
  const bookedSlots = provider.bookedSlots || [];
  const slotTime = slot.time;
  
  // Parse booked slots
  const conflicts = bookedSlots.filter(booked => {
    const bookedTime = booked.split(' ')[1];
    const bookedHour = parseInt(bookedTime.split(':')[0]);
    const slotHour = parseInt(slotTime.split(':')[0]);
    
    // Check within 1 hour window
    return Math.abs(bookedHour - slotHour) < 1;
  });
  
  if (conflicts.length > 0) {
    // Find alternative slots
    const alternatives = [];
    for (let h = CONFIG.WORKING_HOURS_START; h <= CONFIG.WORKING_HOURS_END; h++) {
      const testSlot = `${h.toString().padStart(2, '0')}:00`;
      const hasConflict = bookedSlots.some(booked => {
        const bookedHour = parseInt(booked.split(' ')[1].split(':')[0]);
        return Math.abs(bookedHour - h) < 1;
      });
      
      if (!hasConflict && alternatives.length < 3) {
        const date = new Date(slot.date);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        alternatives.push(`${h > 12 ? h - 12 : h}:00 ${h >= 12 ? 'PM' : 'AM'} on ${days[date.getDay()]}, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
      }
    }
    
    return {
      status: 'conflict',
      conflictReason: `Provider already has a booking at ${conflicts[0].split(' ')[1]} on this date.`,
      alternativeSlots: alternatives,
      waitlistAvailable: true,
      waitlistPosition: 0,
      nextAvailableTime: alternatives[0] || ''
    };
  }
  
  return {
    status: 'confirmed',
    confirmedSlot: `${slot.date} at ${slot.time}`,
    conflictReason: '',
    alternativeSlots: [],
    waitlistAvailable: false,
    waitlistPosition: 0,
    nextAvailableTime: ''
  };
}

// ===== AGENT 4: DYNAMIC PRICING =====
async function agent4DynamicPricing(provider, request, slot) {
  // Base calculation
  let visitFee = provider.visitFee || 500;
  let hourlyRate = provider.hourlyRatePKR || 1200;
  let estimatedHours = 1;
  
  // Complexity multiplier
  let complexityMultiplier = 1.0;
  if (request.severity === 'high') {
    complexityMultiplier = 1.8;
    estimatedHours = 2;
  } else if (request.severity === 'medium') {
    complexityMultiplier = 1.4;
    estimatedHours = 1.5;
  }
  
  // Distance cost (mock)
  const distanceKM = Math.random() * 15 + 2;
  const distanceCost = Math.round(distanceKM * (provider.ratePerKM || 20));
  
  // Urgency surcharge
  let urgencySurcharge = 0;
  if (slot.date === new Date().toISOString().split('T')[0]) {
    urgencySurcharge = 300; // Same day
    const slotHour = parseInt(slot.time.split(':')[0]);
    const currentHour = new Date().getHours();
    if (slotHour - currentHour < 2) {
      urgencySurcharge = 600; // Within 2 hours
    }
  }
  
  // Time of day premium
  let timePremium = 0;
  const slotHour = parseInt(slot.time.split(':')[0]);
  if (slotHour >= 17 && slotHour <= 21) {
    timePremium = Math.round((visitFee + hourlyRate * estimatedHours) * 0.1);
  }
  
  // Calculate total
  let total = visitFee + (hourlyRate * estimatedHours * complexityMultiplier) + distanceCost + urgencySurcharge + timePremium;
  
  // Loyalty discount
  let loyaltyDiscount = 0;
  const userBookings = state.bookings.filter(b => b.userId === 'user_1');
  if (userBookings.length > 0) {
    loyaltyDiscount = Math.round(total * 0.05);
    total -= loyaltyDiscount;
  }
  
  // Demand surge (mock)
  let surgeApplied = false;
  let surgeReason = '';
  const surgeChance = Math.random();
  if (surgeChance > 0.7) {
    surgeApplied = true;
    const surgePercent = surgeChance > 0.9 ? 20 : 15;
    total = Math.round(total * (1 + surgePercent / 100));
    surgeReason = `High demand in your area: ${surgePercent}% surge applied`;
  }
  
  // Platform fee
  const platformFee = Math.round(total * (CONFIG.PLATFORM_FEE_PERCENT / 100));
  const providerEarning = total - platformFee;
  
  // Budget alternative
  let budgetAlternative = null;
  if (request.priceSensitivity === 'high' && (urgencySurcharge > 0 || timePremium > 0)) {
    budgetAlternative = {
      description: `Schedule for tomorrow morning instead of today to save on urgency charges`,
      savingPKR: urgencySurcharge + (timePremium > 0 ? timePremium : 0)
    };
  }
  
  return {
    totalEstimatedPKR: Math.round(total),
    breakdown: [
      { label: 'Visit Fee', amountPKR: visitFee },
      { label: `Service (${estimatedHours}h x ${complexityMultiplier}x)`, amountPKR: Math.round(hourlyRate * estimatedHours * complexityMultiplier) },
      { label: 'Distance Cost', amountPKR: distanceCost },
      ...(urgencySurcharge > 0 ? [{ label: 'Urgency Surcharge', amountPKR: urgencySurcharge }] : []),
      ...(timePremium > 0 ? [{ label: 'Evening Premium (5PM-9PM)', amountPKR: timePremium }] : []),
      ...(loyaltyDiscount > 0 ? [{ label: 'Loyalty Discount (5%)', amountPKR: -loyaltyDiscount }] : []),
      ...(surgeApplied ? [{ label: 'Demand Surge', amountPKR: Math.round(total * 0.15 / 1.15) }] : [])
    ],
    providerEarningPKR: providerEarning,
    platformFeePKR: platformFee,
    budgetAlternative,
    fairnessSummaryUser: 'This price is competitive for your area and service type. You get transparent breakdown with no hidden charges.',
    fairnessSummaryProvider: 'Provider receives fair compensation with platform fee covering operational costs.',
    surgeApplied,
    surgeReason
  };
}

// ===== AGENT 5: BOOKING SIMULATION =====
async function agent5BookingSimulation(provider, slot, pricing, request) {
  const bookingId = `KB${Date.now().toString(36).toUpperCase()}`;
  
  // Generate booking object
  const booking = {
    bookingId,
    providerId: provider.id,
    providerName: provider.name,
    serviceType: request.serviceType,
    slot: {
      date: slot.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      time: slot.time
    },
    pricing: {
      total: pricing.totalEstimatedPKR,
      breakdown: pricing.breakdown
    },
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    simulationSteps: [
      'Booking Created',
      'Provider Notified',
      'Provider Accepted',
      'Calendar Updated',
      'Confirmation Sent',
      'Reminder Scheduled',
      'Provider En Route',
      'Provider Arrived',
      'Job Started',
      'Job Completed',
      'Invoice Generated',
      'Feedback Requested'
    ]
  };
  
  // Update provider's booked slots
  const providerIndex = state.providers.findIndex(p => p.id === provider.id);
  if (providerIndex >= 0) {
    const slotString = `${slot.date?.toISOString().split('T')[0]} ${slot.time}`;
    state.providers[providerIndex].bookedSlots.push(slotString);
    state.providers[providerIndex].currentDayBookings++;
  }
  
  return booking;
}

// ===== AGENT 6: SERVICE QUALITY LOOP =====
async function agent6ServiceQuality(provider, booking, rating, comment) {
  // Calculate new rating
  const newRating = (provider.rating * 0.8) + (rating * 0.2);
  
  // Sentiment analysis
  let sentiment = 'neutral';
  if (comment) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'best', 'professional', 'on time', 'clean', 'recommended'];
    const negativeWords = ['bad', 'poor', 'worst', 'late', 'rude', 'lazy', 'expensive', 'disappointed', 'terrible'];
    
    const lowerComment = comment.toLowerCase();
    const positiveCount = positiveWords.filter(w => lowerComment.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerComment.includes(w)).length;
    
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
  }
  
  return {
    sentimentScore: sentiment === 'positive' ? 1 : sentiment === 'negative' ? -1 : 0,
    sentimentLabel: sentiment,
    updatedRating: newRating,
    matchingPriorityChange: rating >= 4 ? 'increase' : rating <= 2 ? 'decrease' : 'unchanged',
    changeReason: rating >= 4 ? 'Positive feedback and high rating improves provider visibility' :
                  rating <= 2 ? 'Negative feedback and low rating reduces provider visibility' :
                  'Neutral feedback maintains current provider ranking',
    flagForReview: rating <= 2 || (provider.disputeCount > 3),
    flagReason: rating <= 2 ? 'Low rating requires review' : '',
    thankYouMessageEnglish: rating >= 4 ? 
      'Thank you for your positive feedback! Your rating helps other users find great service providers.' :
      rating >= 3 ?
      'Thank you for your feedback. We will work to improve the service quality.' :
      'We apologize for your experience. Your feedback has been noted and we will take action to improve.',
    thankYouMessageUrdu: rating >= 4 ?
      'شکریہ! آپ کی رائے دوسروں کو بہتر سروس فراہم کنندہ تلاش کرنے میں مدد کرتی ہے۔' :
      rating >= 3 ?
      'آپ کی رائے کا شکریہ۔ ہم سروس کوالٹی بہتر بنانے کے لیے کام کریں گے۔' :
      'ہمیں آپ کے تجربے پر افسوس ہے۔ ہم بہتری کے لیے کارروائی کریں گے۔'
  };
}

// ===== AGENT 7: DISPUTE RESOLUTION =====
async function agent7DisputeResolution(disputeType, description, provider, booking, pricing) {
  // Determine likely fault
  let likelyFault = 'unclear';
  let recommendedAction = 'escalate';
  let compensationPKR = 0;
  
  switch (disputeType) {
    case 'no_show':
      likelyFault = 'provider';
      recommendedAction = 'rebook';
      compensationPKR = Math.round(pricing.totalEstimatedPKR * 0.2);
      break;
    case 'price_dispute':
      // Check if price was significantly different
      likelyFault = description.toLowerCase().includes('more than') || 
                    description.toLowerCase().includes('charged extra') ? 'provider' : 'unclear';
      recommendedAction = likelyFault === 'provider' ? 'partial_refund' : 'escalate';
      compensationPKR = likelyFault === 'provider' ? Math.round(pricing.totalEstimatedPKR * 0.15) : 0;
      break;
    case 'quality':
      likelyFault = 'provider';
      recommendedAction = 'partial_refund';
      compensationPKR = Math.round(pricing.totalEstimatedPKR * 0.25);
      break;
    case 'rude':
      likelyFault = 'provider';
      recommendedAction = 'warning';
      compensationPKR = 0;
      break;
    case 'wrong_service':
      likelyFault = 'provider';
      recommendedAction = 'partial_refund';
      compensationPKR = Math.round(pricing.totalEstimatedPKR * 0.3);
      break;
    case 'refund':
      likelyFault = description.toLowerCase().includes('never came') ? 'provider' : 'user';
      recommendedAction = likelyFault === 'provider' ? 'refund' : 'escalate';
      compensationPKR = likelyFault === 'provider' ? pricing.totalEstimatedPKR : 0;
      break;
  }
  
  // Check if escalation needed
  const escalateToHuman = compensationPKR > 5000 || provider.disputeCount >= 5;
  
  return {
    disputeSeverity: compensationPKR > 2000 ? 'high' : compensationPKR > 500 ? 'medium' : 'low',
    likelyFault,
    recommendedAction,
    compensationPKR,
    compensationReason: `Compensation for ${disputeType.replace('_', ' ')} based on investigation`,
    messageToUser: recommendedAction === 'refund' ? 
      'Your refund request has been approved. The amount will be credited within 3-5 business days.' :
      recommendedAction === 'partial_refund' ?
      `A partial refund of PKR ${compensationPKR.toLocaleString()} has been approved.` :
      recommendedAction === 'rebook' ?
      'We apologize for the inconvenience. A new provider has been assigned and your booking has been rescheduled at no extra cost.' :
      recommendedAction === 'warning' ?
      'The provider has been issued a warning about their behavior. We appreciate your patience.' :
      'Your dispute has been reviewed. Our team will contact you within 24 hours to resolve this issue.',
    messageToProvider: `A customer has reported an issue with booking ${booking.bookingId}. Please contact us if you have any concerns.`,
    escalateToHuman,
    escalationReason: escalateToHuman ? 'Refund amount exceeds threshold or multiple prior disputes' : '',
    providerPenaltyApplied: likelyFault === 'provider' && recommendedAction !== 'escalate',
    penaltyDetails: likelyFault === 'provider' ? 'Warning recorded in provider profile' : ''
  };
}

// ===== CALL GEMINI API =====
async function callGemini(prompt) {
  const url = `${CONFIG.GEMINI_API_URL}?key=${CONFIG.GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: CONFIG.TEMPERATURE,
        maxOutputTokens: CONFIG.MAX_TOKENS
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Extract text from response
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Remove markdown fences if present
  text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  
  return text;
}

// ===== UTILITY FUNCTIONS =====
// Make navigateTo available globally
window.navigateTo = navigateTo;
window.selectProvider = selectProvider;
window.closeModal = closeModal;
window.selectDate = selectDate;
window.selectTimeSlot = selectTimeSlot;
window.selectAlternativeSlot = selectAlternativeSlot;
window.viewBooking = viewBooking;

// Log initialization complete
console.log('Karigar.ai JavaScript loaded successfully');