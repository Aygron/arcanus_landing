(function () {
    'use strict';

    let wikiData = { title: 'Wiki', subtitle: '', categories: [] };
    let currentSlug = '';

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getSortedCategories() {
        const cats = wikiData.categories || [];
        return cats
            .map(cat => ({
                ...cat,
                entries: (cat.entries || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0))
            }))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    function findEntry(slug) {
        const cats = getSortedCategories();
        for (const cat of cats) {
            for (const entry of cat.entries) {
                if (entry.slug === slug) return { entry, category: cat };
            }
        }
        return null;
    }

    function getFirstEntry() {
        const cats = getSortedCategories();
        for (const cat of cats) {
            if (cat.entries.length) return { entry: cat.entries[0], category: cat };
        }
        return null;
    }

    function setHeroText() {
        const titleEl = document.querySelector('.wiki-hero h1');
        const subEl = document.querySelector('.wiki-hero p');
        if (titleEl) titleEl.textContent = wikiData.title || 'Wiki';
        if (subEl) subEl.textContent = wikiData.subtitle || '';
    }

    function renderNav(filterText) {
        const nav = document.getElementById('wiki-categories');
        if (!nav) return;
        const term = (filterText || '').toLowerCase().trim();
        const cats = getSortedCategories();
        let html = '';

        cats.forEach(cat => {
            const visibleEntries = cat.entries.filter(e => {
                if (!term) return true;
                return (
                    (e.title || '').toLowerCase().includes(term) ||
                    ((e.content || '').replace(/<[^>]+>/g, '').toLowerCase().includes(term)) ||
                    (cat.title || '').toLowerCase().includes(term)
                );
            });
            if (!visibleEntries.length && term) return;

            html += `<details class="wiki-nav-group" open>`;
            html += `<summary>${escapeHtml(cat.title || 'Sin categoría')}</summary>`;
            html += `<ul>`;
            visibleEntries.forEach(entry => {
                const activeClass = entry.slug === currentSlug ? ' active' : '';
                html += `<li><a class="wiki-nav-link${activeClass}" href="#${escapeHtml(entry.slug)}" data-slug="${escapeHtml(entry.slug)}">${escapeHtml(entry.title || 'Sin título')}</a></li>`;
            });
            html += `</ul></details>`;
        });

        if (!html) {
            html = '<p class="wiki-no-results">No se encontraron entradas.</p>';
        }
        nav.innerHTML = html;
    }

    function renderContent(entry, category) {
        const article = document.getElementById('wiki-article');
        if (!article) return;
        if (!entry) {
            article.innerHTML = '<p class="wiki-empty">Seleccioná una entrada del menú para ver su contenido.</p>';
            document.title = (wikiData.title || 'Wiki') + ' - Arcanus Online';
            return;
        }

        document.title = (entry.title || 'Entrada') + ' - ' + (wikiData.title || 'Wiki') + ' - Arcanus Online';

        let html = '';
        html += `<div class="wiki-breadcrumb">${escapeHtml(category ? category.title : '')}</div>`;
        html += `<h1 class="wiki-entry-title">${escapeHtml(entry.title || 'Sin título')}</h1>`;
        html += `<div class="wiki-entry-body">${entry.content || ''}</div>`;
        article.innerHTML = html;
    }

    function selectSlug(slug, pushHash = true) {
        const found = slug ? findEntry(slug) : null;
        const result = found || getFirstEntry();
        currentSlug = result ? result.entry.slug : '';
        renderContent(result ? result.entry : null, result ? result.category : null);
        renderNav(document.getElementById('wiki-search') ? document.getElementById('wiki-search').value : '');
        if (pushHash && currentSlug && location.hash.slice(1) !== currentSlug) {
            history.replaceState(null, '', '#' + currentSlug);
        }
    }

    function selectFromHash() {
        const slug = location.hash ? location.hash.slice(1) : '';
        selectSlug(slug, false);
    }

    async function init() {
        try {
            const res = await fetch('data/wiki.json');
            if (!res.ok) throw new Error('No se pudo cargar wiki.json');
            wikiData = await res.json();
        } catch (e) {
            console.error('Error cargando wiki:', e);
            wikiData = { title: 'Wiki no disponible', subtitle: 'No se pudo cargar el contenido de la wiki.', categories: [] };
        }

        setHeroText();
        renderNav();
        selectFromHash();

        const searchInput = document.getElementById('wiki-search');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                renderNav(this.value);
            });
        }

        const categoriesToggle = document.querySelector('.wiki-categories-toggle');
        const categoriesNav = document.getElementById('wiki-categories');
        if (categoriesToggle && categoriesNav) {
            categoriesToggle.addEventListener('click', function () {
                const isOpen = categoriesNav.classList.toggle('wiki-nav-open');
                categoriesToggle.setAttribute('aria-expanded', String(isOpen));
                categoriesToggle.setAttribute('aria-label', isOpen ? 'Ocultar categorías' : 'Mostrar categorías');
            });

            categoriesNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function () {
                    categoriesNav.classList.remove('wiki-nav-open');
                    categoriesToggle.setAttribute('aria-expanded', 'false');
                    categoriesToggle.setAttribute('aria-label', 'Mostrar categorías');
                });
            });
        }

        window.addEventListener('hashchange', selectFromHash);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
