// =====================================================
// STATE - مدیریت وضعیت اپلیکیشن
// =====================================================

let state = createDefaultState();
let pendingStreakMessage = null;
let gameStartTime = 0;
let _saveTimeout = null;

async function initState() {
    state = await loadStateFromDB();
    if (!state.gameHistory) state.gameHistory = [];
    if (!state.dailyWorkout) state.dailyWorkout = { date: null, games: [], completed: [] };
    for (const key of GAME_KEYS) {
        if (!state.games[key]) {
            state.games[key] = { level: 1, best: 0, badges: { 1: false, 2: false, 3: false }, tutorialSeen: false };
        }
        if (!state.games[key].badges) {
            state.games[key].badges = { 1: false, 2: false, 3: false };
        }
        if (state.games[key].tutorialSeen === undefined) {
            state.games[key].tutorialSeen = false;
        }
    }
}

function saveState() {
    if (_saveTimeout) clearTimeout(_saveTimeout);
    _saveTimeout = setTimeout(() => {
        saveStateToDB(state);
        _saveTimeout = null;
    }, 100);
}

function saveStateNow() {
    if (_saveTimeout) { clearTimeout(_saveTimeout); _saveTimeout = null; }
    return saveStateToDB(state);
}

function getLevel(key) { return state.games[key].level; }
function setLevel(key, val) { state.games[key].level = val; saveState(); }
function getBest(key) { return state.games[key].best; }
function setBest(key, val) { state.games[key].best = val; saveState(); }
function hasBadge(key, level) { return state.games[key].badges[level] === true; }
function awardBadge(key, level) {
    if (!hasBadge(key, level)) {
        state.games[key].badges[level] = true;
        saveState();
        return true;
    }
    return false;
}

function countBadges() {
    let count = 0;
    for (const key of GAME_KEYS) {
        for (let lvl = 1; lvl <= 4; lvl++) {
            if (hasBadge(key, lvl)) count++;
        }
    }
    return count;
}

function updateStreak() {
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastPlayDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const oldStreak = state.streak || 0;
    if (state.lastPlayDate === yesterday) state.streak = oldStreak + 1;
    else state.streak = 1;
    state.lastPlayDate = today;
    saveState();
    if (state.streak > oldStreak && state.streak >= 2) {
        pendingStreakMessage = `🔥 ${toFa(state.streak)} روز پشت سرهم! آفرین!`;
    }
}

function recordPlayTime() {
    if (gameStartTime > 0) {
        const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const today = new Date().toISOString().slice(0, 10);
        if (state.dailyPlayDate !== today) {
            state.dailyPlayDate = today;
            state.dailyPlaySeconds = 0;
        }
        state.dailyPlaySeconds = (state.dailyPlaySeconds || 0) + elapsed;
        gameStartTime = 0;
        saveState();
    }
}

function toggleNoTimer() {
    state.noTimerMode = !state.noTimerMode;
    saveState();
    updateMenuDisplay();
    playSound('click');
    showMascotMessage(state.noTimerMode ? 'حالت آرام فعال شد ⏱️' : 'حالت معمولی فعال شد ⏰', 2500);
}