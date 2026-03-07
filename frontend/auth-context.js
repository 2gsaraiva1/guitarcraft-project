/*
Este mÃƒÂ³dulo mantÃƒÂ©m o estado global de autenticaÃƒÂ§ÃƒÂ£o no frontend.
*/

/* global React */
(function initAuthContext(global) {
  const { createContext, useContext, useMemo, useState } = React;

  const SESSION_KEY = "guitarcraft_session_v1";
  const API_BASE = "/api/auth";
  const AuthContext = createContext(null);

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: readSession
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: nenhum parÃƒÂ¢metro.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function readSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: writeSession
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: session.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function writeSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: apiRequest
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: path, payload, method = "POST".
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  async function apiRequest(path, payload, method = "POST") {
    // Chamada ÃƒÂ  API: comunica com o backend para sincronizar estado no frontend.
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Auth request failed.");
    }
    return data;
  }

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: AuthProvider
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: { children }.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => readSession());

    React.useEffect(() => {
      if (!currentUser || !currentUser.username) return;

      // Sincroniza a sessÃƒÂ£o local com a base de dados para evitar sessÃƒÂ£o invÃƒÂ¡lida no cliente.
      (async () => {
        try {
          const response = await fetch(`${API_BASE}/session/${encodeURIComponent(currentUser.username)}`);
          if (!response.ok) throw new Error("invalid-session");
          const data = await response.json().catch(() => ({}));
          if (!data || !data.username) throw new Error("invalid-session");

          const nextSession = {
            username: data.username,
            role: data.role || "user"
          };
          writeSession(nextSession);
          setCurrentUser((prev) => {
            if (!prev) return nextSession;
            if (prev.username === nextSession.username && prev.role === nextSession.role) return prev;
            return nextSession;
          });
        } catch (error) {
          localStorage.removeItem(SESSION_KEY);
          setCurrentUser(null);
          window.dispatchEvent(new CustomEvent("guitarcraft_session_updated"));
        }
      })();
    }, [currentUser && currentUser.username]);

    const value = useMemo(() => {
      // --------------------------------------------------
      // FunÃƒÂ§ÃƒÂ£o: register
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: { username, password }.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      async function register({ username, password }) {
        const data = await apiRequest("/register", { username, password });
        const session = { username: data.username, role: data.role || "user" };
        writeSession(session);
        setCurrentUser(session);
        return session;
      }

      // --------------------------------------------------
      // FunÃƒÂ§ÃƒÂ£o: login
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: { username, password }.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      async function login({ username, password }) {
        const data = await apiRequest("/login", { username, password });
        const session = { username: data.username, role: data.role || "user" };
        writeSession(session);
        setCurrentUser(session);
        return session;
      }

      // --------------------------------------------------
      // FunÃƒÂ§ÃƒÂ£o: updateSettings
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: { currentPassword, newUsername, newPassword }.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      async function updateSettings({ currentPassword, newUsername, newPassword }) {
        if (!currentUser || !currentUser.username) throw new Error("Login required.");
        const data = await apiRequest(
          "/settings",
          {
            actorUsername: currentUser.username,
            currentPassword,
            newUsername,
            newPassword
          },
          "PUT"
        );
        const session = { username: data.user.username, role: data.user.role || currentUser.role || "user" };
        writeSession(session);
        setCurrentUser(session);
        window.dispatchEvent(new CustomEvent("guitarcraft_session_updated"));
        return session;
      }

      // --------------------------------------------------
      // FunÃƒÂ§ÃƒÂ£o: logout
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: nenhum parÃƒÂ¢metro.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      function logout() {
        localStorage.removeItem(SESSION_KEY);
        setCurrentUser(null);
      }

      return {
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isAdmin: Boolean(currentUser && currentUser.role === "admin"),
        register,
        login,
        updateSettings,
        logout
      };
    }, [currentUser]);

    return React.createElement(AuthContext.Provider, { value }, children);
  }

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: useAuth
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: nenhum parÃƒÂ¢metro.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function useAuth() {
    const value = useContext(AuthContext);
    if (!value) throw new Error("useAuth must be used inside AuthProvider");
    return value;
  }

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: getSessionUser
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: nenhum parÃƒÂ¢metro.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function getSessionUser() {
    return readSession();
  }

  global.GuitarAuth = {
    AuthProvider,
    useAuth,
    getSessionUser
  };
})(window);
