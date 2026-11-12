// =====================================================
// STORAGE - IndexedDB + مهاجرت از localStorage
// =====================================================

const DB_NAME = 'brainClubDB';
const DB_VERSION = 1;
const STORE_NAME = 'appState';
const STATE_KEY = 'main';

let _dbPromise = null;

function openDB() {
    if (_dbPromise) return _dbPromise;
    _dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
    return _dbPromise;
}

async function dbGet(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function dbSet(key, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const req = tx.objectStore(STORE_NAME).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

async function dbDelete(key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const req = tx.objectStore(STORE_NAME).delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

function createDefaultState() {
    const games = {};
    for (const key of GAME_KEYS) {
        games[key] = { level: 1, best: 0, badges: { 1: false, 2: false, 3: false }, tutorialSeen: false };
    }
    return {
        version: 2,
        totalScore: 0,
        streak: 0,
        lastPlayDate: null,
        noTimerMode: false,
        dailyPlaySeconds: 0,
        dailyPlayDate: null,
        soundEnabled: true,
        games,
        gameHistory: []
    };
}

function migrateFromLocalStorage() {
    try {
        const hasOld = localStorage.getItem('brainTotalScore')
            || localStorage.getItem('brainLevels_v2')
            || localStorage.getItem('brainLevels');
        if (!hasOld) return null;

        const newState = createDefaultState();
        newState.totalScore = parseInt(localStorage.getItem('brainTotalScore')) || 0;

        let oldLevels = null;
        const newLevelsStr = localStorage.getItem('brainLevels_v2');
        if (newLevelsStr) {
            try { oldLevels = JSON.parse(newLevelsStr); } catch(e) {}
        } else {
            const flat = localStorage.getItem('brainLevels');
            if (flat) {
                try {
                    const parsed = JSON.parse(flat);
                    oldLevels = { junior: parsed, senior: parsed };
                } catch(e) {}
            }
        }

        let oldBest = null;
        const newBestStr = localStorage.getItem('brainBestScores_v2');
        if (newBestStr) {
            try { oldBest = JSON.parse(newBestStr); } catch(e) {}
        } else {
            const flat = localStorage.getItem('brainBestScores');
            if (flat) {
                try {
                    const parsed = JSON.parse(flat);
                    oldBest = { junior: parsed, senior: parsed };
                } catch(e) {}
            }
        }

        if (oldLevels) {
            const j = oldLevels.junior || {};
            const s = oldLevels.senior || {};
            const map = {
                stroop_junior: j.stroop, stroop_senior: s.stroop,
                numhunt_junior: j.numhunt, numhunt_senior: s.numhunt,
                wordhunt_junior: j.wordhunt, wordhunt_senior: s.wordhunt,
                shapehunt: s.shapehunt || j.shapehunt,
                memory: s.memory || j.memory,
                symboldiff: s.symboldiff || j.symboldiff,
                scattermem: s.scattermem || j.scattermem
            };
            for (const k in map) {
                if (map[k] != null && newState.games[k]) {
                    newState.games[k].level = Math.min(3, Math.max(1, parseInt(map[k]) || 1));
                }
            }
        }

        if (oldBest) {
            const j = oldBest.junior || {};
            const s = oldBest.senior || {};
            const map = {
                stroop_junior: j.stroop, stroop_senior: s.stroop,
                numhunt_junior: j.numhunt, numhunt_senior: s.numhunt,
                wordhunt_junior: j.wordhunt, wordhunt_senior: s.wordhunt,
                shapehunt: Math.max(s.shapehunt || 0, j.shapehunt || 0),
                memory: Math.max(s.memory || 0, j.memory || 0),
                symboldiff: Math.max(s.symboldiff || 0, j.symboldiff || 0),
                scattermem: Math.max(s.scattermem || 0, j.scattermem || 0)
            };
            for (const k in map) {
                if (map[k] != null && newState.games[k]) {
                    newState.games[k].best = Math.max(0, parseInt(map[k]) || 0);
                }
            }
        }

        newState.streak = parseInt(localStorage.getItem('brainStreak')) || 0;
        newState.lastPlayDate = localStorage.getItem('brainLastPlayDate') || null;
        newState.noTimerMode = localStorage.getItem('brainNoTimer') === 'true';
        newState.dailyPlaySeconds = parseInt(localStorage.getItem('brainDailyPlay')) || 0;
        newState.dailyPlayDate = localStorage.getItem('brainDailyPlayDate') || null;

        try {
            const oldBadges = JSON.parse(localStorage.getItem('brainBadges')) || {};
            for (const oldKey in oldBadges) {
                if (!oldBadges[oldKey]) continue;
                const parts = oldKey.split('_');
                if (parts.length !== 2) continue;
                const gameName = parts[0];
                const lvl = parseInt(parts[1]);
                if (!lvl || lvl < 1 || lvl > 3) continue;

                if (gameName === 'stroop' || gameName === 'numhunt' || gameName === 'wordhunt') {
                    const jKey = gameName + '_junior';
                    const sKey = gameName + '_senior';
                    if (newState.games[jKey]) newState.games[jKey].badges[lvl] = true;
                    if (newState.games[sKey]) newState.games[sKey].badges[lvl] = true;
                } else if (['shapehunt', 'memory', 'symboldiff', 'scattermem'].includes(gameName)) {
                    if (newState.games[gameName]) newState.games[gameName].badges[lvl] = true;
                }
            }
        } catch(e) {}

        return newState;
    } catch(e) {
        console.warn('Migration failed:', e);
        return null;
    }
}

async function loadStateFromDB() {
    try {
        const stored = await dbGet(STATE_KEY);
        if (stored && stored.version === 2) return stored;

        const migrated = migrateFromLocalStorage();
        if (migrated) {
            await dbSet(STATE_KEY, migrated);
            return migrated;
        }

        const fresh = createDefaultState();
        await dbSet(STATE_KEY, fresh);
        return fresh;
    } catch(e) {
        console.error('DB load failed:', e);
        return createDefaultState();
    }
}

async function saveStateToDB(s) {
    try { await dbSet(STATE_KEY, s); }
    catch(e) { console.error('DB save failed:', e); }
}

async function wipeAllData() {
    try { await dbDelete(STATE_KEY); } catch(e) {}
    try {
        ['brainTotalScore','brainLevels','brainLevels_v2','brainBestScores','brainBestScores_v2',
         'brainStreak','brainLastPlayDate','brainBadges','brainNoTimer','brainDailyPlay','brainDailyPlayDate'
        ].forEach(k => localStorage.removeItem(k));
    } catch(e) {}
}