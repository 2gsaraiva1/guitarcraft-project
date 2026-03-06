/*
Este ficheiro gere as guitarras pre-built, reviews e respetivas validações.
*/

const express = require("express");
const db = require("./db");

const router = express.Router();

const STOCK_ENUM = ["in_stock", "low_stock", "out_of_stock", "preorder", "backorder"];

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
// Função: getSql
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: sql, params = [].
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function getSql(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

// --------------------------------------------------
// Função: normalizeCategory
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: input.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function normalizeCategory(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (raw === "modern") return "modern";
  return "classic";
}

// --------------------------------------------------
// Função: normalizeStatusDisplay
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: input.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function normalizeStatusDisplay(input) {
  const raw = String(input || "").trim();
  if (!raw) return "In Stock";
  if (raw === "Built to Order") return "Pre-order";
  return raw;
}

// --------------------------------------------------
// Função: normalizeStockStatus
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: input.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function normalizeStockStatus(input) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return "in_stock";
  if (STOCK_ENUM.includes(raw)) return raw;
  if (raw === "in stock") return "in_stock";
  if (raw === "limited") return "low_stock";
  if (raw === "pre-order" || raw === "built to order") return "preorder";
  if (raw === "back order") return "backorder";
  return "in_stock";
}

// --------------------------------------------------
// Função: parseArrayJson
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: jsonText, fallback = [].
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function parseArrayJson(jsonText, fallback = []) {
  try {
    const parsed = JSON.parse(jsonText || "[]");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

// --------------------------------------------------
// Função: parseObjectJson
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: jsonText, fallback = {}.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function parseObjectJson(jsonText, fallback = {}) {
  try {
    const parsed = JSON.parse(jsonText || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return fallback;
    return parsed;
  } catch (error) {
    return fallback;
  }
}

// --------------------------------------------------
// Função: normalizeI18nMap
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: input.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function normalizeI18nMap(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out = {};
  Object.entries(input).forEach(([key, value]) => {
    const lang = String(key || "").trim().toLowerCase();
    const text = String(value || "").trim();
    if (!lang || !text) return;
    out[lang] = text;
  });
  return out;
}

// --------------------------------------------------
// Função: getReviewSummary
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: reviews.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function getReviewSummary(reviews) {
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? Number((reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews).toFixed(2))
    : 0;
  return { totalReviews, averageRating };
}

// --------------------------------------------------
// Função: toApiModel
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: row.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function toApiModel(row) {
  const fallbackDescription = row.description || "";
  const shortDescription = row.short_description || fallbackDescription;
  const fullDescription = row.full_description || fallbackDescription;
  const shortDescriptionI18n = parseObjectJson(row.short_description_i18n_json, {});
  const fullDescriptionI18n = parseObjectJson(row.full_description_i18n_json, {});
  const images = parseArrayJson(row.images_json, row.image ? [row.image] : []);
  const reviews = parseArrayJson(row.reviews_json, [])
    .map((review) => ({
      userId: review.userId,
      username: review.username,
      rating: Number(review.rating || 0),
      comment: String(review.comment || ""),
      createdAt: review.createdAt || new Date(0).toISOString()
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const { totalReviews, averageRating } = getReviewSummary(reviews);

  const stockStatus = normalizeStockStatus(row.stock_status || row.status);
  const stockQuantity = Math.max(0, Number(row.stock_quantity || 0));
  const estimatedRestockDate = row.estimated_restock_date || null;

  return {
    id: row.id,
    name: row.name,
    shortDescription,
    fullDescription,
    shortDescriptionI18n,
    fullDescriptionI18n,
    description: shortDescription,
    price: Number(row.price),
    status: normalizeStatusDisplay(row.status || row.stock_status),
    specs: parseArrayJson(row.specs_json, []),
    images,
    image: images[0] || row.image || "",
    category: normalizeCategory(row.category),
    seriesName: row.series_name,
    stockStatus,
    stockQuantity,
    estimatedRestockDate,
    reviews,
    averageRating,
    totalReviews,
    featuredOnHome: Boolean(row.featured_on_home)
  };
}

// --------------------------------------------------
// Função: validateGuitar
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: input.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function validateGuitar(input) {
  const required = ["id", "name", "description", "price", "specs", "image", "category", "seriesName"];
  const missing = required.filter((key) => input[key] === undefined || input[key] === null || input[key] === "");
  if (missing.length) return `Missing fields: ${missing.join(", ")}`;
  if (!Array.isArray(input.specs) || input.specs.length === 0) return "Specs must be a non-empty array.";
  if (!Number.isFinite(Number(input.price)) || Number(input.price) <= 0) return "Price must be greater than 0.";
  if (input.featuredOnHome !== undefined && typeof input.featuredOnHome !== "boolean") return "featuredOnHome must be boolean.";
  if (input.images !== undefined && (!Array.isArray(input.images) || input.images.some((img) => !String(img || "").trim()))) {
    return "images must be a string array.";
  }
  if (input.category !== undefined && !["classic", "modern"].includes(String(input.category).toLowerCase())) {
    return "Invalid category.";
  }
    if (input.shortDescription !== undefined && !String(input.shortDescription || "").trim()) return "shortDescription cannot be empty.";
    if (input.fullDescription !== undefined && !String(input.fullDescription || "").trim()) return "fullDescription cannot be empty.";
    if (input.shortDescriptionI18n !== undefined && (typeof input.shortDescriptionI18n !== "object" || Array.isArray(input.shortDescriptionI18n))) {
      return "shortDescriptionI18n must be an object.";
    }
    if (input.fullDescriptionI18n !== undefined && (typeof input.fullDescriptionI18n !== "object" || Array.isArray(input.fullDescriptionI18n))) {
      return "fullDescriptionI18n must be an object.";
    }
  const stockStatus = normalizeStockStatus(input.stockStatus || input.status);
  if (!STOCK_ENUM.includes(stockStatus)) return "Invalid stockStatus.";
  if (input.stockQuantity !== undefined && (!Number.isFinite(Number(input.stockQuantity)) || Number(input.stockQuantity) < 0)) {
    return "stockQuantity must be a non-negative number.";
  }
  if (input.estimatedRestockDate) {
    const parsed = new Date(input.estimatedRestockDate);
    if (Number.isNaN(parsed.getTime())) return "estimatedRestockDate is invalid.";
  }
  return null;
}

// --------------------------------------------------
// Função: requireAdmin
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: actorUsername.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
async function requireAdmin(actorUsername) {
  if (!actorUsername) return false;
  const user = await getUser(actorUsername);
  return Boolean(user && user.role === "admin");
}

// Rota API (GET): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.get("/", async (req, res) => {
  try {
    const rows = await allSql("SELECT * FROM prebuilt_guitars ORDER BY category, series_name, name");
    res.json(rows.map(toApiModel));
  } catch (error) {
    res.status(500).json({ error: "Failed to load pre-built guitars." });
  }
});

// Rota API (GET): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.get("/:id/reviews", async (req, res) => {
  try {
    const row = await getSql("SELECT * FROM prebuilt_guitars WHERE id = ?", [String(req.params.id)]);
    if (!row) return res.status(404).json({ error: "Guitar not found." });
    const model = toApiModel(row);
    res.json({
      reviews: model.reviews,
      averageRating: model.averageRating,
      totalReviews: model.totalReviews
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load reviews." });
  }
});

// Rota API (POST): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.post("/:id/review", async (req, res) => {
  try {
    const actorUsername = String(req.body.actorUsername || "").trim();
    if (!actorUsername) return res.status(401).json({ error: "Login required." });
    const user = await getUser(actorUsername);
    if (!user) return res.status(401).json({ error: "User not found." });

    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }
    if (!comment) return res.status(400).json({ error: "Comment is required." });

    const row = await getSql("SELECT * FROM prebuilt_guitars WHERE id = ?", [String(req.params.id)]);
    if (!row) return res.status(404).json({ error: "Guitar not found." });

    const reviews = parseArrayJson(row.reviews_json, []);
    const hasReviewed = reviews.some((review) => review.userId === user.id || String(review.username).toLowerCase() === user.username.toLowerCase());
    if (hasReviewed) return res.status(409).json({ error: "You already reviewed this product." });

    const nextReview = {
      userId: user.id,
      username: user.username,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    const nextReviews = [nextReview, ...reviews];

    await runSql("UPDATE prebuilt_guitars SET reviews_json = ? WHERE id = ?", [JSON.stringify(nextReviews), String(req.params.id)]);

    const sorted = nextReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const summary = getReviewSummary(sorted);
    res.status(201).json({
      message: "Review added.",
      reviews: sorted,
      averageRating: summary.averageRating,
      totalReviews: summary.totalReviews
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add review." });
  }
});

// Rota API (PUT): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.put("/:id/review", async (req, res) => {
  try {
    const actorUsername = String(req.body.actorUsername || "").trim();
    if (!actorUsername) return res.status(401).json({ error: "Login required." });
    const user = await getUser(actorUsername);
    if (!user) return res.status(401).json({ error: "User not found." });

    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }
    if (!comment) return res.status(400).json({ error: "Comment is required." });

    const row = await getSql("SELECT * FROM prebuilt_guitars WHERE id = ?", [String(req.params.id)]);
    if (!row) return res.status(404).json({ error: "Guitar not found." });

    const reviews = parseArrayJson(row.reviews_json, []);
    const index = reviews.findIndex((review) => (
      String(review.userId || "") === String(user.id) ||
      String(review.username || "").toLowerCase() === user.username.toLowerCase()
    ));
    if (index < 0) return res.status(404).json({ error: "Review not found for this user." });

    const updated = {
      ...reviews[index],
      userId: user.id,
      username: user.username,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    reviews[index] = updated;
    const sorted = reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    await runSql("UPDATE prebuilt_guitars SET reviews_json = ? WHERE id = ?", [JSON.stringify(sorted), String(req.params.id)]);
    const summary = getReviewSummary(sorted);
    res.json({
      message: "Review updated.",
      reviews: sorted,
      averageRating: summary.averageRating,
      totalReviews: summary.totalReviews
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update review." });
  }
});

// Rota API (DELETE): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.delete("/:id/review/:reviewUserId", async (req, res) => {
  try {
    const actorUsername = String(req.body.actorUsername || req.query.actorUsername || "").trim();
    if (!actorUsername) return res.status(401).json({ error: "Login required." });
    const actor = await getUser(actorUsername);
    if (!actor || actor.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    const row = await getSql("SELECT * FROM prebuilt_guitars WHERE id = ?", [String(req.params.id)]);
    if (!row) return res.status(404).json({ error: "Guitar not found." });

    const reviewUserId = String(req.params.reviewUserId || "").trim();
    const reviewUsername = String(req.query.reviewUsername || "").trim().toLowerCase();

    const reviews = parseArrayJson(row.reviews_json, []);
    const nextReviews = reviews.filter((review) => {
      const byId = reviewUserId && String(review.userId || "") === reviewUserId;
      const byUsername = reviewUsername && String(review.username || "").toLowerCase() === reviewUsername;
      return !(byId || byUsername);
    });

    if (nextReviews.length === reviews.length) {
      return res.status(404).json({ error: "Review not found." });
    }

    const sorted = nextReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    await runSql("UPDATE prebuilt_guitars SET reviews_json = ? WHERE id = ?", [JSON.stringify(sorted), String(req.params.id)]);
    const summary = getReviewSummary(sorted);
    res.json({
      message: "Review deleted.",
      reviews: sorted,
      averageRating: summary.averageRating,
      totalReviews: summary.totalReviews
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete review." });
  }
});

// Rota API (GET): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.get("/:id", async (req, res) => {
  try {
    const row = await getSql("SELECT * FROM prebuilt_guitars WHERE id = ?", [String(req.params.id)]);
    if (!row) return res.status(404).json({ error: "Guitar not found." });
    res.json(toApiModel(row));
  } catch (error) {
    res.status(500).json({ error: "Failed to load guitar." });
  }
});

// Rota API (POST): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.post("/", async (req, res) => {
  try {
    const actorUsername = req.body.actorUsername;
    const allowed = await requireAdmin(actorUsername);
    if (!allowed) return res.status(403).json({ error: "Admin access required." });

    const payload = req.body.guitar || req.body;
    const validationError = validateGuitar(payload);
    if (validationError) return res.status(400).json({ error: validationError });

    const normalizedImages = Array.isArray(payload.images)
      ? payload.images.map((img) => String(img).trim()).filter(Boolean)
      : (payload.image ? [String(payload.image).trim()] : []);
    const shortDescription = String(payload.shortDescription || payload.description || "").trim();
    const fullDescription = String(payload.fullDescription || payload.description || "").trim();
    const shortDescriptionI18n = normalizeI18nMap(payload.shortDescriptionI18n);
    const fullDescriptionI18n = normalizeI18nMap(payload.fullDescriptionI18n);
    const stockStatus = normalizeStockStatus(payload.stockStatus || payload.status);
    const stockQuantity = Math.max(0, Number(payload.stockQuantity || 0));
    const estimatedRestockDate = payload.estimatedRestockDate ? String(payload.estimatedRestockDate) : null;

    await runSql(
      `INSERT INTO prebuilt_guitars (id, name, description, short_description, full_description, short_description_i18n_json, full_description_i18n_json, price, specs_json, image, images_json, category, series_name, status, stock_status, stock_quantity, estimated_restock_date, reviews_json, featured_on_home)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(payload.id),
        String(payload.name).trim(),
        shortDescription,
        shortDescription,
        fullDescription,
        JSON.stringify(shortDescriptionI18n),
        JSON.stringify(fullDescriptionI18n),
        Number(payload.price),
        JSON.stringify(payload.specs),
        normalizedImages[0] || String(payload.image).trim(),
        JSON.stringify(normalizedImages),
        normalizeCategory(payload.category),
        String(payload.seriesName).trim(),
        normalizeStatusDisplay(payload.status || payload.stockStatus),
        stockStatus,
        stockQuantity,
        estimatedRestockDate,
        JSON.stringify([]),
        payload.featuredOnHome ? 1 : 0
      ]
    );

    res.status(201).json({ message: "Pre-built guitar created." });
  } catch (error) {
    res.status(500).json({ error: "Failed to create pre-built guitar." });
  }
});

// Rota API (PUT): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.put("/:id", async (req, res) => {
  try {
    const actorUsername = req.body.actorUsername;
    const allowed = await requireAdmin(actorUsername);
    if (!allowed) return res.status(403).json({ error: "Admin access required." });

    const payload = req.body.guitar || req.body;
    const existing = await getSql("SELECT * FROM prebuilt_guitars WHERE id = ?", [String(req.params.id)]);
    if (!existing) return res.status(404).json({ error: "Guitar not found." });

    const validationError = validateGuitar({ ...payload, id: req.params.id });
    if (validationError) return res.status(400).json({ error: validationError });

    const normalizedImages = Array.isArray(payload.images)
      ? payload.images.map((img) => String(img).trim()).filter(Boolean)
      : (payload.image ? [String(payload.image).trim()] : []);
    const shortDescription = String(payload.shortDescription || payload.description || "").trim();
    const fullDescription = String(payload.fullDescription || payload.description || "").trim();
    const shortDescriptionI18n = normalizeI18nMap(payload.shortDescriptionI18n);
    const fullDescriptionI18n = normalizeI18nMap(payload.fullDescriptionI18n);
    const stockStatus = normalizeStockStatus(payload.stockStatus || payload.status);
    const stockQuantity = Math.max(0, Number(payload.stockQuantity || 0));
    const estimatedRestockDate = payload.estimatedRestockDate ? String(payload.estimatedRestockDate) : null;
    const reviewsJson = existing.reviews_json || "[]";

    const result = await runSql(
      `UPDATE prebuilt_guitars
       SET name = ?, description = ?, short_description = ?, full_description = ?, short_description_i18n_json = ?, full_description_i18n_json = ?, price = ?, specs_json = ?, image = ?, images_json = ?, category = ?, series_name = ?, status = ?, stock_status = ?, stock_quantity = ?, estimated_restock_date = ?, reviews_json = ?, featured_on_home = ?
       WHERE id = ?`,
      [
        String(payload.name).trim(),
        shortDescription,
        shortDescription,
        fullDescription,
        JSON.stringify(shortDescriptionI18n),
        JSON.stringify(fullDescriptionI18n),
        Number(payload.price),
        JSON.stringify(payload.specs),
        normalizedImages[0] || String(payload.image).trim(),
        JSON.stringify(normalizedImages),
        normalizeCategory(payload.category),
        String(payload.seriesName).trim(),
        normalizeStatusDisplay(payload.status || payload.stockStatus),
        stockStatus,
        stockQuantity,
        estimatedRestockDate,
        reviewsJson,
        payload.featuredOnHome ? 1 : 0,
        String(req.params.id)
      ]
    );

    if (!result.changes) return res.status(404).json({ error: "Guitar not found." });
    res.json({ message: "Pre-built guitar updated." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update pre-built guitar." });
  }
});

// Rota API (DELETE): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.delete("/:id", async (req, res) => {
  try {
    const actorUsername = req.body.actorUsername || req.query.actorUsername;
    const allowed = await requireAdmin(actorUsername);
    if (!allowed) return res.status(403).json({ error: "Admin access required." });

    const result = await runSql("DELETE FROM prebuilt_guitars WHERE id = ?", [String(req.params.id)]);
    if (!result.changes) return res.status(404).json({ error: "Guitar not found." });
    res.json({ message: "Pre-built guitar deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete pre-built guitar." });
  }
});

module.exports = router;
