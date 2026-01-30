document.addEventListener('DOMContentLoaded', () => {
    // Only run on the lab page
    if (!document.querySelector('.lab-main')) return;

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYztWPZRaAxSA2uGlseKKIn8BOLA7VTfqQ3plhmSxQwdWUt_qKaLNtN_xqm-5v0N5e/exec';
    
    // DOM Elements
    const projectNameEl = document.getElementById('lab-project-name');
    const rankEl = document.getElementById('lab-rank');
    const statusEl = document.getElementById('lab-status');
    const scoreEl = document.getElementById('lab-score');
    const progressCircle = document.querySelector('.progress-ring__circle');
    const gridEl = document.getElementById('truth-grid');
    const onboardingModal = document.getElementById('onboarding-modal');
    const onboardingForm = document.getElementById('onboarding-form');
    const sidePanel = document.getElementById('truth-side-panel');
    const panelOverlay = document.getElementById('truth-panel-overlay');
    const advancedLabEl = document.getElementById('advanced-lab');
    const communityFeedEl = document.getElementById('community-feed');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Audio Assets
    const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
    const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');

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

    // Content Database
    const truthsContent = {
        0: { // Truth #01
            hook: "Readiness is a hallucination. You can never be truly ready. The 'Ready' mindset is a trap meant to delay your progress.",
            fix: "<strong>The 'Today' Tactic:</strong> Perform the smallest possible action to create a 'sunk cost' of emotion. Buy the domain ($12), create the social handle (@YourIdea), or write the landing page headline in a text file. Do it now.",
            deepDive: `
                <p><strong>The Parable of the Perfect Plan</strong><br>
                I spent six months perfecting a blueprint, terrified to launch. Meanwhile, a competitor launched a clumsy, ugly beta. They had users; I had a plan. My plan was a museum piece; their beta was a living entity.</p>
                
                <p><strong>The 3 Traps of "Readiness"</strong></p>
                <ul style="padding-left: 1.2rem; margin-bottom: 1rem;">
                    <li><strong>The Credentialist:</strong> "I need an MBA." (Leadership is seized, not conferred.)</li>
                    <li><strong>The Fortune-Teller:</strong> "I need to be sure it works." (You can never be sure until you test.)</li>
                    <li><strong>The Perfectionist:</strong> "It needs dark mode first." (Perfectionism is fear in a suit. Shipping beats perfection.)</li>
                </ul>
                
                <p><strong>The "Forever" Tactic</strong><br>
                From this day forward, ban the phrase "I'm not ready." Replace it with: "What's the scrappiest version of this I can test?" Need to validate demand? Don't build a product. Run a $10 ad to a landing page.</p>
            `,
            action: "I have executed the 'Today' tactic."
        },
        1: {
            hook: "The market doesn't care about your passion; it cares about its own pain. Passion is fuel, not a business model.",
            fix: "Identify if you are building a 'Vitamin' (nice-to-have) or a 'Painkiller' (must-have). If it's a vitamin, pivot to the bleeding neck problem.",
            deepDive: "<p>Passion blinds you to flaws. You fall in love with the solution instead of the problem. The market is indifferent to your effort; it only cares about the result. Build what they need, not just what you love.</p>",
            action: "I have validated that I am solving a pain, not just pursuing a passion."
        },
        2: {
            hook: "Rejection is data, not a personal attack. If you aren't getting 'No's, you aren't asking enough people.",
            fix: "Go get rejected today. Ask 5 people to buy your product or join your waitlist. Log the 'No's as data points.",
            deepDive: "<p>Sales is a numbers game. Every 'No' brings you closer to a 'Yes' or teaches you why your offer sucks. Fear of rejection is the silent killer of startups.</p>",
            action: "I have logged 5 attempts to sell/pitch."
        },
        3: {
            hook: "The 'Dip' is inevitable. You will hate your business when the initial hype fades and the real work begins.",
            fix: "Write a 'Crisis Protocol' now. When you feel like quitting, what is the one small task you will do to keep moving?",
            deepDive: "<p>Resilience is the only skill that matters when the dopamine hits stop. Everyone starts; few finish. The difference is the ability to work through the desire to burn it all down.</p>",
            action: "I have written my Crisis Protocol."
        },
        4: {
            hook: "You don't need confidence to start; you need courage. Confidence is a lagging indicator of competence.",
            fix: "Set a tiny, achievable goal for the next hour. Achieve it. Confidence is built on a stack of undeniable proof.",
            deepDive: "<p>Stop waiting to feel confident. Action produces confidence, not the other way around. Small wins compound into momentum.</p>",
            action: "I have recorded one small win today."
        },
        5: {
            hook: "Order is a luxury of established companies. Startups are messy by design. Embrace the entropy.",
            fix: "Triage your to-do list. Identify the one 'fire' that will kill the business if left burning, and ignore the rest.",
            deepDive: "<p>If everything is under control, you're not moving fast enough. Your job is not to organize the chaos, but to navigate it toward revenue.</p>",
            action: "I have identified the #1 priority fire."
        },
        6: {
            hook: "No battle plan survives contact with the enemy. Your spreadsheet projections are fiction.",
            fix: "Identify the riskiest assumption in your plan. Test it immediately. Pivot based on real-world data.",
            deepDive: "<p>Agility wins. The ability to change direction based on market feedback is more valuable than the ability to predict the future.</p>",
            action: "I have tested one key assumption."
        },
        7: {
            hook: "Your success highlights their stagnation. Crabs in a bucket will try to pull you down.",
            fix: "Build in silence. Share your wins only with those who are also in the arena.",
            deepDive: "<p>Most people prefer the comfort of shared mediocrity. When you rise, it forces them to confront their own lack of action. Expect resistance.</p>",
            action: "I have removed one toxic influence or distraction."
        },
        8: {
            hook: "Ideas are cheap; execution is everything. Google wasn't the first search engine.",
            fix: "List 3 competitors. Write down exactly how your execution will be faster, better, or cheaper.",
            deepDive: "<p>Don't worry about being unique; worry about being better. The graveyard is full of unique businesses that didn't work.</p>",
            action: "I have defined my execution advantage."
        },
        9: {
            hook: "Your opinion doesn't matter. The market's wallet is the only vote that counts.",
            fix: "Get feedback from a stranger who owes you nothing. If they say it sucks, ask 'Why?' and listen.",
            deepDive: "<p>Kill your ego before it kills your business. You are not your product. Negative feedback is the map to a better product.</p>",
            action: "I have received and recorded honest feedback."
        },
        10: {
            hook: "You are n=1. Just because you want it doesn't mean a market exists.",
            fix: "Find 10 other people who share your specific problem. If you can't, you don't have a business.",
            deepDive: "<p>Scratching your own itch is a great way to start, but a terrible way to scale if you are the only one itching.</p>",
            action: "I have validated demand with 10 others."
        },
        11: {
            hook: "Riches are in the niches. A generalist product is a commodity; a specialist product is a premium solution.",
            fix: "Narrow your target audience until it feels uncomfortably small. Then narrow it again.",
            deepDive: "<p>Be a big fish in a small pond. Dominate a micro-niche before you try to conquer the world.</p>",
            action: "I have defined my specific avatar."
        },
        12: {
            hook: "Code is expensive; talk is cheap. Validate the problem before you build the solution.",
            fix: "Schedule 3 user interviews. Ask about their problems, not your solution.",
            deepDive: "<p>Building in a vacuum is gambling. Talking to users reduces the risk of building something nobody wants.</p>",
            action: "I have completed one user interview."
        },
        13: {
            hook: "People lie in surveys to be nice. They only tell the truth with their wallets.",
            fix: "Create a 'Smoke Test'. Put up a landing page and ask for an email or a pre-order.",
            deepDive: "<p>Revealed preference (what they do) is always more accurate than stated preference (what they say). Watch their feet, not their lips.</p>",
            action: "I have launched a smoke test."
        },
        14: {
            hook: "Sell painkillers, not vitamins. Urgency drives sales.",
            fix: "Rewrite your value proposition to focus on the acute pain you solve, not the benefits you provide.",
            deepDive: "<p>If your product is a 'nice to have', you will struggle in a recession. If it stops the bleeding, you are essential.</p>",
            action: "I have sharpened my value proposition."
        },
        15: {
            hook: "If you aren't embarrassed by your first version, you launched too late.",
            fix: "Ship what you have right now. It's not perfect, but it's real.",
            deepDive: "<p>Perfectionism is procrastination. The market rewards speed. You can iterate on a live product; you can't iterate on a dream.</p>",
            action: "I have shipped v0.1."
        },
        16: {
            hook: "Users buy outcomes, not features. Nobody wants a drill; they want a hole.",
            fix: "Cut your roadmap in half. Focus only on the features that directly deliver the core outcome.",
            deepDive: "<p>Feature creep kills startups. Do one thing exceptionally well rather than ten things poorly.</p>",
            action: "I have removed one non-essential feature."
        },
        17: {
            hook: "The straight line is a myth. You will pivot, iterate, and restart.",
            fix: "Shorten your feedback loop. How fast can you go from idea to data?",
            deepDive: "<p>The startup that learns the fastest wins. Optimize for learning speed, not just execution speed.</p>",
            action: "I have planned my next iteration cycle."
        },
        18: {
            hook: "If it's not written down, it doesn't exist. Systems save you from burnout.",
            fix: "Document your core process. Create a checklist for the thing you do most often.",
            deepDive: "<p>SOPs (Standard Operating Procedures) are the difference between a job and a business. You can't scale chaos.</p>",
            action: "I have written one SOP."
        },
        19: {
            hook: "Technical debt is the price of speed. Your first codebase is disposable.",
            fix: "Accept the mess. Don't optimize code that might be deleted next week.",
            deepDive: "<p>Premature optimization is the root of all evil. Build to validate, then rebuild to scale.</p>",
            action: "I have shipped despite the messy code."
        },
        20: {
            hook: "Friction kills conversion. If they can't figure it out in 5 seconds, they leave.",
            fix: "Watch a user try to sign up or use your product. Don't help them. Just watch.",
            deepDive: "<p>Usability beats aesthetics. A beautiful app that is hard to use is a paperweight.</p>",
            action: "I have identified and fixed one UX hurdle."
        },
        21: {
            hook: "Speed is a feature. A good product today beats a perfect product next year.",
            fix: "Set a hard deadline for your next milestone. Stick to it.",
            deepDive: "<p>Time to market matters. The longer you wait, the more likely you are to run out of cash or motivation.</p>",
            action: "I have set a launch deadline."
        },
        22: {
            hook: "Friends want to be nice; they will lie to protect your feelings.",
            fix: "Stop pitching friends. Pitch strangers who have the problem.",
            deepDive: "<p>The 'Mom Test': If you ask your mom if your idea is good, she will say yes because she loves you. That is false data.</p>",
            action: "I have pitched to a stranger."
        },
        23: {
            hook: "Early adopters forgive bugs; the mass market won't. Cherish them.",
            fix: "Email your first 10 users personally. Ask them what they hate.",
            deepDive: "<p>Your first users are your co-founders. Treat them like royalty. They are the bridge to the mainstream.</p>",
            action: "I have contacted my early adopters."
        },
        24: {
            hook: "They buy better versions of themselves. Sell the transformation.",
            fix: "Define the 'After' state. Who does your customer become after using your product?",
            deepDive: "<p>Don't sell the mattress; sell the good night's sleep. Focus on the result, not the mechanism.</p>",
            action: "I have defined the customer transformation."
        },
        25: {
            hook: "Build an audience, then a product. Distribution is harder than product.",
            fix: "Start posting content about the problem you solve today. Don't wait for the product.",
            deepDive: "<p>If you have an audience, you can sell anything. If you have a product but no audience, you have nothing.</p>",
            action: "I have posted content about the problem."
        },
        26: {
            hook: "Feedback is a weapon. Ignore it at your peril.",
            fix: "Set up a direct channel for feedback. Make it easy for users to complain.",
            deepDive: "<p>Complaints are gifts. They tell you exactly how to improve. Silence is the real enemy.</p>",
            action: "I have implemented one piece of feedback."
        },
        27: {
            hook: "You can't growth hack a product nobody wants. Product-Market Fit comes first.",
            fix: "Measure your retention. Are people coming back?",
            deepDive: "<p>Growth tactics on a leaky bucket just accelerate your demise. Fix the bucket first.</p>",
            action: "I have calculated my retention rate."
        },
        28: {
            hook: "Focus is saying no. You can't do everything.",
            fix: "Delegate or delete. What are you doing that doesn't move the needle?",
            deepDive: "<p>Opportunity cost is real. Every hour spent on low-leverage work is an hour stolen from high-leverage work.</p>",
            action: "I have removed one task from my plate."
        },
        29: {
            hook: "Your net worth is your network. Don't build in isolation.",
            fix: "Reach out to 5 people in your industry. Ask for advice, not money.",
            deepDive: "<p>Warm intros are the currency of business. Build relationships before you need them.</p>",
            action: "I have sent 5 networking messages."
        },
        30: {
            hook: "Fixed costs kill startups. Hire slow, fire fast.",
            fix: "Do it yourself first. Only hire when you are overwhelmed by revenue-generating tasks.",
            deepDive: "<p>Hire to scale a working process, not to figure out the process. Premature scaling is the #1 cause of startup death.</p>",
            action: "I have audited my hiring plan."
        },
        31: {
            hook: "You need a coach, not a cheerleader. Fire mentors who only praise you.",
            fix: "Find someone who challenges you. Ask for 'brutal' feedback.",
            deepDive: "<p>Growth happens outside your comfort zone. You need someone who cares enough to hurt your feelings with the truth.</p>",
            action: "I have sought critical feedback."
        },
        32: {
            hook: "Capital amplifies efficiency or inefficiency. Money won't fix a broken engine.",
            fix: "Fix the unit economics. Ensure you make money on every sale before you scale.",
            deepDive: "<p>Profitability > Revenue. Don't scale losses hoping volume will fix it. It won't.</p>",
            action: "I have calculated my unit economics."
        }
    };

    // Helper: Get Content with Fallback
    const getTruthContent = (index) => {
        return truthsContent[index] || {
            hook: "This truth is currently locked or being updated.",
            fix: "Complete the previous truths to unlock this section.",
            deepDive: "Content is being uploaded from the Vault.",
            action: "Pending..."
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

    // Helper: Get Status
    const getStatus = (score) => {
        return score >= 80 ? "Market Ready" : "In-Development";
    };

    // Helper: Update Progress Ring
    const setProgress = (percent) => {
        const radius = progressCircle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percent / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        scoreEl.innerText = Math.round(percent);
        statusEl.innerText = `Status: ${getStatus(percent)}`;
    };

    // Helper: Open Side Panel
    const openPanel = (index, title, isCompleted, updateCallback) => {
        const content = getTruthContent(index);
        clickSound.play().catch(() => {}); // Play click sound
        const panelBody = document.getElementById('panel-body');
        
        document.getElementById('panel-truth-number').innerText = `Truth #${String(index + 1).padStart(2, '0')}`;
        document.getElementById('panel-truth-title').innerText = title;

        panelBody.innerHTML = `
            <div class="panel-section">
                <h4>The Slap (Hook)</h4>
                <p class="hook-text">${content.hook}</p>
            </div>
            <div class="panel-section">
                <h4>The 5-Min Fix</h4>
                <p>${content.fix}</p>
            </div>
            <div class="panel-section">
                <button id="unlock-strategy-btn" class="btn-unlock">
                    <span>🔒 Unlock Full Strategy</span>
                </button>
                <div id="deep-dive-content" class="deep-dive-content" style="display:none;">
                    <h4>The Library (Deep Dive)</h4>
                    ${content.deepDive}
                </div>
            </div>
            <div class="panel-section action-box">
                <h4>Action Item</h4>
                <p>${content.action}</p>
            </div>
            <div style="margin-top: 2rem;">
                ${isCompleted 
                    ? `<button class="btn-fix" style="background:#10B981; cursor:default;">✓ Verified Fixed</button>`
                    : `<button id="mark-fixed-btn" class="btn-fix">I Have Fixed This</button>`
                }
            </div>
        `;

        // Unlock Handler
        const unlockBtn = document.getElementById('unlock-strategy-btn');
        const deepDiveContent = document.getElementById('deep-dive-content');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                unlockBtn.style.display = 'none';
                deepDiveContent.style.display = 'block';
            });
        }

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
    const renderGrid = (truthsData, updateTruthCallback, filter = 'all') => {
        gridEl.innerHTML = '';
        let completedCount = 0;

        truthTitles.forEach((title, index) => {
            const isCompleted = truthsData[index] === 1;
            if (isCompleted) completedCount++;
            
            // Priority Logic: First 3 are priority if not completed
            const isPriority = index < 3 && !isCompleted;

            // Filtering Logic
            if (filter === 'completed' && !isCompleted) return;
            if (filter === 'priority' && !isPriority) return;
            
            const card = document.createElement('div');
            card.className = `truth-card ${isCompleted ? 'completed' : ''} ${isPriority ? 'priority' : ''}`;
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

        // Advanced Lab (Locked Section)
        advancedLabEl.style.display = 'block';
        advancedLabEl.innerHTML = `
            <h3>Advanced Lab: Scale-up Strategies</h3>
            <p>Locked. Complete all 33 Truths to unlock the Scale-up modules.</p>
            <button class="btn-upgrade">Maintain Your Edge ($19/mo)</button>
        `;
    };

    // Helper: Render Community Feed (Simulated)
    const renderCommunityFeed = () => {
        const activities = [
            { user: "Sarah K.", action: "Verified Truth #04", project: "EcoPay" },
            { user: "David M.", action: "Reached 20% Score", project: "FitTrack" },
            { user: "James L.", action: "Verified Truth #12", project: "SaaSify" },
            { user: "Elena R.", action: "Unlocked Strategist Rank", project: "Artisan" }
        ];

        communityFeedEl.innerHTML = activities.map(item => `
            <div class="feed-item">
                <strong>${item.user}</strong> from <em>${item.project}</em><br>
                <span>${item.action}</span>
            </div>
        `).join('');
        
        // Simulate live updates
        setInterval(() => {
            // In a real app, fetch new data and prepend
        }, 5000);
    };

    // Main Logic
    const initLab = async (emailOverride = null) => {
        let email = emailOverride || getEmailFromUrl();
        let currentFilter = 'all';
        
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
            let mockData;
            const storageKey = `avantaland_lab_${email}`;
            const storedData = localStorage.getItem(storageKey);

            if (storedData) {
                mockData = JSON.parse(storedData);
            } else {
                // Default Initial State
                mockData = {
                    project_name: "Project Alpha",
                    master_score: 0,
                    truths: Array(33).fill(0)
                };
            }

            // Callback to update state when user fixes a truth
            const updateTruth = (index) => {
                mockData.truths[index] = 1;
                // Recalculate score
                const totalFixed = mockData.truths.filter(t => t === 1).length;
                mockData.master_score = (totalFixed / 33) * 100;
                
                // Save to LocalStorage
                localStorage.setItem(storageKey, JSON.stringify(mockData));

                // Trigger Rewards
                successSound.currentTime = 0;
                successSound.play().catch(() => {});
                
                // Confetti Explosion
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }

                // Re-render
                rankEl.innerText = getRank(mockData.master_score);
                setProgress(mockData.master_score);
                renderGrid(mockData.truths, updateTruth, currentFilter);
            };
            
            // Use mock data for now
            const data = { result: 'success', data: mockData };

            if (data.result === 'success') {
                const { project_name, master_score, truths } = data.data;
                
                projectNameEl.innerText = project_name || "Untitled Project";
                rankEl.innerText = getRank(master_score);
                statusEl.innerText = `Status: ${getStatus(master_score)}`;
                setProgress(master_score);
                renderGrid(truths, updateTruth, currentFilter);
                renderCommunityFeed();

                // Setup Filter Listeners
                filterBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        filterBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        currentFilter = btn.dataset.filter;
                        renderGrid(mockData.truths, updateTruth, currentFilter);
                    });
                });
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