// =====================================================
// CORE - ابزارها و کامپوننت‌های مشترک
// =====================================================

// ============ اعداد فارسی ============
const PERSIAN_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
function toFa(str) { return String(str).replace(/\d/g, d => PERSIAN_DIGITS[d]); }
function fromFa(str) { return String(str).replace(/[۰-۹]/g, d => PERSIAN_DIGITS.indexOf(d)); }

// ============ Lucide Icons ============
function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        try { window.lucide.createIcons(); } catch(e) {}
    }
}
// ============ صدا ============
let audioCtx = null;
function initAudio() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch(e) {}
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    saveState();
    const btn = document.getElementById('sound-btn');
    if (btn) {
        btn.innerHTML = state.soundEnabled
            ? '<i data-lucide="volume-2"></i>'
            : '<i data-lucide="volume-x"></i>';
        refreshIcons();
    }
    if (state.soundEnabled) playSound('click');
}

function playSound(type) {
    // ۱. لرزش گوشی (Haptic)
      if ('vibrate' in navigator) {
        try {
            if (type === 'correct') navigator.vibrate(30);
            else if (type === 'wrong') navigator.vibrate([50, 50, 50]);
            else if (type === 'win') navigator.vibrate([100, 50, 100, 50, 200]);
        } catch(e) {}
    }

    // ۲. پخش صدا
    if (!state.soundEnabled) return;
    try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode); gainNode.connect(audioCtx.destination);
        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start(); osc.stop(audioCtx.currentTime + 0.2);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start(); osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'click') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
            osc.start(); osc.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'win') {
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = 'triangle'; o.frequency.value = freq;
                o.connect(g); g.connect(audioCtx.destination);
                const st = audioCtx.currentTime + i * 0.1;
                g.gain.setValueAtTime(0, st);
                g.gain.linearRampToValueAtTime(0.3, st + 0.05);
                g.gain.exponentialRampToValueAtTime(0.01, st + 0.3);
                o.start(st); o.stop(st + 0.3);
            });
        }
    } catch(e) {}
}

function speak(text) {
    if (!state.soundEnabled) return;
    if (!('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'fa-IR';
        u.rate = 0.85; u.pitch = 1.1;
        const voices = window.speechSynthesis.getVoices();
        const faVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('fa'));
        if (faVoice) u.voice = faVoice;
        window.speechSynthesis.speak(u);
    } catch(e) {}
}
if ('speechSynthesis' in window) { speechSynthesis.onvoiceschanged = () => {}; }

// ============ Mascot ============
let mascotTimeout = null;
function showMascotMessage(text, duration = 3500) {
    const bubble = document.getElementById('mascot-bubble');
    if (!bubble) return;
    bubble.innerText = text;
    bubble.classList.add('visible');
    clearTimeout(mascotTimeout);
    mascotTimeout = setTimeout(() => bubble.classList.remove('visible'), duration);
}

function updateMascotVisibility() {
    const activeId = document.querySelector('.screen.active')?.id;
    const mascot = document.getElementById('mascot');
    if (!mascot) return;
    if (activeId === 'screen-menu' || activeId === 'screen-result') mascot.classList.add('active');
    else mascot.classList.remove('active');
}

// ============ Confetti ============
function showConfetti() {
    const colors = ['#e74c3c', '#3498db', '#f39c12', '#27ae60', '#9b59b6', '#e91e63', '#00cec9'];
    for (let i = 0; i < 60; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.animationDelay = Math.random() * 0.6 + 's';
        c.style.animationDuration = (2 + Math.random()) + 's';
        c.style.width = c.style.height = (6 + Math.random() * 10) + 'px';
        c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        c.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 4000);
    }
}

