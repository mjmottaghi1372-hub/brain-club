// =====================================================
// GAME: SCATTERMEM (چی کجا بود؟)
// =====================================================

const SCATTER_EMOJIS = ['🍎', '🍌', '🍕', '🍩', '🍭', '🧸', '🚗', '✈️', '⚽', '🎈', '🐱', '🐶'];
const SCATTER_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// L4: جفت‌های مشابه برای گیج‌کردن
const SCATTER_SIMILAR_PAIRS = {
    '🍎': ['🍓', '🍒', '🍅'],
    '🍓': ['🍎', '🍒', '🍅'],
    '🍒': ['🍎', '🍓', '🍅'],
    '🍌': ['🍋', '🍍', '🌽'],
    '🍕': ['🥧', '🍰', '🍔'],
    '🍩': ['🥯', '🍪', '🧁'],
    '🍭': ['🍬', '🍫', '🍡'],
    '🧸': ['🐻', '🐨', '🦝'],
    '🚗': ['🚙', '🚕', '🚌'],
    '✈️': ['🛩️', '🚁', '🚀'],
    '⚽': ['🏀', '🏈', '🎾'],
    '🎈': ['🎀', '🎁', '🎊'],
    '🐱': ['🐯', '🐈', '🦁'],
    '🐶': ['🐺', '🐕', '🦊'],
    '1': ['7', '4', '9'],
    '2': ['7', '3', '5'],
    '3': ['8', '5', '2'],
    '4': ['1', '9', '7'],
    '5': ['6', '3', '2'],
    '6': ['5', '9', '8'],
    '7': ['1', '4', '2'],
    '8': ['3', '6', '9'],
    '9': ['6', '4', '7']
};

let scattermemState = null;

function startScattermem() {
    const key = currentGame;
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const prefix = GAME_META[key].prefix;

    currentGameScore = 0;
    gameInProgress = false;

    scattermemState = {
        key, cfg, lvl, prefix,
        targets: [],
        questions: [],
        currentQ: 0,
        active: false
    };

    const area = document.getElementById(prefix + '-area');
    // حالت اولیه: به جای تصاویر، یه صفحه آماده‌باش نشون میدیم
    area.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%; font-size:24px; color:#b2bec3; font-weight:700;">آماده‌ای؟ 🤔</div>';
    area.style.display = 'block';
    document.getElementById(prefix + '-question-area').style.display = 'none';
    document.getElementById(prefix + '-instruction').innerText = 'برای دیدن تصاویر، روی دکمه زیر بزن.';
    document.getElementById(prefix + '-status').innerText = 'آماده';
    
    const startBtn = document.getElementById(prefix + '-start-btn');
    startBtn.style.display = 'block';
    startBtn.innerText = 'شروع کن 🚀';

    const emojis = [...SCATTER_EMOJIS].sort(() => Math.random() - 0.5);
    const nums = [...SCATTER_NUMBERS].sort(() => Math.random() - 0.5);

    const items = [];
    for (let i = 0; i < cfg.itemsCount; i++) {
        if (i % 2 === 0 && nums.length > 0) items.push({ type: 'num', val: nums.pop() });
        else if (emojis.length > 0) items.push({ type: 'emoji', val: emojis.pop() });
    }

    const cols = Math.ceil(Math.sqrt(cfg.itemsCount + 2));
    const rows = Math.ceil((cfg.itemsCount + 2) / cols);
    const cells = Array.from({ length: cols * rows }, (_, i) => i).sort(() => Math.random() - 0.5);

    // موقعیت‌ها رو از الان مشخص می‌کنیم و توی state ذخیره می‌کنیم
    items.forEach((item, idx) => {
        const cell = cells[idx];
        const col = cell % cols;
        const row = Math.floor(cell / cols);
        const cellW = 80 / cols, cellH = 80 / rows;
        const top = 8 + (row * cellH) + (Math.random() * cellH * 0.5);
        const left = 8 + (col * cellW) + (Math.random() * cellW * 0.5);
        
        scattermemState.targets.push({
            ...item,
            top: Math.min(85, top) + '%',
            left: Math.min(78, left) + '%'
        });
    });

    generateScatterQuestions(cfg, lvl);
    showScreen(GAME_META[key].screen);
    updateGameScore();
}

function runScatterGame() {
    if (!scattermemState) return;
    const { cfg, prefix } = scattermemState;

    playSound('click');
    gameInProgress = true;
    scattermemState.active = true;

    document.getElementById(prefix + '-start-btn').style.display = 'none';
    document.getElementById(prefix + '-instruction').innerText = 'خوب نگاه کن... 👀';
    document.getElementById(prefix + '-status').innerText = 'نمایش...';
    
    // ===== رندر کردن تصاویر در لحظه شروع =====
    const area = document.getElementById(prefix + '-area');
    area.innerHTML = '';
    scattermemState.targets.forEach(item => {
        const el = document.createElement('div');
        el.className = 'scatter-item';
        el.innerText = item.val;
        el.style.top = item.top;
        el.style.left = item.left;
        area.appendChild(el);
    });

    speak('خوب به این تصاویر نگاه کن.');

    // پنهان کردن تصاویر بعد از زمان مشخص شده
    gameTimeout(() => {
        if (!scattermemState || !scattermemState.active) return;
        document.getElementById(prefix + '-area').innerHTML =
            '<div style="display:flex; justify-content:center; align-items:center; height:100%; font-size:24px; color:#b2bec3; font-weight:700;">پنهان شد! 🙈</div>';
        document.getElementById(prefix + '-instruction').innerText = 'حالا به سوالات جواب بده:';
        document.getElementById(prefix + '-question-area').style.display = 'block';
        showScatterQuestion();
    }, cfg.showMs);
}

