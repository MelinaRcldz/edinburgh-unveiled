function filterPlaces(lugares, filtro, searchQuery, groups = {}) {
  return lugares.filter((lugar) => {
    const categoriasDelGrupo = groups[filtro];

    const matchFiltro =
      filtro === "todos" ||
      lugar.categoria === filtro ||
      categoriasDelGrupo?.includes(lugar.categoria);

    const q = searchQuery.toLowerCase();

    return (
      matchFiltro &&
      (!q ||
        lugar.nombre.toLowerCase().includes(q) ||
        lugar.barrio.toLowerCase().includes(q) ||
        (lugar.zona_comuna || "").toLowerCase().includes(q))
    );
  });
}

// Puente temporal para scripts no modularizados como places.js
window.filterPlaces = filterPlaces;