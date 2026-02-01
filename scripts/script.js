function initializeSiteFunctionality() {
    // --- Mobile Menu Toggle ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    // --- Inject Blog Link ---
    const addBlogLink = () => {
        // Desktop Header
        const desktopNavUl = document.querySelector('.desktop-nav ul');
        if (desktopNavUl && !desktopNavUl.querySelector('a[href="blog.html"]')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="blog.html">Blog</a>';
            desktopNavUl.appendChild(li);
        }

        // Mobile Menu
        if (mobileNav && !mobileNav.querySelector('a[href="blog.html"]')) {
            const blogLink = document.createElement('a');
            blogLink.href = 'blog.html';
            blogLink.textContent = 'Blog';
            const firstBtn = mobileNav.querySelector('.btn');
            if (firstBtn) mobileNav.insertBefore(blogLink, firstBtn);
            else mobileNav.appendChild(blogLink);
        }

        // Footer (Target 2nd column)
        const footerCols = document.querySelectorAll('.footer-col');
        if (footerCols.length > 1) {
            const targetCol = footerCols[1];
            if (targetCol && !targetCol.querySelector('a[href="blog.html"]')) {
                const blogLink = document.createElement('a');
                blogLink.href = 'blog.html';
                blogLink.textContent = 'Blog';
                targetCol.appendChild(blogLink);
            }
        }
    };
    addBlogLink();

    // --- Inject Business Lab Link ---
    const updateBizLabLink = () => {
        const targetUrl = 'onboardingdash.html';
        const linkText = 'Business Lab';

        // Helper to add or update link in a container
        const handleContainer = (container) => {
            if (!container) return;
            // Check if a link to biz-lab.html or similar exists to replace
            let existingLink = container.querySelector('a[href*="biz-lab"]');
            
            if (existingLink) {
                existingLink.href = targetUrl;
                existingLink.textContent = linkText;
            } else if (!container.querySelector(`a[href="${targetUrl}"]`)) {
                // If not found, append new
                const li = document.createElement('li');
                li.innerHTML = `<a href="${targetUrl}">${linkText}</a>`;
                container.appendChild(li);
            }
        };

        handleContainer(document.querySelector('.desktop-nav ul'));
    };
    updateBizLabLink();

    const mobileLinks = document.querySelectorAll('.mobile-nav a');

    // --- Header CTA Customization ---
    // Give the header CTA a unique class for styling
    const headerCta = document.querySelector('#main-header .nav-actions .btn');
    if (headerCta) {
        headerCta.classList.add('btn-header-cta');
        headerCta.classList.remove('btn-primary');
    }

    // Handle dynamic "Start Learning" button link
    // On the homepage, it links to #join. On other pages, it links to courses.html.
    const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');
    if (!isHomePage) {
        const startLearningBtn = document.querySelector('.nav-actions .btn');
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
