// =====================================================
// NAVIGATION - منوی دسته‌بندی‌شده با Lucide
// =====================================================

let isNavigatingBack = false;
let currentDomainFilter = 'all';

function showScreen(id) {
    // ۱. پنهان کردن صفحه‌های قبلی
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.opacity = '0'; // برای اطمینان از اینکه فوراً پنهان می‌شود
    });
    
    // ۲. صبر کردن تا مرورگر آماده شود (با requestAnimationFrame)
    requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
            el.style.opacity = ''; // پاک کردن استایل اینلاین تا CSS کار کند
            el.classList.add('active');
            
            updateMascotVisibility();
            if (typeof refreshIcons === 'function') refreshIcons();
        }
    });
}

function handlePopState() {
    const activeScreen = document.querySelector('.screen.active')?.id || '';
    if (activeScreen === 'screen-menu') {
        history.pushState({ page: 'menu' }, '');
        return;
    }
    if (gameActive) {
        history.pushState({ page: 'game' }, '');
        requestExit();
    } else {
        isNavigatingBack = true;
        goToMenu();
        isNavigatingBack = false;
        history.pushState({ page: 'menu' }, '');
    }
}

function goToMenu() {
    window.isInDailyWorkout = false; // <--- این خط اضافه شود
    closeModal();
    updateStreak();
    if (!isNavigatingBack) history.pushState({ page: 'menu' }, '');
    clearAllGameTimers();
    gameActive = false;
    gameInProgress = false;
    isPaused = false;
    document.getElementById('pause-overlay').style.display = 'none';
    document.getElementById('interference-overlay').style.display = 'none';
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    showScreen('screen-menu');
    updateMenuDisplay();
}

function updateMenuDisplay() {
    document.getElementById('menu-total-score').innerText = toFa(state.totalScore);

    const streakVal = document.getElementById('streak-value');
    if (streakVal) streakVal.innerText = toFa(state.streak || 0);

    const notimerBtn = document.getElementById('notimer-btn');
    if (notimerBtn) notimerBtn.classList.toggle('active', state.noTimerMode);

    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) {
        soundBtn.innerHTML = state.soundEnabled
            ? '<i data-lucide="volume-2"></i>'
            : '<i data-lucide="volume-x"></i>';
    }

    renderDailyWorkoutCard(); // <--- اضافه شد
    renderLumosityGrid();
    refreshIcons();

    setTimeout(() => {
        if (pendingStreakMessage) {
            showMascotMessage(pendingStreakMessage, 4000);
            pendingStreakMessage = null;
        } else {
            showMascotMessage('یه بازی انتخاب کن! 🎮', 3000);
        }
    }, 500);
}

// تابع جدید برای ساخت منوی لوموسیتی
function renderLumosityGrid() {
    const container = document.getElementById('menu-games-grid');
    if (!container) return;
    container.innerHTML = '';

    // ترتیب نمایش دامنه‌ها (دقیقاً مثل لوموسیتی)
    const domainOrder = ['working_memory', 'attention', 'processing_speed', 'flexibility', 'problem_solving'];

    domainOrder.forEach(domainKey => {
        const domain = DOMAINS[domainKey];
        const gamesInDomain = GAME_KEYS.filter(k => GAME_META[k].domain === domainKey);
        
        // اگه دامنه‌ای فعلاً بازی نداره، نمایش داده نشه
        if (gamesInDomain.length === 0) return;

        // ۱. ساخت هدر دامنه
        const section = document.createElement('div');
        section.className = 'domain-section';
        
        const header = document.createElement('div');
        header.className = 'domain-header';
        header.innerHTML = `
            <i data-lucide="${domain.icon}" style="color:${domain.color};"></i>
            <span>${domain.name}</span>
        `;
        section.appendChild(header);

        // ۲. ساخت کارت‌های این دامنه
        gamesInDomain.forEach(key => {
            const meta = GAME_META[key];
            const lvl = getLevel(key);
            const best = getBest(key);
            const maxCfg = GAME_CONFIGS[key][4];
            const isMaxed = lvl === 4 && best >= maxCfg.threshold;

            const card = document.createElement('button');
            card.className = 'game-card-lumo';
            card.style.setProperty('--domain-color', domain.color);
            card.style.setProperty('--domain-bg', domain.bgColor);
            
            card.innerHTML = `
                <div class="lumo-card-img">
                    <i data-lucide="${meta.icon}"></i>
                </div>
                <div class="lumo-card-info">
                    <div class="lumo-card-title">${meta.name}</div>
                    <div class="lumo-card-desc">${meta.desc}</div>
                    <div class="lumo-card-badges">
                        <span class="lumo-badge ${isMaxed ? 'maxed' : ''}">
                            ${isMaxed ? '⭐ استاد' : 'سطح ' + toFa(lvl)}
                        </span>
                        <span class="lumo-badge">🏆 ${toFa(best)}</span>
                    </div>
                </div>
            `;
            card.onclick = () => { playSound('click'); startGame(key); };
            section.appendChild(card);
        });

        container.appendChild(section);
    });
}

