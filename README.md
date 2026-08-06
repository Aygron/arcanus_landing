# Arcanus Online — Landing Page

Landing page oficial de **Arcanus Online**, un MMORPG 2D gratuito basado en Argentum Online. El sitio funciona como puerta de entrada para nuevos jugadores: presenta el juego, centraliza noticias, permite descargar el cliente, aloja una wiki de mecánicas y gestiona las contribuciones de la comunidad.

**[Ver el sitio en vivo](https://arcanusonline.com/)**

---

## 📁 Estructura del proyecto

```
arcanus_landing/
├── index.html                   # Página principal (hero, about, noticias, galería, faq, descarga)
├── colaborar.html               # Página de contribuciones/donaciones
├── reglamento.html              # Reglamento del servidor
├── terminos.html                # Términos de servicio
├── privacidad.html              # Política de privacidad
├── politica-contribucion.html   # Política de contribuciones
├── agradecimiento.html          # Página de agradecimiento post-donación
├── wiki.html                    # Wiki del juego (contenido dinámico vía data/wiki.json)
│
├── css/
│   └── style.css                # Estilos globales de todo el sitio
│
├── js/
│   ├── main.js                  # Lógica compartida: noticias, FAQ, lightbox, menú móvil, header dinámico
│   └── wiki.js                  # Lógica específica de la wiki (búsqueda, navegación, render de entradas)
│
├── data/                        # Contenido editable sin tocar HTML/JS
│   ├── about.json               # Sección "¿Qué es?"
│   ├── descarga.json            # Sección de descarga + requisitos + VirusTotal
│   ├── faq.json                 # Preguntas frecuentes (+ Schema.org FAQPage)
│   ├── noticias.json            # Noticias mostradas en index.html
│   └── wiki.json                # Categorías y entradas de la wiki
│
├── img/                         # Imágenes estáticas (capturas, logo, banner)
│
├── scripts/
│   ├── build.js                 # Inyecta el contenido de data/*.json en index.html
│   └── server.js                # Servidor HTTP estático simple para desarrollo local
│
├── admin/                       # Panel de administración local (NO se commitea, ver .gitignore)
│
├── .github/workflows/
│   └── archive.yml              # Cron semanal que archiva el sitio en Wayback Machine
│
├── netlify.toml                 # Headers de seguridad (CSP, X-Frame-Options, etc.)
├── sitemap.xml / robots.txt     # SEO
├── serve.bat                    # Atajo para Windows: build + levantar servidor local
└── package.json
```

## 🧠 Arquitectura de contenido

`index.html` combina contenido **estático** (hero, header, footer, galería) con contenido **generado**:

- En **build time**: `scripts/build.js` lee `data/about.json`, `data/faq.json` y `data/descarga.json`, y escribe el HTML resultante entre marcadores `<!-- BUILD:X --> ... <!-- /BUILD:X -->` dentro de `index.html`. Esto asegura que el contenido sea SEO-friendly (HTML estático, no requiere JS para ser indexado) y a la vez fácil de editar desde JSON.
- En **runtime** (navegador): `js/main.js` vuelve a leer esos mismos JSON (`fetch`) para hidratar/actualizar secciones dinámicas como noticias, y maneja interactividad (lightbox, FAQ accordion, menú móvil, modal de noticias).

`wiki.html` es 100% dinámica: `js/wiki.js` carga `data/wiki.json` en runtime y renderiza categorías, buscador y contenido de cada entrada.

El resto de páginas (`colaborar.html`, `reglamento.html`, `terminos.html`, etc.) son HTML estático con el mismo header/footer replicado en cada archivo (no hay un sistema de includes/templating — cualquier cambio de navegación debe aplicarse manualmente en las 8 páginas).

## 🛠️ Tecnologías utilizadas

- **HTML5** semántico, sin frameworks de frontend.
- **CSS3** puro (Flexbox + Grid), un único archivo `css/style.css`.
- **JavaScript vanilla** (sin dependencias de runtime).
- **Font Awesome** y **Google Fonts** vía CDN.
- **Node.js** solo para tooling de desarrollo (`scripts/build.js`, `scripts/server.js`) — no hay build step obligatorio para producción, el sitio es HTML/CSS/JS estático servido directo.

## 🚀 Desarrollo local

Requiere [Node.js](https://nodejs.org/) instalado (solo para el servidor y el build script; no hay dependencias npm).

```bash
# 1. Generar index.html a partir de los JSON de data/
npm run build

# 2. Levantar un servidor local en http://localhost:3000
npm run start
```

En Windows, `serve.bat` hace ambos pasos y abre el navegador automáticamente.

Alternativa rápida sin Node (Python):

```bash
python -m http.server 3000
```

> **Importante:** después de editar cualquier archivo en `data/about.json`, `data/faq.json` o `data/descarga.json`, hay que volver a correr `npm run build` para que los cambios se reflejen en `index.html`. Los datos de `data/noticias.json` y `data/wiki.json` **no** requieren build, se leen directamente en el navegador.

## 🌐 Deploy

El sitio se despliega en [Netlify](https://netlify.com) de forma estática (no requiere build command en Netlify, ya que `index.html` se commitea ya "compilado"). `netlify.toml` define los headers de seguridad HTTP (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).

Un workflow de GitHub Actions (`.github/workflows/archive.yml`) archiva semanalmente las páginas principales en el [Wayback Machine](https://web.archive.org/).

## ✏️ Cómo editar contenido

| Quiero cambiar...                         | Editar                                    | ¿Requiere build? |
|--------------------------------------------|--------------------------------------------|-------------------|
| Texto de "¿Qué es Arcanus?"                | `data/about.json`                          | Sí (`npm run build`) |
| Preguntas frecuentes (FAQ)                 | `data/faq.json`                            | Sí |
| Links de descarga / requisitos / VirusTotal| `data/descarga.json`                       | Sí |
| Noticias                                   | `data/noticias.json`                       | No |
| Entradas de la Wiki                        | `data/wiki.json`                           | No |
| Navegación del header                      | Cada uno de los 8 archivos `.html` (manual)| No |
| Estilos                                    | `css/style.css`                            | No |

## ⚠️ Deuda técnica conocida

- El header/footer están **duplicados** en las 8 páginas HTML (no hay includes). Cualquier cambio de navegación debe replicarse manualmente en todas.
- El modal de lightbox de `index.html` (`#myLightbox`) está implementado pero **no tiene ningún disparador** que lo abra actualmente — la sección de galería social enlaza directo a redes externas. Si se quiere reactivar, hay que llamar a `window.openLightbox()` desde algún elemento.
- Algunos enlaces de imágenes en `data/noticias.json` apuntan a adjuntos de Discord CDN, que **expiran** con el tiempo (Discord invalida esas URLs). Conviene migrar esas imágenes a `img/` cuando se detecten rotas.

---

Desarrollado con el objetivo de crear una experiencia inmersiva y atractiva para la comunidad de Arcanus Online.
