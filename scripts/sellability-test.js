document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the sellability test page
    if (!document.getElementById('entry-screen')) {
        return;
    }

    // --- DOM Elements ---
    const screens = {
        entry: document.getElementById('entry-screen'),
        quiz: document.getElementById('quiz-screen'),
        results: document.getElementById('results-screen'),
        loading: document.getElementById('loading-screen'),
    };
    const emailCheckForm = document.getElementById('email-check-form');
    const testEmailInput = document.getElementById('test-email');
    const emailErrorMsg = document.getElementById('email-error-msg');
    const progressBar = document.getElementById('progress-bar');
    const currentQNumber = document.getElementById('current-q-number');
    const questionText = document.getElementById('question-text');
    const questionProTip = document.getElementById('question-pro-tip');
    const optionsContainer = document.getElementById('options-container');
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    const scoreGaugeFill = document.querySelector('.gauge-fill');
    const scoreText = document.getElementById('score-text');
    const statusText = document.getElementById('status-text');
    const meaningText = document.getElementById('meaning-text');
    const ctaButton = document.getElementById('cta-button');
    const loadingText = document.getElementById('loading-text');
    const quizFace = document.getElementById('quiz-face');
    const resultsFace = document.getElementById('results-face');
    const persuasionContent = document.getElementById('results-persuasion-content');

    // --- App State ---
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9YlOv53uK1Ij1KQUfy4ZsSXIkMuf1UqYLOC9PuHQDUdkbKES97urTZTs99MSLki_A/exec';
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let userFirstName = '';
    let userProductName = '';
    let typeWriterTimeout;
    const clickSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'); // Subtle click sound
    const happyClickSound = new Audio('happy.mp3'); // Happy/Exciting sound
    
    const emergencySound = new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'); // Low/Fail sound
    const vulnerableSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'); // Neutral/Okay sound
    const eliteSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'); // Success/Win sound

    const questions = [
        { question: "Is the customer problem you're trying to solve a 'Top 3' problem?", proTip: "Is your customer so stressed by this problem that they would pay some money to fix it today?" },
        { question: "Can a 10-year-old understand you?", proTip: "If you explain your business idea or model to a 10-year-old child, can they explain it back to you correctly without being confused?" },
        { question: "Do you know who NOT to sell to?", proTip: "Can you list 3 types of people you will refuse to offer your products to so you can stay focused on your real customers?" },
        { question: "Is that product, solution, or business something you can launch in 30 days?", proTip: "Is it possible to start selling a simple version of that product or service that solves just ONE main problem, in less than a month, and still make sales?" },
        { question: "Have you talked to 10 total strangers about your business or product idea?", proTip: "Do you have a list of 10 people who don’t know you but will give you honest, brutal feedback on what they don't like about your product/service?" },
        { question: "Is your product up to 50% better than what they already use?", proTip: "Is your solution much better than what they  use right now, or are you just 'slightly cheaper' than the others?" },
        { question: "Has anyone paid you for your product before launch?", proTip: "Have you asked a customer to pay (or sign a letter of near-future payment) before the product is even ready?" },
        { question: "Do you know where your customers 'live'?", proTip: "Can you name the exact physical or online location where you will find your first 50 paying customers?" },
        { question: "Do you know your product's 'Death Date'?", proTip: "If you make $0 after sales, do you know exactly what date your business runs out of cash and dies?" },
        { question: "Are your agreements 'legalised'?", proTip: "If you have a partner or collaborate with someone or another business, do you have a signed document that says who does what and what happens if someone does quits, dies, commits crimes, or works with a competitor?" },
        { question: "Are you ready to fire your family member or friend?", proTip: "Are you willing to fire a friend or family member if they are working poorly or hurting the business?" },
        { question: "Do you spend 50% (or more) of your time 'selling'?", proTip: "Do you spend at least half of your day in your business focusing solely on sales and marketing, or are you just 'fixing the logo', designing this and that, or sitting idle waiting for customers to find you?" },
    ];

    const options = [
        { text: "NO", score: 1 },
        { text: "Not sure", score: 2 },
        { text: "I think so", score: 3 },
        { text: "100% Yes!", score: 5 },
    ];

    // --- Faces SVG Data ---
    const faces = {
        neutral: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <circle cx="35" cy="40" r="5" fill="#1D1D1F"/>
            <circle cx="65" cy="40" r="5" fill="#1D1D1F"/>
            <path d="M30 65 Q50 75 70 65" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        happy: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <path d="M30 40 Q35 35 40 40" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
            <path d="M60 40 Q65 35 70 40" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
            <path d="M30 60 Q50 80 70 60" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        shocked: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <circle cx="35" cy="40" r="5" fill="#1D1D1F"/>
            <circle cx="65" cy="40" r="5" fill="#1D1D1F"/>
            <ellipse cx="50" cy="65" rx="10" ry="15" fill="#1D1D1F"/>
        `,
        // 12 Unique Expressions for Questions
        q0: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <circle cx="35" cy="40" r="5" fill="#1D1D1F"/><circle cx="65" cy="40" r="5" fill="#1D1D1F"/>
            <path d="M35 65 Q50 70 65 65" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        q1: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <circle cx="40" cy="38" r="5" fill="#1D1D1F"/><circle cx="70" cy="38" r="5" fill="#1D1D1F"/>
            <path d="M40 65 L60 65" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        q2: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <circle cx="35" cy="40" r="5" fill="#1D1D1F"/><circle cx="65" cy="40" r="5" fill="#1D1D1F"/>
            <path d="M30 25 Q40 20 50 25" fill="none" stroke="#1D1D1F" stroke-width="2" stroke-linecap="round"/>
            <path d="M35 65 Q50 60 65 65" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        q3: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <circle cx="35" cy="42" r="4" fill="#1D1D1F"/><circle cx="65" cy="38" r="6" fill="#1D1D1F"/>
            <path d="M35 65 Q50 75 65 65" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        q4: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <circle cx="30" cy="40" r="5" fill="#1D1D1F"/><circle cx="60" cy="40" r="5" fill="#1D1D1F"/>
            <path d="M35 65 Q45 60 55 65 Q65 70 75 65" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        q5: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <circle cx="35" cy="40" r="6" fill="#1D1D1F"/><circle cx="65" cy="40" r="6" fill="#1D1D1F"/>
            <circle cx="50" cy="65" r="8" fill="#1D1D1F"/>
        `,
        q6: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <circle cx="35" cy="35" r="5" fill="#1D1D1F"/><circle cx="65" cy="35" r="5" fill="#1D1D1F"/>
            <path d="M40 60 Q50 55 60 60" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        q7: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <path d="M30 40 L40 40" stroke="#1D1D1F" stroke-width="3"/><circle cx="65" cy="40" r="5" fill="#1D1D1F"/>
            <path d="M35 65 L65 65" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        q8: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <circle cx="35" cy="40" r="7" fill="#1D1D1F"/><circle cx="65" cy="40" r="7" fill="#1D1D1F"/>
            <path d="M45 65 L55 65" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        q9: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <path d="M30 38 Q35 45 40 38" fill="none" stroke="#1D1D1F" stroke-width="2"/><path d="M60 38 Q65 45 70 38" fill="none" stroke="#1D1D1F" stroke-width="2"/>
            <path d="M35 65 Q50 60 65 65" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        q10: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <path d="M30 35 L45 40" stroke="#1D1D1F" stroke-width="2"/><path d="M70 35 L55 40" stroke="#1D1D1F" stroke-width="2"/>
            <circle cx="35" cy="45" r="4" fill="#1D1D1F"/><circle cx="65" cy="45" r="4" fill="#1D1D1F"/>
            <path d="M45 65 L55 65" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
        `,
        q11: `
            <circle cx="50" cy="50" r="45" fill="#FFD600" stroke="#E6C200" stroke-width="2"/>
            <circle cx="35" cy="40" r="5" fill="#1D1D1F"/><circle cx="65" cy="40" r="5" fill="#1D1D1F"/>
            <path d="M30 60 Q50 80 70 60" fill="none" stroke="#1D1D1F" stroke-width="3" stroke-linecap="round"/>
            <path d="M25 50 Q30 45 35 50" fill="none" stroke="#1D1D1F" stroke-width="2" stroke-linecap="round"/>
            <path d="M65 50 Q70 45 75 50" fill="none" stroke="#1D1D1F" stroke-width="2" stroke-linecap="round"/>
        `
    };

    // --- Functions ---
    const switchScreen = (screenName) => {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
    };

    const checkEmail = async (email) => {
        const btn = emailCheckForm.querySelector('button');
        btn.disabled = true;
        btn.innerText = 'Checking...';
        emailErrorMsg.innerText = '';

        try {
            const response = await fetch(`${SCRIPT_URL}?action=checkEmail&email=${encodeURIComponent(email)}`);
            const result = await response.json();

            if (result.found) {
                initQuiz(result.firstName);
            } else {
                emailErrorMsg.innerHTML = "Email not registered. Please register on <a href='product-test.html' style='text-decoration: underline;'>this page</a> first.";
            }
        } catch (error) {
            emailErrorMsg.innerText = "An error occurred. Please try again.";
            console.error("Email check failed:", error);
        } finally {
            btn.disabled = false;
            btn.innerText = 'Start Test';
        }
    };

    const initQuiz = (firstName) => {
        userFirstName = firstName || ''; // Prevent 'undefined' if name is missing
        // Display the intro message before starting the quiz
        displayIntro(userFirstName);
    };

    const displayIntro = (firstName) => {
        const introScreen = document.createElement('div');
        introScreen.id = 'intro-screen'; // This is the new screen
        introScreen.className = 'test-screen'; // It's a screen

        const greeting = firstName ? `Dear ${firstName},` : 'Hello,';

        introScreen.innerHTML = `
            <div class="container intro-container">
                <div class="intro-card">
                    <div class="intro-header">
                        <h2>${greeting}</h2>
                        <p>As you answer the following questions, please keep your business or product in mind.</p>
                    </div>
                    <div class="form-group">
                        <label for="product-name">What is the name of the product or service we are testing today?</label>
                        <input type="text" id="product-name" name="product-name" placeholder="e.g., 'Premium Scented Candles' or 'Yourhelpa App'" autocomplete="off">
                        <p class="helper-text">This helps us tailor the results to your specific solution.</p>
                    </div>
                    <div id="product-description-section" class="form-group" style="display:none;">
                        <label for="product-description">Briefly explain what it does or aims to solve:</label>
                        <textarea id="product-description" name="product-description" placeholder="e.g., 'A mobile app that connects language learners with native speakers.'"></textarea>
                    </div>
                    <button id="start-quiz-btn" class="btn-game-start">Start Diagnostic</button>
                </div>
            </div>
        `;
        // Add the new screen to the DOM, right after the entry screen
        screens.entry.after(introScreen);
        
        // Add it to our screen manager
        screens.intro = introScreen;

        // Switch to the new intro screen
        switchScreen('intro');

        const productNameInput = introScreen.querySelector('#product-name');
        const productDescSection = introScreen.querySelector('#product-description-section');
        productNameInput.addEventListener('input', () => {
            if (productNameInput.value.trim() !== '') {
                productDescSection.style.display = 'block';
            } else {
                productDescSection.style.display = 'none';
            }
        });

        introScreen.querySelector('#start-quiz-btn').addEventListener('click', () => {
            userProductName = productNameInput.value.trim() || "Your Project";
            const auditingTag = document.createElement('div');
            auditingTag.id = 'auditing-tag';
            auditingTag.innerText = `AUDITING: ${userProductName}`;
            document.getElementById('quiz-screen').prepend(auditingTag);
            startQuiz(userProductName); // Start the actual quiz
        });
    };

    const startQuiz = (productName) => {
        switchScreen('quiz');
        userAnswers = new Array(questions.length).fill(null);
        currentQuestionIndex = 0;
        displayQuestion(currentQuestionIndex, productName);
    };

    const typeWriter = (text, element, speed = 20) => {
        if (typeWriterTimeout) clearTimeout(typeWriterTimeout);
        element.innerHTML = '';
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                typeWriterTimeout = setTimeout(type, speed);
            }
        }
        type();
    };

    const displayQuestion = (index, productName) => {
        const question = questions[index];
        const questionContainer = document.getElementById('question-container');

        questionContainer.classList.remove('slide-in');
        questionContainer.classList.add('slide-out');

        setTimeout(() => {
            currentQNumber.innerText = index + 1;
            
            // Update Face
            quizFace.innerHTML = faces[`q${index}`];
            quizFace.classList.remove('face-bounce');
            void quizFace.offsetWidth; // Trigger reflow
            quizFace.classList.add('face-bounce');

            let questionTextToDisplay = question.question;
            if (productName) {
                questionTextToDisplay = questionTextToDisplay.replace(/your product/gi, `<strong>${productName}</strong>`);
                questionTextToDisplay = questionTextToDisplay.replace(/the product/gi, `<strong>${productName}</strong>`);
            }
            typeWriter(questionTextToDisplay, questionText);
            questionProTip.innerText = question.proTip;

            optionsContainer.innerHTML = '';
            options.forEach(opt => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.innerText = opt.text;
                button.dataset.score = opt.score;
                button.onclick = () => {
                    if (opt.score === 4) { // 100% Yes!
                        happyClickSound.currentTime = 0;
                        happyClickSound.play().catch(e => console.log("Audio play failed:", e));
                    } else {
                        clickSound.currentTime = 0;
                        clickSound.play().catch(e => console.log("Audio play failed:", e));
                    }
                    selectOption(button, opt.score);
                };
                
                // Visual Focus: Dim others on hover
                button.onmouseenter = () => optionsContainer.classList.add('options-dimmed');
                button.onmouseleave = () => optionsContainer.classList.remove('options-dimmed');

                optionsContainer.appendChild(button);
            });

            updateUIForCurrentState();
            
            questionContainer.classList.remove('slide-out');
            questionContainer.classList.add('slide-in');
        }, 300);
    };

    const selectOption = (selectedButton, score) => {
        document.querySelectorAll('.option-btn.selected').forEach(btn => btn.classList.remove('selected'));
        selectedButton.classList.add('selected');
        userAnswers[currentQuestionIndex] = score;
        nextBtn.disabled = false;
    };

    const updateUIForCurrentState = () => {
        const progress = ((currentQuestionIndex) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;

        backBtn.style.visibility = currentQuestionIndex > 0 ? 'visible' : 'hidden';
        nextBtn.disabled = userAnswers[currentQuestionIndex] === null;

        if (userAnswers[currentQuestionIndex] !== null) {
            const selectedScore = userAnswers[currentQuestionIndex];
            const btnToSelect = optionsContainer.querySelector(`[data-score="${selectedScore}"]`);
            if (btnToSelect) {
                btnToSelect.classList.add('selected');
            }
        }
    };
    
    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            // Snap Animation
            const container = document.getElementById('question-container');
            container.classList.add('card-snap');
            
            setTimeout(() => {
                container.classList.remove('card-snap');
                currentQuestionIndex++;
                displayQuestion(currentQuestionIndex, userProductName);
            }, 200);
        } else {
            runLoadingSequence();
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex, userProductName);
        }
    };

    const runLoadingSequence = () => {
        switchScreen('loading');
        const messages = [
            "Analyzing Market Data...",
            "Calculating Burn Rate...",
            "Checking Competitor Density...",
            "Finalizing Audit..."
        ];
        
        let step = 0;
        const interval = setInterval(() => {
            if (step < messages.length) {
                loadingText.innerText = messages[step];
                step++;
            } else {
                clearInterval(interval);
                showResults();
            }
        }, 800);
    };

    const showResults = () => {
        const totalScore = userAnswers.reduce((sum, score) => sum + (score || 0), 0);
        const maxScore = questions.length * 5; // Max score is now 60
        const scorePercentage = (totalScore / maxScore);
        const gaugeRotation = scorePercentage * 0.5; // 0.5 turn for 180 degrees
        
        switchScreen('results');

        // --- Clear previous results content ---
        persuasionContent.innerHTML = '';
        const oldHeader = document.getElementById('results-audit-header');
        if (oldHeader) oldHeader.remove();
        const oldHook = document.querySelector('.cta-hook');
        if (oldHook) oldHook.remove();

        // --- Add new dynamic header ---
        const auditHeader = document.createElement('div');
        auditHeader.id = 'results-audit-header';
        auditHeader.innerHTML = `
            <p class="audit-complete-tag">AUDIT COMPLETE FOR: ${userProductName}</p>
            <h3>Your Sellability Score: ${totalScore}/${maxScore}</h3>
        `;
        const scoreGaugeContainer = document.getElementById('score-gauge-container');
        if (scoreGaugeContainer) {
            scoreGaugeContainer.before(auditHeader);
        }

        // Delay gauge animation to ensure it's visible
        setTimeout(() => {
            scoreGaugeFill.style.setProperty('--rotation', `${gaugeRotation}turn`);
            scoreGaugeFill.style.transform = `rotate(var(--rotation))`;
        }, 100);

        scoreText.innerText = totalScore;

        let status, meaning, face, sound, gaugeClass;
        
        const nameAddress = userFirstName ? userFirstName : 'there';

        if (totalScore <= 29) {
            status = "⚠️ Hobby, Not Business";
            meaning = `<p>Hi ${nameAddress}, the data shows that <strong>${userProductName}</strong> is currently a high-risk project. Right now, it’s acting more like an expensive hobby than a profitable business. There are major 'Blind Spots' in your plan that will cost you a lot of money if you launch today.</p><p><strong>The Solution:</strong> You don't need a better logo; you need a better foundation. You must stop building and fix these structural failures before you spend another dollar.</p>`;
            face = faces.shocked;
            sound = emergencySound;
            gaugeClass = 'danger';
            statusText.className = 'emergency';
        } else if (totalScore <= 49) {
            status = "🏗️ Solid Start, High Risk";
            meaning = `<p>Good work, ${nameAddress}. <strong>${userProductName}</strong> has a real spark, but you are currently 'guessing' on the big things—like how to find customers or manage your cash. You are one bad month away from a collapse because you don't have a system yet.</p><p><strong>The Next Move:</strong> You’ve come too far to let a blind spot take it all away. It’s time to move from 'Founder with an idea' to 'CEO with a company' by removing the guesses.</p>`;
            face = faces.neutral;
            sound = vulnerableSound;
            gaugeClass = 'warning';
            statusText.className = 'vulnerable';
        } else {
            status = "🏆 Market Ready / Top 1%";
            meaning = `<p>Impressive, ${nameAddress}. <strong>${userProductName}</strong> is in the top 1% of audited ideas. You have the discipline and the proof. However, at this level, mistakes are much more expensive. A small 5% error won't cost you hundreds; it could cost you thousands.</p><p><strong>The Advice:</strong> Don't get comfortable. You need an 'Unfair Advantage' to protect your lead and scale without losing your mind or your money.</p>`;
            face = faces.happy;
            sound = eliteSound;
            gaugeClass = 'elite';
            statusText.className = 'elite';
        }

        statusText.innerHTML = status;
        meaningText.innerHTML = meaning;
        resultsFace.innerHTML = face;
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play failed:", e));

        scoreGaugeFill.className = 'gauge-fill'; // Reset classes
        scoreGaugeFill.classList.add(gaugeClass);

        // --- Add CTA Hook & Update Button ---
        const ctaHook = document.createElement('p');
        ctaHook.className = 'cta-hook';
        ctaHook.innerHTML = `I’ve identified the exact 'Brutal Truths' that kill projects like <strong>${userProductName}</strong>. Don't wait to find them out the hard way.`;
        ctaButton.before(ctaHook);

        ctaButton.innerHTML = `&gt; [ Fix My Blind Spots &amp; Get the 33 Truths ($6.99) ]`;
    };

    // --- Event Listeners ---
    emailCheckForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = testEmailInput.value.trim();
        if (email) {
            checkEmail(email);
        }
    });

    // Auto-start if email is passed in URL
    const urlParams = new URLSearchParams(window.location.search);
    const autoEmail = urlParams.get('email');
    if (autoEmail) {
        testEmailInput.value = autoEmail;
        checkEmail(autoEmail);
    }

    nextBtn.addEventListener('click', handleNext);
    backBtn.addEventListener('click', handleBack);
});

