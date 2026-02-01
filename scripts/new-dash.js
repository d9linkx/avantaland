document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.truth-card');
    const progressFill = document.querySelector('.progress-fill');
    const progressLabel = document.querySelector('.progress-label');

    // Load progress from Local Storage
    // Format: { 0: true, 1: true, ... } where key is index (0-32)
    let progress = {};
    try {
        progress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
    } catch (e) {
        console.error("Error loading progress", e);
    }

    let completedCount = 0;

    cards.forEach((card, index) => {
        // Check if this truth index is marked as true in storage
        if (progress[index]) {
            card.classList.add('completed');
            completedCount++;
        }
    });

    // Update Progress Bar
    const total = cards.length;
    const percentage = Math.round((completedCount / total) * 100);
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressLabel) {
        progressLabel.innerText = `${completedCount} of ${total} Truths Mastered (${percentage}%)`;
    }

    // Listen for updates from other tabs (sync-back)
    window.addEventListener('storage', (e) => {
        if (e.key === 'bizLabProgress') location.reload();
    });
});