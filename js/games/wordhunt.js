// =====================================================
// GAME: WORDHUNT (junior: میوه/حیوان | senior: کلمات)
// =====================================================

const WH_FRUITS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍍'];
const WH_ANIMALS_EMOJI = ['🐱', '🐶', '🐰', '🐻', '🦊', '🐸', '🐷'];
const WH_RED_FRUITS = ['🍎', '🍓', '🍒'];

const WH_JUNIOR_POOL = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍍', '🚗', '🚀', '⚽', '🎈', '🐱', '🐶', '🌻', '🍕', '🐰', '🐻', '🦊'];

// L4: میوه‌های نزدیک به قرمز (گیج‌کننده)
const WH_RED_SIMILAR_POOL = [
    '🍎', '🍓', '🍒',           // هدف‌های واقعی
    '🍅', '🍑', '🌶️', '🍉',       // نزدیک به قرمز
    '🥩', '🍟', '🥫', '🎈', '🚗', '🏀'  // قرمزهای دیگر
];

const WH_ANIMALS_WORDS = ['میمون', 'گربه', 'شیر', 'خرس', 'اسب', 'ماهی', 'پلنگ', 'گرگ', 'روباه', 'زنبور', 'عقاب', 'دلفین', 'خرگوش', 'آهو'];
const WH_ALL_WORDS = ['میمون', 'کتاب', 'سیب', 'گربه', 'پنجره', 'شیر', 'دفتر', 'خرس', 'میز', 'ماهی', 'توپ', 'اسب', 'پلنگ', 'درخت', 'گرگ', 'قفل', 'روباه', 'زنبور', 'خانه', 'عقاب', 'دلفین', 'کفش', 'برگ', 'خرگوش', 'آب', 'قاشق', 'نور', 'شمع', 'موز', 'لیوان', 'آهو', 'مدرسه', 'دریا'];

// L4: کلمات با یک حرف فرق (نزدیک به هم)
const WH_SIMILAR_LETTER_PAIRS = {
    'کتاب': ['کباب', 'حساب', 'شتاب', 'سحاب'],
    'سیب': ['سیب', 'تیر', 'شیر', 'پیر'],
    'شیر': ['شیر', 'سیر', 'تیر', 'پیر'],
    'برگ': ['برگ', 'مرگ', 'بزرگ', 'بنگ'],
    'قفل': ['قفل', 'نقل', 'عقل', 'فقل'],
    'نور': ['نور', 'دور', 'زور', 'سور'],
    'میز': ['میز', 'ریز', 'نیز', 'خیز'],
    'توپ': ['توپ', 'توت', 'توب', 'نوپ'],
    'دفتر': ['دفتر', 'دفتری', 'دفتر', 'بستر'],
    'قاشق': ['قاشق', 'عاشق', 'فاشق', 'قشق'],
    'دریا': ['دریا', 'دنیا', 'درید', 'دری'],
    'ماهی': ['ماهی', 'مایه', 'مادی', 'ماهی'],
    'پنجره': ['پنجره', 'پنجر', 'پنجری', 'پنچره']
};

let wordhuntState = null;

