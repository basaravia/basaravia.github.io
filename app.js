const languageButton = document.querySelector(".language-toggle");
const root = document.documentElement.dataset.root ?? "";
const content = window.SITE_CONTENT ?? { galeria: [], notas: [] };
let language = "es";

function readStoredLanguage() {
  try {
    return localStorage.getItem("language");
  } catch {
    return null;
  }
}

function storeLanguage(value) {
  try {
    localStorage.setItem("language", value);
  } catch {
    // Sin almacenamiento disponible: el idioma vuelve a español en la siguiente página.
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  const options = day ? { year: "numeric", month: "short", day: "numeric" } : { year: "numeric", month: "short" };
  return new Date(year, (month || 1) - 1, day || 1).toLocaleDateString(language === "es" ? "es-EC" : "en-US", options);
}

const galleryLabels = {
  charla: { es: "Charla", en: "Talk" },
  clase: { es: "Clase", en: "Class" },
  evento: { es: "Evento", en: "Event" },
  proyecto: { es: "Proyecto", en: "Project" },
};

function galleryItem(item) {
  return `
    <figure class="gallery-item">
      <img src="${root}${escapeHtml(item.src)}" alt="${escapeHtml(item.alt?.[language] ?? "")}" loading="lazy" decoding="async" width="800" height="600" draggable="false">
      <figcaption>
        <span class="gallery-kind">${escapeHtml(galleryLabels[item.tipo]?.[language] ?? item.tipo)}${item.fecha ? ` · ${escapeHtml(formatDate(item.fecha))}` : ""}</span>
        <strong>${escapeHtml(item.titulo?.[language] ?? "")}</strong>
        ${item.lugar ? `<span>${escapeHtml(item.lugar)}</span>` : ""}
      </figcaption>
    </figure>`;
}

function renderGallery() {
  document.querySelectorAll("[data-gallery]").forEach((container) => {
    const featuredOnly = container.dataset.gallery === "destacadas";
    const items = content.galeria.filter((item) => !featuredOnly || item.destacada);
    const section = container.closest("[data-gallery-section]");
    if (section) section.hidden = items.length === 0;
    if (featuredOnly) {
      container.innerHTML = items.map(galleryItem).join("");
      return;
    }
    // Línea de tiempo: un bloque por año, del más antiguo al más reciente.
    const years = [...new Set(items.map((item) => item.fecha.slice(0, 4)))];
    container.innerHTML = years.map((year) => `
      <section class="timeline-year">
        <h3 class="timeline-year-label">${year}</h3>
        <div class="gallery-grid">${items.filter((item) => item.fecha.startsWith(year)).map(galleryItem).join("")}</div>
      </section>`).join("");
  });
}

function renderNotes() {
  document.querySelectorAll("[data-notes]").forEach((container) => {
    const limit = Number(container.dataset.notes) || content.notas.length;
    const notes = content.notas.slice(0, limit);
    const section = container.closest("[data-notes-section]");
    if (section) section.hidden = notes.length === 0;
    container.innerHTML = notes.map((note) => `
      <a class="note-card" href="${root}blog/${escapeHtml(note.slug)}.html">
        ${note.portada ? `<img src="${root}${escapeHtml(note.portada)}" alt="" loading="lazy" decoding="async">` : ""}
        <span class="note-meta">${escapeHtml(formatDate(note.fecha))}${note.etiquetas?.length ? ` · ${note.etiquetas.map(escapeHtml).join(" · ")}` : ""}</span>
        <h3>${escapeHtml(note.titulo?.[language] ?? "")}</h3>
        <p>${escapeHtml(note.resumen?.[language] ?? "")}</p>
        <span class="note-more">${language === "es" ? "Leer nota" : "Read note"} <i class='ico ico-arrow' aria-hidden='true'></i></span>
      </a>`).join("");
    const empty = container.parentElement.querySelector(".notes-empty");
    if (empty) empty.hidden = notes.length > 0;
  });
}

function setLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language;
  document.querySelectorAll("[data-es][data-en]").forEach((element) => {
    element.innerHTML = element.dataset[language];
  });
  languageButton.textContent = language === "es" ? "EN" : "ES";
  languageButton.setAttribute("aria-label", language === "es" ? "Switch to English" : "Cambiar a español");
  renderGallery();
  renderNotes();
}

