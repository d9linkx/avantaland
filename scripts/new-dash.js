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
        currentHackIndex: 0,
        planner: { tasks: [], timer: { timeLeft: 1500, isRunning: false } },
        profile: {
            name: 'Founder',
            email: '',
            dreamResult: '',
            avatar: null
        },
        lastVisit: null
    };

    let lastVisitTime = null;

    // --- Initialization ---
    function init() {
        loadState();
        
        // Capture last visit time before updating it
        lastVisitTime = currentState.lastVisit;
        currentState.lastVisit = Date.now();
        saveState();

        renderHackNavigator();
        renderIntelligenceWing();
        renderDashboardGrid(); // Default to dashboard view
        setupMobileView(); // Initialize mobile UI
        setupAveoDrawer(); // Initialize AI Agent
        setupEventListeners();
    }

    function loadState() {
        try {
            currentState.progress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
            currentState.checklist = JSON.parse(localStorage.getItem('bizLabChecklist')) || {};
            currentState.notes = localStorage.getItem('bizLabFeedbackNotes') || '';
            currentState.planner = JSON.parse(localStorage.getItem('bizLabPlanner')) || { tasks: [], timer: { timeLeft: 1500, isRunning: false } };
            currentState.profile = JSON.parse(localStorage.getItem('bizLabProfile')) || { name: 'Founder', email: '', dreamResult: '', avatar: null };
            currentState.lastVisit = JSON.parse(localStorage.getItem('bizLabLastVisit')) || null;
        } catch (e) {
            console.error("Error loading state from localStorage", e);
        }
    }

    function saveState() {
        localStorage.setItem('bizLabProgress', JSON.stringify(currentState.progress));
        localStorage.setItem('bizLabChecklist', JSON.stringify(currentState.checklist));
        localStorage.setItem('bizLabFeedbackNotes', currentState.notes);
        localStorage.setItem('bizLabPlanner', JSON.stringify(currentState.planner));
        localStorage.setItem('bizLabProfile', JSON.stringify(currentState.profile));
        localStorage.setItem('bizLabLastVisit', JSON.stringify(currentState.lastVisit));
    }

    function setupEventListeners() {
        feedbackNotes.value = currentState.notes;
        feedbackNotes.addEventListener('input', (e) => {
            currentState.notes = e.target.value;
            saveState();
        });

        // Add listener for the main Dashboard nav item
        const dashboardNavItems = document.querySelectorAll('.sidebar-nav .nav-item');
        const dashboardNavItem = Array.from(dashboardNavItems).find(item => item.textContent.includes('Dashboard'));

        if (dashboardNavItem) {
            dashboardNavItem.addEventListener('click', (e) => {
                e.preventDefault();
                
                // De-activate other nav items and activate this one
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));
                dashboardNavItem.classList.add('active');
                
                // De-activate any active hack list item
                document.querySelectorAll('.hack-list-item.active').forEach(item => item.classList.remove('active'));

                renderDashboardGrid();
            });
        }

        // Add listener for Planner nav item if it exists in sidebar
        const plannerNavItem = Array.from(dashboardNavItems).find(item => item.textContent.includes('Planner'));
        if (plannerNavItem) {
            plannerNavItem.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));
                plannerNavItem.classList.add('active');
                renderPlanner();
            });
        }

        // Add listener for Profile nav item if it exists in sidebar
        const profileNavItem = Array.from(dashboardNavItems).find(item => item.textContent.includes('Profile'));
        if (profileNavItem) {
            profileNavItem.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));
                profileNavItem.classList.add('active');
                renderProfile();
            });
        }

        // Add listener for Community/Aveo nav item in Desktop Sidebar
        const communityNavItem = Array.from(dashboardNavItems).find(item => item.textContent.includes('Community'));
        if (communityNavItem) {
            // Rename to Aveo 1 for consistency if possible, or just hijack click
            communityNavItem.innerHTML = `<i class="ph-duotone ph-robot"></i> Aveo 1`;
            communityNavItem.addEventListener('click', (e) => {
                e.preventDefault();
                toggleAveoDrawer(true);
            });
        }
    }

    // --- Rendering Functions ---

    function renderDashboardGrid() {
        learningStage.innerHTML = `
            <div class="dashboard-header"></div>
            <div class="dashboard-grid"></div>
        `;
        updateDashboardHeader();

        const gridContainer = learningStage.querySelector('.dashboard-grid');

        // --- Card 1: Next Hack ---

        // Restore default right sidebar
        renderIntelligenceWing();
    }

    async function updateDashboardHeader() {
        const header = learningStage.querySelector('.dashboard-header');
        if (!header) return;

        // --- 1. Master Card Logic ---
        const nextHackIndex = findNextUncompletedHack();
        const nextHack = truthsData[nextHackIndex];
        
        // Calculate Progress
        let completedTasks = 0;
        let totalTasks = 0;
        
        // We need to fetch the truth HTML to count checkboxes
        try {
            const response = await fetch(`truth${nextHackIndex + 1}.html`);
            if (response.ok) {
                const text = await response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = text;
                const checkboxes = tempDiv.querySelectorAll('input[type="checkbox"]');
                totalTasks = checkboxes.length;
                
                // Count checked items from state
                const checklistState = currentState.checklist[nextHackIndex] || [];
                // We only count up to totalTasks to avoid index out of bounds if HTML changed
                for(let i=0; i<totalTasks; i++) {
                    if (checklistState[i]) completedTasks++;
                }
            }
        } catch (e) {
            console.warn("Could not fetch truth HTML for progress", e);
        }

        const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const tasksRemaining = totalTasks - completedTasks;

        // Format Last Visit
        const lastVisitStr = formatLastVisit(lastVisitTime);

        // Master Card HTML
        const masterCard = document.createElement('div');
        masterCard.className = 'master-card';
        
        let actionText = `You're currently mastering Hack #${String(nextHackIndex + 1).padStart(2, '0')}. You have ${tasksRemaining} tasks remaining before you're ready for the next level.`;
        if (tasksRemaining === 0 && totalTasks > 0) {
             actionText = `Boom! Hack #${String(nextHackIndex + 1).padStart(2, '0')} is crushed. Ready to dominate the next one? The market is waiting.`;
        } else if (totalTasks === 0) {
             actionText = `Ready to start Hack #${String(nextHackIndex + 1).padStart(2, '0')}? The market is waiting.`;
        }

        masterCard.innerHTML = `
            <div class="master-card-content">
                <p class="master-hook">Welcome back. You were last here ${lastVisitStr}.</p>
                <h3 class="master-title">Hack #${String(nextHackIndex + 1).padStart(2, '0')}</h3>
                <p class="master-action">${actionText}</p>
                <div class="master-progress-container">
                    <div class="master-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <button class="btn-master-resume">Resume <i class="ph ph-arrow-right"></i></button>
            </div>
        `;
        
        masterCard.querySelector('.btn-master-resume').addEventListener('click', () => displayHack(nextHackIndex));
        header.appendChild(masterCard);

        // --- 2. Daily Executor Card Logic ---
        const plannerTasks = currentState.planner.tasks || [];
        // Filter for Big 3 and not completed
        const big3Tasks = plannerTasks.filter(t => t.section === 'big3' && !t.completed).slice(0, 2);

        const executorCard = document.createElement('div');
        executorCard.className = 'executor-card';
        
        let tasksHtml = '';
        if (big3Tasks.length > 0) {
            tasksHtml = big3Tasks.map(t => `
                <div class="executor-task">
                    <i class="ph-fill ph-check-circle executor-check"></i>
                    <span>${t.text}</span>
                </div>
            `).join('');
        } else {
            tasksHtml = `<p class="executor-empty">No plans for today?</p>`;
        }

        executorCard.innerHTML = `
            <div class="executor-header">
                <h3>My Top 3 Goals Today</h3>
            </div>
            <div class="executor-list">
                ${tasksHtml}
            </div>
            <button class="btn-open-planner">Go to tasks <i class="ph ph-arrow-right"></i></button>
        `;

        executorCard.querySelector('.btn-open-planner').addEventListener('click', renderPlanner);
        header.appendChild(executorCard);
    }

    function formatLastVisit(timestamp) {
        if (!timestamp) return 'for the first time';
        const date = new Date(timestamp);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        
        if (date.toDateString() === now.toDateString()) {
            return `Today at ${timeStr}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday at ${timeStr}`;
        } else {
            return `${date.toLocaleDateString()} at ${timeStr}`;
        }
    }

    function renderProfileRightSidebar() {
        const wing = document.querySelector('.intelligence-wing');
        if (!wing) return;
        
        wing.innerHTML = `
            <div class="widget-card">
                <h3><i class="ph ph-cloud-check" style="color: var(--success-color);"></i> Data Health</h3>
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 1rem;">
                    <div style="width: 12px; height: 12px; background: var(--success-color); border-radius: 50%; box-shadow: 0 0 8px var(--success-color);"></div>
                    <span style="font-weight: 600; color: var(--text-primary);">Synced to Cloud</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">Your progress is safe.</p>
            </div>

            <div class="widget-card" style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); color: white; border: none;">
                <h3 style="color: #94A3B8; border-bottom-color: rgba(255,255,255,0.1);">Account Value</h3>
                <div style="margin-top: 1rem;">
                    <div style="font-size: 2.5rem; font-weight: 800; color: var(--brand-yellow);">$11.00</div>
                    <p style="font-size: 0.9rem; color: #CBD5E1; margin-top: 0.5rem; line-height: 1.5;">
                        You joined at $3.<br>
                        Current market value: $11.<br>
                        <strong style="color: white;">Your founder status is locked.</strong>
                    </p>
                </div>
            </div>
        `;
    }

    // --- CEO Execution Planner Logic ---
    let plannerTimerInterval = null;

    function renderPlanner() {
        // Load SortableJS dynamically if not present
        if (!window.Sortable) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js';
            script.onload = () => initPlannerSortable();
            document.head.appendChild(script);
        }

        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        const tasks = currentState.planner.tasks || [];
        const completedCount = tasks.filter(t => t.completed).length;
        const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

        learningStage.innerHTML = `
            <div class="planner-container">
                <div class="planner-header">
                    <h1>Daily Focus <span class="date">${today}</span></h1>
                    <div class="planner-progress-container">
                        <div class="planner-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="planner-progress-text">Daily Goal Completion: ${progress}%</div>
                </div>

                <div class="quick-add-container">
                    <input type="text" class="quick-add-input" placeholder="Any plans? (type and press Enter)" id="planner-quick-add">
                    <div style="text-align: right; margin-top: 0.5rem;">
                        <a href="#" id="why-3-link" style="font-size: 0.85rem; color: var(--brand-blue); text-decoration: underline;">Why only 3?</a>
                    </div>
                </div>

                <!-- Section A: The Big 3 -->
                <div class="planner-section section-big-3">
                    <h3><i class="ph ph-star-fill" style="color: var(--brand-yellow);"></i> Unleash the power of 3</h3>
                    <div class="planner-task-list" id="list-big-3" data-section="big3"></div>
                </div>

                <!-- Section B: Money Queue -->
                <div class="planner-section section-money">
                    <h3><i class="ph ph-currency-dollar-simple" style="color: var(--brand-blue);"></i> Money-Making Queue</h3>
                    <div class="planner-task-list" id="list-money" data-section="money"></div>
                </div>

                <!-- Section C: Deep Work Timer -->
                <div class="planner-section section-deep-work">
                    <h3>Deep Work Timer</h3>
                    <div class="timer-display" id="planner-timer-display">25:00</div>
                    <button class="btn-timer" id="btn-start-timer">Start Session</button>
                </div>
            </div>
        `;

        renderPlannerTasks();
        updateTimerDisplay();
        if (window.Sortable) initPlannerSortable();

        // Event Listeners
        const quickAdd = document.getElementById('planner-quick-add');
        quickAdd.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && quickAdd.value.trim()) {
                if (currentState.planner.tasks && currentState.planner.tasks.length >= 3) {
                    alert("You can only set 3 main goals for the day. This forces you to prioritize what truly moves the needle.");
                    return;
                }
                addPlannerTask(quickAdd.value.trim());
                quickAdd.value = '';
            }
        });

        const why3Link = document.getElementById('why-3-link');
        if (why3Link) {
            why3Link.addEventListener('click', (e) => {
                e.preventDefault();
                alert("Limiting your daily focus to 3 key tasks forces prioritization and ensures you actually complete what matters most. It prevents overwhelm and builds momentum.");
            });
        }

        document.getElementById('btn-start-timer').addEventListener('click', togglePlannerTimer);

        // Restore default right sidebar
        renderIntelligenceWing();
    }

    function renderPlannerTasks() {
        const big3List = document.getElementById('list-big-3');
        const moneyList = document.getElementById('list-money');
        if (!big3List || !moneyList) return;

        big3List.innerHTML = '';
        moneyList.innerHTML = '';

        const tasks = currentState.planner.tasks || [];
        
        if (tasks.length === 0) {
            moneyList.innerHTML = `<div style="text-align:center; color: var(--text-secondary); padding: 2rem;">
                <i class="ph ph-rocket-launch" style="font-size: 2.5rem; margin-bottom: 1rem; display: block; color: var(--brand-blue); opacity: 0.5;"></i>
                The market is waiting. What's the move today?
            </div>`;
        }

        tasks.forEach(task => {
            const el = document.createElement('div');
            el.className = `planner-task ${task.completed ? 'completed' : ''}`;
            el.dataset.id = task.id;
            el.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-content">${task.text}</span>
                ${task.valueTag ? `<span class="value-tag">${task.valueTag}</span>` : ''}
                <i class="ph ph-dots-six-vertical" style="color: #CBD5E1; cursor: grab;"></i>
            `;

            el.querySelector('.task-checkbox').addEventListener('change', () => togglePlannerTask(task.id));
            
            if (task.section === 'big3') big3List.appendChild(el);
            else moneyList.appendChild(el);
        });
    }

    function addPlannerTask(text) {
        // Check for value tag in text (e.g. "Call client $1000")
        let valueTag = null;
        const moneyMatch = text.match(/\$(\d+(?:,\d{3})*(?:k|m)?)/i);
        if (moneyMatch) {
            valueTag = moneyMatch[0] + ' Value';
        }

        const newTask = {
            id: Date.now(),
            text: text,
            section: 'money', // Default to money queue
            completed: false,
            valueTag: valueTag
        };
        
        if (!currentState.planner.tasks) currentState.planner.tasks = [];
        currentState.planner.tasks.push(newTask);
        saveState();
        renderPlanner();
    }

    function togglePlannerTask(id) {
        const task = currentState.planner.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveState();
            renderPlanner(); // Re-render to update progress bar
        }
    }

    function initPlannerSortable() {
        const containers = [document.getElementById('list-big-3'), document.getElementById('list-money')];
        containers.forEach(container => {
            if (!container) return;
            new Sortable(container, {
                group: 'planner',
                animation: 150,
                handle: '.planner-task', // Make whole card draggable or use handle
                onEnd: function (evt) {
                    const itemEl = evt.item;
                    const newSection = evt.to.dataset.section;
                    const taskId = parseInt(itemEl.dataset.id);
                    
                    const task = currentState.planner.tasks.find(t => t.id === taskId);
                    if (task) {
                        task.section = newSection;
                        saveState();
                        // Optional: Re-render to ensure clean state, but Sortable handles DOM
                        // renderPlannerTasks(); 
                    }
                }
            });
        });
    }

    function togglePlannerTimer() {
        const btn = document.getElementById('btn-start-timer');
        if (plannerTimerInterval) {
            clearInterval(plannerTimerInterval);
            plannerTimerInterval = null;
            btn.textContent = 'Resume Session';
            btn.classList.remove('active');
            currentState.planner.timer.isRunning = false;
        } else {
            plannerTimerInterval = setInterval(() => {
                currentState.planner.timer.timeLeft--;
                if (currentState.planner.timer.timeLeft <= 0) {
                    clearInterval(plannerTimerInterval);
                    plannerTimerInterval = null;
                    currentState.planner.timer.timeLeft = 1500; // Reset
                    currentState.planner.timer.isRunning = false;
                    btn.textContent = 'Start Session';
                    btn.classList.remove('active');
                    alert("Deep Work Session Complete!");
                }
                updateTimerDisplay();
                saveState();
            }, 1000);
            btn.textContent = 'Pause Session';
            btn.classList.add('active');
            currentState.planner.timer.isRunning = true;
        }
        saveState();
    }

    function updateTimerDisplay() {
        const display = document.getElementById('planner-timer-display');
        if (!display) return;
        const time = currentState.planner.timer.timeLeft;
        const m = Math.floor(time / 60).toString().padStart(2, '0');
        const s = (time % 60).toString().padStart(2, '0');
        display.textContent = `${m}:${s}`;
    }

    // --- Profile & Settings Logic ---
    function renderProfile() {
        const hacksMastered = Object.keys(currentState.progress).length;
        // Mock data for days active/streak since we don't track login dates yet
        const daysActive = 45; 
        const dailyStreak = 5;

        learningStage.innerHTML = `
            <div class="profile-container">
                <!-- 1. Profile Header -->
                <div class="profile-header-card">
                    <div class="profile-identity">
                        <div class="avatar-wrapper">
                            <img src="${currentState.profile.avatar || 'https://ui-avatars.com/api/?name=' + currentState.profile.name + '&background=2979FF&color=fff'}" alt="Profile" class="profile-avatar-large" id="profile-avatar-img">
                            <button class="btn-edit-avatar" id="btn-upload-avatar"><i class="ph ph-pencil-simple"></i></button>
                            <input type="file" id="avatar-upload-input" accept="image/*" style="display: none;">
                        </div>
                        <div class="identity-info">
                            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                                <h1>${currentState.profile.name}</h1>
                                <span class="member-badge">Test Group Founder</span>
                            </div>
                            <div class="quick-stats">
                                <div class="stat-item">
                                    <span class="stat-value">${hacksMastered}/33</span>
                                    <span class="stat-label">Hacks Mastered</span>
                                </div>
                                <div class="stat-divider"></div>
                                <div class="stat-item">
                                    <span class="stat-value">${daysActive}</span>
                                    <span class="stat-label">Days Active</span>
                                </div>
                                <div class="stat-divider"></div>
                                <div class="stat-item">
                                    <span class="stat-value">${dailyStreak}</span>
                                    <span class="stat-label">Daily Streak</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 2. Tabbed Navigation -->
                <div class="profile-tabs">
                    <button class="tab-btn active" data-tab="account">Account</button>
                    <button class="tab-btn" data-tab="business">Business Profile</button>
                    <button class="tab-btn" data-tab="preferences">Preferences</button>
                </div>

                <!-- 3. Functional Settings Cards -->
                <div class="settings-content">
                    <!-- Account Tab -->
                    <div class="settings-tab active" id="tab-account">
                        <div class="settings-card">
                            <h3>Personal Information</h3>
                            <div class="form-group">
                                <label>Full Name</label>
                                <input type="text" id="input-name" value="${currentState.profile.name}" class="settings-input">
                            </div>
                            <div class="form-group">
                                <label>Email Address</label>
                                <input type="email" id="input-email" value="${currentState.profile.email}" class="settings-input" placeholder="founder@example.com">
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" value="********" class="settings-input" disabled>
                                <button class="btn-text-link" style="margin-top: 0.5rem;">Change Password</button>
                            </div>
                        </div>
                    </div>

                    <!-- Business Profile Tab -->
                    <div class="settings-tab" id="tab-business">
                        <div class="settings-card">
                            <h3>Your Dream Result</h3>
                            <p class="helper-text">What is the single biggest outcome you are working toward?</p>
                            <textarea id="input-dream" class="settings-textarea" placeholder="e.g. Build a $1M ARR SaaS company...">${currentState.profile.dreamResult}</textarea>
                        </div>
                    </div>

                    <!-- Preferences Tab -->
                    <div class="settings-tab" id="tab-preferences">
                        <div class="settings-card">
                            <h3>App Preferences</h3>
                            <div class="toggle-row">
                                <span>Daily Reminder</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="toggle-row">
                                <span>Marketing Alerts</span>
                                <label class="toggle-switch">
                                    <input type="checkbox">
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="toggle-row">
                                <span>Dark Mode</span>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="toggle-dark-mode">
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="profile-actions">
                    <button class="btn-save-changes" id="btn-save-profile">Save Changes</button>
                    <button class="btn-logout">Log Out</button>
                </div>
            </div>
        `;

        // Update Right Sidebar
        renderProfileRightSidebar();

        // Event Listeners
        // Tabs
        const tabs = learningStage.querySelectorAll('.tab-btn');
        const contents = learningStage.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                learningStage.querySelector(`#tab-${tab.dataset.tab}`).classList.add('active');
            });
        });

        // Image Upload
        const uploadBtn = document.getElementById('btn-upload-avatar');
        const fileInput = document.getElementById('avatar-upload-input');
        const avatarImg = document.getElementById('profile-avatar-img');

        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    avatarImg.src = e.target.result;
                    currentState.profile.avatar = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Save Changes
        document.getElementById('btn-save-profile').addEventListener('click', () => {
            const nameInput = document.getElementById('input-name');
            const emailInput = document.getElementById('input-email');
            const dreamInput = document.getElementById('input-dream');

            // Validation
            if (!nameInput.value.trim()) {
                alert("Name cannot be empty.");
                return;
            }
            if (emailInput.value && !emailInput.value.includes('@')) {
                alert("Please enter a valid email.");
                return;
            }

            currentState.profile.name = nameInput.value.trim();
            currentState.profile.email = emailInput.value.trim();
            currentState.profile.dreamResult = dreamInput ? dreamInput.value.trim() : currentState.profile.dreamResult;
            
            saveState();
            alert("Profile updated successfully!");
            
            // Update sidebar profile name if visible
            const sidebarName = document.querySelector('.sidebar-profile .profile-name');
            if (sidebarName) sidebarName.textContent = currentState.profile.name;
        });

        // Logout (Mock)
        learningStage.querySelector('.btn-logout').addEventListener('click', () => {
            if(confirm("Are you sure you want to log out?")) {
                alert("Logged out.");
                location.reload();
            }
        });
    }

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
                    
                    const checklistEl = tempDiv.querySelector('.truth-checklist');
                    if (checklistEl) {
                        const h3 = checklistEl.querySelector('h3');
                        if (h3) {
                            h3.textContent = 'To use this hack, do this:';
                            const subtitle = document.createElement('p');
                            subtitle.className = 'checklist-subtitle';
                            subtitle.textContent = '(Only tick these off when you have actually done them)';
                            h3.after(subtitle);
                        }
                        checklistContent = checklistEl.innerHTML;
                    }

                    fullContentHTML = tempDiv.querySelector('#full-truth-content')?.innerHTML || '';
                }
            } catch (e) {
                console.warn(`Could not fetch truth${index + 1}.html`, e);
            }
        }

        learningStage.innerHTML = `
            <div class="stage-nav-top">
                <button class="btn-back-dashboard" id="back-to-dashboard-btn"><i class="ph ph-arrow-left"></i> Back to Dashboard</button>
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
                <button id="prev-hack-btn" class="btn-prev-truth" ${index === 0 ? 'disabled' : ''}><i class="ph ph-arrow-left"></i> Previous Truth</button>
                <button id="next-hack-btn" class="btn-next-truth" ${index === truthsData.length - 1 ? 'disabled' : ''}>Next Truth <i class="ph ph-arrow-right"></i></button>
            </div>
        `;

        // --- Event Listeners for New Elements ---

        // Back to Dashboard Button
        const backToDashBtn = learningStage.querySelector('#back-to-dashboard-btn');
        if (backToDashBtn) {
            backToDashBtn.addEventListener('click', renderDashboardGrid);
        }
        
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
                    // If clicking the checkbox directly, let it happen
                    if (e.target === checkbox) return;

                    // Prevent native label behavior to avoid double-toggling
                    e.preventDefault();

                    if (!checkbox.disabled) {
                        checkbox.checked = !checkbox.checked;
                        // Trigger change event to update state
                        checkbox.dispatchEvent(new Event('change'));
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
                if (allChecked) {
                    // Change text to indicate the next action is to complete the truth.
                    completeBtn.innerHTML = `<i class="ph ph-check"></i> Complete`;
                } else {
                    // Revert to the default text if not all items are checked.
                    completeBtn.innerHTML = `<i class="ph ph-check"></i> Mark as Completed`;
                }
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

        // Previous Truth Button
        const prevBtn = learningStage.querySelector('#prev-hack-btn');
        prevBtn.addEventListener('click', () => {
            if (index > 0) {
                displayHack(index - 1);
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

        // Update persistent UI elements immediately
        renderHackNavigator();
        renderIntelligenceWing();

        // After a short delay, advance to the next available truth
        setTimeout(() => {
            if (index < truthsData.length - 1) {
                displayHack(index + 1);
            } else {
                // If it's the last truth, just re-render it in its completed state.
                displayHack(index);
            }
        }, 500); // 500ms delay allows user to perceive the change in navigator/gauge
    }

    // Listen for updates from other tabs (sync-back)
    window.addEventListener('storage', (e) => {
        if (e.key === 'bizLabProgress') location.reload();
    });

    // --- Mobile View Setup ---
    function setupMobileView() {
        const container = document.querySelector('.workstation-container');
        // Avoid duplicates if re-run
        if (!container || document.querySelector('.mobile-top-bar')) return;

        // Create Mobile Header
        const mobileHeader = document.createElement('div');
        mobileHeader.className = 'mobile-top-bar';
        mobileHeader.innerHTML = `
            <a href="index.html" class="logo"><img src="images/avblack.png" alt="Avantaland Logo" class="mobile-logo"><span>Avantaland<span class="logo-academy">Academy</span></span></a>
        `;

        // Insert at top of container
        container.insertBefore(mobileHeader, container.firstChild);

        // Create Bottom Navigation
        const bottomNav = document.createElement('div');
        bottomNav.className = 'mobile-bottom-nav';
        bottomNav.innerHTML = `
            <button class="mobile-nav-item active" data-target="home">
                <i class="ph-duotone ph-house"></i>
                <span>Home</span>
            </button>
            <button class="mobile-nav-item" data-target="hacks">
                <i class="ph-duotone ph-list-dashes"></i>
                <span>Hacks</span>
            </button>
            <button class="mobile-nav-item" data-target="planner" id="mobile-nav-planner">
                <i class="ph-duotone ph-calendar-check"></i>
                <span>Planner</span>
            </button>
            <button class="mobile-nav-item" data-target="aveo">
                <i class="ph-duotone ph-robot"></i>
                <span>Aveo 1</span>
            </button>
            <button class="mobile-nav-item" data-target="profile">
                <i class="ph-duotone ph-user-circle"></i>
                <span>Profile</span>
            </button>
        `;
        document.body.appendChild(bottomNav);

        // Create Overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);

        // Inject CSS for Hacks Drawer
        const style = document.createElement('style');
        style.innerHTML = `
            .hacks-drawer {
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 30vh;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border-radius: 24px 24px 0 0;
                box-shadow: 0 -10px 40px rgba(0,0,0,0.15);
                z-index: 2000;
                transform: translateY(100%);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex;
                flex-direction: column;
            }
            .hacks-drawer.active {
                transform: translateY(0);
            }
            .drawer-header {
                padding: 1rem;
                border-bottom: 1px solid rgba(0,0,0,0.05);
            }
            .search-container {
                background: rgba(0,0,0,0.05);
                border-radius: 12px;
                padding: 0.5rem 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .search-container input {
                border: none;
                background: transparent;
                width: 100%;
                outline: none;
                font-size: 1rem;
                color: var(--text-primary);
            }
            .drawer-list {
                overflow-y: auto;
                flex: 1;
                padding: 0.5rem 0;
            }
            .drawer-item {
                padding: 0.75rem 1.5rem;
                border-bottom: 1px solid rgba(41, 121, 255, 0.1);
                font-size: 0.95rem;
                color: var(--text-primary);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .drawer-item.active {
                color: var(--brand-blue);
                font-weight: 600;
            }
            .drawer-item.active::before {
                content: '';
                display: block;
                width: 6px;
                height: 6px;
                background: var(--brand-yellow);
                border-radius: 50%;
            }
            body.drawer-open {
                overflow: hidden !important;
            }
        `;
        document.head.appendChild(style);

        // Create Hacks Drawer
        const drawer = document.createElement('div');
        drawer.className = 'hacks-drawer';
        drawer.innerHTML = `
            <div class="drawer-header">
                <div class="search-container">
                    <i class="ph ph-magnifying-glass"></i>
                    <input type="text" placeholder="Find a hack..." id="hack-search-input">
                </div>
            </div>
            <div class="drawer-list" id="hacks-drawer-list"></div>
        `;
        document.body.appendChild(drawer);

        // Toggle Logic
        const sidebar = document.querySelector('.hack-navigator');
        const overlayEl = document.querySelector('.mobile-overlay');
        const navItems = bottomNav.querySelectorAll('.mobile-nav-item');

        function setActiveNav(target) {
            navItems.forEach(item => item.classList.remove('active'));
            const activeItem = bottomNav.querySelector(`[data-target="${target}"]`);
            if (activeItem) activeItem.classList.add('active');
        }

        function toggleSidebar(show) {
            if (show) {
                sidebar.classList.add('active');
                overlayEl.classList.add('active');
            } else {
                sidebar.classList.remove('active');
                overlayEl.classList.remove('active');
            }
        }

        const drawerList = drawer.querySelector('#hacks-drawer-list');
        const searchInput = drawer.querySelector('#hack-search-input');

        function renderDrawerItems(filter = '') {
            drawerList.innerHTML = '';
            truthsData.forEach((truth, index) => {
                if (truth.title.toLowerCase().includes(filter.toLowerCase()) || String(index + 1).includes(filter)) {
                    const item = document.createElement('div');
                    item.className = `drawer-item ${currentState.currentHackIndex === index ? 'active' : ''}`;
                    item.innerHTML = `${String(index + 1).padStart(2, '0')}. ${truth.title}`;
                    item.addEventListener('click', () => {
                        displayHack(index);
                        toggleDrawer(false);
                    });
                    drawerList.appendChild(item);
                }
            });
        }
        renderDrawerItems();

        searchInput.addEventListener('input', (e) => renderDrawerItems(e.target.value));

        function toggleDrawer(show) {
            if (show) {
                drawer.classList.add('active');
                overlayEl.classList.add('active');
                document.body.classList.add('drawer-open');
                renderDrawerItems(); // Re-render to show active state
            } else {
                drawer.classList.remove('active');
                overlayEl.classList.remove('active');
                document.body.classList.remove('drawer-open');
            }
        }

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = item.dataset.target;
                
                e.preventDefault();
                setActiveNav(target);

                if (target === 'hacks') {
                    toggleSidebar(false);
                    toggleDrawer(true);
                } else {
                    toggleSidebar(false);
                    toggleDrawer(false);
                    if (target === 'home') {
                        renderDashboardGrid();
                    } else if (target === 'planner') {
                        renderPlanner();
                    } else if (target === 'aveo') {
                        toggleAveoDrawer(true);
                    } else if (target === 'community' || target === 'profile') {
                        alert(`${target.charAt(0).toUpperCase() + target.slice(1)} feature coming soon!`);
                    }
                }
            });
        });
        
        overlayEl.addEventListener('click', () => {
            toggleSidebar(false);
            toggleDrawer(false);
            setActiveNav('home'); // Revert to home when closing sidebar via overlay
        });

        // Close menu when clicking a link in sidebar (Event delegation)
        sidebar.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item') || e.target.closest('.hack-list-item') || e.target.closest('.sidebar-profile')) {
                if (window.innerWidth <= 1024) {
                    toggleSidebar(false);
                    // Keep 'hacks' active or switch to home? 
                    // Usually clicking a hack opens it in the view, so maybe switch to home/view state visually?
                    // For now, let's leave it as is or switch to home to indicate content view.
                    // setActiveNav('home'); 
                }
            }
        });
    }

    // --- Aveo 1 AI Agent Logic ---
    function setupAveoDrawer() {
        if (document.querySelector('.aveo-drawer')) return;

        const drawer = document.createElement('div');
        drawer.className = 'aveo-drawer';
        drawer.innerHTML = `
            <div class="aveo-header">
                <div class="aveo-identity">
                    <div class="aveo-avatar"><i class="ph-duotone ph-robot"></i></div>
                    <div>
                        <h3>Aveo 1</h3>
                        <span class="aveo-status">Online • 24/7 Mentor</span>
                    </div>
                </div>
                <button class="aveo-close"><i class="ph ph-x"></i></button>
            </div>
            <div class="aveo-messages" id="aveo-messages">
                <div class="aveo-message ai">
                    Founders don't sleep, but they do need strategy. I'm Aveo. What's the roadblock today?
                </div>
            </div>
            <div class="aveo-chips">
                <button class="aveo-chip">Explain this Truth</button>
                <button class="aveo-chip">Give me a script</button>
                <button class="aveo-chip">I'm feeling lazy</button>
                <button class="aveo-chip">Roast my progress</button>
            </div>
            <div class="aveo-input-area">
                <input type="text" class="aveo-input" placeholder="Ask Aveo anything..." id="aveo-input">
                <button class="aveo-send" id="aveo-send"><i class="ph-fill ph-paper-plane-right"></i></button>
            </div>
        `;
        document.body.appendChild(drawer);

        // Event Listeners
        drawer.querySelector('.aveo-close').addEventListener('click', () => toggleAveoDrawer(false));
        
        const input = drawer.querySelector('#aveo-input');
        const sendBtn = drawer.querySelector('#aveo-send');
        const chips = drawer.querySelectorAll('.aveo-chip');

        const sendMessage = async (text) => {
            if (!text.trim()) return;
            
            // Add User Message
            addAveoMessage(text, 'user');
            input.value = '';

            // Show Typing Indicator (Mock)
            const typingId = addAveoMessage('<i class="ph ph-dots-three-circle"></i> Thinking...', 'ai');

            // Prepare Context
            const currentTruth = truthsData[currentState.currentHackIndex];
            const plannerStats = currentState.planner.tasks ? 
                `${currentState.planner.tasks.filter(t => t.completed).length}/${currentState.planner.tasks.length} tasks done` : 'No tasks set';
            
            const systemContext = `
                You are Aveo 1, a high-performance business mentor for the "Avantaland" methodology.
                Your Persona: Direct, witty, high-energy, zero-BS. You are a peer, not a robot.
                User Profile: ${currentState.profile.name}, Dream: ${currentState.profile.dreamResult || 'Not set'}.
                Current Context: User is viewing Truth #${currentState.currentHackIndex + 1}: "${currentTruth.title}".
                Planner Status: ${plannerStats}.
                Goal: Push the user to execute. If they are lazy, call them out using their Dream Result as leverage.
            `;

            try {
                // Call API (Assuming /api/chat or similar exists based on chat.js presence)
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [
                            { role: "system", content: systemContext },
                            { role: "user", content: text }
                        ]
                    })
                });

                const data = await response.json();
                
                // Remove typing indicator
                const typingMsg = document.getElementById(typingId);
                if (typingMsg) typingMsg.remove();

                if (data.choices && data.choices[0]) {
                    addAveoMessage(data.choices[0].message.content, 'ai');
                } else {
                    // Fallback if API fails or is not set up
                    addAveoMessage("I'm having trouble connecting to the mainframe. But here's a truth: Action cures fear. Go do something.", 'ai');
                }
            } catch (e) {
                console.error(e);
                const typingMsg = document.getElementById(typingId);
                if (typingMsg) typingMsg.remove();
                addAveoMessage("Connection offline. But you shouldn't be. Get back to work.", 'ai');
            }
        };

        sendBtn.addEventListener('click', () => sendMessage(input.value));
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage(input.value);
        });

        chips.forEach(chip => {
            chip.addEventListener('click', () => sendMessage(chip.textContent));
        });
    }

    function toggleAveoDrawer(show) {
        const drawer = document.querySelector('.aveo-drawer');
        const overlay = document.querySelector('.mobile-overlay'); // Reuse existing overlay
        if (!drawer) return;

        if (show) {
            drawer.classList.add('active');
            if (overlay) overlay.classList.add('active');
        } else {
            drawer.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }
    }

    function addAveoMessage(html, type) {
        const container = document.getElementById('aveo-messages');
        const msgDiv = document.createElement('div');
        const id = 'msg-' + Date.now();
        msgDiv.id = id;
        msgDiv.className = `aveo-message ${type}`;
        msgDiv.innerHTML = html;
        container.appendChild(msgDiv);
        container.scrollTop = container.scrollHeight;
        return id;
    }

    // --- Helper Functions ---
    function createPowerCard(category, title, iconClass, colorClass, href = null) {
        const card = document.createElement(href ? 'a' : 'div');
        if (href) {
            card.href = href;
        }
        card.className = 'power-card';
        card.innerHTML = `
        <i class="ph-duotone ${iconClass} card-icon ${colorClass}"></i>
            <p class="card-category">${category}</p>
            <h4>${title}</h4>
        `;
        return card;
    }

    function findNextUncompletedHack() {
        // Find the first index that is not marked as true in progress
        const firstUncompleted = truthsData.findIndex(truth => !currentState.progress[truth.id]);
        // If all are completed, it returns -1. Default to the last hack.
        return firstUncompleted !== -1 ? firstUncompleted : truthsData.length - 1;
    }

    function getUrgentPlannerTask() {
        try {
            const tasks = JSON.parse(localStorage.getItem('avantaland_planner_tasks')) || [];
            const slotOrder = JSON.parse(localStorage.getItem('avantaland_planner_slotOrder')) || ['revenue', 'operations', 'development'];
            
            for (const slot of slotOrder) {
                const task = tasks.find(t => t.slot === slot && t.status === 'active' && !t.completed);
                if (task) {
                    return task.text;
                }
            }
            return null;
        } catch (e) {
            console.error("Could not load planner tasks.", e);
            return 'Could not load planner tasks.';
        }
    }

    init();
});