function startWordhunt() {
    const key = currentGame;
    const isJunior = key === 'wordhunt_junior';
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const prefix = GAME_META[key].prefix;

    currentGameScore = 0;
    gameInProgress = true;

    let isTargetFunc;
    let instructionText;

    if (isJunior) {
        if (cfg.type === 'fruit') {
            instructionText = 'فقط روی <strong>میوه‌ها</strong> کلیک کن! 🍎🍌';
            speak('فقط روی میوه ها کلیک کن!');
            isTargetFunc = (item) => WH_FRUITS.includes(item);
        } else if (cfg.type === 'animal') {
            instructionText = 'فقط روی <strong>حیوانات</strong> کلیک کن! 🐱🐶';
            speak('فقط روی حیوانات کلیک کن!');
            isTargetFunc = (item) => WH_ANIMALS_EMOJI.includes(item);
        } else if (cfg.type === 'redfruit') {
            instructionText = 'فقط روی میوه‌های <strong>قرمز</strong> کلیک کن! 🍎🍓🍒';
            speak('فقط روی میوه های قرمز کلیک کن!');
            isTargetFunc = (item) => WH_RED_FRUITS.includes(item);
        } else if (cfg.type === 'redfruit_similar') {
            instructionText = 'فقط روی میوه‌های <strong>قرمز</strong> کلیک کن!<br><span style="color:#d63031; font-size:13px;">⚠️ بعضی چیزهای دیگه هم قرمز یا نزدیک قرمزن!</span>';
            speak('فقط روی میوه های قرمز کلیک کن. مراقب باش!');
            isTargetFunc = (item) => WH_RED_FRUITS.includes(item);
        }
    } else {
        if (cfg.type === 'animal') {
            instructionText = 'فقط روی اسم <strong>حیوانات</strong> کلیک کن! 🐾';
            isTargetFunc = (w) => WH_ANIMALS_WORDS.includes(w);
        } else if (cfg.type === 'letter') {
            instructionText = 'فقط روی کلماتی کلیک کن که حرف <strong>«د»</strong> یا <strong>«ر»</strong> دارند!';
            isTargetFunc = (w) => w.includes('د') || w.includes('ر');
        } else if (cfg.type === 'dual') {
            instructionText = 'فقط روی اسم <strong>حیواناتی</strong> کلیک کن که حرف <strong>«ر»</strong> دارند!';
            isTargetFunc = (w) => WH_ANIMALS_WORDS.includes(w) && w.includes('ر');
        } else if (cfg.type === 'similar_letter') {
            instructionText = 'فقط روی کلماتی کلیک کن که حرف <strong>«ر»</strong> دارند!<br><span style="color:#d63031; font-size:13px;">⚠️ دقت کن! بعضی کلمات شبیه هستن ولی «ر» ندارن!</span>';
            isTargetFunc = (w) => w.includes('ر');
        }
    }

    document.getElementById(prefix + '-instruction').innerHTML = instructionText;

    let arr;
    if (isJunior) {
        let pool;
        if (cfg.type === 'redfruit_similar') {
            pool = WH_RED_SIMILAR_POOL;
        } else {
            pool = WH_JUNIOR_POOL;
        }
        arr = [...pool].sort(() => Math.random() - 0.5).slice(0, cfg.gridSize);
        const cnt = arr.filter(isTargetFunc).length;
        if (cnt < 3) {
            const targets = (cfg.type === 'redfruit' || cfg.type === 'redfruit_similar') ? WH_RED_FRUITS :
                            cfg.type === 'animal' ? WH_ANIMALS_EMOJI : WH_FRUITS;
            for (let i = 0; i < 3 - cnt && i < targets.length; i++) arr[i] = targets[i];
            arr.sort(() => Math.random() - 0.5);
        }
    } else {
        if (cfg.type === 'similar_letter') {
            // L4: ساخت pool کلمات با یک حرف فرق
            const similarPool = [];
            const targetWords = Object.keys(WH_SIMILAR_LETTER_PAIRS).filter(w => w.includes('ر'));
            const nonTargetWords = Object.keys(WH_SIMILAR_LETTER_PAIRS).filter(w => !w.includes('ر'));
            targetWords.forEach(w => similarPool.push(w));
            targetWords.forEach(w => {
                WH_SIMILAR_LETTER_PAIRS[w].forEach(v => { if (v !== w) similarPool.push(v); });
            });
            nonTargetWords.forEach(w => similarPool.push(w));
            arr = [...similarPool].sort(() => Math.random() - 0.5).slice(0, cfg.gridSize);

            const cnt = arr.filter(isTargetFunc).length;
            if (cnt < 3) {
                const extra = targetWords.filter(w => !arr.includes(w));
                for (let i = 0; i < 3 - cnt && i < extra.length; i++) arr[i] = extra[i];
                arr.sort(() => Math.random() - 0.5);
            }
        } else {
            arr = [...WH_ALL_WORDS].sort(() => Math.random() - 0.5).slice(0, cfg.gridSize);
            const cnt = arr.filter(isTargetFunc).length;
            if (cnt < 3) {
                const extra = WH_ALL_WORDS.filter(w => isTargetFunc(w) && !arr.includes(w));
                for (let i = 0; i < 3 - cnt && i < extra.length; i++) arr[i] = extra[i];
                arr.sort(() => Math.random() - 0.5);
            }
        }
    }

    wordhuntState = {
        key, isJunior, cfg, prefix,
        isTargetFunc,
        totalTargets: arr.filter(isTargetFunc).length,
        found: 0,
        timerId: null,
        active: true,
        remainingSec: cfg.timeSec
    };

    const grid = document.getElementById(prefix + '-grid');
    grid.innerHTML = '';
    arr.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'word-btn';
        btn.innerText = item;
        if (!isJunior) btn.classList.add('text-mode');
        btn.onclick = () => handleWordhuntClick(btn, item);
        grid.appendChild(btn);
    });

    document.getElementById(prefix + '-feedback').innerText = '';

    if (state.noTimerMode) {
        showStaticTimerBar(prefix + '-timer-bar', '#00b894');
    } else {
        startTimerBar(prefix + '-timer-bar', cfg.timeSec * 1000);
        clearWordhuntTimer();
        wordhuntState.timerId = gameInterval(() => {
            if (isPaused || !wordhuntState || !wordhuntState.active) return;
            wordhuntState.remainingSec--;
            if (wordhuntState.remainingSec <= 0) endWordhunt();
        }, 1000);
    }

    showScreen(GAME_META[key].screen);
    updateGameScore();
}

