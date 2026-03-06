/*
Este ficheiro configura a base de dados SQLite, cria tabelas e aplica migrações iniciais.
*/

const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "database", "guitarcraft.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // --------------------------------------------------
  // Função: seedAdminUser
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: nenhum parâmetro.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  function seedAdminUser() {
    // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
    db.run(
      "INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)",
      ["admin", "admin123", "admin"],
      () => {}
    );
  }

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    )
  `);

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.all("PRAGMA table_info(users)", [], (err, rows) => {
    if (err) return seedAdminUser();
    const hasRole = rows.some((row) => row.name === "role");
    if (!hasRole) {
      // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
      db.run("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'", [], () => {
        seedAdminUser();
      });
      return;
    }
    seedAdminUser();
  });

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(`
    CREATE TABLE IF NOT EXISTS guitars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model TEXT NOT NULL,
      dexterity TEXT NOT NULL,
      strings TEXT NOT NULL,

      body_wood TEXT NOT NULL,
      top_wood TEXT NOT NULL,
      finish_type TEXT NOT NULL,
      body_color TEXT NOT NULL,
      top_coat TEXT NOT NULL,

      neck_wood TEXT NOT NULL,
      frets TEXT NOT NULL,
      neck_profile TEXT NOT NULL,
      fretboard_wood TEXT NOT NULL,
      fingerboard_radius TEXT NOT NULL,
      inlay_shape TEXT NOT NULL,
      inlay_material TEXT NOT NULL,
      fret_type TEXT NOT NULL,
      neck_rear_finish TEXT NOT NULL,
      headstock_shape TEXT NOT NULL,
      headstock_color TEXT NOT NULL,
      headstock_finish TEXT NOT NULL,
      logo_color TEXT NOT NULL,
      truss_rod_cover_color TEXT NOT NULL,

      electronics_type TEXT NOT NULL,
      pickup_config TEXT NOT NULL,
      pickup_model TEXT NOT NULL,
      pickup_color TEXT NOT NULL,
      pickup_cover_option TEXT NOT NULL,
      pole_piece_color TEXT NOT NULL,

      bridge TEXT NOT NULL,
      hardware_color TEXT NOT NULL,
      knob_configuration TEXT NOT NULL,
      nut_material TEXT NOT NULL,
      tuning TEXT NOT NULL,
      pickguard_color TEXT NOT NULL,
      cavity_cover_color TEXT NOT NULL
    )
  `);

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(`
    CREATE TABLE IF NOT EXISTS prebuilt_guitars (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT,
      full_description TEXT,
      short_description_i18n_json TEXT,
      full_description_i18n_json TEXT,
      price REAL NOT NULL,
      specs_json TEXT NOT NULL,
      image TEXT NOT NULL,
      images_json TEXT,
      category TEXT NOT NULL,
      series_name TEXT NOT NULL,
      status TEXT,
      stock_status TEXT NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      estimated_restock_date TEXT,
      reviews_json TEXT NOT NULL DEFAULT '[]',
      featured_on_home INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.all("PRAGMA table_info(prebuilt_guitars)", [], (err, rows) => {
    if (err) return;
    const hasShortDescription = rows.some((row) => row.name === "short_description");
    const hasFullDescription = rows.some((row) => row.name === "full_description");
    const hasImagesJson = rows.some((row) => row.name === "images_json");
    const hasShortDescriptionI18n = rows.some((row) => row.name === "short_description_i18n_json");
    const hasFullDescriptionI18n = rows.some((row) => row.name === "full_description_i18n_json");
    const hasStatus = rows.some((row) => row.name === "status");
    const hasStockQuantity = rows.some((row) => row.name === "stock_quantity");
    const hasEstimatedRestockDate = rows.some((row) => row.name === "estimated_restock_date");
    const hasReviewsJson = rows.some((row) => row.name === "reviews_json");
    const hasFeaturedOnHome = rows.some((row) => row.name === "featured_on_home");
    if (!hasShortDescription) db.run("ALTER TABLE prebuilt_guitars ADD COLUMN short_description TEXT");
    if (!hasFullDescription) db.run("ALTER TABLE prebuilt_guitars ADD COLUMN full_description TEXT");
    if (!hasImagesJson) db.run("ALTER TABLE prebuilt_guitars ADD COLUMN images_json TEXT");
    if (!hasShortDescriptionI18n) db.run("ALTER TABLE prebuilt_guitars ADD COLUMN short_description_i18n_json TEXT");
    if (!hasFullDescriptionI18n) db.run("ALTER TABLE prebuilt_guitars ADD COLUMN full_description_i18n_json TEXT");
    if (!hasStatus) db.run("ALTER TABLE prebuilt_guitars ADD COLUMN status TEXT");
    if (!hasStockQuantity) db.run("ALTER TABLE prebuilt_guitars ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0");
    if (!hasEstimatedRestockDate) db.run("ALTER TABLE prebuilt_guitars ADD COLUMN estimated_restock_date TEXT");
    if (!hasReviewsJson) db.run("ALTER TABLE prebuilt_guitars ADD COLUMN reviews_json TEXT NOT NULL DEFAULT '[]'");
    if (!hasFeaturedOnHome) {
      // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
      db.run("ALTER TABLE prebuilt_guitars ADD COLUMN featured_on_home INTEGER NOT NULL DEFAULT 0");
    }
  });

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(
    `INSERT OR IGNORE INTO prebuilt_guitars
    (id, name, description, price, specs_json, image, category, series_name, stock_status, stock_quantity, estimated_restock_date, featured_on_home)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "pb_1",
      "LP Heritage Classic",
      "Single-cut classic voice with warm sustain.",
      2199,
      JSON.stringify(["Mahogany body", "Maple top", "Set neck", "22 frets"]),
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=80",
      "Classic",
      "Vintage Series",
      "in_stock",
      14,
      null,
      1
    ]
  );
  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(
    `INSERT OR IGNORE INTO prebuilt_guitars
    (id, name, description, price, specs_json, image, category, series_name, stock_status, stock_quantity, estimated_restock_date, featured_on_home)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "pb_2",
      "ST Vintage Pro",
      "Traditional bolt-on feel with modern reliability.",
      1699,
      JSON.stringify(["Alder body", "Maple neck", "SSS pickups", "Trem bridge"]),
      "https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=1000&q=80",
      "Classic",
      "Vintage Series",
      "out_of_stock",
      0,
      "2026-03-24",
      0
    ]
  );
  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(
    `INSERT OR IGNORE INTO prebuilt_guitars
    (id, name, description, price, specs_json, image, category, series_name, stock_status, stock_quantity, estimated_restock_date, featured_on_home)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "pb_3",
      "Modern S7",
      "Extended range platform for progressive players.",
      2399,
      JSON.stringify(["7 strings", "Roasted maple neck", "24 frets", "HH pickups"]),
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1000&q=80",
      "Modern",
      "Modern Series",
      "low_stock",
      3,
      null,
      1
    ]
  );

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run("UPDATE prebuilt_guitars SET stock_status = 'in_stock', stock_quantity = 14, estimated_restock_date = NULL WHERE id = 'pb_1'");
  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run("UPDATE prebuilt_guitars SET stock_status = 'out_of_stock', stock_quantity = 0, estimated_restock_date = '2026-03-24' WHERE id = 'pb_2'");
  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run("UPDATE prebuilt_guitars SET stock_status = 'low_stock', stock_quantity = 3, estimated_restock_date = NULL WHERE id = 'pb_3'");
  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run("UPDATE prebuilt_guitars SET series_name = 'Vintage Series' WHERE lower(series_name) = 'classic series'");

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(`
    CREATE TABLE IF NOT EXISTS saved_builds (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      selections_json TEXT NOT NULL,
      breakdown_json TEXT NOT NULL,
      total_price REAL NOT NULL,
      image_preview TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.all("PRAGMA table_info(saved_builds)", [], (err, rows) => {
    if (err) return;
    const hasImagePreview = rows.some((row) => row.name === "image_preview");
    if (!hasImagePreview) {
      // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
      db.run("ALTER TABLE saved_builds ADD COLUMN image_preview TEXT");
    }
  });

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price REAL NOT NULL DEFAULT 0,
      label TEXT NOT NULL,
      source_id TEXT,
      image TEXT,
      selections_json TEXT NOT NULL,
      breakdown_json TEXT NOT NULL,
      total_price REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.all("PRAGMA table_info(cart_items)", [], (err, rows) => {
    if (err) return;
    const hasQuantity = rows.some((row) => row.name === "quantity");
    const hasUnitPrice = rows.some((row) => row.name === "unit_price");
    if (!hasQuantity) db.run("ALTER TABLE cart_items ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1");
    if (!hasUnitPrice) db.run("ALTER TABLE cart_items ADD COLUMN unit_price REAL NOT NULL DEFAULT 0");
  });

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      items_json TEXT NOT NULL,
      total_price REAL NOT NULL,
      customer_name TEXT,
      customer_email TEXT,
      address_json TEXT,
      status TEXT NOT NULL DEFAULT 'Paid',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.all("PRAGMA table_info(orders)", [], (err, rows) => {
    if (err) return;
    const hasCustomerName = rows.some((row) => row.name === "customer_name");
    const hasCustomerEmail = rows.some((row) => row.name === "customer_email");
    const hasAddressJson = rows.some((row) => row.name === "address_json");
    if (!hasCustomerName) db.run("ALTER TABLE orders ADD COLUMN customer_name TEXT");
    if (!hasCustomerEmail) db.run("ALTER TABLE orders ADD COLUMN customer_email TEXT");
    if (!hasAddressJson) db.run("ALTER TABLE orders ADD COLUMN address_json TEXT");
  });

  // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
  db.run(`
    CREATE TABLE IF NOT EXISTS site_media (
      media_key TEXT PRIMARY KEY,
      media_url TEXT NOT NULL
    )
  `);

  const defaultMedia = [
    ["home_hero", "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1800&q=80"],
    ["home_classic_series", "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=1200&q=80"],
    ["home_modern_series", "https://images.unsplash.com/photo-1520166012956-add9ba0835cb?auto=format&fit=crop&w=1200&q=80"],
    ["home_builder_promo", "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80"],
    ["about_hero", "https://images.unsplash.com/photo-1461784121038-f088ca1e7714?auto=format&fit=crop&w=1800&q=80"]
  ];

  defaultMedia.forEach(([key, url]) => {
    // Query de base de dados: executa leitura/escrita na SQLite para suportar esta operação.
    db.run("INSERT OR IGNORE INTO site_media (media_key, media_url) VALUES (?, ?)", [key, url]);
  });

});

module.exports = db;
