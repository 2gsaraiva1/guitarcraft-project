/*
Este mÃƒÂ³dulo controla o comportamento visual da pÃƒÂ¡gina About.
Aplica animaÃƒÂ§ÃƒÂ£o de entrada (reveal) quando as secÃƒÂ§ÃƒÂµes ficam visÃƒÂ­veis no ecrÃƒÂ£.
*/

// --------------------------------------------------
// FunÃƒÂ§ÃƒÂ£o: setupAboutReveal
// O que faz: observa elementos com classe "reveal" e ativa animaÃƒÂ§ÃƒÂ£o quando entram no viewport.
// ParÃƒÂ¢metros: nenhum.
// Retorna: nada (void).
// --------------------------------------------------
function setupAboutReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;

  // LÃƒÂ³gica de UI: observer para transiÃƒÂ§ÃƒÂ£o suave quando o utilizador faz scroll.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // UI update: adiciona classe visual e deixa de observar esse nÃƒÂ³.
          entry.target.classList.add("reveal-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -30px 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}

// InicializaÃƒÂ§ÃƒÂ£o do mÃƒÂ³dulo na carga da pÃƒÂ¡gina About.
setupAboutReveal();
