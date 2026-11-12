// =====================================================
// GAME: SHAPEHUNT
// =====================================================

let shapehuntState = null;

function startShapehunt() {
    const key = currentGame;
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const prefix = GAME_META[key].prefix;

    currentGameScore = 0;
    gameInProgress = true;

    const { target, distractors, totalItems, targetCount } = cfg;

    document.getElementById(prefix + '-instruction').innerHTML =
        `فقط روی این شکل کلیک کن: <span class="target-display-box">${getShapeSVG(target)}</span>`;
    speak('فقط روی شکلی که در تصویر میبینی کلیک کن!');

    const arr = [];
    for (let i = 0; i < targetCount; i++) arr.push({ isTarget: true, obj: target });
    while (arr.length < totalItems) {
        const d = distractors[Math.floor(Math.random() * distractors.length)];
        arr.push({ isTarget: false, obj: d });
    }
    arr.sort(() => Math.random() - 0.5);

    shapehuntState = {
        key, cfg, prefix,
        hits: 0,
        targetCount,
        timerId: null,
        active: true,
        remainingSec: cfg.timeSec
    };

    const grid = document.getElementById(prefix + '-grid');
    grid.innerHTML = '';
    arr.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'shape-btn';
        btn.innerHTML = getShapeSVG(item.obj);
        btn.onclick = () => handleShapehuntClick(btn, item.isTarget);
        grid.appendChild(btn);
    });

    document.getElementById(prefix + '-feedback').innerText = '';

    if (state.noTimerMode) {
        showStaticTimerBar(prefix + '-timer-bar', '#00b894');
    } else {
        startTimerBar(prefix + '-timer-bar', cfg.timeSec * 1000);
        shapehuntState.timerId = gameInterval(() => {
            if (isPaused || !shapehuntState || !shapehuntState.active) return;
            shapehuntState.remainingSec--;
            if (shapehuntState.remainingSec <= 0) endShapehunt(false);
        }, 1000);
    }

    showScreen(GAME_META[key].screen);
    updateGameScore();
}

function handleShapehuntClick(btn, isTarget) {
    if (!shapehuntState || !shapehuntState.active || btn.disabled || isPaused) return;
    const { cfg, prefix } = shapehuntState;
    const fb = document.getElementById(prefix + '-feedback');

    if (isTarget) {
        playSound('correct');
        btn.classList.add('correct');
        currentGameScore += cfg.pointsPerHit;
        shapehuntState.hits++;
        fb.style.color = '#27ae60';
        fb.innerText = `🎯 آفرین! ${toFa(shapehuntState.hits)} پیدا شد.`;
        updateGameScore();
        btn.disabled = true;
        gameTimeout(() => btn.classList.add('vanish'), 300);

        if (shapehuntState.hits === shapehuntState.targetCount) {
            gameTimeout(() => endShapehunt(true), 500);
        }
    } else {
        playSound('wrong');
        btn.classList.add('wrong');
        fb.style.color = '#d63031';
        fb.innerText = '❌ اشتباه بود!';
        updateGameScore();
        btn.disabled = true;
        gameTimeout(() => btn.classList.add('vanish'), 300);

        if (registerWrong()) {
            fb.innerText = '💔 جان تموم شد!';
            return;
        }
    }
}

function clearShapehuntTimer() {
    if (shapehuntState && shapehuntState.timerId) {
        clearInterval(shapehuntState.timerId);
        gameTimers.delete(shapehuntState.timerId);
        shapehuntState.timerId = null;
    }
}

function endShapehunt(allFound) {
    if (!shapehuntState || !shapehuntState.active) return;
    shapehuntState.active = false;
    gameInProgress = false;
    clearShapehuntTimer();

    const { key, prefix } = shapehuntState;
    document.querySelectorAll('#' + prefix + '-grid .shape-btn').forEach(b => {
        b.disabled = true;
        b.classList.add('vanish');
    });

    const fb = document.getElementById(prefix + '-feedback');
    fb.style.color = '#0984e3';
    fb.innerText = allFound ? '🎉 عالی بود! همه رو پیدا کردی.' : '⏰ زمان تمام شد!';
    gameTimeout(() => endSingleGame(GAME_META[key].name, allFound ? 'چشم‌های تیزی داری!' : 'دقتت خیلی خوبه، بازم تلاش کن.'), 1500);
}

GAME_STARTERS.shapehunt = startShapehunt;
GAME_PAUSE_HOOKS.shapehunt = () => clearShapehuntTimer();
GAME_RESUME_HOOKS.shapehunt = () => {
    if (!shapehuntState || !shapehuntState.active || state.noTimerMode) return;
    if (!shapehuntState.timerId) {
        shapehuntState.timerId = gameInterval(() => {
            if (isPaused || !shapehuntState || !shapehuntState.active) return;
            shapehuntState.remainingSec--;
            if (shapehuntState.remainingSec <= 0) endShapehunt(false);
        }, 1000);
    }
};