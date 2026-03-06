/*
Este ficheiro gere o media do site (imagens de secções como home e about).
Expõe rotas para ler e atualizar URLs de imagens e valida permissões de administrador.
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
// Função: getUser
// O que faz: obtém um utilizador da base de dados pelo username.
// Parâmetros: username (string).
// Retorna: Promise com o registo do utilizador ou null.
// --------------------------------------------------
function getUser(username) {
  return new Promise((resolve, reject) => {
    // Query de base de dados: leitura de utilizador para validação de permissões.
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// --------------------------------------------------
// Função: allSql
// O que faz: executa queries de leitura que devolvem múltiplas linhas.
// Parâmetros: sql (string), params (array opcional).
// Retorna: Promise com array de linhas.
// --------------------------------------------------
function allSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query de base de dados: leitura genérica de múltiplos registos.
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// --------------------------------------------------
// Função: runSql
// O que faz: executa queries de escrita (insert/update/delete).
// Parâmetros: sql (string), params (array opcional).
// Retorna: Promise com o contexto de execução da query.
// --------------------------------------------------
function runSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query de base de dados: escrita de dados de media no armazenamento.
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

// --------------------------------------------------
// Função: requireAdmin
// O que faz: valida se o utilizador fornecido tem role de administrador.
// Parâmetros: actorUsername (string).
// Retorna: Promise<boolean>.
// --------------------------------------------------
async function requireAdmin(actorUsername) {
  if (!actorUsername) return false;
  const user = await getUser(actorUsername);
  return Boolean(user && user.role === "admin");
}

// Rota API (GET): devolve todas as chaves/URLs de media do site.
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

// Rota API (PUT): atualiza URLs de media permitidas (apenas admin).
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
      // Query de base de dados: upsert da URL para cada chave de media.
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
