// =====================================================
// CONFIG - تنظیمات، متادیتا و دامنه‌ها
// =====================================================



const GAME_KEYS = [
    'stroop_junior', 'stroop_senior',
    'numhunt_junior', 'numhunt_senior',
    'wordhunt_junior', 'wordhunt_senior',
    'shapehunt', 'memory', 'symboldiff', 'scattermem'
];

const DOMAINS = {
    working_memory:   { name: 'حافظه',          icon: 'brain',      color: '#3498db', bgColor: '#e3f2fd' },
    attention:        { name: 'توجه',           icon: 'target',     color: '#27ae60', bgColor: '#e8f8ef' },
    processing_speed: { name: 'سرعت پردازش',    icon: 'zap',        color: '#e67e22', bgColor: '#fef5e7' },
    flexibility:      { name: 'انعطاف ذهنی',    icon: 'refresh-cw', color: '#9b59b6', bgColor: '#f5eef8' },
    problem_solving:  { name: 'حل مسئله',       icon: 'puzzle',     color: '#e74c3c', bgColor: '#fdeded' }
};

const GAME_META = {
    stroop_junior:   { name: 'روز و شب',            icon: 'sun',       screen: 'screen-stroop-junior',   prefix: 'sj', domain: 'flexibility',      desc: 'سرکوب پاسخ خودکار و تغییر سریع قوانین' },
    stroop_senior:   { name: 'رنگ یا کلمه؟',        icon: 'palette',   screen: 'screen-stroop-senior',   prefix: 'ss', domain: 'attention',        desc: 'تمرکز روی محرک هدف و نادیده گرفتن حواس‌پرتی' },
    numhunt_junior:  { name: 'شکار حیوانات',        icon: 'paw-print', screen: 'screen-numhunt-junior',  prefix: 'nj', domain: 'working_memory',   desc: 'به خاطر سپردن موقعیت مکانی تصاویر' },
    numhunt_senior:  { name: 'شکارچی اعداد',        icon: 'hash',      screen: 'screen-numhunt-senior',  prefix: 'ns', domain: 'working_memory',   desc: 'به خاطر سپردن موقعیت مکانی اعداد' },
    wordhunt_junior: { name: 'شکار میوه‌ها',        icon: 'apple',     screen: 'screen-wordhunt-junior', prefix: 'wj', domain: 'processing_speed', desc: 'پردازش و دسته‌بندی سریع تصاویر' },
    wordhunt_senior: { name: 'شکارچی کلمات',        icon: 'file-text', screen: 'screen-wordhunt-senior', prefix: 'ws', domain: 'processing_speed', desc: 'اسکن سریع کلمات و تشخیص معنا' },
    shapehunt:       { name: 'شکل‌های مخفی',        icon: 'search',    screen: 'screen-shapehunt',       prefix: 'sh', domain: 'attention',        desc: 'جستجوی دیداری برای یافتن ویژگی‌های خاص' },
    memory:          { name: 'حافظه فوق‌العاده',    icon: 'brain',     screen: 'screen-memory',          prefix: 'me', domain: 'working_memory',   desc: 'نگهداری همزمان اطلاعات دیداری و شنیداری' },
    symboldiff:      { name: 'تفاوت نمادها',        icon: 'eye',       screen: 'screen-symboldiff',      prefix: 'sd', domain: 'attention',        desc: 'مقایسه دقیق و اسکن دیداری جدول‌ها' },
    scattermem:      { name: 'چی کجا بود؟',         icon: 'map',       screen: 'screen-scattermem',      prefix: 'sc', domain: 'working_memory',   desc: 'یادآوری مکان و ویژگی‌های اشیاء پراکنده' }
};

