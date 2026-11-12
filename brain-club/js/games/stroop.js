// =====================================================
// GAME: STROOP (junior: روز/شب | senior: رنگ/کلمه)
// =====================================================

const STROOP_COLORS = [
    { name: 'قرمز', hex: '#e74c3c' },
    { name: 'آبی', hex: '#3498db' },
    { name: 'سبز', hex: '#27ae60' },
    { name: 'نارنجی', hex: '#e67e22' },
    { name: 'بنفش', hex: '#9b59b6' }
];

let stroopState = null;

function startStroop() {
    const key = currentGame;
    const isJunior = key === 'stroop_junior';
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const prefix = GAME_META[key].prefix;

    currentGameScore = 0;
    gameInProgress = true;

    stroopState = {
        key, isJunior, lvl, cfg, prefix,
        roundsLeft: cfg.rounds,
        correctAnswer: null,
        locked: false,
        phase: 'answering',
        tickId: null,
        endTime: 0,
        remainingMs: 0,
        advanceEndTime: 0,
        advanceRemainingMs: 0
    };

    const btnContainer = document.getElementById(prefix + '-btns');
    btnContainer.innerHTML = '';
    if (isJunior) {
        [{ name: 'روز ☀️', val: 'day' }, { name: 'شب 🌙', val: 'night' }].forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'junior-stroop-btn ' + c.val;
            btn.innerText = c.name;
            btn.onclick = () => checkStroop(c.val);
            btnContainer.appendChild(btn);
        });
    } else {
        STROOP_COLORS.slice(0, cfg.colors).forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'color-btn';
            btn.style.background = c.hex;
            btn.innerText = c.name;
            btn.onclick = () => checkStroop(c.name);
            btnContainer.appendChild(btn);
        });
    }

    showScreen(GAME_META[key].screen);
    updateGameScore();
    nextStroopRound();
}

function nextStroopRound() {
    if (!stroopState || !gameInProgress) return;
    if (stroopState.roundsLeft <= 0) {
        const name = GAME_META[stroopState.key].name;
        const msg = stroopState.isJunior ? 'روز و شب تموم شد!' : 'بازی توجه پایدار تموم شد!';
        endSingleGame(name, msg);
        return;
    }
    stroopState.roundsLeft--;
    stroopState.locked = false;
    stroopState.phase = 'answering';

    const { key, isJunior, lvl, cfg, prefix } = stroopState;
    const display = document.getElementById(prefix + '-display');
    const feedback = document.getElementById(prefix + '-feedback');
    const gameBox = document.getElementById(GAME_META[key].screen).querySelector('.game-box');

    if (isJunior) {
        // L4: آیکون‌های جایگزین (شبیه‌تر و کمتر رایج)
        const useAltIcons = lvl >= 4;
        const isSun = Math.random() > 0.5;
        if (useAltIcons) {
            display.innerText = isSun ? '🌞' : '🌛';
        } else {
            display.innerText = isSun ? '☀️' : '🌙';
        }
        display.style.color = 'inherit';
        stroopState.correctAnswer = isSun ? 'night' : 'day';

        // L3+ : پس‌زمینه گمراه‌کننده
        if (lvl >= 3) {
            gameBox.style.background = isSun ? '#d5f5e3' : '#fadbd8';
        } else {
            gameBox.style.background = '#f1f2f6';
        }
    } else {
        const colors = STROOP_COLORS.slice(0, cfg.colors);
        const wordObj = colors[Math.floor(Math.random() * colors.length)];
        let colorObj;

        // L4: همیشه تضاد (کلمه و رنگ متفاوت)
        if (lvl >= 4) {
            do {
                colorObj = colors[Math.floor(Math.random() * colors.length)];
            } while (colorObj.name === wordObj.name && colors.length > 1);
        } else {
            colorObj = colors[Math.floor(Math.random() * colors.length)];
        }

        stroopState.correctAnswer = colorObj.name;
        display.innerText = wordObj.name;
        display.style.color = colorObj.hex;
        gameBox.style.background = '#f1f2f6';
    }
    feedback.innerText = '';

    if (state.noTimerMode) {
        showStaticTimerBar(prefix + '-timer-bar', '#00b894');
    } else {
        startTimerBar(prefix + '-timer-bar', cfg.timePerRound);
        stroopState.endTime = Date.now() + cfg.timePerRound;
        stroopState.remainingMs = cfg.timePerRound;
        stroopStartTick();
    }
}

