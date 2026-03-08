/*
Contexto global de autenticacao.
Guarda sessao no localStorage, faz login/registo no backend
e expoe estado do user (incluindo role admin) para toda a UI.
*/

/* global React */
(function initAuthContext(global) {
  const { createContext, useContext, useMemo, useState } = React;

  const SESSION_KEY = "guitarcraft_session_v1";
  const API_BASE = "/api/auth";
  const AuthContext = createContext(null);

  // --------------------------------------------------
  // Funcao: readSession
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function readSession() {
    // Recupera sessao local para manter login entre refreshes.
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  // --------------------------------------------------
  // Funcao: writeSession
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: session.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function writeSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  // --------------------------------------------------
  // Funcao: apiRequest
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: path, payload, method = "POST".
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function apiRequest(path, payload, method = "POST") {
    // Todas as operacoes de auth passam por este helper.
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
  // Funcao: AuthProvider
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: { children }.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => readSession());

    React.useEffect(() => {
      // Valida no backend se a sessao local ainda existe/esta valida.
      if (!currentUser || !currentUser.username) return;

      // Sincroniza a sessao local com a base de dados para evitar sessao invlida no cliente.
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
      // Funcao: register
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: { username, password }.
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function register({ username, password }) {
        // Cria conta e abre sessao automaticamente.
        const data = await apiRequest("/register", { username, password });
        const session = { username: data.username, role: data.role || "user" };
        writeSession(session);
        setCurrentUser(session);
        return session;
      }

      // --------------------------------------------------
      // Funcao: login
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: { username, password }.
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function login({ username, password }) {
        // Login normal e persistencia de sessao.
        const data = await apiRequest("/login", { username, password });
        const session = { username: data.username, role: data.role || "user" };
        writeSession(session);
        setCurrentUser(session);
        return session;
      }

      // --------------------------------------------------
      // Funcao: updateSettings
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: { currentPassword, newUsername, newPassword }.
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function updateSettings({ currentPassword, newUsername, newPassword }) {
        // Atualiza dados da conta e sincroniza sessao local.
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
      // Funcao: logout
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: nenhum parametro.
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
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
  // Funcao: useAuth
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function useAuth() {
    const value = useContext(AuthContext);
    if (!value) throw new Error("useAuth must be used inside AuthProvider");
    return value;
  }

  // --------------------------------------------------
  // Funcao: getSessionUser
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
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
