// =====================================================
// GAME: MEMORY (multi-phase)
// =====================================================

const MEMORY_EMOJI_POOL = ['⌚', '👕', '👟', '🧤', '🎩', '👓', '🥾', '🎒', '🕶️', '☂️', '🔑', '📚', '✏️', '🎈', '🎁', '🚗'];

let memoryState = null;
let memoryIntroSeen = false;

function startMemory() {
    const key = currentGame;
    const lvl = getLevel(key);
    const cfg = GAME_CONFIGS[key][lvl];
    const prefix = GAME_META[key].prefix;

    currentGameScore = 0;
    gameInProgress = false;

    const shuffled = [...MEMORY_EMOJI_POOL].sort(() => Math.random() - 0.5);
    const visuals = shuffled.slice(0, cfg.visCount);

    let nums = (1 + Math.floor(Math.random() * 9)).toString();
    for (let i = 1; i < cfg.numDigits; i++) nums += Math.floor(Math.random() * 10).toString();

    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 5) + 2;

    memoryState = {
        key, lvl, cfg, prefix,
        visuals,
        numbers: nums,
        mathA: a, mathB: b, mathAns: a + b, mathC: 0,
        phase: 'intro'
    };

    ['intro', 'visuals', 'numbers', 'interference', 'recall-numbers', 'recall-visuals'].forEach(p => {
        const el = document.getElementById(prefix + '-' + p);
        if (el) el.style.display = 'none';
    });

    document.getElementById(prefix + '-feedback').innerText = '';
    document.getElementById(prefix + '-status').innerText = 'توضیحات';

    showScreen(GAME_META[key].screen);
    updateGameScore();

    if (!memoryIntroSeen) {
        memoryIntroSeen = true;
        memoryState.phase = 'intro';
        document.getElementById(prefix + '-intro').style.display = 'block';
    } else {
        startMemoryVisuals();
    }
}

function startMemoryVisuals() {
    if (!memoryState) return;
    const { cfg, prefix, visuals } = memoryState;
    gameInProgress = true;
    memoryState.phase = 'visuals';

    playSound('click');
    ['intro', 'numbers', 'interference', 'recall-numbers', 'recall-visuals'].forEach(p => {
        const el = document.getElementById(prefix + '-' + p);
        if (el) el.style.display = 'none';
    });
    document.getElementById(prefix + '-visuals').style.display = 'block';
    document.getElementById(prefix + '-status').innerText = 'مرحله ۱ از ۴';

    const display = document.getElementById(prefix + '-display');
    display.innerHTML = '';
    visuals.forEach(v => {
        const span = document.createElement('span');
        span.innerText = v;
        display.appendChild(span);
    });
    speak('این تصاویر رو به خاطر بسپار.');

    const btn = document.getElementById(prefix + '-btn-to-numbers');
    btn.style.display = 'none';
    gameTimeout(() => {
        if (memoryState && memoryState.phase === 'visuals') btn.style.display = 'block';
    }, cfg.showMs);
}

function startMemoryNumbers() {
    if (!memoryState) return;
    const { cfg, prefix, numbers } = memoryState;
    memoryState.phase = 'numbers';
    playSound('click');

    document.getElementById(prefix + '-visuals').style.display = 'none';
    document.getElementById(prefix + '-numbers').style.display = 'block';
    document.getElementById(prefix + '-status').innerText = 'مرحله ۲ از ۴';

    const display = document.getElementById(prefix + '-numbers-display');
    display.innerHTML = numbers.split('').map(d => `<span>${d}</span>`).join('');

    const btn = document.getElementById(prefix + '-btn-to-interference');
    btn.style.display = 'none';
    gameTimeout(() => {
        if (memoryState && memoryState.phase === 'numbers') btn.style.display = 'block';
    }, cfg.showMs);
}

function startMemoryInterference() {
    if (!memoryState) return;
    memoryState.phase = 'interference';
    playSound('click');

    const { prefix, mathA, mathB, lvl } = memoryState;
    document.getElementById(prefix + '-numbers').style.display = 'none';
    document.getElementById(prefix + '-interference').style.display = 'block';
    document.getElementById(prefix + '-status').innerText = 'مرحله ۳ از ۴';

    if (lvl >= 4) {
        // L4: سوال سه‌جمعی + مداخله حرکتی بعدی
        const c = Math.floor(Math.random() * 5) + 2;
        memoryState.mathC = c;
        memoryState.mathAns = mathA + mathB + c;
        document.getElementById(prefix + '-math-q').innerHTML =
            `${toFa(mathA)} + ${toFa(mathB)} + ${toFa(c)} = ?<br><span style="font-size:14px; color:#d63031; font-weight:600;">(بعدش باید ۵ بار کلیک کنی!)</span>`;
    } else {
        document.getElementById(prefix + '-math-q').innerText = `${toFa(mathA)} + ${toFa(mathB)} = ?`;
    }
    document.getElementById(prefix + '-math-answer').value = '';
    document.getElementById(prefix + '-math-answer').focus();
}

function checkMemoryMath() {
    if (!memoryState) return;
    const { prefix, mathAns, lvl } = memoryState;
    const input = document.getElementById(prefix + '-math-answer');
    const ans = parseInt(fromFa(input.value), 10);
    
    if (ans === mathAns) {
        playSound('correct');
        if (lvl >= 4) {
            showMemoryMotorInterference();
        } else {
            goToMemoryNumberRecall();
        }
    } else {
        playSound('wrong');
        input.style.borderColor = '#d63031';
        input.value = '';
        input.focus();
        showMascotMessage('دوباره حساب کن! 🧮', 2500);
        
        setTimeout(() => { input.style.borderColor = '#b2bec3'; }, 1000);

        if (registerWrong()) {
            const fb = document.getElementById(prefix + '-feedback');
            fb.style.color = '#d63031';
            fb.innerText = '💔 جان تموم شد!';
            return;
        }
    }
}