// ============ Modal ============
function showModal(title, text, buttons) {
    const titleEl = document.getElementById('modal-title');
    titleEl.innerHTML = title;
    titleEl.classList.remove('win-modal-title');
    document.getElementById('modal-text').innerHTML = text;
    const container = document.getElementById('modal-buttons');
    container.innerHTML = '';
    (buttons || []).forEach(cfg => {
        const b = document.createElement('button');
        b.className = 'modal-btn ' + (cfg.class || 'secondary');
        b.innerText = cfg.text;
        b.onclick = cfg.action;
        container.appendChild(b);
    });
    document.getElementById('custom-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('custom-modal').style.display = 'none';
    document.getElementById('modal-title').classList.remove('win-modal-title');
}

// ============ Timer Bars ============
let timerAnimations = {};

function startTimerBar(barId, durationMs) {
    if (timerAnimations[barId]) { try { timerAnimations[barId].cancel(); } catch(e) {} }
    const bar = document.getElementById(barId);
    if (!bar) return null;
    bar.style.width = '100%';
    bar.style.background = '#3498db';
    const anim = bar.animate([{ width: '100%' }, { width: '0%' }], { duration: durationMs, fill: 'forwards' });
    timerAnimations[barId] = anim;
    return anim;
}

function showStaticTimerBar(barId, color) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    if (timerAnimations[barId]) { try { timerAnimations[barId].cancel(); } catch(e) {} delete timerAnimations[barId]; }
    bar.style.width = '100%';
    bar.style.background = color || '#00b894';
}

function clearTimerBars() {
    Object.values(timerAnimations).forEach(a => { try { a.cancel(); } catch(e) {} });
    timerAnimations = {};
}

// ============ Game Timers Registry ============
const gameTimers = new Set();

function gameInterval(fn, ms) {
    const id = setInterval(fn, ms);
    gameTimers.add(id);
    return id;
}

function gameTimeout(fn, ms) {
    const id = setTimeout(fn, ms);
    gameTimers.add(id);
    return id;
}

function clearAllGameTimers() {
    gameTimers.forEach(id => { try { clearInterval(id); clearTimeout(id); } catch(e) {} });
    gameTimers.clear();
    clearTimerBars();
}

// ============ Pause ============
let isPaused = false;

function togglePause() {
    if (!gameInProgress) return;
    if (isPaused) resumeGame();
    else pauseGame();
}

function pauseGame() {
    if (!gameInProgress) return;
    isPaused = true;
    document.getElementById('pause-overlay').style.display = 'flex';
    Object.values(timerAnimations).forEach(a => { try { a.pause(); } catch(e) {} });
    if (GAME_PAUSE_HOOKS[currentGame]) {
        try { GAME_PAUSE_HOOKS[currentGame](); } catch(e) {}
    }
}

function resumeGame() {
    isPaused = false;
    document.getElementById('pause-overlay').style.display = 'none';
    Object.values(timerAnimations).forEach(a => { try { a.play(); } catch(e) {} });
    if (GAME_RESUME_HOOKS[currentGame]) {
        try { GAME_RESUME_HOOKS[currentGame](); } catch(e) {}
    }
}

// ============ SVG Helpers ============
function getShapeSVG(shape) {
    const size = 24;
    const { type, color, rotation, hasDot } = shape;
    const c = size / 2, r = size / 2 - 2;
    let content = '';
    if (type === 'circle') content = `<circle cx="${c}" cy="${c}" r="${r}" fill="${color}"/>`;
    else if (type === 'square') content = `<rect x="2" y="2" width="${size-4}" height="${size-4}" fill="${color}"/>`;
    else if (type === 'triangle') content = `<polygon points="${c},2 ${size-2},${size-2} 2,${size-2}" fill="${color}"/>`;
    if (hasDot) content += `<circle cx="${c}" cy="${c}" r="${size/6}" fill="white"/>`;
    const transform = rotation ? `transform="rotate(${rotation} ${c} ${c})"` : '';
    return `<svg viewBox="0 0 ${size} ${size}"><g ${transform}>${content}</g></svg>`;
}