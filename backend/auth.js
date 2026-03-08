/*
Este ficheiro gere a autenticacao e o registo de utilizadores no backend.
*/

const express = require("express");
const db = require("./db");

const router = express.Router();

// --------------------------------------------------
// Funcao: getUserByUsername
// O que faz: procura um utilizador pelo username para login, registo e sessao.
// Parametros: username (string).
// Retorna: Promise com o utilizador encontrado ou null.
// --------------------------------------------------
function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    // Query DB: le dados da tabela users para validar credenciais.
    db.get("SELECT id, username, role, password FROM users WHERE username = ?", [username], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// --------------------------------------------------
// Funcao: runSql
// O que faz: executa queries de escrita (INSERT/UPDATE) neste modulo.
// Parametros: sql (string), params (array opcional).
// Retorna: Promise com o resultado da execucao da query.
// --------------------------------------------------
function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query DB: grava alteracoes de conta (registo e settings).
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// Rota API (POST /register): cria conta nova se username ainda nao existir.
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

// Rota API (POST /login): valida credenciais e devolve dados da sessao.
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

// Rota API (PUT /settings): altera username/password do utilizador autenticado.
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

// Rota API (GET /session/:username): confirma se o user da sessao ainda existe.
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
