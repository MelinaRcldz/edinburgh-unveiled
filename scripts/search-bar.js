// ==========================================
// BÚSQUEDA CON AUTOCOMPLETADO
// ==========================================

const PLACES_JSON_URL = "/data/places.json";
const PLACES_PAGE_URL = "/pages/places.html";

let lugaresCacheados = null;

async function obtenerLugares() {
  if (lugaresCacheados) return lugaresCacheados;
  try {
    const res = await fetch(PLACES_JSON_URL);
    if (!res.ok) throw new Error("No se pudo cargar places.json");
    lugaresCacheados = await res.json();
    return lugaresCacheados;
  } catch (e) {
    console.error("Error cargando lugares:", e);
    return [];
  }
}

function crearDropdown(inputEl) {
  const dropdown = document.createElement("ul");
  dropdown.id = "search-dropdown";
  dropdown.setAttribute("role", "listbox");
  dropdown.setAttribute("aria-label", "Sugerencias de búsqueda");

  Object.assign(dropdown.style, {
    position: "absolute",
    top: "100%",
    left: "0",
    right: "0",
    marginTop: "8px",
    backgroundColor: "#18181f",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
    zIndex: "200",
    listStyle: "none",
    padding: "6px",
    maxHeight: "320px",
    overflowY: "auto",
    display: "none",
  });

  const wrapper = inputEl.closest(".site-search");
  if (wrapper) {
    wrapper.style.position = "relative";
    wrapper.appendChild(dropdown);
  }

  return dropdown;
}

function renderDropdown(dropdown, inputEl, lugares, query) {
  dropdown.innerHTML = "";

  if (!lugares.length) {
    const empty = document.createElement("li");
    empty.textContent = "Sin resultados";
    Object.assign(empty.style, {
      padding: "10px 12px",
      color: "rgba(240,237,248,0.35)",
      fontSize: "0.875rem",
      fontFamily: "'DM Sans', sans-serif",
    });
    dropdown.appendChild(empty);
    dropdown.style.display = "block";
    return;
  }

  lugares.forEach((lugar) => {
    const li = document.createElement("li");
    li.setAttribute("role", "option");
    li.setAttribute("tabindex", "0");
    li.setAttribute("data-lugar-id", lugar.id);

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const nombreResaltado = lugar.nombre.replace(
      regex,
      '<mark style="background:rgba(124,58,237,0.35);color:#f0edf8;border-radius:3px;padding:0 2px;">$1</mark>',
    );

    li.innerHTML = `
      <span class="search-result__name">${nombreResaltado}</span>
      <span class="search-result__meta">${lugar.barrio} · ${lugar.categoria}</span>
    `;

    Object.assign(li.style, {
      display: "flex",
      flexDirection: "column",
      gap: "2px",
      padding: "10px 12px",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "background 150ms ease",
      fontFamily: "'DM Sans', sans-serif",
    });

    const nameEl = li.querySelector(".search-result__name");
    Object.assign(nameEl.style, {
      fontSize: "0.9375rem",
      fontWeight: "500",
      color: "#f0edf8",
    });

    const metaEl = li.querySelector(".search-result__meta");
    Object.assign(metaEl.style, {
      fontSize: "0.75rem",
      color: "rgba(240,237,248,0.45)",
    });

    li.addEventListener("mouseenter", () => {
      li.style.background = "rgba(124,58,237,0.12)";
    });
    li.addEventListener("mouseleave", () => {
      li.style.background = "transparent";
    });

    const irALugar = () => {
      const enPlaces = window.location.pathname.includes("places.html");

      if (
        enPlaces &&
        typeof abrirModal === "function" &&
        typeof datosLugares !== "undefined"
      ) {
        dropdown.style.display = "none";
        inputEl.value = "";
        abrirModal(lugar);
      } else {
        sessionStorage.setItem("abrirLugarId", lugar.id);
        window.location.href = PLACES_PAGE_URL;
      }
    };

    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      irALugar();
    });

    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        irALugar();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = li.nextElementSibling;
        if (next) next.focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = li.previousElementSibling;
        if (prev) prev.focus();
        else inputEl.focus();
      }
    });

    dropdown.appendChild(li);
  });

  dropdown.style.display = "block";
}

function iniciarBusqueda() {
  const inputEl = document.getElementById("search-input");
  if (!inputEl) return;

  const dropdown = crearDropdown(inputEl);
  let debounceTimer = null;

  inputEl.addEventListener("input", async () => {
    clearTimeout(debounceTimer);
    const query = inputEl.value.trim();

    if (!query) {
      dropdown.style.display = "none";
      return;
    }

    debounceTimer = setTimeout(async () => {
      const lugares = await obtenerLugares();
      const filtrados = lugares.filter(
        (l) =>
          l.nombre.toLowerCase().includes(query.toLowerCase()) ||
          l.barrio.toLowerCase().includes(query.toLowerCase()) ||
          l.categoria.toLowerCase().includes(query.toLowerCase()),
      );
      renderDropdown(dropdown, inputEl, filtrados, query);
    }, 150);
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const first = dropdown.querySelector("li");
      if (first) first.focus();
    }
    if (e.key === "Escape") {
      dropdown.style.display = "none";
      inputEl.blur();
    }
  });

  document.addEventListener("click", (e) => {
    if (!inputEl.closest(".site-search").contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  inputEl.closest("form")?.addEventListener("submit", (e) => {
    e.preventDefault();
  });
}

// ==========================================
// APERTURA AUTOMÁTICA EN PLACES.HTML
// ==========================================

function intentarAbrirLugarDesdeSession() {
  const idGuardado = sessionStorage.getItem("abrirLugarId");
  if (!idGuardado) return;

  sessionStorage.removeItem("abrirLugarId");
  const id = parseInt(idGuardado, 10);

  // Reintenta hasta que datosLugares y abrirModal estén disponibles
  const intentar = (intentos = 0) => {
    if (
      typeof datosLugares !== "undefined" &&
      datosLugares.length > 0 &&
      typeof abrirModal === "function"
    ) {
      const lugar = datosLugares.find((l) => l.id === id);
      if (lugar) abrirModal(lugar);
    } else if (intentos < 30) {
      setTimeout(() => intentar(intentos + 1), 100);
    }
  };

  intentar();
}

// ==========================================
// INIT
// ==========================================

function registrarEscapeModal() {
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") {
        if (typeof cerrarModal === "function") cerrarModal();
      }
    },
    { once: false },
  );
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarBusqueda();
  intentarAbrirLugarDesdeSession();
  registrarEscapeModal();
});
