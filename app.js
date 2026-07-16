// --- STATE VARIABLES ---
let currentTab = 'pomodoro';

// Timer State
const MODES = {
    pomodoro: { time: 25 * 60, label: 'Focus Session', color: '#6366F1' },
    shortBreak: { time: 5 * 60, label: 'Short Break', color: '#10B981' }
};
let currentMode = 'pomodoro';
let timeLeft = MODES[currentMode].time;
let timerInterval = null;
let isRunning = false;

// Gamification State
let userXP = 250;
let totalSessions = 0;
let totalMinutes = 0;

// --- NAVIGATION LOGIC ---
function switchTab(tabId) {
    document.getElementById('view-pomodoro').classList.add('hidden');
    document.getElementById('view-ai').classList.add('hidden');
    document.getElementById('view-progress').classList.add('hidden');
    
    const navs = ['pomodoro', 'ai', 'progress'];
    navs.forEach(nav => {
        const el = document.getElementById(`nav-${nav}`);
        el.classList.remove('bg-primary', 'text-white', 'shadow-modern-glow');
        el.classList.add('text-gray-400');
    });

    document.getElementById(`view-${tabId}`).classList.remove('hidden');
    const activeNav = document.getElementById(`nav-${tabId}`);
    activeNav.classList.remove('text-gray-400');
    activeNav.classList.add('bg-primary', 'text-white', 'shadow-modern-glow');

    const titles = { pomodoro: 'Focus Timer', ai: 'J.A.R.V.I.S (Tutor)', progress: 'Player Stats' };
    document.getElementById('page-title').innerText = titles[tabId];
    currentTab = tabId;
}

// --- TIMER LOGIC ---
const timerDisplay = document.getElementById('timer-display');
const timerRing = document.getElementById('timer-ring');
const startIcon = document.getElementById('start-icon');
const startText = document.getElementById('start-text');
const modeText = document.getElementById('timer-mode-text');

const CIRCUMFERENCE = 289; 

function updateTimerUI() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const totalTime = MODES[currentMode].time;
    const progress = timeLeft / totalTime;
    const dashoffset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
    timerRing.style.strokeDashoffset = dashoffset;
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        startIcon.classList.replace('fa-pause', 'fa-play');
        startText.innerText = 'RESUME';
    } else {
        const target = document.getElementById('target-input').value;
        if (currentMode === 'pomodoro' && target === '' && timeLeft === MODES.pomodoro.time) {
            showToast("Warning: Target materi belum diisi!");
        }
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerUI();
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                handleSessionComplete();
            }
        }, 1000);
        startIcon.classList.replace('fa-play', 'fa-pause');
        startText.innerText = 'PAUSE';
    }
    isRunning = !isRunning;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = MODES[currentMode].time;
    startIcon.classList.replace('fa-pause', 'fa-play');
    startText.innerText = 'START';
    updateTimerUI();
}

function setMode(mode) {
    currentMode = mode;
    
    const btnPomo = document.getElementById('mode-pomodoro');
    const btnBreak = document.getElementById('mode-shortBreak');
    
    if(mode === 'pomodoro') {
        btnPomo.className = "btn-arcade text-[9px] py-2 px-4 border-2 border-primary bg-primary text-white shadow-pixel-blue";
        btnBreak.className = "btn-arcade text-[9px] py-2 px-4 border-2 border-gray-600 text-gray-400 hover:text-white";
        timerRing.style.stroke = MODES.pomodoro.color;
        modeText.className = "text-xs text-primary mt-2 font-bold tracking-[0.2em] uppercase";
    } else {
        btnBreak.className = "btn-arcade text-[9px] py-2 px-4 border-2 border-arcade_green bg-arcade_green text-white shadow-[4px_4px_0px_#047857]";
        btnPomo.className = "btn-arcade text-[9px] py-2 px-4 border-2 border-gray-600 text-gray-400 hover:text-white";
        timerRing.style.stroke = MODES.shortBreak.color;
        modeText.className = "text-xs text-arcade_green mt-2 font-bold tracking-[0.2em] uppercase";
    }

    modeText.innerText = MODES[mode].label;
    resetTimer();
}

// --- GAMIFICATION LOGIC ---
function handleSessionComplete() {
    isRunning = false;
    startIcon.classList.replace('fa-pause', 'fa-play');
    startText.innerText = 'START';
    
    if (currentMode === 'pomodoro') {
        showToast("MISSION CLEARED! +50 XP 🚀");
        addXP(50);
        totalSessions++;
        totalMinutes += 25;
        updateStatsUI();
        setTimeout(() => { setMode('shortBreak'); }, 3000);
    } else {
        showToast("RECHARGE COMPLETE! READY?");
        setTimeout(() => { setMode('pomodoro'); }, 3000);
    }
}

