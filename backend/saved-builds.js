/*
Este ficheiro gere o sistema de builds guardadas por utilizador.
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
    const rows = await allSql("SELECT * FROM saved_builds WHERE user_id = ? ORDER BY created_at DESC", [user.id]);
    const mapped = rows.map((row) => ({
      savedId: row.id,
      label: row.label,
      selections: JSON.parse(row.selections_json || "{}"),
      priceBreakdown: JSON.parse(row.breakdown_json || "[]"),
      totalPrice: Number(row.total_price),
      imagePreview: row.image_preview || "",
      createdAt: row.created_at
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Failed to load saved builds." });
  }
});

// Rota API (POST): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.post("/:username", async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });
    const build = req.body.build;
    if (!build || !build.savedId) return res.status(400).json({ error: "Saved build payload is required." });

    await runSql(
      `INSERT OR REPLACE INTO saved_builds
      (id, user_id, label, selections_json, breakdown_json, total_price, image_preview, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(build.savedId),
        user.id,
        String(build.label || "Custom Build"),
        JSON.stringify(build.selections || {}),
        JSON.stringify(build.priceBreakdown || []),
        Number(build.totalPrice || 0),
        String(build.imagePreview || ""),
        String(build.createdAt || new Date().toISOString())
      ]
    );

    res.status(201).json({ message: "Build saved." });
  } catch (error) {
    res.status(500).json({ error: "Failed to save build." });
  }
});

// Rota API (PUT): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.put("/:username/:savedId", async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });
    const build = req.body.build || {};
    const savedId = String(req.params.savedId || "").trim();
    if (!savedId) return res.status(400).json({ error: "Saved build id is required." });

    const result = await runSql(
      `UPDATE saved_builds
       SET label = ?, selections_json = ?, breakdown_json = ?, total_price = ?, image_preview = ?
       WHERE user_id = ? AND id = ?`,
      [
        String(build.label || "Custom Build"),
        JSON.stringify(build.selections || {}),
        JSON.stringify(build.priceBreakdown || []),
        Number(build.totalPrice || 0),
        String(build.imagePreview || ""),
        user.id,
        savedId
      ]
    );
    if (!result.changes) return res.status(404).json({ error: "Saved build not found." });
    res.json({ message: "Saved build updated." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update saved build." });
  }
});

// Rota API (DELETE): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.delete("/:username/:savedId", async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });
    const result = await runSql("DELETE FROM saved_builds WHERE user_id = ? AND id = ?", [user.id, String(req.params.savedId)]);
    if (!result.changes) return res.status(404).json({ error: "Saved build not found." });
    res.json({ message: "Saved build deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete saved build." });
  }
});

module.exports = router;
