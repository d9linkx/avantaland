function initializeSiteFunctionality() {
    // --- Mobile Menu Toggle ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    const mobileLinks = document.querySelectorAll('.mobile-nav a');

    if (menuBtn && mobileNav) {
        menuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            // Animate hamburger to X
            const bars = menuBtn.querySelectorAll('.bar');
            if (mobileNav.classList.contains('active')) {
                bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
                bars[1].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.transform = 'none';
            }
        });

        // Close mobile menu when a link is clicked
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                const bars = menuBtn.querySelectorAll('.bar');
                bars[0].style.transform = 'none';
                bars[1].style.transform = 'none';
            });
        });
    }

    // Expose new-dash.js functions globally for script.js to use
    // This assumes new-dash.js is loaded before this part of script.js executes.
    const dashboardApp = window.dashboardApp || {};

    // --- Dashboard Interactions (new-dashboard.html) ---
    const dashSidebar = document.querySelector('aside.lg\\:flex');
    const dashToggle = document.getElementById('mobile-sidebar-toggle');

    if (dashToggle && dashSidebar) {
        dashToggle.addEventListener('click', () => {
            const isHidden = dashSidebar.classList.contains('hidden');
            if (isHidden) {
                dashSidebar.classList.remove('hidden');
                dashSidebar.classList.add('flex', 'z-[110]', 'shadow-2xl');
            } else {
                dashSidebar.classList.add('hidden');
                dashSidebar.classList.remove('flex', 'z-[110]', 'shadow-2xl');
            }
        });

        // Auto-close dashboard sidebar on mobile when a link is clicked
        const dashNavLinks = dashSidebar.querySelectorAll('nav a');
        dashNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Handle active state
                dashNavLinks.forEach(l => l.classList.remove('sidebar-active', 'text-brand', 'bg-[#ECFDF5]', 'border-r-4', 'border-brand'));
                link.classList.add('sidebar-active', 'text-brand', 'bg-[#ECFDF5]', 'border-r-4', 'border-brand');

                if (window.innerWidth < 1024) {
                    dashSidebar.classList.add('hidden');
                    dashSidebar.classList.remove('flex', 'z-[110]', 'shadow-2xl');
                }

                // Call new-dash.js functions based on data-target
                const target = link.dataset.target;
                if (dashboardApp && dashboardApp.renderView) {
                    switch (target) {
                        case 'my-learning':
                            dashboardApp.renderView('dashboard-grid');
                            break;
                        case 'course-catalog':
                            dashboardApp.renderView('course-catalog');
                            break;
                        case 'skill-paths':
                            dashboardApp.renderView('skill-paths');
                            break;
                        case 'business-dashboard':
                            dashboardApp.renderView('business-dashboard');
                            break;
                        case 'aveo-ai':
                            dashboardApp.renderView('aveo-ai');
                            break;
                        default:
                            console.warn('Unknown dashboard navigation target:', target);
                    }
                }
            });
        });
    }

    // Dashboard Search bar interaction
    const dashSearch = document.querySelector('header input[placeholder*="Search"]');
    if (dashSearch) {
        dashSearch.addEventListener('input', (e) => {
            console.log("Dashboard searching for:", e.target.value);
        });
    }

    // --- Intersection Observer for Fade-in Animations ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // --- Smooth Scroll for Anchor Links ---
    // This needs to run after the header is loaded to catch header links like #join
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Account for fixed header height
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- Early Bird Countdown ---
    startEarlyBirdTimer();
}

function startEarlyBirdTimer() {
    const timerEl = document.getElementById('early-bird-timer');
    if (!timerEl) return;

    // Use a persistent expiry date (48 hours from first visit)
    let expiry = localStorage.getItem('earlyBirdExpiry');
    if (!expiry) {
        expiry = new Date().getTime() + (48 * 60 * 60 * 1000);
        localStorage.setItem('earlyBirdExpiry', expiry);
    }

    let timerInterval;

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = expiry - now;

        if (distance < 0) {
            const bar = document.querySelector('.mobile-enroll-bar');
            if (bar) {
                const timerContainer = bar.querySelector('.timer-container');
                if (timerContainer) timerContainer.remove();
                const enrollBtn = bar.querySelector('.btn');
                if (enrollBtn) enrollBtn.textContent = 'Enroll at Standard Price';
            }
            if (timerInterval) clearInterval(timerInterval);
            return;
        }

        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        timerEl.innerHTML = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

async function loadTemplate(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Could not fetch ${url}`);
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadTemplate('header.html', 'header-placeholder'),
        loadTemplate('footer.html', 'footer-placeholder')
    ]);

    // Load new-dash.js after header/footer, but before initializing site functionality
    // This ensures new-dash.js can access the DOM and its functions are available for script.js
    await loadTemplate('scripts/new-dash.js', 'new-dash-script-placeholder'); // Assuming a placeholder for scripts
    if (window.initializeDashboardApp) window.initializeDashboardApp();

    // Initialize all scripts that depend on the loaded header and footer content.
    initializeSiteFunctionality();
});


















