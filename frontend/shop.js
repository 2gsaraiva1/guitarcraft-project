/*
Modulo da pagina Shop.
Aqui a lista de guitarras pre-built e carregada, filtrada (serie + era),
agrupada por categoria/serie e renderizada em cards com acoes de
"View Details" e "Add to Cart".
*/

/* global React, ReactDOM, GuitarCart, GuitarAuth, GuitarPrebuilt */
const { useEffect, useMemo, useState } = React;
const { CartProvider, useCart } = GuitarCart;
const { AuthProvider, useAuth } = GuitarAuth;
const { PrebuiltProvider, usePrebuilt } = GuitarPrebuilt;
const i18n = window.GuitarI18n;

// --------------------------------------------------
// Funcao: t
// O que faz: executa uma parte da logica deste modulo.
// Parametros: key, vars = {}.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function t(key, vars = {}) {
  if (i18n && typeof i18n.t === "function") return i18n.t(key, vars);
  return key;
}

// --------------------------------------------------
// Funcao: localizeDescription
// O que faz: executa uma parte da logica deste modulo.
// Parametros: guitar.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function localizeDescription(guitar) {
  if (i18n && typeof i18n.localizeDescription === "function") {
    return i18n.localizeDescription(guitar, "short");
  }
  return guitar.shortDescription || guitar.description || "";
}

// --------------------------------------------------
// Funcao: groupByCategoryAndSeries
// O que faz: executa uma parte da logica deste modulo.
// Parametros: guitars.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function groupByCategoryAndSeries(guitars) {
  // Organiza os produtos para montar as secoes visuais:
  // Categoria -> Serie -> lista de cards.
  const grouped = {};
  guitars.forEach((guitar) => {
    const category = guitar.category || "Other";
    const series = guitar.seriesName || "General";
    if (!grouped[category]) grouped[category] = {};
    if (!grouped[category][series]) grouped[category][series] = [];
    grouped[category][series].push(guitar);
  });
  return grouped;
}

// --------------------------------------------------
// Funcao: detectSeries
// O que faz: executa uma parte da logica deste modulo.
// Parametros: guitar.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function detectSeries(guitar) {
  // Detecta a serie para o filtro de UI com base em nome/descricao.
  const haystack = `${guitar.name || ""} ${guitar.shortDescription || ""} ${guitar.description || ""} ${guitar.seriesName || ""}`.toLowerCase();
  if (haystack.includes("headless")) return "Headless";
  if (haystack.includes("multi")) return "Multi";
  if (haystack.includes(" lp") || haystack.startsWith("lp") || haystack.includes("les paul")) return "LP";
  if (haystack.includes(" sg") || haystack.startsWith("sg")) return "SG";
  if (haystack.includes(" st") || haystack.startsWith("st") || haystack.includes("strat")) return "ST";
  return "All";
}

// --------------------------------------------------
// Funcao: getEra
// O que faz: executa uma parte da logica deste modulo.
// Parametros: guitar.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function getEra(guitar) {
  const category = String(guitar.category || "").toLowerCase();
  if (category === "modern") return "modern";
  return "vintage";
}

// --------------------------------------------------
// Funcao: prettyCategory
// O que faz: executa uma parte da logica deste modulo.
// Parametros: value.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function prettyCategory(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "classic") return t("era.vintage");
  if (raw === "modern") return t("era.modern");
  if (!raw) return "";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

// --------------------------------------------------
// Funcao: prettySeries
// O que faz: executa uma parte da logica deste modulo.
// Parametros: value.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function prettySeries(value) {
  const raw = String(value || "").trim();
  if (raw.toLowerCase() === "classic series") return "Vintage Series";
  return raw;
}

