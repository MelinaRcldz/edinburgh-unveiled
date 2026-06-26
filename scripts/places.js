// ==========================================
// CONFIGURACIÓN GLOBAL Y LOCALSTORAGE
// ==========================================
const URL_JSON = '/data/places.json';
// Obtenemos los favoritos del localStorage o inicializamos un array vacío
function obtenerFavoritosGuardados() {
    try {
        return JSON.parse(localStorage.getItem('lugaresFavoritos')) || [];
    } catch (error) {
        console.warn('Favoritos corruptos en localStorage. Se reinician.', error);
        localStorage.removeItem('lugaresFavoritos');
        return [];
    }
}

let favoritos = obtenerFavoritosGuardados();
let datosLugares = []; // Array donde se guardarán los objetos del JSON
let contenedorPlacesGlobal = null;
// Estado de filtros para Places
const placesState = {
    filtro: 'todos',
    searchQuery: '',
};

const PLACE_FILTER_GROUPS = {
  cultura: [
    "Teatro / Cultura",
    "Avenida Cultural",
    "Ciencia / Cultura",
    "Centro Cultural",
  ],

  gastronomia: [
    "Tango / Gastronomía",
    "Gastronomía / Cultura",
    "Gastronomía / Histórica",
    "Gastronomía Exótica",
    "Gastronomía Clásica",
    "Bares / Gastronomía",
    "Polo Gastronómico / Paseo",
    "Entretenimiento / Gastronomía",
    "Gastronomía Moderna / Vida Nocturna",
  ],

  naturaleza: [
    "Espacio Verde",
  ],

  historicos: [
    "Turismo Histórico",
    "Gastronomía / Histórica",
  ],

  nocturnos: [
    "Vida Nocturna",
    "Gastronomía Moderna / Vida Nocturna",
    "Bares / Gastronomía",
  ],

  paseos: [
    "Paseo Urbano",
    "Mirador / Paseo Urbano",
    "Polo Gastronómico / Paseo",
  ],
};

// Creamos la "mini ventana" (tooltip) y la agregamos al body
// Variable global para el tooltip
let tooltip; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Crear el tooltip
    tooltip = document.createElement('div');
    tooltip.id = 'tooltip-resena';
    Object.assign(tooltip.style, {
        position: 'absolute',
        display: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: '#fff',
        padding: '12px',
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: '1000',
        maxWidth: '250px',
        fontSize: '0.9rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    });
    document.body.appendChild(tooltip);

    // 2. Cargar los contenedores
    const contenedorIndex = document.getElementById('contenedor-cards-index');
    const contenedorPlaces = document.getElementById('contenedor-cards-places');
    // Verificamos que el contenedor exista antes de intentar cargar los datos
    // Esto evita errores en consola si usas este mismo JS en otras páginas (como map.html)
    if (contenedorIndex) {
        cargarDatos(contenedorIndex);
    }

    if (contenedorPlaces) {
    contenedorPlacesGlobal = contenedorPlaces;
    cargarDatos(contenedorPlaces);
    }

    const filterLinks = document.querySelectorAll('.filter-list__link');

filterLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
        const filtroSeleccionado = link.dataset.filter;

        if (placesState.filtro === filtroSeleccionado) {
            placesState.filtro = 'todos';
        } else {
            placesState.filtro = filtroSeleccionado;
        }

        filterLinks.forEach((l) => {
            const isActive = l.dataset.filter === placesState.filtro;

            l.classList.toggle('filter-list__link--active', isActive);
            l.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        if (contenedorPlacesGlobal) {
            renderizarPlacesFiltrados(contenedorPlacesGlobal);
        }
    });
});
});

// ==========================================
// LÓGICA PRINCIPAL
// ==========================================

