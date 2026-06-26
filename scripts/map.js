"use strict";

/* ============================================================
   CONSTANTES DE PROYECCIÓN
   ============================================================ */
const SVG_W = 860,
  SVG_H = 760;
const BOUNDS = {
  minLng: -58.542,
  maxLng: -58.33,
  minLat: -34.715,
  maxLat: -34.525,
};
const NS = "http://www.w3.org/2000/svg";

/* Paleta de colores para comunas (id → color) */
const COMUNA_COLORS = {
  1: "#6c63ff",
  2: "#c084fc",
  3: "#d97706",
  4: "#84cc16",
  5: "#94a3b8",
  6: "#64748b",
  7: "#38bdf8",
  8: "#ef4444",
  9: "#14b8a6",
  10: "#22c55e",
  11: "#3b82f6",
  12: "#f59e0b",
  13: "#a78bfa",
  14: "#e2e8f0",
  15: "#a3e635",
};

/* Paleta de colores/íconos para categorías conocidas */
const CAT_PRESETS = {
  "Teatro / Cultura": { color: "#f59e0b", icon: "🎭" },
  "Tango / Gastronomía": { color: "#ec4899", icon: "💃" },
  "Paseo Urbano": { color: "#06b6d4", icon: "🌉" },
  "Avenida Cultural": { color: "#a78bfa", icon: "🎪" },
  "Ciencia / Cultura": { color: "#34d399", icon: "🔭" },
  "Gastronomía / Cultura": { color: "#fb923c", icon: "🥢" },
  "Gastronomía / Histórica": { color: "#fb923c", icon: "🍽️" },
  "Vida Nocturna": { color: "#f472b6", icon: "🍻" },
  "Centro Cultural": { color: "#818cf8", icon: "🎨" },
  "Turismo Histórico": { color: "#fbbf24", icon: "📸" },
  "Espacio Verde": { color: "#4ade80", icon: "🌿" },
  "Gastronomía Exótica": { color: "#f97316", icon: "🍜" },
  "Gastronomía Clásica": { color: "#fcd34d", icon: "🍕" },
  "Bares / Gastronomía": { color: "#fb7185", icon: "🍺" },
  "Polo Gastronómico / Paseo": { color: "#a3e635", icon: "🛤️" },
  "Gastronomía Moderna / Vida Nocturna": { color: "#e879f9", icon: "🌃" },
  "Entretenimiento / Gastronomía": { color: "#38bdf8", icon: "🎵" },
  "Mirador / Paseo Urbano": { color: "#67e8f9", icon: "🔭" },
};

/* Colores de fallback para categorías no predefinidas */
const FALLBACK_COLORS = [
  "#6c63ff",
  "#e879f9",
  "#22d3ee",
  "#f43f5e",
  "#84cc16",
  "#fb923c",
  "#a78bfa",
  "#34d399",
  "#fbbf24",
  "#60a5fa",
];

/* ============================================================
   ESTADO GLOBAL
   ============================================================ */
const STATE = {
  filtro: "todos",
  selectedId: null,
  searchQuery: "",
  zoom: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragStart: null,
  favoritos: new Set(JSON.parse(localStorage.getItem("lugaresFavoritos") || "[]")),
  _lastFocusedMarker: null,
};

/* Datos derivados de los JSON */
let COMUNAS = {},
  BARRIO_COMUNA_MAP = {},
  CAT = {},
  LUGARES = [],
  GEO_BARRIOS = [];

/* ============================================================
   CARGA Y NORMALIZACIÓN DE DATOS
   ============================================================ */

/**
 * Extrae el id de comuna desde "Nombre Barrio — Comuna N"
 * Devuelve el número o null si no lo encuentra.
 */
function parseComunaId(zonaComuna) {
  const m = zonaComuna && zonaComuna.match(/Comuna\s+(\d+)/i);
  return m ? +m[1] : null;
}

