// =====================================================
// ENGINE - موتور بازی + صفحه نتیجه (3.4)
// =====================================================

let currentGame = "";
let currentGameScore = 0;
let gameActive = false;
let gameInProgress = false;
let currentWrongCount = 0;
let wrongsLimit = 5;
let _nextAction = null;
function startGame(gameKey) {
    const meta = GAME_META[gameKey];
    if (!meta) { console.error('Unknown game:', gameKey); return; }

    if (TUTORIALS[gameKey] && state.games[gameKey] && !state.games[gameKey].tutorialSeen) {
        showTutorial(gameKey, () => {
            state.games[gameKey].tutorialSeen = true;
            saveStateNow();
            _beginGame(gameKey);
        });
    } else {
        _beginGame(gameKey);
    }
}

function _beginGame(gameKey) {
    history.pushState({ page: 'game' }, '');
    currentGame = gameKey;
    currentGameScore = 0;
    gameActive = true;
    gameInProgress = false;
    isPaused = false;
    gameStartTime = Date.now();
    _suggestedNextGame = null;

    initWrongs();

    const meta = GAME_META[gameKey];
    const badge = document.getElementById(meta.prefix + '-level-badge');
    if (badge) badge.innerText = `سطح ${toFa(getLevel(gameKey))}`;

    if (GAME_STARTERS[gameKey]) GAME_STARTERS[gameKey]();
    else console.error('No starter for game:', gameKey);
}

// ============ سیستم جان‌ها ============
function initWrongs() {
    currentWrongCount = 0;
    const cfg = GAME_CONFIGS[currentGame] && GAME_CONFIGS[currentGame][getLevel(currentGame)];
    wrongsLimit = (cfg && cfg.maxWrong) || 5;
    renderWrongs();
}

function registerWrong() {
    if (!gameActive || !gameInProgress) return false;
    currentWrongCount++;
    renderWrongs();
    if (currentWrongCount >= wrongsLimit) {
        gameInProgress = false;
        clearAllGameTimers();
        const meta = GAME_META[currentGame];
        setTimeout(() => {
            if (!gameActive) return;
            endSingleGame(meta.name, '😢 خیلی اشتباه کردی! بازی تموم شد.', true);
        }, 1200);
        return true;
    }
    return false;
}

function renderWrongs() {
    if (!currentGame) return;
    const meta = GAME_META[currentGame];
    const el = document.getElementById(meta.prefix + '-wrongs');
    if (!el) return;
    const remaining = Math.max(0, wrongsLimit - currentWrongCount);
    let html = '';
    for (let i = 0; i < wrongsLimit; i++) {
        html += i < remaining ? '❤️' : '🖤';
    }
    el.innerHTML = html;
    el.title = `${remaining} جان باقی‌مانده`;
}

function updateGameScore() {
    const meta = GAME_META[currentGame];
    if (!meta) return;
    const scoreEl = document.getElementById(meta.prefix + '-score');
    if (scoreEl) scoreEl.innerText = "امتیاز: " + toFa(currentGameScore);
}

// ============ تاریخچه ============
function addToHistory(gameKey, score, level, passed) {
    if (!state.gameHistory) state.gameHistory = [];
    state.gameHistory.push({
        gameKey,
        score: Math.round(score),
        level,
        date: Date.now(),
        passed
    });
    if (state.gameHistory.length > 30) {
        state.gameHistory = state.gameHistory.slice(-30);
    }
}

function getPreviousScoreForGame(gameKey) {
    if (!state.gameHistory || state.gameHistory.length < 2) return null;
    const history = state.gameHistory.slice(0, -1);
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].gameKey === gameKey) return history[i].score;
    }
    return null;
}

// ============ پایان بازی ============
function endSingleGame(gameName, message, forceFail) {
    if (!gameActive) return;
    gameActive = false;
    gameInProgress = false;
    isPaused = false;
    clearAllGameTimers();

    const key = currentGame;
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const threshold = cfg.threshold;
    const passed = !forceFail && (currentGameScore >= threshold);

    const prevScore = getPreviousScoreForGame(key);

    state.totalScore += currentGameScore;
    recordPlayTime();

    if (currentGameScore > getBest(key)) setBest(key, currentGameScore);
    const best = getBest(key);

    let unlocked = false;
    if (passed && lvl < 4) {
        setLevel(key, lvl + 1);
        unlocked = true;
    }

    let newBadge = false;
    if (passed && !hasBadge(key, lvl)) {
        awardBadge(key, lvl);
        newBadge = true;
    }

    addToHistory(key, currentGameScore, lvl, passed);
    saveState();

    showScreen('screen-result');
    displayResult(gameName, key, lvl, best, threshold, passed, forceFail, newBadge, prevScore, message);
}

