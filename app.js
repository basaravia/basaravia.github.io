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
  pitch: { es: "Pitch", en: "Pitch" },
  proyecto: { es: "Proyecto", en: "Project" },
  personal: { es: "Fuera del código", en: "Off the clock" },
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
    const mode = container.dataset.gallery;
    const featuredOnly = mode === "destacadas";
    // Las fotos personales viven solo en "Fuera del código"; la línea de tiempo y la portada son profesionales.
    const items = content.galeria.filter((item) => mode === "personal"
      ? item.tipo === "personal"
      : item.tipo !== "personal" && (!featuredOnly || item.destacada));
    const section = container.closest("[data-gallery-section]");
    if (section) section.hidden = items.length === 0;
    if (featuredOnly || mode === "personal") {
      container.innerHTML = items.map(galleryItem).join("");
      return;
    }
    // Línea de tiempo: un bloque por año, del más antiguo al más reciente.
    const years = [...new Set(items.map((item) => item.fecha.slice(0, 4)))];
    const now = new Date().getFullYear();
    const ago = (year) => {
      const n = now - Number(year);
      if (n === 0) return language === "es" ? "este año" : "this year";
      return language === "es" ? `hace ${n} ${n === 1 ? "año" : "años"}` : `${n} ${n === 1 ? "year" : "years"} ago`;
    };
    const yearsMarkup = years.map((year) => `
      <section class="timeline-year">
        <h3 class="timeline-year-label">${year}<small>${ago(year)}</small></h3>
        <div class="gallery-grid">${items.filter((item) => item.fecha.startsWith(year)).map(galleryItem).join("")}</div>
      </section>`).join("");
    container.innerHTML = depthTimeline(items, ago, yearsMarkup);
    wireDepthTimeline(container, items);
    observeTimeline(container);
  });
}

// ===== Línea de tiempo en profundidad: las fotos se apilan en perspectiva y se avanza con flechas, arrastre o teclado =====
const depthState = { kind: "all", index: 0, view: "stack" };

function depthTimeline(items, ago, yearsMarkup) {
  const es = language === "es";
  const kinds = [...new Set(items.map((item) => item.tipo))];
  const tab = (kind, label) => `<button type="button" role="tab" class="dt-tab" data-kind="${kind}">${escapeHtml(label)}</button>`;
  const icon = (path) => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  const cards = items.map((item, n) => `
      <figure class="dt-card protected-media" data-n="${n}">
        <img src="${root}${escapeHtml(item.src)}" alt="${escapeHtml(item.alt?.[language] ?? "")}" loading="${n < 6 ? "eager" : "lazy"}" decoding="async" width="800" height="600" draggable="false">
        <figcaption><span class="gallery-kind">${escapeHtml(galleryLabels[item.tipo]?.[language] ?? item.tipo)}</span><strong>${escapeHtml(item.titulo?.[language] ?? "")}</strong></figcaption>
      </figure>`).join("");
  return `
    <div class="dt" data-view="${depthState.view}">
      <div class="dt-bar">
        <div class="dt-tabs" role="tablist" aria-label="${es ? "Filtrar por tipo" : "Filter by type"}">
          ${tab("all", es ? "Todo" : "All")}${kinds.map((kind) => tab(kind, galleryLabels[kind]?.[language] ?? kind)).join("")}
        </div>
        <div class="dt-views" role="group" aria-label="${es ? "Vista" : "View"}">
          <button type="button" data-view="stack" aria-label="${es ? "Vista en profundidad" : "Depth view"}">${icon('<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4"/><path d="M3 17l9 4 9-4"/>')}</button>
          <button type="button" data-view="grid" aria-label="${es ? "Vista en cuadrícula" : "Grid view"}">${icon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>')}</button>
        </div>
      </div>
      <div class="dt-stack">
        <div class="dt-stage" tabindex="0" role="group" aria-roledescription="${es ? "carrusel" : "carousel"}" aria-label="${es ? "Fotos de la línea de tiempo. Usa las flechas del teclado." : "Timeline photos. Use the arrow keys."}">${cards}</div>
        <div class="dt-meta">
          <p class="dt-year"><span class="dt-year-num"></span><small class="dt-year-ago"></small></p>
          <div class="dt-info" aria-live="polite"><span class="gallery-kind"></span><strong></strong><span class="dt-place"></span></div>
          <div class="dt-nav">
            <button type="button" class="dt-prev" aria-label="${es ? "Foto anterior" : "Previous photo"}">${icon('<path d="M15 5l-7 7 7 7"/>')}</button>
            <span class="dt-count" aria-hidden="true"></span>
            <button type="button" class="dt-next" aria-label="${es ? "Foto siguiente" : "Next photo"}">${icon('<path d="M9 5l7 7-7 7"/>')}</button>
          </div>
        </div>
        <div class="dt-scrub" role="group" aria-label="${es ? "Ir a un año" : "Jump to a year"}"></div>
      </div>
      <div class="dt-grid timeline-photos">${yearsMarkup}</div>
    </div>`;
}

