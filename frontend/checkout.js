/*
Este modulo gere o fluxo de checkout e validacao de dados de pagamento.
*/

/* global React, ReactDOM, GuitarAuth, GuitarCart */
const { AuthProvider } = GuitarAuth;
const { CartProvider, useCart } = GuitarCart;

// --------------------------------------------------
// Funcao: CheckoutView
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function CheckoutView() {
  const { items, checkoutCartItems } = useCart();
  const [selected, setSelected] = React.useState({});
  const [status, setStatus] = React.useState("");
  const [error, setError] = React.useState("");
  const [processing, setProcessing] = React.useState(false);
  const [confirmedOrder, setConfirmedOrder] = React.useState(null);
  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  const requestedIds = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = String(params.get("ids") || "").trim();
    if (!raw) return [];
    return raw.split(",").map((id) => decodeURIComponent(id)).filter(Boolean);
  }, []);

  React.useEffect(() => {
    setSelected((prev) => {
      const next = {};
      items.forEach((item) => {
        if (prev[item.cartId] !== undefined) {
          next[item.cartId] = prev[item.cartId];
          return;
        }
        if (requestedIds.length) {
          next[item.cartId] = requestedIds.includes(item.cartId);
          return;
        }
        next[item.cartId] = true;
      });
      return next;
    });
  }, [items, requestedIds]);

  const selectedItems = items.filter((item) => selected[item.cartId]);
  const selectedIds = selectedItems.map((item) => item.cartId);
  const total = selectedItems.reduce(
    (sum, item) => sum + (Number(item.unitPrice || item.totalPrice || 0) * Number(item.quantity || 1)),
    0
  );

  // --------------------------------------------------
  // Funcao: onField
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: key, value.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function onField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // --------------------------------------------------
  // Funcao: formatExpiry
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: value.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function formatExpiry(value) {
    const digits = String(value || "").replace(/[^\d]/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  // --------------------------------------------------
  // Funcao: validate
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function validate() {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.email.trim() || !form.email.includes("@")) return "Valid email is required.";
    if (!form.addressLine1.trim()) return "Address line 1 is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.region.trim()) return "State/Region is required.";
    if (!form.postalCode.trim()) return "Postal code is required.";
    if (!form.country.trim()) return "Country is required.";
    if (!form.cardName.trim()) return "Name on card is required.";
    if (!/^\d{13,19}$/.test(form.cardNumber.replace(/\s+/g, ""))) return "Card number is invalid.";
    if (!/^\d{2}\/\d{2}$/.test(form.expiry.trim())) return "Expiry must be MM/YY.";
    if (!/^\d{3,4}$/.test(form.cvv.trim())) return "CVV is invalid.";
    if (!selectedIds.length) return "Select at least one item.";
    return "";
  }

  // --------------------------------------------------
  // Funcao: onCompletePurchase
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function onCompletePurchase() {
    setError("");
    setStatus("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setProcessing(true);
      const result = await checkoutCartItems(selectedIds, form);
      const orderId = result && result.order && result.order.orderId
        ? result.order.orderId
        : `GC-${Date.now().toString().slice(-8)}`;
      setConfirmedOrder({
        orderId,
        total,
        items: selectedItems.length
      });
      setStatus("Payment approved. Order confirmed.");
    } catch (err) {
      setError(err.message || "Checkout failed.");
    } finally {
      setProcessing(false);
    }
  }

  if (confirmedOrder) {
    return (
      <section className="checkout-confirm">
        <h2>Order Confirmed</h2>
        <p><strong>Order:</strong> {confirmedOrder.orderId}</p>
        <p><strong>Items:</strong> {confirmedOrder.items}</p>
        <p><strong>Total Paid:</strong> €{Number(confirmedOrder.total).toFixed(2)}</p>
        <p className="muted">{status}</p>
        <div className="gc-cart-actions">
          <a href="/orders/" className="gc-mini-btn gc-mini-btn-primary">View Orders</a>
          <a href="/shop.html" className="gc-mini-btn">Continue Shopping</a>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <div className="checkout-empty">
        <p>Your cart is empty.</p>
        <a className="shop-cart-link" href="/shop.html">Go to Shop</a>
      </div>
    );
  }

  return (
    <div className="checkout-layout">
      <section className="cart-card checkout-form">
        <h2>Checkout Details</h2>
        <div className="auth-form">
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" value={form.fullName} onChange={(e) => onField("fullName", e.target.value)} />

          <label htmlFor="email">Email</label>
          <input id="email" value={form.email} onChange={(e) => onField("email", e.target.value)} />

          <h3>Address</h3>
          <label htmlFor="addressLine1">Address Line 1</label>
          <input id="addressLine1" value={form.addressLine1} onChange={(e) => onField("addressLine1", e.target.value)} />

          <label htmlFor="addressLine2">Address Line 2 (Optional)</label>
          <input id="addressLine2" value={form.addressLine2} onChange={(e) => onField("addressLine2", e.target.value)} />

          <div className="checkout-inline">
            <div>
              <label htmlFor="city">City</label>
              <input id="city" value={form.city} onChange={(e) => onField("city", e.target.value)} />
            </div>
            <div>
              <label htmlFor="region">State / Region</label>
              <input id="region" value={form.region} onChange={(e) => onField("region", e.target.value)} />
            </div>
          </div>

          <div className="checkout-inline">
            <div>
              <label htmlFor="postalCode">Postal Code</label>
              <input id="postalCode" value={form.postalCode} onChange={(e) => onField("postalCode", e.target.value)} />
            </div>
            <div>
              <label htmlFor="country">Country</label>
              <input id="country" value={form.country} onChange={(e) => onField("country", e.target.value)} />
            </div>
          </div>

          <h3>Card Details</h3>
          <label htmlFor="cardName">Name on Card</label>
          <input id="cardName" value={form.cardName} onChange={(e) => onField("cardName", e.target.value)} />

          <label htmlFor="cardNumber">Card Number</label>
          <input
            id="cardNumber"
            value={form.cardNumber}
            onChange={(e) => onField("cardNumber", e.target.value.replace(/[^\d ]/g, ""))}
            placeholder="4242 4242 4242 4242"
          />

          <div className="checkout-inline">
            <div>
              <label htmlFor="expiry">Expiry (MM/YY)</label>
              <input
                id="expiry"
                value={form.expiry}
                onChange={(e) => onField("expiry", formatExpiry(e.target.value))}
                placeholder="12/29"
              />
            </div>
            <div>
              <label htmlFor="cvv">CVV</label>
              <input
                id="cvv"
                value={form.cvv}
                onChange={(e) => onField("cvv", e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                placeholder="123"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="cart-card checkout-summary">
        <h2>Review Items</h2>
        {items.map((item) => (
          <label key={item.cartId} className="cart-select" style={{ display: "flex", marginBottom: "8px" }}>
            <input
              type="checkbox"
              checked={Boolean(selected[item.cartId])}
              onChange={(e) => setSelected((prev) => ({ ...prev, [item.cartId]: e.target.checked }))}
            />
            <span>{item.label} - Qty {Number(item.quantity || 1)} - €{(Number(item.unitPrice || item.totalPrice || 0) * Number(item.quantity || 1)).toFixed(2)}</span>
          </label>
        ))}
        <h2>Total: €{total.toFixed(2)}</h2>
        <button onClick={onCompletePurchase} disabled={processing}>
          {processing ? "Processing..." : "Complete Purchase"}
        </button>
        {error ? <p className="auth-error">{error}</p> : null}
        {status ? <p className="muted">{status}</p> : null}
        <a className="shop-cart-link" href="/cart/">Back to Cart</a>
      </section>

      <section className="cart-card checkout-note">
        <h2>Secure Checkout</h2>
        <p className="muted">This is a demo checkout flow for GuitarCraft. No REAL payment is processed.</p>
      </section>
    </div>
  );
}

// --------------------------------------------------
// Funcao: CheckoutRoot
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function CheckoutRoot() {
  return (
    <AuthProvider>
      <CartProvider>
        <CheckoutView />
      </CartProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("checkout-app")).render(<CheckoutRoot />);
