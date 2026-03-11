/*
Este modulo gere a pagina de builds guardadas (editar, adicionar ao carrinho e apagar).
*/

/* global React, ReactDOM, GuitarConfig, GuitarCart, GuitarAuth */
const { CartProvider, useCart } = GuitarCart;
const { AuthProvider } = GuitarAuth;
const BUILDER_EDIT_DRAFT_KEY = "guitarcraft_builder_edit_v1";

// --------------------------------------------------
// Funcao: SavedBuildsPage
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function SavedBuildsPage() {
  const { savedBuilds, addSavedBuildToCart, removeSavedBuild, updateSavedBuild, items } = useCart();
  const [status, setStatus] = React.useState("");
  const [editingId, setEditingId] = React.useState("");
  const [editingLabel, setEditingLabel] = React.useState("");
  const PLACEHOLDER = "/assets/placeholder-guitar.svg";

  // --------------------------------------------------
  // Funcao: startRename
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: build.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function startRename(build) {
    setEditingId(build.savedId);
    setEditingLabel(String(build.label || "Custom Build"));
    setStatus("");
  }

  // --------------------------------------------------
  // Funcao: cancelRename
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function cancelRename() {
    setEditingId("");
    setEditingLabel("");
  }

  if (!savedBuilds.length) {
    return (
      <div>
        <p>No saved builds yet.</p>
        <a className="shop-cart-link" href="/guitar-builder.html">Go to Builder</a>
      </div>
    );
  }

  return (
    <div>
      <div className="shop-toolbar">
        <a className="shop-cart-link" href="/cart/">Cart ({items.length})</a>
      </div>
      <div className="cart-grid">
        {savedBuilds.map((build) => (
          <div className="cart-card" key={build.savedId}>
            <img
              className="cart-item-image"
              src={build.imagePreview || PLACEHOLDER}
              alt={build.label}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
            />
            {editingId === build.savedId ? (
              <div className="saved-inline-edit">
                <input
                  className="saved-inline-input"
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  placeholder="Build name"
                />
                <div className="saved-inline-actions">
                  <button
                    onClick={async () => {
                      try {
                        const nextLabel = String(editingLabel || "").trim() || "Custom Build";
                        await updateSavedBuild(build.savedId, { label: nextLabel });
                        setStatus("Build name updated.");
                        cancelRename();
                      } catch (error) {
                        setStatus(error.message || "Failed to update name.");
                      }
                    }}
                  >
                    Save Name
                  </button>
                  <button onClick={cancelRename}>Cancel</button>
                </div>
              </div>
            ) : (
              <h3>{build.label}</h3>
            )}
            <p><strong>Saved:</strong> {new Date(build.CREATEdAt).toLocaleString()}</p>
            <p><strong>Total:</strong> €{Number(build.totalPrice || 0).toFixed(2)}</p>

            <div className="cart-specs">
              <p><strong>Selected Specs</strong></p>
              {Object.entries(build.selections || {}).map(([key, value]) => (
                <p key={key}>
                  <span>{GuitarConfig.formatLabel(key)}:</span> {String(value)}
                </p>
              ))}
            </div>

            <div className="card-actions">
              <button
                onClick={async () => {
                  try {
                    await addSavedBuildToCart(build.savedId);
                    setStatus("Added saved build to cart.");
                  } catch (error) {
                    setStatus(error.message || "Failed to add.");
                  }
                }}
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  localStorage.setItem(
                    BUILDER_EDIT_DRAFT_KEY,
                    JSON.stringify({
                      savedId: build.savedId,
                      label: build.label,
                      selections: build.selections || {}
                    })
                  );
                  window.location.href = `/guitar-builder.html?editSavedId=${encodeURIComponent(build.savedId)}`;
                }}
              >
                Edit Build
              </button>
              {editingId === build.savedId ? null : (
                <button onClick={() => startRename(build)}>
                  Rename
                </button>
              )}
              <button
                onClick={async () => {
                  try {
                    await removeSavedBuild(build.savedId);
                    setStatus("Saved build deleted.");
                  } catch (error) {
                    setStatus(error.message || "Failed to delete.");
                  }
                }}
              >
                Delete
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
// Funcao: SavedBuildsRoot
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function SavedBuildsRoot() {
  return (
    <AuthProvider>
      <CartProvider>
        <SavedBuildsPage />
      </CartProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("saved-builds-app")).render(<SavedBuildsRoot />);
