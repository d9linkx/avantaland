document.addEventListener('DOMContentLoaded', () => {
    // Only run on the lab page
    if (!document.querySelector('.lab-main')) return;

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzc15roxFieyBuiRS5X7bUhe-zCDI6VRQTimFZFp8zwL5cKFG3lCdUNheF6R_B2a0co/exec';
    
    // DOM Elements
    const projectNameEl = document.getElementById('lab-project-name');
    const rankEl = document.getElementById('lab-rank');
    const scoreEl = document.getElementById('lab-score');
    const progressCircle = document.querySelector('.progress-ring__circle');
    const gridEl = document.getElementById('truth-grid');
    const onboardingModal = document.getElementById('onboarding-modal');
    const onboardingForm = document.getElementById('onboarding-form');
    const sidePanel = document.getElementById('truth-side-panel');
    const panelOverlay = document.getElementById('truth-panel-overlay');

    // 33 Truths Data Structure (Titles)
    const truthTitles = [
        "You are unqualified; no amount of prep survives first contact",
        "Passion is a poverty trap; the market doesn't care how much you \"love\" your idea",
        "If you can’t eat \"No\" for breakfast, you'll starve",
        "You will want to burn your own company to the ground at least 10 times",
        "Confidence is learned through small wins, not pep talks",
        "Expect chaos; it’s the default state of early businesses",
        "Your first plan is almost always wrong; accept it",
        "Most people want to see you fail so they feel better about staying safe",
        "Your idea isn’t unique; someone else is already thinking it",
        "Validation kills ego: people will tell you it sucks. Listen",
        "Building something for yourself is tempting but dangerous",
        "A small, obsessed niche is better than a large lukewarm market",
        "Talking to users before coding is mandatory",
        "Surveys lie; prototypes don’t",
        "Solve the bleeding wound today, not the itch they might have next year",
        "If you aren’t embarrassed by the first version of your MVP, you shipped too late",
        "Features are distractions. Focus on outcomes",
        "You’ll iterate more than you plan. Accept it",
        "Documentation is not sexy but will save you weeks",
        "Your first codebase will suck. Refactor later",
        "UX is the silent growth engine. Ignore at your peril",
        "A \"good\" product shipped today beats a \"perfect\" one that never exists",
        "Your friends are liars; they love you, so they’ll let you go bankrupt with a smile",
        "Early adopters are gold; casual users are noise",
        "People don’t buy products. They buy what solves their problem",
        "Marketing starts before product; awareness is traction",
        "Feedback is a weapon; use it like a boss, or your competitors will",
        "You can't \"growth hack\" a product that nobody wants",
        "You can’t do everything",
        "Your network is your early advantage. Don’t build in isolation",
        "Hiring before revenue is a gamble; hire slow, fire fast",
        "If your mentor only tells you what you want to hear, fire them",
        "Money won't fix a broken engine; it just makes the crash more spectacular"
    ];

    // Cache for truths to avoid re-fetching
    const truthsCache = {};

    // Helper: Fetch Truth Content
    const fetchTruthContent = async (index) => {
        if (truthsCache[index]) return truthsCache[index];

        try {
            // ID is 1-based in the new sheet structure
            const response = await fetch(`${SCRIPT_URL}?action=getTruth&id=${index + 1}`);
            const data = await response.json();
            
            if (data) {
                // Adapt new 3-column structure (ID, Title, Deep_Dive_HTML) to UI
                // Handle potential key variations from doGet
                let rawContent = data.Deep_Dive_HTML || data.deepDive || (data.hook && data.hook.length > 100 ? data.hook : "") || "";
                
                // Format content: Convert newlines to HTML paragraphs if not already HTML
                let formattedContent = rawContent;
                if (rawContent && !rawContent.includes('<p>')) {
                    formattedContent = rawContent.split('\n').map(para => {
                        const trimmed = para.trim();
                        return trimmed ? `<p>${trimmed}</p>` : '';
                    }).join('');
                }

                // Extract Hook from content (First Paragraph)
                let hookText = "Unlock the strategy to learn more.";
                if (formattedContent) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = formattedContent;
                    const firstPara = tempDiv.querySelector('p');
                    if (firstPara) {
                        hookText = firstPara.innerText;
                        if (hookText.length > 200) hookText = hookText.substring(0, 200) + "...";
                    }
                }

                const adaptedData = {
                    title: data.Title || data.title || truthTitles[index],
                    hook: hookText,
                    fix: "See the full strategy below.",
                    deepDive: formattedContent || "Content is being uploaded.",
                    action: "Complete the steps in the strategy."
                };

                truthsCache[index] = adaptedData;
                return adaptedData;
            }
        } catch (e) {
            console.error("Fetch error", e);
        }
        
        // Fallback
        return {
            hook: "Content loading...",
            fix: "Please check your connection.",
            deepDive: "If this persists, the content might not be in the database yet.",
            action: "Retry"
        };
    };

    // Helper: Get Email from URL
    const getEmailFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('email');
    };

    // Helper: Calculate Rank
    const getRank = (score) => {
        const count = Math.round((score / 100) * 33);
        if (count <= 10) return "Apprentice";
        if (count <= 22) return "Strategist";
        return "Master Architect";
    };

    // Helper: Update Progress Ring
    const setProgress = (percent) => {
        const radius = progressCircle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percent / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        scoreEl.innerText = Math.round(percent);
    };

    // Helper: Open Side Panel
    const openPanel = (index, title, isCompleted, updateCallback) => {
        const content = getTruthContent(index);
        const panelBody = document.getElementById('panel-body');
        
        document.getElementById('panel-truth-number').innerText = `Truth #${String(index + 1).padStart(2, '0')}`;
        document.getElementById('panel-truth-title').innerText = title;

        panelBody.innerHTML = `
            <div class="panel-section">
                <h4>The Hook</h4>
                <p>${content.hook}</p>
            </div>
            <div class="panel-section">
                <h4>The 5-Min Fix</h4>
                <p>${content.fix}</p>
            </div>
            <div class="panel-section">
                <h4>Deep Dive Strategy</h4>
                <p>${content.deepDive}</p>
            </div>
            <div style="margin-top: 3rem;">
                ${isCompleted 
                    ? `<button class="btn-fix" style="background:#10B981; cursor:default;">✓ Verified Fixed</button>`
                    : `<button id="mark-fixed-btn" class="btn-fix">I Have Fixed This</button>`
                }
            </div>
        `;

        if (!isCompleted) {
            document.getElementById('mark-fixed-btn').addEventListener('click', () => {
                updateCallback(index);
                closePanel();
            });
        }

        sidePanel.classList.add('open');
        panelOverlay.classList.add('active');
    };

    const closePanel = () => {
        sidePanel.classList.remove('open');
        panelOverlay.classList.remove('active');
    };

    document.getElementById('close-panel-btn').addEventListener('click', closePanel);
    panelOverlay.addEventListener('click', closePanel);

    // Helper: Render Grid
    const renderGrid = (truthsData, updateTruthCallback) => {
        gridEl.innerHTML = '';
        let completedCount = 0;

        truthTitles.forEach((title, index) => {
            const isCompleted = truthsData[index] === 1;
            if (isCompleted) completedCount++;
            
            const card = document.createElement('div');
            card.className = `truth-card ${isCompleted ? 'completed' : ''}`;
            card.innerHTML = `
                <div>
                    <div class="truth-number">Truth #${String(index + 1).padStart(2, '0')}</div>
                    <div class="truth-title">${title}</div>
                </div>
                <div class="truth-status-icon">
                    ${isCompleted ? 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : 
                        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'
                    }
                </div>
            `;
            
            // Click opens the panel
            card.addEventListener('click', () => {
                openPanel(index, title, isCompleted, updateTruthCallback);
            });

            gridEl.appendChild(card);
        });

        // Retention: Special Access Tile (After 10 Truths)
        if (completedCount >= 10) {
            const specialCard = document.createElement('div');
            specialCard.className = 'truth-card special-access-card fade-in';
            specialCard.innerHTML = `
                <h4>Special Access Unlocked</h4>
                <p>You're in the top 10%. Get your project audited live.</p>
                <button class="btn-access">Join Live Session</button>
            `;
            gridEl.appendChild(specialCard);
        }
    };

    // Main Logic
    const initLab = async (emailOverride = null) => {
        let email = emailOverride || getEmailFromUrl();
        
        if (!email) {
            // Show Onboarding Modal
            onboardingModal.classList.add('active');
            return;
        }

        // Fetch Data from Google Sheet
        try {
            // In production:
            // const response = await fetch(`${SCRIPT_URL}?action=getLabProgress&email=${encodeURIComponent(email)}`);
            // const data = await response.json();

            // SIMULATED STATE
            let mockData = {
                project_name: "Project Alpha",
                master_score: 15, // Percentage
                truths: Array(33).fill(0).map((_, i) => i < 5 ? 1 : 0) // First 5 completed
            };

            // Callback to update state when user fixes a truth
            const updateTruth = (index) => {
                mockData.truths[index] = 1;
                // Recalculate score
                const totalFixed = mockData.truths.filter(t => t === 1).length;
                mockData.master_score = (totalFixed / 33) * 100;
                
                // Re-render
                rankEl.innerText = getRank(mockData.master_score);
                setProgress(mockData.master_score);
                renderGrid(mockData.truths, updateTruth);
            };
            
            // Use mock data for now
            const data = { result: 'success', data: mockData };

            if (data.result === 'success') {
                const { project_name, master_score, truths } = data.data;
                
                projectNameEl.innerText = project_name || "Untitled Project";
                rankEl.innerText = getRank(master_score);
                setProgress(master_score);
                renderGrid(truths, updateTruth);
            } else {
                projectNameEl.innerText = "Project Not Found";
            }

        } catch (error) {
            console.error("Lab Error:", error);
            projectNameEl.innerText = "Connection Error";
        }
    };

    // Handle Onboarding Form Submit
    onboardingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('lab-email').value;
        const project = document.getElementById('lab-project').value;
        
        onboardingModal.classList.remove('active');
        // In a real app, we would POST this data to create the user row
        // For now, we just init the view with the email
        initLab(email);
        projectNameEl.innerText = project; // Optimistic update
    });

    initLab();
});