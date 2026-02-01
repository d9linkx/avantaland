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
        const email = emailInput.value.trim();
        if (!email) {
            authMessage.textContent = "Please enter your email address.";
            authMessage.className = "auth-message error";
            return;
        }

        enterBtn.disabled = true;
        enterBtn.textContent = "Verifying...";
        authMessage.textContent = "";

        try {
            const SCRIPT_URL = CONFIG.GOOGLE_SCRIPT_URL_APP;
            const response = await fetch(`${SCRIPT_URL}?action=checkEmail&email=${encodeURIComponent(email)}`);
            const result = await response.json();

            if (result.found) {
                authMessage.textContent = "Access Granted. Redirecting...";
                authMessage.className = "auth-message success";
                localStorage.setItem('userEmail', email);
                
                setTimeout(() => {
                    window.location.href = 'new-dashboard.html';
                }, 1000);
            } else {
                authMessage.innerHTML = "Email not found. <a href='product-test.html' style='color: #2979FF; text-decoration: underline;'>Sign up here</a> or try again.";
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