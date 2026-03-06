/*
Este ficheiro gere a autenticação e o registo de utilizadores no backend.
*/

const express = require("express");
const db = require("./db");

const router = express.Router();

// --------------------------------------------------
// Função: getUserByUsername
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: username.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
    db.get("SELECT id, username, role, password FROM users WHERE username = ?", [username], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// --------------------------------------------------
// Função: runSql
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: sql, params = [].
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// Rota API (POST): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.post("/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "").trim();
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const found = await getUserByUsername(username);
    if (found) return res.status(409).json({ error: "Username already exists." });

    await runSql("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, password, "user"]);
    res.status(201).json({ username, role: "user" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed." });
  }
});

// Rota API (POST): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.post("/login", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "").trim();
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const found = await getUserByUsername(username);
    if (!found || found.password !== password) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    res.json({ username: found.username, role: found.role || "user" });
  } catch (error) {
    res.status(500).json({ error: "Login failed." });
  }
});

// Rota API (PUT): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.put("/settings", async (req, res) => {
  try {
    const actorUsername = String(req.body.actorUsername || "").trim();
    const currentPassword = String(req.body.currentPassword || "").trim();
    const nextUsernameRaw = String(req.body.newUsername || "").trim();
    const nextPassword = String(req.body.newPassword || "").trim();

    if (!actorUsername || !currentPassword) {
      return res.status(400).json({ error: "Current username and password are required." });
    }

    const found = await getUserByUsername(actorUsername);
    if (!found || found.password !== currentPassword) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const nextUsername = nextUsernameRaw || found.username;
    if (!nextUsername) {
      return res.status(400).json({ error: "Username cannot be empty." });
    }

    if (nextUsername !== found.username) {
      const existing = await getUserByUsername(nextUsername);
      if (existing) return res.status(409).json({ error: "Username already exists." });
    }

    const finalPassword = nextPassword || found.password;
    await runSql(
      "UPDATE users SET username = ?, password = ? WHERE id = ?",
      [nextUsername, finalPassword, found.id]
    );

    res.json({
      message: "Account settings updated.",
      user: { username: nextUsername, role: found.role || "user" }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update account settings." });
  }
});

// Rota API (GET): valida se o utilizador existe em base de dados e devolve dados de sessão.
router.get("/session/:username", async (req, res) => {
  try {
    const username = String(req.params.username || "").trim();
    if (!username) {
      return res.status(400).json({ error: "Username is required." });
    }

    const found = await getUserByUsername(username);
    if (!found) {
      return res.status(404).json({ error: "Session user not found." });
    }

    res.json({
      username: found.username,
      role: found.role || "user"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to validate session." });
  }
});

module.exports = router;
