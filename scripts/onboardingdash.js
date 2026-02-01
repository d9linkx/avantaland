document.addEventListener('DOMContentLoaded', () => {
    const enterBtn = document.getElementById('enter-lab-btn');
    const welcomeMsg = document.getElementById('user-welcome-msg');
    const nameDisplay = document.getElementById('user-name-display');

    // Check for URL params (e.g. from sellability test)
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    
    if (email) {
        // In a real app, we might fetch user name here
        // For now, we just pass it through or store it
        localStorage.setItem('userEmail', email);
    }

    enterBtn.addEventListener('click', () => {
        window.location.href = 'new-dashboard.html';
    });
});