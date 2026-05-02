const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach((element) => observer.observe(element));

function updateTimelineProgress() {
  const progressBar = document.getElementById("timelineProgress");
  const statusText = document.getElementById("timelineStatus");
  const oneYearStep = document.getElementById("oneYearStep");

  const startDate = new Date("2026-03-01T00:00:00");
  const targetDate = new Date("2027-04-10T00:00:00");
  const currentDate = new Date();

  const totalTime = targetDate - startDate;
  const elapsedTime = currentDate - startDate;

  let progress = elapsedTime / totalTime;

  if (currentDate <= startDate) {
    progress = 0.08;
  }

  if (progress < 0.12) {
    progress = 0.12;
  }

  if (progress > 1) {
    progress = 1;
  }

  /*
    A barra total da timeline inteira tem 92% de largura.
    Queremos que o trecho "Hoje" -> "1 ano" ocupe só uma parte dela.
    Como são 5 marcos, usamos aproximadamente 23% da linha total
    para representar esse primeiro trecho visual.
  */
  const firstSegmentMax = 23;
  const visibleProgress = progress * firstSegmentMax;

  progressBar.style.width = `${visibleProgress}%`;

  if (progress >= 1) {
    oneYearStep.classList.add("active-target");
    statusText.textContent = "Meta de 1 ano alcançada em 10/04/2027.";
    progressBar.querySelector(".progress-glow").style.display = "none";
  } else {
    oneYearStep.classList.add("active-target");

    const percentValue = Math.round(progress * 100);
    statusText.textContent = `Em progresso rumo à meta de 1 ano. Progresso atual: ${percentValue}%.`;
  }
}

updateTimelineProgress();

const sidebarProgressFill = document.getElementById("sidebarProgressFill");
const sidebarSteps = document.querySelectorAll(".sidebar-step");

const observedSections = [
  "inicio",
  "momento-atual",
  "proximo-passo",
  "meta-atual",
  "horizonte",
  "skills-desenvolvimento",
  "meta-10-anos",
  "curriculo-card",
  "jornada-profissional"
];

function updateSidebarProgress() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY;
  const scrollableHeight = doc.scrollHeight - window.innerHeight;

  let progress = 0;
  if (scrollableHeight > 0) {
    progress = (scrollTop / scrollableHeight) * 100;
  }

  sidebarProgressFill.style.height = `${progress}%`;

  let currentSection = observedSections[0];

  observedSections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const rect = section.getBoundingClientRect();

    if (rect.top <= window.innerHeight * 0.35) {
      currentSection = sectionId;
    }
  });

  // força a última seção quando chegar muito perto do final
  if (scrollTop + window.innerHeight >= doc.scrollHeight - 10) {
    currentSection = observedSections[observedSections.length - 1];
  }

  const currentIndex = observedSections.indexOf(currentSection);

  sidebarSteps.forEach((step) => {
    const target = step.dataset.target;
    const stepIndex = observedSections.indexOf(target);

    step.classList.remove("active", "completed");

    if (stepIndex < currentIndex) {
      step.classList.add("completed");
    } else if (stepIndex === currentIndex) {
      step.classList.add("active");
    }
  });
}

window.addEventListener("scroll", updateSidebarProgress);
window.addEventListener("load", updateSidebarProgress);
window.addEventListener("resize", updateSidebarProgress);

updateSidebarProgress();

const roadmapButtons = document.querySelectorAll(".roadmap-btn");

const nextStepTitle = document.getElementById("nextStepTitle");
const nextStepIcon = document.getElementById("nextStepIcon");
const nextStepText = document.getElementById("nextStepText");
const nextStepDate = document.getElementById("nextStepDate");

const goalTitle = document.getElementById("goalTitle");
const goalIcon = document.getElementById("goalIcon");
const goalText = document.getElementById("goalText");

let evolucaoData = {};

function animateContentSwap(elements) {
  elements.forEach((element) => {
    element.classList.remove("content-switch");
    void element.offsetWidth;
    element.classList.add("content-switch");
  });
}

function updateEvolutionContent(phase) {
  const content = evolucaoData[phase];
  if (!content) return;

  nextStepTitle.textContent = content.nextTitle;
  nextStepIcon.textContent = content.nextIcon;
  nextStepIcon.className = `dynamic-icon ${content.nextIconClass}`;
  nextStepText.textContent = content.nextText;
  nextStepDate.textContent = content.nextDate;

  goalTitle.textContent = content.goalTitle;
  goalIcon.textContent = content.goalIcon;
  goalIcon.className = `dynamic-icon ${content.goalIconClass}`;
  goalText.textContent = content.goalText;

  animateContentSwap([
    nextStepTitle,
    nextStepIcon,
    nextStepText,
    nextStepDate,
    goalTitle,
    goalIcon,
    goalText
  ]);
}

fetch("data/evolucao.json")
  .then((response) => response.json())
  .then((data) => {
    evolucaoData = data;
    updateEvolutionContent("hoje");
  })
  .catch((error) => {
    console.error("Erro ao carregar evolucao.json:", error);
  });

roadmapButtons.forEach((button) => {
  button.addEventListener("click", () => {
    roadmapButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const selectedPhase = button.dataset.phase;
    updateEvolutionContent(selectedPhase);
  });
});