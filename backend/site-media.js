/*
Este ficheiro gere o media do site (imagens de seces como home e about).
Expoe rotas para ler e atualizar URLs de imagens e valida permissoes de administrador.
*/

const express = require("express");
const db = require("./db");

const router = express.Router();

const ALLOWED_KEYS = new Set([
  "home_hero",
  "home_classic_series",
  "home_modern_series",
  "home_builder_promo",
  "about_hero"
]);

// --------------------------------------------------
// Funcao: getUser
// O que faz: le utilizador por username para validar permissao admin.
// Parametros: username (string).
// Retorna: Promise com user ou null.
// --------------------------------------------------
function getUser(username) {
  return new Promise((resolve, reject) => {
    // Query DB: leitura do user para validar permissoes.
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// --------------------------------------------------
// Funcao: allSql
// O que faz: leitura de varias linhas da tabela site_media.
// Parametros: sql (string), params (array opcional).
// Retorna: Promise com rows.
// --------------------------------------------------
function allSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query DB: listagem de media configurado no site.
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// --------------------------------------------------
// Funcao: runSql
// O que faz: escrita de URLs de media (insert/update).
// Parametros: sql (string), params (array opcional).
// Retorna: Promise com resultado da query.
// --------------------------------------------------
function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query DB: grava URLs de imagens usadas na home/about.
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// --------------------------------------------------
// Funcao: requireAdmin
// O que faz: confirma se o actor tem role admin antes de editar media.
// Parametros: actorUsername (string).
// Retorna: Promise<boolean>.
// --------------------------------------------------
async function requireAdmin(actorUsername) {
  if (!actorUsername) return false;
  const user = await getUser(actorUsername);
  return Boolean(user && user.role === "admin");
}

// Rota API (GET /): devolve mapa de imagens configuraveis do site.
router.get("/", async (req, res) => {
  try {
    // Query de base de dados: leitura das URLs atuais de media.
    const rows = await allSql("SELECT media_key, media_url FROM site_media ORDER BY media_key");
    const payload = {};
    rows.forEach((row) => {
      payload[row.media_key] = row.media_url;
    });
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: "Failed to load site media." });
  }
});

// Rota API (PUT /): atualiza URLs permitidas em site_media (so admin).
router.put("/", async (req, res) => {
  try {
    const actorUsername = String(req.body.actorUsername || "").trim();
    const allowed = await requireAdmin(actorUsername);
    if (!allowed) return res.status(403).json({ error: "Admin access required." });

    const values = req.body.values || {};
    const entries = Object.entries(values).filter(([key]) => ALLOWED_KEYS.has(key));
    if (!entries.length) return res.status(400).json({ error: "No valid media keys provided." });

    for (const [key, url] of entries) {
      const nextUrl = String(url || "").trim();
      if (!nextUrl) return res.status(400).json({ error: `URL is required for ${key}.` });
      // Query DB: upsert da URL para cada chave permitida.
      await runSql(
        `INSERT INTO site_media (media_key, media_url) VALUES (?, ?)
         ON CONFLICT(media_key) DO UPDATE SET media_url = excluded.media_url`,
        [key, nextUrl]
      );
    }

    res.json({ message: "Site media updated." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update site media." });
  }
});

module.exports = router;
