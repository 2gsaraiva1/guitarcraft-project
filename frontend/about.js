/*
Este mdulo controla o comportamento visual da pgina About.
Aplica animao de entrada (reveal) quando as seces ficam visveis no ecr.
*/

// --------------------------------------------------
// Funo: setupAboutReveal
// O que faz: observa elementos com classe "reveal" e ativa animao quando entram no viewport.
// Parmetros: nenhum.
// Retorna: nada (void).
// --------------------------------------------------
function setupAboutReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;

  // Lgica de UI: observer para transio suave quando o utilizador faz scroll.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // UI update: adiciona classe visual e deixa de observar esse n.
          entry.target.classList.add("reveal-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -30px 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}

// Inicializao do mdulo na carga da pgina About.
setupAboutReveal();
