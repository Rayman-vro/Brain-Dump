(() => {
  "use strict";

  const STORAGE_KEY = "brainDump.notes.v1";

  const input = document.getElementById("noteInput");
  const stashBtn = document.getElementById("stashBtn");
  const clearBtn = document.getElementById("clearBtn");
  const timeline = document.getElementById("timeline");
  const emptyState = document.getElementById("emptyState");
  const noteCount = document.getElementById("noteCount");

  let notes = loadNotes();

  /* ---------- Storage ---------- */

  function loadNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn("Could not read saved notes:", err);
      return [];
    }
  }

  function saveNotes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (err) {
      console.warn("Could not save notes:", err);
    }
  }

  /* ---------- Formatting ---------- */

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function formatDay(ts) {
    const date = new Date(ts);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  /* ---------- Rendering ---------- */

  function render() {
    timeline.innerHTML = "";

    // Newest first
    const sorted = [...notes].sort((a, b) => b.timestamp - a.timestamp);

    for (const note of sorted) {
      const li = document.createElement("li");
      li.className = "note";

      const time = document.createElement("div");
      time.className = "note-time";
      time.textContent = formatTime(note.timestamp);

      const day = formatDay(note.timestamp);
      if (day) {
        const small = document.createElement("small");
        small.textContent = day;
        time.appendChild(small);
      }

      const text = document.createElement("p");
      text.className = "note-text";
      text.textContent = note.text; // textContent prevents HTML injection

      const del = document.createElement("button");
      del.className = "note-delete";
      del.type = "button";
      del.setAttribute("aria-label", "Delete note");
      del.title = "Delete note";
      del.textContent = "×";
      del.addEventListener("click", () => deleteNote(note.id));

      li.append(time, text, del);
      timeline.appendChild(li);
    }

    noteCount.textContent = String(notes.length);
    emptyState.hidden = notes.length > 0;
    clearBtn.hidden = notes.length === 0;
  }

  /* ---------- Actions ---------- */

  function stashNote() {
    const text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }

    notes.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      text,
      timestamp: Date.now(),
    });

    saveNotes();
    input.value = "";
    input.focus();
    render();
    timeline.scrollTop = 0;
  }

  function deleteNote(id) {
    notes = notes.filter((n) => n.id !== id);
    saveNotes();
    render();
  }

  function clearAll() {
    if (!notes.length) return;
    if (confirm("Delete all stashed notes? This can't be undone.")) {
      notes = [];
      saveNotes();
      render();
    }
  }

  /* ---------- Events ---------- */

  stashBtn.addEventListener("click", stashNote);
  clearBtn.addEventListener("click", clearAll);

  input.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      stashNote();
    }
  });

  render();
})();