document.addEventListener('DOMContentLoaded', () => {
    // --- Data: The 33 Truths ---
    const truths = [
        { id: 1, title: "No Prep Survives Contact", category: "foundation" },
        { id: 2, title: "Passion Is A Trap", category: "foundation" },
        { id: 3, title: "Eat Rejection For Breakfast", category: "foundation" },
        { id: 4, title: "Expect To Despair", category: "foundation" },
        { id: 5, title: "Confidence Comes From Wins", category: "foundation" },
        { id: 6, title: "Chaos Is Default", category: "foundation" },
        { id: 7, title: "Your Plan Is Wrong", category: "foundation" },
        { id: 8, title: "Ignore The Skeptics", category: "foundation" },
        { id: 9, title: "Idea Is Not Unique", category: "foundation" },
        { id: 10, title: "Validation Kills Ego", category: "foundation" },
        { id: 11, title: "Don't Build For You", category: "foundation" },
        { id: 12, title: "Niche Down Or Die", category: "foundation" },
        { id: 13, title: "Talk Before You Code", category: "foundation" },
        { id: 14, title: "Surveys Lie, Prototypes Don't", category: "foundation" },
        { id: 15, title: "Solve Bleeding Wounds", category: "foundation" },
        { id: 16, title: "Ship While Embarrassed", category: "foundation" },
        { id: 17, title: "Features Are Distractions", category: "scaling" },
        { id: 18, title: "Iterate Over Plan", category: "scaling" },
        { id: 19, title: "Document Or Die", category: "defense" },
        { id: 20, title: "Codebase Will Suck", category: "scaling" },
        { id: 21, title: "UX Is Growth Engine", category: "scaling" },
        { id: 22, title: "Good Beats Perfect", category: "scaling" },
        { id: 23, title: "Friends Are Liars", category: "foundation" },
        { id: 24, title: "Early Adopters Are Gold", category: "scaling" },
        { id: 25, title: "Sell Solutions Not Products", category: "scaling" },
        { id: 26, title: "Market Before Product", category: "scaling" },
        { id: 27, title: "Feedback Is A Weapon", category: "scaling" },
        { id: 28, title: "No Growth Hacking Junk", category: "scaling" },
        { id: 29, title: "You Can't Do All", category: "defense" },
        { id: 30, title: "Network Is Leverage", category: "defense" },
        { id: 31, title: "Hire Slow Fire Fast", category: "defense" },
        { id: 32, title: "Fire Comfort Mentors", category: "defense" },
        { id: 33, title: "Money Won't Fix It", category: "defense" }
    ];

    // --- DOM Elements ---
    const gridContainer = document.getElementById('truth-matrix');
    const scoreEl = document.getElementById('integrity-score');
    const rankEl = document.getElementById('architect-rank');
    const progressRing = document.querySelector('.progress-ring__circle');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const auditBtn = document.getElementById('btn-audit');

    // --- State ---
    let progress = {};
    try {
        progress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
    } catch (e) {
        console.error('Error parsing progress:', e);
    }

    // --- Functions ---

    const calculateStats = () => {
        const total = truths.length;
        const completed = Object.keys(progress).filter(k => progress[k]).length;
        const percentage = Math.round((completed / total) * 100);
        
        // Update Score
        scoreEl.innerText = percentage;
        
        // Update Ring
        const radius = progressRing.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (percentage / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;

        // Update Rank
        let rank = "Novice";
        if (percentage > 20) rank = "Builder";
        if (percentage > 50) rank = "Operator";
        if (percentage > 80) rank = "Architect";
        if (percentage === 100) rank = "Master";
        rankEl.innerText = rank;
    };

    const renderGrid = () => {
        gridContainer.innerHTML = '';
        
        truths.forEach((truth, index) => {
            // Note: truth.id is 1-based, index is 0-based. 
            // LocalStorage uses 0-based index.
            const isCompleted = progress[index]; 
            
            const card = document.createElement('a');
            card.href = `truth${truth.id}.html`;
            card.target = "_blank";
            card.className = `truth-card ${isCompleted ? 'verified' : ''}`;
            card.dataset.category = truth.category;
            card.dataset.id = index;

            card.innerHTML = `
                <div class="card-header">
                    <span class="truth-number">Truth #${truth.id}</span>
                    <div class="status-indicator"></div>
                </div>
                <h3 class="truth-title">${truth.title}</h3>
            `;

            gridContainer.appendChild(card);
        });
    };

    const handleFilter = (category) => {
        const cards = document.querySelectorAll('.truth-card');
        cards.forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.classList.remove('dimmed');
            } else {
                card.classList.add('dimmed');
            }
        });
    };

    const generateAudit = () => {
        const completedCount = Object.keys(progress).filter(k => progress[k]).length;
        const score = Math.round((completedCount / truths.length) * 100);
        const date = new Date().toLocaleDateString();

        let report = `EXECUTIVE AUDIT REPORT\n`;
        report += `Date: ${date}\n`;
        report += `Integrity Score: ${score}%\n\n`;
        report += `CRITICAL GAPS DETECTED:\n`;
        report += `-----------------------\n`;

        let gapsFound = false;
        truths.forEach((truth, index) => {
            if (!progress[index]) {
                report += `[ ] Truth #${truth.id}: ${truth.title} (${truth.category.toUpperCase()})\n`;
                gapsFound = true;
            }
        });

        if (!gapsFound) {
            report += "No gaps detected. System integrity is 100%.\n";
        }

        report += `\n-----------------------\n`;
        report += `RECOMMENDATION: Focus on closing 'Foundation' gaps first to ensure stability.`;

        // Create download
        const blob = new Blob([report], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Avantaland_Audit_${date.replace(/\//g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // --- Event Listeners ---

    // Filters
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Toggle
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Logic
            handleFilter(btn.dataset.filter);
        });
    });

    // Audit
    auditBtn.addEventListener('click', generateAudit);

    // Sync-Back Engine (Listen for changes in other tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'bizLabProgress') {
            progress = JSON.parse(e.newValue) || {};
            renderGrid();
            calculateStats();
        }
    });

    // --- Init ---
    renderGrid();
    calculateStats();
});