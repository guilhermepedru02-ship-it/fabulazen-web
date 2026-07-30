// Helper: Aplica fallback de extensão de imagem (.webp → .jpg → .jpeg → .png)
function applyImageFallback(imgEl) {
    const exts = ['.webp', '.jpg', '.jpeg', '.png'];
    let attempts = 0;
    imgEl.onerror = () => {
        const src = imgEl.src;
        const match = src.match(/\.(webp|jpg|jpeg|png)$/i);
        if (match && attempts < exts.length) {
            const baseName = src.replace(/\.(webp|jpg|jpeg|png)$/i, '');
            // Pula a extensão atual e tenta a próxima
            const tried = '.' + match[1].toLowerCase();
            const next = exts.filter(e => e !== tried)[attempts] || exts[attempts];
            attempts++;
            imgEl.src = baseName + next;
        }
    };
}

export const Shelf = (books, onBookSelect, initialHero = null) => {
    const container = document.createElement('div');
    container.className = 'fade-in';

    // Se não houver hero inicial, usa o em destaque
    const featured = initialHero || books.find(b => b.destaque) || books[0];

    // Criar seção Hero
    const hero = document.createElement('section');
    hero.className = 'hero-section';
    hero.innerHTML = `
        <img class="hero-bg" src="${featured.capaUrl}" alt="${featured.titulo}">
        <div class="hero-gradient"></div>
        <div class="hero-content">
            <h1 class="hero-title">${featured.titulo}</h1>
            <p class="hero-description">${featured.descricao}</p>
            <button class="btn-premium">Continuar Lendo</button>
        </div>
    `;

    const heroImg = hero.querySelector('.hero-bg');
    heroImg.style.objectPosition = featured.focalPoint || 'center 20%';
    applyImageFallback(heroImg);
    const heroTitle = hero.querySelector('.hero-title');
    const heroDesc = hero.querySelector('.hero-description');
    const heroBtn = hero.querySelector('.btn-premium');

    // Tipografia Zen: Inicializa Hero Balanceado
    if (window.LayoutEngine) {
        LayoutEngine.renderBalancedTitle(featured.titulo, heroTitle, "bold 42px 'Cinzel'");
        // Descrição balanceada (opcional, mas traz harmonia)
        const lines = LayoutEngine.calculateLines(featured.descricao, 600, "18px 'Inter'");
        heroDesc.innerText = lines.join(' ');
    }

    // Estado fixo do botão e link para o livro atual do Hero
    let currentHeroBook = featured;
    heroBtn.onclick = () => onBookSelect(currentHeroBook);

    container.appendChild(hero);

    const categoryLabels = {
        "adventure": "Aventura",
        "aventura": "Aventura",
        "sleep": "Hora de Dormir",
        "bedtime": "Hora de Dormir",
        "hora de dormir": "Hora de Dormir",
        "livros animados": "Livros Animados",
        "animated": "Livros Animados",
        "story": "Histórias",
        "fábula": "Fábulas",
        "interativo": "Fabula RPG",
        "fabula rpg": "Fabula RPG",
        "rpg": "Fabula RPG",
        "meu fabula": "Meu Fábula ✨"
    };

    // Helper to get consistent labels
    const getLabel = (cat) => {
        if (!cat) return "Outros";
        const key = cat.trim().toLowerCase();
        return categoryLabels[key] || (cat.trim().charAt(0).toUpperCase() + cat.trim().slice(1));
    };

    // Grouping books by their FINAL DISPLAY LABEL
    const groupedBooks = books.reduce((acc, book) => {
        const label = getLabel(book.categoria);
        if (!acc[label]) acc[label] = [];
        acc[label].push(book);
        return acc;
    }, {});

    // "Meu Fábula" (ebooks personalizados do usuário logado) sempre aparece primeiro na estante
    const MEU_FABULA_LABEL = "Meu Fábula ✨";
    const orderedLabels = Object.keys(groupedBooks).sort((a, b) => {
        if (a === MEU_FABULA_LABEL) return -1;
        if (b === MEU_FABULA_LABEL) return 1;
        return 0;
    });

    orderedLabels.forEach(label => {
        const catBooks = groupedBooks[label];

        const catSection = document.createElement('section');
        catSection.className = 'category-section';
        catSection.innerHTML = `<h2 class="category-title">${label}</h2>`;

        const wrapper = document.createElement('div');
        wrapper.className = 'carousel-wrapper';

        const carousel = document.createElement('div');
        carousel.className = 'carousel-container';

        const btnPrev = document.createElement('button');
        btnPrev.className = 'carousel-nav-btn prev';
        btnPrev.innerHTML = '&#10094;';
        btnPrev.onclick = () => {
            carousel.scrollBy({ left: -400, behavior: 'smooth' });
        };

        const btnNext = document.createElement('button');
        btnNext.className = 'carousel-nav-btn next';
        btnNext.innerHTML = '&#10095;';
        btnNext.onclick = () => {
            carousel.scrollBy({ left: 400, behavior: 'smooth' });
        };

        catBooks.forEach(book => {
            const isReview = book.status === 'review';
            const card = document.createElement('div');
            card.className = 'book-card-v2' + (isReview ? ' review-mode' : '');
            card.innerHTML = `
                <img class="card-img" src="${book.capaUrl}" alt="${book.titulo}">
                <div class="card-overlay">
                    ${isReview ? '<div class="review-badge">⚠️ EM REVISÃO</div>' : ''}
                    <p class="card-title">${book.titulo}</p>
                    <p class="card-desc"></p>
                </div>
            `;

            // Aplicar fallback de extensão nos cards do carrossel
            const cardImg = card.querySelector('.card-img');
            applyImageFallback(cardImg);

            // Tipografia Zen: Título balanceado + Descrição truncada nos cards
            if (window.LayoutEngine && book.descricao) {
                const cardTitle = card.querySelector('.card-title');
                const cardDesc = card.querySelector('.card-desc');
                // Largura típica de um card (~220px). Balance distribui melhor em 2 linhas.
                const cardWidth = 200;
                const balancedTitle = LayoutEngine.balance(book.titulo, cardWidth, "bold 15px 'Inter'");
                cardTitle.innerHTML = balancedTitle.map(l => `<span style="display:block">${l}</span>`).join('');
                // Truncação inteligente: 2 linhas máximas, cortando na palavra certa
                const truncated = LayoutEngine.truncateToFit(book.descricao, cardWidth, 2, "13px 'Inter'");
                cardDesc.innerText = truncated;
            }

            // Hover: Dynamic Hero Update
            card.onmouseenter = () => {
                heroImg.style.opacity = '0.5';
                setTimeout(() => {
                    heroImg.src = book.capaUrl;
                    heroImg.style.objectPosition = book.focalPoint || 'center 20%';
                    applyImageFallback(heroImg);
                    
                    if (window.LayoutEngine) {
                        LayoutEngine.renderBalancedTitle(book.titulo, heroTitle, "bold 42px 'Cinzel'");
                        const lines = LayoutEngine.calculateLines(book.descricao, 600, "18px 'Inter'");
                        heroDesc.innerText = lines.join(' ');
                    } else {
                        heroTitle.innerText = book.titulo;
                        heroDesc.innerText = book.descricao;
                    }
                    
                    currentHeroBook = book;
                    heroImg.style.opacity = '1';
                }, 200);
            };

            card.onclick = () => onBookSelect(book);
            carousel.appendChild(card);
        });

        // Só mostrar botões se houver muitos livros (opcional, mas bom para UX)
        // Por enquanto, sempre mostramos para facilitar a navegação
        wrapper.appendChild(btnPrev);
        wrapper.appendChild(carousel);
        wrapper.appendChild(btnNext);
        catSection.appendChild(wrapper);
        container.appendChild(catSection);
    });

    return container;
};
