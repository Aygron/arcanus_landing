// Noticias System
let noticiasData = [];

function loadNoticias() {
    fetch('data/noticias.json')
        .then(response => response.json())
        .then(data => {
            noticiasData = data;
            renderNoticias(data);
        })
        .catch(err => {
            console.error('Error cargando noticias:', err);
            document.getElementById('news-grid').innerHTML = '<p style="text-align:center;color:#888;">No se pudieron cargar las noticias.</p>';
        });
}

const NEWS_VISIBLE_LIMIT = 3;

function renderNoticias(noticias) {
    const grid = document.getElementById('news-grid');
    if (!grid) return;
    
    const cards = noticias.map((noticia, index) => {
        const fecha = formatDate(noticia.fecha);
        const hasImage = noticia.imagen && noticia.imagen.trim() !== '';
        const hiddenClass = index >= NEWS_VISIBLE_LIMIT ? ' news-card-hidden' : '';
        
        return `
            <article class="news-card${hiddenClass}" onclick="openNewsModal(${noticia.id})" aria-label="Leer noticia: ${escapeHtml(noticia.titulo)}">
                ${hasImage ? `<div class="news-card-image"><img src="${escapeHtml(noticia.imagen)}" alt="${escapeHtml(noticia.titulo)}" loading="lazy"></div>` : ''}
                <div class="news-card-body">
                    <div class="news-card-top">
                        <span class="news-card-category">${escapeHtml(noticia.categoria)}</span>
                        <span class="news-card-date">${fecha}</span>
                    </div>
                    <h3 class="news-card-title">${escapeHtml(noticia.titulo)}</h3>
                    <p class="news-card-excerpt">${escapeHtml(noticia.resumen)}</p>
                    <div class="news-card-footer">
                        <span class="news-card-author">por ${escapeHtml(noticia.autor)}</span>
                        <span class="news-card-readmore">Leer más →</span>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    let showMoreBtn = '';
    if (noticias.length > NEWS_VISIBLE_LIMIT) {
        const hiddenCount = noticias.length - NEWS_VISIBLE_LIMIT;
        showMoreBtn = `<button class="news-show-more" id="news-show-more" onclick="showAllNoticias()">
            <i class="fas fa-newspaper"></i> Ver noticias anteriores (${hiddenCount} más)
        </button>`;
    }

    grid.innerHTML = cards + showMoreBtn;
}

function showAllNoticias() {
    document.querySelectorAll('.news-card-hidden').forEach(card => {
        card.classList.remove('news-card-hidden');
    });
    const btn = document.getElementById('news-show-more');
    if (btn) btn.remove();
}

function openNewsModal(id) {
    const noticia = noticiasData.find(n => n.id === id);
    if (!noticia) return;
    
    const modal = document.getElementById('news-modal');
    const hasImage = noticia.imagen && noticia.imagen.trim() !== '';
    
    document.getElementById('modal-category').textContent = noticia.categoria;
    document.getElementById('modal-date').textContent = formatDate(noticia.fecha);
    document.getElementById('modal-title').textContent = noticia.titulo;
    document.getElementById('modal-body').innerHTML = noticia.contenido;
    document.getElementById('modal-author').textContent = 'por ' + noticia.autor;
    
    const imageWrap = document.getElementById('modal-image-wrap');
    const image = document.getElementById('modal-image');
    if (hasImage) {
        image.src = noticia.imagen;
        image.alt = noticia.titulo;
        imageWrap.classList.remove('hidden');
    } else {
        imageWrap.classList.add('hidden');
        image.src = '';
    }
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeNewsModal() {
    const modal = document.getElementById('news-modal');
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 24) return 'hace ' + hours + ' horas';
    if (days < 7) return 'hace ' + days + ' días';
    
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('es-AR', options).toUpperCase();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Lightbox Gallery
// Medir altura real del header (fixed) y exponerla como variable CSS
// Esto evita superposiciones del header con el contenido en cualquier
// ancho de pantalla, incluso cuando el menú se envuelve en varias líneas.
function updateHeaderHeightVar() {
    const header = document.querySelector('header');
    if (!header) return;
    const height = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', height + 'px');
}

window.addEventListener('load', updateHeaderHeightVar);
window.addEventListener('resize', updateHeaderHeightVar);
document.addEventListener('DOMContentLoaded', updateHeaderHeightVar);

document.addEventListener("DOMContentLoaded", function() {
    // Cargar contenido dinámico desde JSONs
    loadNoticias();
    loadAboutSection();
    loadFaqSection();
    loadDescargaSection();
    
    // Lightbox functionality
    let slideIndex = 1;
    showSlides(slideIndex);

    window.plusSlides = function(n) {
      showSlides(slideIndex += n);
    }

    window.currentSlide = function(n) {
      showSlides(slideIndex = n);
    }

    function showSlides(n) {
      let i;
      let slides = document.getElementsByClassName("mySlides");
      if (slides.length === 0) return; // No hacer nada si no hay slides
      if (n > slides.length) {slideIndex = 1}
      if (n < 1) {slideIndex = slides.length}
      for (i = 0; i < slides.length; i++) {
          slides[i].style.display = "none";
      }
      slides[slideIndex-1].style.display = "block";
    }

    window.openLightbox = function() {
      document.getElementById('myLightbox').style.display = "block";
      // Enfocar el lightbox para accesibilidad
      document.getElementById('myLightbox').focus();
    }

    window.closeLightbox = function() {
      document.getElementById('myLightbox').style.display = "none";
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu hamburger
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.getElementById('main-menu');
    if (menuToggle && mainMenu) {
        const icon = menuToggle.querySelector('i');

        function updateMenuState(isOpen) {
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
            if (icon) {
                icon.classList.toggle('fa-bars', !isOpen);
                icon.classList.toggle('fa-xmark', isOpen);
            }
        }

        menuToggle.addEventListener('click', function () {
            const isOpen = mainMenu.classList.toggle('nav-open');
            updateMenuState(isOpen);
        });

        mainMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                mainMenu.classList.remove('nav-open');
                updateMenuState(false);
            });
        });

        document.addEventListener('click', function (e) {
            if (!mainMenu.classList.contains('nav-open')) return;
            if (!mainMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                mainMenu.classList.remove('nav-open');
                updateMenuState(false);
            }
        });
    }

    // Mejoras de accesibilidad: soporte para teclado en lightbox y modal noticias
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const newsModal = document.getElementById('news-modal');
            if (newsModal && newsModal.classList.contains('active')) {
                closeNewsModal();
                return;
            }
            const lightbox = document.getElementById('myLightbox');
            if (lightbox && lightbox.style.display === 'block') {
                closeLightbox();
            }
        }
        const lightbox = document.getElementById('myLightbox');
        if (lightbox && lightbox.style.display === 'block') {
            if (e.key === 'ArrowLeft') {
                plusSlides(-1);
            } else if (e.key === 'ArrowRight') {
                plusSlides(1);
            }
        }
    });
    
    // Prevenir scroll con flechas cuando lightbox está abierto
    document.addEventListener('keydown', function(e) {
        const lightbox = document.getElementById('myLightbox');
        if (lightbox && lightbox.style.display === 'block') {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        }
    });
});

// ── Dynamic content loaders (About, FAQ, Descarga) ──
// Pre-rendered HTML stays for SEO; these overwrite with latest JSON at runtime

function loadAboutSection() {
    fetch('data/about.json')
        .then(r => r.json())
        .then(data => {
            const section = document.getElementById('about');
            if (!section) return;
            const header = section.querySelector('.section-header');
            if (header) {
                header.querySelector('h2').textContent = data.title;
                header.querySelector('p').textContent = data.subtitle;
            }
            const article = section.querySelector('.about-text');
            if (article) {
                article.innerHTML = data.sections.map(s =>
                    `<h3>${s.heading}</h3>\n<p>${s.content}</p>`
                ).join('\n\n');
            }
        })
        .catch(err => console.error('Error cargando about:', err));
}

function loadFaqSection() {
    fetch('data/faq.json')
        .then(r => r.json())
        .then(data => {
            const section = document.getElementById('faq');
            if (!section) return;
            const header = section.querySelector('.section-header');
            if (header) {
                header.querySelector('h2').textContent = data.title;
                header.querySelector('p').textContent = data.subtitle;
            }
            const container = section.querySelector('.faq-container');
            if (container) {
                container.innerHTML = data.items.map(item => `
                    <div class="faq-item">
                        <button class="faq-question" onclick="toggleFAQ(this)" aria-expanded="false">
                            <span>${item.question}</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="faq-answer">
                            <p>${item.answer}</p>
                        </div>
                    </div>
                `).join('');
            }
        })
        .catch(err => console.error('Error cargando FAQ:', err));
}

function loadDescargaSection() {
    fetch('data/descarga.json')
        .then(r => r.json())
        .then(data => {
            const section = document.getElementById('descarga');
            if (!section) return;

            // Header
            const headers = section.querySelectorAll('.section-header');
            if (headers[0]) {
                headers[0].querySelector('h2').textContent = data.title;
                headers[0].querySelector('p').textContent = data.subtitle;
            }

            // Security notice
            const notice = section.querySelector('.security-notice span');
            if (notice) notice.textContent = data.securityNotice;

            // Download buttons
            const btnContainer = section.querySelector('.download-buttons');
            if (btnContainer) {
                btnContainer.innerHTML = data.downloads.map(dl => `
                    <a href="${dl.url}" class="btn btn-large download-btn ${dl.class}" target="_blank" rel="noopener noreferrer" aria-label="${dl.ariaLabel}">
                        <i class="${dl.icon}" aria-hidden="true"></i>
                        <span class="download-info">
                            <strong>${dl.label}</strong><br>
                            <small>${dl.detail}</small>
                        </span>
                        <i class="fas fa-download" aria-hidden="true"></i>
                    </a>
                `).join('\n');
            }

            // VirusTotal
            const secGrid = section.querySelector('.security-grid');
            if (secGrid) {
                secGrid.innerHTML = data.virusTotal.map(vt => `
                    <a href="${vt.url}" target="_blank" rel="noopener noreferrer" class="security-btn virustotal-btn" aria-label="${vt.ariaLabel}">
                        <i class="fas fa-virus"></i>
                        <span>
                            <strong>${vt.label}</strong><br>
                            <small>${vt.detail}</small>
                        </span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                `).join('\n');
            }

            // Requirements header
            if (headers[1]) {
                headers[1].querySelector('h2').textContent = data.requisitos.title;
                headers[1].querySelector('p').textContent = data.requisitos.subtitle;
            }

            // Requirements cards
            const reqCards = section.querySelectorAll('.req-card');
            if (reqCards[0]) {
                reqCards[0].querySelector('h3').innerHTML = `<i class="${data.requisitos.minimos.icon}"></i> ${data.requisitos.minimos.heading}`;
                reqCards[0].querySelector('ul').innerHTML = data.requisitos.minimos.specs.map(s =>
                    `<li><strong>${s.key}:</strong> ${s.value}</li>`
                ).join('');
            }
            if (reqCards[1]) {
                reqCards[1].querySelector('h3').innerHTML = `<i class="${data.requisitos.recomendados.icon}"></i> ${data.requisitos.recomendados.heading}`;
                reqCards[1].querySelector('ul').innerHTML = data.requisitos.recomendados.specs.map(s =>
                    `<li><strong>${s.key}:</strong> ${s.value}</li>`
                ).join('');
            }

            // Note
            const reqNote = section.querySelector('.req-note p');
            if (reqNote) reqNote.innerHTML = data.requisitos.note;
        })
        .catch(err => console.error('Error cargando descarga:', err));
}

// Función para toggle FAQ
function toggleFAQ(button) {
    const faqItem = button.parentElement;
    const allItems = document.querySelectorAll('.faq-item');
    
    // Cerrar otros items
    allItems.forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
        }
    });
    
    // Toggle current item
    faqItem.classList.toggle('active');
}
