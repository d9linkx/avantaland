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
    let taskSystemInterval = null;
    const timerBeep = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

    // --- Initialization ---
    function init() {
        loadState();
        
        // Auth Check: Redirect if no email is found in the profile
        if (!currentState.profile || !currentState.profile.email) {
            window.location.href = 'onboardingdash.html';
            return;
        }

        // Capture last visit time before updating it
        lastVisitTime = currentState.lastVisit;
        currentState.lastVisit = Date.now();
        saveState();

        renderHackNavigator();
        renderDesktopSidebar();
        renderIntelligenceWing();
        renderDashboardGrid(); // Default to dashboard view
        setupMobileView(); // Initialize mobile UI
        setupAveoDrawer(); // Initialize AI Agent
        setupEventListeners();
        updateSidebarProfileDisplay(); // Update sidebar with profile data

        // Start the global task timer system
        if (!taskSystemInterval) taskSystemInterval = setInterval(checkTaskSystem, 1000);
    }

    function loadState() {
        try {
            currentState.progress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
            currentState.checklist = JSON.parse(localStorage.getItem('bizLabChecklist')) || {};
            currentState.notes = localStorage.getItem('bizLabFeedbackNotes') || '';
            
            // Load Planner with defaults for new features
            const defaultPlanner = { 
                tasks: [], 
                timer: { timeLeft: 1500, isRunning: false },
                pipeline: [{id: 1, text: '', active: true}, {id: 2, text: '', active: true}, {id: 3, text: '', active: true}],
                content: { text: '', logged: false },
                leads: [],
                reflections: [],
                lastBaggedTimestamp: null
            };
            let plannerData = JSON.parse(localStorage.getItem('bizLabPlanner') || '{}');
            if (plannerData.tasks) {
                plannerData.tasks.forEach(task => {
                    // One-time migration for old tasks with HH:MM strings
                    if (task.startTime && typeof task.startDateTime === 'undefined') {
                        const today = new Date();
                        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                        
                        if (task.startTime) task.startDateTime = new Date(`${todayStr}T${task.startTime}`).toISOString();
                        if (task.endTime) task.endDateTime = new Date(`${todayStr}T${task.endTime}`).toISOString();
                        
                        delete task.startTime;
                        delete task.endTime;
                    }
                });
            }
            currentState.planner = { ...defaultPlanner, ...plannerData };
            
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
        updateSidebarProfileDisplay();
    }

    function updateSidebarProfileDisplay() {
        const sidebarProfile = document.querySelector('.sidebar-profile');
        if (sidebarProfile && currentState.profile) {
            // Update click handler to navigate to profile view within SPA
            sidebarProfile.removeAttribute('onclick');
            sidebarProfile.onclick = (e) => {
                e.preventDefault();
                renderProfile();
                document.querySelectorAll('.sidebar-nav .nav-item').forEach(i => i.classList.remove('active'));
                document.querySelector('.sidebar-nav .nav-item[data-target="profile"]')?.classList.add('active');
            };

            const p = currentState.profile;
            // Use image if available, else fallback to initial
            const avatarHtml = p.avatar 
                ? `<img src="${p.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">`
                : `<div class="profile-avatar">${p.name.charAt(0).toUpperCase()}</div>`;
            
            sidebarProfile.innerHTML = `
                ${avatarHtml}
                <div class="profile-info">
                    <span class="profile-name">${p.name}</span>
                    <span class="profile-role">${p.primarySkill || 'Founder'}</span>
                </div>
            `;
        }
        
        // Update Mobile Nav Profile Icon
        const mobileProfile = document.querySelector('.mobile-nav-item[data-target="profile"]');
        if (mobileProfile && currentState.profile) {
            const p = currentState.profile;
            // Check if we need to update icon to image
            const icon = mobileProfile.querySelector('i');
            const existingImg = mobileProfile.querySelector('img');
            
            if (p.avatar) {
                if (icon) icon.remove();
                if (existingImg) {
                    existingImg.src = p.avatar;
                } else {
                    const img = document.createElement('img');
                    img.src = p.avatar;
                    img.style.width = '24px';
                    img.style.height = '24px';
                    img.style.borderRadius = '50%';
                    img.style.objectFit = 'cover';
                    img.style.marginBottom = '4px';
                    mobileProfile.insertBefore(img, mobileProfile.firstChild);
                }
            }
        }
    }

    function setupEventListeners() {
        feedbackNotes.value = currentState.notes;
        feedbackNotes.addEventListener('input', (e) => {
            currentState.notes = e.target.value;
            saveState();
        });
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

        const firstName = currentState.profile.name ? currentState.profile.name.split(' ')[0] : 'Founder';

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
        
        let actionText = `${firstName}, you're currently mastering Hack #${String(nextHackIndex + 1).padStart(2, '0')}. You have ${tasksRemaining} tasks remaining before you're ready for the next level.`;
        if (tasksRemaining === 0 && totalTasks > 0) {
             actionText = `Boom! Hack #${String(nextHackIndex + 1).padStart(2, '0')} is crushed. Ready to dominate the next one, ${firstName}? The market is waiting.`;
        } else if (totalTasks === 0) {
             actionText = `Ready to start Hack #${String(nextHackIndex + 1).padStart(2, '0')}, ${firstName}? The market is waiting.`;
        }

        masterCard.innerHTML = `
            <div class="master-card-content">
                <p class="master-hook">Welcome back, ${firstName}. You were last here ${lastVisitStr}.</p>
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
        const big3Tasks = plannerTasks.filter(t => t.section === 'big3' && !t.completed).slice(0, 3);

        // Analyze Focus
        const taskTexts = big3Tasks.map(t => t.text).join(' ').toLowerCase();
        let focusType = "General Execution";
        let motivation = "Clear these tasks to build momentum.";
        
        if (big3Tasks.length === 0) {
            focusType = "Planning Mode";
            motivation = `Set your top 3 goals for today, tomorrow, or next week, ${firstName}. This will help you prioritize and execute better.`;
        } else if (taskTexts.match(/call|email|sell|close|\$|lead|prospect|client/)) {
            focusType = "Revenue Focus";
            motivation = `You're hunting today, ${firstName}. Prioritize the tasks that bring in cash.`;
        } else if (taskTexts.match(/build|fix|code|design|write|create|launch|develop/)) {
            focusType = "Product Focus";
            motivation = `Deep work mode. You are building the asset, ${firstName}.`;
        } else if (taskTexts.match(/plan|organize|meeting|review|hire|strategy/)) {
            focusType = "Strategy Focus";
            motivation = `Setting the stage for scale. Keep it efficient, ${firstName}.`;
        }

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
        }

        executorCard.innerHTML = `
            <div class="executor-header">
                <span class="executor-focus-badge">${focusType}</span>
            </div>
            <p class="executor-explanation">${motivation}</p>
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

        const firstName = currentState.profile.name ? currentState.profile.name.split(' ')[0] : 'Founder';

        learningStage.innerHTML = `
            <div class="planner-container">
                <div class="planner-header">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h1>My Focus Today <span class="date">${today}</span></h1>
                        <a href="#" id="nav-to-business" style="font-weight: 600; color: var(--brand-blue); text-decoration: none; display: flex; align-items: center; gap: 0.5rem; font-size: 1rem;">
                            Business <i class="ph-bold ph-arrow-right"></i>
                        </a>
                    </div>
                    <div class="planner-progress-container">
                        <div class="planner-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="planner-progress-text">Daily Goal Completion: ${progress}%. I believe in you, ${firstName}.</div>
                </div>

                <div class="quick-add-container">
                    <input type="text" class="quick-add-input" placeholder="What's your goal? Type it here & press 'Enter'" id="planner-quick-add">
                </div>

                <!-- Section A: The Big 3 -->
                <div class="planner-section section-big-3">
                    <h3><i class="ph ph-star-fill" style="color: var(--brand-yellow);"></i> Unleash the power of 3</h3>
                    <div class="planner-task-list" id="list-big-3" data-section="big3"></div>
                    <div style="text-align: left; margin-top: 0.5rem;">
                        <a href="#" id="why-3-link" style="font-size: 0.85rem; color: #000000; text-decoration: underline;">Why only 3?</a>
                        <p id="why-3-explanation" style="display: none; font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.5; font-style: italic;">
                            Limiting your daily focus to 3 key tasks forces ruthless prioritization, ensuring you tackle what truly moves the needle. It prevents the paralysis of a long to-do list and builds powerful momentum as you complete them. By constraining your focus, you guarantee execution on the things that actually matter for your growth.
                        </p>
                    </div>
                </div>

                <!-- Section B: Money Queue -->
                <div class="planner-section section-money">
                    <h3><i class="ph ph-currency-dollar-simple" style="color: var(--brand-blue);"></i> My Top 3 Tasks</h3>
                    <div class="planner-task-list" id="list-money" data-section="money"></div>
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
                const explanation = document.getElementById('why-3-explanation');
                if (explanation.style.display === 'none') {
                    explanation.style.display = 'block';
                } else {
                    explanation.style.display = 'none';
                }
            });
        }

        document.getElementById('nav-to-business').addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav .nav-item').forEach(i => i.classList.remove('active'));
            document.querySelector('.sidebar-nav .nav-item[data-target="business"]')?.classList.add('active');
            renderBusinessDashboard();
        });

        const timerBtn = document.getElementById('btn-start-timer');
        if (timerBtn) timerBtn.addEventListener('click', togglePlannerTimer);
        
        document.getElementById('btn-rollover').addEventListener('click', rolloverTasks);
        document.getElementById('btn-timeline').addEventListener('click', openTimelineModal);
        document.getElementById('btn-focus-tools').addEventListener('click', openFocusConfigModal);
        document.getElementById('btn-daily-review').addEventListener('click', openDailyReviewModal);

        // Restore default right sidebar
        renderIntelligenceWing();
    }

    function renderBusinessDashboard() {
        if (!window.Sortable) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js';
            script.onload = () => initLeadBucketsSortable();
            document.head.appendChild(script);
        }

        const firstName = currentState.profile.name ? currentState.profile.name.split(' ')[0] : 'Founder';

        learningStage.innerHTML = `
            <div class="planner-container">
                <div class="planner-header">
                    <h1>Business & Sales Funnel</h1>
                    <p style="color: var(--text-secondary);">Drag leads through the stages to track your revenue flow, ${firstName}.</p>
                </div>

                <div class="funnel-container">
                    <!-- Stage 1: The Hunt -->
                    <div class="funnel-card card-hunt">
                        <div class="card-header">
                            <div class="header-icon"><i class="ph-duotone ph-binoculars"></i></div>
                            <div class="header-info">
                                <h3>The Hunt</h3>
                                <span>Incoming Leads</span>
                            </div>
                            <div class="stage-count-badge" id="count-hunt">0</div>
                        </div>
                        <div class="lead-bucket" id="bucket-hunt" data-bucket="hunt"></div>
                    </div>

                    <!-- Stage 2: The Heat -->
                    <div class="funnel-card card-heat">
                        <div class="card-header">
                            <div class="header-icon"><i class="ph-duotone ph-fire"></i></div>
                            <div class="header-info">
                                <h3>The Heat</h3>
                                <span>Active Negotiations</span>
                            </div>
                            <div class="stage-count-badge" id="count-heat">0</div>
                        </div>
                        <div class="lead-bucket" id="bucket-heat" data-bucket="heat"></div>
                    </div>

                    <!-- Stage 3: The Bag -->
                    <div class="funnel-card card-bag">
                        <div class="card-header">
                            <div class="header-icon"><i class="ph-duotone ph-check-circle"></i></div>
                            <div class="header-info">
                                <h3>The Bag</h3>
                                <span>Closed Deals</span>
                            </div>
                            <div class="stage-count-badge" id="count-bag">0</div>
                        </div>
                        <div class="lead-bucket" id="bucket-bag" data-bucket="bag"></div>
                    </div>
                </div>

                <button class="btn-add-lead-floating" id="btn-add-lead">
                    <i class="ph-bold ph-plus"></i> New Lead
                </button>
            </div>
        `;

        renderLeadTokens();
        if (window.Sortable) initLeadBucketsSortable();

        const addLeadBtn = document.getElementById('btn-add-lead');
        if (addLeadBtn) addLeadBtn.addEventListener('click', addLead);
    }

    function renderPlannerTasks() {
        const big3List = document.getElementById('list-big-3');
        const moneyList = document.getElementById('list-money');
        if (!big3List || !moneyList) return;

        big3List.innerHTML = '';
        moneyList.innerHTML = '';

        const tasks = currentState.planner.tasks || [];

        // Helper to truncate description to 15 words
        const getTruncatedDesc = (text) => {
            if (!text) return '';
            const words = text.split(/\s+/);
            if (words.length > 15) {
                return words.slice(0, 15).join(' ') + '...';
            }
            return text;
        };

        // Determine if we should show the "Big 3" or "Money Queue" based on task count
        const big3Tasks = tasks.filter(t => t.section === 'big3');
        const moneyTasks = tasks.filter(t => t.section === 'money');

        const big3Section = document.querySelector('.section-big-3');
        const moneySection = document.querySelector('.section-money');

        if (big3Section) {
            if (big3Tasks.length === 0 && tasks.length > 0) {
                big3Section.style.display = 'none';
            } else {
                big3Section.style.display = 'block';
            }
        }
        if (moneySection) {
            if (moneyTasks.length === 0 && tasks.length > 0) {
                moneySection.style.display = 'none';
            } else {
                moneySection.style.display = 'block';
            }
        }
        
        const firstName = currentState.profile.name ? currentState.profile.name.split(' ')[0] : 'Founder';

        if (tasks.length === 0) {
            moneyList.innerHTML = `<div style="text-align:center; color: var(--text-secondary); padding: 2rem;">
                <i class="ph ph-rocket-launch" style="font-size: 2.5rem; margin-bottom: 1rem; display: block; color: var(--brand-blue); opacity: 0.5;"></i>
                The market is waiting. What do you want to achieve today, ${firstName}? Type it in the box above and hit 'Enter' to set your focus and start building momentum.
            </div>`;
        }

        tasks.forEach(task => {
            const el = document.createElement('div');
            el.className = `planner-task ${task.completed ? 'completed' : ''} priority-${task.priority || 'medium'}`;
            el.dataset.id = task.id;
            
            // Ensure defaults for existing tasks
            if (typeof task.startDateTime === 'undefined') task.startDateTime = null;
            if (typeof task.endDateTime === 'undefined') task.endDateTime = null;
            if (typeof task.elapsedTime === 'undefined') task.elapsedTime = 0;
            if (typeof task.isStopwatchRunning === 'undefined') task.isStopwatchRunning = false;

            // Calculate initial timer display
            let initialTimerText = "00:00";
            if (task.startDateTime && task.endDateTime && !task.completed) {
                const now = new Date();
                const startDate = new Date(task.startDateTime);
                const endDate = new Date(task.endDateTime);
                
                if (now < startDate) initialTimerText = formatSeconds(Math.floor((endDate - startDate) / 1000));
                else if (now < endDate) initialTimerText = formatSeconds(Math.floor((endDate - now) / 1000));
            }

            // Subtask & Notes Badges
            const subtaskCount = (task.subtasks || []).length;
            const subtaskCompleted = (task.subtasks || []).filter(st => st.completed).length;
            const hasNotes = task.notes && task.notes.trim().length > 0;
            const hasLinks = task.links && task.links.length > 0;
            const shortDesc = hasNotes ? getTruncatedDesc(task.notes) : '';

            // Build Preview HTML
            let previewHtml = '';
            // Only show preview row if there are subtasks, links, or if notes were truncated (so we need to see full)
            // Or if user just wants to expand details. 
            // For design cleanliness, we keep the expansion logic but maybe hide the inline note if it's identical to the description line.
            if ((hasNotes && shortDesc !== task.notes) || subtaskCount > 0 || hasLinks) {
                previewHtml = `<div class="task-details-preview">`;
                
                if (hasNotes && shortDesc !== task.notes) {
                    previewHtml += `<div class="preview-note"><i class="ph-fill ph-text-align-left"></i> ${task.notes}</div>`;
                }

                if (subtaskCount > 0) {
                    (task.subtasks || []).forEach(st => {
                        previewHtml += `
                            <div class="preview-subtask ${st.completed ? 'completed' : ''}">
                                <i class="ph-bold ${st.completed ? 'ph-check-square' : 'ph-square'}" style="color: ${st.completed ? 'var(--success-color)' : 'var(--text-secondary)'}"></i>
                                <span>${st.text}</span>
                            </div>
                        `;
                    });
                }

                if (hasLinks) {
                    previewHtml += `<div class="preview-links">`;
                    (task.links || []).forEach(l => {
                        previewHtml += `<a href="${l.url}" target="_blank" class="preview-link-tag"><i class="ph-bold ph-link"></i> ${l.text || 'Link'}</a>`;
                    });
                    previewHtml += `</div>`;
                }
                
                previewHtml += `</div>`;
            }

            el.innerHTML = `
                <div class="task-main-layout">
                    <!-- Line 1: Checkbox & Title -->
                    <div class="task-line-header">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                        <span class="task-title-text">${task.text}</span>
                        <div class="task-badges-inline">
                            ${subtaskCount > 0 ? `<span class="subtask-badge ${subtaskCompleted === subtaskCount ? 'completed' : ''}"><i class="ph-bold ph-list-checks"></i> ${subtaskCompleted}/${subtaskCount}</span>` : ''}
                            ${hasLinks ? `<span class="notes-badge"><i class="ph-bold ph-link"></i></span>` : ''}
                        </div>
                    </div>
                    
                    <!-- Line 2: Description (truncated) -->
                    ${shortDesc ? `<div class="task-line-desc">${shortDesc}</div>` : ''}

                    <!-- Line 3: Time & Controls -->
                    <div class="task-line-meta">
                        <div class="task-time-group">
                            ${task.startDateTime ? `<span class="meta-tag"><i class="ph-bold ph-clock"></i> ${formatTaskDateTime(task.startDateTime)}</span>` : ''}
                            ${task.endDateTime ? `<span class="meta-tag"><i class="ph-bold ph-clock-counter-clockwise"></i> ${formatTaskDateTime(task.endDateTime)}</span>` : ''}
                        </div>
                        
                        <div class="task-controls-group">
                        ${task.section === 'big3' ? `
                            <div class="deep-work-stopwatch ${task.isStopwatchRunning ? 'running' : ''}" style="display: flex; align-items: center; gap: 6px;">
                                <button class="btn-stopwatch ${task.isStopwatchRunning ? 'active' : ''}" data-id="${task.id}">
                                    <i class="ph-fill ${task.isStopwatchRunning ? 'ph-pause' : 'ph-play'}"></i>
                                </button>
                                <span class="stopwatch-time" style="font-family: monospace; font-weight: 600;">
                                    ${task.completed ? formatDurationText(task.elapsedTime) : formatSeconds(task.elapsedTime)}
                                </span>
                            </div>
                        ` : task.startDateTime ? `
                            <span class="task-timer-display" style="font-family: monospace; font-weight: 700; color: ${task.isRunning ? 'var(--success-color)' : 'var(--brand-blue)'}; background: #EFF6FF; padding: 4px 8px; border-radius: 6px;">
                                ${initialTimerText}
                            </span>
                        ` : ''}
                            
                            <div class="action-buttons">
                                <button class="btn-task-icon btn-task-edit"><i class="ph-bold ph-pencil-simple"></i></button>
                                <button class="btn-task-icon btn-task-delete"><i class="ph-bold ph-trash"></i></button>
                                <i class="ph-bold ph-dots-six-vertical drag-handle"></i>
                            </div>
                        </div>
                    </div>
                </div>
                ${previewHtml}
            `;

            el.querySelector('.task-checkbox').addEventListener('change', () => {
                // If completing, stop the stopwatch
                if (!task.completed && task.isStopwatchRunning) {
                    task.isStopwatchRunning = false;
                }
                togglePlannerTask(task.id);
            });
            
            el.querySelector('.btn-task-delete').addEventListener('click', () => deletePlannerTask(task.id));
            el.querySelector('.btn-task-edit').addEventListener('click', (e) => {
                e.stopPropagation();
                openTaskDetailsModal(task.id);
            });
            
            // Stopwatch Toggle
            const stopwatchBtn = el.querySelector('.btn-stopwatch');
            if (stopwatchBtn) {
                stopwatchBtn.addEventListener('click', () => toggleTaskStopwatch(task.id));
            }
            
            if (task.section === 'big3') big3List.appendChild(el);
            else moneyList.appendChild(el);
        });
    }

    function renderLeadTokens() {
        // Clear all buckets first
        document.querySelectorAll('.lead-bucket').forEach(bucket => bucket.innerHTML = '');
        
        // Reset counts
        const counts = { hunt: 0, heat: 0, bag: 0 };

        const leads = currentState.planner.leads || [];
        leads.forEach(lead => {
            if (counts[lead.bucket] !== undefined) counts[lead.bucket]++;
            
            const bucketEl = document.getElementById(`bucket-${lead.bucket}`);
            if (bucketEl) {
                const token = document.createElement('div');
                token.className = 'lead-token-card';
                token.dataset.id = lead.id;
                token.innerHTML = `
                    <div class="token-avatar">${lead.initials}</div>
                    <div class="token-info">
                        <span class="token-name">${lead.name}</span>
                        <span class="token-time">Moved ${formatLastVisit(lead.lastMoved).replace('Today at ', '')}</span>
                    </div>
                    <i class="ph-bold ph-dots-six-vertical token-drag-handle"></i>
                `;
                bucketEl.appendChild(token);
            }
        });

        // Update badges
        Object.keys(counts).forEach(key => {
            const badge = document.getElementById(`count-${key}`);
            if (badge) badge.textContent = counts[key];
        });
    }

    function addLead() {
        const name = prompt("Enter lead's name or company:");
        if (!name || !name.trim()) return;

        const initials = name.trim().split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();

        const newLead = {
            id: Date.now(),
            name: name.trim(),
            initials: initials,
            bucket: 'hunt',
            lastMoved: Date.now(),
            isCold: false
        };

        if (!currentState.planner.leads) currentState.planner.leads = [];
        currentState.planner.leads.push(newLead);
        saveState();
        renderLeadTokens();
    }

    function initLeadBucketsSortable() {
        const buckets = document.querySelectorAll('.lead-bucket');
        buckets.forEach(bucket => {
            new Sortable(bucket, {
                group: 'leads',
                animation: 150,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                delay: 100, // Slight delay to prevent accidental drags on touch
                delayOnTouchOnly: true,
                onEnd: function (evt) {
                    const tokenEl = evt.item;
                    const leadId = parseInt(tokenEl.dataset.id);
                    const toBucket = evt.to.dataset.bucket;

                    const lead = currentState.planner.leads.find(l => l.id === leadId);
                    if (lead) {
                        // Update State
                        lead.bucket = toBucket;
                        lead.lastMoved = Date.now();
                        
                        // Trigger Effects
                        if (toBucket === 'bag') {
                            triggerParticleExplosion();
                            // Haptic feedback if available
                            if (navigator.vibrate) navigator.vibrate([50, 50, 100]);
                        }

                        saveState();
                        renderLeadTokens(); // Re-render to update counts and timestamps
                    }
                }
            });
        });
    }

    function triggerParticleExplosion() {
        const container = document.createElement('div');
        container.className = 'particle-explosion-container';
        document.body.appendChild(container);
        // Simple CSS animation trigger (styles in CSS)
        setTimeout(() => container.remove(), 2000);
    }

    function checkTimeOverlap(newStartDateTime, newEndDateTime, excludeId = null) {
        if (!newStartDateTime || !newEndDateTime) return false;

        const newStartMs = new Date(newStartDateTime).getTime();
        const newEndMs = new Date(newEndDateTime).getTime();

        if (newEndMs <= newStartMs) return true; // Invalid range

        const tasks = currentState.planner.tasks || [];
        
        for (const task of tasks) {
            if (task.id === excludeId) continue;
            if (task.completed) continue;
            if (!task.startDateTime || !task.endDateTime) continue;

            const taskStartMs = new Date(task.startDateTime).getTime();
            const taskEndMs = new Date(task.endDateTime).getTime();

            if (newStartMs < taskEndMs && taskStartMs < newEndMs) return true;
        }
        return false;
    }

    function rolloverTasks() {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let movedCount = 0;

        currentState.planner.tasks.forEach(task => {
            if (!task.completed && task.startDateTime) {
                const taskStart = new Date(task.startDateTime);
                
                // If task is from before today (strictly less than midnight today)
                if (taskStart < startOfToday) {
                    // Calculate new times preserving the hour/minute
                    const newStart = new Date(startOfToday);
                    newStart.setHours(taskStart.getHours(), taskStart.getMinutes());

                    let newEnd = null;
                    if (task.endDateTime) {
                        const taskEnd = new Date(task.endDateTime);
                        newEnd = new Date(startOfToday);
                        newEnd.setHours(taskEnd.getHours(), taskEnd.getMinutes());
                    }

                    task.startDateTime = newStart.toISOString();
                    task.endDateTime = newEnd ? newEnd.toISOString() : null;
                    movedCount++;
                }
            }
        });

        if (movedCount > 0) {
            saveState();
            renderPlanner();
            alert(`Moved ${movedCount} unfinished tasks to today.`);
        } else {
            alert("No unfinished tasks from previous days found.");
        }
    }

    function openTimelineModal() {
        const existing = document.getElementById('timeline-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'timeline-modal';
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal" style="width: 800px; max-width: 95%; height: 80vh; display: flex; flex-direction: column;">
                <div class="modal-header">
                    <h3>Time Blocking</h3>
                    <button class="btn-close-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer;"><i class="ph ph-x"></i></button>
                </div>
                <div class="modal-body" style="padding: 0; flex: 1; overflow: hidden;">
                    <div class="timeline-wrapper">
                        <div class="timeline-grid" id="timeline-grid">
                            <!-- Hours generated by JS -->
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <p style="font-size: 0.85rem; color: var(--text-secondary);">Drag tasks to reschedule. Click to edit.</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const grid = modal.querySelector('#timeline-grid');
        
        // Generate Hours (00:00 to 23:00)
        for (let i = 0; i < 24; i++) {
            const label = document.createElement('div');
            label.className = 'timeline-time-label';
            label.style.top = `${i * 60}px`;
            label.textContent = `${String(i).padStart(2, '0')}:00`;
            grid.appendChild(label);
        }

        // Render Tasks
        const todayStr = new Date().toDateString();
        currentState.planner.tasks.forEach(task => {
            if (!task.completed && task.startDateTime && task.endDateTime) {
                const start = new Date(task.startDateTime);
                const end = new Date(task.endDateTime);

                // Only show today's tasks
                if (start.toDateString() === todayStr) {
                    const startMin = start.getHours() * 60 + start.getMinutes();
                    const durationMin = (end - start) / 1000 / 60;
                    
                    const el = document.createElement('div');
                    el.className = 'timeline-event';
                    el.style.top = `${startMin}px`;
                    el.style.height = `${Math.max(20, durationMin)}px`; // Min height 20px
                    el.innerHTML = `
                        <span class="event-time">${formatTaskDateTime(task.startDateTime)} - ${formatTaskDateTime(task.endDateTime)}</span>
                        <strong>${task.text}</strong>
                    `;
                    el.addEventListener('click', () => openTaskDetailsModal(task.id));
                    grid.appendChild(el);
                }
            }
        });

        // Close logic
        modal.querySelector('.btn-close-modal').addEventListener('click', () => modal.remove());
        void modal.offsetWidth;
        modal.classList.add('active');
    }

    function openFocusConfigModal() {
        const existing = document.getElementById('focus-config-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'focus-config-modal';
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal">
                <h3>Focus Mode</h3>
                <p>Select a timer duration to enter deep work.</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <button class="btn-modal" style="background: #EFF6FF; color: var(--brand-blue);" onclick="startFocusSession(25)">Pomodoro (25m)</button>
                    <button class="btn-modal" style="background: #EFF6FF; color: var(--brand-blue);" onclick="startFocusSession(50)">Deep Work (50m)</button>
                    <button class="btn-modal" style="background: #EFF6FF; color: var(--brand-blue);" onclick="startFocusSession(90)">Flow State (90m)</button>
                    <button class="btn-modal" style="background: #F1F5F9;" onclick="document.getElementById('focus-config-modal').remove()">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        void modal.offsetWidth;
        modal.classList.add('active');

        // Expose helper to window for inline onclicks
        window.startFocusSession = (minutes) => {
            modal.remove();
            enterFocusOverlay(minutes);
        };
    }

    function enterFocusOverlay(minutes) {
        const overlay = document.createElement('div');
        overlay.className = 'focus-overlay';
        overlay.innerHTML = `
            <div class="focus-timer-large" id="focus-overlay-timer">00:00</div>
            <div class="focus-task-display">Focusing...</div>
            <button class="btn-exit-focus">Exit Focus Mode</button>
        `;
        document.body.appendChild(overlay);

        let secondsLeft = minutes * 60;
        const timerEl = overlay.querySelector('#focus-overlay-timer');
        
        const interval = setInterval(() => {
            secondsLeft--;
            const m = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
            const s = (secondsLeft % 60).toString().padStart(2, '0');
            timerEl.textContent = `${m}:${s}`;

            if (secondsLeft <= 0) {
                clearInterval(interval);
                timerBeep.play().catch(()=>{});
                alert("Focus Session Complete!");
                overlay.remove();
            }
        }, 1000);

        overlay.querySelector('.btn-exit-focus').addEventListener('click', () => {
            if(confirm("Exit focus mode?")) {
                clearInterval(interval);
                overlay.remove();
            }
        });
    }

    function openDailyReviewModal() {
        const existing = document.getElementById('daily-review-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'daily-review-modal';
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal" style="width: 500px; text-align: left;">
                <h3>Daily Review</h3>
                <div class="form-group">
                    <label>What went well today?</label>
                    <textarea id="review-wins" class="settings-textarea" style="min-height: 80px;"></textarea>
                </div>
                <div class="form-group">
                    <label>What could be improved?</label>
                    <textarea id="review-improve" class="settings-textarea" style="min-height: 80px;"></textarea>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal btn-cancel">Close</button>
                    <button class="btn-modal btn-complete" id="btn-save-review">Save Reflection</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        void modal.offsetWidth;
        modal.classList.add('active');

        modal.querySelector('.btn-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('#btn-save-review').addEventListener('click', () => {
            const wins = document.getElementById('review-wins').value;
            const improve = document.getElementById('review-improve').value;
            
            if (!currentState.planner.reflections) currentState.planner.reflections = [];
            currentState.planner.reflections.push({
                date: new Date().toISOString(),
                wins,
                improve
            });
            saveState();
            modal.remove();
            showNotification("Reflection saved.", "info");
        });
    }

    function showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.innerHTML = `
            <i class="ph-fill ${type === 'nag' ? 'ph-warning' : 'ph-info'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    function addPlannerTask(text) {
        // Limit to 3 tasks maximum
        if (currentState.planner.tasks && currentState.planner.tasks.length >= 3) {
            alert("You can only set 3 main goals for the day. This forces you to prioritize what truly moves the needle.");
            return;
        }

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
            valueTag: valueTag,
            startDateTime: null, // ISO String
            endDateTime: null,   // ISO String
            recurrence: 'none', // none, daily, weekly, monthly
            reminderOffset: 0, // minutes before start (0 = none)
            nagMode: false, // if true, alerts after end time if not done
            reminderSent: false,
            lastNagTime: null,
            priority: 'medium',
            subtasks: [],
            notes: '',
            links: [],
            isRunning: false,
            hasAlerted: false,
            elapsedTime: 0,
            isStopwatchRunning: false
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
            
            // Handle Recurrence on Completion
            if (task.completed && task.recurrence && task.recurrence !== 'none') {
                handleRecurrence(task);
            }
            
            saveState();
            renderPlanner(); // Re-render to update progress bar
        }
    }

    function handleRecurrence(task) {
        if (!task.startDateTime) return; // Can't recur without a date

        const nextStart = new Date(task.startDateTime);
        const nextEnd = task.endDateTime ? new Date(task.endDateTime) : null;

        if (task.recurrence === 'daily') {
            nextStart.setDate(nextStart.getDate() + 1);
            if (nextEnd) nextEnd.setDate(nextEnd.getDate() + 1);
        } else if (task.recurrence === 'weekly') {
            nextStart.setDate(nextStart.getDate() + 7);
            if (nextEnd) nextEnd.setDate(nextEnd.getDate() + 7);
        } else if (task.recurrence === 'monthly') {
            nextStart.setMonth(nextStart.getMonth() + 1);
            if (nextEnd) nextEnd.setMonth(nextEnd.getMonth() + 1);
        }

        // Create the next task
        const newTask = {
            ...JSON.parse(JSON.stringify(task)), // Deep copy
            id: Date.now(),
            completed: false,
            startDateTime: nextStart.toISOString(),
            endDateTime: nextEnd ? nextEnd.toISOString() : null,
            hasAlerted: false,
            isRunning: false,
            elapsedTime: 0,
            isStopwatchRunning: false
        };

        currentState.planner.tasks.push(newTask);
        alert(`Recurring task created for ${task.recurrence}: ${task.text}`);
    }

    function toLocalISOString(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        const tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        const localISOTime = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
        return localISOTime;
    }

    function openTaskDetailsModal(taskId) {
        const task = currentState.planner.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Ensure defaults
        if (!task.subtasks) task.subtasks = [];
        if (!task.priority) task.priority = 'medium';
        if (!task.notes) task.notes = '';
        if (!task.links) task.links = [];
        if (!task.startDateTime) task.startDateTime = null;
        if (!task.endDateTime) task.endDateTime = null;
        if (!task.recurrence) task.recurrence = 'none';
        if (typeof task.reminderOffset === 'undefined') task.reminderOffset = 0;
        if (typeof task.nagMode === 'undefined') task.nagMode = false;

        const existing = document.getElementById('task-details-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'task-details-modal';
        modal.className = 'custom-modal-overlay'; // Start hidden for transition
        modal.innerHTML = `
            <div class="custom-modal task-details-modal">
                <div class="modal-header">
                    <h3>Task Details</h3>
                    <button class="btn-close-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer;"><i class="ph ph-x"></i></button>
                </div>
                
                <div class="modal-body">
                    <!-- Row 1: Task Info (White) -->
                    <div class="modal-section modal-section-primary">
                        <div class="form-group">
                            <label>Task Name</label>
                            <input type="text" id="edit-task-text" class="settings-input" value="${task.text}">
                        </div>

                        <div class="form-group">
                            <label>Priority</label>
                            <div class="priority-selector">
                                <div class="priority-btn ${task.priority === 'high' ? 'selected' : ''}" data-priority="high">High</div>
                                <div class="priority-btn ${task.priority === 'medium' ? 'selected' : ''}" data-priority="medium">Medium</div>
                                <div class="priority-btn ${task.priority === 'low' ? 'selected' : ''}" data-priority="low">Low</div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Recurring Task</label>
                            <select id="edit-task-recurrence" class="recurrence-select">
                                <option value="none" ${task.recurrence === 'none' ? 'selected' : ''}>Does not repeat</option>
                                <option value="daily" ${task.recurrence === 'daily' ? 'selected' : ''}>Daily</option>
                                <option value="weekly" ${task.recurrence === 'weekly' ? 'selected' : ''}>Weekly</option>
                                <option value="monthly" ${task.recurrence === 'monthly' ? 'selected' : ''}>Monthly</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Reminders & Nudges</label>
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <select id="edit-task-reminder" class="recurrence-select" style="flex: 1;">
                                    <option value="0" ${task.reminderOffset === 0 ? 'selected' : ''}>No Reminder</option>
                                    <option value="5" ${task.reminderOffset === 5 ? 'selected' : ''}>5 minutes before</option>
                                    <option value="10" ${task.reminderOffset === 10 ? 'selected' : ''}>10 minutes before</option>
                                    <option value="30" ${task.reminderOffset === 30 ? 'selected' : ''}>30 minutes before</option>
                                    <option value="60" ${task.reminderOffset === 60 ? 'selected' : ''}>1 hour before</option>
                                </select>
                                <label class="toggle-switch" style="flex-shrink: 0;" title="Nag Mode: Alerts you if task is overdue">
                                    <input type="checkbox" id="edit-task-nag" ${task.nagMode ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Row 2: Time (Light Blue) -->
                    <div class="modal-section modal-section-time">
                        <div class="time-inputs-row" style="margin-bottom: 0;">
                            <div class="form-group" style="margin-bottom:0;">
                                <label>Start Time</label>
                                <input type="datetime-local" id="edit-task-start" class="settings-input" value="${toLocalISOString(task.startDateTime)}">
                            </div>
                            <div class="form-group" style="margin-bottom:0;">
                                <label>End Time</label>
                                <input type="datetime-local" id="edit-task-end" class="settings-input" value="${toLocalISOString(task.endDateTime)}">
                            </div>
                        </div>
                    </div>

                    <!-- Row 3: Details (Light Grey) -->
                    <div class="modal-section modal-section-details">
                        <div class="form-group">
                            <label>Subtasks</label>
                            <div class="subtask-list" id="modal-subtask-list"></div>
                            <button class="btn-add-subtask" id="btn-add-subtask"><i class="ph-bold ph-plus"></i> Add Subtask</button>
                        </div>

                        <div class="form-group">
                            <label>Notes</label>
                            <textarea id="edit-task-notes" class="notes-area" placeholder="Add details or thoughts here...">${task.notes}</textarea>
                        </div>

                        <div class="form-group">
                            <label>Attachments / Links</label>
                            <div class="link-list" id="modal-link-list"></div>
                            <div class="add-link-wrapper">
                                <input type="text" id="new-link-url" class="link-input" placeholder="https://...">
                                <input type="text" id="new-link-text" class="link-input" placeholder="Title (optional)">
                                <button class="btn-add-link-action" id="btn-add-link">Add</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-modal btn-complete" id="btn-save-edit" style="width: 100%;">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Let CSS control visual presentation. Add active class to show modal.
        // Force reflow to ensure CSS transitions start correctly.
        void modal.offsetWidth;
        modal.classList.add('active');

        // --- Subtask Logic ---
        const subtaskListEl = modal.querySelector('#modal-subtask-list');
        let currentSubtasks = JSON.parse(JSON.stringify(task.subtasks)); // Deep copy

        function renderSubtasks() {
            subtaskListEl.innerHTML = '';
            currentSubtasks.forEach((st, idx) => {
                const row = document.createElement('div');
                row.className = 'subtask-row';
                row.innerHTML = `
                    <input type="checkbox" class="subtask-checkbox" ${st.completed ? 'checked' : ''}>
                    <input type="text" class="subtask-input ${st.completed ? 'completed' : ''}" value="${st.text}" placeholder="Subtask...">
                    <button class="btn-remove-subtask"><i class="ph-bold ph-trash"></i></button>
                `;
                
                // Events
                row.querySelector('.subtask-checkbox').addEventListener('change', (e) => {
                    st.completed = e.target.checked;
                    renderSubtasks(); // Re-render to update styling
                });
                row.querySelector('.subtask-input').addEventListener('input', (e) => {
                    st.text = e.target.value;
                });
                row.querySelector('.btn-remove-subtask').addEventListener('click', () => {
                    currentSubtasks.splice(idx, 1);
                    renderSubtasks();
                });

                subtaskListEl.appendChild(row);
            });
        }
        renderSubtasks();

        modal.querySelector('#btn-add-subtask').addEventListener('click', () => {
            currentSubtasks.push({ text: '', completed: false });
            renderSubtasks();
            // Focus new input
            setTimeout(() => {
                const inputs = subtaskListEl.querySelectorAll('.subtask-input');
                if(inputs.length) inputs[inputs.length - 1].focus();
            }, 50);
        });

        // --- Link Logic ---
        const linkListEl = modal.querySelector('#modal-link-list');
        let currentLinks = JSON.parse(JSON.stringify(task.links));

        function renderLinks() {
            linkListEl.innerHTML = '';
            currentLinks.forEach((link, idx) => {
                const item = document.createElement('div');
                item.className = 'link-item';
                item.innerHTML = `
                    <a href="${link.url}" target="_blank"><i class="ph-bold ph-link"></i> ${link.text || link.url}</a>
                    <button class="btn-remove-link"><i class="ph-bold ph-trash"></i></button>
                `;
                item.querySelector('.btn-remove-link').addEventListener('click', () => {
                    currentLinks.splice(idx, 1);
                    renderLinks();
                });
                linkListEl.appendChild(item);
            });
        }
        renderLinks();

        modal.querySelector('#btn-add-link').addEventListener('click', () => {
            const urlInput = modal.querySelector('#new-link-url');
            const textInput = modal.querySelector('#new-link-text');
            const url = urlInput.value.trim();
            if (!url) return;
            currentLinks.push({ url: url.startsWith('http') ? url : 'https://' + url, text: textInput.value.trim() });
            urlInput.value = ''; textInput.value = '';
            renderLinks();
        });

        // --- Priority Logic ---
        let selectedPriority = task.priority;
        modal.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedPriority = btn.dataset.priority;
            });
        });

        // --- Save & Close ---
        const closeModal = () => modal.remove();
        modal.querySelector('.btn-close-modal').addEventListener('click', closeModal);
        
        modal.querySelector('#btn-save-edit').addEventListener('click', () => {
            const newText = document.getElementById('edit-task-text').value.trim();
            const newStartValue = document.getElementById('edit-task-start').value;
            const newEndValue = document.getElementById('edit-task-end').value;
            const newNotes = document.getElementById('edit-task-notes').value;
            const newRecurrence = document.getElementById('edit-task-recurrence').value;
            const newReminder = parseInt(document.getElementById('edit-task-reminder').value);
            const newNag = document.getElementById('edit-task-nag').checked;

            const newStartDateTime = newStartValue ? new Date(newStartValue).toISOString() : null;
            const newEndDateTime = newEndValue ? new Date(newEndValue).toISOString() : null;

            if (!newText) return alert("Task name cannot be empty");
            if (newStartDateTime && newEndDateTime && newEndDateTime <= newStartDateTime) return alert("End time must be after start time.");
            if (newStartDateTime && newEndDateTime && checkTimeOverlap(newStartDateTime, newEndDateTime, taskId)) return alert("Time clash detected! This task overlaps with another active task.");

            // Filter out empty subtasks
            const finalSubtasks = currentSubtasks.filter(st => st.text.trim() !== '');

            updatePlannerTask(taskId, { 
                text: newText, 
                startDateTime: newStartDateTime, 
                endDateTime: newEndDateTime, 
                priority: selectedPriority,
                subtasks: finalSubtasks,
                notes: newNotes,
                recurrence: newRecurrence,
                reminderOffset: newReminder,
                nagMode: newNag,
                reminderSent: false, // Reset reminder if edited
                links: currentLinks,
                hasAlerted: false 
            });
            
            renderPlannerTasks();
            modal.remove();
        });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }

    let taskToDeleteId = null;
    function setupDeleteModal() {
        if (document.getElementById('delete-confirm-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'delete-confirm-modal';
        modal.className = 'custom-modal-overlay';
        modal.innerHTML = `
            <div class="custom-modal">
                <h3>Delete Task?</h3>
                <p>Are you sure you want to remove this task? This action cannot be undone.</p>
                <div class="modal-actions">
                    <button class="btn-modal btn-cancel" id="btn-cancel-delete">Cancel</button>
                    <button class="btn-modal btn-confirm-delete" id="btn-confirm-delete">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('#btn-cancel-delete').addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
    }

    function deletePlannerTask(id) {
        setupDeleteModal();
        taskToDeleteId = id;
        const modal = document.getElementById('delete-confirm-modal');
        modal.classList.add('active');
        const confirmBtn = document.getElementById('btn-confirm-delete');
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        newBtn.addEventListener('click', () => {
            if (taskToDeleteId) {
                currentState.planner.tasks = currentState.planner.tasks.filter(t => t.id !== taskToDeleteId);
                saveState();
                renderPlanner();
                modal.classList.remove('active');
            }
        });
    }

    function updatePlannerTask(id, updates) {
        const task = currentState.planner.tasks.find(t => t.id === id);
        if (task) {
            Object.assign(task, updates);
            saveState();
        }
    }

    function toggleTaskStopwatch(id) {
        const task = currentState.planner.tasks.find(t => t.id === id);
        if (task && !task.completed) {
            task.isStopwatchRunning = !task.isStopwatchRunning;
            saveState();
            renderPlannerTasks(); // Re-render to update icon state
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

    function checkTaskSystem() {
        const now = new Date();
        let stateChanged = false;

        if (!currentState.planner.tasks) return;

        currentState.planner.tasks.forEach(task => {
            // Real-time Countdown Logic
            if (!task.startDateTime || !task.endDateTime || task.completed) return;

            const startDate = new Date(task.startDateTime);
            const endDate = new Date(task.endDateTime);

            // --- Reminder Logic ---
            if (task.reminderOffset > 0 && !task.reminderSent && !task.completed) {
                const diffMs = startDate - now;
                const diffMins = diffMs / 1000 / 60;
                // If within reminder window (e.g. 10 mins before) and not in the past
                if (diffMins <= task.reminderOffset && diffMins > 0) {
                    showNotification(`Reminder: "${task.text}" starts in ${Math.ceil(diffMins)} minutes.`, 'info');
                    task.reminderSent = true;
                    stateChanged = true;
                }
            }

            // --- Nag Mode Logic ---
            if (task.nagMode && !task.completed && now > endDate) {
                // Alert every 5 minutes if overdue
                if (!task.lastNagTime || (now - new Date(task.lastNagTime)) > 5 * 60 * 1000) {
                    showNotification(`Overdue: "${task.text}" should be finished!`, 'nag');
                    task.lastNagTime = now.toISOString();
                    stateChanged = true;
                }
            }

            if (now >= startDate && now < endDate) {
                // Task is active
                task.isRunning = true;
                const secondsRemaining = Math.floor((endDate - now) / 1000);
                
                const timerDisplay = document.querySelector(`.planner-task[data-id="${task.id}"] .task-timer-display`);
                if (timerDisplay) {
                    timerDisplay.textContent = formatSeconds(secondsRemaining);
                    timerDisplay.style.color = 'var(--success-color)';
                }
            } else if (now >= endDate) {
                // Task ended
                if (task.isRunning || !task.hasAlerted) {
                    task.isRunning = false;
                    if (!task.hasAlerted) {
                        task.hasAlerted = true;
                        timerBeep.play().catch(e => console.error(e));
                        alert(`Time is up for: ${task.text}`);
                        saveState();
                        renderPlannerTasks(); // Update UI to show 00:00 or ended state
                    }
                }
                const timerDisplay = document.querySelector(`.planner-task[data-id="${task.id}"] .task-timer-display`);
                if (timerDisplay) {
                    timerDisplay.textContent = "00:00";
                    timerDisplay.style.color = '#EF4444';
                }
            } else {
                // Future task
                task.isRunning = false;
                const timerDisplay = document.querySelector(`.planner-task[data-id="${task.id}"] .task-timer-display`);
                if (timerDisplay) {
                    const durationSecs = Math.floor((endDate - startDate) / 1000);
                    timerDisplay.textContent = formatSeconds(durationSecs);
                    timerDisplay.style.color = 'var(--brand-blue)';
                }
            }

            // Stopwatch Logic (Counts UP)
            if (task.isStopwatchRunning && !task.completed) {
                task.elapsedTime = (task.elapsedTime || 0) + 1;
                // Update DOM directly
                const stopwatchDisplay = document.querySelector(`.planner-task[data-id="${task.id}"] .stopwatch-time`);
                if (stopwatchDisplay) {
                    stopwatchDisplay.textContent = formatSeconds(task.elapsedTime);
                }
            }
        });
        if (stateChanged) saveState();
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

    function formatSeconds(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function formatTaskDateTime(isoString) {
        if (!isoString) return '--:--';
        const date = new Date(isoString);
        const now = new Date();
        
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
        const timeStr = date.toLocaleTimeString('en-GB', timeOptions); // Use en-GB for 24h format

        const isToday = date.getFullYear() === now.getFullYear() &&
                        date.getMonth() === now.getMonth() &&
                        date.getDate() === now.getDate();

        if (isToday) {
            return timeStr;
        } else {
            const dateOptions = { month: 'short', day: 'numeric' };
            const dateStr = date.toLocaleDateString('en-US', dateOptions);
            return `${dateStr}, ${timeStr}`;
        }
    }

    function formatDurationText(seconds) {
        if (!seconds) return "0m";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    }

    // --- Helper: Generate Public Profile HTML ---
    function getPublicProfileHTML(p) {
        return `
            <div class="public-profile-container" style="max-width: 800px; margin: 0 auto; padding-top: 2rem;">
                <div class="public-hero" style="background: white; border-radius: 24px; padding: 3rem; text-align: center; border: 1px solid var(--border-color); box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <div class="public-avatar-wrapper" style="width: 140px; height: 140px; margin: 0 auto 1.5rem;">
                        <img src="${p.avatar || 'https://ui-avatars.com/api/?name=' + p.name + '&background=00db87&color=fff'}" class="public-avatar">
                    </div>
                    <div class="public-info">
                        <h1 class="public-name-title" style="font-size: 2.5rem; margin-bottom: 0.5rem; justify-content: center;">${p.name} <span style="font-weight: 300; opacity: 0.4;">|</span> <span style="color: var(--brand-blue);">${p.primarySkill || 'Specialist'}</span></h1>
                        <p class="public-bio" style="font-size: 1.2rem; color: var(--text-secondary); max-width: 600px; margin: 0 auto 2rem;">${p.bio || ''}</p>
                        
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin-bottom: 2rem;">
                            ${(p.skills || []).map(s => `<span style="background: var(--brand-blue-light); color: var(--brand-blue-dark); padding: 6px 16px; border-radius: 99px; font-weight: 600;">${s}</span>`).join('')}
                        </div>
                        
                        <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem;">
                            ${(p.tools || []).map(t => `<div style="width: 48px; height: 48px; background: #F8FAFC; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--text-secondary);" title="${t}"><i class="ph-duotone ph-wrench"></i></div>`).join('')}
                        </div>

                        <button class="btn-work-with-me">Work With Me</button>
                    </div>
                </div>

                <div style="margin-top: 3rem; max-width: 700px; margin-left: auto; margin-right: auto;">
                    <h3 style="font-size: 1.5rem; margin-bottom: 2rem; color: var(--text-primary); text-align: center;">Experience & Track Record</h3>
                    <div style="display: flex; flex-direction: column; gap: 2rem;">
                        ${(p.experience || []).map(exp => `
                            <div style="background: white; padding: 2rem; border-radius: 16px; border: 1px solid var(--border-color); display: flex; gap: 1.5rem; align-items: flex-start;">
                                <div style="width: 12px; height: 12px; background: var(--brand-blue); border-radius: 50%; margin-top: 6px;"></div>
                                <div>
                                    <h4 style="margin: 0 0 0.5rem 0; font-size: 1.25rem; color: var(--text-primary);">${exp.role} <span style="font-weight: 400; color: var(--text-secondary);">at ${exp.company}</span></h4>
                                    <span style="display: block; font-size: 0.9rem; color: #94A3B8; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">${exp.date}</span>
                                    <ul style="margin: 0; padding-left: 1.2rem; color: var(--text-secondary); line-height: 1.6;">
                                        ${(exp.bullets || []).filter(b => b.trim() !== '').map(b => `<li>${b}</li>`).join('')}
                                        ${(!exp.bullets || exp.bullets.length === 0) ? '<li>Contributed to key strategic initiatives.</li>' : ''}
                                    </ul>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // --- Helper: Share Modal ---
    function openShareModal() {
        // Encode the profile data into the URL for the static page to read
        const profileData = encodeURIComponent(JSON.stringify(currentState.profile));
        // Construct URL relative to current location
        const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
        const url = `${baseUrl}/public-profile.html?data=${profileData}`;
        
        const modal = document.createElement('div');
        modal.className = 'custom-modal-overlay active';
        modal.innerHTML = `
            <div class="custom-modal" style="width: 450px;">
                <h3>Share Portfolio</h3>
                <p>Your public portfolio is ready. Share this link with clients or investors.</p>
                
                <div style="background: #F8FAFC; padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
                    <i class="ph-bold ph-link" style="color: var(--text-secondary);"></i>
                    <input type="text" value="${url}" readonly style="flex: 1; background: transparent; border: none; font-family: monospace; font-size: 0.9rem; color: var(--text-primary); outline: none;">
                    <button id="btn-copy-link" style="background: white; border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; color: var(--brand-blue);">Copy</button>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 1rem;">
                    <button class="btn-modal btn-cancel" onclick="this.closest('.custom-modal-overlay').remove()">Close</button>
                    <button class="btn-modal btn-complete" onclick="window.open('${url}', '_blank')">Open Link</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const copyBtn = modal.querySelector('#btn-copy-link');
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(url);
            copyBtn.textContent = 'Copied!';
            copyBtn.style.background = 'var(--brand-blue)';
            copyBtn.style.color = 'white';
            copyBtn.style.borderColor = 'var(--brand-blue)';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.style.background = 'white';
                copyBtn.style.color = 'var(--brand-blue)';
                copyBtn.style.borderColor = 'var(--border-color)';
            }, 2000);
        });
        
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }

    // --- Profile & Settings Logic ---
    function renderProfile(isPublicView = false) {
        // Ensure state defaults
        if (!currentState.profile.skills) currentState.profile.skills = ['Strategy', 'Leadership'];
        if (!currentState.profile.tools) currentState.profile.tools = [];
        if (!currentState.profile.customSections) currentState.profile.customSections = [];
        if (!currentState.profile.experience) currentState.profile.experience = [
            { role: 'Founder', company: 'Stealth Startup', date: '2023 - Present', bullets: ['Building MVP', 'Validating market fit'] }
        ];

        // --- HTML Structure ---
        learningStage.innerHTML = `
            <div class="portfolio-wrapper">
                <div class="portfolio-split">
                    <!-- 2. Left Panel: Input Form -->
                    <div class="editor-pane">
                        
                        <div class="portfolio-actions-row">
                            <div class="pf-action-group">
                                <button class="btn-preview-pf" id="btn-preview-pf"><i class="ph-bold ph-eye"></i> <span class="btn-text">Preview</span></button>
                                <button class="btn-share"><i class="ph-bold ph-share-network"></i> <span class="btn-text">Share</span></button>
                                <button class="btn-save-pf" id="btn-save-pf"><i class="ph-bold ph-floppy-disk"></i> <span class="btn-text">Save</span></button>
                            </div>
                            <button class="btn-logout-pf" id="btn-logout-pf"><i class="ph-bold ph-sign-out"></i> Logout</button>
                        </div>

                        <!-- Brand Identity -->
                        <div class="pf-section">
                            <h3>Brand Identity</h3>
                            <div class="pf-identity-grid">
                                <div class="pf-avatar-drop" id="pf-avatar-drop">
                                    <img src="${currentState.profile.avatar || `https://ui-avatars.com/api/?name=${currentState.profile.name}&background=00db87&color=fff`}" id="editor-avatar-img">
                                    <input type="file" id="pf-avatar-input" accept="image/*" style="display: none;">
                                </div>
                                <div style="flex: 1;">
                                    <div class="pf-input-group">
                                        <label class="pf-label">Display Name</label>
                                        <input type="text" class="pf-input" id="input-name" value="${currentState.profile.name}">
                                    </div>
                                    <div class="pf-input-group">
                                        <label class="pf-label">Headline (Max 80 chars)</label>
                                        <input type="text" class="pf-input" id="input-skill" value="${currentState.profile.primarySkill || ''}" placeholder="e.g. Helping B2B Founders...">
                                    </div>
                                </div>
                            </div>
                            <div class="pf-input-group">
                                <label class="pf-label">Value Prop</label>
                                <textarea class="pf-textarea" id="input-bio" rows="3" placeholder="I help companies scale...">${currentState.profile.bio || ''}</textarea>
                            </div>
                        </div>

                        <!-- Skill Matrix -->
                        <div class="pf-section">
                            <h3>Skill Matrix</h3>
                            <div class="pf-tags-container" id="skill-tags-container">
                                <!-- Tags injected here -->
                                <input type="text" class="pf-tag-input" id="input-skill-tag" placeholder="Add skill + Enter">
                            </div>
                        </div>

                        <!-- Tools I Master -->
                        <div class="pf-section">
                            <h3>Tools I Master</h3>
                            <div class="tools-grid" id="tools-grid">
                                <!-- Tool toggles -->
                            </div>
                            <div style="margin-top: 1rem; display: flex; gap: 0.5rem; align-items: center;">
                                <input type="text" class="pf-input" id="input-new-tool" placeholder="Add custom tool..." style="flex: 1;">
                                <button class="btn-add-link-action" id="btn-add-tool" style="height: 42px;">Add</button>
                            </div>
                        </div>

                        <!-- Experience & Proof -->
                        <div class="pf-section">
                            <h3>Experience & Proof</h3>
                            <div id="experience-list-editor"></div>
                            <button class="btn-add-ghost" id="btn-add-exp"><i class="ph-bold ph-plus"></i> Add New Role</button>
                        </div>

                        <!-- Additional Sections -->
                        <div class="pf-section">
                            <h3>Additional Sections</h3>
                            <div id="custom-sections-editor"></div>
                            <button class="btn-add-ghost" id="btn-add-section"><i class="ph-bold ph-plus"></i> Add Section (e.g. Hobbies)</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // --- Logic & Listeners ---

        // 1. Real-time Text Binding
        const bindText = (inputId, field) => {
            const input = document.getElementById(inputId);
            input.addEventListener('input', (e) => {
                currentState.profile[field] = e.target.value;
            });
        };
        bindText('input-name', 'name');
        bindText('input-skill', 'primarySkill');
        bindText('input-bio', 'bio');

        // 2. Avatar Upload
        const avatarDrop = document.getElementById('pf-avatar-drop');
        const avatarInput = document.getElementById('pf-avatar-input');
        avatarDrop.addEventListener('click', () => avatarInput.click());
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('editor-avatar-img').src = e.target.result;
                    currentState.profile.avatar = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // 3. Skills Tag Input
        const tagContainer = document.getElementById('skill-tags-container');

        function renderSkills() {
            // Editor Tags
            const tagsHtml = currentState.profile.skills.map((skill, idx) => `
                <div class="pf-tag">${skill} <i class="ph-bold ph-x" data-idx="${idx}"></i></div>
            `).join('');
            tagContainer.innerHTML = tagsHtml + '<input type="text" class="pf-tag-input" id="input-skill-tag" placeholder="Add skill + Enter">';
            
            // Re-attach listener to new input
            document.getElementById('input-skill-tag').addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    currentState.profile.skills.push(e.target.value.trim());
                    renderSkills();
                }
            });
            // Remove listeners
            tagContainer.querySelectorAll('.ph-x').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.target.dataset.idx;
                    currentState.profile.skills.splice(idx, 1);
                    renderSkills();
                });
            });
        }
        renderSkills();

        // 4. Tools Grid
        const defaultTools = ['Zapier', 'Notion', 'Figma', 'Python', 'React', 'Google Ads', 'Shopify', 'Stripe'];
        const toolsGrid = document.getElementById('tools-grid');

        function renderTools() {
            // Combine default tools with user selected tools to show everything
            const allTools = Array.from(new Set([...defaultTools, ...currentState.profile.tools]));
            
            toolsGrid.innerHTML = allTools.map(tool => {
                const isActive = currentState.profile.tools.includes(tool);
                return `<div class="tool-toggle ${isActive ? 'active' : ''}" data-tool="${tool}">
                    <i class="ph-duotone ph-wrench"></i> ${tool}
                </div>`;
            }).join('');

            toolsGrid.querySelectorAll('.tool-toggle').forEach(btn => {
                btn.addEventListener('click', () => {
                    const t = btn.dataset.tool;
                    if (currentState.profile.tools.includes(t)) {
                        currentState.profile.tools = currentState.profile.tools.filter(i => i !== t);
                    } else {
                        currentState.profile.tools.push(t);
                    }
                    renderTools();
                });
            });
        }
        renderTools();

        // Add New Tool Logic
        document.getElementById('btn-add-tool').addEventListener('click', () => {
            const input = document.getElementById('input-new-tool');
            const val = input.value.trim();
            if (val && !currentState.profile.tools.includes(val)) {
                currentState.profile.tools.push(val);
                input.value = '';
                renderTools();
            }
        });

        // 5. Experience Repeater
        const expEditor = document.getElementById('experience-list-editor');

        function renderExperience() {
            // Editor
            expEditor.innerHTML = currentState.profile.experience.map((exp, idx) => `
                <div class="experience-item">
                    <button class="btn-remove-item" data-idx="${idx}"><i class="ph-bold ph-trash"></i></button>
                    <div class="pf-input-group"><label class="pf-label">Job Title</label><input type="text" class="pf-input exp-field" data-idx="${idx}" data-field="role" value="${exp.role}"></div>
                    <div class="pf-input-group"><label class="pf-label">Company</label><input type="text" class="pf-input exp-field" data-idx="${idx}" data-field="company" value="${exp.company}"></div>
                    <div class="pf-input-group"><label class="pf-label">Dates</label><input type="text" class="pf-input exp-field" data-idx="${idx}" data-field="date" value="${exp.date}"></div>
                    <div class="pf-input-group"><label class="pf-label">Key Achievements (One per line)</label><textarea class="pf-textarea exp-field" data-idx="${idx}" data-field="bullets" rows="3" placeholder="Launched MVP\nScaled to $10k MRR">${(exp.bullets || []).join('\n')}</textarea></div>
                </div>
            `).join('');

            // Listeners
            expEditor.querySelectorAll('.exp-field').forEach(input => {
                input.addEventListener('input', (e) => {
                    const idx = e.target.dataset.idx;
                    const field = e.target.dataset.field;
                    
                    if (field === 'bullets') {
                        currentState.profile.experience[idx][field] = e.target.value.split('\n');
                    } else {
                        currentState.profile.experience[idx][field] = e.target.value;
                    }
                    // Removed renderExperience() to prevent focus loss and lag
                });
            });
            expEditor.querySelectorAll('.btn-remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Prevent bubble up if any
                    const idx = e.currentTarget.dataset.idx;
                    currentState.profile.experience.splice(idx, 1);
                    renderExperience();
                });
            });
        }
        renderExperience();

        document.getElementById('btn-add-exp').addEventListener('click', () => {
            currentState.profile.experience.push({ role: 'New Role', company: 'Company', date: 'Dates', bullets: [] });
            renderExperience();
        });

        // 6. Custom Sections Logic
        const sectionsEditor = document.getElementById('custom-sections-editor');

        function renderCustomSections() {
            sectionsEditor.innerHTML = currentState.profile.customSections.map((sec, idx) => `
                <div class="experience-item">
                    <button class="btn-remove-item section-remove" data-idx="${idx}"><i class="ph-bold ph-trash"></i></button>
                    <div class="pf-input-group">
                        <label class="pf-label">Section Title</label>
                        <input type="text" class="pf-input section-field" data-idx="${idx}" data-field="title" value="${sec.title}" placeholder="e.g. Hobbies & Interests">
                    </div>
                    <div class="pf-input-group">
                        <label class="pf-label">Content</label>
                        <textarea class="pf-textarea section-field" data-idx="${idx}" data-field="content" rows="3" placeholder="I love hiking...">${sec.content}</textarea>
                    </div>
                </div>
            `).join('');

            // Listeners
            sectionsEditor.querySelectorAll('.section-field').forEach(input => {
                input.addEventListener('input', (e) => {
                    const idx = e.target.dataset.idx;
                    const field = e.target.dataset.field;
                    currentState.profile.customSections[idx][field] = e.target.value;
                });
            });
            sectionsEditor.querySelectorAll('.section-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.currentTarget.dataset.idx;
                    currentState.profile.customSections.splice(idx, 1);
                    renderCustomSections();
                });
            });
        }
        renderCustomSections();

        document.getElementById('btn-add-section').addEventListener('click', () => {
            currentState.profile.customSections.push({ title: 'New Section', content: '' });
            renderCustomSections();
        });

        // Logout Button
        document.getElementById('btn-logout-pf').addEventListener('click', handleLogout);

        // 7. Save Micro-interaction
        const saveBtn = document.getElementById('btn-save-pf');
        saveBtn.addEventListener('click', () => {
            saveState();
            const originalHtml = saveBtn.innerHTML;
            
            // Transformation
            saveBtn.innerHTML = '<i class="ph-bold ph-check"></i> <span class="btn-text">Saved</span>';
            saveBtn.classList.add('saved');
            
            // Mock Clipboard copy
            // navigator.clipboard.writeText('https://avantaland.com/u/' + currentState.profile.name);

            setTimeout(() => {
                saveBtn.innerHTML = originalHtml;
                saveBtn.classList.remove('saved');
            }, 1500);
        });

        // Share Button
        learningStage.querySelector('.btn-share').addEventListener('click', openShareModal);

        // 7. Preview Modal
        document.getElementById('btn-preview-pf').addEventListener('click', () => {
            const p = currentState.profile;
            
            const modalContent = `
                <div class="public-hero" style="border: none; box-shadow: none; padding: 0; margin: 0; flex-direction: column; gap: 0;">
                    <div class="public-avatar-wrapper" style="width: 120px; height: 120px; margin: 0 auto 1.5rem;">
                        <img src="${p.avatar || 'https://ui-avatars.com/api/?name=' + p.name + '&background=00db87&color=fff'}" class="public-avatar">
                    </div>
                    <div class="public-info" style="text-align: center;">
                        <h1 class="public-name-title" style="font-size: 1.8rem; justify-content: center;">${p.name} <span style="font-weight: 300; opacity: 0.4;">|</span> <span style="color: var(--brand-blue);">${p.primarySkill || 'Specialist'}</span></h1>
                        <p class="public-bio" style="margin: 0 auto 1.5rem;">${p.bio || ''}</p>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem;">
                            ${(p.skills || []).map(s => `<span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 99px; font-size: 0.85rem; font-weight: 600;">${s}</span>`).join('')}
                        </div>
                        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 2rem;">
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center;">
                                ${(p.tools || []).map(t => `<div style="background: #F8FAFC; border: 1px solid var(--border-color); border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; gap: 8px; font-size: 0.95rem; color: var(--text-secondary);"><i class="ph-duotone ph-wrench"></i> ${t}</div>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--text-primary);">Experience</h3>
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        ${(p.experience || []).map(exp => `
                            <div style="border-left: 2px solid #E2E8F0; padding-left: 1.5rem; position: relative; text-align: left;">
                                <div style="position: absolute; left: -5px; top: 0; width: 8px; height: 8px; background: var(--brand-blue); border-radius: 50%;"></div>
                                <h4 style="margin: 0; font-size: 1rem; color: var(--text-primary);">${exp.role} <span style="font-weight: 400; color: var(--text-secondary);">at ${exp.company}</span></h4>
                                <span style="display: block; font-size: 0.8rem; color: #94A3B8; margin-top: 0.25rem;">${exp.date}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ${(p.customSections || []).map(sec => `
                <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem; color: var(--text-primary);">${sec.title}</h3>
                    <p style="color: var(--text-secondary); line-height: 1.6; white-space: pre-line;">${sec.content}</p>
                </div>
                `).join('')}
            `;

            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'custom-modal-overlay active';
            modalOverlay.innerHTML = `
                <div class="custom-modal" style="width: 600px; max-width: 90%; max-height: 90vh; overflow-y: auto; text-align: left; padding: 2.5rem;">
                    <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
                        <button class="btn-close-preview" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary);"><i class="ph ph-x"></i></button>
                    </div>
                    ${modalContent}
                </div>
            `;
            document.body.appendChild(modalOverlay);
            
            modalOverlay.querySelector('.btn-close-preview').addEventListener('click', () => modalOverlay.remove());
            modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.remove(); });
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

    function renderDesktopSidebar() {
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (!sidebarNav) return;

        sidebarNav.innerHTML = `
            <a href="#" class="nav-item active" data-target="home">
                <i class="ph-duotone ph-house"></i>
                <span>Dashboard</span>
            </a>
            <a href="#" class="nav-item" data-target="planner">
                <i class="ph-duotone ph-calendar-check"></i>
                <span>Planner</span>
            </a>
            <a href="#" class="nav-item" data-target="business">
                <i class="ph-duotone ph-briefcase"></i>
                <span>Business</span>
            </a>
            <a href="#" class="nav-item" data-target="aveo">
                <i class="ph-duotone ph-robot"></i>
                <span>Aveo 1</span>
            </a>
            <a href="#" class="nav-item" data-target="profile">
                <i class="ph-duotone ph-user-circle"></i>
                <span>Profile</span>
            </a>
        `;

        const navItems = sidebarNav.querySelectorAll('.nav-item[data-target]');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                const target = item.dataset.target;
                
                if (target === 'home') {
                    document.querySelectorAll('.hack-list-item.active').forEach(item => item.classList.remove('active'));
                    renderDashboardGrid();
                } else if (target === 'hacks') {
                    const accordion = document.querySelector('.hack-accordion');
                    if (accordion) {
                        accordion.open = true;
                        accordion.scrollIntoView({ behavior: 'smooth' });
                    }
                } else if (target === 'planner') {
                    renderPlanner();
                } else if (target === 'business') {
                    renderBusinessDashboard();
                } else if (target === 'aveo') {
                    toggleAveoDrawer(true);
                } else if (target === 'profile') {
                    renderProfile();
                }
            });
        });
    }

    async function displayHack(index, forceFetch = true) {
        currentState.currentHackIndex = index;
        const truth = truthsData[index];

        // Update active state in navigator
        document.querySelectorAll('.hack-list-item').forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.index) === index);
        });

        // Update active state in sidebar nav
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));
        const hacksNav = document.querySelector('.sidebar-nav .nav-item[data-target="hacks"]');
        if (hacksNav) hacksNav.classList.add('active');

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
            <a href="index.html" class="logo"><img src="images/avblack.png" alt="Avantaland Logo" class="mobile-logo"></a>
            <div class="mobile-user-menu" style="position: relative;">
                <button id="mobile-menu-trigger" style="background:none; border:none; color:var(--text-primary); cursor:pointer; padding: 0.5rem;">
                    <i class="ph-bold ph-caret-down" style="font-size: 1.5rem;"></i>
                </button>
                <div id="mobile-user-dropdown" class="mobile-dropdown-menu">
                    <a href="index.html" class="mobile-dropdown-item"><i class="ph-bold ph-globe"></i> Return to Website</a>
                    <button id="mobile-logout-btn" class="mobile-dropdown-item" style="color: #EF4444;"><i class="ph-bold ph-sign-out"></i> Logout</button>
                </div>
            </div>
        `;

        const trigger = mobileHeader.querySelector('#mobile-menu-trigger');
        const dropdown = mobileHeader.querySelector('#mobile-user-dropdown');
        
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!mobileHeader.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });

        mobileHeader.querySelector('#mobile-logout-btn').addEventListener('click', handleLogout);

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
            <button class="mobile-nav-item" data-target="business">
                <i class="ph-duotone ph-briefcase"></i>
                <span>Business</span>
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
                    } else if (target === 'business') {
                        renderBusinessDashboard();
                    } else if (target === 'aveo') {
                        toggleAveoDrawer(true);
                    } else if (target === 'profile') {
                        renderProfile();
                    } else if (target === 'community') {
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

        const firstName = currentState.profile.name ? currentState.profile.name.split(' ')[0] : 'Founder';

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
                    <strong>Aveo 1:</strong> Founders don't sleep, but they do need strategy. I'm Aveo. What's the roadblock today, ${firstName}?
                </div>
            </div>
            <div class="aveo-chips">
                <button class="aveo-chip">Why does this hack matter?</button>
                <button class="aveo-chip">Give me a script</button>
                <button class="aveo-chip">I'm stuck</button>
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

        // Proactive Logic: Check on load
        const checkProactive = () => {
            const hour = new Date().getHours();
            const tasks = currentState.planner.tasks || [];
            const completed = tasks.filter(t => t.completed).length;
            
            // If past 12 PM and 0% completion
            if (hour >= 12 && tasks.length > 0 && completed === 0) {
                const msgContainer = document.getElementById('aveo-messages');
                // Only add if not already there
                if (msgContainer.children.length <= 1) {
                    addAveoMessage(`<strong>Aveo 1:</strong> It's past midday and you haven't crushed a single task in your Big 3. Remember your goal: "${currentState.profile.dreamResult || 'Financial Freedom'}". Stop procrastinating, ${firstName}.`, 'ai');
                }
            }
        };
        // Run check when drawer opens

        const sendMessage = async (text) => {
            if (!text.trim()) return;
            
            // Add User Message
            addAveoMessage(text, 'user');
            input.value = '';

            // Show Typing Indicator (Mock)
            const typingId = addAveoMessage('<div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>', 'ai');

            // Prepare Context
            const currentTruth = truthsData[currentState.currentHackIndex];
            const plannerTasks = currentState.planner.tasks || [];
            const plannerState = plannerTasks.map(t => `- ${t.text} [${t.completed ? 'DONE' : 'PENDING'}]`).join('\n');
            
            const systemPrompt = `You are Aveo 1, an elite business strategist and AI mentor for ${currentState.profile.name}. 
            Your goal is to help them achieve: "${currentState.profile.dreamResult}".
            
            Current Context:
            - They are working on Hack #${currentState.currentHackIndex + 1}: "${currentTruth.title}".
            - Their current tasks:
            ${plannerState}
            
            Guidelines:
            - Be concise, direct, and high-energy.
            - Act like a senior partner, not a generic assistant.
            - Push them to execute. If they are stuck, give a specific next step.
            - Do not use fluff. Get straight to the value.`;

            try {
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer YOUR_OPENROUTER_API_KEY', // Replace with valid Key
                        'HTTP-Referer': window.location.origin,
                        'X-Title': 'Avantaland Dashboard'
                    },
                    body: JSON.stringify({
                        model: "openai/gpt-3.5-turbo", // Or any other model supported by OpenRouter
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: text }
                        ],
                        stream: true
                    })
                });

                if (!response.ok) throw new Error('Network response was not ok');

                // Remove typing indicator before streaming starts
                const typingMsg = document.getElementById(typingId);
                if (typingMsg) typingMsg.remove();

                // Create a new message bubble for the stream
                const streamMsgId = addAveoMessage('', 'ai');
                const streamMsgDiv = document.getElementById(streamMsgId);
                
                // Handle Streaming Response
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let aiText = '';
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // Keep incomplete line in buffer

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonStr = line.slice(6);
                            if (jsonStr === '[DONE]') continue;
                            try {
                                const json = JSON.parse(jsonStr);
                                const content = json.choices[0].delta.content || '';
                                aiText += content;
                                
                                // Simple markdown parsing for bolding
                                const formattedText = aiText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                streamMsgDiv.innerHTML = formattedText;
                                
                                // Auto-scroll
                                const container = document.getElementById('aveo-messages');
                                container.scrollTop = container.scrollHeight;
                            } catch (e) { }
                        }
                    }
                }

            } catch (e) {
                console.error(e);
                const typingMsg = document.getElementById(typingId);
                if (typingMsg) typingMsg.remove();
                addAveoMessage("<strong>Aveo 1:</strong> Connection offline. But you shouldn't be. Get back to work.", 'ai');
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
            // Trigger proactive check logic here if needed, but usually on load is fine.
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

    function handleLogout() {
        if (document.querySelector('.logout-modal-overlay')) return;

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'custom-modal-overlay logout-modal-overlay active';
        modalOverlay.innerHTML = `
            <div class="custom-modal">
                <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Log Out</h3>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">Are you sure you want to end your session?</p>
                <div class="modal-actions">
                    <button class="btn-modal btn-cancel">Cancel</button>
                    <button class="btn-modal btn-confirm-delete" id="confirm-logout" style="background-color: #EF4444; border: 1px solid #EF4444; color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">Log Out</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
        const close = () => modalOverlay.remove();
        modalOverlay.querySelector('.btn-cancel').addEventListener('click', close);
        modalOverlay.querySelector('#confirm-logout').addEventListener('click', () => {
            window.location.href = 'onboardingdash.html';
        });
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) close();
        });
    }

    init();
});