function displayResult(gameName, key, lvl, best, threshold, passed, forceFail, newBadge, prevScore, message) {
    const meta = GAME_META[key];

    document.getElementById('sr-emoji').innerText = passed ? '🏆' : (forceFail ? '💔' : '💪');
    document.getElementById('sr-title').innerText = gameName + ' تموم شد!';

    const scoreEl = document.getElementById('sr-score');
    scoreEl.innerText = '۰';
    setTimeout(() => animateScore(currentGameScore), 150);

    const diffEl = document.getElementById('sr-score-diff');
    if (prevScore !== null) {
        const diff = Math.round(currentGameScore - prevScore);
        if (diff > 0) {
            diffEl.style.color = '#27ae60';
            diffEl.innerText = `+${toFa(diff)} بهتر از دور قبل ✨`;
        } else if (diff < 0) {
            diffEl.style.color = '#d63031';
            diffEl.innerText = `${toFa(diff)} نسبت به دور قبل`;
        } else {
            diffEl.style.color = '#636e72';
            diffEl.innerText = 'مثل دور قبل';
        }
    } else {
        diffEl.style.color = '#0984e3';
        diffEl.innerText = '🎉 اولین بار این بازی!';
    }

    const bestBar = document.getElementById('sr-best-bar');
    bestBar.style.width = '0%';
    document.getElementById('sr-best').innerText = toFa(best) + ' امتیاز';
    setTimeout(() => {
        const pct = best > 0 ? Math.min(100, (currentGameScore / best) * 100) : 0;
        bestBar.style.width = pct + '%';
    }, 300);

    const progressSection = document.getElementById('sr-progress-section');
    const progressBar = document.getElementById('sr-progress-bar');
    const progressText = document.getElementById('sr-progress-text');

    if (!passed) {
        progressSection.style.display = 'block';
        progressBar.style.width = '0%';
        setTimeout(() => {
            const pct = threshold > 0 ? Math.min(100, (currentGameScore / threshold) * 100) : 0;
            progressBar.style.width = pct + '%';
        }, 400);
        progressText.innerText = `${toFa(Math.round(currentGameScore))} از ${toFa(threshold)}`;
    } else if (lvl < 4) {
        const newLvl = lvl + 1;
        progressSection.style.display = 'block';
        progressBar.style.width = '0%';
        setTimeout(() => { progressBar.style.width = '100%'; }, 400);
        progressText.innerText = `✅ سطح ${toFa(newLvl)} باز شد!`;
    } else {
        progressSection.style.display = 'block';
        progressBar.style.width = '0%';
        setTimeout(() => { progressBar.style.width = '100%'; }, 400);
        progressText.innerText = '👑 استاد این بازی!';
    }

    const badgeSection = document.getElementById('sr-badge-section');
    if (newBadge) {
        badgeSection.style.display = 'flex';
        document.getElementById('sr-badge-icon').innerText = LEVEL_MEDALS[lvl];
        document.getElementById('sr-badge-name').innerText = `سطح ${toFa(lvl)} — ${meta.name}`;
    } else {
        badgeSection.style.display = 'none';
    }

    const lvlMsg = document.getElementById('sr-level-msg');
    if (passed) {
        lvlMsg.style.color = '#f39c12';
        lvlMsg.innerText = lvl === 4
            ? '👑 وای! تو استادِ این بازی شدی!'
            : `🎉 به سطح ${toFa(getLevel(key))} راه پیدا کردی!`;
    } else {
        lvlMsg.innerText = '';
    }

    const msgEl = document.getElementById('sr-message');
    msgEl.className = passed ? 'pass-text result-message' : 'fail-text result-message';
    if (passed) {
        msgEl.innerText = message || 'آفرین قهرمان!';
    } else if (forceFail) {
        msgEl.innerText = message || 'خیلی اشتباه کردی! دوباره تلاش کن.';
    } else {
        msgEl.innerText = `تلاش خوبی بود! برای رفتن به سطح بعد به ${toFa(threshold)} امتیاز نیاز داری.`;
    }

    renderResultHistory();

          // آیا در حال انجام تمرین روزانه هستیم؟
    if (window.isInDailyWorkout) {
        const dw = state.dailyWorkout;
        if (dw && !dw.completed.includes(dw.games.indexOf(key))) { // اگر این بازی جزو تمرین بوده
             // بازی فعلی را Completed کن
             const indexInWorkout = dw.games.indexOf(key);
             if (indexInWorkout !== -1 && !dw.completed.includes(indexInWorkout)) {
                 dw.completed.push(indexInWorkout);
                 saveState();
             }
             
             // آیا همه بازی‌های تمرین تمام شده؟
             if (dw.completed.length >= dw.games.length) {
                 window.isInDailyWorkout = false;
                 _nextAction = { html: '<i data-lucide="check-circle"></i><span>پایان تمرین</span>', action: 'go_menu' };
                 document.getElementById('sr-title').innerText = '🎉 تمرین امروز تموم شد!';
                 showConfetti();
             } else {
                 // رفتن به بازی بعدی
                 const nextIndex = dw.games.findIndex((_, i) => !dw.completed.includes(i));
                 const nextKey = dw.games[nextIndex];
                 const nMeta = GAME_META[nextKey];
                 _nextAction = { html: `<i data-lucide="play"></i><span>بازی بعدی: ${nMeta.name}</span>`, action: 'workout_next', targetGame: nextKey };
             }
        }
    } else {
        _nextAction = determineNextAction(key, passed, forceFail, lvl);
    }
    
    document.getElementById('sr-next-btn').innerHTML = _nextAction.html;
    refreshIcons();

    if (passed) {
        playSound('win');
        showConfetti();
        showMascotMessage('آفرین قهرمان! 🌟', 4000);
    } else {
        playSound('wrong');
        showMascotMessage(forceFail ? 'نگران نباش، دوباره تلاش کن! 💪' : 'دفعه بعد بهتر می‌شی! 💪', 4000);
    }
    updateMascotVisibility();
}

