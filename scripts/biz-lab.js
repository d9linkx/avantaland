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
    const sidePanel = document.getElementById('truth-side-panel');
    const panelOverlay = document.getElementById('truth-panel-overlay');

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
                    
                    // Update UI
                    const contextDisplay = document.getElementById('user-context-display');
                    if(contextDisplay) contextDisplay.innerText = `${ChatSystem.context.businessType} Consultant`;
                }
            } catch (e) {
                console.warn("Could not load user context", e);
            }
        },

        // Core API Call
        callAPI: async (messages) => {
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    console.error("Server Error Details:", data);
                    throw new Error(data.error || `API Error (${response.status})`);
                }
                
                return data.choices[0].message.content;
            } catch (error) {
                console.error("Chat API Error:", error);
                throw error;
            }
        },

        // 1. Global Consultant (Sidebar/Mobile)
        askConsultant: async (userMessage) => {
            const systemPrompt = `
                You are "The Lab Consultant", the elite AI architect of Avantaland Academy.
                
                USER CONTEXT:
                - Name: ${ChatSystem.context.name}
                - Business Type: ${ChatSystem.context.businessType}
                - Project: ${ChatSystem.context.project}
                
                YOUR IDENTITY:
                - You are the "Brutal Truth" analyst. You value profit over passion and execution over ideas.
                - Use your expertise in finance, marketing, and strategy to counsel them specifically on their ${ChatSystem.context.businessType}.
                
                GUIDELINES:
                1. **No Fluff**: Dive straight into the answer.
                2. **Structure**: Use bullet points and bold text for key insights.
                3. **Action-Oriented**: End with a specific "Next Step" or a probing question.
                4. **Tone**: Professional, intense, like a billionaire mentor.
            `;

            // Add user message to history
            ChatSystem.history.push({ role: "user", content: userMessage });

            // Prepare full message chain
            const messages = [
                { role: "system", content: systemPrompt },
                ...ChatSystem.history.slice(-10) // Keep only last 10 messages to prevent token errors
            ];

            try {
                const aiResponse = await ChatSystem.callAPI(messages);
                ChatSystem.history.push({ role: "assistant", content: aiResponse });
                ChatSystem.saveChat(userMessage, aiResponse);
                return aiResponse;
            } catch (e) {
                // Don't save failed messages to history to avoid context pollution
                console.error("Consultant Chat Error:", e);
                ChatSystem.history.pop(); 
                return "I'm having trouble connecting. Please check your API Key or internet connection.";
            }
        },

        saveChat: (userMsg, aiMsg) => {
            const email = getEmailFromUrl();
            if (!email) return;
            // Fire and forget save
            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'saveChat', email, userMsg, aiMsg
                })
            }).catch(e => console.log("Chat save failed", e));
        },

        // 2. Researcher (Side Panel - Specific Truth)
        askResearcher: async (question, truthContext) => {
            const title = truthContext.title || "Business Strategy";
            const cleanContent = (truthContext.deepDive || "").replace(/<[^>]*>/g, ' ').substring(0, 8000);
            
            const systemPrompt = `
                You are "The Lab AI", a world-class business researcher analyzing a specific strategy.
                
                STRATEGY CONTEXT:
                - Title: ${title}
                - Summary: ${truthContext.hook}
                - Content: ${cleanContent}
                
                INSTRUCTIONS:
                Answer the user's question based specifically on the strategy content above.
                Be direct, insightful, and practical. Keep it under 150 words.
            `;

            const messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: question }
            ];

            try {
                return await ChatSystem.callAPI(messages);
            } catch (e) {
                return "I couldn't analyze that right now. Please check your connection.";
            }
        }
    };

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
            const response = await fetch(`${SCRIPT_URL}?action=getTruth&id=${index + 1}`, { method: 'GET' });
            const data = await response.json();

            // Normalize possible response shapes:
            // - { result: 'success', data: {...} }
            // - { Title: ..., Deep_Dive_HTML: ... }
            // - [ { Title: ..., Deep_Dive_HTML: ... } ]
            let payload = null;
            if (!data) payload = null;
            else if (data.result && data.data) payload = data.data;
            else if (Array.isArray(data) && data.length) payload = data[0];
            else payload = data;

            if (payload) {
                // Debug: log the payload shape so devs can see what the API returned
                console.debug('[Lab] getTruth payload keys:', Object.keys(payload));
                // Fetch content specifically from Column C (Deep_Dive_HTML)
                // Check multiple casing variations to be safe
                let rawContent = payload.Deep_Dive_HTML || payload.deep_dive_html || payload.DeepDiveHTML || payload.deepDive || payload.hook || "";

                // If not found yet, try to discover any key that mentions 'deep' or 'dive' (covers odd column names)
                if (!rawContent) {
                    for (const k of Object.keys(payload)) {
                        const kl = k.toLowerCase();
                        if (kl.includes('deep') || kl.includes('dive')) {
                            const val = payload[k];
                            if (typeof val === 'string' && val.trim()) {
                                rawContent = val;
                                break;
                            }
                            // If nested object, try to find an html/text field inside it
                            if (val && typeof val === 'object') {
                                for (const k2 of Object.keys(val)) {
                                    const kl2 = k2.toLowerCase();
                                    if (kl2.includes('html') || kl2.includes('text') || kl2.includes('content')) {
                                        const vv = val[k2];
                                        if (typeof vv === 'string' && vv.trim()) {
                                            rawContent = vv;
                                            break;
                                        }
                                    }
                                }
                                if (rawContent) break;
                            }
                        }
                    }
                }

                // If the field contains an object (sometimes Apps Script returns structured rows), try common paths
                if (!rawContent && payload.fields && typeof payload.fields === 'object') {
                    rawContent = payload.fields.Deep_Dive_HTML || payload.fields.deep_dive_html || '';
                }

                // Normalize escaped sequences and HTML entities that may come from Apps Script
                if (typeof rawContent === 'string') {
                    // Convert literal backslash-n sequences to actual newlines
                    rawContent = rawContent.replace(/\\n/g, '\n');
                    // Remove stray carriage returns
                    rawContent = rawContent.replace(/\r/g, '');
                    // Unescape simple HTML entities if present (e.g. &lt;p&gt;)
                    if (rawContent.includes('&lt;') || rawContent.includes('&gt;') || rawContent.includes('&amp;')) {
                        rawContent = rawContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
                    }
                } else if (Array.isArray(rawContent)) {
                    rawContent = rawContent.join('\n\n');
                } else if (rawContent && typeof rawContent === 'object') {
                    // If the sheet returned a structured object, try to pull a text field
                    for (const k of Object.keys(rawContent)) {
                        if (typeof rawContent[k] === 'string') {
                            rawContent = rawContent[k];
                            break;
                        }
                    }
                }

                // Format content: Convert newlines to HTML paragraphs if not already HTML
                let formattedContent = rawContent || '';
                if (formattedContent && !formattedContent.includes('<p>')) {
                    formattedContent = formattedContent.split(/\r?\n/).map(para => {
                        const trimmed = para.trim();
                        return trimmed ? `<p>${trimmed}</p>` : '';
                    }).join('');
                }

                // Debug: show what was found for rawContent/formattedContent
                console.debug('[Lab] rawContent length:', (rawContent || '').length, 'formattedContent length:', (formattedContent || '').length);

                // Extract Hook from content (First Paragraph) but prefer explicit Hook field if present
                let hookText = payload.hook || payload.Hook || "Unlock the strategy to learn more.";
                if ((!hookText || hookText === '') && formattedContent) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = formattedContent;
                    const firstPara = tempDiv.querySelector('p');
                    if (firstPara) {
                        hookText = firstPara.innerText;
                        if (hookText.length > 200) hookText = hookText.substring(0, 200) + "...";
                    }
                }

                const adaptedData = {
                    title: payload.Title || payload.title || truthTitles[index],
                    hook: hookText,
                    fix: payload.fix || "Read the full strategy below for the fix.",
                    deepDive: formattedContent || "Content is being uploaded.",
                    action: payload.action || "Execute the steps in the strategy."
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
    const openPanel = async (index, title, isCompleted, updateCallback) => {
        clickSound.play().catch(() => {}); // Play click sound
        const panelBody = document.getElementById('panel-body');
        
        // Loading State
        panelBody.innerHTML = `
            <div style="text-align:center; padding: 2rem; color: #64748B;">
                <p>Accessing Vault...</p>
            </div>
        `;
        sidePanel.classList.add('open');
        panelOverlay.classList.add('active');

        document.getElementById('panel-truth-number').innerText = `Truth #${String(index + 1).padStart(2, '0')}`;
        document.getElementById('panel-truth-title').innerText = title;

        // Fetch Content
        const content = await fetchTruthContent(index);

        panelBody.innerHTML = `
            <div class="panel-section">
                <h4>Summary</h4>
                <p class="hook-text">${content.hook}</p>
            </div>
            <div class="panel-section">
                <h4>Quick Fix</h4>
                <p>${content.fix}</p>
            </div>
            <div class="panel-section">
                <button id="read-full-truth-btn" class="btn-unlock">
                    <span>Read the full truth</span>
                </button>
                <div id="deep-dive-content" class="deep-dive-content" style="display:none;">
                    ${content.deepDive}
                </div>
            </div>
            <div style="margin-top: 2rem;">
                ${isCompleted 
                    ? `<button class="btn-fix" style="background:#10B981; cursor:default;">✓ Fix Completed</button>`
                    : `<button id="mark-fixed-btn" class="btn-fix">Mark completed fixes</button>`
                }
            </div>

            <!-- AI Chat Interface -->
            <div class="lab-chat-section">
                <button id="toggle-chat-btn" class="btn-chat-toggle">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Have a question? Ask the Lab AI
                </button>
                
                <div id="lab-chat-interface" class="chat-interface" style="display: none;">
                    <div id="chat-history" class="chat-history">
                        <div class="chat-message ai">
                            <div class="chat-bubble">
                                I've analyzed <strong>"${title}"</strong>. What specific question do you have about applying this to your business?
                            </div>
                        </div>
                    </div>
                    <div class="chat-input-area">
                        <input type="text" id="chat-input" placeholder="Ask a question..." autocomplete="off">
                        <button id="send-chat-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Unlock Handler
        const unlockBtn = document.getElementById('read-full-truth-btn');
        const deepDiveContent = document.getElementById('deep-dive-content');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                unlockBtn.style.display = 'none';
                deepDiveContent.style.display = 'block';
            });
        }

        // Chat Handlers
        const toggleChatBtn = document.getElementById('toggle-chat-btn');
        const chatInterface = document.getElementById('lab-chat-interface');
        const chatInput = document.getElementById('chat-input');
        const sendChatBtn = document.getElementById('send-chat-btn');
        const chatHistory = document.getElementById('chat-history');

        toggleChatBtn.addEventListener('click', () => {
            const isHidden = chatInterface.style.display === 'none';
            chatInterface.style.display = isHidden ? 'block' : 'none';
            if (isHidden) {
                setTimeout(() => chatInput.focus(), 100);
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }
        });

        const handleSendMessage = async () => {
            const question = chatInput.value.trim();
            if (!question) return;

            // Add User Message
            chatHistory.innerHTML += `<div class="chat-message user"><div class="chat-bubble">${question}</div></div>`;
            chatInput.value = '';
            chatHistory.scrollTop = chatHistory.scrollHeight;

            // Add Loading Indicator
            const loadingId = 'loading-' + Date.now();
            chatHistory.innerHTML += `<div class="chat-message ai" id="${loadingId}"><div class="chat-bubble typing">...</div></div>`;
            chatHistory.scrollTop = chatHistory.scrollHeight;

            // Call OpenAI
            const answer = await ChatSystem.askResearcher(question, content);
            
            // Remove Loading and Add AI Response
            document.getElementById(loadingId).remove();
            chatHistory.innerHTML += `<div class="chat-message ai"><div class="chat-bubble">${answer.replace(/\n/g, '<br>')}</div></div>`;
            messageSound.play().catch(() => {});
            chatHistory.scrollTop = chatHistory.scrollHeight;
        };

        sendChatBtn.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendMessage();
        });

        if (!isCompleted) {
            document.getElementById('mark-fixed-btn').addEventListener('click', () => {
                updateCallback(index);
                closePanel();
            });
        }
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
    const initLab = async (emailOverride = null, projectNameOverride = null) => {
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
                
                projectNameEl.innerText = projectNameOverride || project_name || "Untitled Project";
                rankEl.innerText = getRank(master_score);
                
                // Load Full Context
                await ChatSystem.loadContext(email);
                setProgress(master_score);
                renderGrid(truths, updateTruth);
                
                // Initialize Chat Welcome Message
                addChatMessage('ai', `Hello ${ChatSystem.context.name}! I'm your Lab Consultant. How is the <strong>${ChatSystem.context.businessType}</strong> scaling today?`);
            } else {
                projectNameEl.innerText = "Project Not Found";
            }

        } catch (error) {
            console.error("Lab Error:", error);
            projectNameEl.innerText = "Connection Error";
        }
    };

    // --- Global Chat UI Logic ---
    const chatMessagesEl = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('send-chat-btn');
    
    // Mobile Toggle Logic
    const mobileTrigger = document.getElementById('mobile-chat-trigger');
    const consultantWrapper = document.getElementById('consultant-wrapper');
    const closeChatMobile = document.getElementById('close-chat-mobile');

    if (mobileTrigger) {
        mobileTrigger.addEventListener('click', () => {
            consultantWrapper.classList.add('active');
            chatInput.focus();
        });
        closeChatMobile.addEventListener('click', () => {
            consultantWrapper.classList.remove('active');
        });
    }

    const addChatMessage = (sender, text) => {
        if (!chatMessagesEl) return;
        
        const div = document.createElement('div');
        div.className = sender === 'user' ? 'user-msg' : 'ai-msg';
        div.innerHTML = text.replace(/\n/g, '<br>');
        chatMessagesEl.appendChild(div);
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    };

    const handleGlobalChatSubmit = async (inputEl) => {
        const text = inputEl.value.trim();
        if (!text) return;

        // Clear inputs
        inputEl.value = '';

        // Add User Message
        addChatMessage('user', text);

        // Loading State
        const loadingId = 'global-loading-' + Date.now();
        const loadingHtml = `<div class="ai-msg" id="${loadingId}">...</div>`;
        chatMessagesEl.insertAdjacentHTML('beforeend', loadingHtml);

        // AI Call
        const response = await ChatSystem.askConsultant(text);
        
        // Remove Loading
        document.querySelectorAll(`#${loadingId}`).forEach(el => el.remove());

        // Add AI Message
        addChatMessage('ai', response.replace(/\n/g, '<br>'));
        messageSound.play().catch(() => {});
    };

    if (chatSendBtn) chatSendBtn.addEventListener('click', () => handleGlobalChatSubmit(chatInput));
    
    // Enter key support
    const handleEnter = (e, input) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGlobalChatSubmit(input); } };
    if (chatInput) chatInput.addEventListener('keypress', (e) => handleEnter(e, chatInput));

    // Handle Onboarding Form Submit
    onboardingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('lab-email');
        const projectInput = document.getElementById('lab-project');
        const submitBtn = onboardingForm.querySelector('button[type="submit"]');
        const errorMsg = document.getElementById('onboarding-error');

        const email = emailInput.value.trim();
        const project = projectInput.value.trim();
        
        // UI Loading State
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Verifying Access...';
        submitBtn.disabled = true;
        if (errorMsg) errorMsg.style.display = 'none';

        try {
            // Check email against database
            const response = await fetch(`${SCRIPT_URL}?action=checkEmail&email=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (data.found) {
                // Auth Success
                onboardingModal.classList.remove('active');
                await initLab(email, project);
            } else {
                // Auth Failed
                if (errorMsg) {
                    errorMsg.innerHTML = `Email not found. <a href="product-test.html" style="text-decoration: underline; font-weight: 700; color: #ef4444;">Take the Test</a> or try again.`;
                    errorMsg.style.display = 'block';
                }
            }
        } catch (error) {
            console.error("Auth Error:", error);
            if (errorMsg) {
                errorMsg.innerText = "Connection error. Please try again.";
                errorMsg.style.display = 'block';
            }
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    initLab();
});