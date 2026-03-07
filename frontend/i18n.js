/*
Este mÃƒÆ’Ã‚Â³dulo gere internacionalizaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (EN/PT), traduÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o de texto e persistÃƒÆ’Ã‚Âªncia de idioma.
*/

(function initI18n(global) {
  const LANG_KEY = "guitarcraft_lang_v1";
  const DEFAULT_LANG = "en";
  const SUPPORTED = ["en", "pt-pt"];

  const DICT = {
    en: {
      "nav.home": "Home",
      "nav.shop": "Shop",
      "nav.builder": "Builder",
      "nav.about": "About",
      "nav.cart": "Cart",
      "nav.personal_center": "Personal Center",
      "nav.signed_in": "Signed in",
      "nav.saved_builds": "Saved Builds",
      "nav.orders": "Orders",
      "nav.account_settings": "Account Settings",
      "nav.logout": "Logout",
      "nav.login": "Login",
      "nav.register": "Register",
      "nav.admin": "Admin",
      "nav.cart_empty": "Your cart is empty",
      "nav.subtotal": "Subtotal",
      "nav.view_cart": "View Cart",
      "nav.checkout": "Checkout",
      "nav.language": "Language",
      "cart.qty": "Qty:",

      "stock.in_stock": "In Stock",
      "stock.in_stock_few": "In Stock - Only {qty} left",
      "stock.low_stock": "Low Stock - Only {qty} left",
      "stock.out_of_stock": "Out of Stock",
      "stock.preorder": "Pre-order",
      "stock.backorder": "Backorder - Ships when available",
      "stock.estimated_restock": "Estimated restock: {date}",
      "stock.estimated_ship": "Estimated ship date: {date}",
      "stock.out_with_restock": "Out of Stock - Restock {date}",
      "stock.pre_with_est": "Pre-order - Est. {date}",
      "stock.back_with_est": "Backorder - Est. {date}",

      "era.vintage": "Vintage",
      "era.modern": "Modern"
    },
    "pt-pt": {
      "nav.home": "Inicio",
      "nav.shop": "Loja",
      "nav.builder": "Builder",
      "nav.about": "Sobre",
      "nav.cart": "Carrinho",
      "nav.personal_center": "Centro Pessoal",
      "nav.signed_in": "Sessao iniciada",
      "nav.saved_builds": "Builds Guardadas",
      "nav.orders": "Encomendas",
      "nav.account_settings": "Definicoes da Conta",
      "nav.logout": "Terminar sessao",
      "nav.login": "Entrar",
      "nav.register": "Registar",
      "nav.admin": "Admin",
      "nav.cart_empty": "O carrinho esta vazio",
      "nav.subtotal": "Subtotal",
      "nav.view_cart": "Ver Carrinho",
      "nav.checkout": "Checkout",
      "nav.language": "Idioma",
      "cart.qty": "Qtd:",

      "stock.in_stock": "Em Stock",
      "stock.in_stock_few": "Em Stock - Restam {qty}",
      "stock.low_stock": "Stock Baixo - Restam {qty}",
      "stock.out_of_stock": "Sem Stock",
      "stock.preorder": "Pre-encomenda",
      "stock.backorder": "Backorder - Envia quando disponivel",
      "stock.estimated_restock": "Reposicao estimada: {date}",
      "stock.estimated_ship": "Data estimada de envio: {date}",
      "stock.out_with_restock": "Sem Stock - Reposicao {date}",
      "stock.pre_with_est": "Pre-encomenda - Prev. {date}",
      "stock.back_with_est": "Backorder - Prev. {date}",

      "era.vintage": "Vintage",
      "era.modern": "Moderna"
    }
  };

  const PHRASES_PT = {
    "Cart": "Carrinho",
    "Shop": "Loja",
    "Builder": "Builder",
    "About": "Sobre",
    "Contact": "Contacto",
    "Copyright (c) 2026 GuitarCraft. All rights reserved.": "Copyright (c) 2026 GuitarCraft. Todos os direitos reservados.",
    "Home": "Inicio",
    "Language": "Idioma",
    "Account": "Conta",
    "Shop Guitars": "Loja de Guitarras",
    "Craft Your Tone.": "Cria o Teu Som.",
    "Classic soul. Modern precision.": "Alma vintage. Precisao moderna.",
    "Shop Collection": "Ver Colecao",
    "Start Building": "Comecar Builder",
    "Featured Series": "Series em Destaque",
    "Explore Series": "Explorar Serie",
    "Featured Guitars": "Guitarras em Destaque",
    "Loading featured guitars...": "A carregar guitarras em destaque...",
    "No featured guitars available right now.": "Sem guitarras em destaque de momento.",
    "Featured guitars are temporarily unavailable.": "As guitarras em destaque estao temporariamente indisponiveis.",
    "Built for players who demand more.": "Construida para musicos que exigem mais.",
    "Design Your Own": "Desenha a Tua",
    "Every GuitarCraft instrument is shaped for feel, voiced for clarity, and finished with detail-driven craftsmanship for stage and studio.": "Cada instrumento GuitarCraft e moldado para conforto, afinado para clareza e finalizado com artesanato focado no detalhe para palco e estudio.",
    "Dial in woods, finishes, electronics, and hardware to build a guitar tailored to your sound and style.": "Escolhe madeiras, acabamentos, eletronica e hardware para criar uma guitarra ajustada ao teu som e estilo.",
    "About GuitarCraft": "Sobre a GuitarCraft",
    "Crafted for Tone. Built for Players.": "Construidas para som. Feitas para musicos.",
    "Vintage soul and modern precision, designed for musicians who play with purpose.": "Alma vintage e precisao moderna, pensadas para musicos que tocam com intencao.",
    "Our Story": "A Nossa Historia",
    "Vintage vs Modern Philosophy": "Filosofia Vintage vs Moderna",
    "The Builder Experience": "A Experiencia Builder",
    "Start Your Build": "Comeca a Tua Build",
    "Quality & Craftsmanship": "Qualidade e Artesanato",
    "General Inquiries": "Informacoes Gerais",
    "Custom Builder Team": "Equipa Builder",
    "Dealer & Artist Relations": "Relacoes com Lojas e Artistas",
    "Your cart is empty.": "O teu carrinho esta vazio.",
    "Go to Shop": "Ir para a Loja",
    "Go to Builder": "Ir para Builder",
    "Login required.": "E necessario iniciar sessao.",
    "Authentication failed.": "Falha na autenticacao.",
    "Username": "Nome de utilizador",
    "Password": "Palavra-passe",
    "Create Account": "Criar Conta",
    "Need an account?": "Precisas de conta?",
    "Already have an account?": "Ja tens conta?",
    "User Info": "Informacao do Utilizador",
    "Name:": "Nome:",
    "Email:": "Email:",
    "Role:": "Funcao:",
    "Account Settings": "Definicoes da Conta",
    "New Username": "Novo Nome de Utilizador",
    "Current Password": "Palavra-passe Atual",
    "New Password": "Nova Palavra-passe",
    "Confirm New Password": "Confirmar Nova Palavra-passe",
    "Save Settings": "Guardar Definicoes",
    "Saved Builds": "Builds Guardadas",
    "No saved builds yet.": "Ainda nao ha builds guardadas.",
    "Open Saved Builds Page": "Abrir Pagina de Builds Guardadas",
    "Order History": "Historico de Encomendas",
    "No orders available yet.": "Ainda nao existem encomendas.",
    "Open Full Orders Page": "Abrir Pagina Completa de Encomendas",
    "Series": "Serie",
    "Era": "Era",
    "All": "Todas",
    "Modern": "Moderna",
    "No guitars match the selected filters.": "Nenhuma guitarra corresponde aos filtros selecionados.",
    "Price:": "Preco:",
    "Status:": "Estado:",
    "View Details": "Ver Detalhes",
    "Add to Cart": "Adicionar ao Carrinho",
    "Unavailable": "Indisponivel",
    "Login required for cart actions.": "E necessario iniciar sessao para acoes do carrinho.",
    "No pre-built guitars available yet.": "Ainda nao ha guitarras pre-built disponiveis.",
    "Loading product...": "A carregar produto...",
    "Product not found.": "Produto nao encontrado.",
    "Failed to load product.": "Falha ao carregar produto.",
    "Category:": "Categoria:",
    "Reviews": "Avaliacoes",
    "Loading reviews...": "A carregar avaliacoes...",
    "Your Rating": "A Tua Avaliacao",
    "Comment": "Comentario",
    "Submit Review": "Enviar Avaliacao",
    "Update Review": "Atualizar Avaliacao",
    "Rewrite Review": "Reescrever Avaliacao",
    "Login to leave a review.": "Inicia sessao para deixar uma avaliacao.",
    "Comment is required.": "Comentario obrigatorio.",
    "Review submitted.": "Avaliacao enviada.",
    "Review updated.": "Avaliacao atualizada.",
    "Review deleted.": "Avaliacao removida.",
    "Delete Review": "Remover Avaliacao",
    "Full Description": "Descricao Completa",
    "Specifications": "Especificacoes",
    "Customize Your Guitar": "Personaliza a Tua Guitarra",
    "2D Preview": "Pre-visualizacao 2D",
    "FRONT": "FRENTE",
    "BACK": "TRAS",
    "Build Name": "Nome da Build",
    "Price Breakdown": "Detalhe de Preco",
    "Base Guitar": "Guitarra Base",
    "Total": "Total",
    "Save Build": "Guardar Build",
    "Save Changes": "Guardar Alteracoes",
    "Edit Build": "Editar Build",
    "Added to cart.": "Adicionada ao carrinho.",
    "Build saved.": "Build guardada.",
    "Build changes saved.": "Alteracoes da build guardadas.",
    "Saved build added to cart.": "Build guardada adicionada ao carrinho.",
    "Saved build removed.": "Build guardada removida.",
    "Could not load the selected saved build.": "Nao foi possivel carregar a build guardada selecionada.",
    "Checkout": "Checkout",
    "Checkout Details": "Detalhes de Checkout",
    "Address": "Morada",
    "Card Details": "Dados do Cartao",
    "Review Items": "Rever Itens",
    "Complete Purchase": "Concluir Compra",
    "Processing...": "A processar...",
    "Back to Cart": "Voltar ao Carrinho",
    "Secure Checkout": "Checkout Seguro",
    "This is a demo checkout flow for GuitarCraft. No real payment is processed.": "Este e um fluxo demo de checkout da GuitarCraft. Nenhum pagamento real e processado.",
    "Order Confirmed": "Encomenda Confirmada",
    "View Orders": "Ver Encomendas",
    "Continue Shopping": "Continuar Compras",
    "No orders yet.": "Ainda nao existem encomendas.",
    "Date:": "Data:",
    "Total:": "Total:",
    "Address:": "Morada:",
    "Cancel Order": "Cancelar Encomenda",
    "Admin Dashboard": "Painel de Admin",
    "Add New Guitar": "Adicionar Nova Guitarra",
    "Site Images": "Imagens do Site",
    "Manage homepage and about page image URLs separately from guitars.": "Gerir URLs de imagem da homepage e da pagina about separadamente das guitarras.",
    "Save Site Images": "Guardar Imagens do Site",
    "Loading...": "A carregar...",
    "Edit Guitar": "Editar Guitarra",
    "Add Guitar": "Adicionar Guitarra",
    "Short Description": "Descricao Curta",
    "Short Description (PT)": "Descricao Curta (PT)",
    "Full Description (PT)": "Descricao Completa (PT)",
    "Specs (comma separated)": "Specs (separadas por virgulas)",
    "Image URLs (comma separated)": "URLs de imagem (separadas por virgulas)",
    "Category": "Categoria",
    "Series Name": "Nome da Serie",
    "Stock Status": "Estado de Stock",
    "Stock Quantity": "Quantidade em Stock",
    "Estimated Restock Date": "Data Estimada de Reposicao",
    "Create Guitar": "Criar Guitarra",
    "Cancel": "Cancelar",
    "Delete": "Eliminar",
    "Rename": "Renomear",
    "Remove": "Remover",
    "Select": "Selecionar",
    "Type:": "Tipo:",
    "Pre-Built Guitar": "Guitarra Pre-Built",
    "Custom Build": "Build Personalizada",
    "Item Total:": "Total do Item:",
    "Selected Specs": "Specs Selecionadas",
    "Quantity:": "Quantidade:",
    "All Items Total": "Total de Todos os Itens",
    "Selected Items Total": "Total dos Itens Selecionados",
    "Checkout Total:": "Total Checkout:",
    "Proceed to Checkout": "Avancar para Checkout",
    "Cart item removed.": "Item removido do carrinho.",
    "Failed to remove item.": "Falha ao remover item.",
    "Failed to update quantity.": "Falha ao atualizar quantidade."
    ,"General Options": "Opcoes Gerais"
    ,"Body Options": "Opcoes do Corpo"
    ,"Neck Options": "Opcoes do Braco"
    ,"Electronics Options": "Opcoes de Eletronica"
    ,"Hardware Options": "Opcoes de Hardware"
    ,"Model": "Modelo"
    ,"Dexterity": "Destreza"
    ,"Strings": "Cordas"
    ,"Body Wood": "Madeira do Corpo"
    ,"Top Wood": "Madeira do Topo"
    ,"Finish": "Acabamento"
    ,"Body Color": "Cor do Corpo"
    ,"Top Coat": "Camada Final"
    ,"Neck Wood": "Madeira do Braco"
    ,"Number of Frets": "Numero de Trastes"
    ,"Neck Profile": "Perfil do Braco"
    ,"Fretboard Wood": "Madeira da Escala"
    ,"Fingerboard Radius (mm)": "Raio da Escala (mm)"
    ,"Inlay Shape": "Forma da Incrustacao"
    ,"Inlay Material": "Material da Incrustacao"
    ,"Fret Type": "Tipo de Traste"
    ,"Neck Rear Finish": "Acabamento Traseiro do Braco"
    ,"Headstock Shape": "Forma da Cabeca"
    ,"Headstock Color": "Cor da Cabeca"
    ,"Headstock Finish": "Acabamento da Cabeca"
    ,"Logo Color": "Cor do Logo"
    ,"Truss Rod Cover Color": "Cor da Tampa do Tensor"
    ,"Electronics Type": "Tipo de Eletronica"
    ,"Pickup Config": "Configuracao de Pickups"
    ,"Pickup Model": "Modelo de Pickup"
    ,"Pickup Color": "Cor dos Pickups"
    ,"Pickup Cover Option": "Opcao de Capa dos Pickups"
    ,"Pole Piece Color": "Cor dos Polos"
    ,"Bridge": "Ponte"
    ,"Hardware Color": "Cor do Hardware"
    ,"Knob Configuration": "Configuracao de Knobs"
    ,"Nut Material": "Material da Pestana"
    ,"Tuning": "Afinacao"
    ,"Pickguard Color": "Cor do Escudo"
    ,"Electronics Cavity Cover Color": "Cor da Tampa da Cavidade"
    ,"Right": "Direita"
    ,"Left": "Esquerda"
    ,"No Top": "Sem Topo"
    ,"Solid Colors": "Cores Solidas"
    ,"Metallic Colors": "Cores Metalicas"
    ,"Fades": "Degrades"
    ,"Sparkle Colors": "Cores Sparkle"
    ,"Clear Gloss": "Brilho Transparente"
    ,"Raw Tone": "Raw Tone"
    ,"Satin": "Satinado"
    ,"Matte": "Mate"
    ,"Roasted Maple": "Maple Torrado"
    ,"Pau Ferro": "Pau Ferro"
    ,"Dots": "Pontos"
    ,"Blocks": "Blocos"
    ,"Standard": "Padrao"
    ,"Open Book": "Livro Aberto"
    ,"Match Body": "Corpo Igual"
    ,"Passive": "Passiva"
    ,"Active": "Ativa"
    ,"Open Coil": "Bobina Aberta"
    ,"Covered": "Coberto"
    ,"Hardtail": "Hardtail"
    ,"Tremolo": "Tremolo"
    ,"None": "Nenhum"
    ,"Order:": "Encomenda:"
    ,"Items:": "Itens:"
    ,"Total Paid:": "Total Pago:"
    ,"Full Name": "Nome Completo"
    ,"Address Line 1": "Morada Linha 1"
    ,"Address Line 2 (Optional)": "Morada Linha 2 (Opcional)"
    ,"State / Region": "Estado / Regiao"
    ,"Postal Code": "Codigo Postal"
    ,"Country": "Pais"
    ,"Name on Card": "Nome no Cartao"
    ,"Card Number": "Numero do Cartao"
    ,"Expiry (MM/YY)": "Validade (MM/AA)"
    ,"Date:": "Data:"
    ,"Save Name": "Guardar Nome"
    ,"Build name updated.": "Nome da build atualizado."
    ,"Added saved build to cart.": "Build guardada adicionada ao carrinho."
    ,"Saved build deleted.": "Build guardada eliminada."
    ,"Failed to add.": "Falha ao adicionar."
    ,"Failed to delete.": "Falha ao eliminar."
    ,"Site images updated.": "Imagens do site atualizadas."
    ,"Failed to update site images.": "Falha ao atualizar imagens do site."
    ,"Guitar updated.": "Guitarra atualizada."
    ,"Guitar added.": "Guitarra adicionada."
    ,"Guitar deleted.": "Guitarra eliminada."
    ,"Delete failed.": "Falha ao eliminar."
    ,"Delete this guitar?": "Eliminar esta guitarra?"
    ,"Current password is required.": "A palavra-passe atual e obrigatoria."
    ,"New password and confirmation do not match.": "A nova palavra-passe e a confirmacao nao coincidem."
    ,"Account settings updated.": "Definicoes da conta atualizadas."
    ,"Failed to update settings.": "Falha ao atualizar definicoes."
    ,"Payment approved. Order confirmed.": "Pagamento aprovado. Encomenda confirmada."
    ,"Checkout failed.": "Checkout falhou."
    ,"Select at least one item.": "Seleciona pelo menos um item."
    ,"Card number is invalid.": "Numero de cartao invalido."
    ,"Expiry must be MM/YY.": "A validade deve ser MM/AA."
    ,"CVV is invalid.": "CVV invalido."
    ,"Full name is required.": "Nome completo obrigatorio."
    ,"Valid email is required.": "Email valido obrigatorio."
    ,"Address line 1 is required.": "Morada linha 1 obrigatoria."
    ,"City is required.": "Cidade obrigatoria."
    ,"State/Region is required.": "Estado/Regiao obrigatorio."
    ,"Postal code is required.": "Codigo postal obrigatorio."
    ,"Country is required.": "Pais obrigatorio."
    ,"Name on card is required.": "Nome no cartao obrigatorio."
  };

  const SHORT_DESC_PT = {
    "single-cut classic voice with warm sustain.": "Voz classica single-cut com sustain quente.",
    "traditional bolt-on feel with modern reliability.": "Sensacao bolt-on tradicional com fiabilidade moderna.",
    "extended range platform for progressive players.": "Plataforma de gama estendida para musicos progressivos.",
    "built for tone, feel, and reliability.": "Construida para timbre, conforto e fiabilidade."
  };

  const FULL_DESC_PT = {
    "the lp custom supreme blends timeless single-cut authority with refined modern appointments. its carved maple top adds clarity and articulation to the warm foundation of a mahogany body, delivering thick sustain and rich harmonic depth. built for players who want classic tone with elevated elegance, it offers smooth playability across all 22 frets and commanding presence on stage.": "A LP Custom Supreme combina a autoridade intemporal de uma single-cut com detalhes modernos refinados. O topo em maple esculpido acrescenta clareza e articulacao a base quente de um corpo em mogno, oferecendo sustain encorpado e grande riqueza harmonica. Feita para musicos que procuram timbre classico com elegancia elevada, oferece tocabilidade fluida ao longo dos 22 trastes e presenca marcante em palco."
  };

  const TEXT_MEMORY = new WeakMap();
  const NORMALIZED_PT = {};
  let observer = null;
  let isApplying = false;
  let rafId = 0;

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: normalizeLang
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: lang.
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function normalizeLang(lang) {
    const key = String(lang || "").toLowerCase();
    return SUPPORTED.includes(key) ? key : DEFAULT_LANG;
  }

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: getLang
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: nenhum parÃƒÆ’Ã‚Â¢metro.
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function getLang() {
    return normalizeLang(localStorage.getItem(LANG_KEY) || DEFAULT_LANG);
  }

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: setLang
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: lang.
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function setLang(lang) {
    const next = normalizeLang(lang);
    localStorage.setItem(LANG_KEY, next);
    applyToDocument(document);
    window.dispatchEvent(new CustomEvent("guitarcraft_lang_changed", { detail: { lang: next } }));
  }

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: normalizeText
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: value.
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function normalizeText(value) {
    return String(value || "")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, "\"")
      .replace(/\s+/g, " ")
      .trim();
  }

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: normalizeKey
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: value.
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function normalizeKey(value) {
    return normalizeText(value).replace(/[.!?]+$/g, "").toLowerCase();
  }

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: t
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: key, vars = {}.
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function t(key, vars = {}) {
    const lang = getLang();
    const value = (DICT[lang] && DICT[lang][key]) || (DICT.en && DICT.en[key]) || key;
    const rendered = value.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] || ""));
    return lang === "pt-pt" ? ptAccents(rendered) : rendered;
  }

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: ptAccents
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: text.
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function ptAccents(text) {
    let out = String(text || "");
    const rules = [
      [/\bInicio\b/g, "Início"],
      [/\binicio\b/g, "início"],
      [/\bComecar\b/g, "Começar"],
      [/\bcomecar\b/g, "começar"],
      [/\bComeca\b/g, "Começa"],
      [/\bcomeca\b/g, "começa"],
      [/\bSerie\b/g, "Série"],
      [/\bserie\b/g, "série"],
      [/\bSeries\b/g, "Séries"],
      [/\bseries\b/g, "séries"],
      [/\bDescricao\b/g, "Descrição"],
      [/\bdescricao\b/g, "descrição"],
      [/\bDescricoes\b/g, "Descrições"],
      [/\bdescricoes\b/g, "descrições"],
      [/\bEspecificacoes\b/g, "Especificações"],
      [/\bespecificacoes\b/g, "especificações"],
      [/\bSessao\b/g, "Sessão"],
      [/\bsessao\b/g, "sessão"],
      [/\bDefinicoes\b/g, "Definições"],
      [/\bdefinicoes\b/g, "definições"],
      [/\bAvaliacao\b/g, "Avaliação"],
      [/\bavaliacao\b/g, "avaliação"],
      [/\bAvaliacoes\b/g, "Avaliações"],
      [/\bavaliacoes\b/g, "avaliações"],
      [/\bAlteracoes\b/g, "Alterações"],
      [/\balteracoes\b/g, "alterações"],
      [/\bInformacao\b/g, "Informação"],
      [/\binformacao\b/g, "informação"],
      [/\bConfiguracao\b/g, "Configuração"],
      [/\bconfiguracao\b/g, "configuração"],
      [/\bConfiguracoes\b/g, "Configurações"],
      [/\bconfiguracoes\b/g, "configurações"],
      [/\bReposicao\b/g, "Reposição"],
      [/\breposicao\b/g, "reposição"],
      [/\bColecao\b/g, "Coleção"],
      [/\bcolecao\b/g, "coleção"],
      [/\bEletronica\b/g, "Eletrónica"],
      [/\beletronica\b/g, "eletrónica"],
      [/\bHistoria\b/g, "História"],
      [/\bhistoria\b/g, "história"],
      [/\bMusicos\b/g, "Músicos"],
      [/\bmusicos\b/g, "músicos"],
      [/\bNao\b/g, "Não"],
      [/\bnao\b/g, "não"],
      [/\bEstao\b/g, "Estão"],
      [/\bestao\b/g, "estão"],
      [/\bregiao\b/g, "região"],
      [/\bRegiao\b/g, "Região"],
      [/\bpais\b/g, "país"],
      [/\bPais\b/g, "País"],
      [/\bcodigo\b/g, "código"],
      [/\bCodigo\b/g, "Código"],
      [/\bacao\b/g, "ação"],
      [/\bAcoes\b/g, "Ações"],
      [/\bacoes\b/g, "ações"],
      [/\bprecisao\b/g, "precisão"],
      [/\bPrecisao\b/g, "Precisão"],
      [/\bintencao\b/g, "intenção"],
      [/\bIntencao\b/g, "Intenção"],
      [/\bcartao\b/g, "cartão"],
      [/\bCartao\b/g, "Cartão"],
      [/\binvalido\b/g, "inválido"],
      [/\bInvalido\b/g, "Inválido"],
      [/\bobrigatorio\b/g, "obrigatório"],
      [/\bObrigatorio\b/g, "Obrigatório"],
      [/\bobrigatoria\b/g, "obrigatória"],
      [/\bObrigatoria\b/g, "Obrigatória"]
    ];
    rules.forEach(([pattern, replacement]) => {
      out = out.replace(pattern, replacement);
    });
    return out;
  }

  function translateText(original) {
    const lang = getLang();
    if (lang === "en") return original;
    const clean = normalizeText(original);
    const normalized = normalizeKey(clean);
    if (PHRASES_PT[clean]) return ptAccents(PHRASES_PT[clean]);
    if (NORMALIZED_PT[normalized]) return ptAccents(NORMALIZED_PT[normalized]);
    if (clean.startsWith("Signed in:")) return ptAccents(clean.replace(/^Signed in:/, "Sessao iniciada:"));
    if (clean.startsWith("Logged in as ")) return ptAccents(clean.replace(/^Logged in as /, "Sessao iniciada: "));
    if (clean.startsWith("Editing saved build:")) return ptAccents(clean.replace(/^Editing saved build:/, "A editar build guardada:"));
    if (clean.startsWith("Order ")) return ptAccents(clean.replace(/^Order /, "Encomenda "));
    if (clean.startsWith("Added \"") && clean.endsWith("\" to cart.")) {
      return ptAccents(clean.replace(/^Added /, "Adicionada ").replace(/ to cart\.$/, " ao carrinho."));
    }
    if (clean.startsWith("\"") && clean.endsWith("\" is currently unavailable.")) {
      return ptAccents(clean.replace(/ is currently unavailable\.$/, " esta atualmente indisponivel."));
    }
    if (clean.startsWith("Qty ")) return ptAccents(clean.replace(/^Qty /, "Qtd "));
    return original;
  }

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: localizeDescription
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: guitar, type = "short".
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function localizeDescription(guitar, type = "short") {
    const model = guitar || {};
    const isFull = type === "full";
    const english = String(isFull ? (model.fullDescription || model.description || "") : (model.shortDescription || model.description || ""));
    if (!english) return "";

    if (getLang() === "en") return english;

    const i18nField = isFull ? model.fullDescriptionI18n : model.shortDescriptionI18n;
    if (i18nField && typeof i18nField === "object") {
      const fromObject = i18nField["pt-pt"] || i18nField.pt || i18nField.portuguese;
      if (String(fromObject || "").trim()) return ptAccents(String(fromObject).trim());
    }

    const normalized = normalizeKey(english);
    if (isFull && FULL_DESC_PT[normalized]) return ptAccents(FULL_DESC_PT[normalized]);
    if (!isFull && SHORT_DESC_PT[normalized]) return ptAccents(SHORT_DESC_PT[normalized]);
    return english;
  }

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: shouldSkipTextNode
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: node.
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    const tag = parent.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "TEXTAREA") return true;
    if (parent.closest("[data-i18n-no-translate], .gc-no-i18n")) return true;
    return false;
  }

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: applyPhraseTranslations
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: root = document.
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function applyPhraseTranslations(root = document) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (!shouldSkipTextNode(node)) {
        const current = node.nodeValue;
        if (current && current.trim()) {
          if (!TEXT_MEMORY.has(node)) TEXT_MEMORY.set(node, current);
          const original = TEXT_MEMORY.get(node);
          const translated = translateText(original);
          if (node.nodeValue !== translated) node.nodeValue = translated;
        }
      }
      node = walker.nextNode();
    }
  }

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: applyToDocument
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: root = document.
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function applyToDocument(root = document) {
    isApplying = true;
    applyPhraseTranslations(root);
    isApplying = false;
  }

  Object.keys(PHRASES_PT).forEach((key) => {
    NORMALIZED_PT[normalizeKey(key)] = PHRASES_PT[key];
  });

  // --------------------------------------------------
  // FunÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o: startObserver
  // O que faz: executa uma parte da lÃƒÆ’Ã‚Â³gica deste mÃƒÆ’Ã‚Â³dulo.
  // ParÃƒÆ’Ã‚Â¢metros: nenhum parÃƒÆ’Ã‚Â¢metro.
  // Retorna: o resultado da operaÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Â£o (ou Promise, quando aplicÃƒÆ’Ã‚Â¡vel).
  // --------------------------------------------------
  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      if (isApplying) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        applyToDocument(document);
        rafId = 0;
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }

  global.GuitarI18n = {
    supported: SUPPORTED.slice(),
    getLang,
    setLang,
    t,
    translateText,
    localizeDescription,
    applyToDocument
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applyToDocument(document);
      startObserver();
    }, { once: true });
  } else {
    applyToDocument(document);
    startObserver();
  }
})(window);