/** Construye COMUNAS y CAT a partir del array de lugares */
function buildDerivedData(lugares) {
  // COMUNAS: agrupa barrios por id de comuna
  const comunaBarrios = {};
  lugares.forEach((l) => {
    const id = parseComunaId(l.zona_comuna);
    if (!id) return;
    if (!comunaBarrios[id]) comunaBarrios[id] = new Set();
    comunaBarrios[id].add(
      l.barrio
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\./g, "")
        .trim(),
    );
  });

  COMUNAS = {};
  for (const [id, barrios] of Object.entries(comunaBarrios)) {
    COMUNAS[id] = {
      nombre: `Comuna ${id}`,
      color: COMUNA_COLORS[+id] || "#6c63ff",
      barrios: [...barrios],
    };
  }

  // Rellenar comunas que no tienen lugares pero sí aparecen en el GeoJSON
  GEO_BARRIOS.forEach((b) => {
    const id = b.comuna;
    if (!COMUNAS[id]) {
      COMUNAS[id] = {
        nombre: `Comuna ${id}`,
        color: COMUNA_COLORS[id] || "#6c63ff",
        barrios: [],
      };
    }
  });

  // Índice barrio → id de comuna
  BARRIO_COMUNA_MAP = {};
  Object.entries(COMUNAS).forEach(([id, c]) =>
    c.barrios.forEach((b) => {
      BARRIO_COMUNA_MAP[b] = +id;
    }),
  );

  // CAT: una entrada por categoría única
  const cats = [...new Set(lugares.map((l) => l.categoria))];
  CAT = {};
  let fallbackIdx = 0;
  cats.forEach((cat) => {
    CAT[cat] = CAT_PRESETS[cat] || {
      color: FALLBACK_COLORS[fallbackIdx++ % FALLBACK_COLORS.length],
      icon: "📍",
    };
  });
}

async function loadData() {
  const [placesRes, geoRes] = await Promise.all([
    fetch("../data/places.json"),
    fetch("../data/GeoCaba.json"),
  ]);

  if (!placesRes.ok) throw new Error(`places.json: ${placesRes.status}`);
  if (!geoRes.ok) throw new Error(`GeoCaba.json: ${geoRes.status}`);

  const rawPlaces = await placesRes.json();
  const geo = await geoRes.json();

  // Normalizar: acepta array directo o wrapper { lugares: [...] }
  const placesArr = Array.isArray(rawPlaces)
    ? rawPlaces
    : rawPlaces.lugares || [];

  LUGARES = placesArr;

  // Convertir FeatureCollection a formato interno
  GEO_BARRIOS = geo.features.map((f) => ({
    nombre: f.properties.nombre,
    comuna: f.properties.comuna,
    coords: f.geometry.coordinates[0],
  }));

  buildDerivedData(LUGARES);
}

/* ============================================================
   HELPERS
   ============================================================ */
function saveFavoritos() {
  localStorage.setItem("lugaresFavoritos", JSON.stringify([...STATE.favoritos]));
}

function catOf(c) {
  return CAT[c] || { color: "#6c63ff", icon: "📍" };
}

/* ============================================================
   PROYECCIÓN
   ============================================================ */
