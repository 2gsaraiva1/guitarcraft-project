/*
Este módulo controla a home page (reveal, destaque de produtos e estado de stock).
*/

const PREBUILT_API = "http://localhost:3000/api/prebuilt";
const PLACEHOLDER_IMAGE = "/assets/placeholder-guitar.svg";
let lastFeaturedData = [];

// --------------------------------------------------
// Função: getI18n
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function getI18n() {
  return window.GuitarI18n || null;
}

// --------------------------------------------------
// Função: setupScrollReveal
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function setupScrollReveal() {
  const nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}

// --------------------------------------------------
// Função: formatMoney
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: value.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

// --------------------------------------------------
// Função: pickRandomGuitars
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: guitars, count = 4.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function pickRandomGuitars(guitars, count = 4) {
  const list = Array.isArray(guitars) ? guitars : [];
  if (!list.length) return [];
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.max(1, count));
}

// --------------------------------------------------
// Função: getHomeStockMeta
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: guitar.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function getHomeStockMeta(guitar) {
  const status = String(guitar.stockStatus || "in_stock");
  const qty = Math.max(0, Number(guitar.stockQuantity || 0));
  const restock = guitar.estimatedRestockDate ? String(guitar.estimatedRestockDate).slice(0, 10) : "";

  if (status === "in_stock") {
    const i18n = getI18n();
    return {
      className: "stock-badge stock-in",
      label: qty > 0 && qty < 5
        ? (i18n ? i18n.t("stock.in_stock_few", { qty }) : `In Stock - Only ${qty} left`)
        : (i18n ? i18n.t("stock.in_stock") : "In Stock"),
      restockText: ""
    };
  }

  if (status === "low_stock") {
    const i18n = getI18n();
    return {
      className: "stock-badge stock-low",
      label: i18n ? i18n.t("stock.low_stock", { qty }) : `Low Stock - Only ${qty} left`,
      restockText: ""
    };
  }

  if (status === "out_of_stock") {
    const i18n = getI18n();
    return {
      className: "stock-badge stock-out",
      label: i18n ? i18n.t("stock.out_of_stock") : "Out of Stock",
      restockText: restock
        ? (i18n ? i18n.t("stock.estimated_restock", { date: restock }) : `Estimated restock: ${restock}`)
        : ""
    };
  }

  if (status === "preorder") {
    const i18n = getI18n();
    return {
      className: "stock-badge stock-pre",
      label: i18n ? i18n.t("stock.preorder") : "Pre-order",
      restockText: restock
        ? (i18n ? i18n.t("stock.estimated_ship", { date: restock }) : `Estimated ship date: ${restock}`)
        : ""
    };
  }

  const i18n = getI18n();
  return {
    className: "stock-badge stock-back",
    label: i18n ? i18n.t("stock.backorder") : "Backorder - Ships when available",
    restockText: restock
      ? (i18n ? i18n.t("stock.estimated_restock", { date: restock }) : `Estimated restock: ${restock}`)
      : ""
  };
}

// --------------------------------------------------
// Função: renderFeaturedGuitars
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: guitars.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function renderFeaturedGuitars(guitars) {
  const host = document.getElementById("featured-guitars");
  if (!host) return;

  const all = Array.isArray(guitars) ? guitars : [];
  lastFeaturedData = all;
  const featured = pickRandomGuitars(all, 4);
  if (!featured.length) {
    host.innerHTML = '<p class="muted">No featured guitars available right now.</p>';
    return;
  }

  host.innerHTML = featured.map((guitar) => {
    const safeName = guitar.name || "Guitar";
    const fallback = guitar.description || "Built for tone, feel, and reliability.";
    const i18n = getI18n();
    const safeDescription = i18n && typeof i18n.localizeDescription === "function"
      ? i18n.localizeDescription(guitar, "short")
      : fallback;
    const safeImage = guitar.image || PLACEHOLDER_IMAGE;
    const stock = getHomeStockMeta(guitar);
    return `
      <article class="card">
        <img class="shop-image" src="${safeImage}" alt="${safeName}" onerror="this.src='${PLACEHOLDER_IMAGE}'" />
        <h3>${safeName}</h3>
        <p>${safeDescription}</p>
        <p><strong>Price:</strong> $${formatMoney(guitar.price)}</p>
        <p><strong>Status:</strong> <span class="${stock.className}">${stock.label}</span></p>
        ${stock.restockText ? `<p class="muted">${stock.restockText}</p>` : ""}
        <div class="feature-actions">
          <a class="cta-btn cta-secondary" href="/product/${encodeURIComponent(guitar.id)}">View Details</a>
        </div>
      </article>
    `;
  }).join("");
}

// --------------------------------------------------
// Função: loadFeaturedGuitars
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
async function loadFeaturedGuitars() {
  const host = document.getElementById("featured-guitars");
  if (!host) return;

  try {
    // Chamada à API: comunica com o backend para sincronizar estado no frontend.
    const response = await fetch(PREBUILT_API);
    if (!response.ok) {
      throw new Error("Unable to load guitars.");
    }
    const data = await response.json();
    renderFeaturedGuitars(data);
  } catch (error) {
    host.innerHTML = '<p class="muted">Featured guitars are temporarily unavailable.</p>';
  }
}

setupScrollReveal();
loadFeaturedGuitars();

window.addEventListener("guitarcraft_lang_changed", () => {
  if (Array.isArray(lastFeaturedData) && lastFeaturedData.length) {
    renderFeaturedGuitars(lastFeaturedData);
  }
});
