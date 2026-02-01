document.addEventListener('DOMContentLoaded', () => {
    // Only run on the lab page
    if (!document.querySelector('.lab-main')) return;

    const SCRIPT_URL = CONFIG.GOOGLE_SCRIPT_URL_APP;
    
    // DOM Elements
    const projectNameEl = document.getElementById('lab-project-name');
    const rankEl = document.getElementById('lab-rank');
    const scoreEl = document.getElementById('lab-score');
    const progressCircle = document.querySelector('.progress-ring__circle');
    const gridEl = document.getElementById('truth-grid');
    const onboardingModal = document.getElementById('onboarding-modal');
    const onboardingForm = document.getElementById('onboarding-form');

    // Audio Assets
    const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    const messageSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');

    // --- CHAT SYSTEM ENGINE ---
    const ChatSystem = {
        history: [],
        context: {
            name: "Founder",
            project: "Your Project",
            businessType: "Business"
        },
        
        loadContext: async (email) => {
            try {
                const response = await fetch(`${SCRIPT_URL}?action=getUserData&email=${encodeURIComponent(email)}`);
                const data = await response.json();
                if (data && data.result !== 'error') {
                    ChatSystem.context.name = data.name || data.firstName || "Founder";
                    ChatSystem.context.businessType = data.business || data.project_name || "Business";
                    ChatSystem.context.project = data.project_name || "Your Project";
                    
                    const contextDisplay = document.getElementById('user-context-display');
                    if(contextDisplay) contextDisplay.innerText = `${ChatSystem.context.businessType} Consultant`;
                }
            } catch (e) {
                console.warn("Could not load user context", e);
            }
        },

        callAPI: async (messages) => {
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || `API Error`);
                return data.choices[0].message.content;
            } catch (error) {
                console.error("Chat API Error:", error);
                throw error;
            }
        },

        askConsultant: async (userMessage) => {
            const systemPrompt = `You are "The Lab Consultant". Context: ${ChatSystem.context.name}, ${ChatSystem.context.businessType}. Tone: Professional, intense, billionaire mentor. End with a specific next step.`;
            ChatSystem.history.push({ role: "user", content: userMessage });
            const messages = [{ role: "system", content: systemPrompt }, ...ChatSystem.history.slice(-10)];
            try {
                const aiResponse = await ChatSystem.callAPI(messages);
                ChatSystem.history.push({ role: "assistant", content: aiResponse });
                ChatSystem.saveChat(userMessage, aiResponse);
                return aiResponse;
            } catch (e) {
                ChatSystem.history.pop(); 
                return "Connection error. Check API key.";
            }
        },

        saveChat: (userMsg, aiMsg) => {
            const email = getEmailFromUrl();
            if (!email) return;
            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'saveChat', email, userMsg, aiMsg })
            }).catch(e => console.log("Save failed", e));
        },

        askResearcher: async (question, truthContext) => {
            const cleanContent = (truthContext.deepDive || "").replace(/<[^>]*>/g, ' ').substring(0, 5000);
            const systemPrompt = `Analyze "${truthContext.title}" for ${ChatSystem.context.name}. Content: ${cleanContent}`;
            try { return await ChatSystem.callAPI([{ role: "system", content: systemPrompt }, { role: "user", content: question }]); } 
            catch (e) { return "Analysis failed."; }
        }
    };

    const truthTitles = [
        "You are unqualified; no amount of prep survives first contact",
        "Passion is a poverty trap; the market doesn't care how much you \"love\" your idea",
        "If you can’t eat \"No\" for breakfast, you'll starve",
        "You will want to burn your own company to the ground at least 10 times",
        "Confidence is learned through small wins, not pep talks",
        "Expect chaos; it’s the default state of early businesses",
        "Your first plan is almost always wrong; accept it",
        "Most people want to see you fail so they feel better about staying safe.",
        "Your idea isn’t unique; someone else is already thinking it",
        "Validation kills ego. When people will tell you it sucks, listen.",
        "Building something for yourself is tempting but dangerous",
        "A small, obsessed niche > a large lukewarm market",
        "Talking to users before coding is mandatory",
        "Surveys lie; prototypes don’t",
        "Solve the bleeding wound today, not the itch they might have next year",
        "If you aren’t embarrassed by the first version of your MVP, you shipped too late.",
        "Features are distractions. Focus on outcomes",
        "You'll iterate more than you plan. Accept it",
        "Documentation isn’t sexy but will save you weeks",
        "Your first codebase will suck; refactor later",
        "UX is the silent growth engine. Ignore at your peril",
        "A \"good\" product shipped today beats a \"perfect\" one that never exists",
        "Your friends are liars; they love you, so they’ll let you go bankrupt with a smile.",
        "Early adopters are gold; casual users are noise",
        "People don’t buy products. They buy what solves their problem",
        "Marketing starts before product; awareness is traction",
        "Feedback is a weapon; use it like a boss, or your competitors will.",
        "You can't \"growth hack\" a product that nobody wants.",
        "You can’t do everything, but trying teaches boundaries",
        "Your network is your early advantage; don’t build in isolation",
        "Hiring before revenue is a gamble; hire slow, fire fast",
        "If your mentor only tells you what you want to hear, fire them",
        "Money won't fix a broken engine; it just makes the crash more spectacular"
    ];

    const getEmailFromUrl = () => new URLSearchParams(window.location.search).get('email');
    const getRank = (score) => {
        const count = Math.round((score / 100) * 33);
        return count <= 10 ? "Apprentice" : count <= 22 ? "Strategist" : "Master Architect";
    };

    const setProgress = (percent) => {
        const radius = progressCircle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        progressCircle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
        scoreEl.innerText = Math.round(percent);
    };

    const renderGrid = (truthsData) => {
        gridEl.innerHTML = '';
        truthTitles.forEach((title, index) => {
            const isCompleted = truthsData[index] === 1;
            const card = document.createElement('a');
            card.href = `truths/truth${index + 1}.html`;
            card.target = "_blank";
            card.className = `truth-card ${isCompleted ? 'completed' : ''}`;
            // Ensure anchor behaves like a card
            card.style.textDecoration = 'none';
            card.style.color = 'inherit';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.innerHTML = `<div><div class="truth-number">Truth #${String(index+1).padStart(2, '0')}</div><div class="truth-title">${title}</div></div><div class="status-icon">${isCompleted ? '✓' : '+'}</div>`;
            gridEl.appendChild(card);
        });
    };

    const initLab = async (emailOverride = null) => {
        let email = emailOverride || getEmailFromUrl();
        if (!email) { onboardingModal.classList.add('active'); return; }
        
        // Load progress from localStorage
        const savedProgress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
        const truthsArray = Array(33).fill(0).map((_, i) => savedProgress[i] ? 1 : 0);
        const completedCount = truthsArray.filter(t => t === 1).length;
        const score = (completedCount / 33) * 100;

        let mockData = { 
            project_name: "Project Alpha", 
            master_score: score, 
            truths: truthsArray 
        };
        
        projectNameEl.innerText = mockData.project_name;
        setProgress(mockData.master_score);
        rankEl.innerText = getRank(mockData.master_score);
        await ChatSystem.loadContext(email);
        renderGrid(mockData.truths);
    };

    // --- MOBILE/GLOBAL CHAT ---
    const chatInputGlobal = document.getElementById('chat-input');
    const mobileTrigger = document.getElementById('mobile-chat-trigger');
    const consultantWrapper = document.getElementById('consultant-wrapper');

    if (mobileTrigger) {
        mobileTrigger.onclick = () => {
            consultantWrapper.classList.add('active');
            chatInputGlobal.focus();
        };
        document.getElementById('close-chat-mobile').onclick = () => consultantWrapper.classList.remove('active');
    }

    const handleGlobalChat = async () => {
        const txt = chatInputGlobal.value.trim();
        if (!txt) return;
        chatInputGlobal.value = '';
        addChatMessage('user', txt);
        const ans = await ChatSystem.askConsultant(txt);
        addChatMessage('ai', ans);
    };

    const addChatMessage = (sender, text) => {
        const el = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = sender === 'user' ? 'user-msg' : 'ai-msg';
        div.innerHTML = text.replace(/\n/g, '<br>');
        el.appendChild(div);
        el.scrollTop = el.scrollHeight;
    };

    document.getElementById('send-chat-btn').onclick = handleGlobalChat;
    chatInputGlobal.onkeypress = (e) => { if(e.key==='Enter') handleGlobalChat(); };

    onboardingForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('lab-email').value.trim();
        onboardingModal.classList.remove('active');
        await initLab(email);
    };

    initLab();
});