document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const STORAGE_KEY = 'avantaland_planner_tasks';
    const DATE_KEY = 'avantaland_planner_date';
    const ENERGY_PROFILE_KEY = 'avantaland_energy_profile';
    let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let energyProfile = JSON.parse(localStorage.getItem(ENERGY_PROFILE_KEY));
    let focusMode = false;
    let currentSlotSelection = null; // Tracks which slot is asking for a task

    // --- DOM Elements ---
    const dateDisplay = document.getElementById('date-display');
    const backlogList = document.getElementById('backlog-list');
    const vaultList = document.getElementById('vault-list');
    const primeCountDisplay = document.getElementById('prime-count');
    const input = document.getElementById('new-task-input');
    const addBtn = document.getElementById('add-task-btn');
    const focusBtn = document.getElementById('focus-mode-btn');
    const backlogSection = document.getElementById('backlog-section');
    const vaultSection = document.getElementById('vault-section');
    const energyHud = document.getElementById('energy-hud');
    
    // Modal Elements
    const modal = document.getElementById('task-picker-modal');
    const modalSlotName = document.getElementById('modal-slot-name');
    const modalList = document.getElementById('modal-task-list');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    // Energy Setup Elements
    const energyModal = document.getElementById('energy-setup-modal');
    const saveEnergyBtn = document.getElementById('save-energy-btn');
    const peakStart = document.getElementById('peak-start');
    const peakEnd = document.getElementById('peak-end');
    const troughStart = document.getElementById('trough-start');
    const troughEnd = document.getElementById('trough-end');

    // Tax Modal Elements
    const taxModal = document.getElementById('tax-modal');
    const taxReflection = document.getElementById('tax-reflection');
    const payTaxBtn = document.getElementById('pay-tax-btn');
    const taxStrikeCount = document.getElementById('tax-strike-count');
    let taskToTaxId = null;

    // HUD Elements
    const hudOverlay = document.getElementById('hud-overlay');
    const hudTaskText = document.getElementById('hud-task-text');
    const hudTimerDisplay = document.getElementById('hud-timer-display');
    const hudTimerToggle = document.getElementById('hud-timer-toggle');
    let hudTimerInterval = null;
    let hudTimeLeft = 25 * 60;

    // --- Initialization ---
    const today = new Date();
    const todayStr = today.toDateString();
    dateDisplay.innerText = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    checkEndOfDayPurge(todayStr);
    
    if (!energyProfile) {
        initEnergySetup();
    } else {
        startEnergyLoop();
    }
    
    renderAll();

    // --- Event Listeners ---
    addBtn.addEventListener('click', handleAddTask);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTask();
    });

    focusBtn.addEventListener('click', () => {
        focusMode = !focusMode;
        if (focusMode) {
            openHUD();
            focusBtn.classList.add('active');
            focusBtn.innerHTML = '<span class="icon"><i class="ph ph-lock-key-open"></i></span> Exit Focus';
        } else {
            closeHUD();
            focusBtn.classList.remove('active');
            focusBtn.innerHTML = '<span class="icon"><i class="ph ph-eye"></i></span> Focus Mode';
        }
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        currentSlotSelection = null;
    });

    saveEnergyBtn.addEventListener('click', handleSaveEnergy);
    payTaxBtn.addEventListener('click', handlePayTax);
    
    document.getElementById('hud-close-btn').addEventListener('click', () => {
        focusMode = false;
        closeHUD();
        focusBtn.classList.remove('active');
        focusBtn.innerHTML = '<span class="icon"><i class="ph ph-eye"></i></span> Focus Mode';
    });

    hudTimerToggle.addEventListener('click', toggleHUDTimer);
    document.getElementById('hud-complete-btn').addEventListener('click', () => {
        // Complete current active task
        const activeTask = tasks.find(t => t.status === 'active');
        if (activeTask) {
            window.plannerActions.complete(activeTask.id);
            closeHUD();
        }
    });

    // --- Core Logic ---

    function initEnergySetup() {
        // Populate Selects (6 AM to 10 PM)
        const populate = (select, start, end) => {
            select.innerHTML = '';
            for(let i=start; i<=end; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                const suffix = i >= 12 ? 'PM' : 'AM';
                const hour = i > 12 ? i - 12 : i;
                opt.innerText = `${hour}:00 ${suffix}`;
                select.appendChild(opt);
            }
        };
        
        populate(peakStart, 6, 22);
        populate(peakEnd, 7, 23);
        populate(troughStart, 6, 22);
        populate(troughEnd, 7, 23);
        
        // Defaults
        peakStart.value = 9; peakEnd.value = 11;
        troughStart.value = 14; troughEnd.value = 16;
        
        energyModal.style.display = 'flex';
    }

    function handleSaveEnergy() {
        energyProfile = {
            peak: { start: parseInt(peakStart.value), end: parseInt(peakEnd.value) },
            trough: { start: parseInt(troughStart.value), end: parseInt(troughEnd.value) }
        };
        localStorage.setItem(ENERGY_PROFILE_KEY, JSON.stringify(energyProfile));
        energyModal.style.display = 'none';
        startEnergyLoop();
    }

    function startEnergyLoop() {
        updateEnergyHUD();
        setInterval(updateEnergyHUD, 60000); // Check every minute
    }

    function updateEnergyHUD() {
        const hour = new Date().getHours();
        const body = document.body;
        
        body.classList.remove('peak-mode', 'trough-mode');
        energyHud.style.display = 'inline-block';

        if (hour >= energyProfile.peak.start && hour < energyProfile.peak.end) {
            body.classList.add('peak-mode');
            energyHud.innerHTML = "<i class='ph ph-lightning'></i> PEAK ZONE: DEEP WORK ONLY";
            energyHud.style.color = "#FFD600";
        } else if (hour >= energyProfile.trough.start && hour < energyProfile.trough.end) {
            body.classList.add('trough-mode');
            energyHud.innerHTML = "<i class='ph ph-moon'></i> TROUGH ZONE: ADMIN & RECOVERY";
            energyHud.style.color = "#0284C7";
        } else {
            energyHud.innerHTML = "<i class='ph ph-battery-charging'></i> RECOVERY ZONE";
            energyHud.style.color = "#64748B";
        }
    }

    function checkEndOfDayPurge(todayStr) {
        const lastDate = localStorage.getItem(DATE_KEY);
        
        if (lastDate && lastDate !== todayStr) {
            // It's a new day. Purge!
            tasks.forEach(t => {
                if (t.status === 'active' && !t.completed) {
                    t.status = 'backlog';
                    t.slot = null;
                    t.postponed = true; // Mark of shame/delay
                    t.postponeCount = (t.postponeCount || 0) + 1;
                } else if (t.status === 'active' && t.completed) {
                    t.status = 'archived'; // Clear the board
                }
            });
            saveTasks();
        }
        localStorage.setItem(DATE_KEY, todayStr);
    }

    function handleAddTask() {
        const text = input.value.trim();
        if (!text) return;

        // Complexity Check: Ensure task is granular
        if (text.length > 50) {
            alert("Is this a task or a project? Break it down into one executable step.");
            return;
        }

        const newTask = {
            id: Date.now(),
            text: text,
            status: 'backlog', // Always start in backlog
            slot: null,
            postponeCount: 0,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask); // Add to top of backlog
        saveTasks();
        renderAll();
        input.value = '';
    }

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function renderAll() {
        renderSlots();
        renderBacklog();
        renderVault();
        updateStats();
    }

    function renderSlots() {
        const slotTypes = ['revenue', 'operations', 'development'];
        let completedCount = 0;

        slotTypes.forEach(type => {
            const container = document.getElementById(`slot-${type}`);
            const task = tasks.find(t => t.status === 'active' && t.slot === type);
            
            container.innerHTML = ''; // Clear
            container.className = `mission-slot`; // Reset class
            container.dataset.type = type; // Ensure type attr

            // Add Label
            const label = document.createElement('div');
            label.className = 'slot-label';
            label.innerText = type.toUpperCase();
            container.appendChild(label);

            if (task) {
                container.classList.add('filled');
                if (task.completed) {
                    container.classList.add('completed');
                    completedCount++;
                }

                // Energy Mismatch Warning
                if (task.weight === 'deep' && document.body.classList.contains('trough-mode')) {
                    container.style.border = "2px solid #F59E0B"; // Warning border
                }

                const content = document.createElement('div');
                content.style.width = '100%';
                content.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                        <span style="font-weight:600; font-size:1.1rem;">${task.text}</span>
                        <div class="task-actions">
                            ${!task.completed ? `<button onclick="window.plannerActions.complete(${task.id})" title="Complete"><i class="ph ph-check-circle"></i></button>` : ''}
                            <button onclick="window.plannerActions.demote(${task.id})" title="Kick back to backlog"><i class="ph ph-arrow-u-up-left"></i></button>
                        </div>
                    </div>
                    <div class="task-meta ${task.goalType === 'survival' ? 'survival' : ''}">${task.weight === 'deep' ? '<i class="ph ph-lightning"></i> Deep Work' : '<i class="ph ph-coffee"></i> Shallow Work'} • ${task.goalType === 'survival' ? 'SURVIVAL WORK' : 'STRATEGIC'}</div>
                `;
                container.appendChild(content);
            } else {
                // Empty State
                const btn = document.createElement('button');
                btn.className = 'btn-fill-slot';
                btn.innerText = '+ Fill Slot';
                btn.onclick = () => openTaskPicker(type);
                container.appendChild(btn);
            }
        });

        // Visual Momentum / Victory State
        if (completedCount === 3) {
            document.body.classList.add('victory-state');
            primeCountDisplay.innerText = "MISSION ACCOMPLISHED";
            primeCountDisplay.style.color = "#10B981";
        } else {
            document.body.classList.remove('victory-state');
            primeCountDisplay.innerText = `${tasks.filter(t => t.status === 'active').length}/3 Slots Filled`;
            primeCountDisplay.style.color = "#2979FF";
        }
    }

    function renderBacklog() {
        backlogList.innerHTML = '';
        const backlogTasks = tasks.filter(t => t.status === 'backlog');

        if (backlogTasks.length === 0) {
            backlogList.innerHTML = `<div style="text-align:center; color:#94a3b8; padding: 1rem;">Backlog empty. Capture your mind.</div>`;
        } else {
            backlogTasks.forEach(task => {
                const el = document.createElement('div');
                el.className = 'task-item fade-in';
                el.innerHTML = `
                    <span class="task-text">${task.postponeCount > 0 ? `<span style="color:#EF4444; font-weight:bold;">[${task.postponeCount}x DELAY]</span> ` : ''}${task.text}</span>
                    <div class="task-actions">
                        <button onclick="window.plannerActions.remove(${task.id})" title="Delete"><i class="ph ph-trash"></i></button>
                    </div>
                `;
                backlogList.appendChild(el);
            });
        }
    }

    function renderVault() {
        vaultList.innerHTML = '';
        // Show completed today and "Cringe Log" (deleted via tax)
        const vaultTasks = tasks.filter(t => (t.status === 'active' && t.completed) || t.status === 'cringe');
        
        if (vaultTasks.length === 0) {
            vaultList.innerHTML = `<div style="text-align:center; color:#94a3b8; padding: 1rem;">Vault empty. Execute to fill.</div>`;
        } else {
            vaultTasks.forEach(task => {
                const el = document.createElement('div');
                el.className = 'task-item fade-in';
                el.style.opacity = '0.7';
                el.innerHTML = `
                    <span class="task-text" style="${task.status === 'cringe' ? 'text-decoration:line-through; color:#EF4444;' : ''}">${task.status === 'cringe' ? '💀 ' : '🏆 '}${task.text}</span>
                `;
                vaultList.appendChild(el);
            });
        }
    }

    function updateStats() {
        // Handled in renderSlots for now
    }

    function openTaskPicker(slotType) {
        currentSlotSelection = slotType;
        modalSlotName.innerText = slotType.toUpperCase();
        modalList.innerHTML = '';

        const backlogTasks = tasks.filter(t => t.status === 'backlog');
        
        if (backlogTasks.length === 0) {
            modalList.innerHTML = '<p style="text-align:center; color:#64748B;">Backlog is empty. Add tasks first.</p>';
        } else {
            modalList.innerHTML = '<p style="margin-bottom:1rem; font-size:0.9rem;">Select a task and its cognitive weight:</p>';
            backlogTasks.forEach(task => {
                const div = document.createElement('div');
                div.className = 'modal-task-item';
                div.innerHTML = `
                    <div style="margin-bottom:8px; font-weight:600;">${task.text}</div>
                    <div class="weight-selection">
                        <button class="btn-weight" onclick="window.plannerActions.promote(${task.id}, '${currentSlotSelection}', 'deep')">
                            <i class="ph ph-lightning"></i> Deep
                        </button>
                        <button class="btn-weight" onclick="window.plannerActions.promote(${task.id}, '${currentSlotSelection}', 'shallow')">
                            <i class="ph ph-coffee"></i> Shallow
                        </button>
                    </div>
                `;
                modalList.appendChild(div);
            });
        }
        
        modal.style.display = 'flex';
    }

    // --- Tax System ---
    function handlePayTax() {
        const reflection = taxReflection.value.trim();
        if (!reflection) {
            alert("You must reflect on why.");
            return;
        }
        
        const task = tasks.find(t => t.id === taskToTaxId);
        if (task) {
            task.postponeCount = (task.postponeCount || 0) + 1;
            task.reflection = reflection; // Save reflection
            
            if (task.postponeCount >= 3) {
                task.status = 'cringe'; // Move to Cringe Log
                task.slot = null;
                alert("Task deleted. It was a distraction.");
            } else {
                task.status = 'backlog';
                task.slot = null;
                task.completed = false;
            }
        }
        
        saveTasks();
        renderAll();
        taxModal.style.display = 'none';
        taxReflection.value = '';
    }

    // --- HUD System ---
    function openHUD() {
        const activeTask = tasks.find(t => t.status === 'active' && !t.completed);
        if (activeTask) {
            hudTaskText.innerText = activeTask.text;
        } else {
            hudTaskText.innerText = "No Active Mission";
        }
        hudOverlay.style.display = 'flex';
    }

    function closeHUD() {
        hudOverlay.style.display = 'none';
        clearInterval(hudTimerInterval);
        hudTimerInterval = null;
        hudTimerToggle.innerHTML = '<i class="ph ph-play"></i>';
    }

    function toggleHUDTimer() {
        if (hudTimerInterval) {
            clearInterval(hudTimerInterval);
            hudTimerInterval = null;
            hudTimerToggle.innerHTML = '<i class="ph ph-play"></i>';
        } else {
            hudTimerToggle.innerHTML = '<i class="ph ph-pause"></i>';
            hudTimerInterval = setInterval(() => {
                hudTimeLeft--;
                const m = Math.floor(hudTimeLeft / 60).toString().padStart(2, '0');
                const s = (hudTimeLeft % 60).toString().padStart(2, '0');
                hudTimerDisplay.innerText = `${m}:${s}`;
                if (hudTimeLeft <= 0) clearInterval(hudTimerInterval);
            }, 1000);
        }
    }

    // Expose actions to global scope for inline onclick handlers
    window.plannerActions = {
        promote: (id, slotType, weight) => {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.status = 'active';
                task.slot = slotType;
                task.weight = weight;
                task.postponed = false; // Reset shame marker
                
                // Reverse-Engineering Check
                const isStrategic = confirm("Does this task directly serve your 3-year vision?\nOK = Yes (Strategic)\nCancel = No (Survival Work)");
                task.goalType = isStrategic ? 'strategic' : 'survival';
                
                // Auto-Mapping Logic
                if (energyProfile) {
                    if (weight === 'deep') {
                        task.scheduledTime = `${energyProfile.peak.start}:00 ${energyProfile.peak.start >= 12 ? 'PM' : 'AM'}`;
                    } else {
                        task.scheduledTime = `${energyProfile.trough.start}:00 ${energyProfile.trough.start >= 12 ? 'PM' : 'AM'}`;
                    }
                } else {
                    task.scheduledTime = "Today";
                }
                
                modal.style.display = 'none';
            }
            saveTasks();
            renderAll();
        },
        demote: (id) => {
            const task = tasks.find(t => t.id === id);
            taskToTaxId = id;
            const currentStrikes = (task.postponeCount || 0) + 1;
            taxStrikeCount.innerText = currentStrikes;
            taxModal.style.display = 'flex';
            // Logic continues in handlePayTax
        },
        complete: (id) => {
            const task = tasks.find(t => t.id === id);
            if (task) task.completed = true;
            saveTasks();
            renderAll();
            // Play sound effect if available
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => {});
        },
        remove: (id) => {
            if(confirm('Delete this task?')) {
                tasks = tasks.filter(t => t.id !== id);
                saveTasks();
                renderAll();
            }
        }
    };
});