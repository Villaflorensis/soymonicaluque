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
const eyebrow = document.querySelector("#eyebrow");
const title = document.querySelector("#title");
const body = document.querySelector("#body");

const journeyCopy = [
  [
    "Cuerpo en coherencia",
    "No necesitas otra dieta.",
    "Necesitas entender qué está intentando decirte tu cuerpo y tener una estrategia que puedas sostener."
  ],
  [
    "La pista importante",
    "El problema no es que no hayas hecho nada.",
    "Muchas mujeres llegan después de probar piezas sueltas: comida, suplementos, descanso, analíticas, tóxicos, estrés o etapa hormonal. Falta una lectura completa."
  ],
  [
    "Tu momento vital",
    "Tu etapa cambia la forma de interpretar tus síntomas.",
    "No se mira igual un ciclo activo, un posparto, una perimenopausia o una menopausia. Tu contexto cambia la estrategia."
  ],
  [
    "Síntomas conectados",
    "Lo digestivo, hormonal y energético no van por separado.",
    "Cuando varias señales aparecen a la vez, no son datos sueltos: son un patrón. Primero hay que entenderlo para dejar de ir apagando fuegos."
  ],
  [
    "Mirada a 3 meses",
    "Un proceso permite observar, ajustar y sostener.",
    "Una pauta puede orientar, pero muchas veces no basta. En 3 meses hay margen para ordenar prioridades y adaptar la estrategia a cómo responde tu cuerpo."
  ],
  [
    "Primer paso",
    "La claridad no es el final: es la puerta de entrada.",
    "En una llamada breve vemos qué te preocupa, si puedo ayudarte y si tiene sentido hacer una valoración integrativa antes de iniciar un proceso."
  ],
  [
    "Siguiente paso",
    "Ahora tus respuestas ya dibujan un mapa inicial.",
    "Déjame tus datos para recibir tus respuestas, revisar tu punto de partida y contactarte con el siguiente paso más coherente."
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
  const action = "Lo que has marcado no habla de síntomas sueltos. Habla de un cuerpo que necesita orden, lectura global y una estrategia adaptada. El primer paso es solicitar una sesión breve de claridad para ver si tiene sentido hacer una valoración integrativa y, si encaja, trabajar juntas durante 3 meses.";
  result.innerHTML = `<strong>${message.title}</strong><p>${message.text}</p><p>${action}</p>`;
  hidden.resultado_orientativo.value = `${message.title} ${message.text} ${action} Puntuación orientativa: ${currentScore}.`;
  hidden.puntuacion_orientativa.value = String(currentScore);
}

function isComplete() {
  if (currentStep >= steps.length) return true;
  return Boolean(document.querySelector(`.step[data-step="${currentStep}"] button.selected`));
}

function setStep(step) {
  currentStep = Math.max(1, Math.min(step, steps.length));
  steps.forEach((item) => item.classList.toggle("active", Number(item.dataset.step) === currentStep));

  const progress = Math.round((currentStep / steps.length) * 100);
  progressText.textContent = `Paso ${currentStep} de ${steps.length}`;
  progressBar.style.width = `${progress}%`;

  const copy = journeyCopy[currentStep - 1];
  eyebrow.textContent = copy[0];
  title.textContent = copy[1];
  body.textContent = copy[2];

  previousButton.hidden = currentStep === 1;
  nextButton.hidden = currentStep === steps.length;
  submitButton.hidden = currentStep !== steps.length;
  form.classList.toggle("is-contact-step", currentStep === steps.length);
  document.body.classList.toggle("contact-step", currentStep === steps.length);

  hint.textContent = "";
  updateHiddenFields();
  updateResult();
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
  setStep(currentStep + 1);
});

previousButton.addEventListener("click", () => setStep(currentStep - 1));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  updateHiddenFields();
  updateResult();
  submitButton.disabled = true;
  hint.textContent = "Enviando tu valoración...";
  try {
    const response = await fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    if (!response.ok) throw new Error("No se ha podido enviar la valoración.");
    window.location.href = "https://soymonicaluque.com/sesion-claridad/gracias.html";
  } catch (error) {
    hint.textContent = error.message || "No se ha podido enviar la valoración. Inténtalo de nuevo.";
    submitButton.disabled = false;
  }
});

setStep(1);
