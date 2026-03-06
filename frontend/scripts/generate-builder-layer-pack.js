const fs = require("fs");
const path = require("path");
const vm = require("vm");
const zlib = require("zlib");

const ROOT = path.join(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "config.js");
const OUT_ROOT = path.join(ROOT, "assets", "layers");

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function loadConfig() {
  const source = fs.readFileSync(CONFIG_PATH, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "config.js" });
  return sandbox.window.GuitarConfig;
}

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (c ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const name = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])), 0);
  return Buffer.concat([len, name, data, crc]);
}

function makePng(width, height, rgba) {
  const row = width * 4 + 1;
  const raw = Buffer.alloc(row * height, 0);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * row;
    raw[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      const p = rowStart + 1 + x * 4;
      raw[p] = rgba[0];
      raw[p + 1] = rgba[1];
      raw[p + 2] = rgba[2];
      raw[p + 3] = rgba[3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

function stableColor(input, alpha) {
  let h = 0;
  const s = String(input);
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  const r = 70 + (h % 150);
  const g = 70 + ((h >> 8) % 150);
  const b = 70 + ((h >> 16) % 150);
  return [r, g, b, alpha];
}

function getFieldMap(config) {
  const map = {};
  config.SECTIONS.forEach((section) => {
    section.fields.forEach((field) => {
      map[field.key] = field;
    });
  });
  return map;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeLayer(filePath, part, choice) {
  let alpha = 42;
  if (part === "body-shape") alpha = 120;
  if (part === "top-wood") alpha = 58;
  if (part === "pickup-config" || part === "pickup-model") alpha = 95;
  if (part === "bridge" || part === "hardware-color") alpha = 90;
  if (part.startsWith("neck") || part.startsWith("headstock")) alpha = 65;
  const data = makePng(1000, 600, stableColor(`${part}:${choice}`, alpha));
  fs.writeFileSync(filePath, data);
}

function build() {
  const config = loadConfig();
  const fieldMap = getFieldMap(config);
  const layers = [
    ["body-shape", "model"],
    ["body-color", "body_color"],
    ["finish-type", "finish_type"],
    ["top-coat", "top_coat"],
    ["neck-wood", "neck_wood"],
    ["fretboard-wood", "fretboard_wood"],
    ["headstock-shape", "headstock_shape"],
    ["headstock-color", "headstock_color"],
    ["logo-color", "logo_color"],
    ["bridge", "bridge"],
    ["pickup-config", "pickup_config"],
    ["pickup-model", "pickup_model"],
    ["pickup-color", "pickup_color"],
    ["hardware-color", "hardware_color"],
    ["pickguard-color", "pickguard_color"],
    ["top-wood", "top_wood"],
    ["neck-rear-finish", "neck_rear_finish"],
    ["cavity-cover-color", "cavity_cover_color"],
    ["truss-rod-cover-color", "truss_rod_cover_color"]
  ];

  const views = ["front", "back"];
  let count = 0;
  views.forEach((view) => {
    layers.forEach(([part, fieldKey]) => {
      const field = fieldMap[fieldKey];
      if (!field) return;
      const dir = path.join(OUT_ROOT, view, part);
      ensureDir(dir);
      field.options.forEach((opt) => {
        const choiceSlug = slug(opt.value);
        const file = path.join(dir, `${choiceSlug}.png`);
        writeLayer(file, part, opt.value);
        count += 1;
      });
    });
  });

  const readme = [
    "Generated starter layered PNG pack.",
    "",
    "These are placeholder overlays so the 2D preview always renders.",
    "Replace each PNG with your real transparent guitar art while keeping file names.",
    "",
    "Generated files: " + count
  ].join("\n");
  fs.writeFileSync(path.join(OUT_ROOT, "README.txt"), readme, "utf8");

  console.log(`Generated ${count} layer PNG files in ${OUT_ROOT}`);
}

build();
