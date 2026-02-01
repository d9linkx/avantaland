const fs = require('fs');

// 1. Read the source text file
const sourceText = fs.readFileSync('source.txt', 'utf8');

// 2. Updated Regex to look for "Truth X:" at the start of lines
// This splits the text into chunks starting with "Truth "
const truths = sourceText.split(/\n(?=Truth \d+:)|^(?=Truth \d+:)/gm);

let filesCreated = 0;

truths.forEach(content => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    // Extract the number from "Truth 1:"
    const match = trimmedContent.match(/^Truth (\d+):/);
    if (match) {
        const truthNumber = match[1];
        const fileName = `truth${truthNumber}.html`;

        // Remove the "Truth X:" header from the body to avoid redundancy
        const bodyContent = trimmedContent.replace(/^Truth \d+:.*/, '').trim();

        // Wrap the content in a clean, professional HTML structure
        const htmlWrapper = `
<div class="truth-content">
    <div class="truth-header-box">
        <span class="truth-label">STRATEGY #${truthNumber}</span>
    </div>
    <div class="truth-body">
        ${bodyContent.split(/\n\n+/).map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('')}
    </div>
</div>`.trim();

        fs.writeFileSync(fileName, htmlWrapper);
        console.log(`✅ Generated ${fileName}`);
        filesCreated++;
    }
});

console.log(`\nDONE: Successfully filled ${filesCreated} files.`);