/*
Este módulo controla o comportamento visual da página About.
Aplica animação de entrada (reveal) quando as secções ficam visíveis no ecrã.
*/

// --------------------------------------------------
// Função: setupAboutReveal
// O que faz: observa elementos com classe "reveal" e ativa animação quando entram no viewport.
// Parâmetros: nenhum.
// Retorna: nada (void).
// --------------------------------------------------
function setupAboutReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;

  // Lógica de UI: observer para transição suave quando o utilizador faz scroll.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // UI update: adiciona classe visual e deixa de observar esse nó.
          entry.target.classList.add("reveal-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -30px 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}

// Inicialização do módulo na carga da página About.
setupAboutReveal();