function addXP(amount) {
    userXP += amount;
    let maxXP = 1000;
    let rank = "IRON III"; // Uppercase for arcade font
    
    if(userXP > 1000) { rank = "BRONZE I"; maxXP = 2000; }
    if(userXP > 2000) { rank = "SILVER I"; maxXP = 4000; }
    
    document.getElementById('current-xp').innerText = userXP;
    document.getElementById('rank-name').innerText = rank;
    document.getElementById('stat-rank').innerText = rank;
    
    let percentage = (userXP / maxXP) * 100;
    if(percentage > 100) percentage = 100;
    document.getElementById('xp-bar').style.width = percentage + '%';
}

function updateStatsUI() {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    document.getElementById('stat-hours').innerText = hours;
    document.getElementById('stat-mins').innerText = mins;
    document.getElementById('stat-sessions').innerText = totalSessions;
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<div class="flex items-center"><i class="fa-solid fa-bell text-arcade_green mr-3"></i><p>${message}</p></div>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- CHAT LOGIC (Gemini API Integration) ---
const chatInput = document.getElementById('chat-input');
const chatContainer = document.getElementById('chat-container');
const GEMINI_API_KEY = ""; // Key kamu yang work
let chatHistory = [];
const systemPrompt = "Kamu adalah J.A.R.V.I.S, asisten personal belajar untuk UTBK/SNBT. Kamu ahli dalam Pengetahuan Kuantitatif, Literasi Bahasa, dan Penalaran Umum. Jawab dengan gaya AI yang cerdas, analitis, suportif, dan ramah seperti mentor privat. Gunakan bahasa Indonesia yang luwes (kadang pakai 'aku' atau 'kamu'). Jelaskan penyelesaian rumus secara step-by-step. Gunakan format Markdown untuk menebalkan kata penting (bold) dan membuat daftar poin (list) agar rapi dibaca. Jaga jawabanmu ringkas dan tidak bertele-tele.";

function handleEnter(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    chatInput.value = '';
    chatInput.style.height = 'auto';

    const typingId = appendTypingIndicator();

    try {
        const aiReply = await fetchGeminiResponse(message);
        removeTypingIndicator(typingId);
        appendMessage(aiReply, 'ai');
    } catch (error) {
        removeTypingIndicator(typingId);
        appendMessage("Sistem mendeteksi gangguan jaringan. Mohon coba lagi dalam beberapa detik. *(Error: " + error.message + ")*", 'ai');
        console.error("Gemini API Error:", error);
    }
}

async function fetchGeminiResponse(userText) {
    chatHistory.push({ role: "user", parts: [{ text: userText }] });

    const payload = {
        contents: chatHistory,
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        }
    };

    // Menggunakan URL fetch yang persis sama dengan kodemu yang work sebelumnya
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error("HTTP Status " + response.status);
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];

    if (candidate && candidate.content?.parts?.[0]?.text) {
        const textResponse = candidate.content.parts[0].text;
        chatHistory.push({ role: "model", parts: [{ text: textResponse }] });
        return textResponse;
    } else {
        throw new Error("Format respons tidak valid dari API.");
    }
}

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex items-start fade-in ${sender === 'user' ? 'flex-row-reverse' : ''}`;
    
    // USER: Clean Modern Bubble
    const avatarUser = `<div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0 shadow-md ml-4"><i class="fa-solid fa-user text-gray-300"></i></div>`;
    const bubbleUser = `bg-primary text-white rounded-2xl rounded-tr-none px-5 py-4 max-w-[80%] shadow-lg font-sans text-sm leading-relaxed whitespace-pre-wrap`;
    
    // AI: Pixel/Arcade Bubble
    const avatarAI = `<div class="w-12 h-12 bg-arcade_blue border-2 border-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#fff] mr-4"><i class="fa-solid fa-robot text-white text-xl"></i></div>`;
    const bubbleAI = `pixel-bubble text-gray-200 p-5 max-w-[80%] markdown-body font-sans text-sm`; 

    const contentHTML = sender === 'ai' && typeof marked !== 'undefined'
        ? `<div class="font-arcade text-[9px] text-arcade_blue mb-3">SYSTEM: J.A.R.V.I.S</div>` + marked.parse(text)
        : text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    msgDiv.innerHTML = `
        ${sender === 'ai' ? avatarAI : avatarUser}
        <div class="${sender === 'ai' ? bubbleAI : bubbleUser} break-words">${contentHTML}</div>
    `;
    
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendTypingIndicator() {
    const id = 'typing-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = `flex items-start fade-in`;
    msgDiv.innerHTML = `
        <div class="w-12 h-12 bg-arcade_blue border-2 border-white flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#fff] mr-4">
            <i class="fa-solid fa-robot text-white text-xl"></i>
        </div>
        <div class="pixel-bubble p-5 flex space-x-2 items-center h-[60px]">
            <div class="w-2 h-2 bg-arcade_blue rounded-none animate-bounce"></div>
            <div class="w-2 h-2 bg-arcade_blue rounded-none animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-arcade_blue rounded-none animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
    `;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return id;
}

function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if(el) el.remove();
}

chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if(this.value === '') this.style.height = 'auto';
});

updateTimerUI();