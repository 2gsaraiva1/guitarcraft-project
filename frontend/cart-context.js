/*
Contexto global de carrinho/builds/encomendas.
Centraliza chamadas de API para:
- carrinho (add/remove/quantidade/checkout)
- builds guardadas (save/update/delete)
- historico de encomendas
*/

/* global React, GuitarAuth */
(function initCartContext(global) {
  const { createContext, useContext, useEffect, useMemo, useState } = React;
  const { useAuth } = GuitarAuth;

  const CartContext = createContext(null);
  const CART_API = "/api/cart";
  const SAVED_API = "/api/saved-builds";
  const ORDERS_API = "/api/orders";

  // --------------------------------------------------
  // Funcao: fetchJson
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: url, options.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  async function fetchJson(url, options) {
    // Helper unico para requests da UI com tratamento de erro padrao.
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }
    return data;
  }

  // --------------------------------------------------
  // Funcao: createBreakdownLines
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: selections.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function createBreakdownLines(selections) {
    if (!global.GuitarConfig) return [];
    return global.GuitarConfig.getPriceLines(selections);
  }

  // --------------------------------------------------
  // Funcao: CREATECustomBuildPayload
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: selections, label = "Custom Build", sourceId = "".
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function CREATECustomBuildPayload(selections, label = "Custom Build", sourceId = "") {
    // Estrutura padrao do item custom para salvar build e carrinho.
    const lines = createBreakdownLines(selections);
    const totalPrice = global.GuitarConfig.getTotalPrice(selections);
    return {
      type: "custom",
      itemType: "custom",
      quantity: 1,
      unitPrice: totalPrice,
      label: String(label || "Custom Build").trim() || "Custom Build",
      sourceId: String(sourceId || "").trim() || null,
      selections,
      priceBreakdown: lines,
      totalPrice
    };
  }

  // --------------------------------------------------
  // Funcao: CREATEPrebuiltPayload
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: guitar.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function CREATEPrebuiltPayload(guitar) {
    // Estrutura padrao do item prebuilt para carrinho.
    const basePrice = Number(guitar.price) || 0;
    const firstImage = Array.isArray(guitar.images) && guitar.images.length
      ? guitar.images[0]
      : (guitar.image || "");
    return {
      type: "prebuilt",
      itemType: "prebuilt",
      quantity: Math.max(1, Number(guitar.quantity || 1)),
      unitPrice: basePrice,
      label: `Pre-Built: ${guitar.name || "Guitar"}`,
      sourceId: guitar.id,
      image: firstImage,
      selections: {
        name: guitar.name || "Pre-Built Guitar",
        description: guitar.description || "",
        category: guitar.category || "",
        seriesName: guitar.seriesName || "",
        stockStatus: guitar.stockStatus || "",
        specs: Array.isArray(guitar.specs) ? guitar.specs.join(" | ") : ""
      },
      priceBreakdown: [
        {
          key: "prebuilt_price",
          label: "Pre-Built Price",
          selected: guitar.name || "Guitar",
          amount: basePrice
        }
      ],
      totalPrice: basePrice
    };
  }

  // --------------------------------------------------
  // Funcao: CartProvider
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: { children }.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function CartProvider({ children }) {
    const { currentUser } = useAuth();
    const [items, setItems] = useState([]);
    const [savedBuilds, setSavedBuilds] = useState([]);
    const [orders, setOrders] = useState([]);

    // --------------------------------------------------
    // Funcao: loadUserData
    // O que faz: executa uma parte da logica deste modulo.
    // Parametros: username.
    // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
    // --------------------------------------------------
    async function loadUserData(username) {
      // Carrega todos os dados do user atual numa unica sincronizacao.
      if (!username) {
        setItems([]);
        setSavedBuilds([]);
        setOrders([]);
        return;
      }

      const [cartData, savedData, ordersData] = await Promise.all([
        fetchJson(`${CART_API}/${encodeURIComponent(username)}`, { method: "GET" }).catch(() => []),
        fetchJson(`${SAVED_API}/${encodeURIComponent(username)}`, { method: "GET" }).catch(() => []),
        fetchJson(`${ORDERS_API}/${encodeURIComponent(username)}`, { method: "GET" }).catch(() => [])
      ]);

      setItems(Array.isArray(cartData) ? cartData : []);
      setSavedBuilds(Array.isArray(savedData) ? savedData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    }

    useEffect(() => {
      loadUserData(currentUser ? currentUser.username : "").catch(() => {
        setItems([]);
        setSavedBuilds([]);
        setOrders([]);
      });
    }, [currentUser && currentUser.username]);

    const value = useMemo(() => {
      const cartTotal = items.reduce((sum, item) => {
        return sum + (Number(item.unitPrice || item.totalPrice || 0) * Number(item.quantity || 1));
      }, 0);

      // --------------------------------------------------
      // Funcao: addCustomBuildToCart
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: selections, imagePreview = "", label = "Custom Build", sourceId = "".
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function addCustomBuildToCart(selections, imagePreview = "", label = "Custom Build", sourceId = "") {
        if (!currentUser) throw new Error("Login required.");
        const payload = CREATECustomBuildPayload(selections, label, sourceId);
        const cartItem = {
          ...payload,
          image: String(imagePreview || ""),
          cartId: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        };
        await fetchJson(`${CART_API}/${encodeURIComponent(currentUser.username)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item: cartItem })
        });
        await loadUserData(currentUser.username);
        window.dispatchEvent(new CustomEvent("guitarcraft_cart_updated"));
      }

      // --------------------------------------------------
      // Funcao: addPrebuiltToCart
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: guitar, quantity = 1.
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function addPrebuiltToCart(guitar, quantity = 1) {
        if (!currentUser) throw new Error("Login required.");
        const payload = CREATEPrebuiltPayload({ ...guitar, quantity });
        const cartItem = {
          ...payload,
          cartId: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        };
        await fetchJson(`${CART_API}/${encodeURIComponent(currentUser.username)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item: cartItem })
        });
        await loadUserData(currentUser.username);
        window.dispatchEvent(new CustomEvent("guitarcraft_cart_updated"));
      }

      // --------------------------------------------------
      // Funcao: removeFromCart
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: cartId.
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function removeFromCart(cartId) {
        if (!currentUser) throw new Error("Login required.");
        await fetchJson(`${CART_API}/${encodeURIComponent(currentUser.username)}/${encodeURIComponent(cartId)}`, {
          method: "DELETE"
        });
        setItems((prev) => prev.filter((item) => item.cartId !== cartId));
        window.dispatchEvent(new CustomEvent("guitarcraft_cart_updated"));
      }

      // --------------------------------------------------
      // Funcao: updateCartQuantity
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: cartId, quantity.
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function updateCartQuantity(cartId, quantity) {
        if (!currentUser) throw new Error("Login required.");
        const nextQuantity = Math.max(1, Number(quantity || 1));
        await fetchJson(`${CART_API}/${encodeURIComponent(currentUser.username)}/${encodeURIComponent(cartId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: nextQuantity })
        });
        await loadUserData(currentUser.username);
        window.dispatchEvent(new CustomEvent("guitarcraft_cart_updated"));
      }

      // --------------------------------------------------
      // Funcao: saveCustomBuild
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: selections, imagePreview = "", label = "Custom Build", savedId = "".
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function saveCustomBuild(selections, imagePreview = "", label = "Custom Build", savedId = "") {
        if (!currentUser) throw new Error("Login required.");
        const payload = CREATECustomBuildPayload(selections, label);
        const build = {
          ...payload,
          savedId: String(savedId || `saved_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
          imagePreview: String(imagePreview || ""),
          CREATEdAt: new Date().toISOString()
        };
        await fetchJson(`${SAVED_API}/${encodeURIComponent(currentUser.username)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ build })
        });
        await loadUserData(currentUser.username);
      }

      // --------------------------------------------------
      // Funcao: updateSavedBuild
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: savedId, updates = {}.
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function updateSavedBuild(savedId, updates = {}) {
        // Atualiza build guardada e tenta refletir mudancas em itens do carrinho
        // que vieram dessa build (mesmo sourceId).
        if (!currentUser) throw new Error("Login required.");
        let existing = savedBuilds.find((build) => build.savedId === savedId);
        if (!existing) {
          const remote = await fetchJson(`${SAVED_API}/${encodeURIComponent(currentUser.username)}`, { method: "GET" }).catch(() => []);
          if (Array.isArray(remote)) {
            existing = remote.find((build) => build.savedId === savedId);
          }
        }
        if (!existing) throw new Error("Saved build not found.");

        const nextSelections = updates.selections || existing.selections || {};
        const label = String(updates.label || existing.label || "Custom Build").trim() || "Custom Build";
        const payload = CREATECustomBuildPayload(nextSelections, label, savedId);
        const build = {
          ...payload,
          savedId: String(savedId),
          imagePreview: String(updates.imagePreview || existing.imagePreview || ""),
          CREATEdAt: existing.CREATEdAt
        };

        await fetchJson(`${SAVED_API}/${encodeURIComponent(currentUser.username)}/${encodeURIComponent(savedId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ build })
        });
        await fetchJson(`${CART_API}/${encodeURIComponent(currentUser.username)}/saved-build/${encodeURIComponent(savedId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item: {
              ...payload,
              image: String(build.imagePreview || "")
            }
          })
        }).catch(() => null);
        await loadUserData(currentUser.username);
      }

      // --------------------------------------------------
      // Funcao: addSavedBuildToCart
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: savedId.
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function addSavedBuildToCart(savedId) {
        if (!currentUser) throw new Error("Login required.");
        const found = savedBuilds.find((build) => build.savedId === savedId);
        if (!found) return;
        const type = found.type || found.itemType || "custom";
        const cartItem = {
          ...found,
          type,
          itemType: type,
          sourceId: found.savedId ? String(found.savedId) : (found.sourceId || null),
          quantity: type === "prebuilt" ? Number(found.quantity || 1) : 1,
          unitPrice: type === "prebuilt" ? Number(found.unitPrice || found.totalPrice || 0) : Number(found.totalPrice || 0),
          image: String(found.imagePreview || found.image || ""),
          cartId: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        };
        await fetchJson(`${CART_API}/${encodeURIComponent(currentUser.username)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item: cartItem })
        });
        await loadUserData(currentUser.username);
        window.dispatchEvent(new CustomEvent("guitarcraft_cart_updated"));
      }

      // --------------------------------------------------
      // Funcao: removeSavedBuild
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: savedId.
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function removeSavedBuild(savedId) {
        if (!currentUser) throw new Error("Login required.");
        await fetchJson(`${SAVED_API}/${encodeURIComponent(currentUser.username)}/${encodeURIComponent(savedId)}`, {
          method: "DELETE"
        });
        setSavedBuilds((prev) => prev.filter((item) => item.savedId !== savedId));
      }

      // --------------------------------------------------
      // Funcao: checkoutCartItems
      // O que faz: executa uma parte da logica deste modulo.
      // Parametros: cartIds, checkoutData = {}.
      // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
      // --------------------------------------------------
      async function checkoutCartItems(cartIds, checkoutData = {}) {
        if (!currentUser) throw new Error("Login required.");
        const ids = Array.isArray(cartIds) ? cartIds.filter(Boolean) : [];
        if (!ids.length) throw new Error("No cart items selected.");

        const data = await fetchJson(`${CART_API}/${encodeURIComponent(currentUser.username)}/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartIds: ids, checkoutData })
        });
        await loadUserData(currentUser.username);
        window.dispatchEvent(new CustomEvent("guitarcraft_cart_updated"));
        return data;
      }

      return {
        items,
        savedBuilds,
        orders,
        cartTotal,
        loadUserData,
        addCustomBuildToCart,
        addPrebuiltToCart,
        removeFromCart,
        updateCartQuantity,
        saveCustomBuild,
        updateSavedBuild,
        addSavedBuildToCart,
        removeSavedBuild,
        checkoutCartItems
      };
    }, [items, savedBuilds, orders, currentUser]);

    return React.createElement(CartContext.Provider, { value }, children);
  }

  // --------------------------------------------------
  // Funcao: useCart
  // O que faz: executa uma parte da logica deste modulo.
  // Parametros: nenhum parametro.
  // Retorna: o resultado da operacao (ou Promise, quando aplicavel).
  // --------------------------------------------------
  function useCart() {
    const value = useContext(CartContext);
    if (!value) throw new Error("useCart must be used inside CartProvider");
    return value;
  }

  global.GuitarCart = {
    CartProvider,
    useCart
  };
})(window);