function project(lng, lat) {
  return [
    ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * SVG_W,
    (1 - (lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * SVG_H,
  ];
}

function coordsToPath(coords) {
  return (
    coords
      .map(([lng, lat], i) => {
        const [x, y] = project(lng, lat);
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ") + " Z"
  );
}

function centroid(coords) {
  let sx = 0,
    sy = 0;
  coords.forEach(([lng, lat]) => {
    const [x, y] = project(lng, lat);
    sx += x;
    sy += y;
  });
  return [sx / coords.length, sy / coords.length];
}

/* ============================================================
   UTILIDAD SVG
   ============================================================ */
function svgEl(tag, attrs = {}, text = "") {
  const e = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (text) e.textContent = text;
  return e;
}

/* ============================================================
   CONSTRUCCIÓN DEL MAPA
   ============================================================ */
function buildMap() {
  const canvas = document.getElementById("map-canvas");
  canvas.innerHTML = "";

  const svg = svgEl("svg", {
    id: "mapa-svg",
    viewBox: `0 0 ${SVG_W} ${SVG_H}`,
    xmlns: NS,
    "aria-hidden": "true",
  });

  const defs = svgEl("defs");
  defs.innerHTML = `
    <radialGradient id="bg-grad" cx="45%" cy="55%" r="65%">
      <stop offset="0%" stop-color="#141726"/>
      <stop offset="100%" stop-color="#080a10"/>
    </radialGradient>
    <pattern id="grid-pat" width="40" height="40" patternUnits="userSpaceOnUse" opacity="0.035">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6c63ff" stroke-width="0.5"/>
    </pattern>
    <filter id="f-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="f-marker" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="rgba(0,0,0,.7)"/>
    </filter>`;
  svg.appendChild(defs);

  svg.appendChild(
    svgEl("rect", { width: SVG_W, height: SVG_H, fill: "url(#bg-grad)" }),
  );
  svg.appendChild(
    svgEl("rect", { width: SVG_W, height: SVG_H, fill: "url(#grid-pat)" }),
  );
  svg.appendChild(
    svgEl(
      "text",
      {
        x: SVG_W - 40,
        y: 90,
        "text-anchor": "middle",
        fill: "#7dd3fc",
        "fill-opacity": "0.35",
        "font-size": "11",
        "font-style": "italic",
        "font-family": "Georgia, serif",
        "pointer-events": "none",
        transform: `rotate(-15, ${SVG_W - 40}, 90)`,
      },
      "Río de la Plata",
    ),
  );

  const g = svgEl("g", { id: "mapa-g" });

  const gFills = svgEl("g", { id: "layer-fills" });
  const gBorders = svgEl("g", {
    id: "layer-barrio-borders",
    "pointer-events": "none",
  });
  const gComuna = svgEl("g", {
    id: "layer-comuna-borders",
    "pointer-events": "none",
  });
  const gLabels = svgEl("g", { id: "layer-labels", "pointer-events": "none" });

  GEO_BARRIOS.forEach((barrio) => {
    const comuna = COMUNAS[barrio.comuna];
    const color = comuna ? comuna.color : "#4a5568";
    const d = coordsToPath(barrio.coords);
    const [cx, cy] = centroid(barrio.coords);

    const fill = svgEl("path", {
      d,
      fill: color,
      "fill-opacity": "0.14",
      stroke: "none",
      "data-nombre": barrio.nombre,
      "data-comuna": barrio.comuna,
      class: "barrio-fill",
    });
    fill.addEventListener("mouseenter", (e) =>
      showBarrioTooltip(e, barrio.nombre, barrio.comuna),
    );
    fill.addEventListener("mousemove", moveBarrioTooltip);
    fill.addEventListener("mouseleave", hideBarrioTooltip);
    fill.addEventListener("click", () => {
      const lugaresBarrio = LUGARES.filter(
        (lugar) => lugar.barrio === barrio.nombre
    );

    STATE.selectedId = null;

    document.querySelectorAll(".marker-g").forEach((marker) => {
      const markerId = Number(marker.dataset.id);
      const perteneceAlBarrio = lugaresBarrio.some(
        (lugar) => lugar.id === markerId
      );

    marker.style.opacity = lugaresBarrio.length
    ? perteneceAlBarrio ? "1" : "0.25"
    : "0.35";
  });

  showNeighborhoodPanel(barrio.nombre, lugaresBarrio);
});

    gFills.appendChild(fill);

    gBorders.appendChild(
      svgEl("path", {
        d,
        fill: "none",
        stroke: color,
        "stroke-opacity": "0.35",
        "stroke-width": "0.7",
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
      }),
    );

    gComuna.appendChild(
      svgEl("path", {
        d,
        fill: "none",
        stroke: color,
        "stroke-opacity": "0.8",
        "stroke-width": "1.5",
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
        filter: "url(#f-glow)",
        class: "comuna-border",
      }),
    );

    gLabels.appendChild(
      svgEl(
        "text",
        {
          x: cx,
          y: cy,
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          fill: "#e2e8f0",
          "fill-opacity": "0.45",
          "font-size": "6.5",
          "font-family": "'Segoe UI', system-ui, sans-serif",
          "font-weight": "500",
          "letter-spacing": "0.04em",
        },
        barrio.nombre,
      ),
    );
  });

  g.append(gFills, gBorders, gComuna, gLabels);

  // Marcadores
  const gMarkers = svgEl("g", { id: "layer-markers" });

  getFilteredLugares().forEach((lugar) => {
    const [x, y] = project(
      lugar.coordenadas.longitud,
      lugar.coordenadas.latitud,
    );
    const cfg = catOf(lugar.categoria);
    const isFav = STATE.favoritos.has(lugar.id);

    const gM = svgEl("g", {
      class: "marker-g",
      "data-id": lugar.id,
      role: "button",
      tabindex: "0",
      "aria-label": `${lugar.nombre} — ${lugar.categoria}, ${lugar.barrio}`,
      "aria-pressed": STATE.selectedId === lugar.id ? "true" : "false",
      filter: "url(#f-marker)",
    });

    gM.appendChild(
      svgEl("circle", {
        cx: x,
        cy: y,
        r: 14,
        fill: cfg.color,
        "fill-opacity": "0.12",
        stroke: cfg.color,
        "stroke-width": "1",
        "stroke-opacity": "0.25",
        class: "marker-pulse",
      }),
    );

    const pin = svgEl("circle", {
      cx: x,
      cy: y - 2,
      r: 11,
      fill: cfg.color,
      "fill-opacity": "0.92",
      class: "marker-pin",
    });
    gM.appendChild(pin);
    gM.appendChild(
      svgEl(
        "text",
        {
          x,
          y: y + 1.5,
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          "font-size": "11",
          "pointer-events": "none",
        },
        cfg.icon,
      ),
    );

    if (isFav)
      gM.appendChild(
        svgEl(
          "text",
          { x: x + 9, y: y - 12, "font-size": "9", "pointer-events": "none" },
          "⭐",
        ),
      );

    const gTT = svgEl("g", {
      class: "marker-tooltip",
      opacity: "0",
      "pointer-events": "none",
    });
    const tW = Math.min(lugar.nombre.length * 6.4 + 18, 190);
    gTT.appendChild(
      svgEl("rect", {
        x: x - tW / 2,
        y: y - 38,
        width: tW,
        height: 20,
        rx: 10,
        fill: "rgba(8,10,16,.93)",
        stroke: cfg.color,
        "stroke-width": "1",
      }),
    );
    gTT.appendChild(
      svgEl(
        "text",
        {
          x,
          y: y - 24,
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          fill: "#fff",
          "font-size": "10",
          "font-family": "'Segoe UI', system-ui, sans-serif",
          "font-weight": "600",
        },
        lugar.nombre,
      ),
    );
    gM.appendChild(gTT);

    gM.addEventListener("mouseenter", () => {
      gTT.setAttribute("opacity", "1");
      pin.setAttribute("r", "13");
    });
    gM.addEventListener("mouseleave", () => {
      gTT.setAttribute("opacity", "0");
      pin.setAttribute("r", "11");
    });
    gM.addEventListener("click", (e) => {
      e.stopPropagation();
      handleMarkerActivation(lugar.id, gM);
    });
    gM.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        handleMarkerActivation(lugar.id, gM);
      }
    });

    gMarkers.appendChild(gM);
  });

  g.appendChild(gMarkers);

  const style = document.createElementNS(NS, "style");
  style.textContent = `
    .marker-pulse { animation: pulse 2.6s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{r:12;opacity:.22} 50%{r:20;opacity:.06} }
    .marker-g { transition: opacity .2s; cursor: pointer; }
    .marker-tooltip { transition: opacity .14s; }
    .barrio-fill { transition: fill-opacity .18s; }
    .barrio-fill:hover { fill-opacity:.36!important; cursor:default; }`;
  svg.appendChild(style);

  svg.appendChild(g);
  applyTransform(g);
  setupZoomPan(svg, g);
  canvas.appendChild(svg);
}

/* ============================================================
   FILTROS Y BÚSQUEDA
   ============================================================ */
function getFilteredLugares() {
  return filterPlaces(
    LUGARES,
    STATE.filtro,
    STATE.searchQuery
  );
}

function buildFilters() {
  const nav = document.getElementById("filter-nav");
  nav.innerHTML = "";
  const cats = [...new Set(LUGARES.map((l) => l.categoria))].sort();
  const ul = document.createElement("ul");
  ul.className = "filter-list";

  const makeItem = (label, value, color) => {
    const li = document.createElement("li");
    li.className = "filter-list__item";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-btn" + (value === STATE.filtro ? " active" : "");
    btn.dataset.value = value;
    btn.setAttribute("aria-pressed", value === STATE.filtro ? "true" : "false");

    const dot = document.createElement("span");
    dot.className = "filter-btn__dot";
    dot.style.background = color;
    dot.setAttribute("aria-hidden", "true");

    const count =
      value === "todos"
        ? LUGARES.length
        : LUGARES.filter((l) => l.categoria === value).length;
    const countEl = document.createElement("span");
    countEl.className = "filter-btn__count";
    countEl.textContent = count;
    countEl.setAttribute("aria-label", `${count} lugares`);

    if (value === STATE.filtro) {
      btn.style.cssText = `background:${color}22;border-color:${color}66;color:${color}`;
    }

    btn.append(dot, ` ${label} `, countEl);
    btn.addEventListener("click", () => {
      STATE.filtro = STATE.filtro === value && value !== "todos"
        ? "todos"
        : value;
      ul.querySelectorAll(".filter-btn").forEach((b) => {
        const bCat = b.dataset.value;
        const bCol = bCat === "todos" ? "#6c63ff" : catOf(bCat).color;
        const on = bCat === STATE.filtro;
        b.className = "filter-btn" + (on ? " active" : "");
        b.setAttribute("aria-pressed", on ? "true" : "false");
        b.style.cssText = on
          ? `background:${bCol}22;border-color:${bCol}66;color:${bCol}`
          : "";
      });
      buildMap();
      updateCount();
    });

    li.appendChild(btn);
    return li;
  };

  ul.appendChild(makeItem("Todos los lugares", "todos", "#6c63ff"));
  cats.forEach((cat) => ul.appendChild(makeItem(cat, cat, catOf(cat).color)));
  nav.appendChild(ul);
}

function buildLegend() {
  const legend = document.getElementById("map-legend");
  // Limpiar lista previa si existe
  const old = legend.querySelector(".legend-list");
  if (old) old.remove();

  const ul = document.createElement("ul");
  ul.className = "legend-list";
  // Mostrar solo comunas que tienen barrios en el GeoJSON
  Object.entries(COMUNAS)
    .sort((a, b) => +a[0] - +b[0])
    .forEach(([, c]) => {
      const li = document.createElement("li");
      li.className = "legend-item";
      li.innerHTML = `<span class="legend-item__swatch" style="background:${c.color}" aria-hidden="true"></span><span>${c.nombre}</span>`;
      ul.appendChild(li);
    });
  legend.appendChild(ul);
}

function updateCount() {
  document.getElementById("place-count").textContent =
    getFilteredLugares().length;
}

function setupSearch() {
  // El HTML tiene dos #search-input; tomamos el que está dentro del sidebar
  const input =
    document.querySelector(".sidebar__search-input") ||
    document.getElementById("search-input");
  if (!input) return;
  let timer;
  input.addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      STATE.searchQuery = e.target.value.trim();
      buildMap();
      updateCount();
    }, 200);
  });
}

