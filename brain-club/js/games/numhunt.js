// =====================================================
// GAME: NUMHUNT (junior: حیوانات | senior: اعداد)
// =====================================================

const NUMHUNT_ANIMALS = ['🐱', '🐶', '🐰', '🐻', '🦊'];
const NUMHUNT_ANIMAL_NAMES = { '🐱': 'گربه', '🐶': 'سگ', '🐰': 'خرگوش', '🐻': 'خرس', '🦊': 'روباه' };
const NUMHUNT_DISTRACTORS = ['🍎', '🚗', '🌻', '⚽', '🎈'];

// L4: حیوانات شبیه به هم برای هر هدف
const NUMHUNT_SIMILAR = {
    '🐱': ['🐯', '🦁', '🐅', '🐆'],
    '🐶': ['🐺', '🦊', '🐕', '🐩'],
    '🐰': ['🐹', '🐭', '🐿️', '🦔'],
    '🐻': ['🐨', '🦝', '🐼', '🐮'],
    '🦊': ['🐺', '🐶', '🐈', '🐆']
};

let numhuntState = null;

function startNumhunt() {
    const key = currentGame;
    const isJunior = key === 'numhunt_junior';
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const prefix = GAME_META[key].prefix;

    currentGameScore = 0;
    gameInProgress = false;

    const arr = [];
    let targetSymbol = null;
    let targetNumber = null;

    if (isJunior) {
        targetSymbol = NUMHUNT_ANIMALS[Math.floor(Math.random() * NUMHUNT_ANIMALS.length)];
        for (let i = 0; i < cfg.targetCount; i++) arr.push(targetSymbol);

        while (arr.length < cfg.items) {
            let d;
            if (lvl >= 4) {
                // L4: حیوانات شبیه به هدف
                const sims = NUMHUNT_SIMILAR[targetSymbol] || NUMHUNT_DISTRACTORS;
                d = sims[Math.floor(Math.random() * sims.length)];
            } else if (lvl >= 3 && targetSymbol === '🐶' && Math.random() < 0.5) {
                d = '🐺';
            } else {
                d = NUMHUNT_DISTRACTORS[Math.floor(Math.random() * NUMHUNT_DISTRACTORS.length)];
            }
            arr.push(d);
        }
        arr.sort(() => Math.random() - 0.5);

        const hint = lvl >= 4
            ? '<br><span style="color:#d63031; font-size:13px;">⚠️ حیوانات شبیه به هم هستن، دقت کن!</span>'
            : '';

        document.getElementById(prefix + '-instruction').innerHTML =
            `<strong>مرحله ۱ - حفظ کن:</strong> بین این تصاویر ${toFa(cfg.targetCount)} تا <strong>${targetSymbol}</strong> هست. جاهاشون رو حفظ کن!${hint}`;
        speak(`به این تصاویر نگاه کن. چند تا ${NUMHUNT_ANIMAL_NAMES[targetSymbol] || 'حیوان'} می‌بینی. جاهاشون رو حفظ کن.`);
    } else {
        targetNumber = cfg.target;
        for (let i = 0; i < cfg.targetCount; i++) arr.push(cfg.target);

        if (lvl >= 4) {
            // L4: اعداد دو رقمی برگشته و شبیه
            while (arr.length < cfg.totalItems) {
                const n = generateNumberL4(targetNumber);
                if (n !== targetNumber) arr.push(n);
            }
            document.getElementById(prefix + '-instruction').innerHTML =
                `<strong>مرحله ۱ - حفظ کن:</strong> بین این عددها ${toFa(cfg.targetCount)} تا <strong>${toFa(cfg.target)}</strong> هست.<br><span style="color:#d63031; font-size:13px;">⚠️ اعداد دو رقمی و شبیه هستن! (هر کلیک اشتباه ${toFa(cfg.penalty)} امتیاز منفی!)</span>`;
        } else {
            while (arr.length < cfg.totalItems) {
                const n = 1 + Math.floor(Math.random() * 9);
                if (n !== cfg.target) arr.push(n);
            }
            document.getElementById(prefix + '-instruction').innerHTML =
                `<strong>مرحله ۱ - حفظ کن:</strong> بین این عددها ${toFa(cfg.targetCount)} تا <strong>${toFa(cfg.target)}</strong> هست.<br><span style="color:#d63031; font-size:13px;">(هر کلیک اشتباه ${toFa(cfg.penalty)} امتیاز منفی!)</span>`;
        }
        arr.sort(() => Math.random() - 0.5);
    }

    numhuntState = {
        key, isJunior, lvl, cfg, prefix,
        arr, targetSymbol, targetNumber,
        hits: 0,
        active: false,
        remainingSec: cfg.timeSec,
        timerId: null
    };

    const grid = document.getElementById(prefix + '-grid');
    grid.innerHTML = '';
    arr.forEach(n => {
        const btn = document.createElement('button');
        btn.className = 'num-btn';
        btn.innerText = n;
        btn.disabled = true;
        grid.appendChild(btn);
    });

    document.getElementById(prefix + '-feedback').innerText = '';
    const startBtn = document.getElementById(prefix + '-start-btn');
    startBtn.style.display = 'block';
    startBtn.onclick = startNumhuntHunt;
    showStaticTimerBar(prefix + '-timer-bar', '#00b894');

    showScreen(GAME_META[key].screen);
    updateGameScore();
}

