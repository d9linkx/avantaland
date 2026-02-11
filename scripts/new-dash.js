document.addEventListener('DOMContentLoaded', () => {
    // --- Data Structure for all 33 Truths ---
    const truthsData = [
        { id: 0, title: "You are unqualified; no amount of prep survives first contact" },
        { id: 1, title: "Passion is a poverty trap; the market doesn't care how much you 'love' your idea" },
        { id: 2, title: "If you can’t eat 'No' for breakfast, you'll starve" },
        { id: 3, title: "You will want to burn your own company to the ground at least 10 times" },
        { id: 4, title: "Confidence is learned through small wins, not pep talks" },
        { id: 5, title: "Expect chaos; it’s the default state of early businesses" },
        { id: 6, title: "Your first plan is almost always wrong; accept it" },
        { id: 7, title: "Most people want to see you fail so they feel better about staying safe" },
        { id: 8, title: "Your idea isn’t unique; someone else is already thinking it" },
        { id: 9, title: "Validation kills ego: people will tell you it sucks. Listen" },
        { id: 10, title: "Building something for yourself is tempting but dangerous" },
        { id: 11, title: "A small, obsessed niche is better than a large lukewarm market" },
        { id: 12, title: "Talking to users before coding is mandatory" },
        { id: 13, title: "Surveys lie; prototypes don’t" },
        { id: 14, title: "Solve the bleeding wound today, not the itch they might have next year" },
        { id: 15, title: "If you aren’t embarrassed by the first version of your MVP, you shipped too late" },
        { id: 16, title: "Features are distractions. Focus on outcomes" },
        { id: 17, title: "You’ll iterate more than you plan. Accept it" },
        { id: 18, title: "Documentation is not sexy but will save you weeks" },
        { id: 19, title: "Your first codebase will suck. Refactor later" },
        { id: 20, title: "UX is the silent growth engine. Ignore at your peril" },
        { id: 21, title: "A 'good' product shipped today beats a 'perfect' one that never exists" },
        { id: 22, title: "Your friends are liars; they love you, so they’ll let you go bankrupt with a smile" },
        { id: 23, title: "Early adopters are gold; casual users are noise" },
        { id: 24, title: "People don’t buy products. They buy what solves their problem" },
        { id: 25, title: "Marketing starts before product; awareness is traction" },
        { id: 26, title: "Feedback is a weapon; use it like a boss, or your competitors will" },
        { id: 27, title: "You can't 'growth hack' a product that nobody wants" },
        { id: 28, title: "You can’t do everything" },
        { id: 29, title: "Your network is your early advantage. Don’t build in isolation" },
        { id: 30, title: "Hiring before revenue is a gamble; hire slow, fire fast" },
        { id: 31, title: "If your mentor only tells you what you want to hear, fire them" },
        { id: 32, title: "Money won't fix a broken engine; it just makes the crash more spectacular" }
    ];

    // --- DOM Elements ---
    const hackListContainer = document.querySelector('.hack-list');
    const learningStage = document.querySelector('.learning-stage');
    const masteryGaugeProgress = document.querySelector('.progress-gauge-thin .progress');
    const masteryGaugeValue = document.querySelector('.progress-gauge-thin-value');
    const dailyPillText = document.querySelector('.daily-pill-card p');
    const feedbackNotes = document.getElementById('feedback-notes');

    // --- State ---
    let currentState = {
        progress: {},
        checklist: {},
        notes: '',
        currentHackIndex: 0
    };

    // --- Initialization ---
    function init() {
        loadState();
        renderHackNavigator();
        renderIntelligenceWing();
        displayHack(currentState.currentHackIndex);
        setupEventListeners();
    }

    function loadState() {
        try {
            currentState.progress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
            currentState.checklist = JSON.parse(localStorage.getItem('bizLabChecklist')) || {};
            currentState.notes = localStorage.getItem('bizLabFeedbackNotes') || '';
        } catch (e) {
            console.error("Error loading state from localStorage", e);
        }
    }

    function saveState() {
        localStorage.setItem('bizLabProgress', JSON.stringify(currentState.progress));
        localStorage.setItem('bizLabChecklist', JSON.stringify(currentState.checklist));
        localStorage.setItem('bizLabFeedbackNotes', currentState.notes);
    }

    function setupEventListeners() {
        feedbackNotes.value = currentState.notes;
        feedbackNotes.addEventListener('input', (e) => {
            currentState.notes = e.target.value;
            saveState();
        });

        prevHackButton.addEventListener('click', () => {
            if (currentState.currentHackIndex > 0) {
                displayHack(currentState.currentHackIndex - 1);
            }
        });

        nextHackButton.addEventListener('click', () => {
            if (currentState.currentHackIndex < truthsData.length - 1) {
                displayHack(currentState.currentHackIndex + 1);
            }
        });

        masteryToggleButton.addEventListener('click', toggleMastery);
    }

    // --- Rendering Functions ---

    function renderHackNavigator() {
        hackListContainer.innerHTML = '';
        truthsData.forEach((truth, index) => {
            const li = document.createElement('li');
            li.className = 'hack-list-item';
            li.dataset.index = index;

            const dot = document.createElement('div');
            dot.className = 'status-dot';
            
            const truthChecklist = currentState.checklist[index] || [];
            const hasStarted = truthChecklist.some(item => item === true);

            if (currentState.progress[index]) {
                dot.classList.add('mastered');
            } else if (hasStarted) {
                dot.classList.add('in-progress');
            } else {
                dot.classList.add('locked');
            }

            const title = document.createElement('span');
            title.className = 'hack-title-nav';
            title.textContent = `${String(index + 1).padStart(2, '0')}. ${truth.title}`;
            
            li.appendChild(dot);
            li.appendChild(title);

            li.addEventListener('click', () => {
                displayHack(index);
            });

            hackListContainer.appendChild(li);
        });
    }

    async function displayHack(index, forceFetch = true) {
        currentState.currentHackIndex = index;
        const truth = truthsData[index];

        // Update active state in navigator
        document.querySelectorAll('.hack-list-item').forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.index) === index);
        });

        // Determine mastery state
        const isMastered = !!currentState.progress[index];

        // Fetch content from truth file
        // Default to hardcoded data
        let summaryContent = '<p>Loading content...</p>';
        let checklistContent = '<p>Loading checklist...</p>';
        let fullContentHTML = '';

        if (forceFetch) {
            try {
                const response = await fetch(`truth${index + 1}.html`);
                if (response.ok) {
                    const text = await response.text();
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = text;

                    // Extract specific sections
                    summaryContent = tempDiv.querySelector('.truth-summary-box')?.innerHTML || summaryContent;
                    checklistContent = tempDiv.querySelector('.truth-checklist')?.innerHTML || checklistContent;

                    fullContentHTML = tempDiv.querySelector('#full-truth-content')?.innerHTML || '';
                }
            } catch (e) {
                console.warn(`Could not fetch truth${index + 1}.html`, e);
            }
        }

        learningStage.innerHTML = `
            <div class="stage-nav-top">
                <button class="btn-back-dashboard" onclick="location.reload()"><i class="ph ph-arrow-left"></i> Back to Dashboard</button>
            </div>
            <div class="stage-header">
                <span class="truth-number">Truth #${index + 1}</span>
                <h1>${truth.title}</h1>
            </div>
            <div class="stage-body">
                <div class="executive-summary-container">
                    ${summaryContent}
                </div>
                <div class="checklist-wrapper-container">
                    ${checklistContent}
                </div>
            </div>
            <div id="full-truth-container" style="display: none; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color);"></div>
            <div class="stage-footer-actions">
                <button class="btn-action btn-complete ${isMastered ? 'completed' : ''}" id="btn-mark-complete" ${isMastered ? 'disabled' : ''}>
                    ${isMastered ? '<i class="ph ph-check-circle"></i> Completed' : '<i class="ph ph-check"></i> Mark as Completed'}
                </button>
                <button class="btn-action btn-reveal" id="btn-reveal-truth"><i class="ph ph-caret-down"></i> Read Full Truth</button>
                <button class="btn-action btn-listen"><i class="ph ph-speaker-high"></i> Listen</button>
            </div>
            <div class="stage-nav-bottom">
                <button id="next-hack-btn" class="btn-next-truth" ${index === truthsData.length - 1 ? 'disabled' : ''}>Next Truth <i class="ph ph-arrow-right"></i></button>
            </div>
        `;

        // --- Event Listeners for New Elements ---
        
        // Checklist Rendering
        // We need to re-attach event listeners to the checkboxes that were just injected via innerHTML
        const checklistContainer = learningStage.querySelector('.checklist-wrapper-container');
        const checkboxes = checklistContainer.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach((checkbox, checkIndex) => {
            // Restore state
            const isChecked = (currentState.checklist[index] && currentState.checklist[index][checkIndex]) || false;
            checkbox.checked = isChecked;
            if (isMastered) checkbox.disabled = true;

            // Add change listener
            checkbox.addEventListener('change', (e) => {
                handleChecklistChange(index, checkIndex, e.target.checked);
                updateCompleteButton();
            });

            // Make parent card clickable
            const card = checkbox.closest('.checklist-item') || checkbox.closest('.fix-item');
            if (card) {
                card.addEventListener('click', (e) => {
                    // Fix: Check if click target is the checkbox or inside a label to avoid double-toggling
                    if (e.target === checkbox || e.target.closest('label')) return;

                    if (!checkbox.disabled) {
                        checkbox.checked = !checkbox.checked;
                        handleChecklistChange(index, checkIndex, checkbox.checked);
                        updateCompleteButton();
                    }
                });
            }
        });

        // Update Complete Button State based on checklist
        const updateCompleteButton = () => {
            const currentCheckboxes = checklistContainer.querySelectorAll('input[type="checkbox"]');
            const allChecked = currentCheckboxes.length > 0 && Array.from(currentCheckboxes).every(cb => cb.checked);
            const completeBtn = learningStage.querySelector('#btn-mark-complete');
            
            if (completeBtn && !isMastered) {
                completeBtn.disabled = !allChecked;
            }
        };
        // Initial check
        updateCompleteButton();

        // Mark Complete Button
        const completeBtn = learningStage.querySelector('#btn-mark-complete');
        completeBtn.addEventListener('click', toggleMastery);

        // Next Truth Button
        const nextBtn = learningStage.querySelector('#next-hack-btn');
        nextBtn.addEventListener('click', () => {
            if (index < truthsData.length - 1) {
                displayHack(index + 1);
            }
        });

        // Listen Button (Placeholder logic)
        const listenBtn = learningStage.querySelector('.btn-listen');
        listenBtn.addEventListener('click', () => {
            alert("Audio feature coming soon!");
        });
        
        // Reveal Button (Display Full Truth Inline)
        const revealBtn = learningStage.querySelector('#btn-reveal-truth');
        const fullTruthContainer = learningStage.querySelector('#full-truth-container');
        
        revealBtn.addEventListener('click', async () => {
            // If we already fetched content during initial load (fullContentHTML), use it.
            // Otherwise, try fetching again or show error.
            
            if (fullTruthContainer.style.display === 'block') {
                fullTruthContainer.style.display = 'none';
                revealBtn.innerHTML = '<i class="ph ph-caret-down"></i> Read Full Truth';
                return;
            }

            if (!fullTruthContainer.innerHTML.trim()) {
                 if (fullContentHTML) {
                     fullTruthContainer.innerHTML = fullContentHTML;
                 } else {
                 try {
                    const response = await fetch(`truth${index + 1}.html`);
                    if (response.ok) {
                        const text = await response.text();
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = text;
                        
                        // Try to find the specific full content container first
                        const specificContent = tempDiv.querySelector('#full-truth-content');
                        const contentToDisplay = specificContent ? specificContent.innerHTML : '';
                        fullTruthContainer.innerHTML = contentToDisplay;
                    }
                } catch (e) {
                    console.warn(`Could not fetch truth${index + 1}.html on click`, e);
                }
                }
            }

            if (fullTruthContainer.innerHTML.trim()) {
                // Ensure the content is visible if it was hidden in the source file
                const hiddenContent = fullTruthContainer.querySelector('#full-truth-content');
                if (hiddenContent) hiddenContent.style.display = 'block';

                fullTruthContainer.style.display = 'block';
                revealBtn.innerHTML = '<i class="ph ph-caret-up"></i> Hide Full Truth';
                
                // Scroll to the new content
                fullTruthContainer.scrollIntoView({ behavior: 'smooth' });
            } else {
                alert("Full content not available for this truth.");
            }
        });
    }

    function renderIntelligenceWing() {
        // Update Mastery Gauge
        const completedCount = Object.keys(currentState.progress).length;
        const total = truthsData.length;
        const percentage = Math.round((completedCount / total) * 100);
        
        const radius = 52;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;

        masteryGaugeProgress.style.strokeDasharray = `${circumference} ${circumference}`;
        masteryGaugeProgress.style.strokeDashoffset = offset;
        masteryGaugeValue.textContent = `${percentage}%`;

        // Update Daily Pill
        const randomIndex = Math.floor(Math.random() * truthsData.length);
        dailyPillText.textContent = `"${truthsData[randomIndex].title}"`;
    }

    // --- State Change Handlers ---

    function handleChecklistChange(truthIndex, checkIndex, isChecked) {
        if (!currentState.checklist[truthIndex]) {
            currentState.checklist[truthIndex] = [];
        }
        currentState.checklist[truthIndex][checkIndex] = isChecked;
        saveState();
        renderHackNavigator(); // Update dot color
        
        // Note: The updateCompleteButton logic is now handled directly within the event listener 
        // inside displayHack to ensure it has the correct scope and context.
    }

    function toggleMastery() {
        const index = currentState.currentHackIndex;
        if (currentState.progress[index]) return; // Already mastered

        currentState.progress[index] = true;
        saveState();

        // Re-render everything that depends on progress
        displayHack(index);
        renderHackNavigator();
        renderIntelligenceWing();
    }

    // Listen for updates from other tabs (sync-back)
    window.addEventListener('storage', (e) => {
        if (e.key === 'bizLabProgress') location.reload();
    });

    init();
});