/* ============================================================
   ZOOM / PAN
   ============================================================ */

/**
 * Limita panX/panY para que el mapa nunca salga del canvas.
 * Con zoom > 1 el mapa es más grande que el viewport SVG,
 * por lo que el pan puede ser negativo (mover a la izquierda/arriba)
 * hasta el máximo que permita ver el borde opuesto.
 * Con zoom ≤ 1 el mapa es igual o más chico: pan = 0 en ambos ejes.
 */
function clampPan() {
  const scaledW = SVG_W * STATE.zoom;
  const scaledH = SVG_H * STATE.zoom;

  // Rango permitido en X: [-(scaledW - SVG_W), 0]
  // Si el mapa es más chico que el canvas, lo centramos en 0.
  const maxPanX = 0;
  const minPanX = Math.min(0, SVG_W - scaledW);
  const maxPanY = 0;
  const minPanY = Math.min(0, SVG_H - scaledH);

  STATE.panX = Math.min(maxPanX, Math.max(minPanX, STATE.panX));
  STATE.panY = Math.min(maxPanY, Math.max(minPanY, STATE.panY));
}

function applyTransform(g) {
  clampPan();
  g.setAttribute(
    "transform",
    `translate(${STATE.panX},${STATE.panY}) scale(${STATE.zoom})`,
  );
}