// Add CSS for the auditing tag
const style = document.createElement('style');
style.innerHTML = `
#auditing-tag {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: rgba(0, 123, 255, 0.2); /* Semi-transparent blue */
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.8em;
    z-index: 1000; /* Ensure it's on top of everything */
}

/* New Results Screen Styles */
#results-audit-header {
    text-align: center;
    margin-bottom: 1rem;
}
.audit-complete-tag {
    font-weight: 700;
    color: var(--brand-blue);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}
#results-audit-header h3 {
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    margin-bottom: 0;
    color: var(--text-primary);
}
.cta-hook {
    max-width: 550px;
    margin: 2rem auto 1rem;
    font-style: italic;
    color: var(--text-secondary);
    text-align: center;
}

/* Gauge Animations & Colors */
.gauge-fill { --rotation: rotate(0turn); } /* CSS variable for rotation */
.gauge-fill.danger {
    background: #f5222d;
    animation: shake 0.8s ease-in-out infinite;
    transform: var(--rotation);
}
.gauge-fill.warning {
    background: #fa8c16;
    animation: pulse 2s ease-in-out infinite;
}
.gauge-fill.elite {
    background: var(--brand-blue);
    box-shadow: 0 0 15px var(--brand-blue), 0 0 30px var(--brand-blue);
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0) var(--rotation); }
  20%, 80% { transform: translate3d(2px, 0, 0) var(--rotation); }
  30%, 50%, 70% { transform: translate3d(-3px, 0, 0) var(--rotation); }
  40%, 60% { transform: translate3d(3px, 0, 0) var(--rotation); }
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(250, 140, 22, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(250, 140, 22, 0); }
  100% { box-shadow: 0 0 0 0 rgba(250, 140, 22, 0); }
}
`;
document.head.appendChild(style);