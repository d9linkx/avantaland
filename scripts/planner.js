document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const STORAGE_KEY = 'avantaland_planner_tasks';
    const DATE_KEY = 'avantaland_planner_date';
    let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
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
    
    // Modal Elements
    const modal = document.getElementById('task-picker-modal');
    const modalSlotName = document.getElementById('modal-slot-name');
    const modalList = document.getElementById('modal-task-list');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // --- Initialization ---
    const today = new Date();
    const todayStr = today.toDateString();
    dateDisplay.innerText = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    checkEndOfDayPurge(todayStr);
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

    // --- Core Logic ---

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
            backlogTasks.forEach(task => {
                const div = document.createElement('div');
                div.className = 'modal-task-item';
                div.innerText = task.text;
                div.onclick = () => {
                    window.plannerActions.promote(task.id, currentSlotSelection);
                    modal.style.display = 'none';
                };
                modalList.appendChild(div);
            });
        }
        
        modal.style.display = 'flex';
    }

    // Expose actions to global scope for inline onclick handlers
    window.plannerActions = {
        promote: (id, slotType) => {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.status = 'active';
                task.slot = slotType;
                task.postponed = false; // Reset shame marker
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