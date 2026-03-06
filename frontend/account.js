/*
Este módulo controla a página de conta, dados do utilizador e definições de perfil.
*/

/* global React, ReactDOM, GuitarAuth, GuitarCart */
const { AuthProvider, useAuth } = GuitarAuth;
const { CartProvider, useCart } = GuitarCart;

// --------------------------------------------------
// Função: AccountView
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function AccountView() {
  const { currentUser, updateSettings } = useAuth();
  const { savedBuilds, orders } = useCart();
  const visibleOrders = (orders || []).filter((order) => String(order.status || "").toLowerCase() !== "cancelled");
  const [settingsForm, setSettingsForm] = React.useState({
    newUsername: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [settingsStatus, setSettingsStatus] = React.useState("");
  const [settingsError, setSettingsError] = React.useState("");

  if (!currentUser) return <p>Login required.</p>;

  const email = `${String(currentUser.username).toLowerCase()}@guitarcrafttone.com`;

  // --------------------------------------------------
  // Função: onSettingsField
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: key, value.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  function onSettingsField(key, value) {
    setSettingsForm((prev) => ({ ...prev, [key]: value }));
  }

  // --------------------------------------------------
  // Função: onSaveSettings
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: e.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  async function onSaveSettings(e) {
    e.preventDefault();
    setSettingsStatus("");
    setSettingsError("");

    if (!settingsForm.currentPassword.trim()) {
      setSettingsError("Current password is required.");
      return;
    }
    if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmNewPassword) {
      setSettingsError("New password and confirmation do not match.");
      return;
    }

    try {
      await updateSettings({
        currentPassword: settingsForm.currentPassword,
        newUsername: settingsForm.newUsername.trim() || currentUser.username,
        newPassword: settingsForm.newPassword.trim()
      });
      setSettingsStatus("Account settings updated.");
      setSettingsForm({
        newUsername: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
    } catch (error) {
      setSettingsError(error.message || "Failed to update settings.");
    }
  }

  return (
    <div className="account-wrap">
      <section className="cart-card">
        <h2>User Info</h2>
        <p><strong>Name:</strong> {currentUser.username}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Role:</strong> {currentUser.role}</p>
      </section>

      <section className="cart-card" id="settings">
        <h2>Account Settings</h2>
        <form className="auth-form" onSubmit={onSaveSettings}>
          <label htmlFor="newUsername">New Username</label>
          <input
            id="newUsername"
            placeholder={currentUser.username}
            value={settingsForm.newUsername}
            onChange={(e) => onSettingsField("newUsername", e.target.value)}
          />

          <label htmlFor="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            value={settingsForm.currentPassword}
            onChange={(e) => onSettingsField("currentPassword", e.target.value)}
            required
          />

          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            value={settingsForm.newPassword}
            onChange={(e) => onSettingsField("newPassword", e.target.value)}
          />

          <label htmlFor="confirmNewPassword">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            type="password"
            value={settingsForm.confirmNewPassword}
            onChange={(e) => onSettingsField("confirmNewPassword", e.target.value)}
          />

          <button type="submit">Save Settings</button>
          {settingsError ? <p className="auth-error">{settingsError}</p> : null}
          {settingsStatus ? <p className="muted">{settingsStatus}</p> : null}
        </form>
      </section>

      <section className="cart-card">
        <h2>Saved Builds</h2>
        {!savedBuilds.length ? (
          <p className="muted">No saved builds yet.</p>
        ) : (
          <div className="spec-chip-wrap">
            {savedBuilds.slice(0, 6).map((build) => (
              <span className="spec-chip" key={build.savedId}>{build.label}</span>
            ))}
          </div>
        )}
        <p style={{ marginTop: "10px" }}>
          <a className="shop-cart-link" href="/saved-builds/">Open Saved Builds Page</a>
        </p>
      </section>

      <section className="cart-card" id="orders">
        <h2>Order History</h2>
        {!visibleOrders.length ? (
          <p className="muted">No orders available yet.</p>
        ) : (
          <>
            {visibleOrders.slice(0, 8).map((order) => (
              <p key={order.orderId}>
                <strong>{order.orderId}</strong>
                {" "} - {new Date(order.createdAt).toLocaleString()} - ${Number(order.totalPrice || 0).toFixed(2)} - {order.status}
              </p>
            ))}
            <p style={{ marginTop: "10px" }}>
              <a className="shop-cart-link" href="/orders/">Open Full Orders Page</a>
            </p>
          </>
        )}
      </section>
    </div>
  );
}

// --------------------------------------------------
// Função: AccountRoot
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function AccountRoot() {
  return (
    <AuthProvider>
      <CartProvider>
        <AccountView />
      </CartProvider>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("account-app")).render(<AccountRoot />);