// 1. Cargar el JSON y convertirlo a Array de objetos
async function cargarDatos(contenedor) {
    try {
        const respuesta = await fetch(URL_JSON);
        if (!respuesta.ok) throw new Error("Error al cargar el JSON");
        
        datosLugares = await respuesta.json();

        if (contenedor.id === 'contenedor-cards-places') {
            renderizarPlacesFiltrados(contenedor);
        } else {
            renderizarCards(datosLugares, contenedor);
        }
    } catch (error) {
        console.error("Hubo un problema con la petición Fetch:", error);
        contenedor.innerHTML = '<p>Error al cargar los lugares. Verifica que places.json exista y sea válido.</p>';
    }
}

function renderizarPlacesFiltrados(contenedor) {
    const lugaresFiltrados = window.filterPlaces(
        datosLugares,
        placesState.filtro,
        placesState.searchQuery,
        PLACE_FILTER_GROUPS
    );

    if (typeof iniciarPaginacionPlaces === 'function') {
        iniciarPaginacionPlaces(lugaresFiltrados, contenedor);
    } else {
        renderizarCards(lugaresFiltrados, contenedor);
    }
}

function cambiarFiltroPlaces(filtro) {
    placesState.filtro = filtro;

    if (contenedorPlacesGlobal) {
        renderizarPlacesFiltrados(contenedorPlacesGlobal);
    }
}

// 2. Renderizar las Cards en el HTML
function renderizarCards(lugares, contenedor) {
    contenedor.innerHTML = ''; // Limpiamos el contenedor

    // Limitamos el array a 3 elementos si estamos en el inicio
    const lugaresAMostrar = 
        contenedor.id === 'contenedor-cards-index' 
        ? lugares.slice(0, 4) 
        : lugares;

    lugaresAMostrar.forEach(lugar => {
        const card = document.createElement('article');
        card.classList.add('card');
        
        const esFavorito = favoritos.includes(lugar.id);

        const esHome = contenedor.id === 'contenedor-cards-index';
        const descripcionCorta = esHome
            ? `${lugar.informacion.substring(0, 100)}...`
            : `${lugar.informacion.substring(0, 200)}...`;

        const imagenLugar = `../assets/images/${lugar.imagen}`;

        // Generamos los items de recomendaciones para la lista (si existen)
        const listaRecomendaciones = lugar.recomendaciones && lugar.recomendaciones.length > 0 
            ? lugar.recomendaciones.map(rec => `<li>${rec}</li>`).join('') 
            : '<li>Sin recomendaciones específicas</li>';

        
        // Inyectamos el HTML. Usamos flex-grow: 1 para empujar el botón hacia abajo.
       card.innerHTML = `
        <div class="card__inner">
        <figure class="card__media">
            <img 
                class="card__img" 
                src="${imagenLugar}" 
                alt="${lugar.nombre}" 
            />
            <mark class="card__badge">${lugar.categoria}</mark>
            <button 
                class="card__bookmark btn-favorito ${esFavorito ? 'card__bookmark--saved' : ''}" 
                type="button"
                data-lugar-id="${lugar.id}"
                aria-label="${esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
                title="${esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}"
            >
                ${esFavorito ? '❤️' : '🤍'}
            </button>
            <span class="card__gradient" aria-hidden="true"></span>
        </figure>

        <section class="card__body">
            <h3 class="card__title">${lugar.nombre}</h3>
            <address class="card__location">
                <span class="card__location-text">
                    📍 ${lugar.barrio} - ${lugar.ubicacion_exacta}
                </span>
            </address>

            <p class="card__description descripcion-corta">
                ${descripcionCorta}
            </p>

            <div class="info-extendida" style="display: none;">
                <p><strong>Historia/Detalles:</strong> ${lugar.informacion}</p>
                <p><strong>Horario Nocturno:</strong> ${lugar.horarios_nocturnos}</p>
                <p><strong>Precio:</strong> ${lugar.precio}</p>
            </div>

            <footer class="card__footer">
                <button class="card__btn" type="button">Ver más +</button>
            </footer>
        </section>
    </div>
`;

        // 3. Lógica del Hover (Mini ventana)
        const canUseTooltip = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

        if (canUseTooltip) {
            card.addEventListener('mousemove', (e) => {
                const idealParaTexto = lugar.ideal_para ? lugar.ideal_para.join(', ') : 'Todos';
                tooltip.innerHTML = `<strong>Ideal para:</strong><br>${idealParaTexto}`;
                tooltip.style.display = 'block';
                tooltip.style.left = `${e.pageX + 15}px`;
                tooltip.style.top = `${e.pageY + 15}px`;
            });

            card.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
    }

        card.addEventListener('click', (e) => {

            if (e.target.classList.contains('btn-favorito')) return;

            if (typeof abrirModal === 'function') {
            abrirModal(lugar);
            } 
        });
        // 4. Lógica del Click (Mostrar info extendida)
        card.addEventListener('click', (e) => {
            // Evitamos que al presionar el botón de favorito se abra la tarjeta
            if (e.target.classList.contains('btn-favorito')) return;

             // Si existe el modal, usamos el modal
            if (typeof abrirModal === 'function') {
                abrirModal(lugar);
                return;
            }

            const infoExtendida = card.querySelector('.info-extendida');
            const descCorta = card.querySelector('.descripcion-corta');
            
            const btnExpandir = card.querySelector('.card__btn');
            if (infoExtendida.style.display === 'none') {
                infoExtendida.style.display = 'block';
                descCorta.style.display = 'none'; // Ocultamos el extracto cuando se expande
                
                btnExpandir.textContent = 'Ver menos -';
            
            } else {
                infoExtendida.style.display = 'none';
                descCorta.style.display = 'block'; // Mostramos el extracto cuando se contrae
                
                btnExpandir.textContent = 'Ver más +';
            }
        });

        // 5. Lógica del Botón Favorito (LocalStorage)
        const btnFavorito = card.querySelector('.btn-favorito');
        btnFavorito.addEventListener('click', (e) => {
            e.stopPropagation(); // Seguridad extra para evitar que el click afecte a la card
            manejarFavorito(lugar.id, btnFavorito);
        });

        contenedor.appendChild(card);
    });
}

