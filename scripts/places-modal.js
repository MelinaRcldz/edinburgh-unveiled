function abrirModal(lugar) {
    const modal = document.getElementById('placeModal');
    const contenido = document.getElementById('placeModalContent');
    const imagenLugar = `../assets/images/${lugar.imagen}`;

    contenido.innerHTML = `
        <article class="place-detail">
            <button 
                class="place-detail__close"
                aria-label="Cerrar detalle del lugar"
            >×</button>
        
            <figure class="place-detail__image">
            <button class="place-detail__favorite">
            ${favoritos.includes(lugar.id)
            ? '❤️ En favoritos'
            : '♡ Agregar a favoritos'}
            </button>
                <img
                    src="${imagenLugar}"
                    alt="${lugar.nombre}"
                    class="place-detail__img"
                >
            </figure>

            <div class="place-detail__info">
                <h2>${lugar.nombre}</h2>

                <p>${lugar.informacion}</p>

                <div class="place-detail__meta">
                    <p><strong>Horario:</strong> ${lugar.horarios_nocturnos}</p>
                    <p><strong>Precio:</strong> ${lugar.precio}</p>
                    <p><strong>Ubicación:</strong> ${lugar.ubicacion_exacta}</p>
                </div>

            ${lugar.recomendaciones?.length
            ? `
        <section class="place-detail__recommendations">
            <h3>Recomendaciones</h3>

            <ul>
                ${lugar.recomendaciones
                .map(rec => `<li>${rec}</li>`)
                .join("")}
            </ul>
        </section>
        `
            : ""
        }
            </div>
        </article>
    `;

    modal.classList.add('place-modal--open');
    modal.setAttribute('aria-hidden', 'false');
    document.addEventListener('keydown', cerrarConEscape);
    console.log('modal abierto');

    const btnCerrar = contenido.querySelector('.place-detail__close');
    btnCerrar.addEventListener('click', cerrarModal);

    const btnFavoritoModal = contenido.querySelector('.place-detail__favorite');
    btnFavoritoModal.addEventListener('click', () => {
        manejarFavorito(lugar.id, btnFavoritoModal);
    });

}

function cerrarModal() {
    console.log('modal cerrado');
    const modal = document.getElementById('placeModal');
    modal.classList.remove('place-modal--open');
    modal.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', cerrarConEscape);
}

function cerrarConEscape(e) {
    if (e.key === 'Escape') {
        cerrarModal();
    }
}