languageButton.addEventListener("click", () => {
  setLanguage(language === "es" ? "en" : "es");
  storeLanguage(language);
});
setLanguage(new URLSearchParams(location.search).get("lang") ?? readStoredLanguage() ?? "es");
document.querySelectorAll(".year").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

// Las fotos se publican con marca de agua; esto solo evita el "guardar imagen" casual.
document.addEventListener("contextmenu", (event) => {
  if (event.target.closest(".gallery-item, .protected-media")) event.preventDefault();
});

const terminal = document.querySelector("#terminal");
const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3500);
}

if (terminal) {
  const terminalInput = document.querySelector("#terminal-input");
  const terminalOutput = document.querySelector("#terminal-output");
  let lastFocusedElement;

  function openTerminal() {
    lastFocusedElement = document.activeElement;
    terminal.hidden = false;
    terminalInput.focus();
  }

  function closeTerminal() {
    terminal.hidden = true;
    lastFocusedElement?.focus();
  }

  document.querySelectorAll("#open-terminal, #footer-terminal").forEach((button) => button.addEventListener("click", openTerminal));
  document.querySelector("#close-terminal").addEventListener("click", closeTerminal);
  terminal.addEventListener("click", (event) => {
    if (event.target === terminal) closeTerminal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !terminal.hidden) closeTerminal();
  });

  const commands = {
    help: {
      es: "Comandos: whoami, stack, now, trayectoria, offroad, playlist, coffee, sudo make me a sandwich",
      en: "Commands: whoami, stack, now, trayectoria, offroad, playlist, coffee, sudo make me a sandwich",
    },
    whoami: {
      es: "Alexander Saravia — tech lead y arquitecto de IA. Estrategia, arquitectura y código, en la misma conversación.",
      en: "Alexander Saravia — tech lead and AI architect. Strategy, architecture, and code in the same conversation.",
    },
    stack: {
      es: "LLMs · RAG · LangGraph · Python · Databricks · AWS / Azure / GCP · MCP / A2A · Edge AI",
      en: "LLMs · RAG · LangGraph · Python · Databricks · AWS / Azure / GCP · MCP / A2A · Edge AI",
    },
    now: {
      es: "Llevando IA agéntica y gobierno responsable del diagrama a producción.",
      en: "Taking agentic AI and responsible governance from diagram to production.",
    },
    trayectoria: {
      es: "Abriendo la trayectoria completa…",
      en: "Opening the full track record…",
      action: () => window.setTimeout(() => { location.href = `${root}trayectoria.html`; }, 600),
    },
    offroad: {
      es: "Fuera de la oficina: XC y off-road. Misma regla que en arquitectura: leer el terreno antes de acelerar.",
      en: "Off the clock: XC and off-road. Same rule as architecture: read the terrain before you accelerate.",
    },
    playlist: {
      es: "Ahora sonando: metal. Ideal para depurar a 200 bpm.",
      en: "Now playing: metal. Ideal for debugging at 200 bpm.",
    },
    coffee: {
      es: "Compilando café... [##########] 100%. Ahora sí, ¿qué vamos a construir?",
      en: "Compiling coffee... [##########] 100%. Now, what shall we build?",
    },
    "sudo make me a sandwich": {
      es: "Hecho. Pero ahora tú eliges el siguiente problema interesante.",
      en: "Done. Now you pick the next interesting problem.",
    },
  };

  document.querySelector("#terminal-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const command = terminalInput.value.trim().toLowerCase();
    if (!command) return;
    const prompt = document.createElement("p");
    prompt.className = "terminal-line";
    prompt.textContent = `> ${command}`;
    terminalOutput.append(prompt);
    const result = document.createElement("p");
    result.className = "terminal-result";
    result.textContent = commands[command]?.[language] ?? (language === "es"
      ? `Comando no reconocido: ${command}. Prueba con help.`
      : `Command not found: ${command}. Try help.`);
    terminalOutput.append(result);
    commands[command]?.action?.();
    terminalInput.value = "";
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  });
}

let keySequence = [];
const easterEggSequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
document.addEventListener("keydown", (event) => {
  keySequence = [...keySequence, event.key].slice(-easterEggSequence.length);
  if (keySequence.length === easterEggSequence.length
      && keySequence.every((key, index) => key.toLowerCase() === easterEggSequence[index].toLowerCase())) {
    showToast(language === "es"
      ? "Easter egg desbloqueado: que la curiosidad te acompañe."
      : "Easter egg unlocked: may curiosity be with you.");
    keySequence = [];
  }
});