// --------------------------------------------------
// Funcao: getShopStockMeta
// O que faz: executa uma parte da logica deste modulo.
// Parametros: guitar.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function getShopStockMeta(guitar) {
  // Converte estado de stock da BD para o que a UI precisa:
  // badge, texto, restock e se pode adicionar ao carrinho.
  const status = String(guitar.stockStatus || "in_stock");
  const qty = Math.max(0, Number(guitar.stockQuantity || 0));
  const restock = guitar.estimatedRestockDate ? String(guitar.estimatedRestockDate).slice(0, 10) : "";

  if (status === "in_stock") {
    return {
      className: "stock-badge stock-in",
      label: qty > 0 && qty < 5 ? t("stock.in_stock_few", { qty }) : t("stock.in_stock"),
      restockText: "",
      canAdd: true
    };
  }

  if (status === "low_stock") {
    return {
      className: "stock-badge stock-low",
      label: t("stock.low_stock", { qty }),
      restockText: "",
      canAdd: qty > 0
    };
  }

  if (status === "out_of_stock") {
    return {
      className: "stock-badge stock-out",
      label: t("stock.out_of_stock"),
      restockText: restock ? t("stock.estimated_restock", { date: restock }) : "",
      canAdd: false
    };
  }

  if (status === "preorder") {
    return {
      className: "stock-badge stock-pre",
      label: t("stock.preorder"),
      restockText: restock ? t("stock.estimated_ship", { date: restock }) : "",
      canAdd: true
    };
  }

  return {
    className: "stock-badge stock-back",
    label: t("stock.backorder"),
    restockText: restock ? t("stock.estimated_restock", { date: restock }) : "",
    canAdd: true
  };
}

