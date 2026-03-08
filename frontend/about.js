/*
Este modulo controla o comportamento visual da pagina About.
Aplica animao de entrada (reveal) quando as secoes ficam visveis no ecra.
*/

// --------------------------------------------------
// Funcao: setupAboutReveal
// O que faz: observa elementos com classe "reveal" e ativa animao quando entram no viewport.
// Parametros: nenhum.
// Retorna: nada (void).
// --------------------------------------------------
function setupAboutReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;

  // logica de UI: observer para transicao suave quando o utilizador faz scroll.
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

// Inicializao do modulo na carga da pagina About.
setupAboutReveal();