// L4: تولید اعداد دو رقمی مشابه و برگشته
function generateNumberL4(target) {
    const tens = Math.floor(target / 10);
    const ones = target % 10;
    const pool = [];
    // برگشته (17 -> 71)
    if (ones > 0 && ones * 10 + tens !== target) pool.push(ones * 10 + tens);
    // شروع مشابه (17 -> 12, 13, 14, 15, 16, 18, 19)
    for (let i = 0; i <= 9; i++) {
        if (i !== ones) {
            const n = tens * 10 + i;
            if (n !== target && n >= 10 && n <= 99) pool.push(n);
        }
    }
    // پایان مشابه (17 -> 27, 37, 47, 57, 67, 77, 87, 97)
    for (let i = 1; i <= 9; i++) {
        if (i !== tens) {
            const n = i * 10 + ones;
            if (n !== target && n >= 10 && n <= 99) pool.push(n);
        }
    }
    return pool[Math.floor(Math.random() * pool.length)] || (target + 1);
}

function startNumhuntHunt() {
    if (!numhuntState || numhuntState.active) return;
    numhuntState.active = true;
    gameInProgress = true;

    const { key, isJunior, cfg, prefix, targetSymbol, targetNumber } = numhuntState;
    playSound('click');
    document.getElementById(prefix + '-start-btn').style.display = 'none';
    if (isJunior) speak('حالا شروع کن و اونها رو پیدا کن!');

    const overlay = document.getElementById('interference-overlay');
    const funEmojis = ['🦖', '🚀', '🍕', '🐙', '🦄', '👾', '🎮', '🍩'];
    overlay.innerText = funEmojis[Math.floor(Math.random() * funEmojis.length)];
    overlay.style.display = 'flex';

    gameTimeout(() => {
        if (!numhuntState || !numhuntState.active) { overlay.style.display = 'none'; return; }
        overlay.style.display = 'none';

        if (isJunior) {
            document.getElementById(prefix + '-instruction').innerHTML =
                `<strong>مرحله ۲ - شکار:</strong> روی همه‌ی <strong>${targetSymbol}</strong> کلیک کن!`;
        } else {
            document.getElementById(prefix + '-instruction').innerHTML =
                `<strong>مرحله ۲ - شکار:</strong> روی جای <strong>${toFa(targetNumber)}ها</strong> کلیک کن!`;
        }

        const grid = document.getElementById(prefix + '-grid');
        grid.innerHTML = '';
        numhuntState.arr.forEach(val => {
            const btn = document.createElement('button');
            btn.className = 'num-btn hidden-num';
            btn.innerText = val;
            btn.onclick = () => handleNumhuntClick(btn, val);
            grid.appendChild(btn);
        });

        if (state.noTimerMode) {
            showStaticTimerBar(prefix + '-timer-bar', '#00b894');
        } else {
            startTimerBar(prefix + '-timer-bar', cfg.timeSec * 1000);
            numhuntState.remainingSec = cfg.timeSec;
            clearNumhuntTimer();
            numhuntState.timerId = gameInterval(() => {
                if (isPaused || !numhuntState || !numhuntState.active) return;
                numhuntState.remainingSec--;
                if (numhuntState.remainingSec <= 0) endNumhunt(false);
            }, 1000);
        }
    }, 2000);
}