function setupZoomPan(svg, g) {
  svg.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.13 : 0.885;
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (SVG_W / rect.width);
      const my = (e.clientY - rect.top) * (SVG_H / rect.height);
      const nz = Math.min(Math.max(STATE.zoom * factor, 0.55), 8);
      STATE.panX = mx - (mx - STATE.panX) * (nz / STATE.zoom);
      STATE.panY = my - (my - STATE.panY) * (nz / STATE.zoom);
      STATE.zoom = nz;
      applyTransform(g);
    },
    { passive: false },
  );

  svg.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    STATE.isDragging = true;
    STATE.dragStart = { x: e.clientX - STATE.panX, y: e.clientY - STATE.panY };
    svg.style.cursor = "grabbing";
  });
  window.addEventListener("mousemove", (e) => {
    if (!STATE.isDragging) return;
    STATE.panX = e.clientX - STATE.dragStart.x;
    STATE.panY = e.clientY - STATE.dragStart.y;
    applyTransform(g);
  });
  window.addEventListener("mouseup", () => {
    STATE.isDragging = false;
    svg.style.cursor = "grab";
  });
  svg.style.cursor = "grab";

  let lastTouches = [];
  svg.addEventListener(
    "touchstart",
    (e) => {
      lastTouches = [...e.touches];
    },
    { passive: true },
  );
  svg.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && lastTouches.length >= 1) {
        STATE.panX += e.touches[0].clientX - lastTouches[0].clientX;
        STATE.panY += e.touches[0].clientY - lastTouches[0].clientY;
        applyTransform(g);
      } else if (e.touches.length === 2 && lastTouches.length === 2) {
        const d0 = Math.hypot(
          lastTouches[0].clientX - lastTouches[1].clientX,
          lastTouches[0].clientY - lastTouches[1].clientY,
        );
        const d1 = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        STATE.zoom = Math.min(Math.max(STATE.zoom * (d1 / d0), 0.55), 8);
        applyTransform(g);
      }
      lastTouches = [...e.touches];
    },
    { passive: false },
  );

  svg.addEventListener("dblclick", () => {
    STATE.zoom = 1;
    STATE.panX = 0;
    STATE.panY = 0;
    applyTransform(g);
  });
  svg.addEventListener("keydown", (e) => {
    const step = 30;
    const moves = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (moves[e.key]) {
      STATE.panX += moves[e.key][0];
      STATE.panY += moves[e.key][1];
      applyTransform(g);
    }
    if (e.key === "+" || e.key === "=") {
      STATE.zoom = Math.min(STATE.zoom * 1.2, 8);
      applyTransform(g);
    }
    if (e.key === "-") {
      STATE.zoom = Math.max(STATE.zoom * 0.83, 0.55);
      applyTransform(g);
    }
  });
}

