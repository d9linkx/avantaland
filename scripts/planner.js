document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const STORAGE_KEY = 'avantaland_planner_tasks';
    const DATE_KEY = 'avantaland_planner_date';
    const ENERGY_PROFILE_KEY = 'avantaland_energy_profile';
    let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let energyProfile = JSON.parse(localStorage.getItem(ENERGY_PROFILE_KEY));
    let currentSlotSelection = null; // Tracks which slot is asking for a task

    // --- DOM Elements ---
    const dateDisplay = document.getElementById('date-display');
    const backlogList = document.getElementById('backlog-list');
    const vaultList = document.getElementById('vault-list');
    const primeCountDisplay = document.getElementById('prime-count');
    const input = document.getElementById('new-task-input');
    const addBtn = document.getElementById('add-task-btn');
    const backlogSection = document.getElementById('backlog-section');
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
    
    // Delete Confirmation Modal Elements
    const deleteConfirmModal = document.getElementById('delete-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const deleteTaskText = document.getElementById('delete-task-text');
    let taskToDeleteId = null;

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

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        currentSlotSelection = null;
        // Ensure inbox refreshes after closing the picker modal
        try { refreshInbox(); } catch (e) {}
    });

    whyThreeTasksLink.addEventListener('click', () => {
        explanationModal.style.display = 'flex';
    });

    closeExplanationModalBtn.addEventListener('click', () => {
        explanationModal.style.display = 'none';
        try { refreshInbox(); } catch (e) {}
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (taskToDeleteId) {
            tasks = tasks.filter(t => t.id !== taskToDeleteId);
            saveTasks();
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
        try { refreshInbox(); } catch (e) {}
    });

    saveEnergyBtn.addEventListener('click', handleSaveEnergy);
    payTaxBtn.addEventListener('click', handlePayTax);
    
    document.getElementById('hud-close-btn').addEventListener('click', () => {
        closeHUD();
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
            energyHud.innerHTML = "<i class='ph ph-lightning'></i> High Energy Time";
            energyHud.style.color = "#2979FF"; // Brand's blue color
        } else if (hour >= energyProfile.trough.start && hour < energyProfile.trough.end) {
            body.classList.add('trough-mode');
            energyHud.innerHTML = "<i class='ph ph-moon'></i> Low Energy Time";
            energyHud.style.color = "#0284C7";
        } else {
            energyHud.innerHTML = "<i class='ph ph-battery-charging'></i> Normal Energy";
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
            alert("Try to make this a smaller task. Keep it simple.");
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
        setTimeout(renderAll, 0); // Use a deferred, full render to ensure UI consistency
        input.value = '';
    }

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        // Immediately re-render the UI after saving to ensure Inbox / other sections
        // reflect changes without a full page reload.
        try {
            console.debug('[planner] saveTasks called — tasks.length =', tasks.length);
            // Use requestAnimationFrame to avoid potential reflow/race with event handlers
            // Dispatch a small event so other listeners (including other windows) can react
            try { window.dispatchEvent(new CustomEvent('planner:change', { detail: { count: tasks.length } })); } catch (e) {}
            requestAnimationFrame(() => {
                renderAll();
                // Also ensure backlog is refreshed and visible
                try { refreshInbox(); } catch (e) {}
            });
        } catch (e) {
            // renderAll may not be defined yet during initialization; ignore in that case
        }
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

    // Listen for internal planner change events and refresh the inbox quickly
    window.addEventListener('planner:change', () => {
        try { refreshInbox(); } catch (e) {}
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
        renderBacklog();
        renderVault();
        updateStats();
    }

    function renderSlots() {
        const slotTypes = ['revenue', 'operations', 'development'];
        const slotLabels = {
            revenue: 'Work & Money',
            operations: 'Admin & Chores',
            development: 'Learning & Growth'
        };
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
            label.innerText = slotLabels[type] || type.toUpperCase();
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
                            <button onclick="window.plannerActions.demote(${task.id})" title="Move to Inbox"><i class="ph ph-arrow-u-up-left"></i></button>
                        </div>
                    </div>
                    <div class="task-meta ${task.goalType === 'survival' ? 'survival' : ''}">${task.weight === 'deep' ? '<i class="ph ph-lightning"></i> High Focus' : '<i class="ph ph-coffee"></i> Low Focus'} • ${task.goalType === 'survival' ? 'Maintenance' : 'Growth'}</div>
                `;
                container.appendChild(content);
            } else {
                // Empty State with Icon
                const slotIcons = {
                    revenue: 'ph-briefcase',
                    operations: 'ph-list-checks',
                    development: 'ph-brain'
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

        // Visual Momentum / Victory State
        if (completedCount === 3) {
            document.body.classList.add('victory-state');
            primeCountDisplay.innerText = "All Done!";
            primeCountDisplay.style.color = "#10B981";
        } else {
            document.body.classList.remove('victory-state');
            primeCountDisplay.innerText = `${tasks.filter(t => t.status === 'active').length}/3 Tasks Selected`;
            primeCountDisplay.style.color = "#2979FF";
        }
    }

    function renderBacklog() {
        const backlogEl = document.getElementById('backlog-list');
        if (!backlogEl) {
            console.warn('[planner] renderBacklog: backlog-list element not found');
            return;
        }

        backlogEl.innerHTML = '';
        const backlogTasks = tasks.filter(t => t.status === 'backlog');
        console.debug('[planner] renderBacklog — backlogTasks.length =', backlogTasks.length);

        if (backlogTasks.length === 0) {
            backlogEl.innerHTML = `<div style="text-align:center; color:#94a3b8; padding: 1rem;">Inbox is empty. Add a task above.</div>`;
        } else {
            backlogTasks.forEach(task => {
                const el = document.createElement('div');
                el.className = 'task-item fade-in';
                // Add data-task-id to the span for easy selection during edit
                el.innerHTML = `
                    <span class="task-text" data-task-id="${task.id}">${task.postponeCount > 0 ? `<span style="color:#EF4444; font-weight:bold;">[Delayed ${task.postponeCount}x]</span> ` : ''}${task.text}</span>
                    <div class="task-actions">
                        <button onclick="window.plannerActions.edit(${task.id}, this)" title="Edit"><i class="ph ph-pencil-simple"></i></button>
                        <button onclick="window.plannerActions.remove(${task.id})" title="Delete"><i class="ph ph-trash"></i></button>
                    </div>
                `;
                backlogEl.appendChild(el);
            });
        }
    }

    // Force-refresh the inbox/backlog section. This re-reads storage then re-renders
    // the backlog area and makes sure it's visible. Use this when UI changes come
    // from modal interactions or other non-standard flows.
    function refreshInbox() {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (Array.isArray(stored)) tasks = stored;
        } catch (e) {}

        // Re-render backlog specifically
        try {
            renderBacklog();
            const backlogSec = document.getElementById('backlog-section') || backlogSection;
            const backlogEl = document.getElementById('backlog-list');
            if (backlogSec) backlogSec.style.display = '';
            // Force a reflow so the browser paints the updated backlog immediately
            if (backlogEl) void backlogEl.offsetHeight;
        } catch (e) {
            console.warn('[planner] refreshInbox failed', e);
        }
    }

    function renderVault() {
        vaultList.innerHTML = '';
        // Show completed today and "Cringe Log" (deleted via tax)
        const vaultTasks = tasks.filter(t => (t.status === 'active' && t.completed) || t.status === 'cringe');
        
        if (vaultTasks.length === 0) {
            vaultList.innerHTML = `<div style="text-align:center; color:#94a3b8; padding: 1rem;">No completed tasks yet.</div>`;
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
            renderAll();
        },
        edit: (id, buttonEl) => {
            const taskItem = buttonEl.closest('.task-item');
            const taskTextSpan = taskItem.querySelector(`.task-text[data-task-id="${id}"]`);
            const task = tasks.find(t => t.id === id);

            // Prevent re-clicking edit while already in edit mode
            if (!task || taskItem.querySelector('.edit-task-input')) return;

            const originalText = task.text;
            
            // Replace span content with an input field
            taskTextSpan.innerHTML = `<input type="text" class="edit-task-input" value="${originalText}" />`;
            
            const input = taskTextSpan.querySelector('input');
            input.focus();
            input.select();

            const saveEdit = () => {
                const newText = input.value.trim();
                if (newText && newText !== originalText) {
                    task.text = newText;
                    saveTasks();
                }
                // Defer the render call slightly. This prevents a potential race condition in some browsers
                // where the 'blur' event's target element is destroyed by the render function
                // before the event handling is fully complete, causing the UI update to fail.
                setTimeout(renderAll, 0);
            };

            input.addEventListener('blur', saveEdit);
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') input.blur(); });
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
            if (task) {
                task.completed = true;
                task.completedAt = new Date().toISOString();
            }
            saveTasks();
            renderAll();
            // Play sound effect if available
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => {});
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
        }
    };
});