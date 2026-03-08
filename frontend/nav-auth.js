/*
Este modulo renderiza a navbar dinmica, dropdowns e estado de sessao/carrinho.
*/

(function renderNav() {
  const nav = document.querySelector("nav");
  if (!nav) return;

  const CART_API = "/api/cart";
  const PLACEHOLDER = "/assets/placeholder-guitar.svg";
  const i18n = window.GuitarI18n;

  const TEXT = {
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
    "cart.qty": "Qty:"
  };

  // --------------------------------------------------
  // Funcao: t
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: key, vars.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function t(key, vars) {
    if (i18n && typeof i18n.t === "function") return i18n.t(key, vars);
    const template = TEXT[key] || key;
    if (!vars || typeof vars !== "object") return template;
    return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] || ""));
  }

  // --------------------------------------------------
  // Funcao: readSession
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function readSession() {
    try {
      const raw = localStorage.getItem("guitarcraft_session_v1");
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  // --------------------------------------------------
  // Funcao: ensureLucide
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function ensureLucide() {
    if (window.lucide) return;
    await new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js";
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });
  }

  // --------------------------------------------------
  // Funcao: totalFromItems
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: items.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function totalFromItems(items) {
    return (items || []).reduce((sum, item) => {
      const type = item.type || item.itemType;
      if (type === "prebuilt") {
        return sum + (Number(item.unitPrice || 0) * Number(item.quantity || 1));
      }
      return sum + Number(item.totalPrice || 0);
    }, 0);
  }

  // --------------------------------------------------
  // Funcao: itemPrice
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: item.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function itemPrice(item) {
    const type = item.type || item.itemType;
    if (type === "prebuilt") {
      return Number(item.unitPrice || 0) * Number(item.quantity || 1);
    }
    return Number(item.totalPrice || 0);
  }

  // --------------------------------------------------
  // Funcao: createDropdown
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: title, items.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function createDropdown(title, items) {
    const wrap = document.createElement("div");
    wrap.className = "gc-dropdown";

    if (title) {
      const heading = document.createElement("div");
      heading.className = "gc-dropdown-title";
      heading.textContent = title;
      wrap.appendChild(heading);
    }

    items.forEach((item) => {
      if (item.type === "button") {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "gc-dropdown-item gc-dropdown-btn";
        btn.textContent = item.label;
        btn.addEventListener("click", item.onClick);
        wrap.appendChild(btn);
        return;
      }

      const link = document.createElement("a");
      link.className = "gc-dropdown-item";
      link.href = item.href;
      link.textContent = item.label;
      wrap.appendChild(link);
    });

    return wrap;
  }

  // --------------------------------------------------
  // Funcao: loadCartPreview
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: username.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function loadCartPreview(username) {
    if (!username) return [];
    try {
      // Chamada  API: comunica com o backend para sincronizar estado no frontend.
      const response = await fetch(`${CART_API}/${encodeURIComponent(username)}`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  // --------------------------------------------------
  // Funcao: render
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function render() {
    const session = readSession();
    const loggedIn = Boolean(session && session.username);
    const cartItems = await loadCartPreview(loggedIn ? session.username : "");
    const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
    const cartSubtotal = totalFromItems(cartItems);

    nav.innerHTML = `
      <div class="gc-nav">
        <div class="gc-nav-left">
          <a href="/index.html" class="gc-brand">GuitarCraft</a>
          <button type="button" class="gc-hamburger" aria-label="Toggle navigation" aria-expanded="false">
            <i data-lucide="menu"></i>
          </button>
          <div class="gc-links">
            <a href="/index.html">${t("nav.home")}</a>
            <a href="/shop.html">${t("nav.shop")}</a>
            <a href="/guitar-builder.html">${t("nav.builder")}</a>
            <a href="/about.html">${t("nav.about")}</a>
          </div>
        </div>
        <div class="gc-nav-right">
          <div class="gc-lang-toggle" aria-label="${t("nav.language")}">
            <button type="button" class="gc-lang-pill" data-lang="en">EN</button>
            <button type="button" class="gc-lang-pill" data-lang="pt-pt">PT</button>
          </div>
          <div class="gc-menu gc-menu-cart">
            <a class="gc-icon-btn" href="/cart/" aria-label="${t("nav.cart")}">
              <i data-lucide="shopping-cart"></i>
              <span class="gc-badge">${cartCount}</span>
            </a>
          </div>
          <div class="gc-menu gc-menu-user">
            <button type="button" class="gc-icon-btn gc-user-trigger" aria-label="Account" aria-expanded="false">
              <i data-lucide="user-round"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    const cartMenu = nav.querySelector(".gc-menu-cart");
    const userMenu = nav.querySelector(".gc-menu-user");
    const userTrigger = nav.querySelector(".gc-user-trigger");
    const langButtons = nav.querySelectorAll(".gc-lang-pill");
    const hamburger = nav.querySelector(".gc-hamburger");
    const navLinks = nav.querySelector(".gc-links");

    if (langButtons.length && i18n && typeof i18n.getLang === "function") {
      const activeLang = i18n.getLang();
      langButtons.forEach((btn) => {
        if (btn.dataset.lang === activeLang) btn.classList.add("active");
        btn.addEventListener("click", () => {
          i18n.setLang(btn.dataset.lang);
        });
      });
    }

    const cartDrop = document.createElement("div");
    cartDrop.className = "gc-dropdown gc-cart-dropdown";
    if (!cartItems.length) {
      const empty = document.createElement("p");
      empty.className = "gc-dropdown-empty";
      empty.textContent = t("nav.cart_empty");
      cartDrop.appendChild(empty);
    } else {
      cartItems.slice(0, 5).forEach((item) => {
        const row = document.createElement("a");
        row.className = "gc-cart-item";
        row.href = "/cart/";
        row.innerHTML = `
          <img src="${item.image || item.imagePreview || PLACEHOLDER}" alt="${item.label}" />
          <div>
            <p class="gc-cart-item-name">${item.label}</p>
            <p class="gc-cart-item-meta">${t("cart.qty")} ${Number(item.quantity || 1)} &middot; $${itemPrice(item).toFixed(2)}</p>
          </div>
        `;
        row.querySelector("img").addEventListener("error", (e) => {
          e.currentTarget.src = PLACEHOLDER;
        });
        cartDrop.appendChild(row);
      });

      const subtotal = document.createElement("div");
      subtotal.className = "gc-cart-subtotal";
      subtotal.innerHTML = `<span>${t("nav.subtotal")}</span><strong>$${cartSubtotal.toFixed(2)}</strong>`;
      cartDrop.appendChild(subtotal);

      const actions = document.createElement("div");
      actions.className = "gc-cart-actions";
      actions.innerHTML = `
        <a href="/cart/" class="gc-mini-btn">${t("nav.view_cart")}</a>
        <a href="/checkout/" class="gc-mini-btn gc-mini-btn-primary">${t("nav.checkout")}</a>
      `;
      cartDrop.appendChild(actions);
    }
    cartMenu.appendChild(cartDrop);

    let userItems = [];
    if (loggedIn) {
      userItems = [
        { href: "/account/", label: t("nav.personal_center") },
        { href: "/account/", label: `${t("nav.signed_in")}: ${session.username}` },
        { href: "/saved-builds/", label: t("nav.saved_builds") },
        { href: "/orders/", label: t("nav.orders") },
        { href: "/account/#settings", label: t("nav.account_settings") },
        {
          type: "button",
          label: t("nav.logout"),
          onClick: () => {
            localStorage.removeItem("guitarcraft_session_v1");
            window.location.href = "/login/";
          }
        }
      ];
      if (session.role === "admin") {
        userItems.splice(1, 0, { href: "/admin/", label: t("nav.admin") });
      }
    } else {
      userItems = [
        { href: "/login/", label: t("nav.login") },
        { href: "/register/", label: t("nav.register") }
      ];
    }
    userMenu.appendChild(createDropdown(t("nav.personal_center"), userItems));

    if (userTrigger) {
      userTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = userMenu.classList.toggle("gc-menu-open");
        userTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });

      userMenu.querySelectorAll(".gc-dropdown-item").forEach((item) => {
        item.addEventListener("click", () => {
          userMenu.classList.remove("gc-menu-open");
          userTrigger.setAttribute("aria-expanded", "false");
        });
      });
    }

    if (hamburger && navLinks) {
      hamburger.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("gc-mobile-open");
        hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          nav.classList.remove("gc-mobile-open");
          hamburger.setAttribute("aria-expanded", "false");
        });
      });
    }

    await ensureLucide();
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }

    if (!window.__gcNavScrollBound) {
      window.__gcNavScrollBound = true;
      window.addEventListener("scroll", () => {
        if (window.scrollY > 8) nav.classList.add("gc-nav-scrolled");
        else nav.classList.remove("gc-nav-scrolled");
      }, { passive: true });
    }
    if (window.scrollY > 8) nav.classList.add("gc-nav-scrolled");
    else nav.classList.remove("gc-nav-scrolled");
  }

  if (!window.__gcNavCartListenerBound) {
    window.__gcNavCartListenerBound = true;
    window.addEventListener("guitarcraft_cart_updated", () => {
      render();
    });
  }

  if (!window.__gcNavSessionListenerBound) {
    window.__gcNavSessionListenerBound = true;
    window.addEventListener("guitarcraft_session_updated", () => {
      render();
    });
  }

  if (!window.__gcNavLangListenerBound) {
    window.__gcNavLangListenerBound = true;
    window.addEventListener("guitarcraft_lang_changed", () => {
      render();
    });
  }

  if (!window.__gcNavDocCloseBound) {
    window.__gcNavDocCloseBound = true;
    document.addEventListener("click", (e) => {
      const menu = document.querySelector("nav .gc-menu-user");
      if (!menu) return;
      if (menu.contains(e.target)) return;
      menu.classList.remove("gc-menu-open");
      const trigger = menu.querySelector(".gc-user-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  render();
})();