// Función para añadir/quitar del LocalStorage
function manejarFavorito(idLugar, botonElemento) {
    const indice = favoritos.indexOf(idLugar);
    if (indice === -1) {
        favoritos.push(idLugar);
    } else {
        favoritos.splice(indice, 1);
    }

    const estaEnFavoritos = favoritos.includes(idLugar);

    if (botonElemento.classList.contains('place-detail__favorite')) {

        botonElemento.textContent = estaEnFavoritos
            ? '❤️ En favoritos'
            : '♡ Agregar a favoritos';

    } else {
        botonElemento.textContent = estaEnFavoritos
            ? '❤️'
            : '🤍';

        botonElemento.classList.toggle(
            'card__bookmark--saved',
            estaEnFavoritos
        );

        botonElemento.setAttribute(
            'aria-label',
            estaEnFavoritos
                ? 'Quitar de favoritos'
                : 'Agregar a favoritos'
        );

        botonElemento.setAttribute(
            'title',
            estaEnFavoritos
                ? 'Quitar de favoritos'
                : 'Agregar a favoritos'
        );
    }

    localStorage.setItem(
        'lugaresFavoritos',
        JSON.stringify(favoritos)
    );

sincronizarBotonesFavorito(idLugar);
}

function sincronizarBotonesFavorito(idLugar) {
    const estaEnFavoritos = favoritos.includes(idLugar);

    const botonesCard = document.querySelectorAll(
        `.btn-favorito[data-lugar-id="${idLugar}"]`
    );

    botonesCard.forEach((boton) => {
        boton.textContent = estaEnFavoritos ? '❤️' : '🤍';

        boton.classList.toggle(
            'card__bookmark--saved',
            estaEnFavoritos
        );

        boton.setAttribute(
            'aria-label',
            estaEnFavoritos
                ? 'Quitar de favoritos'
                : 'Agregar a favoritos'
        );

        boton.setAttribute(
            'title',
            estaEnFavoritos
                ? 'Quitar de favoritos'
                : 'Agregar a favoritos'
        );
    });
}

