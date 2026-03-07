/*
Este mÃƒÂ³dulo gere os formulÃƒÂ¡rios de login e registo no frontend.
*/

/* global React, ReactDOM, GuitarAuth */
const { useState } = React;
const { AuthProvider, useAuth } = GuitarAuth;

// --------------------------------------------------
// FunÃƒÂ§ÃƒÂ£o: AuthForm
// O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
// ParÃƒÂ¢metros: { mode }.
// Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
// --------------------------------------------------
function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const isLogin = mode === "login";

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: handleSubmit
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: e.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    try {
      if (isLogin) {
        await login({ username, password });
        window.location.href = "/shop.html";
      } else {
        await register({ username, password });
        window.location.href = "/shop.html";
      }
    } catch (error) {
      setStatus(error.message || "Authentication failed.");
    }
  }

  return (
    <div className="auth-wrap">
      <h1>{isLogin ? "Login" : "Register"}</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">{isLogin ? "Login" : "Create Account"}</button>
      </form>
      {status ? <p className="auth-error">{status}</p> : null}
      <p className="auth-switch">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <a href={isLogin ? "/register/" : "/login/"}>{isLogin ? "Register" : "Login"}</a>
      </p>
      <p className="muted">Admin demo: username `admin`, password `admin123`</p>
    </div>
  );
}

// --------------------------------------------------
// FunÃƒÂ§ÃƒÂ£o: AuthPageRoot
// O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
// ParÃƒÂ¢metros: nenhum parÃƒÂ¢metro.
// Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
// --------------------------------------------------
function AuthPageRoot() {
  const mode = document.body.getAttribute("data-auth-mode") || "login";
  return (
    <AuthProvider>
      <AuthForm mode={mode} />
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById("auth-app")).render(<AuthPageRoot />);