function showMemoryMotorInterference() {
    let clicks = 0;
    const targetClicks = 5;
    const body = `
        <p style="text-align:center; font-weight:700; margin-top:0;">سریع ${toFa(targetClicks)} بار روی دکمه کلیک کن:</p>
        <div style="text-align:center; margin:15px 0;">
            <button id="motor-btn-l4" style="font-size:40px; width:100px; height:100px; border-radius:50%; background:#00b894; color:white; border:none; cursor:pointer; font-family:inherit; display:inline-flex; align-items:center; justify-content:center;">👆</button>
        </div>
        <p id="motor-count-l4" style="text-align:center; font-weight:700; color:#636e72;">۰ بار کلیک شده</p>
    `;
    showModal('✋ مداخله حرکتی', body, []);
    setTimeout(() => {
        const btn = document.getElementById('motor-btn-l4');
        const countEl = document.getElementById('motor-count-l4');
        if (btn) {
            btn.onclick = () => {
                clicks++;
                playSound('click');
                countEl.innerText = `${toFa(clicks)} بار کلیک شده`;
                if (clicks >= targetClicks) {
                    playSound('correct');
                    closeModal();
                    goToMemoryNumberRecall();
                }
            };
        }
    }, 100);
}

function goToMemoryNumberRecall() {
    if (!memoryState) return;
    const { prefix } = memoryState;
    document.getElementById(prefix + '-interference').style.display = 'none';
    document.getElementById(prefix + '-recall-numbers').style.display = 'block';
    document.getElementById(prefix + '-status').innerText = 'مرحله ۴ از ۴';
    memoryState.phase = 'recall-numbers';
    document.getElementById(prefix + '-user-ans').value = '';
    document.getElementById(prefix + '-user-ans').focus();
}

function checkMemoryNumbers() {
    if (!memoryState) return;
    const { prefix, cfg, numbers } = memoryState;
    const input = document.getElementById(prefix + '-user-ans');
    const ans = fromFa(input.value).replace(/[^0-9]/g, '');
    const fb = document.getElementById(prefix + '-feedback');

    if (ans === numbers) {
        playSound('correct');
        currentGameScore += cfg.points / 2;
        fb.style.color = '#27ae60';
        fb.innerText = '✅ اعداد درست بود!';
        updateGameScore();
        gameTimeout(() => {
            if (!memoryState) return;
            document.getElementById(prefix + '-recall-numbers').style.display = 'none';
            document.getElementById(prefix + '-recall-visuals').style.display = 'block';
            fb.innerText = '';
            showMemoryVisualOptions();
        }, 2000);
    } else {
        playSound('wrong');
        fb.style.color = '#d63031';
        fb.innerText = '❌ اعداد اشتباه بود.';
        updateGameScore();
        if (registerWrong()) {
            fb.innerText = '💔 جان تموم شد!';
            return;
        }
        gameTimeout(() => {
            if (!memoryState) return;
            document.getElementById(prefix + '-recall-numbers').style.display = 'none';
            document.getElementById(prefix + '-recall-visuals').style.display = 'block';
            fb.innerText = '';
            showMemoryVisualOptions();
        }, 2000);
    }
}

function showMemoryVisualOptions() {
    if (!memoryState) return;
    memoryState.phase = 'recall-visuals';
    const { prefix, cfg, visuals } = memoryState;

    const correct = visuals[Math.floor(Math.random() * visuals.length)];
    const wrongs = MEMORY_EMOJI_POOL.filter(e => !visuals.includes(e))
        .sort(() => Math.random() - 0.5).slice(0, 3);
    const allOpts = [correct, ...wrongs].sort(() => Math.random() - 0.5);

    speak('کدوم یکی از این تصاویر رو دیدی؟');

    const container = document.getElementById(prefix + '-options');
    container.innerHTML = '';
    let answered = false;

    allOpts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'mem-opt-btn';
        btn.innerText = opt;
        btn.onclick = () => {
            if (answered) return;
            answered = true;
            document.querySelectorAll('#' + prefix + '-options .mem-opt-btn').forEach(b => b.disabled = true);

            if (opt === correct) {
                playSound('correct');
                btn.classList.add('correct');
                currentGameScore += cfg.points / 2;
                updateGameScore();
                gameInProgress = false;
                gameTimeout(() => {
                    if (memoryState) endSingleGame(GAME_META[memoryState.key].name, 'حافظه کاری تو فوق‌العاده است!');
                }, 1500);
            } else {
                playSound('wrong');
                btn.classList.add('wrong');
                document.querySelectorAll('#' + prefix + '-options .mem-opt-btn').forEach(b => {
                    if (b.innerText === correct) b.classList.add('correct');
                });
                updateGameScore();
                if (registerWrong()) {
                    return;
                }
                gameInProgress = false;
                gameTimeout(() => {
                    if (memoryState) endSingleGame(GAME_META[memoryState.key].name, 'حافظه کاری تو فوق‌العاده است!');
                }, 1500);
            }
        };
        container.appendChild(btn);
    });
}

GAME_STARTERS.memory = startMemory;