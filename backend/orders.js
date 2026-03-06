/*
Este ficheiro gere criação, listagem e atualização de encomendas.
*/

const express = require("express");
const db = require("./db");

const router = express.Router();

// --------------------------------------------------
// Função: getUser
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: username.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function getUser(username) {
  return new Promise((resolve, reject) => {
    // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// --------------------------------------------------
// Função: allSql
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: sql, params = [].
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function allSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
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

// Rota API (GET): recebe pedido HTTP, valida dados e devolve resposta adequada.
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

// Rota API (PUT): recebe pedido HTTP, valida dados e devolve resposta adequada.
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
