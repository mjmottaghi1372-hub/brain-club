// =====================================================
// APP - راه‌اندازی اولیه
// =====================================================

async function initApp() {
    await initState();

    // دکمه Back مرورگر
    history.replaceState({ page: 'menu' }, '');
    window.addEventListener('popstate', handlePopState);

    // دکمه صدا
    const soundBtn = document.getElementById('sound-btn');
    if (soundBtn) soundBtn.innerText = state.soundEnabled ? '🔊' : '🔇';

    goToMenu();
}

initApp();