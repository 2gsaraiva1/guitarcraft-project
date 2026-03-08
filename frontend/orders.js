/*
Este modulo gere a UI de historico de encomendas e cancelamento.
*/

/* global React, ReactDOM, GuitarAuth, GuitarCart */
const { AuthProvider } = GuitarAuth;
const { CartProvider, useCart } = GuitarCart;

// --------------------------------------------------
// Funcao: OrdersPage
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function OrdersPage() {
  const { orders, loadUserData } = useCart();
  const PLACEHOLDER = "/assets/placeholder-guitar.svg";
  const [status, setStatus] = React.useState("");
  const visibleOrders = (orders || []).filter((order) => String(order.status || "").toLowerCase() !== "cancelled");

  const sessionRaw = localStorage.getItem("guitarcraft_session_v1");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;
  const username = session && session.username ? session.username : "";

  if (!visibleOrders.length) {
    return (
      <div className="cart-card">
        <p>No orders yet.</p>
        <a className="shop-cart-link" href="/shop.html">Go to Shop</a>
      </div>
    );
  }

  return (
    <div className="account-wrap">
      {visibleOrders.map((order) => (
        <section className="cart-card" key={order.orderId} id={order.orderId}>
          <h2>Order {order.orderId}</h2>
          <p><strong>Date:</strong> {new Date(order.CREATEdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ${Number(order.totalPrice || 0).toFixed(2)}</p>
          {order.customerName ? <p><strong>Name:</strong> {order.customerName}</p> : null}
          {order.customerEmail ? <p><strong>Email:</strong> {order.customerEmail}</p> : null}
          {order.address && (order.address.line1 || order.address.city) ? (
            <p>
              <strong>Address:</strong>{" "}
              {[order.address.line1, order.address.line2, order.address.city, order.address.region, order.address.postalCode, order.address.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          ) : null}

          <div className="cart-grid">
            {(order.items || []).map((item) => (
              <article className="cart-card" key={`${order.orderId}-${item.cartId}`}>
                <img
                  className="cart-item-image"
                  src={item.image || PLACEHOLDER}
                  alt={item.label}
                  onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                />
                <h3>{item.label}</h3>
                <p><strong>Qty:</strong> {Number(item.quantity || 1)}</p>
                <p><strong>Total:</strong> ${Number(item.totalPrice || 0).toFixed(2)}</p>
              </article>
            ))}
          </div>
          {order.status !== "Cancelled" ? (
            <div className="site-media-actions">
              <button
                onClick={async () => {
                  try {
                    // Chamada  API: comunica com o backend para sincronizar estado no frontend.
                    const response = await fetch(`/api/orders/${encodeURIComponent(username)}/${encodeURIComponent(order.orderId)}/cancel`, {
                      method: "PUT"
                    });
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok) throw new Error(data.error || "Cancel failed.");
                    await loadUserData(username);
                    setStatus(`Order ${order.orderId} cancelled.`);
                  } catch (error) {
                    setStatus(error.message || "Failed to cancel order.");
                  }
                }}
              >
                Cancel Order
              </button>
            </div>
          ) : null}
        </section>
      ))}
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}

// --------------------------------------------------
// Funcao: OrdersRoot
// O que faz: executa uma parte da logica deste modulo.
// Parametros: nenhum parametro.
// Retorna: o resultado da operacao (ou Promise, quando aplicavel).
// --------------------------------------------------
function OrdersRoot() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrdersPage />
      </CartProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("orders-app")).render(<OrdersRoot />);
