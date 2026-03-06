/*
Este módulo mantém o estado global de autenticação no frontend.
*/

/* global React */
(function initAuthContext(global) {
  const { createContext, useContext, useMemo, useState } = React;

  const SESSION_KEY = "guitarcraft_session_v1";
  const API_BASE = "http://localhost:3000/api/auth";
  const AuthContext = createContext(null);

  // --------------------------------------------------
  // Função: readSession
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: nenhum parâmetro.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
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
  // Função: writeSession
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: session.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  function writeSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  // --------------------------------------------------
  // Função: apiRequest
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: path, payload, method = "POST".
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  async function apiRequest(path, payload, method = "POST") {
    // Chamada à API: comunica com o backend para sincronizar estado no frontend.
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
  // Função: AuthProvider
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: { children }.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => readSession());

    React.useEffect(() => {
      if (!currentUser || !currentUser.username) return;

      // Sincroniza a sessão local com a base de dados para evitar sessão inválida no cliente.
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
      // Função: register
      // O que faz: executa uma parte da lógica deste módulo.
      // Parâmetros: { username, password }.
      // Retorna: o resultado da operação (ou Promise, quando aplicável).
      // --------------------------------------------------
      async function register({ username, password }) {
        const data = await apiRequest("/register", { username, password });
        const session = { username: data.username, role: data.role || "user" };
        writeSession(session);
        setCurrentUser(session);
        return session;
      }

      // --------------------------------------------------
      // Função: login
      // O que faz: executa uma parte da lógica deste módulo.
      // Parâmetros: { username, password }.
      // Retorna: o resultado da operação (ou Promise, quando aplicável).
      // --------------------------------------------------
      async function login({ username, password }) {
        const data = await apiRequest("/login", { username, password });
        const session = { username: data.username, role: data.role || "user" };
        writeSession(session);
        setCurrentUser(session);
        return session;
      }

      // --------------------------------------------------
      // Função: updateSettings
      // O que faz: executa uma parte da lógica deste módulo.
      // Parâmetros: { currentPassword, newUsername, newPassword }.
      // Retorna: o resultado da operação (ou Promise, quando aplicável).
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
      // Função: logout
      // O que faz: executa uma parte da lógica deste módulo.
      // Parâmetros: nenhum parâmetro.
      // Retorna: o resultado da operação (ou Promise, quando aplicável).
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
  // Função: useAuth
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: nenhum parâmetro.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  function useAuth() {
    const value = useContext(AuthContext);
    if (!value) throw new Error("useAuth must be used inside AuthProvider");
    return value;
  }

  // --------------------------------------------------
  // Função: getSessionUser
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: nenhum parâmetro.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
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