function renderDomainTabs() {
    const container = document.getElementById('menu-tabs');
    if (!container) return;
    container.innerHTML = '';

    container.appendChild(createDomainTab('all', 'همه', 'layout-grid', '#00b894'));

    for (const domainKey in DOMAINS) {
        const hasGames = GAME_KEYS.some(k => GAME_META[k].domain === domainKey);
        if (hasGames) {
            const domain = DOMAINS[domainKey];
            container.appendChild(createDomainTab(domainKey, domain.name, domain.icon, domain.color));
        }
    }
}

function createDomainTab(domainKey, label, iconName, color) {
    const btn = document.createElement('button');
    btn.className = 'domain-tab';
    btn.dataset.domain = domainKey;
    if (currentDomainFilter === domainKey) btn.classList.add('active');
    if (domainKey !== 'all') btn.style.setProperty('--domain-color', color);
    btn.innerHTML = `<i data-lucide="${iconName}"></i><span>${label}</span>`;
    btn.onclick = () => {
        if (currentDomainFilter === domainKey) return;
        playSound('click');
        currentDomainFilter = domainKey;
        updateMenuDisplay();
    };
    return btn;
}

function updateMenuSubtitle() {
    const el = document.getElementById('menu-subtitle');
    if (!el) return;
    if (currentDomainFilter === 'all') {
        el.innerText = `همه ${toFa(GAME_KEYS.length)} بازی — یکی رو انتخاب کن!`;
    } else {
        const domain = DOMAINS[currentDomainFilter];
        const count = GAME_KEYS.filter(k => GAME_META[k].domain === currentDomainFilter).length;
        el.innerText = `${domain.name} — ${toFa(count)} بازی`;
    }
}

