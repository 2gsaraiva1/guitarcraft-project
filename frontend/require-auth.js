/*
Este mdulo valida no cliente se a rota atual exige utilizador autenticado.
*/

(function protectPage() {
  const API_BASE = "/api/auth";
  let session = null;
  try {
    const sessionRaw = localStorage.getItem("guitarcraft_session_v1");
    session = sessionRaw ? JSON.parse(sessionRaw) : null;
  } catch (error) {
    session = null;
  }

  if (!session || !session.username) {
    window.location.href = "/login/";
    return;
  }

  // Validao no backend para garantir que o utilizador da sesso existe na base de dados.
  (async () => {
    try {
      const response = await fetch(`${API_BASE}/session/${encodeURIComponent(session.username)}`);
      if (!response.ok) throw new Error("invalid-session");
      const data = await response.json().catch(() => ({}));
      if (!data || !data.username) throw new Error("invalid-session");
    } catch (error) {
      localStorage.removeItem("guitarcraft_session_v1");
      window.location.href = "/login/";
    }
  })();
})();