function clearWordhuntTimer() {
    if (wordhuntState && wordhuntState.timerId) {
        clearInterval(wordhuntState.timerId);
        gameTimers.delete(wordhuntState.timerId);
        wordhuntState.timerId = null;
    }
}

function handleWordhuntClick(btn, item) {
    if (!wordhuntState || !wordhuntState.active || btn.disabled || isPaused) return;
    const { key, isJunior, cfg, prefix, isTargetFunc } = wordhuntState;

    if (isTargetFunc(item)) {
        playSound('correct');
        btn.classList.add('correct');
        currentGameScore += cfg.points;
        wordhuntState.found++;
        const fb = document.getElementById(prefix + '-feedback');
        fb.style.color = '#27ae60';
        fb.innerText = '✅ درست بود!';

        if (wordhuntState.found === wordhuntState.totalTargets) {
            clearWordhuntTimer();
            gameInProgress = false;
            updateGameScore();
            btn.disabled = true;
            gameTimeout(() => btn.classList.add('vanish'), 400);
            gameTimeout(() => endSingleGame(GAME_META[key].name, 'سرعت پردازش و دقتت فوق‌العاده بود!'), 700);
            return;
        }
    } else {
        playSound('wrong');
        btn.classList.add('wrong');
        if (!isJunior) currentGameScore = Math.max(0, currentGameScore - 5);
        const fb = document.getElementById(prefix + '-feedback');
        fb.style.color = '#d63031';
        fb.innerText = '❌ اشتباه بود!';
        updateGameScore();
        btn.disabled = true;
        gameTimeout(() => btn.classList.add('vanish'), 400);

        if (registerWrong()) {
            fb.innerText = '💔 جان تموم شد!';
            return;
        }
        return;
    }
    updateGameScore();
    btn.disabled = true;
    gameTimeout(() => btn.classList.add('vanish'), 400);
}

function endWordhunt() {
    if (!wordhuntState || !wordhuntState.active) return;
    wordhuntState.active = false;
    gameInProgress = false;
    clearWordhuntTimer();
    const { key, prefix } = wordhuntState;
    document.querySelectorAll('#' + prefix + '-grid .word-btn').forEach(b => b.disabled = true);
    gameTimeout(() => endSingleGame(GAME_META[key].name, 'سرعت پردازش و دقتت رو بسنج!'), 1000);
}

GAME_STARTERS.wordhunt_junior = startWordhunt;
GAME_STARTERS.wordhunt_senior = startWordhunt;

GAME_PAUSE_HOOKS.wordhunt_junior = () => clearWordhuntTimer();
GAME_PAUSE_HOOKS.wordhunt_senior = () => clearWordhuntTimer();

GAME_RESUME_HOOKS.wordhunt_junior = () => {
    if (!wordhuntState || !wordhuntState.active || state.noTimerMode) return;
    if (!wordhuntState.timerId) {
        wordhuntState.timerId = gameInterval(() => {
            if (isPaused || !wordhuntState || !wordhuntState.active) return;
            wordhuntState.remainingSec--;
            if (wordhuntState.remainingSec <= 0) endWordhunt();
        }, 1000);
    }
};
GAME_RESUME_HOOKS.wordhunt_senior = GAME_RESUME_HOOKS.wordhunt_junior;