function wireDepthTimeline(container, items) {
  const scope = container.querySelector(".dt");
  if (!scope) return;
  const stage = scope.querySelector(".dt-stage");
  const cards = [...stage.querySelectorAll(".dt-card")];
  const scrub = scope.querySelector(".dt-scrub");
  const es = language === "es";
  const shown = () => depthState.kind === "all" ? items : items.filter((item) => item.tipo === depthState.kind);
  const yearOf = (item) => item.fecha.slice(0, 4);

  function go(index) {
    const list = shown();
    depthState.index = Math.min(Math.max(index, 0), list.length - 1);
    paint();
  }

  function paint() {
    const list = shown();
    depthState.index = Math.min(Math.max(depthState.index, 0), Math.max(list.length - 1, 0));
    const current = list[depthState.index];
    cards.forEach((card, n) => {
      const pos = list.indexOf(items[n]);
      const offset = pos < 0 ? 9 : pos - depthState.index;
      const far = Math.abs(offset) > 4;
      card.style.setProperty("--o", Math.max(-5, Math.min(5, offset)));
      card.style.setProperty("--ao", Math.min(Math.abs(offset), 5));
      card.style.zIndex = 20 - Math.min(Math.abs(offset), 19);
      card.dataset.hidden = far;
      card.dataset.active = offset === 0;
      card.setAttribute("aria-hidden", offset === 0 ? "false" : "true");
    });
    scope.querySelectorAll(".dt-tab").forEach((tab) => {
      const on = tab.dataset.kind === depthState.kind;
      tab.setAttribute("aria-selected", on);
      tab.tabIndex = on ? 0 : -1;
    });
    scope.querySelectorAll(".dt-views button").forEach((button) => button.setAttribute("aria-pressed", button.dataset.view === depthState.view));
    if (!current) return;
    const now = new Date().getFullYear();
    const age = now - Number(yearOf(current));
    scope.querySelector(".dt-year-num").textContent = yearOf(current);
    scope.querySelector(".dt-year-ago").textContent = age === 0 ? (es ? "este año" : "this year") : es ? `hace ${age} ${age === 1 ? "año" : "años"}` : `${age} ${age === 1 ? "year" : "years"} ago`;
    const info = scope.querySelector(".dt-info");
    info.querySelector(".gallery-kind").textContent = `${galleryLabels[current.tipo]?.[language] ?? current.tipo} · ${formatDate(current.fecha)}`;
    info.querySelector("strong").textContent = current.titulo?.[language] ?? "";
    info.querySelector(".dt-place").textContent = current.lugar ?? "";
    scope.querySelector(".dt-count").textContent = `${String(depthState.index + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
    scope.querySelector(".dt-prev").disabled = depthState.index === 0;
    scope.querySelector(".dt-next").disabled = depthState.index === list.length - 1;
    const years = [...new Set(list.map(yearOf))];
    scrub.style.setProperty("--p", list.length > 1 ? depthState.index / (list.length - 1) : 1);
    if (scrub.dataset.kind !== depthState.kind) {
      scrub.dataset.kind = depthState.kind;
      scrub.innerHTML = years.map((year) => `<button type="button" data-year="${year}">${year}</button>`).join("");
    }
    scrub.querySelectorAll("button").forEach((button) => button.setAttribute("aria-current", button.dataset.year === yearOf(current) ? "true" : "false"));
  }

  scope.querySelector(".dt-prev").addEventListener("click", () => go(depthState.index - 1));
  scope.querySelector(".dt-next").addEventListener("click", () => go(depthState.index + 1));
  scope.querySelector(".dt-tabs").addEventListener("click", (event) => {
    const tab = event.target.closest(".dt-tab");
    if (!tab) return;
    depthState.kind = tab.dataset.kind;
    depthState.index = 0;
    paint();
  });
  scope.querySelector(".dt-views").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    depthState.view = button.dataset.view;
    scope.dataset.view = depthState.view;
    paint();
  });
  scrub.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button) go(shown().findIndex((item) => yearOf(item) === button.dataset.year));
  });
  stage.addEventListener("keydown", (event) => {
    const keys = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };
    if (event.key in keys) go(depthState.index + keys[event.key]);
    else if (event.key === "Home") go(0);
    else if (event.key === "End") go(shown().length - 1);
    else return;
    event.preventDefault();
  });
  // Arrastre horizontal (mouse o dedo); el scroll vertical de la página no se bloquea.
  let startX = null;
  stage.addEventListener("pointerdown", (event) => { startX = event.clientX; });
  stage.addEventListener("pointerup", (event) => {
    if (startX === null) return;
    const delta = event.clientX - startX;
    startX = null;
    if (Math.abs(delta) > 40) { go(depthState.index + (delta < 0 ? 1 : -1)); return; }
    const card = event.target.closest(".dt-card");
    if (card && card.dataset.active !== "true") go(shown().indexOf(items[Number(card.dataset.n)]));
  });
  stage.addEventListener("pointercancel", () => { startX = null; });
  paint();
  // La entrada se dispara al ver la línea de tiempo; con poco movimiento o sin IntersectionObserver aparece ya armada.
  const settle = () => window.setTimeout(() => scope.classList.add("is-settled"), 1400);
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    scope.classList.add("is-in", "is-settled");
  } else {
    const seen = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      scope.classList.add("is-in");
      settle();
      seen.disconnect();
    }, { threshold: 0.3 });
    seen.observe(stage);
  }
}


// Respaldo del efecto "portal" para navegadores sin animaciones ligadas al scroll (CSS view()).
// Igual que en styles.css: los efectos ligados al scroll solo corren en escritorio con mouse.
const supportsScrollTimeline = CSS.supports?.("animation-timeline: view()")
  && matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1101px)").matches;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function observeTimeline(container) {
  // En pantallas táctiles (iPad, celular) las fotos quedan siempre visibles: sin animación de entrada.
  const desktop = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!desktop || supportsScrollTimeline || reducedMotion.matches || !("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("motion-fallback");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px" });
  container.querySelectorAll(".timeline-year-label, .gallery-item").forEach((element) => observer.observe(element));
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

// Halo que sigue al cursor en las tarjetas (solo con mouse; en pantallas táctiles no hay hover).
if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const cards = ".feature-card, .work-card, .lab-card, .talk-card, .info-card, .note-card, .stack-card";
  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest?.(cards);
    if (!card) return;
    card.classList.add("spotlight");
    const box = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - box.left}px`);
    card.style.setProperty("--my", `${event.clientY - box.top}px`);
  }, { passive: true });
}

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
      es: "Compilando café... [##########] 100%. Café listo. De vuelta al código.",
      en: "Compiling coffee... [##########] 100%. Coffee ready. Back to the code.",
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
