/*
Este modulo controla o painel de administrao para gerir guitarras e media do site.
*/

/* global React, ReactDOM, GuitarAuth, GuitarPrebuilt */
const { useEffect, useMemo, useState } = React;
const { AuthProvider, useAuth } = GuitarAuth;
const { PrebuiltProvider, usePrebuilt } = GuitarPrebuilt;

const SITE_MEDIA_API = "/api/site-media";
const i18n = window.GuitarI18n;
const SITE_MEDIA_FIELDS = [
  { key: "home_hero", label: "Home Hero Image URL" },
  { key: "home_classic_series", label: "Home Vintage Series Image URL" },
  { key: "home_modern_series", label: "Home Modern Series Image URL" },
  { key: "home_builder_promo", label: "Home Builder Promo Image URL" },
  { key: "about_hero", label: "About Hero Image URL" }
];

// --------------------------------------------------
// Funcao: emptyMediaForm
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function emptyMediaForm() {
  return SITE_MEDIA_FIELDS.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {});
}

// --------------------------------------------------
// Funcao: fetchJson
// O que faz: executa uma parte da logica deste modulo.
// Parametros: url, options.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
async function fetchJson(url, options) {
  // Chamada  API: comunica com o backend para sincronizar estado no frontend.
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

// --------------------------------------------------
// Funcao: emptyForm
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function emptyForm() {
  return {
    name: "",
    shortDescription: "",
    shortDescriptionPt: "",
    fullDescription: "",
    fullDescriptionPt: "",
    price: "",
    specsText: "",
    imagesText: "",
    category: "vintage",
    seriesName: "",
    stockStatus: "in_stock",
    stockQuantity: "10",
    estimatedRestockDate: "",
    status: "In Stock"
  };
}

// --------------------------------------------------
// Funcao: toForm
// O que faz: executa uma parte da logica deste modulo.
// Parametros: guitar.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function toForm(guitar) {
  const shortPt = guitar && guitar.shortDescriptionI18n ? (guitar.shortDescriptionI18n["pt-pt"] || guitar.shortDescriptionI18n.pt || "") : "";
  const fullPt = guitar && guitar.fullDescriptionI18n ? (guitar.fullDescriptionI18n["pt-pt"] || guitar.fullDescriptionI18n.pt || "") : "";
  return {
    name: guitar.name || "",
    shortDescription: guitar.shortDescription || guitar.description || "",
    shortDescriptionPt: shortPt,
    fullDescription: guitar.fullDescription || guitar.description || "",
    fullDescriptionPt: fullPt,
    price: String(guitar.price || ""),
    specsText: Array.isArray(guitar.specs) ? guitar.specs.join(", ") : "",
    imagesText: Array.isArray(guitar.images) && guitar.images.length
      ? guitar.images.join(", ")
      : (guitar.image || ""),
    category: String(guitar.category || "classic").toLowerCase() === "classic" ? "vintage" : String(guitar.category || "classic").toLowerCase(),
    seriesName: String(guitar.seriesName || "").toLowerCase() === "classic series" ? "Vintage Series" : (guitar.seriesName || ""),
    stockStatus: guitar.stockStatus || "in_stock",
    stockQuantity: String(guitar.stockQuantity || 0),
    estimatedRestockDate: guitar.estimatedRestockDate ? String(guitar.estimatedRestockDate).slice(0, 10) : "",
    status: guitar.status || "In Stock"
  };
}

// --------------------------------------------------
// Funcao: localizeDescription
// O que faz: executa uma parte da logica deste modulo.
// Parametros: guitar, type.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function localizeDescription(guitar, type) {
  if (!i18n || typeof i18n.localizeDescription !== "function") {
    return type === "full" ? (guitar.fullDescription || guitar.description || "") : (guitar.shortDescription || guitar.description || "");
  }
  return i18n.localizeDescription(guitar, type);
}