function renderGameCards() {
    const grid = document.getElementById('menu-games-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filteredGames = currentDomainFilter === 'all'
        ? GAME_KEYS
        : GAME_KEYS.filter(k => GAME_META[k].domain === currentDomainFilter);

    if (filteredGames.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#b2bec3; padding:40px; font-weight:700;">به‌زودی... 🚧</p>';
        return;
    }

    filteredGames.forEach(key => {
        const meta = GAME_META[key];
        const domain = DOMAINS[meta.domain];
        const lvl = getLevel(key);
        const best = getBest(key);
        const maxCfg = GAME_CONFIGS[key][4];
        const isMaxed = lvl === 4 && best >= maxCfg.threshold;

        const card = document.createElement('button');
        card.className = 'game-card';
        card.style.setProperty('--domain-color', domain.color);
        card.style.setProperty('--domain-bg', domain.bgColor);
        card.innerHTML = `
            <div class="card-icon-wrap">
                <i data-lucide="${meta.icon}" style="color:${domain.color};"></i>
            </div>
            <div class="card-name">${meta.name}</div>
            <div class="card-footer">
                <span class="level-badge-card ${isMaxed ? 'maxed' : ''}">${isMaxed ? '⭐ برنده' : 'سطح ' + toFa(lvl)}</span>
                <span class="card-best" title="بهترین رکورد">${toFa(best)}</span>
            </div>
        `;
        card.onclick = () => { playSound('click'); startGame(key); };
        grid.appendChild(card);
    });
}

function showStreakInfo() {
    const streak = state.streak || 0;
    const msg = streak >= 7
        ? `🔥 عالیه! ${toFa(streak)} روز پشت سرهم داری بازی می‌کنی!`
        : streak >= 3
        ? `🔥 خوب داری پیش می‌ری! ${toFa(streak)} روز پشت سرهم.`
        : streak >= 1
        ? `🔥 امروز ${toFa(streak)} روزه که اومدی!`
        : 'هنوز استریک نداری. اولین بازی امروز رو شروع کن!';
    showModal('🔥 استریک روزانه', msg + '<br><br>هر روز بازی کنی، استریکت بیشتر می‌شه!',
        [{ text: 'فهمیدم', class: 'primary', action: closeModal }]);
}

function showAlbum() {
    history.pushState({ page: 'album' }, '');
    showScreen('screen-album');
    const grid = document.getElementById('album-grid');
    grid.innerHTML = '';
    let earnedCount = 0;
    const total = GAME_KEYS.length * 4;

    GAME_KEYS.forEach(key => {
        const meta = GAME_META[key];
        const domain = DOMAINS[meta.domain];
        const header = document.createElement('div');
        header.style.cssText = `grid-column:1/-1; text-align:right; font-weight:700; font-size:14px; color:${domain.color}; margin-top:10px; margin-bottom:4px; border-bottom:2px solid ${domain.bgColor}; padding-bottom:4px; display:flex; align-items:center; gap:6px;`;
        header.innerHTML = `<i data-lucide="${meta.icon}" style="color:${domain.color};"></i><span>${meta.name}</span>`;
        grid.appendChild(header);

        for (let lvl = 1; lvl <= 4; lvl++) {
            const earned = hasBadge(key, lvl);
            if (earned) earnedCount++;
            const cell = document.createElement('div');
            cell.className = 'album-cell';
            cell.innerHTML = `
                <div class="album-badge ${earned ? 'earned' : 'locked'}">${earned ? LEVEL_MEDALS[lvl] : '❓'}</div>
                <div class="album-label">سطح ${toFa(lvl)}</div>
            `;
            grid.appendChild(cell);
        }
    });
    document.getElementById('album-count').innerText = `${toFa(earnedCount)} از ${toFa(total)}`;
    refreshIcons();
}

function requestParentReport() {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    const correct = a * b;

    document.getElementById('modal-title').innerText = '👨‍👩‍👧 گزارش والدی';
    document.getElementById('modal-title').classList.remove('win-modal-title');
    document.getElementById('modal-text').innerHTML =
        `برای ورود، حاصل ضرب زیر را وارد کنید:<br><br>` +
        `<strong style="font-size:28px; color:#0984e3;">${toFa(a)} × ${toFa(b)} = ?</strong>`;

    const container = document.getElementById('modal-buttons');
    container.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'text'; input.inputMode = 'numeric'; input.placeholder = 'جواب';
    input.style.cssText = 'padding:12px; font-size:22px; text-align:center; border:2px solid #b2bec3; border-radius:8px; width:100%; font-family:inherit; margin-bottom:10px;';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'modal-btn primary';
    submitBtn.innerText = 'ورود به گزارش';
    submitBtn.onclick = () => {
        const ans = parseInt(fromFa(input.value), 10);
        if (ans === correct) { closeModal(); showParentReport(); }
        else { input.style.borderColor = '#d63031'; input.value = ''; input.focus(); }
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn secondary';
    cancelBtn.innerText = 'انصراف';
    cancelBtn.onclick = closeModal;

    container.appendChild(input);
    container.appendChild(submitBtn);
    container.appendChild(cancelBtn);
    document.getElementById('custom-modal').style.display = 'flex';
    setTimeout(() => input.focus(), 100);
}

function showParentReport() {
    history.pushState({ page: 'parent' }, '');
    showScreen('screen-parent-report');
    const report = document.getElementById('parent-report-content');

    const badgeCount = countBadges();
    const today = new Date().toISOString().slice(0, 10);
    const playSeconds = state.dailyPlayDate === today ? (state.dailyPlaySeconds || 0) : 0;
    const playMin = Math.floor(playSeconds / 60);
    const playSec = playSeconds % 60;

    let html = `
        <div class="report-stat"><span>⏰ زمان بازی امروز:</span><strong>${toFa(playMin)} دقیقه و ${toFa(playSec)} ثانیه</strong></div>
        <div class="report-stat"><span>🔥 روزهای پشت سرهم:</span><strong>${toFa(state.streak || 0)} روز</strong></div>
        <div class="report-stat"><span>⭐ امتیاز کل:</span><strong>${toFa(state.totalScore)}</strong></div>
        <div class="report-stat"><span>🏆 نشان‌ها:</span><strong>${toFa(badgeCount)} از ${toFa(GAME_KEYS.length * 4)}</strong></div>
        <h3 style="margin-top:20px; color:#0984e3;">پیشرفت هر بازی:</h3>
    `;

    GAME_KEYS.forEach(key => {
        const meta = GAME_META[key];
        const domain = DOMAINS[meta.domain];
        const lvl = getLevel(key);
        const best = getBest(key);
        const badges = [1,2,3,4].filter(l => hasBadge(key, l)).length;
        html += `
            <div class="report-game">
                <div style="font-weight:700; display:flex; align-items:center; gap:6px; color:${domain.color};">
                    <i data-lucide="${meta.icon}"></i>
                    <span>${meta.name}</span>
                </div>
                <div style="font-size:13px; color:#636e72;">سطح ${toFa(lvl)} | بهترین: ${toFa(best)} | نشان: ${toFa(badges)}/۴</div>
            </div>
        `;
    });

    report.innerHTML = html;
    refreshIcons();
}
// ==========================================
// DAILY WORKOUT LOGIC
// ==========================================

function renderDailyWorkoutCard() {
    const card = document.getElementById('daily-workout-card');
    const preview = document.getElementById('dw-games-preview');
    const desc = document.getElementById('dw-desc');
    const btn = document.getElementById('dw-start-btn');
    if (!card) return;

    const today = new Date().toISOString().slice(0, 10);
    let dw = state.dailyWorkout;

    // اگر امروز بازی تولید نشده یا تاریخ عوض شده، بازی جدید بساز
    if (!dw || dw.date !== today) {
        const selected = generateSmartWorkout();
        state.dailyWorkout = {
            date: today,
            games: selected,
            completed: []
        };
        saveState();
        dw = state.dailyWorkout;
    }

    card.style.display = 'block';
    preview.innerHTML = '';
    
    const allCompleted = dw.completed.length === dw.games.length;
    
    if (allCompleted) {
        card.classList.add('finished');
        desc.innerText = 'آفرین! تمرین امروز رو با موفقیت تموم کردی. 🎉';
        btn.innerText = 'تمرین امروز انجام شد ✓';
        btn.disabled = true;
    } else {
        card.classList.remove('finished');
        desc.innerText = '۳ بازی برای تقویت مغزت آماده‌ست!';
        btn.innerText = 'شروع تمرین 🚀';
        btn.disabled = false;
    }

    dw.games.forEach((gameKey, index) => {
        const meta = GAME_META[gameKey];
        const isCompleted = dw.completed.includes(index);
        
        const div = document.createElement('div');
        div.className = `dw-game-icon ${isCompleted ? 'completed' : ''}`;
        div.innerHTML = `<i data-lucide="${meta.icon}"></i>`;
        preview.appendChild(div);
    });
}

// موتور انتخاب هوشمند بازی‌ها (Rule-based)
function generateSmartWorkout() {
    let selected = [];
    let usedDomains = new Set();

    // ۱. محاسبه امتیاز اولویت برای هر بازی
    let candidates = GAME_KEYS.map(key => {
        const lvl = getLevel(key);
        const domain = GAME_META[key].domain;
        
        // فرمول: هرچه سطح پایین‌تر، اولویت بالاتر (4 - level)
        // + یک ضریب تصادفی کوچک تا هر روز یکسان نباشه
        let priority = (4 - lvl) * 10 + Math.random() * 5;
        return { key, domain, priority };
    });

    // ۲. مرتب‌سازی بر اساس اولویت
    candidates.sort((a, b) => b.priority - a.priority);

    // ۳. انتخاب ۳ بازی از ۳ دامنه‌ی مختلف
    for (let c of candidates) {
        if (selected.length >= 3) break;
        if (!usedDomains.has(c.domain)) {
            selected.push(c.key);
            usedDomains.add(c.domain);
        }
    }

    return selected;
}

function startDailyWorkout() {
    playSound('click');
    const dw = state.dailyWorkout;
    if (!dw || dw.completed.length >= dw.games.length) return;

    // بازی‌ها بر اساس ترتیبی که انجام ندادیم
    const nextIndex = dw.games.findIndex((_, i) => !dw.completed.includes(i));
    if (nextIndex === -1) return;

    // پرچم که در صفحه نتیجه بدانیم در حال انجام Workout هستیم
    window.isInDailyWorkout = true;
    
    // شروع بازی بدون نمایش صفحه Tutorial اگر قبلا دیده (چون در startGame هندل شده)
    startGame(dw.games[nextIndex]);
}
// ==========================================
// STATS DASHBOARD
// ==========================================

function showStats() {
    history.pushState({ page: 'stats' }, '');
    showScreen('screen-stats');
    renderStatsPage();
}

function renderStatsPage() {
    // 1. BPI (Brain Performance Index)
    document.getElementById('stats-bpi').innerText = toFa(state.totalScore);
    document.getElementById('stats-streak').innerText = toFa(state.streak || 0);
    
    let badgeCount = countBadges();
    document.getElementById('stats-badges').innerText = toFa(badgeCount);

    // 2. Domain Progress
    const domainContainer = document.getElementById('stats-domains');
    domainContainer.innerHTML = '';

    for (const domainKey in DOMAINS) {
        const domain = DOMAINS[domainKey];
        const gamesInDomain = GAME_KEYS.filter(k => GAME_META[k].domain === domainKey);
        
        // محاسبه پیشرفت: سطح ۱ = ۰٪ و سطح ۴ = ۱۰۰٪
        let totalLvlProgress = 0;
        gamesInDomain.forEach(k => {
            totalLvlProgress += (getLevel(k) - 1); // اگر سطح ۱ باشد، صفر می‌شود
        });
        
        // حداکثر پیشرفت ممکن در این دامنه (چون از ۱ تا ۴ سه پله وجود دارد)
        const maxPossibleLvl = gamesInDomain.length * 3;
        const percent = maxPossibleLvl > 0 ? (totalLvlProgress / maxPossibleLvl) * 100 : 0;

        const row = document.createElement('div');
        row.className = 'domain-row';
        row.innerHTML = `
            <div class="domain-name" style="color:${domain.color};">
                <i data-lucide="${domain.icon}"></i>
                <span>${domain.name}</span>
            </div>
            <div class="domain-bar-bg">
                <div class="domain-bar-fill" style="background:${domain.color}; width:0%;" data-target="${percent}%"></div>
            </div>
        `;
        domainContainer.appendChild(row);
    }

    // انیمیشن پر شدن نوارها
    setTimeout(() => {
        document.querySelectorAll('.domain-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.target;
        });
    }, 100);

    // 3. Activity Chart (7 Days)
    renderActivityChart();
    refreshIcons();
}

function renderActivityChart() {
    const container = document.getElementById('stats-activity');
    container.innerHTML = '';

    // ساخت ۷ روز گذشته
    const days = [];
    const dayNames = ['یک', 'دو', 'سه', 'چهار', 'پنج', 'جمعه', 'شنبه'];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayIndex = d.getDay(); // 0=Sunday
        days.push({
            dateStr,
            label: dayNames[dayIndex],
            count: 0
        });
    }

    // شمارش بازی‌ها از تاریخچه
    if (state.gameHistory) {
        state.gameHistory.forEach(entry => {
            if (!entry.date) return;
            const entryDate = new Date(entry.date).toISOString().slice(0, 10);
            const dayMatch = days.find(d => d.dateStr === entryDate);
            if (dayMatch) dayMatch.count++;
        });
    }

    // پیدا کردن بیشترین تعداد برای نرمال‌سازی ارتفاع
    const maxCount = Math.max(...days.map(d => d.count), 1);

    days.forEach(day => {
        const heightPercent = (day.count / maxCount) * 100;
        
        const dayEl = document.createElement('div');
        dayEl.className = 'activity-day';
        dayEl.innerHTML = `
            <div class="activity-count">${day.count > 0 ? toFa(day.count) : ''}</div>
            <div class="activity-bar-wrap">
                <div class="activity-bar" style="height:0%;" data-target="${heightPercent}%"></div>
            </div>
            <div class="activity-label">${day.label}</div>
        `;
        container.appendChild(dayEl);
    });

    // انیمیشن پر شدن ستون‌ها
    setTimeout(() => {
        document.querySelectorAll('.activity-bar').forEach(bar => {
            bar.style.height = bar.dataset.target;
        });
    }, 100);
}