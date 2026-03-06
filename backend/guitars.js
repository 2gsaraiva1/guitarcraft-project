/*
Este ficheiro expõe rotas CRUD para guitarras personalizadas.
*/

const express = require("express");
const db = require("./db");

const router = express.Router();

const requiredFields = [
  "model",
  "dexterity",
  "strings",
  "body_wood",
  "top_wood",
  "finish_type",
  "body_color",
  "top_coat",
  "neck_wood",
  "frets",
  "neck_profile",
  "fretboard_wood",
  "fingerboard_radius",
  "inlay_shape",
  "inlay_material",
  "fret_type",
  "neck_rear_finish",
  "headstock_shape",
  "headstock_color",
  "headstock_finish",
  "logo_color",
  "truss_rod_cover_color",
  "electronics_type",
  "pickup_config",
  "pickup_model",
  "pickup_color",
  "pickup_cover_option",
  "pole_piece_color",
  "bridge",
  "hardware_color",
  "knob_configuration",
  "nut_material",
  "tuning",
  "pickguard_color",
  "cavity_cover_color"
];

// Rota API (GET): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.get("/", (req, res) => {
  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.all("SELECT * FROM guitars", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch guitars" });
    res.json(rows);
  });
});

// Rota API (POST): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.post("/", (req, res) => {
  const missing = requiredFields.filter((f) => !req.body[f]);
  if (missing.length) {
    return res.status(400).json({ error: "All fields are required", missing });
  }

  const values = requiredFields.map((f) => req.body[f]);
  const placeholders = requiredFields.map(() => "?").join(", ");

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(
    `INSERT INTO guitars (${requiredFields.join(", ")}) VALUES (${placeholders})`,
    values,
    function (err) {
      if (err) return res.status(500).json({ error: "Failed to add guitar" });
      res.status(201).json({ id: this.lastID, ...req.body });
    }
  );
});

// Rota API (PUT): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const missing = requiredFields.filter((f) => !req.body[f]);
  if (missing.length) {
    return res.status(400).json({ error: "All fields are required", missing });
  }

  const setClause = requiredFields.map((f) => `${f} = ?`).join(", ");
  const values = [...requiredFields.map((f) => req.body[f]), id];

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(
    `UPDATE guitars SET ${setClause} WHERE id = ?`,
    values,
    function (err) {
      if (err) return res.status(500).json({ error: "Failed to update guitar" });
      if (this.changes === 0) return res.status(404).json({ error: "Guitar not found" });
      res.json({ message: "Guitar updated successfully" });
    }
  );
});

// Rota API (DELETE): recebe pedido HTTP, valida dados e devolve resposta adequada.
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run("DELETE FROM guitars WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "Failed to delete guitar" });
    if (this.changes === 0) return res.status(404).json({ error: "Guitar not found" });
    res.json({ message: "Guitar deleted successfully" });
  });
});

module.exports = router;
