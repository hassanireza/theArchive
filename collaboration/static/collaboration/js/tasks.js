document.addEventListener("DOMContentLoaded", function () {

    const SVG_SUN  = `<circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1"  x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1"     y1="12"    x2="3"     y2="12"/>
        <line x1="21"    y1="12"    x2="23"    y2="12"/>
        <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
        <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>`;
    const SVG_MOON = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        const icon = document.getElementById("themeIcon");
        if (icon) icon.innerHTML = theme === "dark" ? SVG_SUN : SVG_MOON;
    }

    const initTheme =
        localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    applyTheme(initTheme);

    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const current = document.documentElement.getAttribute("data-theme") || "light";
            applyTheme(current === "dark" ? "light" : "dark");
        });
    }


    function getCookie(name) {
        if (!document.cookie) return null;
        for (const raw of document.cookie.split(";")) {
            const cookie = raw.trim();
            if (cookie.startsWith(name + "=")) {
                return decodeURIComponent(cookie.substring(name.length + 1));
            }
        }
        return null;
    }

    const csrftoken = getCookie("csrftoken");

    function post(url, body) {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken,
            },
            body: JSON.stringify(body),
        });
    }

    const COLUMNS = {
        todo:        { ul: "todo",        count: "count-todo",   empty: "empty-todo"   },
        in_progress: { ul: "in_progress", count: "count-inprog", empty: "empty-inprog" },
        done:        { ul: "done",        count: "count-done",   empty: "empty-done"   },
    };


    function updateCountsAndEmpties() {
        for (const [, cfg] of Object.entries(COLUMNS)) {
            const ul      = document.getElementById(cfg.ul);
            const countEl = document.getElementById(cfg.count);
            const emptyEl = document.getElementById(cfg.empty);
            if (!ul) continue;

            const n = ul.querySelectorAll("li.task").length;
            if (countEl) countEl.textContent = n;
            if (emptyEl) emptyEl.style.display = n === 0 ? "flex" : "none";
        }
    }

   


    function springTo(element, dx, dy) {
        if (element._springFrame) cancelAnimationFrame(element._springFrame);

        let posX = dx, posY = dy;
        let velX = 0,  velY = 0;

        const stiffness = 0.08;
        const damping   = 0.80;
        const precision = 0.5;

        function animate() {
            velX = damping * (velX - stiffness * posX);
            velY = damping * (velY - stiffness * posY);
            posX += velX;
            posY += velY;

            element.style.transform = `translate(${posX}px, ${posY}px)`;

            if (Math.abs(posX) > precision || Math.abs(posY) > precision) {
                element._springFrame = requestAnimationFrame(animate);
            } else {
                element.style.transform = "";
                element._springFrame = null;
            }
        }

        element._springFrame = requestAnimationFrame(animate);
    }

    function flipAnimate(callback) {
        const first = new Map();
        document.querySelectorAll(".task").forEach(el => {
            first.set(el.id, el.getBoundingClientRect());
        });

        callback();

        document.querySelectorAll(".task").forEach(el => {
            const prev = first.get(el.id);
            if (!prev) return;
            const last = el.getBoundingClientRect();
            const dx = prev.left - last.left;
            const dy = prev.top  - last.top;
            if (dx || dy) springTo(el, dx, dy);
        });
    }


    let draggedTask = null;


    function renderTaskList(tasks) {
        for (const cfg of Object.values(COLUMNS)) {
            const ul = document.getElementById(cfg.ul);
            if (ul) ul.innerHTML = "";
        }
        tasks.forEach(task => addTaskToDOM(task));
        updateCountsAndEmpties();
    }

    function addTaskToDOM(task) {
        const cfg = COLUMNS[task.status];
        const ul  = cfg ? document.getElementById(cfg.ul) : null;
        if (!ul) return;

        const li = document.createElement("li");
        li.className  = "task";
        li.id         = "task-" + task.id;
        li.draggable  = true;

        const textSpan = document.createElement("span");
        textSpan.className   = "task-text";
        textSpan.textContent = task.title;
        textSpan.title       = "Click to advance status";
        textSpan.addEventListener("click", () => toggleStatus(task));

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "task-btn del";
        deleteBtn.title     = "Delete task";
        deleteBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>`;
        deleteBtn.addEventListener("click", e => {
            e.stopPropagation();
            deleteTask(task.id);
        });

        const actions = document.createElement("div");
        actions.className = "task-actions";
        actions.appendChild(deleteBtn);

        li.appendChild(textSpan);
        li.appendChild(actions);

        li.addEventListener("dragstart", () => {
            li.classList.add("dragging");
            draggedTask = task;
        });
        li.addEventListener("dragend", () => {
            li.classList.remove("dragging");
            draggedTask = null;
        });

        ul.appendChild(li);
    }

    function updateTaskInDOM(task) {
        flipAnimate(() => {
            const existing = document.getElementById("task-" + task.id);
            if (existing) existing.remove();
            addTaskToDOM(task);
        });
        updateCountsAndEmpties();
    }


    async function loadTasks() {
        try {
            const res   = await fetch("/api/tasks/");
            const tasks = await res.json();
            renderTaskList(tasks);
        } catch (err) {
            console.error("[Archive] loadTasks failed:", err);
        }
    }



    async function createTask() {
        const input = document.getElementById("taskInput");
        if (!input || !input.value.trim()) return;

        try {
            await post("/api/tasks/create/", {
                title:       input.value.trim(),
                description: "",
                status:      "todo",
            });
            input.value = "";
            await loadTasks();
        } catch (err) {
            console.error("[Archive] createTask failed:", err);
        }
    }

    async function toggleStatus(task) {
        const cycle = { todo: "in_progress", in_progress: "done", done: "todo" };
        const newStatus = cycle[task.status] || "todo";

        try {
            await post("/api/tasks/update/", { id: task.id, status: newStatus });
            await loadTasks();
        } catch (err) {
            console.error("[Archive] toggleStatus failed:", err);
        }
    }

    async function deleteTask(taskId) {
        try {
            await post("/api/tasks/delete/", { id: taskId });
            await loadTasks();
        } catch (err) {
            console.error("[Archive] deleteTask failed:", err);
        }
    }


    document.querySelectorAll(".column ul").forEach(col => {
        col.addEventListener("dragover", e => e.preventDefault());

        col.addEventListener("drop", async () => {
            if (!draggedTask || draggedTask.status === col.id) return;
            try {
                await post("/api/tasks/update/", { id: draggedTask.id, status: col.id });
                await loadTasks();
            } catch (err) {
                console.error("[Archive] drag-drop update failed:", err);
            }
        });
    });


    const createBtn = document.getElementById("createBtn");
    if (createBtn) createBtn.addEventListener("click", createTask);

    const taskInput = document.getElementById("taskInput");
    if (taskInput) {
        taskInput.addEventListener("keydown", e => {
            if (e.key === "Enter") createTask();
        });
    }


    loadTasks();
});