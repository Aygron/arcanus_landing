/**
 * Build script for Arcanus Online Landing Page
 * 
 * Reads JSON data files and injects pre-rendered HTML into index.html
 * This ensures SEO-friendly static HTML while allowing content management via JSON + admin panel.
 * 
 * Usage: node scripts/build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'index.html');
const DATA_DIR = path.join(ROOT, 'data');

// --- Load JSON data ---
function loadJSON(filename) {
    const filepath = path.join(DATA_DIR, filename);
    const raw = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(raw);
}

// --- HTML generators ---

function buildAboutSection(data) {
    const sectionsHTML = data.sections.map(s => `
                    <h3>${s.heading}</h3>
                    <p>${s.content}</p>`).join('\n');

    return `        <!-- 2. ¿QUÉ ES? - Explica el juego -->
        <section id="about" class="container">
            <header class="section-header">
                <h2>${data.title}</h2>
                <p>${data.subtitle}</p>
            </header>
            <div class="about-content">
                <article class="about-text">${sectionsHTML}
                </article>
            </div>
        </section>`;
}

function buildFAQSection(data) {
    const itemsHTML = data.items.map(item => `
                <div class="faq-item">
                    <button class="faq-question" onclick="toggleFAQ(this)" aria-expanded="false">
                        <span>${item.question}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer">
                        <p>${item.answer}</p>
                    </div>
                </div>`).join('');

    return `        <!-- 5. FAQ - Resolver dudas -->
        <section id="faq" class="container">
            <header class="section-header">
                <h2>${data.title}</h2>
                <p>${data.subtitle}</p>
            </header>
            <div class="faq-container">${itemsHTML}
            </div>
        </section>`;
}

function buildFAQSchema(data) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": data.items.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return `    <!-- Schema.org FAQPage para Rich Snippets -->
    <script type="application/ld+json">
    ${JSON.stringify(schema, null, 6).split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n')}
    </script>`;
}

function buildDescargaSection(data) {
    const downloadsHTML = data.downloads.map(dl => `
                    <a href="${dl.url}"
                        class="btn btn-large download-btn ${dl.class}" target="_blank" rel="noopener noreferrer"
                        aria-label="${dl.ariaLabel}">
                        <i class="${dl.icon}" aria-hidden="true"></i>
                        <span class="download-info">
                            <strong>${dl.label}</strong><br>
                            <small>${dl.detail}</small>
                        </span>
                        <i class="fas fa-download" aria-hidden="true"></i>
                    </a>`).join('\n');

    const virusTotalHTML = data.virusTotal.map(vt => `
                        <a href="${vt.url}"
                            target="_blank" rel="noopener noreferrer" class="security-btn virustotal-btn"
                            aria-label="${vt.ariaLabel}">
                            <i class="fas fa-virus"></i>
                            <span>
                                <strong>${vt.label}</strong><br>
                                <small>${vt.detail}</small>
                            </span>
                            <i class="fas fa-external-link-alt"></i>
                        </a>`).join('\n');

    const reqMinHTML = data.requisitos.minimos.specs.map(s =>
        `                        <li><strong>${s.key}:</strong> ${s.value}</li>`).join('\n');

    const reqRecHTML = data.requisitos.recomendados.specs.map(s =>
        `                        <li><strong>${s.key}:</strong> ${s.value}</li>`).join('\n');

    return `        <!-- 6. DESCARGA + REQUISITOS - CTA principal -->
        <section id="descarga" class="container">
            <header class="section-header">
                <h2>${data.title}</h2>
                <p>${data.subtitle}</p>
            </header>

            <div class="download-section-main">
                <div class="security-notice">
                    <i class="fas fa-shield-alt"></i>
                    <span>${data.securityNotice}</span>
                </div>

                <div class="download-buttons">${downloadsHTML}
                </div>

                <div class="security-buttons">
                    <h3><i class="fas fa-shield-virus"></i> Verificación de Seguridad</h3>
                    <p>Comprueba la seguridad de nuestros archivos en VirusTotal:</p>
                    <div class="security-grid">${virusTotalHTML}
                    </div>
                </div>
            </div>

            <div class="section-divider"></div>

            <header class="section-header">
                <h2>${data.requisitos.title}</h2>
                <p>${data.requisitos.subtitle}</p>
            </header>
            <div class="requirements-grid">
                <article class="req-card">
                    <h3><i class="${data.requisitos.minimos.icon}"></i> ${data.requisitos.minimos.heading}</h3>
                    <ul>
${reqMinHTML}
                    </ul>
                </article>
                <article class="req-card">
                    <h3><i class="${data.requisitos.recomendados.icon}"></i> ${data.requisitos.recomendados.heading}</h3>
                    <ul>
${reqRecHTML}
                    </ul>
                </article>
            </div>
            <div class="req-note">
                <i class="fas fa-info-circle"></i>
                <p>${data.requisitos.note}</p>
            </div>
        </section>`;
}

// --- Replace between markers (idempotent) ---
function replaceSection(html, marker, content, indent) {
    const startTag = `${indent}<!-- BUILD:${marker} -->`;
    const endTag = `${indent}<!-- /BUILD:${marker} -->`;
    
    // Check if already built (has end marker)
    const builtRegex = new RegExp(
        `${escapeRegex(startTag)}[\\s\\S]*?${escapeRegex(endTag)}`,
        'g'
    );
    
    if (builtRegex.test(html)) {
        // Replace existing built content
        return html.replace(builtRegex, `${startTag}\n${content}\n${endTag}`);
    } else {
        // First build - replace simple placeholder
        return html.replace(startTag, `${startTag}\n${content}\n${endTag}`);
    }
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// --- Main build ---
function build() {
    console.log('🔨 Building index.html from data...');

    let html = fs.readFileSync(INDEX_PATH, 'utf-8');

    const about = loadJSON('about.json');
    const faq = loadJSON('faq.json');
    const descarga = loadJSON('descarga.json');

    // Replace/inject sections (idempotent - can run multiple times)
    html = replaceSection(html, 'ABOUT', buildAboutSection(about), '        ');
    html = replaceSection(html, 'FAQ', buildFAQSection(faq), '        ');
    html = replaceSection(html, 'DESCARGA', buildDescargaSection(descarga), '        ');
    html = replaceSection(html, 'FAQ_SCHEMA', buildFAQSchema(faq), '    ');

    fs.writeFileSync(INDEX_PATH, html, 'utf-8');

    console.log('✅ index.html built successfully!');
    console.log(`   - About: ${about.sections.length} sections`);
    console.log(`   - FAQ: ${faq.items.length} items`);
    console.log(`   - Downloads: ${descarga.downloads.length} links`);
}

build();
