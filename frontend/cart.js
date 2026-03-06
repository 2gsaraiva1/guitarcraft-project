/*
Este módulo gere a UI da página do carrinho e ações de quantidade/remoção/checkout.
*/

/* global React, ReactDOM, GuitarConfig, GuitarCart, GuitarAuth */
const { CartProvider, useCart } = GuitarCart;
const { AuthProvider, useAuth } = GuitarAuth;

// --------------------------------------------------
// Função: CartApp
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function CartApp() {
  const { items, cartTotal, removeFromCart, updateCartQuantity } = useCart();
  const { currentUser } = useAuth();
  const [status, setStatus] = React.useState("");
  const [selected, setSelected] = React.useState({});
  const PLACEHOLDER = "/assets/placeholder-guitar.svg";

  React.useEffect(() => {
    setSelected((prev) => {
      const next = {};
      items.forEach((item) => {
        next[item.cartId] = prev[item.cartId] !== undefined ? prev[item.cartId] : true;
      });
      return next;
    });
  }, [items]);

  const selectedTotal = React.useMemo(() => {
    return items.reduce((sum, item) => {
      if (!selected[item.cartId]) return sum;
      return sum + (Number(item.unitPrice || item.totalPrice || 0) * Number(item.quantity || 1));
    }, 0);
  }, [items, selected]);

  const selectedIds = React.useMemo(
    () => items.filter((item) => selected[item.cartId]).map((item) => item.cartId),
    [items, selected]
  );

  // --------------------------------------------------
  // Função: toggleSelected
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: cartId, checked.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  function toggleSelected(cartId, checked) {
    setSelected((prev) => ({ ...prev, [cartId]: checked }));
  }

  if (!currentUser) {
    return <p>Login required.</p>;
  }

  if (!items.length) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div>
      <div className="cart-grid">
        {items.map((item) => (
          <div className="cart-card" key={item.cartId}>
            <div className="cart-row-head">
              <label className="cart-select">
                <input
                  type="checkbox"
                  checked={Boolean(selected[item.cartId])}
                  onChange={(e) => toggleSelected(item.cartId, e.target.checked)}
                />
                Select
              </label>
            </div>
            <img
              className="cart-item-image"
              src={item.image || item.imagePreview || PLACEHOLDER}
              alt={item.label}
              onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
            />
            <h3>{item.label}</h3>
            <p><strong>Type:</strong> {(item.type || item.itemType) === "prebuilt" ? "Pre-Built Guitar" : "Custom Build"}</p>
            <div className="qty-wrap">
              <button
                onClick={async () => {
                  try {
                    await updateCartQuantity(item.cartId, Math.max(1, Number(item.quantity || 1) - 1));
                  } catch (error) {
                    setStatus(error.message || "Failed to update quantity.");
                  }
                }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={Number(item.quantity || 1)}
                onChange={async (e) => {
                  const next = Math.max(1, Number(e.target.value || 1));
                  try {
                    await updateCartQuantity(item.cartId, next);
                  } catch (error) {
                    setStatus(error.message || "Failed to update quantity.");
                  }
                }}
              />
              <button
                onClick={async () => {
                  try {
                    await updateCartQuantity(item.cartId, Number(item.quantity || 1) + 1);
                  } catch (error) {
                    setStatus(error.message || "Failed to update quantity.");
                  }
                }}
              >
                +
              </button>
            </div>

            {(item.type || item.itemType) === "prebuilt" ? (
              <>
                <p><strong>Item Total:</strong> ${(Number(item.unitPrice || item.totalPrice || 0) * Number(item.quantity || 1)).toFixed(2)}</p>
                <div className="cart-specs">
                  <p><strong>Selected Specs</strong></p>
                  <p>
                    {Object.entries(item.selections || {})
                      .map(([key, value]) => `${GuitarConfig.formatLabel(key)}: ${String(value)}`)
                      .join(" | ")}
                  </p>
                </div>

                <div className="cart-breakdown">
                  <p><strong>Price Breakdown</strong></p>
                  {(item.priceBreakdown || [])
                    .filter((line) => Number(line.amount) > 0)
                    .map((line) => (
                      <p key={line.key || `${line.label}-${line.selected}`}>
                        {line.label} ({line.selected}): +${Number(line.amount).toFixed(2)}
                      </p>
                    ))}
                  <p><strong>Quantity:</strong> {Number(item.quantity || 1)}</p>
                  <p><strong>Total:</strong> ${(Number(item.unitPrice || item.totalPrice || 0) * Number(item.quantity || 1)).toFixed(2)}</p>
                </div>
              </>
            ) : (
              <>
                <p><strong>Item Total:</strong> ${(Number(item.unitPrice || item.totalPrice || 0) * Number(item.quantity || 1)).toFixed(2)}</p>
                <div className="cart-specs">
                  <p><strong>Selected Specs</strong></p>
                  <p>
                    {Object.entries(item.selections || {})
                      .map(([key, value]) => `${GuitarConfig.formatLabel(key)}: ${String(value)}`)
                      .join(" | ")}
                  </p>
                </div>

                <div className="cart-breakdown">
                  <p><strong>Price Breakdown</strong></p>
                  <p>Base Guitar: ${GuitarConfig.BASE_PRICE.toFixed(2)}</p>
                  {(item.priceBreakdown || [])
                    .filter((line) => Number(line.amount) > 0)
                    .map((line) => (
                      <p key={line.key || `${line.label}-${line.selected}`}>
                        {line.label} ({line.selected}): +${Number(line.amount).toFixed(2)}
                      </p>
                    ))}
                </div>
              </>
            )}

            <button
              onClick={async () => {
                try {
                  await removeFromCart(item.cartId);
                  setStatus("Cart item removed.");
                } catch (error) {
                  setStatus(error.message || "Failed to remove item.");
                }
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-total-box">
        <div className="cart-summary-line"><span>All Items Total</span><strong>${cartTotal.toFixed(2)}</strong></div>
        <div className="cart-summary-line"><span>Selected Items Total</span><strong>${selectedTotal.toFixed(2)}</strong></div>
        <h2>Checkout Total: ${selectedTotal.toFixed(2)}</h2>
        <div className="site-media-actions">
          <button
            onClick={() => {
              const ids = selectedIds.join(",");
              window.location.href = `/checkout/?ids=${encodeURIComponent(ids)}`;
            }}
            disabled={!selectedIds.length}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}

// --------------------------------------------------
// Função: CartRoot
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function CartRoot() {
  return (
    <AuthProvider>
      <CartProvider>
        <CartApp />
      </CartProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("cart-app")).render(<CartRoot />);
