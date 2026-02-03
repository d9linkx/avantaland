document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const STORAGE_KEY = 'avantaland_planner_tasks';
    const DATE_KEY = 'avantaland_planner_date';
    const ENERGY_PROFILE_KEY = 'avantaland_energy_profile';
    const SLOT_ORDER_KEY = 'avantaland_planner_slotOrder';
    let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let energyProfile = JSON.parse(localStorage.getItem(ENERGY_PROFILE_KEY));
    let slotOrder = JSON.parse(localStorage.getItem(SLOT_ORDER_KEY)) || ['revenue', 'operations', 'development'];
    let currentSlotSelection = null; // Tracks which slot is asking for a task

    // --- DOM Elements ---
    const dateDisplay = document.getElementById('date-display');
    const slotsContainer = document.querySelector('.slots-container');
    const vaultList = document.getElementById('vault-list');
    const primeCountDisplay = document.getElementById('prime-count');
    const vaultSection = document.getElementById('vault-section');
    const energyHud = document.getElementById('energy-hud');
    
    // Modal Elements
    const modal = document.getElementById('task-picker-modal');
    const modalSlotName = document.getElementById('modal-slot-name');
    const modalList = document.getElementById('modal-task-list');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Explanation Modal Elements
    const whyThreeTasksLink = document.getElementById('why-three-tasks-link');
    const explanationModal = document.getElementById('explanation-modal');
    const closeExplanationModalBtn = document.getElementById('close-explanation-modal-btn');
    
    // Complete Confirmation Modal Elements
    const completeConfirmModal = document.getElementById('complete-confirm-modal');
    const confirmCompleteBtn = document.getElementById('confirm-complete-btn');
    const cancelCompleteBtn = document.getElementById('cancel-complete-btn');
    const completeTaskText = document.getElementById('complete-task-text');
    let taskToCompleteId = null;

    // Delete Confirmation Modal Elements
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const deleteTaskText = document.getElementById('delete-task-text');
    let taskToDeleteId = null;

    // Duration Edit Modal Elements
    const durationEditModal = document.getElementById('duration-edit-modal');
    const durationInputModal = document.getElementById('duration-input-modal');
    const durationTaskText = document.getElementById('duration-task-text');
    const saveDurationBtn = document.getElementById('save-duration-btn');
    const cancelDurationBtn = document.getElementById('cancel-duration-btn');
    let taskToEditDurationId = null;

    // Text Edit Modal Elements
    const textEditModal = document.getElementById('text-edit-modal');
    const textInputModal = document.getElementById('text-input-modal');
    const saveTextBtn = document.getElementById('save-text-btn');
    const cancelTextBtn = document.getElementById('cancel-text-btn');
    let taskToEditTextId = null;

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
    const cancelTaxBtn = document.getElementById('cancel-tax-btn'); // New element
    const taxStrikeCount = document.getElementById('tax-strike-count');
    let taskToTaxId = null;

    // HUD Elements
    const hudOverlay = document.getElementById('hud-overlay');
    const hudTaskText = document.getElementById('hud-task-text');
    const hudTimerToggle = document.getElementById('hud-timer-toggle');
    
    // Main Timer Elements
    const mainTimerDisplay = document.getElementById('main-timer');
    let mainTimerInterval = null;
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
    updateMainTimerDisplay(); // Set initial timer state

    // --- Event Listeners ---
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        currentSlotSelection = null;
    });

    whyThreeTasksLink.addEventListener('click', () => {
        explanationModal.style.display = 'flex';
    });

    closeExplanationModalBtn.addEventListener('click', () => {
        explanationModal.style.display = 'none';
    });

    saveDurationBtn.addEventListener('click', () => {
        if (taskToEditDurationId) {
            const task = tasks.find(t => t.id === taskToEditDurationId);
            const newMinutes = parseInt(durationInputModal.value, 10);
            if (task && !isNaN(newMinutes) && newMinutes > 0) {
                task.duration = newMinutes * 60;
                if (task.isOngoing && !mainTimerInterval) {
                    hudTimeLeft = task.duration;
                }
                saveTasks();
                renderAll();
            }
        }
        durationEditModal.style.display = 'none';
        taskToEditDurationId = null;
    });

    cancelDurationBtn.addEventListener('click', () => {
        durationEditModal.style.display = 'none';
        taskToEditDurationId = null;
    });

    saveTextBtn.addEventListener('click', () => {
        if (taskToEditTextId) {
            const task = tasks.find(t => t.id === taskToEditTextId);
            const newText = textInputModal.value.trim();
            if (task && newText) {
                task.text = newText;
                saveTasks();
                renderAll();
            }
        }
        textEditModal.style.display = 'none';
        taskToEditTextId = null;
    });

    cancelTextBtn.addEventListener('click', () => {
        textEditModal.style.display = 'none';
        taskToEditTextId = null;
    });

    confirmCompleteBtn.addEventListener('click', () => {
        if (taskToCompleteId) {
            const task = tasks.find(t => t.id === taskToCompleteId);
            if (task) {
                task.completed = true;
                task.completedAt = new Date().toISOString();
            }
            saveTasks();
            // Play sound effect
            renderAll();
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => {});
        }
        completeConfirmModal.style.display = 'none';
        taskToCompleteId = null;
    });

    cancelCompleteBtn.addEventListener('click', () => {
        completeConfirmModal.style.display = 'none';
        taskToCompleteId = null;
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (taskToDeleteId) {
            tasks = tasks.filter(t => t.id !== taskToDeleteId);
            saveTasks();
            renderAll();
        }
        deleteConfirmModal.style.display = 'none';
        taskToDeleteId = null;
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteConfirmModal.style.display = 'none';
        taskToDeleteId = null;
    });

    document.getElementById('close-vault-modal-btn').addEventListener('click', () => {
        document.getElementById('vault-detail-modal').style.display = 'none';
    });

    saveEnergyBtn.addEventListener('click', handleSaveEnergy);
    payTaxBtn.addEventListener('click', handlePayTax);
    
    cancelTaxBtn.addEventListener('click', () => { // New listener
        taxModal.style.display = 'none';
        taskToTaxId = null;
    });
    
    document.getElementById('hud-close-btn').addEventListener('click', () => {
        closeHUD();
    });

    // --- Drag and Drop for Priority Slots ---
    let draggedSlotType = null;

    slotsContainer.addEventListener('dragstart', e => {
        if (e.target.classList.contains('mission-slot')) {
            draggedSlotType = e.target.dataset.type;
            setTimeout(() => { e.target.classList.add('dragging'); }, 0);
        }
    });

    slotsContainer.addEventListener('dragend', e => {
        if (e.target.classList.contains('mission-slot')) {
            e.target.classList.remove('dragging');
        }
        draggedSlotType = null;
        const indicators = slotsContainer.querySelectorAll('.drag-over-indicator');
        indicators.forEach(ind => ind.remove());
    });

    slotsContainer.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(slotsContainer, e.clientY);
        const indicators = slotsContainer.querySelectorAll('.drag-over-indicator');
        indicators.forEach(ind => ind.remove());
        
        const indicator = document.createElement('div');
        indicator.className = 'drag-over-indicator';

        if (afterElement == null) {
            slotsContainer.appendChild(indicator);
        } else {
            slotsContainer.insertBefore(indicator, afterElement);
        }
    });

    slotsContainer.addEventListener('drop', e => {
        e.preventDefault();
        if (!draggedSlotType) return;
        
        const afterElement = getDragAfterElement(slotsContainer, e.clientY);
        const currentOrder = Array.from(slotsContainer.children)
            .filter(c => c.classList.contains('mission-slot'))
            .map(c => c.dataset.type);

        const draggedIndex = currentOrder.indexOf(draggedSlotType);
        if (draggedIndex > -1) currentOrder.splice(draggedIndex, 1);

        if (afterElement == null) {
            currentOrder.push(draggedSlotType);
        } else {
            const afterSlotType = afterElement.dataset.type;
            const dropIndex = currentOrder.indexOf(afterSlotType);
            currentOrder.splice(dropIndex, 0, draggedSlotType);
        }

        slotOrder = currentOrder;
        saveSlotOrder();
        renderAll();
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.mission-slot:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }


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
            energyHud.innerText = "Peak Energy Zone";
            energyHud.style.color = "var(--color-blue)";
        } else if (hour >= energyProfile.trough.start && hour < energyProfile.trough.end) {
            body.classList.add('trough-mode');
            energyHud.innerText = "Trough Energy Zone";
            energyHud.style.color = "var(--text-muted)";
        } else {
            energyHud.innerText = "Normal Energy";
            energyHud.style.color = "var(--text-muted)";
        }

        // Header Pulse Logic - must run AFTER body class is set
        const header = document.querySelector('.planner-header');
        const topTask = tasks.find(t => t.slot === slotOrder[0] && !t.completed);

        if (body.classList.contains('peak-mode') && topTask && topTask.weight === 'deep') {
            header.classList.add('header-pulse');
        } else {
            header.classList.remove('header-pulse');
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

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function saveSlotOrder() {
        localStorage.setItem(SLOT_ORDER_KEY, JSON.stringify(slotOrder));
    }

    // Listen for storage events (other tabs/windows) and sync UI immediately
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            try {
                tasks = JSON.parse(e.newValue) || [];
            } catch (err) {
                tasks = [];
            }
            renderAll();
        }
    });

    function renderAll() {
        // Rehydrate tasks from localStorage to ensure we're rendering the latest
        // data (covers cases where other code or flows wrote directly to storage).
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (Array.isArray(stored)) tasks = stored;
        } catch (e) {
            // Ignore parse errors and use in-memory tasks
        }

        renderSlots();
        renderVault();
        updateMainTimerDisplay();
        updateStats();
    }

    function renderSlots() {
        const slotLabels = {
            revenue: 'Work & Money',
            operations: 'Admin & Chores',
            development: 'Learning & Growth'
        };

        const activeTasks = tasks.filter(t => t.status === 'active');
        const visibleInSlots = activeTasks.filter(t => !t.completed);
        const completedCount = activeTasks.length - visibleInSlots.length;

        let cumulativeEndTime = new Date();

        slotOrder.forEach(type => {
            const container = document.getElementById(`slot-${type}`);
            const task = visibleInSlots.find(t => t.slot === type); // Find from visible tasks
            
            container.innerHTML = ''; // Clear
            container.setAttribute('draggable', 'true');
            container.className = `mission-slot`; // Reset class
            container.dataset.type = type; // Ensure type attr

            if (task) {
                container.classList.add('filled');

                const isTopTask = task.slot === slotOrder[0];

                if (isTopTask) {
                    container.classList.add('slot-active');
                } else {
                    container.classList.add('slot-queued');
                }

                // --- Geometric Icons ---
                const iconHtml = task.weight === 'deep' 
                    ? '<i class="ph ph-lightning-fill slot-icon-large"></i>' // Bolt for Deep
                    : '<i class="ph ph-paper-plane-tilt-fill slot-icon-large"></i>'; // Plane for Shallow

                // Time Calculation & Display
                task.startTime = new Date(cumulativeEndTime.getTime());
                task.endTime = new Date(cumulativeEndTime.getTime() + (task.duration || 1500) * 1000);
                cumulativeEndTime = task.endTime;
                let startTimeDisplay = '';
                if (!isTopTask) {
                    startTimeDisplay = `<span class="task-start-time">Starts at ${task.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
                }

                const displayText = task.text.length > 40 ? task.text.substring(0, 40) + '...' : task.text;

                const content = document.createElement('div');
                content.style.width = '100%';
                content.innerHTML = `
                    <div class="task-header-row" style="margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                        <span class="slot-label" style="margin:0;">${slotLabels[type] || 'Task'}</span>
                        ${iconHtml}
                    </div>
                    <div class="task-main-row" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                        <span data-task-id="${task.id}" style="font-weight:600; font-size:1.1rem; flex-grow: 1; margin-right: 1rem;">${displayText}</span>
                    </div>
                    <div class="task-meta-controls" style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <button class="btn-adjust-time" onclick="window.plannerActions.adjustTime(${task.id}, -5)" title="-5 min">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/></svg>
                            </button>
                            <span class="task-duration" onclick="window.plannerActions.editDuration(${task.id})">
                                <i class="ph ph-timer"></i> ${Math.floor((task.duration || 1500) / 60)} min
                            </span>
                            <button class="btn-adjust-time" onclick="window.plannerActions.adjustTime(${task.id}, 5)" title="+5 min">
                                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                            </button>
                        </div>
                        <div class="task-actions" style="display: flex; align-items: center; gap: 0.75rem;">
                            ${startTimeDisplay}
                            <button class="btn-skip-task" onclick="window.plannerActions.skipTask(${task.id})" title="Skip Task"><i class="ph ph-fast-forward"></i></button>
                            <button class="btn-start-task ${task.isOngoing && mainTimerInterval ? 'paused' : ''}" onclick="window.plannerActions.playPause(${task.id})">
                                ${isTopTask ? (task.isOngoing ? (mainTimerInterval ? 'Pause' : 'Resume') : 'Start') : 'Queued'}
                            </button>
                        </div>
                    </div>
                    <div class="task-actions" style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05);">
                        <button onclick="window.plannerActions.edit(${task.id})" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                        <button onclick="window.plannerActions.remove(${task.id})" title="Delete"><i class="ph ph-trash"></i></button>
                        <button onclick="window.plannerActions.complete(${task.id})" title="Complete" class="action-btn-complete"><i class="ph ph-check-circle"></i></button>
                    </div>
                `;
                container.appendChild(content);
            } else {
                // Empty Slot
                const label = document.createElement('div');
                label.className = 'slot-label';
                label.innerText = slotLabels[type] || type.toUpperCase();
                container.appendChild(label); // Add label for empty state
                const slotIcons = {
                    revenue: 'ph-briefcase', operations: 'ph-list-checks', development: 'ph-brain'
                };
                const iconClass = slotIcons[type] || 'ph-plus-circle';
                const icon = document.createElement('i');
                icon.className = `ph ${iconClass} slot-empty-icon`;
                container.appendChild(icon);
                const btn = document.createElement('button');
                btn.className = 'btn-fill-slot';
                btn.innerText = '+ Select Task';
                btn.onclick = () => openTaskPicker(type);
                container.appendChild(btn);
            }
        });

        renderTimeGaps(visibleInSlots);

        // Visual Momentum / Victory State
        if (completedCount >= 3 && visibleInSlots.length === 0) {
            document.body.classList.add('victory-state');
            primeCountDisplay.innerText = "All Done!";
            primeCountDisplay.style.color = "#10B981";
        } else {
            document.body.classList.remove('victory-state');
            primeCountDisplay.innerText = `${activeTasks.length}/3 Tasks Selected`;
            primeCountDisplay.style.color = "#2979FF";
        }
    }

    function renderTimeGaps(visibleTasks) {
        if (!visibleTasks) return; // Guard against undefined array
        // Clear old gaps
        document.querySelectorAll('.time-gap-visualizer').forEach(el => el.remove());

        const slots = slotOrder.map(type => document.getElementById(`slot-${type}`));
        for (let i = 0; i < slots.length - 1; i++) {
            const topSlot = slots[i];
            const task = visibleTasks.find(t => t.slot === topSlot.dataset.type);
            if (task && task.endTime) {
                const gapEl = document.createElement('div');
                gapEl.className = 'time-gap-visualizer';
                gapEl.innerHTML = `
                    <div style="flex-grow: 1; height: 2px; background: var(--color-blue); opacity: 0.2;"></div>
                    <span>${task.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                `;
                topSlot.after(gapEl);
            }
        }
    }

    function renderVault() {
        vaultList.innerHTML = '';
        const vaultTasks = tasks.filter(t => (t.status === 'active' && t.completed) || t.status === 'cringe');
        
        if (vaultTasks.length === 0) {
            vaultList.innerHTML = `
                <div class="empty-state-illustration" style="text-align: center; padding: 2rem 0;">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15L12 18" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round"/><path d="M12 6V12" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round"/><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#CBD5E1" stroke-width="1.5"/></svg>
                    <p style="color: var(--text-muted); font-weight: 600; margin-top: 1rem;">No history yet.</p>
                    <p style="font-size: 0.9rem; color: var(--text-muted);">Complete a priority task to see it here.</p>
                </div>`;
        } else {
            vaultTasks.forEach(task => {
                const el = document.createElement('div');
                el.className = 'task-item fade-in vault-item';
                el.style.opacity = '0.7';
                el.onclick = () => window.plannerActions.showVaultDetails(task.id);
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
        modalList.innerHTML = `
            <div class="input-group" style="margin-bottom: 1rem;">
                <input type="text" id="new-slot-task-input" placeholder="Enter new task description..." autocomplete="off" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-light);">
            </div>
            <p style="margin-bottom:1rem; font-size:0.9rem;">Select its cognitive weight:</p>
            <div class="weight-selection">
                <button class="btn-weight" id="add-deep-task-btn">
                    <i class="ph ph-lightning"></i> High Focus
                </button>
                <button class="btn-weight" id="add-shallow-task-btn">
                    <i class="ph ph-coffee"></i> Low Focus
                </button>
            </div>
        `;
        
        const input = modalList.querySelector('#new-slot-task-input');
        const addDeepBtn = modalList.querySelector('#add-deep-task-btn');
        const addShallowBtn = modalList.querySelector('#add-shallow-task-btn');

        const addTaskToSlot = (weight) => {
            const text = input.value.trim();
            if (!text) {
                alert('Please enter a task.');
                return;
            }
            const newTask = {
                id: Date.now(),
                text: text,
                status: 'backlog', // Will be promoted immediately
                slot: null,
                postponeCount: 0,
                createdAt: new Date().toISOString(),
                duration: 1500, // Default 25 minutes
                isOngoing: false,
            };
            tasks.push(newTask);
            window.plannerActions.promote(newTask.id, slotType, weight);
        };

        addDeepBtn.onclick = () => addTaskToSlot('deep');
        addShallowBtn.onclick = () => addTaskToSlot('shallow');
        modal.style.display = 'flex';
    }

    // --- Tax System ---
    function handlePayTax() {
        const reflection = taxReflection.value.trim();
        if (!reflection) {
            alert("Please enter a reason.");
            return;
        }
        
        const task = tasks.find(t => t.id === taskToTaxId);
        if (task) {
            task.postponeCount = (task.postponeCount || 0) + 1;
            task.reflection = reflection; // Save reflection
            
            if (task.postponeCount >= 3) {
                task.status = 'cringe'; // Move to Cringe Log
                task.slot = null;
                alert("Task removed due to too many delays.");
            } else {
                task.status = 'backlog';
                task.slot = null;
                task.completed = false;
            }
        }
        
        saveTasks();
        setTimeout(renderAll, 0); // Use a deferred render for consistency
        taxModal.style.display = 'none';
        taxReflection.value = '';
    }

    // --- HUD System ---
    function openHUD() {
        const activeTask = tasks.find(t => t.status === 'active' && !t.completed);
        if (activeTask) {
            hudTaskText.innerText = activeTask.text;
        } else {
            hudTaskText.innerText = "No Active Task";
        }
        hudOverlay.style.display = 'flex';
    }

    function closeHUD() {
        hudOverlay.style.display = 'none';
        clearInterval(hudTimerInterval);
        hudTimerInterval = null;
    }

    function updateMainTimerDisplay() {
        const ongoingTask = tasks.find(t => t.isOngoing);
        // If a task is ongoing, use its time. Otherwise, show the default.
        const timeToShow = ongoingTask ? hudTimeLeft : 25 * 60;
        
        const m = Math.floor(timeToShow / 60).toString().padStart(2, '0');
        const s = (timeToShow % 60).toString().padStart(2, '0');
        mainTimerDisplay.innerText = `${m}:${s}`;

        if (ongoingTask && timeToShow < 60) {
            mainTimerDisplay.classList.add('urgent');
        } else {
            mainTimerDisplay.classList.remove('urgent');
        }
    }

    // --- Main Timer Logic ---
    function toggleMainTimer() {
        if (mainTimerInterval) {
            clearInterval(mainTimerInterval);
            mainTimerInterval = null;
            renderAll(); // Re-render to update button text
        } else {
            mainTimerInterval = setInterval(() => {
                hudTimeLeft--;
                updateMainTimerDisplay();
                if (hudTimeLeft <= 0) {
                    clearInterval(mainTimerInterval);
                    mainTimerInterval = null;
                    
                    const finishedTask = tasks.find(t => t.isOngoing);
                    if(finishedTask) {
                        // Auto-complete without modal
                        finishedTask.completed = true;
                        finishedTask.completedAt = new Date().toISOString();
                        finishedTask.isOngoing = false;
                        saveTasks();
                        renderAll(); // Rerender to show completion and shift
                        // Auto-start next task
                        setTimeout(() => {
                            const newTopTask = tasks.find(t => t.slot === slotOrder[0] && !t.completed);
                            if (newTopTask) window.plannerActions.playPause(newTopTask.id, true);
                        }, 500);
                    }
                }
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
                const isStrategic = confirm("Is this task for long-term growth?\nOK = Yes (Growth)\nCancel = No (Maintenance)");
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
            setTimeout(renderAll, 0);
        },
        edit: (id) => {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            taskToEditTextId = id;
            textInputModal.value = task.text;
            textEditModal.style.display = 'flex';
            setTimeout(() => textInputModal.focus(), 50);
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
            if (task && !task.completed) {
                taskToCompleteId = id;
                completeTaskText.innerText = task.text;
                completeConfirmModal.style.display = 'flex';
            }
        },
        remove: (id) => {
            const task = tasks.find(t => t.id === id);
            if (task) {
                taskToDeleteId = id;
                deleteTaskText.innerText = task.text;
                deleteConfirmModal.style.display = 'flex';
            }
        },
        showVaultDetails: (id) => {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            const modal = document.getElementById('vault-detail-modal');
            const content = document.getElementById('vault-detail-content');
            
            let detailsHtml = `
                <h4 style="font-size: 1.2rem; margin-bottom: 1.5rem; line-height: 1.4;">${task.text}</h4>
                <div class="vault-detail-grid">
                    <div><strong>Status:</strong> ${task.status === 'cringe' ? '<span style="color: #EF4444;">Deleted</span>' : '<span style="color: #10B981;">Completed</span>'}</div>
                    <div><strong>Category:</strong> ${task.slot ? task.slot.charAt(0).toUpperCase() + task.slot.slice(1) : 'N/A'}</div>
                    <div><strong>Effort:</strong> ${task.weight === 'deep' ? 'High Focus' : 'Low Focus'}</div>
                    <div><strong>Type:</strong> ${task.goalType === 'survival' ? 'Maintenance' : 'Growth'}</div>
                </div>
            `;

            if (task.completedAt) {
                detailsHtml += `<p style="margin-top: 1.5rem; font-size: 0.9rem; color: var(--text-muted);"><strong>Completed On:</strong> ${new Date(task.completedAt).toLocaleString()}</p>`;
            }
            
            if (task.reflection) {
                 detailsHtml += `
                    <div style="margin-top: 1rem; padding: 1rem; background: #FFFBE6; border-radius: 8px; border: 1px solid #FFE58F;">
                        <p style="font-weight: 600; margin-bottom: 0.5rem;">Reason for previous delay:</p>
                        <p style="font-style: italic; color: #57534E;">"${task.reflection}"</p>
                    </div>
                `;
            }

            content.innerHTML = detailsHtml;
            modal.style.display = 'flex';
        },
        editDuration: (id) => {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            taskToEditDurationId = id;
            durationTaskText.innerText = task.text;
            durationInputModal.value = Math.floor((task.duration || 1500) / 60);
            durationEditModal.style.display = 'flex';
        },
        playPause: (id, forcePlay = false) => {
            const clickedTask = tasks.find(t => t.id === id);
            // Only the top task can be played
            if (!clickedTask || clickedTask.slot !== slotOrder[0]) return;

            const isAlreadyOngoing = clickedTask.isOngoing;

            // Unset all other tasks to enforce sequential engine
            tasks.forEach(task => {
                if (task.id !== id) task.isOngoing = false;
            });

            clickedTask.isOngoing = true;

            if (!isAlreadyOngoing || forcePlay) {
                // This is a new task being started. Reset timer to its duration.
                hudTimeLeft = clickedTask.duration || 1500;
                if (mainTimerInterval) { // Clear any old timer
                    clearInterval(mainTimerInterval);
                    mainTimerInterval = null;
                }
            }

            toggleMainTimer();
            saveTasks();
            renderAll();
        },
        adjustTime: (id, minutes) => {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            const newDuration = (task.duration || 1500) + (minutes * 60);
            task.duration = newDuration > 60 ? newDuration : 60; // Min 1 minute

            // If it's the currently running task, adjust its timer too
            if (task.isOngoing) {
                hudTimeLeft += (minutes * 60);
                if (hudTimeLeft < 0) hudTimeLeft = 0;
            }

            saveTasks();
            renderAll();
        },
        skipTask: (id) => {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            const slotType = task.slot;
            const index = slotOrder.indexOf(slotType);

            if (index > -1) {
                // If it was the running task, stop the timer
                if (task.isOngoing && mainTimerInterval) {
                    clearInterval(mainTimerInterval);
                    mainTimerInterval = null;
                    task.isOngoing = false;
                }

                slotOrder.splice(index, 1);
                slotOrder.push(slotType); // Move to the end
                saveSlotOrder();
                saveTasks();
                renderAll();
            }
        }
    };
});