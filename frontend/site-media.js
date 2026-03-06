/*
Este módulo aplica imagens dinâmicas do site definidas no backend.
*/

(function applySiteMedia() {
  const API_URL = "http://localhost:3000/api/site-media";
  const KEY_TO_VAR = {
    home_hero: "--home-hero-image",
    home_classic_series: "--home-classic-image",
    home_modern_series: "--home-modern-image",
    home_builder_promo: "--home-builder-image",
    about_hero: "--about-hero-image"
  };

  // --------------------------------------------------
  // Função: toCssUrl
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: url.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  function toCssUrl(url) {
    return `url("${String(url).replace(/"/g, '\\"')}")`;
  }

  fetch(API_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load site media.");
      return response.json();
    })
    .then((data) => {
      Object.entries(KEY_TO_VAR).forEach(([key, cssVar]) => {
        const value = String(data[key] || "").trim();
        if (value) {
          document.documentElement.style.setProperty(cssVar, toCssUrl(value));
        }
      });
    })
    .catch(() => {});
})();
