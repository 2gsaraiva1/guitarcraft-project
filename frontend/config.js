/*
Este módulo centraliza configurações do builder, opções e cálculo de preços.
*/

/* Shared configuration for builder/shop/cart pricing and labels */
(function initGuitarConfig(global) {
  const BASE_PRICE = 1499;

  const SECTIONS = [
    {
      id: "general",
      title: "General Options",
      fields: [
        { key: "model", label: "Model", options: [{ label: "ST", value: "ST", price: 0 }, { label: "T", value: "T", price: 40 }, { label: "LP", value: "LP", price: 70 }, { label: "SG", value: "SG", price: 60 }, { label: "EX", value: "EX", price: 90 }, { label: "LP Modern", value: "LP Modern", price: 150 }, { label: "Semi Hollow", value: "Semi Hollow", price: 180 }] },
        { key: "dexterity", label: "Dexterity", options: [{ label: "Right", value: "Right", price: 0 }, { label: "Left", value: "Left", price: 120 }] },
        { key: "strings", label: "Strings", options: [{ label: "6", value: "6", price: 0 }, { label: "7", value: "7", price: 130 }, { label: "8", value: "8", price: 180 }] }
      ]
    },
    {
      id: "body",
      title: "Body Options",
      fields: [
        { key: "body_wood", label: "Body Wood", options: [{ label: "Alder", value: "Alder", price: 0 }, { label: "Mahogany", value: "Mahogany", price: 60 }, { label: "Swamp Ash", value: "Swamp Ash", price: 80 }, { label: "Basswood", value: "Basswood", price: 30 }] },
        { key: "top_wood", label: "Top Wood", options: [{ label: "No Top", value: "No Top", price: 0 }, { label: "Flame Maple", value: "Flame Maple", price: 150 }, { label: "Quilt Maple", value: "Quilt Maple", price: 190 }, { label: "Walnut", value: "Walnut", price: 140 }] },
        { key: "finish_type", label: "Finish", options: [{ label: "Solid Colors", value: "Solid Colors", price: 0 }, { label: "Metallic Colors", value: "Metallic Colors", price: 55 }, { label: "Fades", value: "Fades", price: 80 }, { label: "Sparkle Colors", value: "Sparkle Colors", price: 110 }] },
        { key: "body_color", label: "Body Color", options: [{ label: "Black", value: "Black", price: 0 }, { label: "White", value: "White", price: 0 }, { label: "Deep Blue", value: "Deep Blue", price: 20 }, { label: "Burgundy", value: "Burgundy", price: 20 }] },
        { key: "top_coat", label: "Top Coat", options: [{ label: "Clear Gloss", value: "Clear Gloss", price: 0 }, { label: "Raw Tone", value: "Raw Tone", price: 35 }, { label: "Satin", value: "Satin", price: 25 }, { label: "Matte", value: "Matte", price: 25 }] }
      ]
    },
    {
      id: "neck",
      title: "Neck Options",
      fields: [
        { key: "neck_wood", label: "Neck Wood", options: [{ label: "Maple", value: "Maple", price: 0 }, { label: "Roasted Maple", value: "Roasted Maple", price: 60 }, { label: "Mahogany", value: "Mahogany", price: 45 }, { label: "Walnut", value: "Walnut", price: 50 }] },
        { key: "frets", label: "Number of Frets", options: [{ label: "22", value: "22", price: 0 }, { label: "24", value: "24", price: 35 }] },
        { key: "neck_profile", label: "Neck Profile", options: [{ label: "C", value: "C", price: 0 }, { label: "U", value: "U", price: 20 }, { label: "V", value: "V", price: 20 }] },
        { key: "fretboard_wood", label: "Fretboard Wood", options: [{ label: "Ebony", value: "Ebony", price: 45 }, { label: "Rosewood", value: "Rosewood", price: 25 }, { label: "Maple", value: "Maple", price: 20 }, { label: "Pau Ferro", value: "Pau Ferro", price: 30 }] },
        { key: "fingerboard_radius", label: "Fingerboard Radius (mm)", options: [{ label: "254", value: "254", price: 0 }, { label: "305", value: "305", price: 0 }, { label: "355", value: "355", price: 15 }, { label: "406", value: "406", price: 20 }] },
        { key: "inlay_shape", label: "Inlay Shape", options: [{ label: "Dots", value: "Dots", price: 0 }, { label: "Blocks", value: "Blocks", price: 35 }, { label: "Sharkfin", value: "Sharkfin", price: 45 }] },
        { key: "inlay_material", label: "Inlay Material", options: [{ label: "Plastic", value: "Plastic", price: 0 }, { label: "Pearloid", value: "Pearloid", price: 20 }, { label: "Abalone", value: "Abalone", price: 35 }] },
        { key: "fret_type", label: "Fret Type", options: [{ label: "Standard", value: "Standard", price: 0 }, { label: "Medium", value: "Medium", price: 20 }, { label: "Jumbo", value: "Jumbo", price: 30 }] },
        { key: "neck_rear_finish", label: "Neck Rear Finish", options: [{ label: "Clear Gloss", value: "Clear Gloss", price: 0 }, { label: "Satin", value: "Satin", price: 20 }, { label: "Raw Tone", value: "Raw Tone", price: 35 }] },
        { key: "headstock_shape", label: "Headstock Shape", options: [{ label: "F-Style", value: "F-Style", price: 0 }, { label: "J-Style", value: "J-Style", price: 25 }, { label: "Reverse", value: "Reverse", price: 35 }, { label: "Open Book", value: "Open Book", price: 40 }, { label: "Explorer Pointed", value: "Explorer Pointed", price: 45 }, { label: "3+3 Vintage", value: "3+3 Vintage", price: 30 }] },
        { key: "headstock_color", label: "Headstock Color", options: [{ label: "Match Body", value: "Match Body", price: 0 }, { label: "Black", value: "Black", price: 20 }, { label: "Natural", value: "Natural", price: 15 }] },
        { key: "headstock_finish", label: "Headstock Finish", options: [{ label: "Gloss", value: "Gloss", price: 0 }, { label: "Satin", value: "Satin", price: 15 }, { label: "Matte", value: "Matte", price: 15 }] },
        { key: "logo_color", label: "Logo Color", options: [{ label: "White", value: "White", price: 0 }, { label: "Black", value: "Black", price: 0 }, { label: "Gold", value: "Gold", price: 20 }, { label: "Silver", value: "Silver", price: 20 }] },
        { key: "truss_rod_cover_color", label: "Truss Rod Cover Color", options: [{ label: "Black", value: "Black", price: 0 }, { label: "White", value: "White", price: 0 }, { label: "Chrome", value: "Chrome", price: 15 }] }
      ]
    },
    {
      id: "electronics",
      title: "Electronics Options",
      fields: [
        { key: "electronics_type", label: "Electronics Type", options: [{ label: "Passive", value: "Passive", price: 0 }, { label: "Active", value: "Active", price: 120 }] },
        { key: "pickup_config", label: "Pickup Config", options: [{ label: "HH", value: "HH", price: 0 }, { label: "HSH", value: "HSH", price: 25 }, { label: "HSS", value: "HSS", price: 20 }, { label: "SSS", value: "SSS", price: 30 }] },
        { key: "pickup_model", label: "Pickup Model", options: [{ label: "DiMarzio", value: "DiMarzio", price: 0 }, { label: "Seymour Duncan", value: "Seymour Duncan", price: 40 }, { label: "EMG", value: "EMG", price: 70 }] },
        { key: "pickup_color", label: "Pickup Color", options: [{ label: "Black", value: "Black", price: 0 }, { label: "White", value: "White", price: 10 }, { label: "Cream", value: "Cream", price: 10 }] },
        { key: "pickup_cover_option", label: "Pickup Cover Option", options: [{ label: "Open Coil", value: "Open Coil", price: 0 }, { label: "Covered", value: "Covered", price: 25 }] },
        { key: "pole_piece_color", label: "Pole Piece Color", options: [{ label: "Chrome", value: "Chrome", price: 0 }, { label: "Black", value: "Black", price: 10 }, { label: "Gold", value: "Gold", price: 20 }] }
      ]
    },
    {
      id: "hardware",
      title: "Hardware Options",
      fields: [
        { key: "bridge", label: "Bridge", options: [{ label: "Hardtail", value: "Hardtail", price: 0 }, { label: "Tremolo", value: "Tremolo", price: 60 }, { label: "Floyd-Style", value: "Floyd-Style", price: 120 }, { label: "TOM", value: "TOM", price: 45 }] },
        { key: "hardware_color", label: "Hardware Color", options: [{ label: "Chrome", value: "Chrome", price: 0 }, { label: "Black", value: "Black", price: 20 }, { label: "Gold", value: "Gold", price: 60 }] },
        { key: "knob_configuration", label: "Knob Configuration", options: [{ label: "1 Vol / 1 Tone", value: "1V1T", price: 0 }, { label: "2 Vol / 1 Tone", value: "2V1T", price: 10 }, { label: "2 Vol / 2 Tone", value: "2V2T", price: 20 }] },
        { key: "nut_material", label: "Nut Material", options: [{ label: "Synthetic", value: "Synthetic", price: 0 }, { label: "Bone", value: "Bone", price: 20 }, { label: "Graphite", value: "Graphite", price: 25 }] },
        { key: "tuning", label: "Tuning", options: [{ label: "Standard", value: "Standard", price: 0 }, { label: "Drop", value: "Drop", price: 0 }, { label: "Custom", value: "Custom", price: 15 }] },
        { key: "pickguard_color", label: "Pickguard Color", options: [{ label: "None", value: "None", price: 0 }, { label: "Black", value: "Black", price: 20 }, { label: "White", value: "White", price: 20 }, { label: "Pearl", value: "Pearl", price: 35 }] },
        { key: "cavity_cover_color", label: "Electronics Cavity Cover Color", options: [{ label: "Match Body", value: "Match Body", price: 0 }, { label: "Black", value: "Black", price: 10 }, { label: "White", value: "White", price: 10 }] }
      ]
    }
  ];

  const FIELD_MAP = {};
  SECTIONS.forEach((section) => {
    section.fields.forEach((field) => {
      FIELD_MAP[field.key] = field;
    });
  });

  const DEFAULT_SELECTIONS = {};
  SECTIONS.forEach((section) => {
    section.fields.forEach((field) => {
      DEFAULT_SELECTIONS[field.key] = field.options[0].value;
    });
  });

  // --------------------------------------------------
  // Função: getOptionPrice
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: fieldKey, selectedValue.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  function getOptionPrice(fieldKey, selectedValue) {
    const field = FIELD_MAP[fieldKey];
    if (!field) return 0;
    const opt = field.options.find((entry) => entry.value === selectedValue);
    return opt ? opt.price : 0;
  }

  // --------------------------------------------------
  // Função: getPriceLines
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: selections.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  function getPriceLines(selections) {
    const lines = [];
    SECTIONS.forEach((section) => {
      section.fields.forEach((field) => {
        const selected = selections[field.key];
        lines.push({
          key: field.key,
          label: field.label,
          selected,
          amount: getOptionPrice(field.key, selected)
        });
      });
    });
    return lines;
  }

  // --------------------------------------------------
  // Função: getTotalPrice
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: selections.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  function getTotalPrice(selections) {
    const optionsTotal = getPriceLines(selections).reduce((sum, line) => sum + line.amount, 0);
    return BASE_PRICE + optionsTotal;
  }

  // --------------------------------------------------
  // Função: formatLabel
  // O que faz: executa uma parte da lógica deste módulo.
  // Parâmetros: key.
  // Retorna: o resultado da operação (ou Promise, quando aplicável).
  // --------------------------------------------------
  function formatLabel(key) {
    return String(key)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  global.GuitarConfig = {
    BASE_PRICE,
    SECTIONS,
    FIELD_MAP,
    DEFAULT_SELECTIONS,
    getOptionPrice,
    getPriceLines,
    getTotalPrice,
    formatLabel
  };
})(window);