function generateScatterQuestions(cfg, lvl) {
    const questions = [];
    const onScreenVals = scattermemState.targets.map(t => t.val);
    const allPossible = [...SCATTER_EMOJIS, ...SCATTER_NUMBERS];
    const notOnScreen = allPossible.filter(x => !onScreenVals.includes(x));

    // Q1: کدام در صفحه بود؟
    const target1 = onScreenVals[Math.floor(Math.random() * onScreenVals.length)];
    let wrong1;
    if (lvl >= 4 && SCATTER_SIMILAR_PAIRS[target1]) {
        wrong1 = [...SCATTER_SIMILAR_PAIRS[target1]].sort(() => Math.random() - 0.5).slice(0, 3);
    } else {
        wrong1 = [...notOnScreen].sort(() => Math.random() - 0.5).slice(0, 3);
    }
    questions.push({
        text: 'کدام یک از این‌ها در صفحه بود؟',
        options: [target1, ...wrong1].sort(() => Math.random() - 0.5),
        answer: target1
    });

    // Q2: کدام در صفحه نبود؟
    if (cfg.questions >= 2 && notOnScreen.length > 0) {
        const target2 = notOnScreen[Math.floor(Math.random() * notOnScreen.length)];
        let wrong2;
        if (lvl >= 4) {
            const similarOnScreen = onScreenVals.filter(v => SCATTER_SIMILAR_PAIRS[v] && SCATTER_SIMILAR_PAIRS[v].includes(target2));
            wrong2 = similarOnScreen.length > 0
                ? [...similarOnScreen].slice(0, 3)
                : [...onScreenVals].sort(() => Math.random() - 0.5).slice(0, 3);
        } else {
            wrong2 = [...onScreenVals].sort(() => Math.random() - 0.5).slice(0, 3);
        }
        while (wrong2.length < 3) {
            const extra = onScreenVals.find(v => !wrong2.includes(v));
            if (!extra) break;
            wrong2.push(extra);
        }
        questions.push({
            text: 'کدام یک از این‌ها در صفحه نبود؟',
            options: [target2, ...wrong2.slice(0, 3)].sort(() => Math.random() - 0.5),
            answer: target2
        });
    }

    // Q3: چه عددی در صفحه بود؟
    if (cfg.questions >= 3) {
        const numsOnScreen = scattermemState.targets.filter(t => t.type === 'num');
        if (numsOnScreen.length > 0) {
            const targetNum = numsOnScreen[0].val;
            let wrongNums;
            if (lvl >= 4 && SCATTER_SIMILAR_PAIRS[targetNum]) {
                wrongNums = [...SCATTER_SIMILAR_PAIRS[targetNum]].sort(() => Math.random() - 0.5).slice(0, 3);
            } else {
                wrongNums = SCATTER_NUMBERS.filter(n => !onScreenVals.includes(n))
                    .sort(() => Math.random() - 0.5).slice(0, 3);
            }
            questions.push({
                text: 'چه عددی در صفحه وجود داشت؟',
                options: [targetNum, ...wrongNums].sort(() => Math.random() - 0.5),
                answer: targetNum
            });
        }
    }

    // Q4: در کل چند مورد بود؟
    if (cfg.questions >= 4) {
        const totalCount = scattermemState.targets.length;
        let options = [totalCount, totalCount + 1, totalCount - 1, totalCount + 2].filter(c => c > 0);
        options = [...new Set(options)].slice(0, 4);
        questions.push({
            text: 'در کل چند مورد در صفحه بود؟',
            options: options.sort(() => Math.random() - 0.5).map(String),
            answer: String(totalCount)
        });
    }

    scattermemState.questions = questions.slice(0, cfg.questions);
}

function showScatterQuestion() {
    if (!scattermemState) return;
    const { prefix, cfg, questions } = scattermemState;

    if (scattermemState.currentQ >= questions.length) {
        scattermemState.active = false;
        gameInProgress = false;
        endSingleGame(GAME_META[scattermemState.key].name, 'حافظه فضایی و اتصال ویژگی‌ها رو تمرین کردی!');
        return;
    }

    document.getElementById(prefix + '-status').innerText =
        `سوال ${toFa(scattermemState.currentQ + 1)} از ${toFa(questions.length)}`;
    const q = questions[scattermemState.currentQ];
    document.getElementById(prefix + '-q-text').innerText = q.text;

    const container = document.getElementById(prefix + '-q-options');
    container.innerHTML = '';
    let answered = false;

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'q-option';
        btn.innerText = opt;
        btn.onclick = () => {
            if (answered) return;
            answered = true;
            const fb = document.getElementById(prefix + '-feedback');
            const isCorrect = opt === q.answer;

            if (isCorrect) {
                playSound('correct');
                btn.classList.add('correct');
                currentGameScore += cfg.points / questions.length;
                fb.style.color = '#27ae60';
                fb.innerText = '✅ درست بود!';
                updateGameScore();
                gameTimeout(() => {
                    if (!scattermemState) return;
                    document.getElementById(prefix + '-feedback').innerText = '';
                    scattermemState.currentQ++;
                    showScatterQuestion();
                }, 1500);
            } else {
                playSound('wrong');
                btn.classList.add('wrong');
                fb.style.color = '#d63031';
                fb.innerText = '❌ اشتباه بود.';
                updateGameScore();
                if (registerWrong()) {
                    fb.innerText = '💔 جان تموم شد!';
                    return;
                }
                gameTimeout(() => {
                    if (!scattermemState) return;
                    document.getElementById(prefix + '-feedback').innerText = '';
                    scattermemState.currentQ++;
                    showScatterQuestion();
                }, 1500);
            }
        };
        container.appendChild(btn);
    });
}

GAME_STARTERS.scattermem = startScattermem;