function animateScore(target) {
    const el = document.getElementById('sr-score');
    if (!el) return;
    const targetVal = Math.round(target);
    const duration = 1000;
    const start = Date.now();

    function step() {
        const elapsed = Date.now() - start;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.round(targetVal * eased);
        el.innerText = toFa(current);
        if (t < 1) requestAnimationFrame(step);
        else el.innerText = toFa(targetVal) + ' امتیاز';
    }
    requestAnimationFrame(step);
}

function renderResultHistory() {
    const list = document.getElementById('sr-history-list');
    if (!list) return;
    const history = state.gameHistory || [];
    const last5 = history.slice(-5).reverse();

    if (last5.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#b2bec3; font-size:13px;">هنوز بازی نکردی</p>';
        return;
    }

    list.innerHTML = '';
    last5.forEach(entry => {
        const m = GAME_META[entry.gameKey];
        if (!m) return;
        const domain = DOMAINS[m.domain];
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-game">
                <i data-lucide="${m.icon}" style="color:${domain.color};"></i>
                <span>${m.name}</span>
                <span class="history-level">L${toFa(entry.level)}</span>
            </div>
            <div class="history-score ${entry.passed ? '' : 'failed'}">
                ${toFa(entry.score)} امتیاز
            </div>
        `;
        list.appendChild(item);
    });
    refreshIcons();
}

function suggestNextGame(currentKey) {
    const currentDomain = GAME_META[currentKey].domain;
    const notMastered = GAME_KEYS.filter(k => k !== currentKey && getLevel(k) < 4);
    if (notMastered.length === 0) {
        const others = GAME_KEYS.filter(k => k !== currentKey);
        return others[Math.floor(Math.random() * others.length)];
    }
    const diffDomain = notMastered.filter(k => GAME_META[k].domain !== currentDomain);
    const pool = diffDomain.length > 0 ? diffDomain : notMastered;
    return pool[Math.floor(Math.random() * pool.length)];
}

function determineNextAction(key, passed, forceFail, lvl) {
    if (!passed) {
        return {
            html: '<i data-lucide="rotate-ccw"></i><span>تکرار بازی</span>',
            action: 'retry', targetGame: key
        };
    }

    if (lvl < 4) {
        return {
            html: '<i data-lucide="play"></i><span>مرحله بعد</span>',
            action: 'next_level', targetGame: key
        };
    }

    const domain = GAME_META[key].domain;
    const sameDomain = GAME_KEYS.filter(k => k !== key && GAME_META[k].domain === domain);
    const notMastered = sameDomain.filter(k => getLevel(k) < 4);

    let target = null;
    if (notMastered.length > 0) {
        target = notMastered[Math.floor(Math.random() * notMastered.length)];
    } else if (sameDomain.length > 0) {
        target = sameDomain[Math.floor(Math.random() * sameDomain.length)];
    }

    if (target) {
        const tMeta = GAME_META[target];
        return {
            html: `<i data-lucide="play"></i><span>${tMeta.name}</span>`,
            action: 'new_game', targetGame: target
        };
    }

    return { html: '<i data-lucide="home"></i><span>منو</span>', action: 'go_menu' };
}

function handleNextGame() {
    if (!_nextAction) { goToMenu(); return; }
    const action = _nextAction;
    _nextAction = null;

    if (action.action === 'retry' || action.action === 'next_level' || action.action === 'new_game') {
        window.isInDailyWorkout = false; // خروج از حالت تمرین اگر دستی انتخاب کرد
        startGame(action.targetGame);
    } else if (action.action === 'workout_next') {
        startGame(action.targetGame);
    } else {
        window.isInDailyWorkout = false;
        goToMenu();
    }
}

// ============ خروج ============
function requestExit() {
    if (!gameActive) { goToMenu(); return; }
    if (gameInProgress) {
        showModal(
            'پایان بازی؟',
            `امتیاز فعلی: <strong style="color:#0984e3;">${toFa(Math.round(currentGameScore))}</strong><br>اگر الان خارج شی، این امتیاز ثبت می‌شه ولی به سطح بعد نمی‌ری.`,
            [
                { text: 'ادامه بدم', class: 'primary', action: closeModal },
                { text: 'پایان و ثبت', class: 'secondary', action: finishGameEarly }
            ]
        );
    } else {
        showModal(
            'خروج از بازی؟',
            currentGameScore > 0
                ? `امتیاز فعلی (${toFa(Math.round(currentGameScore))}) به امتیاز کل اضافه می‌شود.`
                : 'هنوز امتیازی کسب نکردی!',
            [
                { text: 'ادامه بازی', class: 'primary', action: closeModal },
                { text: 'خروج', class: 'secondary', action: saveCurrentScoreAndExit }
            ]
        );
    }
}

function finishGameEarly() {
    closeModal();
    gameInProgress = false;
    const meta = GAME_META[currentGame];
    endSingleGame(meta.name, 'بازی تموم شد!');
}

function saveCurrentScoreAndExit() {
    if (currentGameScore > 0) {
        state.totalScore += currentGameScore;
        saveState();
    }
    recordPlayTime();
    closeModal();
    gameActive = false; gameInProgress = false; isPaused = false;
    clearAllGameTimers();
    document.getElementById('pause-overlay').style.display = 'none';
    document.getElementById('interference-overlay').style.display = 'none';
    goToMenu();
}

function requestReset() {
    showModal(
        '⚠️ پاک کردن همه پیشرفت',
        'همه امتیازها، نشان‌ها و سطح‌ها پاک می‌شوند و قابل بازگشت نیستند.<br><strong>برای تأیید، دکمه قرمز را ۲ ثانیه نگه دار.</strong>',
        [{ text: 'نه، انصراف', class: 'secondary', action: closeModal }]
    );
    const container = document.getElementById('modal-buttons');
    const btn = document.createElement('button');
    btn.className = 'modal-btn hold-to-confirm';
    btn.innerHTML = '<div class="hold-fill"></div><span class="hold-text">🗑️ نگه دار تا پاک شود</span>';
    let holdTimer = null, holdActive = false;
    const startHold = (e) => {
        if (e && e.cancelable) e.preventDefault();
        if (holdActive) return;
        holdActive = true;
        btn.classList.add('holding');
        holdTimer = setTimeout(doReset, 2000);
    };
    const cancelHold = () => {
        holdActive = false;
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        btn.classList.remove('holding');
    };
    if (window.PointerEvent) {
        btn.addEventListener('pointerdown', startHold);
        btn.addEventListener('pointerup', cancelHold);
        btn.addEventListener('pointerleave', cancelHold);
        btn.addEventListener('pointercancel', cancelHold);
    } else {
        btn.addEventListener('mousedown', startHold);
        btn.addEventListener('mouseup', cancelHold);
        btn.addEventListener('mouseleave', cancelHold);
        btn.addEventListener('touchstart', startHold, { passive: false });
        btn.addEventListener('touchend', cancelHold);
        btn.addEventListener('touchcancel', cancelHold);
    }
    container.appendChild(btn);
}

async function doReset() {
    await wipeAllData();
    location.reload();
}