document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.truth-card');
    const progressGauge = document.querySelector('.progress-gauge');
    const progressGaugeValue = document.querySelector('.progress-gauge-value');
    const masterySubtext = document.getElementById('mastery-subtext'); // New element
    // const upNextContainer = document.getElementById('up-next-container'); // REMOVED
    // const upNextLink = document.getElementById('up-next-link'); // REMOVED
    // Note: Filter, Export, and Reset buttons are removed in the new design,
    // so their corresponding JS is no longer needed and can be removed for cleanup.

    // Load progress from Local Storage
    // Format: { 0: true, 1: true, ... } where key is index (0-32)
    let progress = {};
    try {
        progress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
    } catch (e) {
        console.error("Error loading progress", e);
    }

    let completedCount = 0;
    let firstUnfinishedIndex = -1;

    const checklistState = JSON.parse(localStorage.getItem('bizLabChecklist')) || {};

    cards.forEach((card, index) => {
        const pillBadge = card.querySelector('.pill-badge');
        const pageState = checklistState[index] || [];
        const hasStarted = pageState && Object.values(pageState).some(val => val === true);

        // Check if this truth index is marked as true in storage
        if (progress[index]) {
            card.classList.add('completed');
            if(pillBadge) pillBadge.textContent = 'Mastered';
            completedCount++;
        } else {
            if (hasStarted) {
                card.classList.add('in-progress');
                if(pillBadge) pillBadge.textContent = 'In Progress';
            } else {
                card.classList.add('not-started');
                if(pillBadge) pillBadge.textContent = 'Ready to Unlock';
            }
            if (firstUnfinishedIndex === -1) {
                // Capture the first one that isn't done
                firstUnfinishedIndex = index;
            }
        }
    });

    // Update Progress Gauge
    const total = cards.length;
    const percentage = Math.round((completedCount / total) * 100);
    
    if (progressGauge) {
        const angle = percentage * 3.6; // 1% = 3.6deg
        progressGauge.style.background = `conic-gradient(var(--brand-color) ${angle}deg, #e2e8f0 ${angle}deg)`;
        if (progressGaugeValue) {
            progressGaugeValue.textContent = `${percentage}%`;
        }
        if (masterySubtext) {
            masterySubtext.textContent = `You have completed ${completedCount} of ${total} truths.`;
        }
    }

    // "Up Next" logic is removed as it's replaced by the static "Brutal Truth" widget.
    // The old upNextContainer and related elements are no longer in the HTML.

    // Listen for updates from other tabs (sync-back)
    window.addEventListener('storage', (e) => {
        if (e.key === 'bizLabProgress') location.reload();
    });

    // Live Clock in Header
    const clockElement = document.getElementById('live-clock');
    function updateClock() {
        if (clockElement) {
            clockElement.innerText = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
    }
    setInterval(updateClock, 1000);
    updateClock();
});