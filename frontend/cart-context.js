/*
Este mÃƒÂ³dulo mantÃƒÂ©m o estado global do carrinho, builds guardadas e encomendas.
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
  // FunÃƒÂ§ÃƒÂ£o: fetchJson
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: url, options.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  async function fetchJson(url, options) {
    // Chamada ÃƒÂ  API: comunica com o backend para sincronizar estado no frontend.
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }
    return data;
  }

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: createBreakdownLines
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: selections.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function createBreakdownLines(selections) {
    if (!global.GuitarConfig) return [];
    return global.GuitarConfig.getPriceLines(selections);
  }

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: createCustomBuildPayload
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: selections, label = "Custom Build", sourceId = "".
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function createCustomBuildPayload(selections, label = "Custom Build", sourceId = "") {
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
  // FunÃƒÂ§ÃƒÂ£o: createPrebuiltPayload
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: guitar.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function createPrebuiltPayload(guitar) {
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
  // FunÃƒÂ§ÃƒÂ£o: CartProvider
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: { children }.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function CartProvider({ children }) {
    const { currentUser } = useAuth();
    const [items, setItems] = useState([]);
    const [savedBuilds, setSavedBuilds] = useState([]);
    const [orders, setOrders] = useState([]);

    // --------------------------------------------------
    // FunÃƒÂ§ÃƒÂ£o: loadUserData
    // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
    // ParÃƒÂ¢metros: username.
    // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
    // --------------------------------------------------
    async function loadUserData(username) {
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
      // FunÃƒÂ§ÃƒÂ£o: addCustomBuildToCart
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: selections, imagePreview = "", label = "Custom Build", sourceId = "".
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      async function addCustomBuildToCart(selections, imagePreview = "", label = "Custom Build", sourceId = "") {
        if (!currentUser) throw new Error("Login required.");
        const payload = createCustomBuildPayload(selections, label, sourceId);
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
      // FunÃƒÂ§ÃƒÂ£o: addPrebuiltToCart
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: guitar, quantity = 1.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      async function addPrebuiltToCart(guitar, quantity = 1) {
        if (!currentUser) throw new Error("Login required.");
        const payload = createPrebuiltPayload({ ...guitar, quantity });
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
      // FunÃƒÂ§ÃƒÂ£o: removeFromCart
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: cartId.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
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
      // FunÃƒÂ§ÃƒÂ£o: updateCartQuantity
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: cartId, quantity.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
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
      // FunÃƒÂ§ÃƒÂ£o: saveCustomBuild
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: selections, imagePreview = "", label = "Custom Build", savedId = "".
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      async function saveCustomBuild(selections, imagePreview = "", label = "Custom Build", savedId = "") {
        if (!currentUser) throw new Error("Login required.");
        const payload = createCustomBuildPayload(selections, label);
        const build = {
          ...payload,
          savedId: String(savedId || `saved_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`),
          imagePreview: String(imagePreview || ""),
          createdAt: new Date().toISOString()
        };
        await fetchJson(`${SAVED_API}/${encodeURIComponent(currentUser.username)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ build })
        });
        await loadUserData(currentUser.username);
      }

      // --------------------------------------------------
      // FunÃƒÂ§ÃƒÂ£o: updateSavedBuild
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: savedId, updates = {}.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      async function updateSavedBuild(savedId, updates = {}) {
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
        const payload = createCustomBuildPayload(nextSelections, label, savedId);
        const build = {
          ...payload,
          savedId: String(savedId),
          imagePreview: String(updates.imagePreview || existing.imagePreview || ""),
          createdAt: existing.createdAt
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
      // FunÃƒÂ§ÃƒÂ£o: addSavedBuildToCart
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: savedId.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
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
      // FunÃƒÂ§ÃƒÂ£o: removeSavedBuild
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: savedId.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      async function removeSavedBuild(savedId) {
        if (!currentUser) throw new Error("Login required.");
        await fetchJson(`${SAVED_API}/${encodeURIComponent(currentUser.username)}/${encodeURIComponent(savedId)}`, {
          method: "DELETE"
        });
        setSavedBuilds((prev) => prev.filter((item) => item.savedId !== savedId));
      }

      // --------------------------------------------------
      // FunÃƒÂ§ÃƒÂ£o: checkoutCartItems
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: cartIds, checkoutData = {}.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
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
  // FunÃƒÂ§ÃƒÂ£o: useCart
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: nenhum parÃƒÂ¢metro.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
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
