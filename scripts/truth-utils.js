function initializeTruthPage(truthIndex) {
    // Dynamically find and update the checklist heading.
    const checklistHeading = document.querySelector('.truth-checklist h3');
    if (checklistHeading) {
        checklistHeading.innerText = 'How to fix this';
        checklistHeading.style.marginBottom = '0.5rem';

        const explanation = document.createElement('p');
        explanation.innerText = "(Only tick these off when you have actually done them)";
        explanation.style.fontSize = "0.85rem";
        explanation.style.color = "#64748B";
        explanation.style.marginTop = "0";
        explanation.style.marginBottom = "1.5rem";
        checklistHeading.after(explanation);
    }

    const revealBtn = document.getElementById('reveal-btn');
    const completeBtn = document.getElementById('mark-complete-btn');
    const fullContent = document.getElementById('full-truth-content');
    const checkboxes = document.querySelectorAll('.fix-checkbox');

    // --- 1. Load Completion Status ---
    const savedProgress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
    const isCompleted = savedProgress[truthIndex];

    if (isCompleted) {
        markAsCompletedUI();
    }

    // --- 2. Load Checklist State ---
    const checklistState = JSON.parse(localStorage.getItem('bizLabChecklist')) || {};
    const pageState = checklistState[truthIndex] || [];

    if (!isCompleted) {
        checkboxes.forEach((cb, idx) => {
            if (pageState[idx]) {
                cb.checked = true;
            }
        });
        updateCompleteButtonState();
    }

    // --- 3. Event Listeners ---

    // Checkboxes
    checkboxes.forEach((cb, idx) => {
        cb.addEventListener('change', () => {
            if (isCompleted) return;

            // Save State
            const currentChecklistState = JSON.parse(localStorage.getItem('bizLabChecklist')) || {};
            const currentPageState = currentChecklistState[truthIndex] || [];
            currentPageState[idx] = cb.checked;
            currentChecklistState[truthIndex] = currentPageState;
            localStorage.setItem('bizLabChecklist', JSON.stringify(currentChecklistState));

            updateCompleteButtonState();
        });
    });

    function updateCompleteButtonState() {
        if (isCompleted || !completeBtn) return;
        
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        if (allChecked) {
            completeBtn.disabled = false;
            completeBtn.innerHTML = 'Mark as Completed';
            completeBtn.style.opacity = '1';
            completeBtn.style.cursor = 'pointer';
        } else {
            completeBtn.disabled = true;
            completeBtn.innerHTML = 'Complete Checklist First';
            completeBtn.style.opacity = '0.5';
            completeBtn.style.cursor = 'not-allowed';
        }
    }

    function markAsCompletedUI() {
        completeBtn.innerHTML = '<i class="ph ph-check-circle"></i> Completed';
        completeBtn.classList.add('completed');
        completeBtn.disabled = true;
        completeBtn.style.opacity = '1';
        completeBtn.style.cursor = 'default';
        checkboxes.forEach(cb => {
            cb.checked = true;
            cb.disabled = true;
        });
    }

    // Reveal Logic
    if (revealBtn) {
        // Set initial state to ensure a consistent icon on load
        revealBtn.innerHTML = '<i class="ph ph-caret-down"></i> Read Full Truth';

        revealBtn.addEventListener('click', () => {
            const isHidden = fullContent.style.display === 'none';
            fullContent.style.display = isHidden ? 'block' : 'none';
            revealBtn.innerHTML = isHidden ? '<i class="ph ph-caret-up"></i> Hide Full Truth' : '<i class="ph ph-caret-down"></i> Read Full Truth';
        });
    }

    // Completion Logic
    if (completeBtn) {
        completeBtn.addEventListener('click', () => {
            // Double check validation
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            if (!allChecked) return;

            const progress = JSON.parse(localStorage.getItem('bizLabProgress')) || {};
            progress[truthIndex] = true;
            localStorage.setItem('bizLabProgress', JSON.stringify(progress));
            markAsCompletedUI();
        });
    }

    // --- 4. Audio Feature (Text-to-Speech) ---
    setupAudioFeature(truthIndex);
}

function setupAudioFeature(truthIndex) {
    const actionBar = document.querySelector('.action-bar');
    if (!actionBar) return;

    // Create Listen Button
    const listenBtn = document.createElement('button');
    listenBtn.id = 'listen-btn';
    listenBtn.className = 'btn-reveal'; 
    listenBtn.innerHTML = '<i class="ph ph-speaker-high"></i> Listen';
    
    // Insert into the action bar
    actionBar.appendChild(listenBtn);

    let isSpeaking = false;
    // REPLACE TTS with Audio File
    // Assumes files are named 'truth-1.mp3', 'truth-2.mp3' inside an 'audio' folder
    const voiceAudio = new Audio(`audio/truth-${truthIndex}.mp3`);

    // --- Audio Assets ---
    // 1. Attention Grabber (Intro Sound)
    const introSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    introSound.volume = 0.4;

    // 2. Background Music (Soft Ambient)
    // Using a royalty-free placeholder. You can replace this URL with your own hosted 'story-ambient.mp3'
    const bgMusic = new Audio('https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.1; // Very soft (10% volume)

    // Sync background music with voice
    voiceAudio.addEventListener('ended', () => {
        isSpeaking = false;
        bgMusic.pause();
        bgMusic.currentTime = 0;
        listenBtn.innerHTML = '<i class="ph ph-speaker-high"></i> Listen';
        listenBtn.classList.remove('speaking');
    });

    listenBtn.addEventListener('click', () => {
        if (isSpeaking) {
            // Stop Audio
            voiceAudio.pause();
            voiceAudio.currentTime = 0; // Reset to start
            bgMusic.pause();
            bgMusic.currentTime = 0;
            isSpeaking = false;
            listenBtn.innerHTML = '<i class="ph ph-speaker-high"></i> Listen';
            listenBtn.classList.remove('speaking');
        } else {
            // Start Audio
            
            // 1. Play Intro
            introSound.play().catch(() => {});

            // 2. Play Voice File
            voiceAudio.play().catch(e => alert("Audio file not found. Please ensure 'audio/truth-" + truthIndex + ".mp3' exists."));
            
            isSpeaking = true;
            
            // Start music when speech starts
            bgMusic.play().catch(e => console.warn("Background music autoplay blocked", e));
            
            listenBtn.innerHTML = '<i class="ph ph-stop-circle"></i> Stop';
            listenBtn.classList.add('speaking');
        }
    });

    // Stop audio if user leaves the page
    window.addEventListener('beforeunload', () => {
        if (isSpeaking) {
            voiceAudio.pause();
            bgMusic.pause();
        }
    });
}