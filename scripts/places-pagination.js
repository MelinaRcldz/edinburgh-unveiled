const CARDS_POR_PAGINA = 10;

let paginaActualPlaces = 1;
let lugaresPlaces = [];
let contenedorPlaces = null;

function iniciarPaginacionPlaces(lugares, contenedor) {
    lugaresPlaces = lugares;
    contenedorPlaces = contenedor;
    paginaActualPlaces = 1;

    renderizarPaginaPlaces();
}

function renderizarPaginaPlaces() {
    const inicio = (paginaActualPlaces - 1) * CARDS_POR_PAGINA;
    const fin = inicio + CARDS_POR_PAGINA;
    const lugaresPagina = lugaresPlaces.slice(inicio, fin);

    renderizarCards(lugaresPagina, contenedorPlaces);
    actualizarControlesPaginacion();
}

function actualizarControlesPaginacion() {
    const totalPaginas = Math.ceil(lugaresPlaces.length / CARDS_POR_PAGINA);

    const contador = document.getElementById('placesCount');
    const estados = [
        document.getElementById('pageStatusTop'),
        document.getElementById('pageStatusBottom')
    ];

    const botonesAnterior = [
        document.getElementById('prevPageTop'),
        document.getElementById('prevPageBottom')
    ];

    const botonesSiguiente = [
        document.getElementById('nextPageTop'),
        document.getElementById('nextPageBottom')
    ];

    if (contador) {
        contador.textContent = `${lugaresPlaces.length} lugares encontrados`;
    }

    estados.forEach((estado) => {
        if (estado) {
            estado.textContent = `Página ${paginaActualPlaces} de ${totalPaginas}`;
        }
    });

    botonesAnterior.forEach((boton) => {
        if (boton) {
            boton.disabled = paginaActualPlaces === 1;
            boton.onclick = () => cambiarPaginaPlaces(-1);
        }
    });

    botonesSiguiente.forEach((boton) => {
        if (boton) {
            boton.disabled = paginaActualPlaces === totalPaginas;
            boton.onclick = () => cambiarPaginaPlaces(1);
        }
    });
}

function cambiarPaginaPlaces(direccion) {
    const totalPaginas = Math.ceil(lugaresPlaces.length / CARDS_POR_PAGINA);

    paginaActualPlaces += direccion;

    if (paginaActualPlaces < 1) paginaActualPlaces = 1;
    if (paginaActualPlaces > totalPaginas) paginaActualPlaces = totalPaginas;

    renderizarPaginaPlaces();

    const seccionPlaces = document.querySelector('.places-explorer');
    if (seccionPlaces) {
        seccionPlaces.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}