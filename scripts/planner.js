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
    const primeCountDisplay = document.getElementById('prime-count');
    const input = document.getElementById('new-task-input');
    const addBtn = document.getElementById('add-task-btn');
    const focusBtn = document.getElementById('focus-mode-btn');
    const backlogSection = document.getElementById('backlog-section');
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
            backlogSection.style.opacity = '0';
            setTimeout(() => backlogSection.style.display = 'none', 300); // Smooth fade out
            focusBtn.classList.add('active');
            focusBtn.innerHTML = '<span class="icon">🔓</span> Exit Focus';
        } else {
            backlogSection.style.display = 'block';
            setTimeout(() => backlogSection.style.opacity = '1', 10);
            focusBtn.classList.remove('active');
            focusBtn.innerHTML = '<span class="icon">👁️</span> Focus Mode';
        }
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        currentSlotSelection = null;
    });

    saveEnergyBtn.addEventListener('click', handleSaveEnergy);

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
            energyHud.innerHTML = "⚡ PEAK ZONE: DEEP WORK ONLY";
            energyHud.style.color = "#FFD600";
        } else if (hour >= energyProfile.trough.start && hour < energyProfile.trough.end) {
            body.classList.add('trough-mode');
            energyHud.innerHTML = "💤 TROUGH ZONE: ADMIN & RECOVERY";
            energyHud.style.color = "#0284C7";
        } else {
            energyHud.innerHTML = "🔋 RECOVERY ZONE";
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
                            ${!task.completed ? `<button onclick="window.plannerActions.complete(${task.id})" title="Complete">✅</button>` : ''}
                            <button onclick="window.plannerActions.demote(${task.id})" title="Kick back to backlog">↩️</button>
                        </div>
                    </div>
                    <div class="task-meta">${task.weight === 'deep' ? '⚡ Deep Work' : '☕ Shallow Work'} • Scheduled: ${task.scheduledTime}</div>
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
                    <span class="task-text">${task.postponed ? '⚠️ ' : ''}${task.text}</span>
                    <div class="task-actions">
                        <button onclick="window.plannerActions.remove(${task.id})" title="Delete">🗑️</button>
                    </div>
                `;
                backlogList.appendChild(el);
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
                            ⚡ Deep (Heavy)
                        </button>
                        <button class="btn-weight" onclick="window.plannerActions.promote(${task.id}, '${currentSlotSelection}', 'shallow')">
                            ☕ Shallow (Light)
                        </button>
                    </div>
                `;
                modalList.appendChild(div);
            });
        }
        
        modal.style.display = 'flex';
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
            if (task) {
                task.status = 'backlog';
                task.slot = null;
                task.completed = false; // Reset completion if moved back
            }
            saveTasks();
            renderAll();
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