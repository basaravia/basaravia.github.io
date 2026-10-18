const languageButton = document.querySelector(".language-toggle");
const translatable = document.querySelectorAll("[data-es][data-en]");
let language = "es";

function setLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language;
  translatable.forEach((element) => {
    element.innerHTML = element.dataset[language];
  });
  languageButton.textContent = language === "es" ? "EN" : "ES";
  languageButton.setAttribute("aria-label", language === "es" ? "Switch to English" : "Cambiar a español");
  document.title = language === "es"
    ? "Alexander Saravia — AI Architect & Maker"
    : "Alexander Saravia — AI Architect & Maker";
}

languageButton.addEventListener("click", () => setLanguage(language === "es" ? "en" : "es"));
document.querySelector("#year").textContent = new Date().getFullYear();

const terminal = document.querySelector("#terminal");
const terminalInput = document.querySelector("#terminal-input");
const terminalOutput = document.querySelector("#terminal-output");
const toast = document.querySelector("#toast");
let lastFocusedElement;
let toastTimer;

function openTerminal() {
  lastFocusedElement = document.activeElement;
  terminal.hidden = false;
  terminalInput.focus();
}

function closeTerminal() {
  terminal.hidden = true;
  lastFocusedElement?.focus();
}

document.querySelector("#open-terminal").addEventListener("click", openTerminal);
document.querySelector("#footer-terminal").addEventListener("click", openTerminal);
document.querySelector("#close-terminal").addEventListener("click", closeTerminal);
terminal.addEventListener("click", (event) => {
  if (event.target === terminal) closeTerminal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !terminal.hidden) closeTerminal();
});

const commands = {
  help: {
    es: "Comandos: whoami, stack, now, coffee, sudo make me a sandwich",
    en: "Commands: whoami, stack, now, coffee, sudo make me a sandwich",
  },
  whoami: {
    es: "Alexander Saravia — arquitecto de IA, estratega y maker. Construyo con intención.",
    en: "Alexander Saravia — AI architect, strategist, and maker. I build with intention.",
  },
  stack: {
    es: "LLMs · RAG · LangGraph · Python · Databricks · AWS / Azure / GCP · MCP / A2A · Edge AI",
    en: "LLMs · RAG · LangGraph · Python · Databricks · AWS / Azure / GCP · MCP / A2A · Edge AI",
  },
  now: {
    es: "Llevando IA agéntica y gobierno responsable del diagrama a producción.",
    en: "Taking agentic AI and responsible governance from diagram to production.",
  },
  coffee: {
    es: "Compilando café... ██████████ 100%. Ahora sí, ¿qué vamos a construir?",
    en: "Compiling coffee... ██████████ 100%. Now, what shall we build?",
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
  prompt.textContent = `➜ ${command}`;
  terminalOutput.append(prompt);
  const result = document.createElement("p");
  result.className = "terminal-result";
  result.textContent = commands[command]?.[language] ?? (language === "es"
    ? `Comando no reconocido: ${command}. Prueba con help.`
    : `Command not found: ${command}. Try help.`);
  terminalOutput.append(result);
  terminalInput.value = "";
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
});

let keySequence = [];
const easterEggSequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
document.addEventListener("keydown", (event) => {
  keySequence = [...keySequence, event.key].slice(-easterEggSequence.length);
  if (keySequence.length === easterEggSequence.length
      && keySequence.every((key, index) => key.toLowerCase() === easterEggSequence[index].toLowerCase())) {
    toast.textContent = language === "es"
      ? "Easter egg desbloqueado: que la curiosidad te acompañe. ✳"
      : "Easter egg unlocked: may curiosity be with you. ✳";
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3500);
    keySequence = [];
  }
});
