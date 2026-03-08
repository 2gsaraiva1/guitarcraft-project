/*
Este ficheiro gere as builds guardadas no perfil do utilizador.
Permite listar, guardar, editar e apagar presets do builder.
*/

const express = require("express");
const db = require("./db");

const router = express.Router();

// --------------------------------------------------
// Funcao: getUser
// O que faz: valida o dono das builds guardadas.
// Parametros: username (string).
// Retorna: Promise com user ou null.
// --------------------------------------------------
function getUser(username) {
  return new Promise((resolve, reject) => {
    // Query DB: lookup do utilizador para ownership.
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// --------------------------------------------------
// Funcao: allSql
// O que faz: executa listagens de builds guardadas.
// Parametros: sql (string), params (array opcional).
// Retorna: Promise com rows.
// --------------------------------------------------
function allSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query DB: leitura de saved_builds por utilizador.
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// --------------------------------------------------
// Funcao: runSql
// O que faz: grava alteracoes em builds guardadas.
// Parametros: sql (string), params (array opcional).
// Retorna: Promise com resultado da query.
// --------------------------------------------------
function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query DB: insert/update/delete de saved_builds.
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// Rota API (GET /:username): lista todas as builds guardadas do user.
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

// Rota API (POST /:username): guarda build nova (ou substitui por savedId).
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

// Rota API (PUT /:username/:savedId): atualiza uma build guardada existente.
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

// Rota API (DELETE /:username/:savedId): remove build guardada.
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
