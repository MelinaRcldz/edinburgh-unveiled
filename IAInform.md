# IA Inform

## ¿Qué herramientas de IA utilizaron?

Durante el desarrollo del proyecto se utilizaron diversas herramientas de inteligencia artificial, entre ellas Gemini, Claude, Figma Maker, Copilot y ChatGPT. Cada una fue empleada según las necesidades específicas que surgían en las distintas etapas del proyecto, tanto para asistencia técnica como para apoyo visual y estructural.

---

## ¿Para qué las utilizaron?

Las herramientas de inteligencia artificial fueron utilizadas principalmente como apoyo en el desarrollo del código. Se emplearon para asistir en la creación de estructuras HTML, estilos CSS y funcionalidades desarrolladas, además de la resolución de problemas en el código.
Algunas herramientas sirvieron como soporte visual, permitiendo generar propuestas funcionales de diseño y maquetado de páginas. Esto facilitó la visualización previa de determinadas secciones del sitio y ayudó al equipo a organizar de forma más eficiente la estructura visual del proyecto.

---

## ¿Qué partes del proyecto fueron asistidas por IA?

Las partes asistidas por inteligencia artificial fueron principalmente HTML, CSS y JavaScript. En HTML, la IA colaboró en la generación de estructuras base, creación de componentes y organización de secciones. En CSS, se utilizó para la generación de estilos visuales, distribución de elementos, adaptación de diseños y propuestas estéticas. En JavaScript, la asistencia estuvo enfocada en la creación de funciones, lógica de interacción y resolución de problemas relacionados con el comportamiento dinámico de la página.

---

## ¿Qué prompts o consultas les resultaron más útiles?

Los prompts más útiles fueron aquellos donde se especificaba claramente el contexto del problema, la situación del integrante y el objetivo a resolver. Por ejemplo, en una ocasión un integrante necesitaba avanzar con funcionalidades en JavaScript sin contar aún con los estilos CSS finalizados. Gracias a una consulta detallada, la IA pudo brindar soluciones adaptadas a esa situación, permitiendo continuar el desarrollo sin depender de otras partes del proyecto. También resultó especialmente útil el uso de imágenes de referencia para indicar la estética deseada, a partir de las cuales la IA ayudó a replicar estilos, distribuciones y componentes visuales, simplificando considerablemente las tareas de maquetado. Asimismo, para conflictos en JavaScript, brindar información detallada del problema facilitó encontrar soluciones precisas. De igual manera, especificar el origen de los datos —un JSON por ejemplo— y qué debía hacerse con ellos utilizando vocabulario específico resultó de gran utilidad.

---

## ¿Qué respuestas de la IA tuvieron que corregir?

Una de las respuestas que debieron corregirse estuvo relacionada con el manejo de archivos JSON dentro de JavaScript. En varias ocasiones, las soluciones proporcionadas no contemplaban correctamente la estructura de carpetas ni las rutas utilizadas en el proyecto. Para resolverlo, fue necesario brindar especificaciones más detalladas sobre la organización interna de los archivos y adaptar manualmente parte del código generado. Otro caso de corrección surgió cuando el código producido no contemplaba alguna de las especificaciones indicadas, por lo que debió señalarse el error y solicitarse una nueva versión.

---

## ¿Qué problemas tuvieron al trabajar con IA?

Durante el uso de herramientas de inteligencia artificial surgieron diversos problemas y limitaciones. Uno de los principales inconvenientes fue que algunas IA generaban código utilizando frameworks o tecnologías que no podían ser implementadas dentro de los requisitos del proyecto. Debido a esto, en varias ocasiones fue necesario reutilizar únicamente la propuesta visual generada y solicitar nuevamente el código adaptado a tecnologías permitidas.
Otro problema frecuente fue la generación de código poco semántico en HTML. En muchos casos, las estructuras creadas abusaban del uso de etiquetas `<div>` en lugar de emplear correctamente elementos semánticos apropiados. Esto obligó al equipo a reformular manualmente partes del código o solicitar nuevas versiones más organizadas y adecuadas.
También se detectaron situaciones donde el código generado incluía elementos innecesarios, funcionalidades incompletas o estructuras poco optimizadas para el proyecto.

