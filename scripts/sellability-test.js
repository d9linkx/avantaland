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

    // --- App State ---
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwxzZ3rj0gBgAJJ3KDdLKLVhc2-rs4-aIfxn42-IqdzfMo8yMgMAdwtN2t2r1wuK7RF/exec';
    let currentQuestionIndex = 0;
    let userAnswers = [];

    const questions = [
        { question: "Is this a 'Top 3' problem?", proTip: "Is your customer so stressed by this problem that they would pay money to fix it today?" },
        { question: "Can a 10-year-old understand you?", proTip: "If you explain your business to a child, can they explain it back to you correctly without being confused?" },
        { question: "Do you know who NOT to sell to?", proTip: "Can you list 3 types of people you will refuse to help so you can stay focused on the right customers?" },
        { question: "Can you launch in 30 days?", proTip: "Can you start selling a simple version that solves just one main problem in less than a month?" },
        { question: "Have you talked to 10 'mean' strangers?", proTip: "Do you have a list of 10 people who don’t know you and will give you honest, brutal feedback?" },
        { question: "Are you 10x better than the old way?", proTip: "Is your solution much better than what they do now, or are you just 'slightly cheaper'?" },
        { question: "Have you asked for money yet?", proTip: "Have you asked a customer to pay (or sign a letter) before the product is even finished?" },
        { question: "Do you know where your customers 'hide'?", proTip: "Can you name the exact physical or digital place where you will find your first 50 paying customers?" },
        { question: "Do you know your 'Death Date'?", proTip: "If you make $0 starting today, do you know exactly what date your business runs out of cash and dies?" },
        { question: "Is your partnership 'legal'?", proTip: "If you have a partner, do you have a signed paper that says who does what and what happens if someone quits?" },
        { question: "Are you ready to fire a friend?", proTip: "Are you willing to fire a friend or family member if they are working poorly and hurting the company?" },
        { question: "Are you spending 50% of your time selling?", proTip: "Do you spend at least half of your day on marketing and sales, or are you just 'fixing the logo'?" },
    ];

    const options = [
        { text: "No", score: 1 },
        { text: "Maybe", score: 2 },
        { text: "I think so", score: 3 },
        { text: "Yes", score: 4 },
        { text: "100% Yes!", score: 5 },
    ];

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
                emailErrorMsg.innerText = "Email not found. Please register on the previous page first.";
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

    const displayQuestion = (index) => {
        const question = questions[index];
        const questionContainer = document.getElementById('question-container');

        questionContainer.classList.remove('slide-in');
        questionContainer.classList.add('slide-out');

        setTimeout(() => {
            currentQNumber.innerText = index + 1;
            questionText.innerText = question.question;
            questionProTip.innerText = question.proTip;

            optionsContainer.innerHTML = '';
            options.forEach(opt => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.innerText = opt.text;
                button.dataset.score = opt.score;
                button.onclick = () => selectOption(button, opt.score);
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
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        } else {
            showResults();
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
        }
    };

    const showResults = () => {
        const totalScore = userAnswers.reduce((sum, score) => sum + (score || 0), 0);
        
        const maxScore = questions.length * 5;
        const scorePercentage = (totalScore / maxScore);
        const gaugeRotation = scorePercentage * 0.5; // 0.5 turn for 180 degrees
        
        switchScreen('results');

        // Delay gauge animation to ensure it's visible
        setTimeout(() => {
            scoreGaugeFill.style.transform = `rotate(${gaugeRotation}turn)`;
        }, 100);

        scoreText.innerText = totalScore;

        if (totalScore <= 29) {
            statusText.innerText = "STATUS: THE EMERGENCY ZONE 📉";
            statusText.className = 'emergency';
            meaningText.innerText = "You have a hobby, not a business. You are losing money. Stop building and fix your foundation now.";
            ctaButton.innerText = "My Product is At Risk—Send me the 33 Brutal Truths to fix it ($6.99)";
        } else if (totalScore <= 49) {
            statusText.innerText = "STATUS: THE VULNERABLE ZONE ⚠️";
            statusText.className = 'vulnerable';
            meaningText.innerText = "You have a good start, but you are guessing too much. You are one bad month away from failing.";
            ctaButton.innerText = "Strengthen My Foundation with the 33 Brutal Truths ($6.99)";
        } else {
            statusText.innerText = "STATUS: THE ELITE ZONE 🏆";
            statusText.className = 'elite';
            meaningText.innerText = "You are a real builder. You have a plan. Now you need the 'Unfair Advantage' to stay ahead.";
            ctaButton.innerText = "Get the 'Unfair Advantage' with the 33 Brutal Truths ($6.99)";
        }
    };

    // --- Event Listeners ---
    emailCheckForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = testEmailInput.value.trim();
        if (email) {
            checkEmail(email);
        }
    });

    nextBtn.addEventListener('click', handleNext);
    backBtn.addEventListener('click', handleBack);
});