function stroopStartTick() {
    if (!stroopState) return;
    if (stroopState.tickId) clearTimeout(stroopState.tickId);
    stroopState.tickId = gameTimeout(stroopTick, 100);
}

function stroopTick() {
    if (!stroopState) return;
    stroopState.tickId = null;
    if (!gameInProgress || isPaused) return;

    if (stroopState.phase === 'advance') {
        if (Date.now() >= stroopState.advanceEndTime) {
            if (stroopState.roundsLeft <= 0) {
                const name = GAME_META[stroopState.key].name;
                endSingleGame(name, stroopState.isJunior ? 'روز و شب تموم شد!' : 'بازی توجه پایدار تموم شد!');
            } else {
                nextStroopRound();
            }
            return;
        }
        stroopState.tickId = gameTimeout(stroopTick, 100);
        return;
    }

    if (stroopState.locked || state.noTimerMode) return;
    if (Date.now() >= stroopState.endTime) {
        handleStroopTimeout();
        return;
    }
    stroopState.tickId = gameTimeout(stroopTick, 100);
}

function handleStroopTimeout() {
    if (!stroopState || isPaused || stroopState.locked || state.noTimerMode) return;
    stroopState.locked = true;
    playSound('wrong');
    const fb = document.getElementById(stroopState.prefix + '-feedback');
    fb.style.color = '#e17055';
    fb.innerText = '⏰ زمان تموم شد!';

    if (registerWrong()) {
        fb.innerText = '💔 جان تموم شد!';
        return;
    }

    stroopState.phase = 'advance';
    stroopState.advanceEndTime = Date.now() + 1200;
    stroopStartTick();
}

function checkStroop(selected) {
    if (!stroopState || stroopState.locked || isPaused) return;
    stroopState.locked = true;

    const { prefix, cfg } = stroopState;
    const fb = document.getElementById(prefix + '-feedback');
    const isCorrect = selected === stroopState.correctAnswer;

    if (isCorrect) {
        playSound('correct');
        if (stroopState.isJunior) speak('آفرین');
        currentGameScore += cfg.points;
        fb.style.color = '#27ae60';
        fb.innerText = '✅ آفرین!';
    } else {
        playSound('wrong');
        if (stroopState.isJunior) speak('اشتباه بود');
        fb.style.color = '#d63031';
        fb.innerText = '❌ دقت کن!';
        if (registerWrong()) {
            fb.innerText = '💔 جان تموم شد!';
            return;
        }
    }
    updateGameScore();

    stroopState.phase = 'advance';
    stroopState.advanceEndTime = Date.now() + 1200;
    stroopStartTick();
}

GAME_STARTERS.stroop_junior = startStroop;
GAME_STARTERS.stroop_senior = startStroop;

function stroopPause() {
    if (!stroopState) return;
    if (stroopState.tickId) { clearTimeout(stroopState.tickId); stroopState.tickId = null; }
    if (stroopState.phase === 'answering' && !stroopState.locked && !state.noTimerMode) {
        stroopState.remainingMs = Math.max(0, stroopState.endTime - Date.now());
    } else if (stroopState.phase === 'advance') {
        stroopState.advanceRemainingMs = Math.max(0, stroopState.advanceEndTime - Date.now());
    }
}

function stroopResume() {
    if (!stroopState || !gameInProgress || stroopState.tickId) return;
    if (stroopState.phase === 'answering' && !stroopState.locked && !state.noTimerMode) {
        stroopState.endTime = Date.now() + (stroopState.remainingMs || 0);
    } else if (stroopState.phase === 'advance') {
        stroopState.advanceEndTime = Date.now() + (stroopState.advanceRemainingMs || 0);
    }
    stroopStartTick();
}

GAME_PAUSE_HOOKS.stroop_junior = stroopPause;
GAME_PAUSE_HOOKS.stroop_senior = stroopPause;
GAME_RESUME_HOOKS.stroop_junior = stroopResume;
GAME_RESUME_HOOKS.stroop_senior = stroopResume;