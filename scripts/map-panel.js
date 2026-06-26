function handleMarkerActivation(id, markerEl) {
  STATE._lastFocusedMarker = markerEl;
  selectPlace(id);
}

function selectPlace(id) {
  STATE.selectedId = id;
  document.querySelectorAll(".marker-g").forEach((m) => {
    const on = +m.dataset.id === id;
    m.style.opacity = on ? "1" : "0.35";
    m.setAttribute("aria-pressed", on ? "true" : "false");
  });
  showPanel(LUGARES.find((l) => l.id === id));
}

function showPanel(lugar) {
  if (!lugar) return;
document.getElementById("panel-desc").innerHTML = "";
document.querySelector(".panel__meta").style.display = "";
document.querySelector(".panel__footer").style.display = "";

document.querySelectorAll(".panel__section-title").forEach((title) => {
  title.style.display = "";
});

  const cfg = catOf(lugar.categoria);
  const hero = document.getElementById("panel-hero");
  hero.style.background = `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}0a)`;
  hero.style.borderBottom = `1px solid ${cfg.color}33`;

  document.getElementById("panel-icon").textContent = cfg.icon;
  document.getElementById("panel-barrio-label").textContent = lugar.barrio;
  document.getElementById("panel-barrio-label").style.color = cfg.color;
  document.getElementById("panel-cat").textContent = lugar.categoria;
  document.getElementById("panel-cat").style.color = cfg.color;
  document.getElementById("panel-name").textContent = lugar.nombre;
  document.getElementById("panel-addr-text").textContent =
    lugar.ubicacion_exacta;
  document.getElementById("panel-desc").textContent = lugar.informacion;
  document.getElementById("panel-horario").textContent =
    lugar.horarios_nocturnos;
  document.getElementById("panel-precio").textContent = lugar.precio;
  document.getElementById("panel-acc").textContent = lugar.accesibilidad;

  document.getElementById("panel-recs").innerHTML = (
    lugar.recomendaciones || []
  )
    .map((r) => `<li>${r}</li>`)
    .join("");
  document.getElementById("panel-tags").innerHTML = (lugar.ideal_para || [])
    .map(
      (t) =>
        `<li style="background:${cfg.color}18;border-color:${cfg.color}44;color:${cfg.color}">${t}</li>`,
    )
    .join("");

  updateFavBtn(lugar.id);
  document.getElementById("btn-fav").onclick = () => toggleFav(lugar.id);

  document.getElementById("panel-empty").style.display = "none";
  document.getElementById("panel-content").style.display = "flex";

  const panel = document.getElementById("detail-panel");
  panel.classList.add("open");
  panel.removeAttribute("aria-hidden");
  document.getElementById("panel-close").focus();
  panel.addEventListener("keydown", trapFocus);
}

function showNeighborhoodPanel(barrio, lugaresBarrio) {
  const panel = document.getElementById("detail-panel");
  const hero = document.getElementById("panel-hero");

  hero.style.background =
    "linear-gradient(135deg, rgba(124, 58, 237, 0.24), rgba(124, 58, 237, 0.06))";
  hero.style.borderBottom = "1px solid rgba(124, 58, 237, 0.3)";

  document.getElementById("panel-icon").textContent = "📍";
  document.getElementById("panel-barrio-label").textContent = "Barrio";
  document.getElementById("panel-barrio-label").style.color = "var(--color-purple)";

  document.getElementById("panel-cat").textContent =
    `${lugaresBarrio.length} lugar${lugaresBarrio.length === 1 ? "" : "es"} encontrados`;
  document.getElementById("panel-cat").style.color = "var(--color-purple)";

  document.getElementById("panel-name").textContent = barrio;
  document.getElementById("panel-addr-text").textContent =
    "Seleccioná un lugar para ver sus detalles.";

const listadoLugares = lugaresBarrio.length
  ? lugaresBarrio
      .map((lugar) => {
        const cfg = catOf(lugar.categoria);

        return `
          <button class="panel-place-option" type="button" data-id="${lugar.id}">
            <span class="panel-place-option__icon" style="color:${cfg.color}">
              ${cfg.icon}
            </span>
            <span>
              <strong>${lugar.nombre}</strong>
              <small>${lugar.categoria}</small>
            </span>
          </button>
        `;
      })
      .join("")
  : `
      <p class="panel__empty-message">
        🌙 Zona en exploración.<br>
        Pronto agregaremos nuevos secretos en este barrio.
      </p>
    `;

document.getElementById("panel-desc").innerHTML = listadoLugares;

  document.querySelector(".panel__meta").style.display = "none";
  document.getElementById("panel-recs").innerHTML = "";
  document.getElementById("panel-tags").innerHTML = "";

  document.querySelectorAll(".panel__section-title").forEach((title) => {
    title.style.display = "none";
  });

  document.getElementById("panel-empty").style.display = "none";
  document.getElementById("panel-content").style.display = "flex";
  document.querySelector(".panel__footer").style.display = "none";

  document.querySelectorAll(".panel-place-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".panel__meta").style.display = "";
      document.querySelector(".panel__footer").style.display = "";

      document.querySelectorAll(".panel__section-title").forEach((title) => {
        title.style.display = "";
      });

      selectPlace(Number(btn.dataset.id));
    });
  });

  panel.classList.add("open");
  panel.removeAttribute("aria-hidden");
  document.getElementById("panel-close").focus();
  panel.addEventListener("keydown", trapFocus);
}

function updateFavBtn(id) {
  const isFav = STATE.favoritos.has(id);
  const btn = document.getElementById("btn-fav");
  btn.className = "btn-fav" + (isFav ? " is-fav" : "");
  btn.setAttribute("aria-pressed", isFav ? "true" : "false");
  document.getElementById("btn-fav-icon").textContent = isFav ? "❤️" : "🤍";
  document.getElementById("btn-fav-label").textContent = isFav
    ? "En favoritos"
    : "Agregar a favoritos";
}

function toggleFav(id) {
  STATE.favoritos.has(id)
    ? STATE.favoritos.delete(id)
    : STATE.favoritos.add(id);
  saveFavoritos();
  updateFavBtn(id);
  buildMap();
  selectPlace(id);
}

function closePanel() {
  const panel = document.getElementById("detail-panel");
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  panel.removeEventListener("keydown", trapFocus);
  STATE.selectedId = null;
  document.querySelectorAll(".marker-g").forEach((m) => {
    m.style.opacity = "1";
    m.setAttribute("aria-pressed", "false");
  });
  const target = STATE._lastFocusedMarker?.isConnected
    ? STATE._lastFocusedMarker
    : document.getElementById("map-canvas");
  target.focus();
  STATE._lastFocusedMarker = null;
}

function trapFocus(e) {
  const panel = document.getElementById("detail-panel");
  const focusables = Array.from(
    panel.querySelectorAll(
      'button, [href], input, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.disabled && el.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0],
    last = focusables[focusables.length - 1];
  if (e.key === "Escape") {
    closePanel();
    return;
  }
  if (e.key === "Tab") {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

document.getElementById("panel-close").addEventListener("click", closePanel);
