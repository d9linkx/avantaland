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
            const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTejGSnuGtPyHykKnwgAojeW-5fav94zetkVbGDYz5mE5Do_Knx988GrzqvQv9SGKeeA/exec';
            const response = await fetch(`${SCRIPT_URL}?action=checkEmail&email=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (data.found) {
                authMessage.textContent = "Access Granted. Redirecting...";
                authMessage.className = "auth-message success";
                
                const user = data.user || data; // Handle different potential response structures

                // Build Profile Object for Dashboard Uniqueness
                const profile = {
                    name: user.Name || user.name || user.FirstName || user.firstName || user.firstname || 'Founder',
                    email: email,
                    primarySkill: user.Headline || 'Entrepreneur',
                    dreamResult: user.DreamResult || 'Financial Freedom',
                    avatar: user.Avatar || null,
                    bio: user.Bio || '',
                    // Parse JSON strings if they exist, otherwise default
                    skills: user.Skills ? JSON.parse(user.Skills) : ['Strategy', 'Execution'],
                    tools: user.Tools ? JSON.parse(user.Tools) : [],
                    experience: user.Experience ? JSON.parse(user.Experience) : [], 
                    customSections: user.CustomSections ? JSON.parse(user.CustomSections) : []
                };

                // Save fetched data to LocalStorage so dashboard picks it up
                localStorage.setItem('bizLabProfile', JSON.stringify(profile));
                if (user.Progress) localStorage.setItem('bizLabProgress', user.Progress);
                if (user.Checklist) localStorage.setItem('bizLabChecklist', user.Checklist);
                if (user.Planner) localStorage.setItem('bizLabPlanner', user.Planner);
                if (user.Notes) localStorage.setItem('bizLabFeedbackNotes', user.Notes);
                
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