const form = document.querySelector("#leadForm");
const steps = [...document.querySelectorAll(".step")];
const cards = [...document.querySelectorAll(".choices button")];
const previousButton = document.querySelector("#prevStep");
const nextButton = document.querySelector("#nextStep");
const submitButton = document.querySelector("#submitLead");
const hint = document.querySelector("#hint");
const result = document.querySelector("#resultado");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const cardProgressText = document.querySelector("#cardProgressText");
const cardProgressBar = document.querySelector("#cardProgressBar");
const eyebrow = document.querySelector("#eyebrow");
const title = document.querySelector("#title");
const body = document.querySelector("#body");
const cardEyebrow = document.querySelector("#cardEyebrow");
const cardTitle = document.querySelector("#cardTitle");
const cardBody = document.querySelector("#cardBody");

const journeyCopy = [
  [
    "Sesión de claridad · 15 min · gratuita",
    "No necesitas otra prueba para empezar.",
    "Necesitas ordenar qué está diciendo tu cuerpo y saber si lo más coherente ahora es observar mejor, pedir una valoración integrativa o iniciar un proceso acompañado."
  ],
  [
    "Lo que ya has intentado",
    "No es falta de voluntad.",
    "Muchas mujeres llegan después de probar piezas sueltas. Falta una lectura completa antes de añadir otra decisión."
  ],
  [
    "Tu momento vital",
    "Tu etapa cambia la lectura.",
    "No se mira igual un ciclo activo, un posparto, una perimenopausia o una menopausia. Tu contexto cambia la estrategia."
  ],
  [
    "Síntomas conectados",
    "Nada va por separado.",
    "Digestión, energía, ciclo, ánimo e inflamación suelen formar un patrón. Primero hay que entenderlo."
  ],
  [
    "Mirada a 3 meses",
    "Ordenar también es avanzar.",
    "Una pauta puede orientar, pero muchas veces no basta. Hace falta ajustar según responde tu cuerpo."
  ],
  [
    "Primer paso",
    "Primero una decisión clara.",
    "En una llamada breve vemos si tiene sentido observar, hacer una valoración integrativa o plantear un proceso."
  ],
  [
    "Siguiente paso",
    "Tus respuestas ya orientan.",
    "Déjame tus datos para revisar tu punto de partida y contactarte con una orientación honesta."
  ],
];

const fields = ["motivo_llegada", "intentos_previos", "etapa_vital", "frases_identificacion", "prioridad_3_meses", "apertura_enfoque"];
const hidden = Object.fromEntries([...fields, "resultado_orientativo", "puntuacion_orientativa"].map((id) => [id, document.querySelector(`#${id}`)]));
const messages = [
  {
    min: 0,
    title: "Tu cuerpo ya está avisando.",
    text: "Lo que has marcado muestra que no has llegado aquí por curiosidad, sino porque algo en tu cuerpo está pidiendo atención y una lectura más clara."
  },
  {
    min: 8,
    title: "Tus síntomas están conectados.",
    text: "Tus respuestas apuntan a un patrón: digestión, energía, ciclo, ánimo o inflamación no van por separado. Necesitas ordenar el mapa completo."
  },
  {
    min: 13,
    title: "Tu caso necesita orden, no más fuerza de voluntad.",
    text: "Por lo que has marcado, no parece un desajuste puntual. Hay señales acumuladas y conviene revisar prioridades antes de añadir otra pauta suelta."
  },
  {
    min: 18,
    title: "Tiene sentido valorar un proceso.",
    text: "Has marcado varias señales relevantes a la vez. El siguiente paso no es decidirlo todo ahora, sino hacer claridad y ver si encaja una valoración integrativa."
  },
];

let currentStep = 1;

function buttonsFor(group) {
  return [...document.querySelectorAll(`[data-group="${group}"] button`)];
}

function selectedValues(group) {
  return buttonsFor(group).filter((button) => button.classList.contains("selected")).map((button) => button.textContent.trim());
}

