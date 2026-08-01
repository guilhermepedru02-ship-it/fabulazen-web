/**
 * MemoryGame.js
 * Mini-game de Memória Mágica com opções de 1 Jogador (Zen) e 2 Jogadores (Duelo com Timer).
 */
window.MemoryGame = (function() {
    let container = null;
    let onQuitCallback = null;
    let currentEbook = null;

    let mode = '1p'; // '1p' ou '2p'
    let difficulty = 16; // 16, 24 ou 36 cartas
    
    let cards = [];
    let flippedCards = [];
    let lockBoard = false;
    let matchesFound = 0;
    
    // Multiplayer state
    let turn = 1; // 1 ou 2
    let scores = { 1: 0, 2: 0 };
    let timerInterval = null;
    let timeLeft = 10;
    const TURN_TIME = 10;

    /**
     * Inicia o jogo
     * @param {Object|Array} ebookOrBooks - Um livro específico ou a lista completa de livros
     */
    function iniciar(ebookOrBooks, onQuit) {
        currentEbook = ebookOrBooks;
        onQuitCallback = onQuit;
        
        const appRoot = document.getElementById('app-root');
        appRoot.innerHTML = '';
        
        container = document.createElement('div');
        container.className = 'memory-container';
        appRoot.appendChild(container);

        renderSetup();
    }

    /**
     * Tela de Configuração (Menu de Pergaminho)
     */
    function renderSetup() {
        container.innerHTML = `
            <div class="memory-setup">
                <h2>Memória Mágica</h2>
                <p>Revelar os segredos dos pergaminhos exige foco. Escolha seu caminho:</p>
                
                <div class="setup-group">
                    <label>Modo de Jogo</label>
                    <div class="setup-options" id="mode-options">
                        <button class="setup-btn active" data-mode="1p">1 Jogador (Zen)</button>
                        <button class="setup-btn" data-mode="2p">2 Jogadores (Duelo 10s)</button>
                    </div>
                </div>

                <div class="setup-group">
                    <label>Dificuldade</label>
                    <div class="setup-options" id="diff-options">
                        <button class="setup-btn active" data-diff="16">Fácil (16 cartas)</button>
                        <button class="setup-btn" data-diff="24">Médio (24 cartas)</button>
                        <button class="setup-btn" data-diff="36">Difícil (36 cartas)</button>
                    </div>
                </div>

                <button class="btn-start-game" id="btn-start-memory">Revelar Tabuleiro</button>
                <button class="btn-quit" style="margin-top: 15px; width: 100%;">Voltar</button>
            </div>
            
            <div class="memory-game-area" id="game-area"></div>
        `;

        // Eventos de Setup
        const modeBtns = container.querySelectorAll('#mode-options .setup-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                modeBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                mode = e.target.dataset.mode;
            });
        });

        const diffBtns = container.querySelectorAll('#diff-options .setup-btn');
        diffBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                diffBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                difficulty = parseInt(e.target.dataset.diff, 10);
            });
        });

        container.querySelector('#btn-start-memory').addEventListener('click', startGame);
        container.querySelector('.btn-quit').addEventListener('click', quitGame);
    }

    /**
     * Inicia a partida: pré-valida imagens antes de montar o tabuleiro.
     */
    async function startGame() {
        container.querySelector('.memory-setup').style.display = 'none';
        const gameArea = container.querySelector('#game-area');
        gameArea.style.display = 'flex';

        // Reset States
        matchesFound = 0;
        scores = { 1: 0, 2: 0 };
        turn = 1;
        flippedCards = [];
        lockBoard = false;
        clearInterval(timerInterval);

        // Mostra loading enquanto valida imagens
        gameArea.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:1rem;">
                <div style="font-size:3rem;">🃏</div>
                <p style="color:#ccc;font-size:1.1rem;">Preparando o tabuleiro mágico...</p>
                <div class="memory-loading-bar"><div class="memory-loading-fill"></div></div>
            </div>
        `;

        await buildCards();

        renderHeader(gameArea);
        renderGrid(gameArea);

        if (mode === '2p') {
            startTimer();
        }
    }

    function renderHeader(gameArea) {
        gameArea.innerHTML = `
            <div class="memory-header">
                <button class="btn-quit" id="btn-quit-game">Sair</button>
                
                ${mode === '2p' ? `
                    <div class="player-stats">
                        <div class="player-score active-turn" id="score-p1">J1: 0</div>
                        <div class="player-score" id="score-p2">J2: 0</div>
                    </div>
                    <div class="timer-container" style="display:block;">
                        <div class="timer-bar" id="timer-bar"></div>
                    </div>
                ` : `
                    <div class="player-stats">
                        <div class="player-score active-turn">Pares Encontrados: <span id="score-1p">0</span> / ${difficulty / 2}</div>
                    </div>
                `}
            </div>
            <div class="memory-grid grid-${difficulty}" id="grid-container"></div>
        `;

        gameArea.querySelector('#btn-quit-game').addEventListener('click', quitGame);
    }

    /**
     * Resolve caminhos de imagem para URL absoluta (Cloud Storage)
     */
    function resolveUrl(imagePath, ebook) {
        if (!imagePath) return null;
        if (imagePath.startsWith('data:')) return imagePath;

        const STORAGE_BASE_URL = "https://auhamseeqdpoatwnyxwl.supabase.co/storage/v1/object/public/fabula-assets/";
        
        let finalFileName = imagePath;

        // Detecta URLs de domínios legados ou externos e extrai apenas o nome do arquivo
        const legacyDomains = [
            'fabulazen.s3.amazonaws.com',
            'pedagogico-images',
            'img.freepik.com',
            'fictional.com',
            'storage.googleapis.com'
        ];

        if (imagePath.startsWith('http')) {
            // Se já for Supabase, não processa novamente
            if (imagePath.includes('supabase.co')) return imagePath;

            const isExternalLegacy = legacyDomains.some(domain => imagePath.includes(domain));
            
            if (isExternalLegacy) {
                // Extrai o nome do arquivo da URL e limpa query strings
                finalFileName = imagePath.split('/').pop().split('?')[0];
            } else {
                return imagePath;
            }
        }

        // Normalização de caminhos internos (se já vier com assets/ no JSON)
        if (finalFileName.startsWith('assets/')) {
            return STORAGE_BASE_URL + finalFileName;
        }

        // Se for apenas o nome do arquivo, tenta inferir a pasta física REAL
        if (ebook) {
            let folder = (ebook.id || "").replace('_ebook', '');
            
            // Tenta extrair a pasta real de capaUrl ou arquivoUrl (mais confiável que o ID)
            const referencePath = ebook.capaUrl || ebook.coverImage || ebook.arquivoUrl;
            if (referencePath && referencePath.includes('ebooks/')) {
                const afterEbooks = referencePath.split('ebooks/')[1];
                folder = afterEbooks.split('/')[0];
            }
            
            if (folder) {
                // Injetamos a pasta no dataset para o Smart Retry usar em caso de erro
                return `${STORAGE_BASE_URL}assets/ebooks/${folder}/${finalFileName}`;
            }
        }

        return STORAGE_BASE_URL + finalFileName;
    }

    /**
     * Extrai URLs candidatas de imagens de uma lista de ebooks
     */
    function extractCandidateUrls(pool) {
        let rawUrls = [];
        pool.forEach(ebook => {
            if (!ebook) return;

            if (ebook.capaUrl) rawUrls.push(resolveUrl(ebook.capaUrl, ebook));
            if (ebook.coverImage) rawUrls.push(resolveUrl(ebook.coverImage, ebook));
            
            if (ebook.storyPages) {
                ebook.storyPages.forEach((page, idx) => {
                    if (page.image) {
                        rawUrls.push(resolveUrl(page.image, ebook));
                    }
                });
            }
        });

        // Filtra apenas URLs com extensão de imagem, rejeitando .txt e .mp4
        return [...new Set(rawUrls)].filter(url => {
            if (!url || !url.includes('assets/')) return false;
            return url.match(/\.(jpg|jpeg|png|webp)$/i);
        });
    }

    /**
     * Pré-carrega uma imagem e retorna uma Promise que resolve se OK ou rejeita se 404.
     * Timeout de 8s para não travar o jogo em conexões lentas.
     */
    function preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                img.src = '';
                reject(new Error('timeout'));
            }, 8000);
            img.onload = () => { clearTimeout(timeout); resolve(url); };
            img.onerror = () => { clearTimeout(timeout); reject(new Error('404')); };
            img.src = url;
        });
    }

    /**
     * Valida um lote de URLs retornando apenas as que carregam com sucesso.
     * Processa em paralelo com concorrência controlada.
     */
    async function validateImages(urls) {
        const results = await Promise.allSettled(urls.map(url => preloadImage(url)));
        return results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value);
    }

    // Cache de imagens já validadas para evitar re-validação entre partidas
    let _validatedImageCache = [];

    /**
     * Prepara as cartas: extrai, valida e monta o deck.
     * Usa pré-carregamento para garantir zero fallbacks.
     */
    async function buildCards() {
        const pairsNeeded = difficulty / 2;
        const pool = Array.isArray(currentEbook) ? currentEbook : [currentEbook];
        
        // Usa cache se disponível e suficiente, senão revalida
        let availableImages = _validatedImageCache.length >= pairsNeeded
            ? [..._validatedImageCache]
            : [];

        if (availableImages.length < pairsNeeded) {
            // Extrai candidatas do pool recebido + inventário global
            let candidates = extractCandidateUrls(pool);

            if (candidates.length < pairsNeeded && window.App && window.App.getInventory) {
                const allBooks = window.App.getInventory();
                const globalCandidates = extractCandidateUrls(allBooks);
                for (let img of globalCandidates) {
                    if (!candidates.includes(img)) {
                        candidates.push(img);
                    }
                }
            }

            // Embaralha as candidatas ANTES de validar para evitar viés do primeiro livro
            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
            }

            // Pega apenas uma fatia para não sobrecarregar a rede com centenas de conexões
            let candidatesToValidate = candidates.slice(0, Math.max(pairsNeeded * 3, 40));

            console.log(`[MemoryGame] Validando ${candidatesToValidate.length} imagens candidatas (reduzido para estabilidade)...`);
            let validated = await validateImages(candidatesToValidate);
            
            // Remove possíveis duplicatas no array de validação
            validated = [...new Set(validated)];
            
            // Força a quantidade exata para evitar qualquer repetição na matriz de pares
            if (validated.length > pairsNeeded) {
                validated = validated.slice(0, pairsNeeded);
            }

            console.log(`[MemoryGame] ${validated.length} imagens validadas com sucesso.`);
            availableImages = validated;

            // Atualiza o cache para futuras partidas
            _validatedImageCache = [...availableImages];
        }

        // Fallback de emergência (nunca deveria chegar aqui com 80+ imagens válidas)
        if (availableImages.length === 0) {
            console.error("Nenhuma imagem válida encontrada em toda a biblioteca!");
            availableImages = ["https://auhamseeqdpoatwnyxwl.supabase.co/storage/v1/object/public/fabula-assets/assets/ebooks/fallback.png"];
        }

        // Embaralha as imagens disponíveis (Fisher-Yates)
        for (let i = availableImages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableImages[i], availableImages[j]] = [availableImages[j], availableImages[i]];
        }

        let selectedImages = [];
        // Selecionar imagens únicas do pool validado para formar pares
        for (let i = 0; i < pairsNeeded; i++) {
            selectedImages.push(availableImages[i % availableImages.length]);
        }

        // Criar os pares e embaralhar
        let deck = [];
        selectedImages.forEach((imgUrl, index) => {
            deck.push({ id: `pair-${index}-a`, imgUrl, isMatched: false });
            deck.push({ id: `pair-${index}-b`, imgUrl, isMatched: false });
        });

        // Shuffle Final (Fisher-Yates) para distribuir os pares no tabuleiro
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        cards = deck;
    }

    /**
     * Motor de Resiliência de Imagens — Falha de Rede no Tabuleiro.
     * Como as imagens são pré-validadas, erros aqui são extremamente raros.
     * Não substituímos 'img.src' para não quebrar a lógica de pareamento ('dataset.url').
     */
    function handleImageError(img) {
        // Fallback visual final (praticamente impossível com pré-validação)
        img.parentElement.classList.add('img-error');
        img.onerror = null;
    }

    // Expõe para o escopo global para o onerror do HTML encontrar
    window.handleMemoryCardError = handleImageError;

    function renderGrid(gameArea) {
        const grid = gameArea.querySelector('#grid-container');
        grid.innerHTML = '';

        cards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'memory-card';
            cardEl.dataset.index = index;
            cardEl.dataset.url = card.imgUrl;

            cardEl.innerHTML = `
                <div class="card-face card-back">✧</div>
                <div class="card-face card-front">
                    <img src="${card.imgUrl}" 
                         alt="Carta" 
                         loading="lazy"
                         onerror="window.handleMemoryCardError(this)">
                </div>
            `;

            cardEl.addEventListener('click', () => flipCard(cardEl, index));
            grid.appendChild(cardEl);
        });
    }

    function flipCard(cardEl, index) {
        if (lockBoard) return;
        if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

        cardEl.classList.add('flipped');
        flippedCards.push({ cardEl, index });

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }

    function checkForMatch() {
        lockBoard = true;
        
        const card1 = flippedCards[0];
        const card2 = flippedCards[1];
        const isMatch = card1.cardEl.dataset.url === card2.cardEl.dataset.url;

        if (isMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        flippedCards[0].cardEl.classList.add('matched');
        flippedCards[1].cardEl.classList.add('matched');
        
        cards[flippedCards[0].index].isMatched = true;
        cards[flippedCards[1].index].isMatched = true;

        matchesFound++;
        
        if (mode === '2p') {
            scores[turn]++;
            updateScores();
            // Ao acertar, reseta o tempo e continua o turno
            startTimer();
        } else {
            document.getElementById('score-1p').innerText = matchesFound;
        }

        resetBoardState();
        checkWinCondition();
    }

    function unflipCards() {
        setTimeout(() => {
            flippedCards[0].cardEl.classList.remove('flipped');
            flippedCards[1].cardEl.classList.remove('flipped');
            
            if (mode === '2p') {
                switchTurn();
            }
            
            resetBoardState();
        }, 1000); // 1 segundo para ver as cartas
    }

    function resetBoardState() {
        flippedCards = [];
        lockBoard = false;
    }

    // --- Lógica de 2 Jogadores ---
    function switchTurn() {
        turn = turn === 1 ? 2 : 1;
        updateScores();
        startTimer();
    }

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = TURN_TIME;
        const timerBar = document.getElementById('timer-bar');
        
        if (timerBar) {
            // Remove a transição para pular para 100% imediatamente
            timerBar.style.transition = 'none';
            timerBar.style.transform = 'scaleX(1)';
            
            // Força o reflow
            void timerBar.offsetWidth;
            
            // Reativa a transição
            timerBar.style.transition = 'transform 0.1s linear';
        }

        timerInterval = setInterval(() => {
            timeLeft -= 0.1;
            if (timerBar) {
                const percentage = Math.max(0, timeLeft / TURN_TIME);
                timerBar.style.transform = `scaleX(${percentage})`;
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                
                // Se o tempo acabar enquanto o jogador virou 1 carta, desvira ela
                if (flippedCards.length === 1) {
                    flippedCards[0].cardEl.classList.remove('flipped');
                    resetBoardState();
                }
                
                switchTurn();
            }
        }, 100);
    }

    function updateScores() {
        const p1 = document.getElementById('score-p1');
        const p2 = document.getElementById('score-p2');
        
        if (p1 && p2) {
            p1.innerText = `J1: ${scores[1]}`;
            p2.innerText = `J2: ${scores[2]}`;

            p1.classList.toggle('active-turn', turn === 1);
            p2.classList.toggle('active-turn', turn === 2);
        }
    }

    // --- Fim de Jogo ---
    function checkWinCondition() {
        if (matchesFound === difficulty / 2) {
            clearInterval(timerInterval);
            setTimeout(() => {
                showWinScreen();
            }, 500);
        }
    }

    function showWinScreen() {
        const gameArea = container.querySelector('#game-area');
        let message = '';
        let xpGained = 0;

        if (mode === '1p') {
            xpGained = difficulty * 2; // Ex: 16 -> 32 XP, 24 -> 48 XP
            message = `<h2>Concluído!</h2><p>Você encontrou todos os pares e ganhou +${xpGained} XP!</p>`;
            
            // Integração com Gamification
            if (window.GamificationEngine && typeof window.GamificationEngine.ganharXP === 'function') {
                window.GamificationEngine.ganharXP(xpGained, 'memory_win');
            }
        } else {
            if (scores[1] > scores[2]) {
                message = `<h2>Jogador 1 Venceu!</h2><p>Placar: ${scores[1]} a ${scores[2]}</p>`;
            } else if (scores[2] > scores[1]) {
                message = `<h2>Jogador 2 Venceu!</h2><p>Placar: ${scores[2]} a ${scores[1]}</p>`;
            } else {
                message = `<h2>Empate!</h2><p>Ambos conseguiram ${scores[1]} pares!</p>`;
            }
        }

        const winScreen = document.createElement('div');
        winScreen.className = 'memory-setup'; // Usando a mesma classe para estética de pergaminho
        winScreen.innerHTML = `
            ${message}
            <button class="btn-start-game" id="btn-play-again">Jogar Novamente</button>
            <button class="btn-quit" id="btn-quit-win" style="margin-top: 15px; width: 100%;">Sair</button>
        `;

        gameArea.innerHTML = '';
        gameArea.appendChild(winScreen);

        winScreen.querySelector('#btn-play-again').addEventListener('click', renderSetup);
        winScreen.querySelector('#btn-quit-win').addEventListener('click', quitGame);
    }

    function quitGame() {
        clearInterval(timerInterval);
        if (onQuitCallback) {
            onQuitCallback();
        }
    }

    return {
        iniciar
    };
})();