// --------------------------------------------------
// Funcao: parseSpecs
// O que faz: executa uma parte da logica deste modulo.
// Parametros: text.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function parseSpecs(text) {
  return String(text || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

// --------------------------------------------------
// Funcao: parseImages
// O que faz: executa uma parte da logica deste modulo.
// Parametros: text.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function parseImages(text) {
  return String(text || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

// --------------------------------------------------
// Funcao: prettyCategory
// O que faz: executa uma parte da logica deste modulo.
// Parametros: value.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function prettyCategory(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "classic") return (window.GuitarI18n && window.GuitarI18n.t) ? window.GuitarI18n.t("era.vintage") : "Vintage";
  if (raw === "modern") return (window.GuitarI18n && window.GuitarI18n.t) ? window.GuitarI18n.t("era.modern") : "Modern";
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
// Funcao: AdminDashboard
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function AdminDashboard() {
  const { currentUser } = useAuth();
  const { guitars, addGuitar, updateGuitar, deleteGuitar } = usePrebuilt();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [mediaValues, setMediaValues] = useState(emptyMediaForm());
  const [mediaStatus, setMediaStatus] = useState("");
  const [mediaLoading, setMediaLoading] = useState(false);
  const [, setLangTick] = useState(0);

  const isEditing = Boolean(editingId);

  const sorted = useMemo(() => {
    return [...guitars].sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      if (a.seriesName !== b.seriesName) return a.seriesName.localeCompare(b.seriesName);
      return a.name.localeCompare(b.name);
    });
  }, [guitars]);

  // --------------------------------------------------
  // Funcao: openCreate
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setError("");
    setOpen(true);
  }

  // --------------------------------------------------
  // Funcao: openEdit
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: guitar.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function openEdit(guitar) {
    setEditingId(guitar.id);
    setForm(toForm(guitar));
    setError("");
    setOpen(true);
  }

  // --------------------------------------------------
  // Funcao: closeModal
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function closeModal() {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setError("");
  }

  // --------------------------------------------------
  // Funcao: onChange
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: key, value.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function onChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // --------------------------------------------------
  // Funcao: onMediaChange
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: key, value.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function onMediaChange(key, value) {
    setMediaValues((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    let mounted = true;
    setMediaLoading(true);
    fetchJson(SITE_MEDIA_API, { method: "GET" })
      .then((data) => {
        if (!mounted) return;
        setMediaValues((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setMediaLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

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
  // Funcao: onSaveSiteMedia
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function onSaveSiteMedia() {
    setMediaStatus("");
    try {
      await fetchJson(SITE_MEDIA_API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorUsername: currentUser.username,
          values: mediaValues
        })
      });
      setMediaStatus("Site images updated.");
    } catch (err) {
      setMediaStatus(err.message || "Failed to update site images.");
    }
  }

  // --------------------------------------------------
  // Funcao: onSubmit
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: e.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");
    setError("");

    const normalizedSeriesName = String(form.seriesName || "").trim().toLowerCase() === "classic series"
      ? "Vintage Series"
      : form.seriesName;

    const normalizedCategory = String(form.category || "").trim().toLowerCase() === "vintage"
      ? "classic"
      : String(form.category || "").trim().toLowerCase();

    const payload = {
      name: form.name,
      shortDescription: form.shortDescription,
      fullDescription: form.fullDescription,
      shortDescriptionI18n: form.shortDescriptionPt ? { "pt-pt": form.shortDescriptionPt } : {},
      fullDescriptionI18n: form.fullDescriptionPt ? { "pt-pt": form.fullDescriptionPt } : {},
      description: form.shortDescription,
      price: Number(form.price),
      specs: parseSpecs(form.specsText),
      images: parseImages(form.imagesText),
      image: parseImages(form.imagesText)[0] || "",
      category: normalizedCategory,
      seriesName: normalizedSeriesName,
      stockStatus: form.stockStatus,
      stockQuantity: Number(form.stockQuantity || 0),
      estimatedRestockDate: form.estimatedRestockDate || "",
      status: form.status
    };

    try {
      if (isEditing) {
        await updateGuitar(editingId, payload);
        setStatus("Guitar updated.");
      } else {
        await addGuitar(payload);
        setStatus("Guitar added.");
      }
      closeModal();
    } catch (err) {
      setError(err.message || "Save failed.");
    }
  }

  // --------------------------------------------------
  // Funcao: onDelete
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: id.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function onDelete(id) {
    const confirmDelete = window.confirm("Delete this guitar?");
    if (!confirmDelete) return;
    try {
      await deleteGuitar(id);
      setStatus("Guitar deleted.");
    } catch (error) {
      setStatus(error.message || "Delete failed.");
    }
  }

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="muted">Signed in as {currentUser.username} ({currentUser.role})</p>
        </div>
        <button onClick={openCreate}>Add New Guitar</button>
      </div>
      {status ? <p className="muted">{status}</p> : null}

      <div className="card-grid">
        {sorted.map((guitar) => (
          <article className="card" key={guitar.id}>
            {(guitar.image || (Array.isArray(guitar.images) ? guitar.images[0] : "")) ? (
              <img className="shop-image" src={guitar.image || guitar.images[0]} alt={guitar.name} />
            ) : null}
            <h3>{guitar.name}</h3>
            <p>{localizeDescription(guitar, "short")}</p>
            <p><strong>Price:</strong> ${Number(guitar.price).toFixed(2)}</p>
            <p><strong>Category:</strong> {prettyCategory(guitar.category)}</p>
            <p><strong>Series:</strong> {prettySeries(guitar.seriesName)}</p>
            <p><strong>Status:</strong> {guitar.stockStatus}</p>
            <p><strong>Qty:</strong> {Number(guitar.stockQuantity || 0)}</p>
            {guitar.estimatedRestockDate ? <p><strong>Restock:</strong> {String(guitar.estimatedRestockDate).slice(0, 10)}</p> : null}
            <div className="card-actions">
              <button onClick={() => openEdit(guitar)}>Edit</button>
              <button onClick={() => onDelete(guitar.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>

      <section className="site-media-section">
        <h2>Site Images</h2>
        <p className="muted">Manage homepage and about page image URLs separately from guitars.</p>
        <div className="site-media-grid">
          {SITE_MEDIA_FIELDS.map((field) => (
            <label key={field.key} className="site-media-field" htmlFor={field.key}>
              <span>{field.label}</span>
              <input
                id={field.key}
                value={mediaValues[field.key] || ""}
                onChange={(e) => onMediaChange(field.key, e.target.value)}
                placeholder="https://..."
              />
            </label>
          ))}
        </div>
        <div className="site-media-actions">
          <button onClick={onSaveSiteMedia} disabled={mediaLoading}>
            {mediaLoading ? "Loading..." : "Save Site Images"}
          </button>
        </div>
        {mediaStatus ? <p className="muted">{mediaStatus}</p> : null}
      </section>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-panel">
            <h2>{isEditing ? "Edit Guitar" : "Add Guitar"}</h2>
            <form className="admin-form" onSubmit={onSubmit}>
              <label htmlFor="name">Name</label>
              <input id="name" value={form.name} onChange={(e) => onChange("name", e.target.value)} required />

              <label htmlFor="shortDescription">Short Description</label>
              <input id="shortDescription" value={form.shortDescription} onChange={(e) => onChange("shortDescription", e.target.value)} required />

              <label htmlFor="shortDescriptionPt">Short Description (PT)</label>
              <input id="shortDescriptionPt" value={form.shortDescriptionPt} onChange={(e) => onChange("shortDescriptionPt", e.target.value)} />

              <label htmlFor="fullDescription">Full Description</label>
              <input id="fullDescription" value={form.fullDescription} onChange={(e) => onChange("fullDescription", e.target.value)} required />

              <label htmlFor="fullDescriptionPt">Full Description (PT)</label>
              <input id="fullDescriptionPt" value={form.fullDescriptionPt} onChange={(e) => onChange("fullDescriptionPt", e.target.value)} />

              <label htmlFor="price">Price</label>
              <input id="price" type="number" min="1" step="0.01" value={form.price} onChange={(e) => onChange("price", e.target.value)} required />

              <label htmlFor="specs">Specs (comma separated)</label>
              <input id="specs" value={form.specsText} onChange={(e) => onChange("specsText", e.target.value)} required />

              <label htmlFor="imagesText">Image URLs (comma separated)</label>
              <input id="imagesText" value={form.imagesText} onChange={(e) => onChange("imagesText", e.target.value)} required />

              <label htmlFor="category">Category</label>
              <select id="category" value={form.category} onChange={(e) => onChange("category", e.target.value)} required>
                <option value="vintage">vintage</option>
                <option value="modern">modern</option>
              </select>

              <label htmlFor="seriesName">Series Name</label>
              <input id="seriesName" placeholder="Vintage Series" value={form.seriesName} onChange={(e) => onChange("seriesName", e.target.value)} required />

              <label htmlFor="stockStatus">Stock Status</label>
              <select id="stockStatus" value={form.stockStatus} onChange={(e) => onChange("stockStatus", e.target.value)} required>
                <option value="in_stock">in_stock</option>
                <option value="low_stock">low_stock</option>
                <option value="out_of_stock">out_of_stock</option>
                <option value="preorder">preorder</option>
                <option value="backorder">backorder</option>
              </select>

              <label htmlFor="stockQuantity">Stock Quantity</label>
              <input id="stockQuantity" type="number" min="0" value={form.stockQuantity} onChange={(e) => onChange("stockQuantity", e.target.value)} required />

              <label htmlFor="estimatedRestockDate">Estimated Restock Date</label>
              <input id="estimatedRestockDate" type="date" value={form.estimatedRestockDate} onChange={(e) => onChange("estimatedRestockDate", e.target.value)} />

              {error ? <p className="auth-error">{error}</p> : null}
              <div className="modal-actions">
                <button type="submit">{isEditing ? "Save Changes" : "CREATE Guitar"}</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// --------------------------------------------------
// Funcao: AdminRoot
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function AdminRoot() {
  return (
    <AuthProvider>
      <PrebuiltProvider>
        <AdminDashboard />
      </PrebuiltProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("admin-app")).render(<AdminRoot />);

