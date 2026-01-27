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
        { question: "Can you launch the product or business in 30 days?", proTip: "Is it possible to start selling a simple version of that product or service that solves just ONE main problem, in less than a month?" },
        { question: "Have you talked to 10 total strangers about your product?", proTip: "Do you have a list of 10 people who don’t know you but will give you honest, brutal feedback on what they don't like about your product/service?" },
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
        { text: "100% Yes!", score: 4 },
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
                switchScreen('quiz');
                initQuiz();
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

    const initQuiz = () => {
        userAnswers = new Array(questions.length).fill(null);
        currentQuestionIndex = 0;
        displayQuestion(currentQuestionIndex);
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

    const displayQuestion = (index) => {
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

            typeWriter(question.question, questionText);
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
                displayQuestion(currentQuestionIndex);
            }, 200);
        } else {
            runLoadingSequence();
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
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
        
        const maxScore = questions.length * 4;
        const scorePercentage = (totalScore / maxScore);
        const gaugeRotation = scorePercentage * 0.5; // 0.5 turn for 180 degrees
        
        switchScreen('results');

        // Delay gauge animation to ensure it's visible
        setTimeout(() => {
            scoreGaugeFill.style.transform = `rotate(${gaugeRotation}turn)`;
        }, 100);

        scoreText.innerText = totalScore;

        let persuasionHTML = '';

        if (totalScore <= 24) {
            statusText.innerText = "STATUS: THE EMERGENCY ZONE 📉";
            statusText.className = 'emergency';
            meaningText.innerText = "You have a hobby, not a business. You are losing money. Stop building and fix your foundation now.";
            resultsFace.innerHTML = faces.shocked;
            emergencySound.currentTime = 0;
            emergencySound.play().catch(e => console.log("Audio play failed:", e));
            ctaButton.innerText = "My Product is At Risk—Send me the 33 Brutal Truths to fix it ($6.99)";
            persuasionHTML = `
                <div class="persuasion-section">
                    <h4>The Pain of Losing Everything</h4>
                    <p>You are in a dangerous place. It feels bad to work hard and see no money. If you do not fix this now, your business will die, and your money will be gone forever.</p>
                </div>
                <div class="persuasion-section">
                    <h4>Why You Are Failing</h4>
                    <p>You are trying to build a big house on soft mud. It will fall down. Your score shows that your idea has big holes in it. You cannot succeed like this.</p>
                </div>
                <div class="persuasion-section">
                    <h4>How to Fix It Fast</h4>
                    <p>The '33 Brutal Truths' book is your repair kit. It is a simple list of things to fix. It tells you exactly what to do to stop losing money and start making money.</p>
                </div>
                <div class="persuasion-section">
                    <h4>Change Your Future</h4>
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th>Without The Book (Before)</th>
                                <th>With The Book (After)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>❌ Confused and scared</td>
                                <td>✅ Happy and sure</td>
                            </tr>
                            <tr>
                                <td>❌ Losing money every day</td>
                                <td>✅ Keeping your money</td>
                            </tr>
                            <tr>
                                <td>❌ Business will fail</td>
                                <td>✅ Business will grow</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="fomo-section">
                    <p>Do not wait. Every day you wait is a day you lose more money. Smart people are already using this book to win. Do not be the one who fails.</p>
                </div>
            `;
        } else if (totalScore <= 39) {
            statusText.innerText = "STATUS: THE VULNERABLE ZONE ⚠️";
            statusText.className = 'vulnerable';
            meaningText.innerText = "You have a good start, but you are guessing too much. You are one bad month away from failing.";
            resultsFace.innerHTML = faces.neutral;
            vulnerableSound.currentTime = 0;
            vulnerableSound.play().catch(e => console.log("Audio play failed:", e));
            ctaButton.innerText = "Strengthen My Foundation with the 33 Brutal Truths ($6.99)";
            persuasionHTML = `
                <div class="persuasion-section">
                    <h4>The Pain of Not Knowing</h4>
                    <p>You are doing okay, but you are not safe. You are guessing too much. One bad day or one smart competitor can take everything away from you.</p>
                </div>
                <div class="persuasion-section">
                    <h4>Why You Are Not Safe</h4>
                    <p>Your business is like a chair with one broken leg. It stands up now, but if you sit on it wrong, it breaks. You need to fix that leg before you fall.</p>
                </div>
                <div class="persuasion-section">
                    <h4>Make Your Business Strong</h4>
                    <p>This book shows you how to make your business strong like a rock. It stops you from guessing. It gives you the answers so you can sleep well at night.</p>
                </div>
                <div class="persuasion-section">
                    <h4>See The Difference</h4>
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th>Without The Book (Before)</th>
                                <th>With The Book (After)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>❌ Guessing and hoping</td>
                                <td>✅ Knowing for sure</td>
                            </tr>
                            <tr>
                                <td>❌ Easy to beat</td>
                                <td>✅ Hard to beat</td>
                            </tr>
                            <tr>
                                <td>❌ Slow money</td>
                                <td>✅ Fast money</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="fomo-section">
                    <p>Your competitors are watching you. If they learn these secrets before you, they will steal your customers. Get the book now and stay safe.</p>
                </div>
            `;
        } else {
            statusText.innerText = "STATUS: THE ELITE ZONE 🏆";
            statusText.className = 'elite';
            meaningText.innerText = "You are a real builder. You have a plan. Now you need the 'Unfair Advantage' to stay ahead of your competitors.";
            resultsFace.innerHTML = faces.happy;
            eliteSound.currentTime = 0;
            eliteSound.play().catch(e => console.log("Audio play failed:", e));
            ctaButton.innerText = "Get the 'Unfair Advantage' with the 33 Brutal Truths ($6.99)";
            persuasionHTML = `
                <div class="persuasion-section">
                    <h4>The Pain of Being Copied</h4>
                    <p>You are doing great. But when you are at the top, everyone wants to pull you down. People will try to copy your idea and steal your money.</p>
                </div>
                <div class="persuasion-section">
                    <h4>Why You Must Be Careful</h4>
                    <p>Winning once is easy. Winning forever is hard. If you stop learning now, someone hungrier and smarter will come and take your place.</p>
                </div>
                <div class="persuasion-section">
                    <h4>Stay The King</h4>
                    <p>This book teaches you how to build a wall around your business. It shows you how to keep your customers forever so nobody can steal them.</p>
                </div>
                <div class="persuasion-section">
                    <h4>Stay At The Top</h4>
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th>Without The Book (Before)</th>
                                <th>With The Book (After)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>❌ Winner today, loser tomorrow</td>
                                <td>✅ Winner forever</td>
                            </tr>
                            <tr>
                                <td>❌ People copy you</td>
                                <td>✅ People cannot touch you</td>
                            </tr>
                            <tr>
                                <td>❌ Good business</td>
                                <td>✅ Unbeatable business</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="fomo-section">
                    <p>The other winners are reading this book to beat you. Do not let them get ahead. Read it now to keep your crown.</p>
                </div>
            `;
        }
        persuasionContent.innerHTML = persuasionHTML;
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