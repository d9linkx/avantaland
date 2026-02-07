document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.truth-card');
    const progressFill = document.querySelector('.progress-fill');
    const progressLabel = document.querySelector('.progress-label');
    const rankDisplay = document.getElementById('rank-display');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const upNextContainer = document.getElementById('up-next-container');
    const upNextLink = document.getElementById('up-next-link');
    const btnExport = document.getElementById('btn-export');
    const btnReset = document.getElementById('btn-reset');

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

    cards.forEach((card, index) => {
        // Check if this truth index is marked as true in storage
        if (progress[index]) {
            card.classList.add('completed');
            completedCount++;
        } else if (firstUnfinishedIndex === -1) {
            // Capture the first one that isn't done
            firstUnfinishedIndex = index;
        }
    });

    // Update Progress Bar
    const total = cards.length;
    const percentage = Math.round((completedCount / total) * 100);
    
    // Feature 5: Rank System
    let rank = "Inexperienced";
    if (percentage > 20) rank = "Builder";
    if (percentage > 50) rank = "Operator";
    if (percentage > 80) rank = "Architect";
    if (percentage === 100) rank = "Master";

    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
    
    if (progressLabel) {
        progressLabel.innerHTML = `Rank: <span style="color: var(--dash-accent); font-weight: 800;">${rank}</span> • ${completedCount} of ${total} Truths Mastered (${percentage}%)`;
    }

    // Feature 2: "Up Next" Spotlight
    if (firstUnfinishedIndex !== -1 && upNextContainer) {
        const nextCard = cards[firstUnfinishedIndex];
        const title = nextCard.querySelector('.truth-title').innerText;
        const truthNum = parseInt(firstUnfinishedIndex) + 1;
        
        document.getElementById('up-next-num').innerText = truthNum;
        document.getElementById('up-next-title').innerText = title;
        upNextLink.href = nextCard.getAttribute('href');

        // Check if user has started this truth
        const checklistState = JSON.parse(localStorage.getItem('bizLabChecklist')) || {};
        const pageState = checklistState[firstUnfinishedIndex];
        const hasStarted = pageState && Object.values(pageState).some(val => val === true);
        const arrowDiv = upNextLink.querySelector('.up-next-arrow');
        if (arrowDiv) arrowDiv.innerText = hasStarted ? 'Continue Fix →' : 'Start Fix →';

        upNextContainer.style.display = 'block';
    } else if (upNextContainer) {
        upNextContainer.style.display = 'none'; // All done
    }

    // Feature 1: Filtering
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Toggle
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.filter;
            
            cards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.classList.remove('dimmed');
                } else {
                    card.classList.add('dimmed');
                }
            });
        });
    });

    // Feature 3: Export Audit
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const date = new Date().toLocaleDateString();
            let report = `AVANTALAND EXECUTIVE AUDIT\nDate: ${date}\nRank: ${rank} (${percentage}%)\n\nPENDING ACTIONS:\n----------------\n`;
            
            let hasGaps = false;
            cards.forEach((card, index) => {
                if (!progress[index]) {
                    const title = card.querySelector('.truth-title').innerText;
                    report += `[ ] Truth #${parseInt(index)+1}: ${title}\n`;
                    hasGaps = true;
                }
            });

            if (!hasGaps) report += "All systems operational. No gaps detected.\n";

            const blob = new Blob([report], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Audit_Report_${date.replace(/\//g, '-')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        });
    }

    // Feature 4: Reset Progress
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (confirm("Are you sure you want to reset your progress and start all over again? This cannot be undone.")) {
                localStorage.removeItem('bizLabProgress');
                location.reload();
            }
        });
    }

    // Listen for updates from other tabs (sync-back)
    window.addEventListener('storage', (e) => {
        if (e.key === 'bizLabProgress') location.reload();
    });

    // Welcome Modal Logic
    setTimeout(() => {
        const hideWelcome = localStorage.getItem('avantaland_hide_welcome');
        if (!hideWelcome) {
            const modal = document.getElementById('welcome-modal');
            if (modal) modal.style.display = 'flex';
        }
    }, 3000);

    const welcomeModal = document.getElementById('welcome-modal');
    const nextBtn = document.getElementById('onboarding-next-btn');
    const backBtn = document.getElementById('onboarding-back-btn');
    const steps = document.querySelectorAll('.onboarding-step');
    const dots = document.querySelectorAll('.step-dot');
    const dontShowCheckbox = document.getElementById('dont-show-welcome');
    let currentStep = 0;

    const updateModal = () => {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentStep);
        });
        
        backBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
        nextBtn.innerText = currentStep === steps.length - 1 ? 'Start >' : 'Next';
    };

    if (nextBtn && backBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < steps.length - 1) {
                currentStep++;
                updateModal();
            } else {
                if (dontShowCheckbox && dontShowCheckbox.checked) {
                    localStorage.setItem('avantaland_hide_welcome', 'true');
                }
                if (welcomeModal) welcomeModal.style.display = 'none';
            }
        });

        backBtn.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateModal();
            }
        });
    }
});