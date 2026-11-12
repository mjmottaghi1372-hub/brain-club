// =====================================================
// GAME: SYMBOLDIFF
// =====================================================

const SYMBOLS_POOL = [
    '<svg viewBox="0 0 24 24" fill="#2d3436"><path d="M12 2L15 9H22L16 14L18 21L12 17L6 21L8 14L2 9H9L12 2Z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
    '<svg viewBox="0 0 24 24" fill="#2d3436"><rect x="4" y="4" width="16" height="16"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M2 12h20M12 2l10 10-10 10"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><polygon points="12 2 22 22 2 22"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>',
    '<svg viewBox="0 0 24 24" fill="#2d3436"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M12 2l3 9h9l-7 5 3 9-8-6-8 6 3-9-7-5h9z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M12 4v16M4 12h16M6 6l12 12M6 18L18 6"/></svg>',
    '<svg viewBox="0 0 24 24" fill="#2d3436"><polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M4 12a8 8 0 1 0 16 0 8 8 0 1 0 -16 0"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M4 4h16v16H4z M9 9h6v6H9z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
    '<svg viewBox="0 0 24 24" fill="#2d3436"><path d="M2 12l10-10 10 10-10 10z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M12 2l4 4-4 4-4-4zM12 22l4-4-4-4-4 4zM2 12l4-4 4 4-4 4zM22 12l-4-4-4 4 4 4z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M8 2h8v6H8zM8 16h8v6H8zM2 8h6v8H2zM16 8h6v8h-6z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="#2d3436"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>',
    '<svg viewBox="0 0 24 24" fill="#2d3436"><path d="M12 2A10 10 0 1 0 22 12 10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M12 2v20M2 12h20M5.64 5.64l12.72 12.72M5.64 18.36L18.36 5.64"/></svg>',
    '<svg viewBox="0 0 24 24" fill="#2d3436"><path d="M4 4h16v16H4z"/><circle cx="12" cy="12" r="6" fill="white"/><circle cx="12" cy="12" r="3" fill="#2d3436"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><rect x="2" y="2" width="14" height="14"/><rect x="8" y="8" width="14" height="14"/></svg>',
    '<svg viewBox="0 0 24 24" fill="#2d3436"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="#2d3436"><path d="M12 2l-5.5 9h11L12 2zm0 20l5.5-9h-11L12 22z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9z"/><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    '<svg viewBox="0 0 24 24" fill="none" stroke="#2d3436" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
];

let symboldiffState = null;

function startSymboldiff() {
    const key = currentGame;
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const prefix = GAME_META[key].prefix;

    currentGameScore = 0;
    gameInProgress = true;

    const pool = [...SYMBOLS_POOL].sort(() => Math.random() - 0.5);
    const refItems = pool.slice(0, cfg.items);
    const targetItems = [...refItems].sort(() => Math.random() - 0.5);

    const diffIndices = new Set();
    while (diffIndices.size < cfg.diffs) {
        diffIndices.add(Math.floor(Math.random() * cfg.items));
    }
    const unused = pool.slice(cfg.items);
    let counter = 0;
    diffIndices.forEach(idx => { targetItems[idx] = unused[counter++]; });

    speak('تفاوت های جدول پایین رو با بالا پیدا کن و روشون کلیک کن.');

    symboldiffState = {
        key, cfg, prefix, diffIndices,
        foundCount: 0,
        timerId: null,
        active: true,
        remainingSec: cfg.timeSec
    };

    const renderGrid = (elId, arr, isTarget) => {
        const container = document.getElementById(elId);
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${cfg.cols}, minmax(0, 1fr))`;
        arr.forEach((sym, i) => {
            const div = document.createElement('div');
            div.className = 'diff-item';
            div.innerHTML = sym;
            if (isTarget) div.onclick = () => handleSymboldiffClick(div, i);
            container.appendChild(div);
        });
    };

    renderGrid(prefix + '-grid-ref', refItems, false);
    renderGrid(prefix + '-grid-target', targetItems, true);

    document.getElementById(prefix + '-feedback').innerText = '';

    if (state.noTimerMode) {
        showStaticTimerBar(prefix + '-timer-bar', '#00b894');
    } else {
        startTimerBar(prefix + '-timer-bar', cfg.timeSec * 1000);
        symboldiffState.timerId = gameInterval(() => {
            if (isPaused || !symboldiffState || !symboldiffState.active) return;
            symboldiffState.remainingSec--;
            if (symboldiffState.remainingSec <= 0) endSymboldiff();
        }, 1000);
    }

    showScreen(GAME_META[key].screen);
    updateGameScore();
}

function handleSymboldiffClick(div, idx) {
    if (!symboldiffState || !symboldiffState.active || isPaused) return;
    if (div.classList.contains('correct') || div.classList.contains('wrong')) return;

    const { cfg, prefix, diffIndices } = symboldiffState;
    const fb = document.getElementById(prefix + '-feedback');

    if (diffIndices.has(idx)) {
        playSound('correct');
        div.classList.add('correct');
        currentGameScore += cfg.points;
        symboldiffState.foundCount++;
        fb.style.color = '#27ae60';
        fb.innerText = '✅ درست پیدا کردی!';
        updateGameScore();
        if (symboldiffState.foundCount === cfg.diffs) {
            clearSymboldiffTimer();
            gameTimeout(() => endSymboldiff(), 1000);
        }
    } else {
        playSound('wrong');
        div.classList.add('wrong');
        currentGameScore = Math.max(0, currentGameScore - 5);
        fb.style.color = '#d63031';
        fb.innerText = '❌ این تغییر نکرده بود!';
        updateGameScore();

        if (registerWrong()) {
            fb.innerText = '💔 جان تموم شد!';
            return;
        }
    }
}

function clearSymboldiffTimer() {
    if (symboldiffState && symboldiffState.timerId) {
        clearInterval(symboldiffState.timerId);
        gameTimers.delete(symboldiffState.timerId);
        symboldiffState.timerId = null;
    }
}

function endSymboldiff() {
    if (!symboldiffState || !symboldiffState.active) return;
    symboldiffState.active = false;
    gameInProgress = false;
    clearSymboldiffTimer();

    const { key, prefix } = symboldiffState;
    document.querySelectorAll('#' + prefix + '-grid-target .diff-item').forEach(d => d.onclick = null);
    gameTimeout(() => endSingleGame(GAME_META[key].name, 'دقت دیداری فوق‌العاده‌ای داری!'), 1000);
}

GAME_STARTERS.symboldiff = startSymboldiff;
GAME_PAUSE_HOOKS.symboldiff = () => clearSymboldiffTimer();
GAME_RESUME_HOOKS.symboldiff = () => {
    if (!symboldiffState || !symboldiffState.active || state.noTimerMode) return;
    if (!symboldiffState.timerId) {
        symboldiffState.timerId = gameInterval(() => {
            if (isPaused || !symboldiffState || !symboldiffState.active) return;
            symboldiffState.remainingSec--;
            if (symboldiffState.remainingSec <= 0) endSymboldiff();
        }, 1000);
    }
};