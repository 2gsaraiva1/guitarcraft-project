/*
Este mdulo valida no cliente se a rota atual exige perfil de administrador.
*/

(function protectAdminPage() {
  const API_BASE = "/api/auth";
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem("guitarcraft_session_v1") || "null");
  } catch (error) {
    session = null;
  }

  if (!session || !session.username) {
    window.location.href = "/index.html";
    return;
  }

  // Validao no backend para confirmar role real do utilizador na base de dados.
  (async () => {
    try {
      const response = await fetch(`${API_BASE}/session/${encodeURIComponent(session.username)}`);
      if (!response.ok) throw new Error("invalid-session");
      const data = await response.json().catch(() => ({}));
      if (!data || data.role !== "admin") throw new Error("not-admin");
    } catch (error) {
      localStorage.removeItem("guitarcraft_session_v1");
      window.location.href = "/index.html";
    }
  })();
})();
