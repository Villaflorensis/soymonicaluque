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
  ["Antes de empezar", "No has llegado aquí por casualidad.", "Si has abierto esta valoración es porque tu cuerpo ya te está dando señales. Voy a ayudarte a ordenar lo que pasa antes de pedirte datos."],
  ["La pista importante", "El problema no es que no hayas hecho nada.", "Lo que veo muchas veces es que has probado piezas sueltas sin una lectura completa: comida, suplementos, descanso, analíticas, tóxicos, estrés y etapa hormonal."],
  ["Tu momento vital", "Tu etapa cambia la forma de interpretar tus síntomas.", "No voy a mirar igual un ciclo activo, un posparto, una perimenopausia o una menopausia. Por eso necesito entender tu contexto antes de proponerte nada."],
  ["El cuerpo habla en conjunto", "Lo digestivo, hormonal y energético no van por separado.", "Cuando varias señales aparecen a la vez, para mí no son datos sueltos: son un patrón. Mi trabajo es ayudarte a nombrarlo para dejar de ir apagando fuegos."],
  ["La prioridad real", "No necesitas tocarlo todo: necesitas saber qué va primero.", "En la sesión no busco que lo cambies todo a la vez. Busco detectar contigo el primer foco real para que el cambio sea posible y no te sature."],
  ["La solución", "La sesión de claridad gratuita convierte tus síntomas en un mapa.", "Yo reviso tu caso con enfoque nutricional, hormonal, low-tox, descanso y medición de biomarcadores para que empieces con dirección y no con otro consejo suelto."],
  ["Siguiente paso", "Ahora tu mapa ya tiene suficiente información para revisarlo.", "Déjame tus datos y recibiré tus respuestas para preparar una primera lectura de tu caso y orientarte en una sesión de claridad gratuita."],
];

const fields = ["motivo_llegada", "intentos_previos", "etapa_vital", "frases_identificacion", "prioridad_3_meses", "apertura_enfoque"];
const hidden = Object.fromEntries([...fields, "resultado_orientativo", "puntuacion_orientativa"].map((id) => [id, document.querySelector(`#${id}`)]));
const messages = [
  { min: 0, title: "Tu cuerpo ya está avisando.", text: "Lo que has marcado me muestra que no has llegado aquí por curiosidad, sino porque algo en tu cuerpo ya está pidiendo atención. Necesitas una lectura clara de tu estado hormonal, digestivo y de energía para saber por dónde empezar." },
  { min: 8, title: "Tus síntomas están conectados.", text: "Tus respuestas me muestran un patrón: digestión, energía, ciclo, ánimo o inflamación no van por separado. En la sesión de claridad gratuita voy a unir esas piezas contigo y priorizar lo que tu cuerpo necesita ahora." },
  { min: 13, title: "Tu cuerpo está acumulando carga.", text: "Por lo que has marcado, tu situación actual no parece un simple desajuste puntual. Hay carga acumulada y tu cuerpo está pidiendo estructura, no más fuerza de voluntad ni más información general." },
  { min: 18, title: "Necesitas ordenar tu caso ya.", text: "Has marcado muchas señales relevantes a la vez y también has reconocido que seguir improvisando no te está llevando a sentirte mejor. La sesión de claridad gratuita es el siguiente paso lógico." },
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
  const action = "He revisado tus respuestas como mapa inicial. El siguiente paso es que me envíes esta valoración para decirte cuál es tu primer foco de trabajo y cómo empezar sin seguir interpretando síntomas por tu cuenta. Esta primera sesión de claridad es gratuita.";
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
form.addEventListener("submit", () => {
  updateHiddenFields();
  updateResult();
});

setStep(1);
