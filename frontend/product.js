/*
Modulo da pagina de produto pre-built.
Faz load do produto por id, mostra galeria de imagens, stock,
reviews e permite adicionar ao carrinho.
*/

/* global React, ReactDOM, GuitarAuth, GuitarCart */
const { useEffect, useMemo, useRef, useState } = React;
const { AuthProvider, useAuth } = GuitarAuth;
const { CartProvider, useCart } = GuitarCart;

const PREBUILT_API = "/api/prebuilt";
const PLACEHOLDER_IMAGE = "/assets/placeholder-guitar.svg";
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
// Parametros: guitar, type.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function localizeDescription(guitar, type) {
  if (i18n && typeof i18n.localizeDescription === "function") return i18n.localizeDescription(guitar, type);
  return type === "full" ? (guitar.fullDescription || guitar.description || "") : (guitar.shortDescription || guitar.description || "");
}

// --------------------------------------------------
// Funcao: getProductIdFromUrl
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const queryId = params.get("id");
  if (queryId) return queryId;

  const parts = window.location.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("product");
  if (idx >= 0 && parts[idx + 1]) return decodeURIComponent(parts[idx + 1]);
  return "";
}

// --------------------------------------------------
// Funcao: renderStars
// O que faz: executa uma parte da logica deste modulo.
// Parametros: value.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function renderStars(value) {
  const rating = Math.max(0, Math.min(5, Number(value || 0)));
  const full = Math.round(rating);
  return `${"\u2605".repeat(full)}${"\u2606".repeat(5 - full)}`;
}

// --------------------------------------------------
// Funcao: formatRatingValue
// O que faz: executa uma parte da logica deste modulo.
// Parametros: value.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function formatRatingValue(value) {
  const rating = Number(value || 0);
  if (Number.isInteger(rating)) return String(rating);
  return rating.toFixed(1);
}

// --------------------------------------------------
// Funcao: getReviewSummaryFromList
// O que faz: calcula media e total localmente para evitar UI desatualizada.
// Parametros: reviews (array).
// Retorna: objeto com averageRating e totalReviews.
// --------------------------------------------------
function getReviewSummaryFromList(reviews) {
  const safe = Array.isArray(reviews) ? reviews : [];
  const totalReviews = safe.length;
  if (!totalReviews) return { averageRating: 0, totalReviews: 0 };
  const normalized = safe.map((item) => {
    const raw = Number(item && item.rating ? item.rating : 0);
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.min(5, raw));
  });
  const sum = normalized.reduce((acc, value) => acc + value, 0);
  const averageRating = Number((sum / totalReviews).toFixed(2));
  return { averageRating, totalReviews };
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
// Funcao: getStockMeta
// O que faz: executa uma parte da logica deste modulo.
// Parametros: guitar.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function getStockMeta(guitar) {
  const status = String(guitar.stockStatus || "in_stock");
  const qty = Number(guitar.stockQuantity || 0);
  const restock = guitar.estimatedRestockDate ? String(guitar.estimatedRestockDate).slice(0, 10) : "";

  if (status === "in_stock") {
    return {
      key: "in_stock",
      className: "stock-badge stock-in",
      text: qty > 0 && qty < 5 ? t("stock.in_stock_few", { qty }) : t("stock.in_stock"),
      canAdd: true,
      maxQty: null
    };
  }

  if (status === "low_stock") {
    const limitedQty = Math.max(0, qty);
    return {
      key: "low_stock",
      className: "stock-badge stock-low",
      text: t("stock.low_stock", { qty: limitedQty }),
      canAdd: limitedQty > 0,
      maxQty: limitedQty
    };
  }

  if (status === "out_of_stock") {
    return {
      key: "out_of_stock",
      className: "stock-badge stock-out",
      text: restock ? t("stock.out_with_restock", { date: restock }) : t("stock.out_of_stock"),
      canAdd: false,
      maxQty: 0
    };
  }

  if (status === "preorder") {
    return {
      key: "preorder",
      className: "stock-badge stock-pre",
      text: restock ? t("stock.pre_with_est", { date: restock }) : t("stock.preorder"),
      canAdd: true,
      maxQty: null
    };
  }

  return {
    key: "backorder",
    className: "stock-badge stock-back",
    text: restock ? t("stock.back_with_est", { date: restock }) : t("stock.backorder"),
    canAdd: true,
    maxQty: null
  };
}

// --------------------------------------------------
// Funcao: StockBadge
// O que faz: executa uma parte da logica deste modulo.
// Parametros: { guitar }.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function StockBadge({ guitar }) {
  const meta = getStockMeta(guitar);
  return <span className={meta.className}>{meta.text}</span>;
}

