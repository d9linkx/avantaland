function initializeTruthPage(truthIndex) {
    const revealBtn = document.getElementById('reveal-btn');
    const completeBtn = document.getElementById('mark-complete-btn');
    const fullContent = document.getElementById('full-truth-content');
    const checkboxes = document.querySelectorAll('.fix-checkbox');

    // --- 1. Load Completion Status ---
    const savedProgress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
    const isCompleted = savedProgress[truthIndex];

    if (isCompleted) {
        markAsCompletedUI();
    }

    // --- 2. Load Checklist State ---
    const checklistState = JSON.parse(localStorage.getItem('bizLabChecklist')) || {};
    const pageState = checklistState[truthIndex] || [];

    if (!isCompleted) {
        checkboxes.forEach((cb, idx) => {
            if (pageState[idx]) {
                cb.checked = true;
            }
        });
        updateCompleteButtonState();
    }

    // --- 3. Event Listeners ---

    // Checkboxes
    checkboxes.forEach((cb, idx) => {
        cb.addEventListener('change', () => {
            if (isCompleted) return;

            // Save State
            const currentChecklistState = JSON.parse(localStorage.getItem('bizLabChecklist')) || {};
            const currentPageState = currentChecklistState[truthIndex] || [];
            currentPageState[idx] = cb.checked;
            currentChecklistState[truthIndex] = currentPageState;
            localStorage.setItem('bizLabChecklist', JSON.stringify(currentChecklistState));

            updateCompleteButtonState();
        });
    });

    function updateCompleteButtonState() {
        if (isCompleted || !completeBtn) return;
        
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        if (allChecked) {
            completeBtn.disabled = false;
            completeBtn.innerText = 'Mark as Completed';
            completeBtn.style.opacity = '1';
            completeBtn.style.cursor = 'pointer';
        } else {
            completeBtn.disabled = true;
            completeBtn.innerText = 'Complete Checklist First';
            completeBtn.style.opacity = '0.5';
            completeBtn.style.cursor = 'not-allowed';
        }
    }

    function markAsCompletedUI() {
        completeBtn.innerText = '✓ Completed';
        completeBtn.classList.add('completed');
        completeBtn.disabled = true;
        completeBtn.style.opacity = '1';
        completeBtn.style.cursor = 'default';
        checkboxes.forEach(cb => {
            cb.checked = true;
            cb.disabled = true;
        });
    }

    // Reveal Logic
    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            const isHidden = fullContent.style.display === 'none';
            fullContent.style.display = isHidden ? 'block' : 'none';
            revealBtn.innerText = isHidden ? 'Hide Full Truth' : '📖 Read Full Truth';
        });
    }

    // Completion Logic
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            // Double check validation
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            if (!allChecked) return;

            const progress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
            progress[truthIndex] = true;
            localStorage.setItem('bizLabProgress', JSON.stringify(progress));
            markAsCompletedUI();
        });
    }
}