function score() {
  return cards.filter((button) => button.classList.contains("selected")).reduce((sum, button) => sum + Number(button.dataset.score || 0), 0);
}

function currentMessage() {
  const currentScore = score();
  return messages.reduce((selected, message) => (currentScore >= message.min ? message : selected), messages[0]);
}

function updateHiddenFields() {
  fields.forEach((field) => {
    hidden[field].value = selectedValues(field).join(", ");
  });
}

function updateResult() {
  const currentScore = score();
  const message = currentMessage();
  const action = "Lo que has marcado no habla de síntomas sueltos. Habla de un cuerpo que necesita orden y una lectura global antes de sumar otra prueba, pauta o suplemento. El primer paso es solicitar una sesión breve de claridad para decidir si tiene sentido observar mejor, hacer una valoración integrativa o plantear un proceso.";
  result.innerHTML = `<strong>${message.title}</strong><p>${message.text}</p><p>${action}</p>`;
  hidden.resultado_orientativo.value = `${message.title} ${message.text} ${action} Puntuación orientativa: ${currentScore}.`;
  hidden.puntuacion_orientativa.value = String(currentScore);
}

function isComplete() {
  if (currentStep >= steps.length) return true;
  return Boolean(document.querySelector(`.step[data-step="${currentStep}"] button.selected`));
}

function setStep(step, shouldScroll = false) {
  currentStep = Math.max(1, Math.min(step, steps.length));
  steps.forEach((item) => item.classList.toggle("active", Number(item.dataset.step) === currentStep));

  const progress = Math.round((currentStep / steps.length) * 100);
  progressText.textContent = `Pregunta ${currentStep} de ${steps.length}`;
  progressBar.style.width = `${progress}%`;
  cardProgressText.textContent = `Pregunta ${currentStep} de ${steps.length}`;
  cardProgressBar.style.width = `${progress}%`;

  const copy = journeyCopy[currentStep - 1];
  eyebrow.textContent = copy[0];
  title.textContent = copy[1];
  body.textContent = copy[2];
  cardEyebrow.textContent = copy[0];
  cardTitle.textContent = copy[1];
  cardBody.textContent = copy[2];

  previousButton.hidden = currentStep === 1;
  nextButton.hidden = currentStep === steps.length;
  submitButton.hidden = currentStep !== steps.length;
  form.classList.toggle("is-contact-step", currentStep === steps.length);
  document.body.classList.toggle("contact-step", currentStep === steps.length);

  hint.textContent = "";
  updateHiddenFields();
  updateResult();

  if (shouldScroll && window.matchMedia("(max-width: 640px)").matches) {
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

cards.forEach((card) => {
  card.setAttribute("aria-pressed", "false");
  card.addEventListener("click", () => {
    const grid = card.closest(".choices");
    if (grid.classList.contains("single")) {
      buttonsFor(grid.dataset.group).forEach((button) => {
        button.classList.remove("selected");
        button.setAttribute("aria-pressed", "false");
      });
    }

    const shouldSelect = grid.classList.contains("single") || !card.classList.contains("selected");
    card.classList.toggle("selected", shouldSelect);
    card.setAttribute("aria-pressed", shouldSelect ? "true" : "false");
    updateHiddenFields();
    updateResult();
    hint.textContent = "";
  });
});

nextButton.addEventListener("click", () => {
  if (!isComplete()) {
    hint.textContent = "Elige al menos una opción para seguir.";
    return;
  }
  setStep(currentStep + 1, true);
});

previousButton.addEventListener("click", () => setStep(currentStep - 1, true));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  updateHiddenFields();
  updateResult();
  submitButton.disabled = true;
    hint.textContent = "Enviando tu solicitud...";
  try {
    const response = await fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    if (!response.ok) throw new Error("No se ha podido enviar la valoración.");
    window.location.href = "https://soymonicaluque.com/pruebas-raiz/sesion-claridad/gracias.html";
  } catch (error) {
    hint.textContent = error.message || "No se ha podido enviar la solicitud. Inténtalo de nuevo.";
    submitButton.disabled = false;
  }
});

setStep(1);
