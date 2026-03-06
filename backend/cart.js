/*
Este ficheiro gere as operações do carrinho no backend (adicionar, atualizar, remover e listar).
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
// Função: createOrderId
// O que faz: executa uma parte da lógica deste módulo.
// Parâmetros: nenhum parâmetro.
// Retorna: o resultado da operação (ou Promise, quando aplicável).
// --------------------------------------------------
function createOrderId() {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Rota API (GET): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.get("/:username", async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });
    const rows = await allSql("SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at DESC", [user.id]);
    const mapped = rows.map((row) => ({
      cartId: row.id,
      type: row.item_type,
      itemType: row.item_type,
      quantity: Number(row.quantity || 1),
      unitPrice: Number(row.unit_price || row.total_price || 0),
      label: row.label,
      sourceId: row.source_id || null,
      image: row.image || "",
      imagePreview: row.image || "",
      selections: JSON.parse(row.selections_json || "{}"),
      priceBreakdown: JSON.parse(row.breakdown_json || "[]"),
      totalPrice: Number(row.total_price)
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ error: "Failed to load cart." });
  }
});

// Rota API (POST): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.post("/:username", async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });

    const item = req.body.item;
    if (!item || !item.cartId) return res.status(400).json({ error: "Cart item payload is required." });
    const type = String(item.type || item.itemType || "").toLowerCase();
    if (!["custom", "prebuilt"].includes(type)) {
      return res.status(400).json({ error: "Cart item type must be custom or prebuilt." });
    }

    if (type === "prebuilt" && item.sourceId) {
      const existing = await getSql(
        "SELECT * FROM cart_items WHERE user_id = ? AND item_type = 'prebuilt' AND source_id = ? LIMIT 1",
        [user.id, String(item.sourceId)]
      );

      const increment = Number(item.quantity || 1);
      const nextQuantity = (existing ? Number(existing.quantity || 1) : 0) + Math.max(1, increment);
      const unitPrice = Number(item.unitPrice || item.totalPrice || 0);
      const nextTotal = unitPrice * nextQuantity;

      if (existing) {
        await runSql(
          `UPDATE cart_items
           SET quantity = ?, unit_price = ?, total_price = ?, image = ?, selections_json = ?, breakdown_json = ?
           WHERE id = ?`,
          [
            nextQuantity,
            unitPrice,
            nextTotal,
            String(item.image || existing.image || ""),
            JSON.stringify(item.selections || JSON.parse(existing.selections_json || "{}")),
            JSON.stringify(item.priceBreakdown || JSON.parse(existing.breakdown_json || "[]")),
            existing.id
          ]
        );
      } else {
        await runSql(
          `INSERT OR REPLACE INTO cart_items
          (id, user_id, item_type, quantity, unit_price, label, source_id, image, selections_json, breakdown_json, total_price)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            String(item.cartId),
            user.id,
            "prebuilt",
            nextQuantity,
            unitPrice,
            String(item.label || ""),
            String(item.sourceId),
            String(item.image || ""),
            JSON.stringify(item.selections || {}),
            JSON.stringify(item.priceBreakdown || []),
            nextTotal
          ]
        );
      }
      return res.status(201).json({ message: "Pre-built item added to cart." });
    }

    if (type === "custom" && item.sourceId) {
      const existing = await getSql(
        "SELECT * FROM cart_items WHERE user_id = ? AND item_type = 'custom' AND source_id = ? LIMIT 1",
        [user.id, String(item.sourceId)]
      );

      const quantity = existing ? Math.max(1, Number(existing.quantity || 1)) : Math.max(1, Number(item.quantity || 1));
      const unitPrice = Number(item.unitPrice || item.totalPrice || 0);
      const nextTotal = unitPrice * quantity;

      if (existing) {
        await runSql(
          `UPDATE cart_items
           SET quantity = ?, unit_price = ?, total_price = ?, label = ?, image = ?, selections_json = ?, breakdown_json = ?
           WHERE id = ?`,
          [
            quantity,
            unitPrice,
            nextTotal,
            String(item.label || existing.label || "Custom Build"),
            String(item.image || existing.image || ""),
            JSON.stringify(item.selections || JSON.parse(existing.selections_json || "{}")),
            JSON.stringify(item.priceBreakdown || JSON.parse(existing.breakdown_json || "[]")),
            existing.id
          ]
        );
      } else {
        await runSql(
          `INSERT OR REPLACE INTO cart_items
          (id, user_id, item_type, quantity, unit_price, label, source_id, image, selections_json, breakdown_json, total_price)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            String(item.cartId),
            user.id,
            "custom",
            quantity,
            unitPrice,
            String(item.label || "Custom Build"),
            String(item.sourceId),
            String(item.image || ""),
            JSON.stringify(item.selections || {}),
            JSON.stringify(item.priceBreakdown || []),
            nextTotal
          ]
        );
      }
      return res.status(201).json({ message: "Custom build synced in cart." });
    }

    await runSql(
      `INSERT OR REPLACE INTO cart_items
      (id, user_id, item_type, quantity, unit_price, label, source_id, image, selections_json, breakdown_json, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(item.cartId),
        user.id,
        type,
        1,
        Number(item.totalPrice || 0),
        String(item.label || ""),
        item.sourceId ? String(item.sourceId) : null,
        String(item.image || ""),
        JSON.stringify(item.selections || {}),
        JSON.stringify(item.priceBreakdown || []),
        Number(item.totalPrice || 0)
      ]
    );

    res.status(201).json({ message: "Item added to cart." });
  } catch (error) {
    res.status(500).json({ error: "Failed to add cart item." });
  }
});

// Rota API (PUT): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.put("/:username/saved-build/:savedId", async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });

    const savedId = String(req.params.savedId || "").trim();
    if (!savedId) return res.status(400).json({ error: "Saved build id is required." });
    const item = req.body.item || {};

    const rows = await allSql(
      "SELECT * FROM cart_items WHERE user_id = ? AND item_type = 'custom' AND source_id = ?",
      [user.id, savedId]
    );
    if (!rows.length) return res.json({ message: "No linked cart items to update.", updated: 0 });

    const unitPrice = Number(item.unitPrice || item.totalPrice || 0);
    const label = String(item.label || "Custom Build");
    const image = String(item.image || "");
    const selectionsJson = JSON.stringify(item.selections || {});
    const breakdownJson = JSON.stringify(item.priceBreakdown || []);

    for (const row of rows) {
      const quantity = Math.max(1, Number(row.quantity || 1));
      const nextTotal = unitPrice * quantity;
      await runSql(
        `UPDATE cart_items
         SET unit_price = ?, total_price = ?, label = ?, image = ?, selections_json = ?, breakdown_json = ?
         WHERE user_id = ? AND id = ?`,
        [unitPrice, nextTotal, label, image, selectionsJson, breakdownJson, user.id, row.id]
      );
    }

    res.json({ message: "Linked cart items updated.", updated: rows.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to sync linked cart items." });
  }
});

// Rota API (DELETE): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.delete("/:username/:cartId", async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });
    const result = await runSql("DELETE FROM cart_items WHERE user_id = ? AND id = ?", [user.id, String(req.params.cartId)]);
    if (!result.changes) return res.status(404).json({ error: "Cart item not found." });
    res.json({ message: "Cart item removed." });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove cart item." });
  }
});

// Rota API (PUT): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.put("/:username/:cartId", async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });

    const nextQuantity = Math.max(1, Number(req.body.quantity || 1));
    const found = await getSql("SELECT * FROM cart_items WHERE user_id = ? AND id = ? LIMIT 1", [user.id, String(req.params.cartId)]);
    if (!found) return res.status(404).json({ error: "Cart item not found." });

    const unitPrice = Number(found.unit_price || found.total_price || 0);
    const nextTotal = unitPrice * nextQuantity;

    await runSql(
      "UPDATE cart_items SET quantity = ?, total_price = ? WHERE user_id = ? AND id = ?",
      [nextQuantity, nextTotal, user.id, String(req.params.cartId)]
    );

    res.json({ message: "Cart item updated." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart item." });
  }
});

// Rota API (POST): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.post("/:username/checkout", async (req, res) => {
  try {
    const user = await getUser(req.params.username);
    if (!user) return res.status(404).json({ error: "User not found." });

    const cartIds = Array.isArray(req.body.cartIds) ? req.body.cartIds.map((id) => String(id)) : [];
    if (!cartIds.length) return res.status(400).json({ error: "No cart items selected." });

    const placeholders = cartIds.map(() => "?").join(", ");
    const rows = await allSql(
      `SELECT * FROM cart_items WHERE user_id = ? AND id IN (${placeholders})`,
      [user.id, ...cartIds]
    );
    if (!rows.length) return res.status(400).json({ error: "Selected items not found." });

    const items = rows.map((row) => ({
      cartId: row.id,
      type: row.item_type,
      label: row.label,
      quantity: Number(row.quantity || 1),
      unitPrice: Number(row.unit_price || row.total_price || 0),
      totalPrice: Number(row.total_price || 0),
      image: row.image || "",
      selections: JSON.parse(row.selections_json || "{}"),
      priceBreakdown: JSON.parse(row.breakdown_json || "[]")
    }));
    const totalPrice = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);

    const checkoutData = req.body.checkoutData || {};
    const customerName = String(checkoutData.fullName || "").trim();
    const customerEmail = String(checkoutData.email || "").trim();
    const address = {
      line1: String(checkoutData.addressLine1 || "").trim(),
      line2: String(checkoutData.addressLine2 || "").trim(),
      city: String(checkoutData.city || "").trim(),
      region: String(checkoutData.region || "").trim(),
      postalCode: String(checkoutData.postalCode || "").trim(),
      country: String(checkoutData.country || "").trim()
    };

    const orderId = createOrderId();
    await runSql(
      "INSERT INTO orders (id, user_id, items_json, total_price, customer_name, customer_email, address_json, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [orderId, user.id, JSON.stringify(items), totalPrice, customerName, customerEmail, JSON.stringify(address), "Paid"]
    );

    await runSql(
      `DELETE FROM cart_items WHERE user_id = ? AND id IN (${placeholders})`,
      [user.id, ...cartIds]
    );

    res.status(201).json({
      message: "Checkout completed.",
      order: { orderId, items, totalPrice, status: "Paid" }
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to complete checkout." });
  }
});

module.exports = router;
