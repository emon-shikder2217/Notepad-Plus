document.addEventListener("DOMContentLoaded", () => {
    const createNoteBtn = document.getElementById("create-note");
    const notesContainer = document.getElementById("notes-container");
    const themeIcon = document.getElementById("theme-icon");
    const savePopup = document.getElementById("save-popup");
    const popupTitle = document.getElementById("popup-title");
    const popupTags = document.getElementById("popup-tags");
    const popupStats = document.getElementById("popup-stats");
    const popupSaveBtn = document.getElementById("popup-save");
    const popupDownloadBtn = document.getElementById("popup-download");
    const popupCancelBtn = document.getElementById("popup-cancel");

    // Theme Handling
    const loadTheme = () => {
        const theme = localStorage.getItem("theme") || "light";
        document.body.classList.toggle("dark-theme", theme === "dark");
        themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    };

    const toggleTheme = () => {
        const isDark = document.body.classList.toggle("dark-theme");
        themeIcon.textContent = isDark ? "☀️" : "🌙";
        localStorage.setItem("theme", isDark ? "dark" : "light");
    };

    themeIcon.addEventListener("click", toggleTheme);
    loadTheme();

    // Load saved notes
    const loadNotes = () => {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
        notes.forEach(note => createNoteElement(note.title, note.text, note.tags, note.id));
    };

    const saveNotesToLocalStorage = () => {
        const notes = Array.from(document.querySelectorAll(".note")).map(note => ({
            id: note.dataset.id,
            title: note.querySelector("input").value,
            text: note.querySelector("textarea").value,
            tags: note.dataset.tags ? note.dataset.tags.split(",") : []
        }));
        localStorage.setItem("notes", JSON.stringify(notes));
    };

    const updateStats = (note) => {
        const text = note.querySelector("textarea").value;
        const words = text.split(/\s+/).filter(word => word.length > 0).length;
        const chars = text.length;
        const lastEdited = new Date().toLocaleString();
        note.querySelector(".stats").textContent = `Words: ${words} | Chars: ${chars} | Last Edited: ${lastEdited}`;
    };

    const createNoteElement = (title = "Untitled", text = "", tags = [], id = Date.now()) => {
        const note = document.createElement("div");
        note.classList.add("note");
        note.dataset.id = id;
        note.dataset.tags = tags.join(",");

        note.innerHTML = `
            <div class="note-content">
                <input type="text" value="${title}" placeholder="Note Title" />
                <textarea>${text}</textarea>
                <div class="stats"></div>
                <div class="actions">
                    <button class="save">Save <i class="bx bx-save"></i></button>
                    <button class="delete">Delete <i class="bx bx-trash"></i></button>
                </div>
            </div>
        `;

        const textarea = note.querySelector("textarea");
        updateStats(note);

        // Autosave every 5 seconds
        let autosaveTimeout;
        textarea.addEventListener("input", () => {
            updateStats(note);
            clearTimeout(autosaveTimeout);
            autosaveTimeout = setTimeout(saveNotesToLocalStorage, 5000);
        });

        note.querySelector(".save").addEventListener("click", () => {
            savePopup.classList.remove("hidden");
            popupTitle.value = note.querySelector("input").value;
            popupTags.value = note.dataset.tags;
            popupStats.textContent = note.querySelector(".stats").textContent;

            popupSaveBtn.onclick = () => {
                note.querySelector("input").value = popupTitle.value;
                note.dataset.tags = popupTags.value;
                saveNotesToLocalStorage();
                savePopup.classList.add("hidden");
            };

            popupDownloadBtn.onclick = () => {
                const blob = new Blob([textarea.value], { type: "text/plain" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${popupTitle.value || "note"}.txt`;
                link.click();
            };

            popupCancelBtn.onclick = () => savePopup.classList.add("hidden");
        });

        note.querySelector(".delete").addEventListener("click", () => {
            note.remove();
            saveNotesToLocalStorage();
        });

        notesContainer.appendChild(note);
    };

    // Cursor-following effect for dark theme
    notesContainer.onmousemove = e => {
        if (document.body.classList.contains("dark-theme")) {
            for (const note of document.getElementsByClassName("note")) {
                const rect = note.getBoundingClientRect(),
                      x = e.clientX - rect.left,
                      y = e.clientY - rect.top;
                note.style.setProperty("--mouse-x", `${x}px`);
                note.style.setProperty("--mouse-y", `${y}px`);
            }
        }
    };

    createNoteBtn.addEventListener("click", () => {
        createNoteElement();
    });

    loadNotes();
});