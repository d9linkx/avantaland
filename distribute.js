const fs = require('fs');

const sourceText = fs.readFileSync('source.txt', 'utf8');
const truths = sourceText.split(/\n(?=Truth \d+:)|^(?=Truth \d+:)/gm);

if (!fs.existsSync('truths')) fs.mkdirSync('truths');

let filesCreated = 0;

truths.forEach((content) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    const match = trimmedContent.match(/^Truth (\d+):/);
    if (match) {
        const truthNumber = match[1];
        const truthIndex = parseInt(truthNumber) - 1; // 0-based index for localStorage
        const fileName = `truths/truth${truthNumber}.html`;

        // Extract Title
        const titleMatch = trimmedContent.match(/^Truth \d+:(.*)/);
        const title = titleMatch ? titleMatch[1].trim() : `Truth #${truthNumber}`;

        // Extract Body (Remove header line)
        let bodyContent = trimmedContent.replace(/^Truth \d+:.*(\r\n|\r|\n)/, '').trim();
        
        const paragraphs = bodyContent.split(/\n\n+/);
        
        // Phase 1: Summary (First Paragraph)
        const summary = paragraphs[0] || "Summary not available.";

        // Phase 1: Checklist (Paragraphs starting with numbers)
        let fixes = paragraphs.filter(p => /^\d+\./.test(p.trim()));
        if (fixes.length === 0) {
             fixes = [
                "1. Read the full truth below.",
                "2. Identify your gap.",
                "3. Commit to the fix."
            ];
        }

        const fixesHtml = fixes.map(f => `
            <label class="fix-item">
                <input type="checkbox" class="fix-checkbox">
                <span class="fix-text">${f.replace(/\n/g, ' ')}</span>
            </label>
        `).join('');

        const fullContentHtml = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Avantaland Biz Lab</title>
    <link rel="stylesheet" href="../styles/styles.css">
    <link rel="stylesheet" href="../styles/truth-style.css">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="truth-page-container">
        <a href="../biz-lab.html" class="back-link">← Back to Dashboard</a>
        
        <header class="truth-header">
            <span class="truth-number">Truth #${truthNumber}</span>
            <h1>${title}</h1>
        </header>

        <section class="truth-summary-box">
            <h3>Executive Summary</h3>
            <p>${summary}</p>
        </section>

        <section class="truth-checklist">
            <h3>Actionable Checklist</h3>
            <div class="fix-list">
                ${fixesHtml}
            </div>
        </section>

        <div class="action-bar">
            <button id="mark-complete-btn" class="btn-complete">Mark as Completed</button>
            <button id="reveal-btn" class="btn-reveal">📖 Read Full Truth</button>
        </div>

        <div id="full-truth-content" class="full-content" style="display: none;">
            <hr class="divider">
            ${fullContentHtml}
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const truthIndex = ${truthIndex};
            const revealBtn = document.getElementById('reveal-btn');
            const completeBtn = document.getElementById('mark-complete-btn');
            const fullContent = document.getElementById('full-truth-content');

            // Check Completion Status
            const savedProgress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
            if (savedProgress[truthIndex]) {
                completeBtn.innerText = '✓ Completed';
                completeBtn.classList.add('completed');
                completeBtn.disabled = true;
            }

            // Reveal Logic
            revealBtn.addEventListener('click', () => {
                if (fullContent.style.display === 'none') {
                    fullContent.style.display = 'block';
                    revealBtn.innerText = 'Hide Full Truth';
                } else {
                    fullContent.style.display = 'none';
                    revealBtn.innerText = '📖 Read Full Truth';
                }
            });

            // Completion Logic
            completeBtn.addEventListener('click', () => {
                const progress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
                progress[truthIndex] = true;
                localStorage.setItem('bizLabProgress', JSON.stringify(progress));
                
                completeBtn.innerText = '✓ Completed';
                completeBtn.classList.add('completed');
                completeBtn.disabled = true;
            });
        });
    </script>
</body>
</html>`;

        fs.writeFileSync(fileName, html);
        filesCreated++;
    }
});

console.log(`Generated ${filesCreated} standalone truth files.`);