document.addEventListener('DOMContentLoaded', () => {
    // --- Data Structure for all 33 Truths ---
    const truthsData = [
        { id: 0, title: "You are unqualified; no amount of prep survives first contact", checklist: ["Launch a 'minimum viable' version of your idea.", "Get feedback from 3 paying customers.", "Adjust your plan based on real-world data."] },
        { id: 1, title: "Passion is a poverty trap; the market doesn't care how much you 'love' your idea", checklist: ["Identify a problem a specific group is willing to pay to solve.", "Validate the problem with 5 potential customers.", "Pivot your idea if market demand isn't there."] },
        { id: 2, title: "If you can’t eat 'No' for breakfast, you'll starve", checklist: ["Pitch your idea to 10 people and track the 'no's.", "Ask 'why not?' to understand objections.", "Refine your pitch based on feedback."] },
        { id: 3, title: "You will want to burn your own company to the ground at least 10 times", checklist: ["Define what a 'win' looks like for this week.", "Celebrate a small success.", "Talk to a mentor or fellow founder."] },
        { id: 4, title: "Confidence is learned through small wins, not pep talks", checklist: ["Set and achieve one small, daily business goal.", "Document your wins, no matter how small.", "Use a small win to build momentum for a bigger task."] },
        { id: 5, title: "Expect chaos; it’s the default state of early businesses", checklist: ["Create a simple system for one recurring task.", "Prioritize the 'one thing' that must get done today.", "Accept that not everything will be perfect."] },
        { id: 6, title: "Your first plan is almost always wrong; accept it", checklist: ["Review your initial business plan.", "Identify one assumption that was proven wrong.", "Update your plan with what you've learned."] },
        { id: 7, title: "Most people want to see you fail so they feel better about staying safe", checklist: ["Identify your 'inner circle' of supporters.", "Stop sharing progress with negative people.", "Let your results speak for themselves."] },
        { id: 8, title: "Your idea isn’t unique; someone else is already thinking it", checklist: ["Identify 3 competitors.", "Find one thing you can do better or different.", "Focus on execution speed."] },
        { id: 9, title: "Validation kills ego: people will tell you it sucks. Listen", checklist: ["Ask a customer 'What's the worst part about my product?'.", "Don't defend, just listen and take notes.", "Thank them for their honest feedback."] },
        { id: 10, title: "Building something for yourself is tempting but dangerous", checklist: ["Create a detailed 'customer avatar'.", "Make one product decision based on your avatar, not yourself.", "Ask 'would [avatar name] pay for this?'"] },
        { id: 11, title: "A small, obsessed niche is better than a large lukewarm market", checklist: ["Define your target niche as narrowly as possible.", "Find where this niche gathers online or offline.", "Tailor your marketing message specifically to them."] },
        { id: 12, title: "Talking to users before coding is mandatory", checklist: ["Schedule one conversation with a potential user this week.", "Prepare questions about their problems, not your solution.", "Create a 'no-code' prototype to test your idea."] },
        { id: 13, title: "Surveys lie; prototypes don’t", checklist: ["Build a simple, clickable prototype (Figma, etc.).", "Watch someone use your prototype without guiding them.", "Note where they get stuck or confused."] },
        { id: 14, title: "Solve the bleeding wound today, not the itch they might have next year", checklist: ["Identify the #1 most painful problem your niche has.", "Focus your solution exclusively on solving that one problem.", "Articulate the 'painkiller' benefit of your product."] },
        { id: 15, title: "If you aren’t embarrassed by the first version of your MVP, you shipped too late", checklist: ["List the absolute minimum features needed to solve the core problem.", "Set a launch date within 30 days.", "Launch it, even if it's not perfect."] },
        { id: 16, title: "Features are distractions. Focus on outcomes", checklist: ["For each feature, ask 'what outcome does this create?'.", "Cut one feature that doesn't directly contribute to the core outcome.", "Rewrite your marketing to sell the outcome, not the features."] },
        { id: 17, title: "You’ll iterate more than you plan. Accept it", checklist: ["Establish a weekly or bi-weekly feedback loop.", "Schedule time for 'iteration' in your calendar.", "View your product as a v1.0, not a final version."] },
        { id: 18, title: "Documentation is not sexy but will save you weeks", checklist: ["Document one key process in your business.", "Create a central place for all documentation (Notion, Google Docs).", "Update one piece of documentation this week."] },
        { id: 19, title: "Your first codebase will suck. Refactor later", checklist: ["Prioritize shipping a functional product over perfect code.", "Identify technical debt but don't fix it unless it's critical.", "Focus on user value, not code elegance, for the MVP."] },
        { id: 20, title: "UX is the silent growth engine. Ignore at your peril", checklist: ["Identify one point of friction in your user journey.", "Simplify one process for your users.", "Ask a user 'Was anything confusing?'."] },
        { id: 21, title: "A 'good' product shipped today beats a 'perfect' one that never exists", checklist: ["Commit to a shipping deadline.", "Reduce scope to meet the deadline.", "Ship it."] },
        { id: 22, title: "Your friends are liars; they love you, so they’ll let you go bankrupt with a smile", checklist: ["Get feedback from 3 strangers in your target market.", "Ignore feedback from friends and family unless they are paying customers.", "Find a community of unbiased peers."] },
        { id: 23, title: "Early adopters are gold; casual users are noise", checklist: ["Identify your 5 most engaged users.", "Ask them what they'd like to see next.", "Build a feature specifically for your power users."] },
        { id: 24, title: "People don’t buy products. They buy what solves their problem", checklist: ["Rewrite your headline to focus on the problem you solve.", "Create a 'before and after' scenario for your customer.", "Sell the transformation, not the tool."] },
        { id: 25, title: "Marketing starts before product; awareness is traction", checklist: ["Share your building process in public (Twitter, blog).", "Build an email list before you launch.", "Offer a pre-launch discount to your early audience."] },
        { id: 26, title: "Feedback is a weapon; use it like a boss, or your competitors will", checklist: ["Create a simple way for users to submit feedback.", "Respond to every piece of feedback you receive.", "Close the loop by telling users when you've implemented their suggestion."] },
        { id: 27, title: "You can't 'growth hack' a product that nobody wants", checklist: ["Confirm you have a core group of users who love your product.", "Focus on retention before acquisition.", "Solve the core problem better before seeking massive growth."] },
        { id: 28, title: "You can’t do everything", checklist: ["Define your top 3 priorities for the quarter.", "Say 'no' to one opportunity that doesn't align with your priorities.", "Delegate one task you shouldn't be doing."] },
        { id: 29, title: "Your network is your early advantage. Don’t build in isolation", checklist: ["Ask for one introduction from your network this week.", "Share your project with a relevant online community.", "Attend one networking event (online or offline)."] },
        { id: 30, title: "Hiring before revenue is a gamble; hire slow, fire fast", checklist: ["Define the exact role and ROI of a potential hire.", "Outsource or use freelancers before making a full-time hire.", "Create a clear performance plan for any new team member."] },
        { id: 31, title: "If your mentor only tells you what you want to hear, fire them", checklist: ["Find a mentor who will challenge your assumptions.", "Ask your mentor 'What am I missing?'.", "Be open to critical feedback."] },
        { id: 32, title: "Money won't fix a broken engine; it just makes the crash more spectacular", checklist: ["Ensure you have a repeatable way to get customers.", "Fix your unit economics before scaling ad spend.", "Validate your business model with a small budget first."] }
    ];

    // --- DOM Elements ---
    const hackListContainer = document.querySelector('.hack-list');
    const stageHeaderTitle = document.querySelector('.stage-header h1');
    const masteryToggleButton = document.querySelector('.btn-mastery-toggle');
    const strategyContent = document.querySelector('.strategy-content');
    const prevHackButton = document.getElementById('prev-hack-btn');
    const nextHackButton = document.getElementById('next-hack-btn');
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

    function displayHack(index) {
        currentState.currentHackIndex = index;
        const truth = truthsData[index];

        // Update active state in navigator
        document.querySelectorAll('.hack-list-item').forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.index) === index);
        });

        // Update main content
        stageHeaderTitle.textContent = truth.title;
        
        // Update mastery button
        const isMastered = !!currentState.progress[index];
        masteryToggleButton.classList.toggle('mastered', isMastered);
        masteryToggleButton.textContent = isMastered ? 'Mastered' : 'Mark as Mastered';
        masteryToggleButton.disabled = isMastered;

        // Render checklist
        strategyContent.innerHTML = '<h3>How-to Strategy</h3>';
        truth.checklist.forEach((itemText, checkIndex) => {
            const isChecked = (currentState.checklist[index] && currentState.checklist[index][checkIndex]) || false;
            const item = document.createElement('div');
            item.className = 'checklist-item';
            item.innerHTML = `
                <input type="checkbox" id="check-${index}-${checkIndex}" ${isChecked ? 'checked' : ''} ${isMastered ? 'disabled' : ''}>
                <label for="check-${index}-${checkIndex}">${itemText}</label>
            `;
            strategyContent.appendChild(item);

            item.querySelector('input').addEventListener('change', (e) => {
                handleChecklistChange(index, checkIndex, e.target.checked);
            });
        });

        // Update nav buttons
        prevHackButton.disabled = index === 0;
        nextHackButton.disabled = index === truthsData.length - 1;
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