// --------------------------------------------------
// Funcao: ShopView
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function ShopView() {
  const { guitars } = usePrebuilt();
  const { addPrebuiltToCart, items } = useCart();
  const { currentUser } = useAuth();
  const [status, setStatus] = useState("");
  const [selectedSeries, setSelectedSeries] = useState("All");
  const [selectedEra, setSelectedEra] = useState("all");
  const [, setLangTick] = useState(0);

  const filteredGuitars = useMemo(() => {
    // Aplica filtros em tempo real sem pedir de novo ao backend.
    return (guitars || []).filter((guitar) => {
      const seriesMatch = selectedSeries === "All" || detectSeries(guitar) === selectedSeries;
      const eraMatch = selectedEra === "all" || getEra(guitar) === selectedEra;
      return seriesMatch && eraMatch;
    });
  }, [guitars, selectedSeries, selectedEra]);

  const grouped = useMemo(() => groupByCategoryAndSeries(filteredGuitars), [filteredGuitars]);
  const categories = Object.keys(grouped);

  useEffect(() => {
    // Se vier hash na URL (ex: #modern), faz scroll para essa secao.
    if (!guitars.length) return;
    const hash = String(window.location.hash || "").replace("#", "").trim().toLowerCase();
    if (!hash) return;
    const target = document.getElementById(`category-${hash}`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [guitars]);

  // --------------------------------------------------
  // Funcao: onAddToCart
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: guitar.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function onAddToCart(guitar) {
    // So adiciona se stock permitir; depois mostra feedback para o user.
    const stockMeta = getShopStockMeta(guitar);
    if (!stockMeta.canAdd) {
      setStatus(`"${guitar.name}" is currently unavailable.`);
      return;
    }

    try {
      await addPrebuiltToCart(guitar);
      setStatus(`Added "${guitar.name}" to cart.`);
    } catch (error) {
      setStatus(error.message || "Failed to add to cart.");
    }
  }

  // --------------------------------------------------
  // Funcao: toProductUrl
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: id.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function toProductUrl(id) {
    // Em deploy estatico usamos query param para evitar erro em /product/:id.
    return `/product/?id=${encodeURIComponent(id)}`;
  }

  useEffect(() => {
    function onLangChange() {
      setLangTick((v) => v + 1);
    }
    window.addEventListener("guitarcraft_lang_changed", onLangChange);
    return () => window.removeEventListener("guitarcraft_lang_changed", onLangChange);
  }, []);

  if (!guitars.length) {
    return <p>No pre-built guitars available yet.</p>;
  }

  return (
    <div>
      <div className="shop-toolbar">
        <label className="muted" htmlFor="series-filter" style={{ marginRight: "8px" }}>{i18n ? i18n.translateText("Series") : "Series"}</label>
        <select id="series-filter" value={selectedSeries} onChange={(e) => setSelectedSeries(e.target.value)} style={{ marginRight: "12px" }}>
          <option value="All">{i18n ? i18n.translateText("All") : "All"}</option>
          <option value="LP">LP</option>
          <option value="SG">SG</option>
          <option value="ST">ST</option>
          <option value="Headless">Headless</option>
          <option value="Multi">Multi</option>
        </select>
        <label className="muted" htmlFor="era-filter" style={{ marginRight: "8px" }}>{i18n ? i18n.translateText("Era") : "Era"}</label>
        <select id="era-filter" value={selectedEra} onChange={(e) => setSelectedEra(e.target.value)} style={{ marginRight: "12px" }}>
          <option value="all">{i18n ? i18n.translateText("All") : "All"}</option>
          <option value="vintage">{t("era.vintage")}</option>
          <option value="modern">{t("era.modern")}</option>
        </select>
        <a className="shop-cart-link" href="/cart/">{i18n ? i18n.translateText("Cart") : "Cart"} ({items.length})</a>
      </div>
      {currentUser ? <p className="muted">{t("nav.signed_in")}: {currentUser.username}</p> : <p className="muted">{i18n ? i18n.translateText("Login required for cart actions.") : "Login required for cart actions."}</p>}
      {status ? <p className="muted">{status}</p> : null}
      {!filteredGuitars.length ? <p className="muted">{i18n ? i18n.translateText("No guitars match the selected filters.") : "No guitars match the selected filters."}</p> : null}

      {categories.map((category) => {
        const seriesMap = grouped[category];
        const seriesNames = Object.keys(seriesMap);
        const categorySlug = String(category).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        if (!seriesNames.length) return null;

        return (
          <section key={category} id={`category-${categorySlug}`} className="shop-section">
            <h2>{prettyCategory(category)}</h2>
            {seriesNames.map((seriesName) => {
              const entries = seriesMap[seriesName];
              if (!entries.length) return null;

              return (
                <div key={seriesName} className="shop-series">
                  <h3>{prettySeries(seriesName)}</h3>
                  <div className="card-grid">
                    {entries.map((guitar) => (
                      <article className="card shop-card" key={guitar.id} onClick={() => { window.location.href = toProductUrl(guitar.id); }}>
                        {(() => {
                          const stockMeta = getShopStockMeta(guitar);
                          return (
                            <>
                        {(guitar.image || (Array.isArray(guitar.images) ? guitar.images[0] : "")) ? (
                          <img className="shop-image" src={guitar.image || guitar.images[0]} alt={guitar.name} />
                        ) : null}
                        <h3>{guitar.name}</h3>
                        <p>{localizeDescription(guitar)}</p>
                        <p><strong>{i18n ? i18n.translateText("Price:") : "Price:"}</strong> ${Number(guitar.price).toFixed(2)}</p>
                        <p>
                          <strong>{i18n ? i18n.translateText("Status:") : "Status:"}</strong>{" "}
                          <span className={stockMeta.className}>{stockMeta.label}</span>
                        </p>
                        {stockMeta.restockText ? <p className="muted">{stockMeta.restockText}</p> : null}
                        <div className="card-actions">
                          <button onClick={(e) => { e.stopPropagation(); window.location.href = toProductUrl(guitar.id); }}>{i18n ? i18n.translateText("View Details") : "View Details"}</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onAddToCart(guitar); }}
                            disabled={!stockMeta.canAdd}
                            title={!stockMeta.canAdd ? "Currently unavailable" : ""}
                          >
                            {stockMeta.canAdd ? (i18n ? i18n.translateText("Add to Cart") : "Add to Cart") : (i18n ? i18n.translateText("Unavailable") : "Unavailable")}
                          </button>
                        </div>
                            </>
                          );
                        })()}
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

// --------------------------------------------------
// Funcao: ShopRoot
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function ShopRoot() {
  return (
    <AuthProvider>
      <PrebuiltProvider>
        <CartProvider>
          <ShopView />
        </CartProvider>
      </PrebuiltProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("shop-app")).render(<ShopRoot />);