const GAME_CONFIGS = {
    stroop_junior: {
        1: { rounds: 8,  points: 10, timePerRound: 5000, threshold: 40, maxWrong: 5 },
        2: { rounds: 10, points: 10, timePerRound: 4500, threshold: 60, maxWrong: 5 },
        3: { rounds: 12, points: 10, timePerRound: 4000, threshold: 80, maxWrong: 4 },
        4: { rounds: 18, points: 10, timePerRound: 3000, threshold: 100, maxWrong: 3 }
    },
    stroop_senior: {
        1: { rounds: 10, points: 10, colors: 4, timePerRound: 5000, threshold: 50, maxWrong: 5 },
        2: { rounds: 15, points: 10, colors: 4, timePerRound: 4500, threshold: 80, maxWrong: 4 },
        3: { rounds: 20, points: 10, colors: 5, timePerRound: 4000, threshold: 110, maxWrong: 3 },
        4: { rounds: 30, points: 10, colors: 5, timePerRound: 3000, threshold: 150, maxWrong: 3 }
    },
    numhunt_junior: {
        1: { items: 12, targetCount: 3, timeSec: 20, pointsPerHit: 5, threshold: 10, maxWrong: 4 },
        2: { items: 16, targetCount: 4, timeSec: 18, pointsPerHit: 5, threshold: 15, maxWrong: 4 },
        3: { items: 20, targetCount: 5, timeSec: 16, pointsPerHit: 5, threshold: 20, maxWrong: 3 },
        4: { items: 24, targetCount: 6, timeSec: 15, pointsPerHit: 5, threshold: 25, maxWrong: 3 }
    },
    numhunt_senior: {
        1: { target: 4, timeSec: 20, pointsPerHit: 5, penalty: 2, totalItems: 16, targetCount: 4, threshold: 15, maxWrong: 5 },
        2: { target: 5, timeSec: 18, pointsPerHit: 5, penalty: 2, totalItems: 20, targetCount: 5, threshold: 20, maxWrong: 4 },
        3: { target: 7, timeSec: 16, pointsPerHit: 5, penalty: 3, totalItems: 24, targetCount: 6, threshold: 25, maxWrong: 3 },
        4: { target: 17, timeSec: 18, pointsPerHit: 5, penalty: 3, totalItems: 32, targetCount: 8, threshold: 30, maxWrong: 2 }
    },
    wordhunt_junior: {
        1: { timeSec: 25, points: 10, gridSize: 12, threshold: 30, type: 'fruit', maxWrong: 5 },
        2: { timeSec: 22, points: 10, gridSize: 16, threshold: 40, type: 'animal', maxWrong: 5 },
        3: { timeSec: 20, points: 15, gridSize: 20, threshold: 45, type: 'redfruit', maxWrong: 4 },
        4: { timeSec: 20, points: 15, gridSize: 24, threshold: 60, type: 'redfruit_similar', maxWrong: 3 }
    },
    wordhunt_senior: {
        1: { timeSec: 25, points: 10, gridSize: 16, threshold: 40, type: 'animal', maxWrong: 5 },
        2: { timeSec: 22, points: 15, gridSize: 20, threshold: 60, type: 'letter', maxWrong: 4 },
        3: { timeSec: 20, points: 20, gridSize: 24, threshold: 80, type: 'dual', maxWrong: 3 },
        4: { timeSec: 18, points: 20, gridSize: 28, threshold: 100, type: 'similar_letter', maxWrong: 2 }
    },
    shapehunt: {
        1: {
            timeSec: 25, pointsPerHit: 10, threshold: 40, maxWrong: 5,
            target: { type: 'circle', color: '#e74c3c' },
            distractors: [{ type: 'circle', color: '#3498db' }, { type: 'square', color: '#e74c3c' }],
            totalItems: 16, targetCount: 4
        },
        2: {
            timeSec: 22, pointsPerHit: 10, threshold: 60, maxWrong: 4,
            target: { type: 'triangle', color: '#27ae60' },
            distractors: [
                { type: 'triangle', color: '#e67e22' },
                { type: 'square', color: '#27ae60' },
                { type: 'circle', color: '#27ae60' }
            ],
            totalItems: 24, targetCount: 6
        },
        3: {
            timeSec: 20, pointsPerHit: 10, threshold: 80, maxWrong: 3,
            target: { type: 'square', color: '#9b59b6', hasDot: true },
            distractors: [
                { type: 'square', color: '#9b59b6', hasDot: false },
                { type: 'circle', color: '#9b59b6', hasDot: true },
                { type: 'square', color: '#e67e22', hasDot: true },
                { type: 'triangle', color: '#9b59b6', hasDot: false }
            ],
            totalItems: 36, targetCount: 8
        },
        4: {
            timeSec: 18, pointsPerHit: 12, threshold: 84, maxWrong: 2,
            target: { type: 'circle', color: '#f39c12', hasDot: true },
            distractors: [
                { type: 'circle', color: '#f39c12', hasDot: false },
                { type: 'square', color: '#f39c12', hasDot: true },
                { type: 'triangle', color: '#f39c12', hasDot: false },
                { type: 'circle', color: '#e74c3c', hasDot: true }
            ],
            totalItems: 48, targetCount: 10
        }
    },
    memory: {
        1: { visCount: 3, numDigits: 4, showMs: 4000, points: 30, threshold: 25, maxWrong: 3 },
        2: { visCount: 4, numDigits: 5, showMs: 3500, points: 40, threshold: 35, maxWrong: 3 },
        3: { visCount: 5, numDigits: 6, showMs: 3000, points: 50, threshold: 45, maxWrong: 2 },
        4: { visCount: 6, numDigits: 7, showMs: 2800, points: 60, threshold: 55, maxWrong: 2 }
    },
    symboldiff: {
        1: { timeSec: 40, cols: 3, items: 9,  diffs: 2, points: 15, threshold: 25, maxWrong: 3 },
        2: { timeSec: 35, cols: 4, items: 12, diffs: 3, points: 20, threshold: 50, maxWrong: 3 },
        3: { timeSec: 30, cols: 4, items: 16, diffs: 4, points: 25, threshold: 80, maxWrong: 2 },
        4: { timeSec: 28, cols: 5, items: 20, diffs: 5, points: 25, threshold: 100, maxWrong: 2 }
    },
    scattermem: {
        1: { itemsCount: 6,  showMs: 6000, questions: 1, points: 20, threshold: 15, maxWrong: 2 },
        2: { itemsCount: 9,  showMs: 5000, questions: 2, points: 30, threshold: 25, maxWrong: 2 },
        3: { itemsCount: 12, showMs: 4500, questions: 3, points: 45, threshold: 35, maxWrong: 2 },
        4: { itemsCount: 16, showMs: 4000, questions: 4, points: 60, threshold: 45, maxWrong: 1 }
    }
};

const LEVEL_MEDALS = { 1: '🥉', 2: '🥈', 3: '🥇', 4: '💎' };

const GAME_STARTERS = {};
const GAME_PAUSE_HOOKS = {};
const GAME_RESUME_HOOKS = {};