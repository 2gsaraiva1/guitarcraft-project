/*
Este módulo implementa o Guitar Builder (opções, preview, preço, guardar e carrinho).
*/

/* global React, ReactDOM, GuitarConfig, GuitarCart, GuitarAuth */
const { useEffect, useMemo, useReducer, useRef, useState } = React;

const { CartProvider, useCart } = GuitarCart;
const { AuthProvider, useAuth } = GuitarAuth;
const BUILDER_EDIT_DRAFT_KEY = "guitarcraft_builder_edit_v1";
const SAVED_API = "http://localhost:3000/api/saved-builds";

// --------------------------------------------------
// Função: readBuilderEditDraft
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function readBuilderEditDraft() {
  try {
    const raw = localStorage.getItem(BUILDER_EDIT_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

// --------------------------------------------------
// Função: getEditSavedIdFromUrl
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function getEditSavedIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = String(params.get("editSavedId") || "").trim();
  if (fromQuery) return fromQuery;
  const draft = readBuilderEditDraft();
  return String((draft && draft.savedId) || "").trim();
}

/* Reducer only stores builder view + all currently selected options */
function builderReducer(state, action) {
  if (action.type === "SET_OPTION") {
    return { ...state, selections: { ...state.selections, [action.key]: action.value } };
  }
  if (action.type === "SET_VIEW") {
    return { ...state, view: action.view };
  }
  if (action.type === "LOAD_SELECTIONS") {
    return { ...state, selections: { ...state.selections, ...(action.selections || {}) } };
  }
  return state;
}

/* Slug helper maps option values to layer png filenames */
function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* Builds the list of front/back layer PNGs based on selected options */
function getLayers(view, selections) {
  const root = "assets/layers";
  const frontLayers = [
    ["body-shape", selections.model],
    ["body-color", selections.body_color],
    ["finish-type", selections.finish_type],
    ["top-coat", selections.top_coat],
    ["neck-wood", selections.neck_wood],
    ["fretboard-wood", selections.fretboard_wood],
    ["headstock-shape", selections.headstock_shape],
    ["headstock-color", selections.headstock_color],
    ["logo-color", selections.logo_color],
    ["bridge", selections.bridge],
    ["pickup-config", selections.pickup_config],
    ["pickup-model", selections.pickup_model],
    ["pickup-color", selections.pickup_color],
    ["hardware-color", selections.hardware_color],
    ["pickguard-color", selections.pickguard_color]
  ];

  if (selections.top_wood !== "No Top") {
    frontLayers.splice(3, 0, ["top-wood", selections.top_wood]);
  }

  const backLayers = [
    ["neck-rear-finish", selections.neck_rear_finish],
    ["cavity-cover-color", selections.cavity_cover_color],
    ["truss-rod-cover-color", selections.truss_rod_cover_color]
  ];

  const active = view === "front" ? frontLayers : frontLayers.concat(backLayers);
  return active.map(([part, choice]) => `${root}/${view}/${part}/${slug(choice)}.png`);
}

// --------------------------------------------------
// Função: getCustomPreviewImage
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: selections.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function getCustomPreviewImage(selections) {
  const root = "assets/layers/front/body-shape";
  return `${root}/${slug(selections.model || "st")}.png`;
}

/* One dropdown field in the left customization panel */
function SelectField({ field, value, onChange }) {
  return (
    <div className="field">
      <label htmlFor={field.key}>{field.label}</label>
      <select id={field.key} value={value} onChange={(e) => onChange(field.key, e.target.value)}>
        {field.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

/* Displays saved custom builds and lets user add/remove them */
function SavedBuildsPanel() {
  const { savedBuilds, addSavedBuildToCart, removeSavedBuild } = useCart();
  const [status, setStatus] = useState("");

  if (!savedBuilds.length) {
    return (
      <div className="saved-builds-box">
        <h3>Saved Builds</h3>
        <p className="muted">No saved builds yet.</p>
      </div>
    );
  }

  return (
    <div className="saved-builds-box">
      <h3>Saved Builds</h3>
      <div className="saved-list">
        {savedBuilds.map((build) => (
          <div className="saved-item" key={build.savedId}>
            <div>
              <img
                className="cart-item-image"
                src={build.imagePreview || "/assets/placeholder-guitar.svg"}
                alt={build.label}
                onError={(e) => { e.currentTarget.src = "/assets/placeholder-guitar.svg"; }}
              />
              <p><strong>{build.label}</strong></p>
              <p className="muted">{new Date(build.createdAt).toLocaleString()}</p>
              <p className="muted">Total: ${build.totalPrice.toFixed(2)}</p>
            </div>
            <div className="saved-actions">
              <button
                className="toggle-btn"
                onClick={async () => {
                  try {
                    await addSavedBuildToCart(build.savedId);
                    setStatus("Saved build added to cart.");
                  } catch (error) {
                    setStatus(error.message || "Failed to add to cart.");
                  }
                }}
              >
                Add to Cart
              </button>
              <button
                className="toggle-btn"
                onClick={() => {
                  localStorage.setItem(
                    BUILDER_EDIT_DRAFT_KEY,
                    JSON.stringify({
                      savedId: build.savedId,
                      label: build.label,
                      selections: build.selections || {}
                    })
                  );
                  window.location.href = `/guitar-builder?editSavedId=${encodeURIComponent(build.savedId)}`;
                }}
              >
                Edit Build
              </button>
              <button
                className="toggle-btn"
                onClick={async () => {
                  try {
                    await removeSavedBuild(build.savedId);
                    setStatus("Saved build removed.");
                  } catch (error) {
                    setStatus(error.message || "Failed to remove.");
                  }
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}

// --------------------------------------------------
// Função: BuilderApp
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function BuilderApp() {
  const [state, dispatch] = useReducer(builderReducer, {
    view: "front",
    selections: { ...GuitarConfig.DEFAULT_SELECTIONS }
  });
  const requestedEditSavedId = useMemo(() => getEditSavedIdFromUrl(), []);
  const [status, setStatus] = useState("");
  const [buildName, setBuildName] = useState("Custom Build");
  const [editingSavedId, setEditingSavedId] = useState(requestedEditSavedId);
  const { saveCustomBuild, updateSavedBuild, savedBuilds, addCustomBuildToCart, items } = useCart();
  const { currentUser } = useAuth();
  const loadedEditRef = useRef("");

  /* Recomputed price rows and total keep the builder pricing live */
  const priceLines = useMemo(() => GuitarConfig.getPriceLines(state.selections), [state.selections]);
  const totalPrice = useMemo(() => GuitarConfig.getTotalPrice(state.selections), [state.selections]);
  const layers = useMemo(() => getLayers(state.view, state.selections), [state.view, state.selections]);
  const isEditingSavedBuild = Boolean(editingSavedId);

  useEffect(() => {
    const editSavedId = requestedEditSavedId;
    if (!editSavedId) return;
    if (loadedEditRef.current === editSavedId) return;

    // --------------------------------------------------
    // Função: applyBuild
    // O que faz: executa uma parte da lógica deste módulo.
    // Parâmetros: build.
    // Retorna: o resultado da operação (ou Promise, quando aplicável).
    // --------------------------------------------------
    function applyBuild(build) {
      dispatch({ type: "LOAD_SELECTIONS", selections: build.selections || {} });
      setBuildName(String(build.label || "Custom Build"));
      setEditingSavedId(editSavedId);
      setStatus(`Editing saved build: ${build.label || editSavedId}`);
      loadedEditRef.current = editSavedId;
      localStorage.removeItem(BUILDER_EDIT_DRAFT_KEY);
    }

    // --------------------------------------------------
    // Função: loadEditBuild
    // O que faz: executa uma parte da lógica deste módulo.
    // Parâmetros: nenhum parâmetro.
    // Retorna: o resultado da operação (ou Promise, quando aplicável).
    // --------------------------------------------------
    async function loadEditBuild() {
      let found = null;

      const draft = readBuilderEditDraft();
      if (draft && String(draft.savedId || "") === editSavedId) {
        found = draft;
      }

      if (!found && savedBuilds.length) {
        found = savedBuilds.find((build) => build.savedId === editSavedId) || null;
      }

      if (!found && currentUser && currentUser.username) {
        try {
          // Chamada à API: comunica com o backend para sincronizar estado no frontend.
          const response = await fetch(`${SAVED_API}/${encodeURIComponent(currentUser.username)}`);
          const data = await response.json().catch(() => []);
          if (response.ok && Array.isArray(data)) {
            found = data.find((build) => String(build.savedId) === editSavedId) || null;
          }
        } catch (error) {
          found = null;
        }
      }

      if (!found) {
        setStatus("Could not load the selected saved build.");
        return;
      }
      applyBuild(found);
    }

    loadEditBuild();
  }, [savedBuilds, currentUser, requestedEditSavedId]);

  /* Save build stores the custom build in local saved builds for later reuse */
  async function onSaveBuild() {
    try {
      const imagePreview = getCustomPreviewImage(state.selections);
      const safeLabel = String(buildName || "").trim() || "Custom Build";
      if (isEditingSavedBuild) {
        await updateSavedBuild(editingSavedId, {
          label: safeLabel,
          selections: state.selections,
          imagePreview
        });
        setStatus("Build changes saved.");
      } else {
        await saveCustomBuild(state.selections, imagePreview, safeLabel);
        setStatus("Build saved.");
      }
    } catch (error) {
      setStatus(error.message || "Save failed.");
    }
  }

  /* Add to cart creates one custom-build cart item with full breakdown */
  async function onAddToCart() {
    try {
      const imagePreview = getCustomPreviewImage(state.selections);
      const safeLabel = String(buildName || "").trim() || "Custom Build";
      await addCustomBuildToCart(state.selections, imagePreview, safeLabel, editingSavedId || "");
      setStatus("Added to cart.");
    } catch (error) {
      setStatus(error.message || "Add failed.");
    }
  }

  return (
    <div className="builder-shell">
      <aside className="builder-controls">
        <h2 className="builder-title">Customize Your Guitar</h2>
        {GuitarConfig.SECTIONS.map((section) => (
          <details key={section.id} className="builder-section" open={section.id === "general"}>
            <summary>{section.title}</summary>
            <div className="builder-section-body">
              {section.fields.map((field) => (
                <SelectField
                  key={field.key}
                  field={field}
                  value={state.selections[field.key]}
                  onChange={(key, value) => dispatch({ type: "SET_OPTION", key, value })}
                />
              ))}
            </div>
          </details>
        ))}
      </aside>

      <section className="builder-preview">
        <div className="preview-header">
          <div className="preview-title">2D Preview</div>
        </div>

        <div className="preview-stage">
          {layers.map((src, idx) => (
            <img
              key={`${state.view}-${idx}-${src}`}
              className="preview-layer"
              src={src}
              alt={`layer-${idx}`}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ))}
        </div>

        <div className="preview-toggle-row">
          <div className="toggle-group">
            <button className={`toggle-btn ${state.view === "front" ? "active" : ""}`} onClick={() => dispatch({ type: "SET_VIEW", view: "front" })}>FRONT</button>
            <button className={`toggle-btn ${state.view === "back" ? "active" : ""}`} onClick={() => dispatch({ type: "SET_VIEW", view: "back" })}>BACK</button>
          </div>
        </div>
      </section>

      <section className="builder-price-wrap">
        <div className="price-box">
          <div className="field">
            <label htmlFor="builderName">Build Name</label>
            <input
              id="builderName"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              placeholder="My Custom Build"
            />
          </div>

          <div className="price-title">Price Breakdown</div>
          <div className="price-line"><span>Base Guitar</span><span>${GuitarConfig.BASE_PRICE.toFixed(2)}</span></div>
          {priceLines.filter((line) => line.amount > 0).map((line) => (
            <div className="price-line" key={line.key}>
              <span>{line.label} ({line.selected})</span>
              <span>+${line.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="price-total"><span>Total</span><span>${totalPrice.toFixed(2)}</span></div>

          <div className="builder-action-row">
            <button className="toggle-btn active" onClick={onSaveBuild}>
              {isEditingSavedBuild ? "Save Changes" : "Save Build"}
            </button>
            <button className="toggle-btn active" onClick={onAddToCart}>Add to Cart</button>
            <a className="toggle-btn cart-link-btn" href="/cart/">Cart ({items.length})</a>
            <a className="toggle-btn cart-link-btn" href="/saved-builds/">Saved Builds</a>
          </div>
          {currentUser ? <p className="muted">Logged in as {currentUser.username}</p> : null}
          <p className="muted">{status}</p>
        </div>
      </section>

      <section className="builder-saved-wrap">
        <SavedBuildsPanel />
      </section>
    </div>
  );
}

/* Wrapper injects global cart context into the entire builder app */
function BuilderRoot() {
  return (
    <AuthProvider>
      <CartProvider>
        <BuilderApp />
      </CartProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("builder-app")).render(<BuilderRoot />);

