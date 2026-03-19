document.addEventListener('DOMContentLoaded', () => {
    const enterBtn = document.getElementById('enter-lab-btn');
    const emailInput = document.getElementById('email-input');
    const authMessage = document.getElementById('auth-message');

    // Check for URL params (e.g. from sellability test)
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    
    if (emailParam) {
        emailInput.value = emailParam;
    }

    const checkAuth = async () => {
        const email = emailInput.value.trim().toLowerCase();
        if (!email) {
            authMessage.textContent = "Please enter your email address.";
            authMessage.className = "auth-message error";
            return;
        }

        enterBtn.disabled = true;
        enterBtn.textContent = "Verifying...";
        authMessage.textContent = "";

        try {
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwx5HUQ9vvsiC35I5N1UveJhKuSAjM52BxOPGZdXHZ9FunFee36ykfsQZYru_gSffmh/exec';
            const response = await fetch(`${SCRIPT_URL}?action=checkEmail&email=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (data.found) {
                authMessage.textContent = "Access Granted. Redirecting...";
                authMessage.className = "auth-message success";
                
                // Build Profile Object for Dashboard Uniqueness
                const profile = {
                    name: data.firstName || 'Founder',
                    email: email,
                    primarySkill: 'Entrepreneur',
                    dreamResult: 'Financial Freedom',
                    avatar: null,
                    bio: '',
                    // Split comma-separated lists
                    skills: ['Strategy', 'Execution'],
                    tools: [],
                    experience: [], 
                    customSections: []
                };

                localStorage.setItem('bizLabProfile', JSON.stringify(profile));
                
                setTimeout(() => {
                    window.location.href = 'new-dashboard.html';
                }, 1000);
            } else {
                authMessage.innerHTML = "Email not found in database. <a href='https://wa.me/2347070989034' style='color: #00db87; text-decoration: underline;'>Contact Support</a>.";
                authMessage.className = "auth-message error";
                enterBtn.disabled = false;
                enterBtn.textContent = "Sign In";
            }
        } catch (error) {
            console.error("Auth error:", error);
            authMessage.textContent = "Connection error. Please try again.";
            authMessage.className = "auth-message error";
            enterBtn.disabled = false;
            enterBtn.textContent = "Sign In";
        }
    };

    enterBtn.addEventListener('click', checkAuth);
    
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAuth();
    });
});