/*
Este mÃƒÂ³dulo aplica imagens dinÃƒÂ¢micas do site definidas no backend.
*/

(function applySiteMedia() {
  const API_URL = "/api/site-media";
  const KEY_TO_VAR = {
    home_hero: "--home-hero-image",
    home_classic_series: "--home-classic-image",
    home_modern_series: "--home-modern-image",
    home_builder_promo: "--home-builder-image",
    about_hero: "--about-hero-image"
  };

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: toCssUrl
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: url.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
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