function setupZoomButtons() {
  const getG = () => document.querySelector("#mapa-g");
  document.getElementById("z-in").onclick = () => {
    STATE.zoom = Math.min(STATE.zoom * 1.25, 8);
    applyTransform(getG());
  };
  document.getElementById("z-out").onclick = () => {
    STATE.zoom = Math.max(STATE.zoom * 0.8, 0.55);
    applyTransform(getG());
  };
  document.getElementById("z-rst").onclick = () => {
    STATE.zoom = 1;
    STATE.panX = 0;
    STATE.panY = 0;
    applyTransform(getG());
  };
}

/* ============================================================
   TOOLTIP DE BARRIO
   ============================================================ */
const barrioTooltip = document.getElementById("barrio-tooltip");

function showBarrioTooltip(e, nombre, comunaId) {
  const c = COMUNAS[comunaId];
  if (!c) return;
  barrioTooltip.innerHTML = `<span style="color:${c.color}">${c.nombre}</span> · ${nombre}`;
  moveBarrioTooltip(e);
  barrioTooltip.classList.add("visible");
}
function moveBarrioTooltip(e) {
  const wrap = document.querySelector(".map-wrap").getBoundingClientRect();
  barrioTooltip.style.left = e.clientX - wrap.left + 14 + "px";
  barrioTooltip.style.top = e.clientY - wrap.top - 36 + "px";
}
function hideBarrioTooltip() {
  barrioTooltip.classList.remove("visible");
}


/* ============================================================
   INIT
   ============================================================ */
async function init() {
  const errorEl = document.getElementById("map-error");
  try {
    await loadData();
    buildFilters();
    buildLegend();
    buildMap();
    updateCount();
    setupZoomButtons();
    setupSearch();
  } catch (err) {
    console.error("Error cargando datos:", err);
    if (errorEl) errorEl.classList.remove("hidden");
  } finally {
    document.getElementById("map-loading").classList.add("hidden");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
