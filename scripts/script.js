function initializeSiteFunctionality() {
    // --- Mobile Menu Toggle ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileLinks = document.querySelectorAll('.mobile-nav a');

    // Handle dynamic "Start Learning" button link
    // On the homepage, it links to #join. On other pages, it links to courses.html.
    const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    if (!isHomePage) {
        const startLearningBtn = document.querySelector('.nav-actions a.btn-primary');
        const mobileStartLearningLink = Array.from(mobileLinks).find(link => link.href.endsWith('#join'));
        
        if (startLearningBtn && startLearningBtn.href.endsWith('#join')) {
            startLearningBtn.href = 'courses.html';
        }
        if (mobileStartLearningLink) {
            mobileStartLearningLink.href = 'courses.html';
        }
    }

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

    // Initialize all scripts that depend on the loaded header and footer content.
    initializeSiteFunctionality();
});