// --------------------------------------------------
// Funcao: ReviewSection
// O que faz: executa uma parte da logica deste modulo.
// Parametros: { productId, currentUser }.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function ReviewSection({ productId, currentUser }) {
  // Bloco de reviews: lista, media de estrelas, formulario e acoes.
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewStatus, setReviewStatus] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isEditingMine, setIsEditingMine] = useState(false);
  const reviewSummary = useMemo(() => getReviewSummaryFromList(reviews), [reviews]);
  const averageRating = reviewSummary.averageRating;
  const totalReviews = reviewSummary.totalReviews;

  // --------------------------------------------------
  // Funcao: applyReviewPayload
  // O que faz: aplica reviews no estado e recalcula resumo se backend nao enviar valores corretos.
  // Parametros: data (objeto da API).
  // Retorna: sem retorno.
  // --------------------------------------------------
  function applyReviewPayload(data) {
    const nextReviews = Array.isArray(data && data.reviews) ? data.reviews : [];
    setReviews(nextReviews);
  }

  // --------------------------------------------------
  // Funcao: loadReviews
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function loadReviews() {
    try {
      // Cache bust para deploy: evita mostrar contagem/estrelas antigas.
      const response = await fetch(
        `${PREBUILT_API}/${encodeURIComponent(productId)}/reviews?t=${Date.now()}`,
        { cache: "no-store" }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to load reviews.");
      applyReviewPayload(data);
      setReviewStatus("");
    } catch (error) {
      setReviewStatus(error.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const hasReviewed = currentUser
    ? reviews.some((review) => String(review.username || "").toLowerCase() === String(currentUser.username || "").toLowerCase())
    : false;
  const myReview = currentUser
    ? reviews.find((review) => String(review.username || "").toLowerCase() === String(currentUser.username || "").toLowerCase())
    : null;

  useEffect(() => {
    if (!myReview) {
      setIsEditingMine(false);
      return;
    }
    if (!isEditingMine) return;
    setRating(Number(myReview.rating || 5));
    setComment(String(myReview.comment || ""));
  }, [myReview, isEditingMine]);

  // --------------------------------------------------
  // Funcao: submitReview
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: e.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function submitReview(e) {
    // Cria ou atualiza review do user logado e atualiza estado local na hora.
    e.preventDefault();
    setReviewStatus("");

    if (!currentUser) {
      setReviewStatus("Login to leave a review.");
      return;
    }

    if (!comment.trim()) {
      setReviewStatus("Comment is required.");
      return;
    }

    try {
      const endpoint = `${PREBUILT_API}/${encodeURIComponent(productId)}/review`;
      const method = hasReviewed ? "PUT" : "POST";
      // Chamada  API: comunica com o backend para sincronizar estado no frontend.
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorUsername: currentUser.username,
          rating: Number(rating),
          comment: String(comment).trim()
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to submit review.");

      setComment("");
      setRating(5);
      setIsEditingMine(false);
      setReviewStatus(hasReviewed ? "Review updated." : "Review submitted.");
      if (Array.isArray(data.reviews)) {
        applyReviewPayload(data);
      } else {
        await loadReviews();
      }
      await loadReviews();
    } catch (error) {
      setReviewStatus(error.message || "Failed to submit review.");
    }
  }

  // --------------------------------------------------
  // Funcao: deleteReview
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: review.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function deleteReview(review) {
    // So admin remove reviews. Depois atualiza lista/media no frontend.
    if (!currentUser || currentUser.role !== "admin") return;
    const reviewUserId = review.userId ? String(review.userId) : "username";
    const query = review.username ? `?reviewUsername=${encodeURIComponent(review.username)}` : "";
    try {
      // Chamada  API: comunica com o backend para sincronizar estado no frontend.
      const response = await fetch(`${PREBUILT_API}/${encodeURIComponent(productId)}/review/${encodeURIComponent(reviewUserId)}${query}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorUsername: currentUser.username })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to delete review.");
      setReviewStatus("Review deleted.");
      if (Array.isArray(data.reviews)) {
        applyReviewPayload(data);
      } else {
        await loadReviews();
      }
      await loadReviews();
    } catch (error) {
      setReviewStatus(error.message || "Failed to delete review.");
    }
  }

  return (
    <article className="product-block">
      <h2>Reviews</h2>
      {loading ? <p className="muted">Loading reviews...</p> : null}

      <div className="review-summary">
        <p className="review-average">{formatRatingValue(averageRating)} / 5</p>
        <p className="review-stars">{renderStars(averageRating)}</p>
        <p className="muted">{totalReviews} review{totalReviews === 1 ? "" : "s"}</p>
      </div>

      {currentUser ? (
        !hasReviewed || isEditingMine ? (
          <form className="review-form" onSubmit={submitReview}>
            <label htmlFor="rating">Your Rating</label>
            <div className="review-star-picker" role="group" aria-label="Select rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`star-btn ${value <= rating ? "active" : ""}`}
                  onClick={() => setRating(value)}
                >
                  {"\u2605"}
                </button>
              ))}
            </div>
            <label htmlFor="comment">Comment</label>
            <textarea id="comment" rows="3" value={comment} onChange={(e) => setComment(e.target.value)} />
            <div className="review-form-actions">
              <button type="submit">{hasReviewed ? "Update Review" : "Submit Review"}</button>
              {hasReviewed ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingMine(false);
                    setRating(5);
                    setComment("");
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        ) : (
          <div className="review-mine-box">
            <p className="muted">You already reviewed this product.</p>
            <button
              type="button"
              onClick={() => {
                setIsEditingMine(true);
                setRating(Number(myReview && myReview.rating ? myReview.rating : 5));
                setComment(String(myReview && myReview.comment ? myReview.comment : ""));
              }}
            >
              Rewrite Review
            </button>
          </div>
        )
      ) : (
        <p className="muted">Login to leave a review.</p>
      )}

      {reviewStatus ? <p className="muted">{reviewStatus}</p> : null}

      <div className="review-list">
        {reviews.map((review, idx) => (
          <div className="review-item" key={`${review.username}-${review.CREATEdAt}-${idx}`}>
            <p><strong>{review.username}</strong> <span className="review-stars">{renderStars(review.rating)}</span></p>
            <p>{review.comment}</p>
            <p className="muted">{new Date(review.CREATEdAt).toLocaleString()}</p>
            {currentUser && currentUser.role === "admin" ? (
              <button type="button" className="review-delete-btn" onClick={() => deleteReview(review)}>
                Delete Review
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}

// --------------------------------------------------
// Funcao: ProductPage
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function ProductPage() {
  // Componente principal da pagina /product/?id=...
  const { addPrebuiltToCart, items } = useCart();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [guitar, setGuitar] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [, setLangTick] = useState(0);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  const productId = useMemo(() => getProductIdFromUrl(), []);

  useEffect(() => {
    // --------------------------------------------------
    // Funcao: loadProduct
    // O que faz: executa uma parte da logica deste modulo.
    // Parametros: nenhum parametro.
    // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
    // --------------------------------------------------
    async function loadProduct() {
      if (!productId) {
        setError("Product not found.");
        setLoading(false);
        return;
      }

      try {
        // Chamada  API: comunica com o backend para sincronizar estado no frontend.
        const response = await fetch(`${PREBUILT_API}/${encodeURIComponent(productId)}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Product not found.");

        setGuitar(data);
        const initialImage = Array.isArray(data.images) && data.images.length ? data.images[0] : (data.image || PLACEHOLDER_IMAGE);
        setActiveImage(initialImage);
        setActiveImageIndex(0);
      } catch (err) {
        setError(err.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (!guitar) return;
    const meta = getStockMeta(guitar);
    if (meta.maxQty !== null && quantity > meta.maxQty) {
      setQuantity(Math.max(1, meta.maxQty));
    }
  }, [guitar, quantity]);

  useEffect(() => {
    // --------------------------------------------------
    // Funcao: onLangChange
    // O que faz: executa uma parte da logica deste modulo.
    // Parametros: nenhum parametro.
    // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
    // --------------------------------------------------
    function onLangChange() {
      setLangTick((v) => v + 1);
    }
    window.addEventListener("guitarcraft_lang_changed", onLangChange);
    return () => window.removeEventListener("guitarcraft_lang_changed", onLangChange);
  }, []);

  // --------------------------------------------------
  // Funcao: onAddToCart
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function onAddToCart() {
    if (!guitar) return;

    const stock = getStockMeta(guitar);
    if (!stock.canAdd) return;

    const requested = Math.max(1, Number(quantity || 1));
    const nextQuantity = stock.maxQty !== null ? Math.min(stock.maxQty, requested) : requested;

    try {
      await addPrebuiltToCart(guitar, nextQuantity);
      setStatus("Added to cart.");
    } catch (err) {
      setStatus(err.message || "Failed to add to cart.");
    }
  }

  if (loading) return <p>Loading product...</p>;
  if (error || !guitar) return <p className="auth-error">{error || "Product not found."}</p>;

  const images = Array.isArray(guitar.images) && guitar.images.length ? guitar.images : [guitar.image || PLACEHOLDER_IMAGE];
  const stock = getStockMeta(guitar);
  const disableAdd = !stock.canAdd;

  // --------------------------------------------------
  // Funcao: onTouchStart
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: e.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function onTouchStart(e) {
    touchStartX.current = e.touches && e.touches[0] ? e.touches[0].clientX : 0;
    touchDeltaX.current = 0;
  }

  // --------------------------------------------------
  // Funcao: onTouchMove
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: e.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function onTouchMove(e) {
    const x = e.touches && e.touches[0] ? e.touches[0].clientX : touchStartX.current;
    touchDeltaX.current = x - touchStartX.current;
  }

  // --------------------------------------------------
  // Funcao: onTouchEnd
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function onTouchEnd() {
    if (images.length < 2) return;
    const threshold = 40;
    if (Math.abs(touchDeltaX.current) < threshold) return;
    const direction = touchDeltaX.current < 0 ? 1 : -1;
    const nextIndex = (activeImageIndex + direction + images.length) % images.length;
    setActiveImageIndex(nextIndex);
    setActiveImage(images[nextIndex]);
  }

  return (
    <section className="product-page">
      <div className="product-top">
        <div className="product-gallery">
          <img
            className="product-main-image"
            src={activeImage}
            alt={guitar.name}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
          />
          <div className="product-thumbs">
            {images.map((img, idx) => (
              <button
                type="button"
                key={`${img}-${idx}`}
                className={`product-thumb-btn ${img === activeImage ? "active" : ""}`}
                onClick={() => {
                  setActiveImage(img);
                  setActiveImageIndex(idx);
                }}
              >
                <img src={img} alt={`${guitar.name} ${idx + 1}`} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <h1>{guitar.name}</h1>
          <p className="product-short">{localizeDescription(guitar, "short")}</p>
          <p className="muted">
            <strong>{i18n ? i18n.translateText("Category:") : "Category:"}</strong> {prettyCategory(guitar.category)}{" | "}
            <strong>{i18n ? i18n.translateText("Series:") : "Series:"}</strong> {prettySeries(guitar.seriesName)}
          </p>
          <p className="product-price">
            ${Number(guitar.price).toFixed(2)} <StockBadge guitar={guitar} />
          </p>

          <div className="qty-wrap">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={disableAdd}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={stock.maxQty !== null ? stock.maxQty : undefined}
              value={quantity}
              onChange={(e) => {
                const raw = Math.max(1, Number(e.target.value || 1));
                const bounded = stock.maxQty !== null ? Math.min(stock.maxQty, raw) : raw;
                setQuantity(bounded);
              }}
              disabled={disableAdd}
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => {
                const next = q + 1;
                return stock.maxQty !== null ? Math.min(stock.maxQty, next) : next;
              })}
              disabled={disableAdd || (stock.maxQty !== null && quantity >= stock.maxQty)}
            >
              +
            </button>
          </div>

          <button
            onClick={onAddToCart}
            disabled={disableAdd}
            title={disableAdd ? "Currently unavailable" : ""}
            style={disableAdd ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
          >
            {disableAdd ? (i18n ? i18n.translateText("Unavailable") : "Unavailable") : (i18n ? i18n.translateText("Add to Cart") : "Add to Cart")}
          </button>
          <a className="shop-cart-link" href="/cart/">{i18n ? i18n.translateText("Cart") : "Cart"} ({items.length})</a>
          {status ? <p className="muted">{status}</p> : null}
        </div>
      </div>

      <div className="product-sections">
        <details className="product-block product-collapsible" open>
          <summary>{i18n ? i18n.translateText("Full Description") : "Full Description"}</summary>
          <div className="product-collapsible-content">
            <h2>{i18n ? i18n.translateText("Full Description") : "Full Description"}</h2>
            <p>{localizeDescription(guitar, "full")}</p>
          </div>
        </details>
        <details className="product-block product-collapsible" open>
          <summary>{i18n ? i18n.translateText("Specifications") : "Specifications"}</summary>
          <div className="product-collapsible-content">
            <h2>{i18n ? i18n.translateText("Specifications") : "Specifications"}</h2>
            <ul className="product-spec-list">
              {(guitar.specs || []).map((spec) => (
                <li key={spec}>{spec}</li>
              ))}
            </ul>
          </div>
        </details>
      </div>

      <ReviewSection productId={productId} currentUser={currentUser} />
    </section>
  );
}

// --------------------------------------------------
// Funcao: ProductRoot
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function ProductRoot() {
  return (
    <AuthProvider>
      <CartProvider>
        <ProductPage />
      </CartProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("product-app")).render(<ProductRoot />);