function clearNumhuntTimer() {
    if (numhuntState && numhuntState.timerId) {
        clearInterval(numhuntState.timerId);
        gameTimers.delete(numhuntState.timerId);
        numhuntState.timerId = null;
    }
}

function handleNumhuntClick(btn, val) {
    if (!numhuntState || !numhuntState.active || btn.disabled || isPaused) return;
    const { isJunior, cfg, prefix, targetSymbol, targetNumber } = numhuntState;
    const fb = document.getElementById(prefix + '-feedback');

    const isTarget = isJunior ? (val === targetSymbol) : (val == targetNumber);

    if (isTarget) {
        playSound('correct');
        if (isJunior) speak('آفرین');
        btn.classList.remove('hidden-num');
        btn.classList.add('correct');
        btn.innerText = '✓';
        currentGameScore += cfg.pointsPerHit;
        numhuntState.hits++;
        fb.style.color = '#27ae60';
        fb.innerText = `🎯 آفرین! ${toFa(numhuntState.hits)} پیدا شد.`;
        updateGameScore();
        btn.disabled = true;
        gameTimeout(() => btn.classList.add('vanish'), 500);

        if (numhuntState.hits === numhuntState.cfg.targetCount) {
            gameTimeout(() => endNumhunt(true), 800);
        }
    } else {
        playSound('wrong');
        if (isJunior) speak('اشتباه بود');
        btn.classList.remove('hidden-num');
        btn.classList.add('wrong');
        btn.innerText = val + ' ✕';
        if (!isJunior) currentGameScore = Math.max(0, currentGameScore - cfg.penalty);
        fb.style.color = '#d63031';
        fb.innerText = '❌ اشتباه بود!';
        updateGameScore();
        btn.disabled = true;
        gameTimeout(() => btn.classList.add('vanish'), 500);

        if (registerWrong()) {
            fb.innerText = '💔 جان تموم شد!';
            return;
        }
    }
}

function endNumhunt(allFound) {
    if (!numhuntState || !numhuntState.active) return;
    numhuntState.active = false;
    gameInProgress = false;
    clearNumhuntTimer();

    const { key, prefix } = numhuntState;
    document.querySelectorAll('#' + prefix + '-grid .num-btn').forEach(b => {
        b.disabled = true;
        gameTimeout(() => b.classList.add('vanish'), 400);
    });

    const fb = document.getElementById(prefix + '-feedback');
    fb.style.color = '#0984e3';
    fb.innerText = allFound ? '🎉 عالی! همه رو پیدا کردی!' : '⏰ زمان تموم شد!';

    const name = GAME_META[key].name;
    const msg = allFound ? 'حافظه فضایی فوق‌العاده‌ای داری!' : 'تمرین باعث میشه دفعه بعد بهتر باشی.';
    gameTimeout(() => endSingleGame(name, msg), 1500);
}

GAME_STARTERS.numhunt_junior = startNumhunt;
GAME_STARTERS.numhunt_senior = startNumhunt;

GAME_PAUSE_HOOKS.numhunt_junior = () => clearNumhuntTimer();
GAME_PAUSE_HOOKS.numhunt_senior = () => clearNumhuntTimer();

GAME_RESUME_HOOKS.numhunt_junior = () => {
    if (!numhuntState || !numhuntState.active || state.noTimerMode) return;
    if (!numhuntState.timerId) {
        numhuntState.timerId = gameInterval(() => {
            if (isPaused || !numhuntState || !numhuntState.active) return;
            numhuntState.remainingSec--;
            if (numhuntState.remainingSec <= 0) endNumhunt(false);
        }, 1000);
    }
};
GAME_RESUME_HOOKS.numhunt_senior = GAME_RESUME_HOOKS.numhunt_junior;