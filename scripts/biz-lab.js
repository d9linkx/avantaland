document.addEventListener('DOMContentLoaded', () => {
    // Only run on the lab page
    if (!document.querySelector('.lab-main')) return;

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYztWPZRaAxSA2uGlseKKIn8BOLA7VTfqQ3plhmSxQwdWUt_qKaLNtN_xqm-5v0N5e/exec';
    
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
        "The Problem Solved", "The Target Audience", "The Market Size", "The Competition", 
        "The Unique Mechanism", "The Pricing Power", "The Cost of Goods", "The Margin", 
        "The Acquisition Channel", "The Sales Cycle", "The Lifetime Value", "The Churn Rate",
        "The Viral Coefficient", "The Brand Story", "The Visual Identity", "The Legal Structure",
        "The Founder Fit", "The Team Composition", "The Tech Stack", "The Data Strategy",
        "The Cash Flow", "The Unit Economics", "The Scalability", "The Exit Strategy",
        "The Customer Support", "The Feedback Loop", "The Product Roadmap", "The Marketing Hook",
        "The Sales Script", "The Onboarding Flow", "The Retention Plan", "The Referral System",
        "The Moat"
    ];

    // Mock Content for the Panel (In production, fetch from Sheet/DB)
    const getTruthContent = (index) => ({
        hook: "Most businesses fail here because they solve a problem nobody cares about.",
        fix: "Interview 5 potential customers and ask: 'On a scale of 1-10, how painful is this problem?' If it's below an 8, pivot.",
        deepDive: "This is where we go deep into the psychology of pain points. A 'nice-to-have' product is a luxury. A 'need-to-have' product is a utility. In a recession, luxuries get cut first. Your goal is to become a utility...",
        action: "Validate the problem intensity."
    });

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