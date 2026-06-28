ROADMAP — Edinburgh Unveiled

☑ Crear repo propio
☑ Limpiar base técnica heredada
☑ Corregir observaciones técnicas del proyecto académico
☑ Definir identidad general del proyecto

---

fix/base-cleanup

* Correcciones técnicas de la base heredada.
* Modal con recomendaciones visibles.
* Limpieza de localStorage.
* Try/catch para favoritos.
* Variables CSS del mapa alineadas con global.css.

---

refactor/project-identity
Objetivo:
Cambiar la identidad del proyecto sin rediseñar componentes ni modificar todavía el contenido real.

Incluye:

* Nombre del proyecto.
* README.
* Textos generales heredados.
* Navegación.
* Eliminación o pausa de "Sobre nosotros".
* Branding inicial.
* Logo básico.
* Paleta global.
* Tokens de color en :root.
* Alias temporales para no romper CSS existente.
* Sin cambiar imágenes.
* Sin cambiar JSON.
* Sin rediseñar hero completo.
* Sin modificar mapa de Edimburgo todavía.

Commits posibles:

* refactor: update project identity and navigation
* style: update visual color palette

---

feat/design-system
Objetivo:
Definir el lenguaje visual de los componentes sin cambiar la estructura general del sitio.

Incluye:

* Tipografías.
* Navbar.
* Jerarquía de títulos.
* Párrafos.
* Botones.
* Cards.
* Bordes.
* Sombras.
* Contrastes.
* Estados hover/focus.
* Ajustes finos del logo.
* Espaciados visuales.
* Consistencia entre Home, Explorar y Mapa.

No incluye:

* Cambiar imágenes.
* Rediseñar completamente el hero.
* Cambiar contenido de lugares.
* Cambiar mapa o coordenadas.

---

feat/hero-redesign
Objetivo:
Rediseñar la portada para que empiece a sentirse realmente como Edinburgh Unveiled.

Incluye:

* Imagen nueva del hero.
* Sacar Caminito.
* Adaptar composición visual del hero.
* Revisar si se mantiene o elimina la tarjeta flotante.
* Nuevos overlays.
* Ajuste de CTAs.
* Responsive específico del hero.
* Ambientación visual más cercana a Edimburgo.

---

feat/edinburgh-content
Objetivo:
Migrar el contenido del proyecto hacia Edimburgo.

Incluye:

* Reescribir places.json.
* Nuevos lugares.
* Nuevas categorías.
* Historias narrativas.
* Recomendaciones.
* Curiosidades.
* Best time to visit.
* How to find it.
* Imágenes reales o temporales de lugares.
* Cambiar textos visibles que todavía dependan de Buenos Aires/CABA.

---

feat/edinburgh-map
Objetivo:
Adaptar el mapa interactivo a Edimburgo.

Incluye:

* Reemplazar GeoCaba.
* Nueva lógica geográfica si hace falta.
* Coordenadas reales.
* Marcadores de Edimburgo.
* Panel del mapa adaptado a las nuevas categorías.
* Revisión de filtros del mapa.

---

feat/journey-system
Objetivo:
Transformar favoritos en una experiencia de recorrido personal.

Incluye:

* "Favoritos" → "Mi recorrido" / "My Journey".
* Guardar lugares.
* Marcar lugares como visitados.
* Progreso del recorrido.
* Posible estado: quiero visitar / visitado.
* Estadísticas simples.
* Login solo si más adelante tiene sentido.

---

feat/gallery-carousel
Objetivo:
Mejorar la presentación visual de cada lugar.

Incluye:

* Múltiples imágenes por lugar.
* Carrusel en modal o detalle.
* Miniaturas.
* Transiciones.
* Fallback si un lugar tiene una sola imagen.

---

Ideas futuras

* Ambientación sonora.
* Modo lectura para historias.
* Recorridos temáticos.
* Multi-ciudad.
* Versión más narrativa tipo archivo de lugares.
