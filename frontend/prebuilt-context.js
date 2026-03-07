/*
Este mÃƒÂ³dulo mantÃƒÂ©m estado global das guitarras pre-built e operaÃƒÂ§ÃƒÂµes CRUD.
*/

/* global React, GuitarAuth */
(function initPrebuiltContext(global) {
  const { createContext, useContext, useEffect, useMemo, useState } = React;
  const { useAuth } = GuitarAuth;

  const API_BASE = "/api/prebuilt";
  const PrebuiltContext = createContext(null);

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
  // FunÃƒÂ§ÃƒÂ£o: validateGuitar
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: guitar.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function validateGuitar(guitar) {
    const errors = [];
    if (!String(guitar.name || "").trim()) errors.push("Name is required.");
    if (!String(guitar.description || "").trim()) errors.push("Description is required.");
    if (!String(guitar.shortDescription || "").trim()) errors.push("Short description is required.");
    if (!String(guitar.fullDescription || "").trim()) errors.push("Full description is required.");
    if (!Number.isFinite(Number(guitar.price)) || Number(guitar.price) <= 0) errors.push("Price must be greater than 0.");
    if (!Array.isArray(guitar.specs) || guitar.specs.length === 0) errors.push("At least one spec is required.");
    if (!String(guitar.image || "").trim()) errors.push("Image is required.");
    if (!Array.isArray(guitar.images) || guitar.images.length === 0) errors.push("At least one image is required.");
    if (!String(guitar.category || "").trim()) errors.push("Category is required.");
    if (!["classic", "modern"].includes(String(guitar.category || "").toLowerCase())) errors.push("Category must be classic or modern.");
    if (!String(guitar.seriesName || "").trim()) errors.push("Series name is required.");
    if (!["in_stock", "low_stock", "out_of_stock", "preorder", "backorder"].includes(String(guitar.stockStatus || ""))) errors.push("Stock status is invalid.");
    if (!Number.isFinite(Number(guitar.stockQuantity)) || Number(guitar.stockQuantity) < 0) errors.push("Stock quantity is invalid.");
    if (guitar.shortDescriptionI18n !== undefined && (typeof guitar.shortDescriptionI18n !== "object" || Array.isArray(guitar.shortDescriptionI18n))) {
      errors.push("shortDescriptionI18n must be an object.");
    }
    if (guitar.fullDescriptionI18n !== undefined && (typeof guitar.fullDescriptionI18n !== "object" || Array.isArray(guitar.fullDescriptionI18n))) {
      errors.push("fullDescriptionI18n must be an object.");
    }
    return errors;
  }

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: PrebuiltProvider
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: { children }.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function PrebuiltProvider({ children }) {
    const { currentUser } = useAuth();
    const [guitars, setGuitars] = useState([]);

    // --------------------------------------------------
    // FunÃƒÂ§ÃƒÂ£o: loadGuitars
    // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
    // ParÃƒÂ¢metros: nenhum parÃƒÂ¢metro.
    // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
    // --------------------------------------------------
    async function loadGuitars() {
      const data = await fetchJson(API_BASE, { method: "GET" });
      setGuitars(Array.isArray(data) ? data : []);
    }

    useEffect(() => {
      loadGuitars().catch(() => {});
    }, []);

    useEffect(() => {
      // --------------------------------------------------
      // FunÃƒÂ§ÃƒÂ£o: onUpdated
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: nenhum parÃƒÂ¢metro.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      function onUpdated() {
        loadGuitars().catch(() => {});
      }
      window.addEventListener("guitarcraft_prebuilt_updated", onUpdated);
      return () => window.removeEventListener("guitarcraft_prebuilt_updated", onUpdated);
    }, []);

    const value = useMemo(() => {
      // --------------------------------------------------
      // FunÃƒÂ§ÃƒÂ£o: addGuitar
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: input.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      async function addGuitar(input) {
        if (!currentUser || currentUser.role !== "admin") {
          throw new Error("Admin access required.");
        }

        const next = {
          id: `pb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: String(input.name || "").trim(),
          shortDescription: String(input.shortDescription || input.description || "").trim(),
          fullDescription: String(input.fullDescription || input.description || "").trim(),
          description: String(input.shortDescription || input.description || "").trim(),
          price: Number(input.price),
          specs: input.specs,
          images: Array.isArray(input.images) ? input.images.map((img) => String(img || "").trim()).filter(Boolean) : [],
          image: String(input.image || (Array.isArray(input.images) ? input.images[0] : "") || "").trim(),
          category: String(input.category || "").trim().toLowerCase(),
          seriesName: String(input.seriesName || "").trim(),
          stockStatus: String(input.stockStatus || "in_stock"),
          stockQuantity: Number(input.stockQuantity || 0),
          estimatedRestockDate: input.estimatedRestockDate || "",
          status: String(input.status || "In Stock"),
          shortDescriptionI18n: input.shortDescriptionI18n && typeof input.shortDescriptionI18n === "object" ? input.shortDescriptionI18n : {},
          fullDescriptionI18n: input.fullDescriptionI18n && typeof input.fullDescriptionI18n === "object" ? input.fullDescriptionI18n : {},
          featuredOnHome: Boolean(input.featuredOnHome)
        };
        const errors = validateGuitar(next);
        if (errors.length) throw new Error(errors[0]);

        await fetchJson(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actorUsername: currentUser.username,
            guitar: next
          })
        });

        await loadGuitars();
        window.dispatchEvent(new CustomEvent("guitarcraft_prebuilt_updated"));
      }

      // --------------------------------------------------
      // FunÃƒÂ§ÃƒÂ£o: updateGuitar
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: id, input.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      async function updateGuitar(id, input) {
        if (!currentUser || currentUser.role !== "admin") {
          throw new Error("Admin access required.");
        }

        const next = {
          id,
          name: String(input.name || "").trim(),
          shortDescription: String(input.shortDescription || input.description || "").trim(),
          fullDescription: String(input.fullDescription || input.description || "").trim(),
          description: String(input.shortDescription || input.description || "").trim(),
          price: Number(input.price),
          specs: input.specs,
          images: Array.isArray(input.images) ? input.images.map((img) => String(img || "").trim()).filter(Boolean) : [],
          image: String(input.image || (Array.isArray(input.images) ? input.images[0] : "") || "").trim(),
          category: String(input.category || "").trim().toLowerCase(),
          seriesName: String(input.seriesName || "").trim(),
          stockStatus: String(input.stockStatus || "in_stock"),
          stockQuantity: Number(input.stockQuantity || 0),
          estimatedRestockDate: input.estimatedRestockDate || "",
          status: String(input.status || "In Stock"),
          shortDescriptionI18n: input.shortDescriptionI18n && typeof input.shortDescriptionI18n === "object" ? input.shortDescriptionI18n : {},
          fullDescriptionI18n: input.fullDescriptionI18n && typeof input.fullDescriptionI18n === "object" ? input.fullDescriptionI18n : {},
          featuredOnHome: Boolean(input.featuredOnHome)
        };
        const errors = validateGuitar(next);
        if (errors.length) throw new Error(errors[0]);

        await fetchJson(`${API_BASE}/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actorUsername: currentUser.username,
            guitar: next
          })
        });

        await loadGuitars();
        window.dispatchEvent(new CustomEvent("guitarcraft_prebuilt_updated"));
      }

      // --------------------------------------------------
      // FunÃƒÂ§ÃƒÂ£o: deleteGuitar
      // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
      // ParÃƒÂ¢metros: id.
      // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
      // --------------------------------------------------
      async function deleteGuitar(id) {
        if (!currentUser || currentUser.role !== "admin") {
          throw new Error("Admin access required.");
        }

        await fetchJson(`${API_BASE}/${encodeURIComponent(id)}?actorUsername=${encodeURIComponent(currentUser.username)}`, {
          method: "DELETE"
        });

        await loadGuitars();
        window.dispatchEvent(new CustomEvent("guitarcraft_prebuilt_updated"));
      }

      return {
        guitars,
        loadGuitars,
        addGuitar,
        updateGuitar,
        deleteGuitar
      };
    }, [guitars, currentUser]);

    return React.createElement(PrebuiltContext.Provider, { value }, children);
  }

  // --------------------------------------------------
  // FunÃƒÂ§ÃƒÂ£o: usePrebuilt
  // O que faz: executa uma parte da lÃƒÂ³gica deste mÃƒÂ³dulo.
  // ParÃƒÂ¢metros: nenhum parÃƒÂ¢metro.
  // Retorna: o resultado da operaÃƒÂ§ÃƒÂ£o (ou Promise, quando aplicÃƒÂ¡vel).
  // --------------------------------------------------
  function usePrebuilt() {
    const value = useContext(PrebuiltContext);
    if (!value) throw new Error("usePrebuilt must be used inside PrebuiltProvider");
    return value;
  }

  global.GuitarPrebuilt = {
    PrebuiltProvider,
    usePrebuilt
  };
})(window);
