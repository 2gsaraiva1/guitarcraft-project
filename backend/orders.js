/*
Este ficheiro gere a area de encomendas do utilizador.
Permite listar historico e cancelar encomendas ativas.
*/

const express = require("express");
const db = require("./db");

const router = express.Router();

// --------------------------------------------------
// Funcao: getUser
// O que faz: valida o utilizador antes de ler/editar encomendas.
// Parametros: username (string).
// Retorna: Promise com user ou null.
// --------------------------------------------------
function getUser(username) {
  return new Promise((resolve, reject) => {
    // Query DB: leitura do user dono das encomendas.
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// --------------------------------------------------
// Funcao: allSql
// O que faz: executa queries de leitura com varias linhas.
// Parametros: sql (string), params (array opcional).
// Retorna: Promise com rows.
// --------------------------------------------------
function allSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query DB: listagem de encomendas do utilizador.
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// --------------------------------------------------
// Funcao: runSql
// O que faz: executa alteracoes em encomendas (ex.: cancelar).
// Parametros: sql (string), params (array opcional).
// Retorna: Promise com resultado da query.
// --------------------------------------------------
function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query DB: escrita de status da encomenda.
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// Rota API (GET /:username): devolve historico de encomendas nao canceladas.
router.get("/:username", async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });

    const rows = await allSql(
      "SELECT * FROM orders WHERE user_id = ? AND status != 'Cancelled' ORDER BY created_at DESC",
      [user.id]
    );
    const mapped = rows.map((row) => ({
      orderId: row.id,
      items: JSON.parse(row.items_json || "[]"),
      totalPrice: Number(row.total_price || 0),
      customerName: row.customer_name || "",
      customerEmail: row.customer_email || "",
      address: JSON.parse(row.address_json || "{}"),
      status: row.status || "Paid",
      createdAt: row.created_at
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Failed to load orders." });
  }
});

// Rota API (PUT /:username/:orderId/cancel): marca encomenda como Cancelled.
router.put("/:username/:orderId/cancel", async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });

    const orderId = String(req.params.orderId);
    const result = await runSql(
      "UPDATE orders SET status = 'Cancelled' WHERE user_id = ? AND id = ? AND status != 'Cancelled'",
      [user.id, orderId]
    );
    if (!result.changes) return res.status(404).json({ error: "Order not found or already cancelled." });

    res.json({ message: "Order cancelled." });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel order." });
  }
});

module.exports = router;