---

## ¿Qué aprendieron durante el proceso?

Uno de los principales aprendizajes fue la importancia de realizar consultas detalladas y específicas. El equipo comprendió que, al proporcionar imágenes de referencia o describir cambios visuales, era necesario indicar con claridad qué elementos debían modificarse y cuáles conservarse, lo que permitió obtener respuestas más precisas y reducir errores. Además, se aprendió que la IA funciona mejor como herramienta de apoyo y aceleración del trabajo, pero requiere supervisión constante y validación humana para garantizar la calidad final.
Otro aprendizaje relevante fue que, en ocasiones, "menos es más": un prompt específico, detallado y bien formulado puede brindar un resultado útil sin ser redundante, haciendo el trabajo más rápido y eficaz. También se destacó la importancia de los commits y sus títulos, donde especificar el cambio realizado ayuda al resto del equipo a comprender el avance. Finalmente, la comunicación ante conflictos o errores resultó clave: que un integrante pueda explicar un problema a otro para buscar una solución en conjunto es fundamental para el trabajo en equipo.

---

## ¿Qué partes del código puede explicar cada integrante?

-

Marilyn Pamela Tufillaro: Una de las partes que puedo explicar es about.css. El archivo HTML al que corresponde (about.html) utiliza diferentes secciones divididas en elementos con clases, que son las que se tienen en cuenta a la hora de aplicar estilos. En about.css se encuentran propiedades como width, font y padding, entre otras, que modifican cada elemento según los valores asignados. Este archivo toma como base global.css, que declara las variables y valores compartidos por todo el sitio, garantizando un estilo visual coherente en todas las páginas. De la misma manera que about.html tiene su propia hoja de estilo, lo mismo ocurre con los demás archivos HTML (places, map), cada uno con su CSS correspondiente.

Axel Figueredo: Unas de las partes que puedo explicar es el map.js. Este código implementa Gráficos Vectoriales Redimensionables interactiva (SVG) y JavaScript. El script utiliza funciones matemáticas de proyección como "coordsToPath" para convertir coordenadas geográficas del GeoCaba.json (latitud/longitud) a coordenadas de píxeles dentro de un contenedor SVG, facilitando la ubicación precisa de cada punto. Construye el mapa mediante capas independientes (rellenos, bordes, etiquetas y marcadores) e implementa controles de zoom y desplazamiento (pan). Procesa automáticamente los datos de entrada para agrupar barrios por comunas y asignar colores únicos a cada categoría de lugar, Incluye funcionalidades para filtrar lugares por categoría. y gestionar una lista de favoritos almacenada localmente en el navegador del usuario.

---

## ¿Qué decisiones tomó el grupo sin depender de la IA?

Una de las decisiones grupales fue no incluir inicio de sesión ni registro, debido a las limitaciones de tiempo y la complejidad que estas funcionalidades requerían. Se optó por enfocarse en los aspectos principales y esenciales del proyecto para completarlo en tiempo y forma. Otra decisión fue dividir las funcionalidades y estructuras en distintas ramas de trabajo, lo que permitió mantener el código organizado y que cada integrante pudiera avanzar sin generar conflictos. Por último, se decidió incluir las imágenes del proyecto directamente en assets/images para lograr una mayor organización del código.

---

## ¿Hubo código sugerido por IA que descartaron? ¿Por qué?

Sí, hubo fragmentos que finalmente fueron descartados. Por ejemplo, se había generado un avatar para determinadas secciones, pero el grupo decidió eliminarlo al considerar que no aportaba valor real a la funcionalidad de la página. También se descartaron elementos y funcionalidades que, aunque correctamente generados, no tenían utilidad concreta dentro del proyecto o no se ajustaban a los objetivos del equipo. En otros casos, el código fue eliminado por cuestiones de organización, semántica o compatibilidad con las tecnologías requeridas.

---
