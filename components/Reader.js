/**
 * Reader.js — Fabula-Zen
 * Leitor de Ebooks com suporte a:
 *   - Narração Premium (AudioService global)
 *   - Caracterização de texto via Gemini (proxy backend)
 *   - Minigame "Encontre o Objeto" (FindObjectGame)
 *   - Narrativa Ramificada RPG (escolhas com salto de página)
 *   - Quiz ao final da leitura
 *
 * Assinatura: Reader(book, onBack, onCharacterizeRequest, onQuizRequest, initialPage, onPageChange)
 * AudioService é um global carregado via <script> no index.html.
 */

export const Reader = (book, onBack, onQuizRequest, initialPage = 0, onPageChange = null) => {
    const container = document.createElement('div');
    container.className = 'reader-v2-container';
    
    // Inicia o BGM globalmente
    if (window.BgmService) BgmService.iniciar(book);

    let totalPages = book.storyPages ? book.storyPages.length : 0;
    let leituraRegistrada = false;
    let currentPageText = "";

    // Bridge: App Shell <-> Iframe State
    let maxPageIndexSeen = -1;
    let lastPageIndex = -1;
    let syncDebounce = null;
    let pageGotoSent = false;

    
    // Header do Reader
    const header = document.createElement('div');
    header.className = 'reader-header-bar';
    
    const headerLeft = document.createElement('div');
    headerLeft.className = 'reader-header-left';

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back-v2-nav';
    backBtn.innerHTML = '<i data-lucide="arrow-left"></i>';
    backBtn.onclick = () => {
        AudioService.parar();
        if (window.BgmService) BgmService.parar();
        container.remove();
        window.removeEventListener('message', messageHandler);
        
        // Força salvar o progresso imediatamente ao sair
        if (onPageChange && lastPageIndex >= 0) {
            if (syncDebounce) clearTimeout(syncDebounce);
            let isLastPage = false;
            if (totalPages > 0) {
                isLastPage = (lastPageIndex === totalPages - 1);
            }
            onPageChange(book.id, lastPageIndex, isLastPage);
        }

        document.dispatchEvent(new CustomEvent('app:readerClosed'));
        if (onBack) onBack();
    };

    const title = document.createElement('h2');
    title.className = 'reader-title-display';
    title.innerText = book.titulo;

    headerLeft.appendChild(backBtn);
    headerLeft.appendChild(title);
    header.appendChild(headerLeft);

    // Botão de Narração Premium (Maya)
    const narrateBtn = document.createElement('button');
    narrateBtn.id = 'btn-narrate-reader';
    narrateBtn.className = 'btn-narrate-v2';
    // Começa desabilitado até termos o texto da página
    narrateBtn.style.opacity = '0.5';
    narrateBtn.style.pointerEvents = 'none';

    // Para ebooks RPG, o botão oficial fica no rodapé (dentro do iframe)
    if (book.categoria === 'Fabula RPG') {
        narrateBtn.style.display = 'none';
    }

    // Helper: atualiza ícone Lucide do botão sem delay
    const setNarrateIcon = (iconName) => {
        narrateBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
        if (window.lucide) window.lucide.createIcons({root: narrateBtn});
    };
    setNarrateIcon('volume-2');

    // Escuta eventos globais do AudioService para sincronizar o botão do Reader
    document.addEventListener('audioService:loading', (e) => {
        if (e.detail.ativo) setNarrateIcon('loader');
    });

    document.addEventListener('audioService:estado', (e) => {
        if (e.detail.tocando) {
            setNarrateIcon('square');
        } else {
            setNarrateIcon('volume-2');
        }
    });

    narrateBtn.onclick = () => {
        if (AudioService.estaRodando()) {
            AudioService.parar();
        } else {
            const idPagina = `${book.id}_p${lastPageIndex}`;
            const textToNarrate = currentPageText;
            
            // Pega o diretório base real do arquivo (ex: assets/ebooks/rpg_guardiao_arvore_ebook)
            const cleanUrl = book.arquivoUrl.split('?')[0];
            const basePath = cleanUrl.substring(0, cleanUrl.lastIndexOf('/'));

            AudioService.narrar(textToNarrate, idPagina, basePath).catch(() => {
                setNarrateIcon('volume-2');
            });
        }
    };

    header.appendChild(narrateBtn);
    if (window.lucide) window.lucide.createIcons({root: header});

    // Iframe do Ebook
    const iframe = document.createElement('iframe');
    iframe.className = 'reader-v2-frame';
    iframe.sandbox = 'allow-scripts allow-same-origin';

    let finalUrl = book.arquivoUrl;
    
    // O Supabase força arquivos .html a baixarem ou a serem text/plain.
    // Para contornar e manter os assets relativos funcionando na nuvem:
    fetch(finalUrl)
        .then(res => res.text())
        .then(html => {
            // Removemos query params para pegar o diretório base limpo
            const cleanUrl = finalUrl.split('?')[0];
            const baseUrl = cleanUrl.substring(0, cleanUrl.lastIndexOf('/') + 1);
            
            let finalHtml = html;
            
            // Script de Lazy Load e Gerenciamento de Memória para Vídeos (MP4/WebM)
            const videoChunkLoaderScript = `
            <script>
            document.addEventListener('DOMContentLoaded', function() {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        const video = entry.target;
                        if (entry.isIntersecting) {
                            if (!video.src && video.dataset.src) {
                                video.src = video.dataset.src;
                            }
                            // Tenta tocar apenas se estiver visível
                            video.play().catch(e => console.warn('Autoplay bloqueado:', e));
                        } else {
                            // Economiza CPU, Bateria e RAM de vídeos fora de tela
                            video.pause();
                        }
                    });
                }, { threshold: 0.1 }); // 10% visível já começa a preparar

                document.querySelectorAll('video').forEach(v => {
                    // Se já tiver src (livros antigos), transformamos em lazy
                    if (v.src && !v.dataset.src) {
                        v.dataset.src = v.src;
                        v.removeAttribute('src');
                        v.preload = 'metadata';
                    }
                    observer.observe(v);
                });
            });
            </script>`;

            const smartMobileFramingStyle = `
            <style id="fz-smart-video-framing">
            @media (max-width: 600px) {
                .image-side {
                    width: 100% !important;
                    height: auto !important;
                    aspect-ratio: 1 / 1 !important;
                    max-height: 42vh !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: #faf9f6 !important;
                }
                .image-side video,
                .image-side img,
                .book-media,
                #pageImage {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: contain !important;
                }
            }
            </style>`;

            // Injeta o <base>, Chunk Loader e Enquadramento Inteligente Mobile no <head> de TODOS os ebooks automaticamente
            const injectedHead = `${videoChunkLoaderScript}\n${smartMobileFramingStyle}`;
            if (!finalHtml.includes('<base ')) {
                finalHtml = finalHtml.replace('<head>', `<head>\n    <base href="${baseUrl}">${injectedHead}`);
            } else {
                finalHtml = finalHtml.replace('<head>', `<head>${injectedHead}`);
            }
            
            // Ao terminar de carregar o srcdoc, o iframe dispara o 'load' event.
            // Usamos isso para garantir que GOTO_PAGE chegue APÓS o script do livro estar pronto.
            iframe.onload = () => {
                if (initialPage > 0 && !pageGotoSent) {
                    pageGotoSent = true;
                    console.log(`🚀 [Reader] iframe.onload → GOTO_PAGE para página ${initialPage}`);
                    // Pequeno delay para garantir que o script interno do livro já registrou o listener
                    setTimeout(() => {
                        iframe.contentWindow.postMessage({ type: 'GOTO_PAGE', pageIndex: initialPage }, "*");
                    }, 150);
                }
            };
            
            iframe.srcdoc = finalHtml;
        })
        .catch(err => {
            console.error("Erro ao fazer fetch do Ebook HTML:", err);
            iframe.src = finalUrl; // Fallback
            // Também cobre o caso de fallback via src
            iframe.onload = () => {
                if (initialPage > 0 && !pageGotoSent) {
                    pageGotoSent = true;
                    setTimeout(() => {
                        iframe.contentWindow.postMessage({ type: 'GOTO_PAGE', pageIndex: initialPage }, "*");
                    }, 150);
                }
            };
        });

    // A state (maxPageIndexSeen, lastPageIndex, etc) foi movido para o topo do Reader

    const messageHandler = async (event) => {
        if (!event.data || !event.data.type) return;
        const { type, pageText, pageIndex, text, index } = event.data;

        if (type === 'PAGE_LOADED') {
            const index = typeof pageIndex === 'number' ? pageIndex : (typeof event.data.index === 'number' ? event.data.index : 0);
            
            // GOTO_PAGE agora é enviado via iframe.onload (acima), não aqui.
            // Não bloqueamos mais o processamento da página ao receber PAGE_LOADED.

            currentPageText = pageText || text || "";
            
            // Suporte RPG: A mecânica de 2 etapas agora precisa da barra de navegação visível para o botão "Decidir"
            const pageData = book.storyPages ? book.storyPages[index] : null;
            if (pageData && pageData.escolhas && pageData.escolhas.length > 0) {
                iframe.contentWindow.postMessage({ type: 'SET_NAV_VISIBLE', visible: true }, "*");
            } else {
                iframe.contentWindow.postMessage({ type: 'SET_NAV_VISIBLE', visible: true }, "*");
            }

            // Se mudou de página, para o áudio anterior
            if (index !== lastPageIndex) {
                AudioService.parar();
                lastPageIndex = index;
            }

            // Habilita o botão agora que temos conteúdo
            narrateBtn.style.opacity = '1';
            narrateBtn.style.pointerEvents = 'auto';
            narrateBtn.title = 'Ouvir narração da Maya';

            // ID único para cache: id-do-livro_p-numero-da-pagina
            const idPagina = `${book.id}_p${index}`;

            // PERFORMANCE: Pré-carregar o áudio estático, se existir
            const cleanUrl = book.arquivoUrl.split('?')[0];
            const basePath = cleanUrl.substring(0, cleanUrl.lastIndexOf('/'));
            AudioService.precarregar(currentPageText, idPagina, basePath);

            // Atualizar max page index visto
            maxPageIndexSeen = Math.max(maxPageIndexSeen, index);

            // Adiciona botão "Encontre o Objeto" se a página tiver isso configurado
            const existingBtn = container.querySelector('#btn-find-object');
            if (existingBtn) existingBtn.remove();
            
            if (pageData && pageData.findObjects && pageData.findObjects.length > 0) {
                const findObjBtn = document.createElement('button');
                findObjBtn.id = 'btn-find-object';
                findObjBtn.className = 'fz-btn-find-object zoom-in';
                findObjBtn.innerHTML = '<i data-lucide="search" style="width: 16px; height: 16px;"></i> Encontrar Objeto';
                
                findObjBtn.addEventListener('click', () => {
                    const findGameEvent = new CustomEvent('app:startFindObject', { detail: { book, pageData, pageIndex: index } });
                    document.dispatchEvent(findGameEvent);
                });
                container.appendChild(findObjBtn);
                if (window.lucide) window.lucide.createIcons({root: findObjBtn});
            }

            // --- LÓGICA RPG (ESCOLHAS INTEGRADAS) ---
            if (pageData && pageData.escolhas && pageData.escolhas.length > 0) {
                // A navegação agora é controlada internamente pelo livro (mecânica de 2 etapas)
                iframe.contentWindow.postMessage({ type: 'SET_NAV_VISIBLE', visible: true }, "*");
            }

            // Gamificação: detectar última página
            if (typeof index === 'number') {
                let isLastPage = false;
                if (totalPages > 0) {
                    isLastPage = (index === totalPages - 1);
                } else {
                    isLastPage = (index >= 5 && index === maxPageIndexSeen);
                }

                // Dispara sincronização de leitura para o Supabase
                if (onPageChange) {
                    if (syncDebounce) clearTimeout(syncDebounce);
                    syncDebounce = setTimeout(() => {
                        onPageChange(book.id, index, isLastPage);
                    }, 2000); // 2 segs na página para não salvar cliques acidentais
                }

                if (isLastPage) {
                    if (!leituraRegistrada) {
                        leituraRegistrada = true;
                        if (window.GamificationEngine) {
                            const tags = book.tags || [];
                            GamificationEngine.registrarLeitura(book.id, tags);
                        }
                    }

                    const isRpg = book.tipo === 'RPG' || book.categoria === 'Fabula RPG';
                    if (onQuizRequest && !container.querySelector('#btn-play-quiz') && totalPages > 0 && !isRpg) {
                        const quizBtnContainer = document.createElement('div');
                        quizBtnContainer.className = 'fz-quiz-btn-container zoom-in';
                        quizBtnContainer.innerHTML = `
                            <button class="fz-btn-start-quiz" id="btn-play-quiz">
                                <span class="quiz-icon">🎮</span> Jogar Quiz
                            </button>
                        `;
                        container.appendChild(quizBtnContainer);
                        quizBtnContainer.querySelector('#btn-play-quiz').addEventListener('click', onQuizRequest);
                    }
                } else {
                    const quizBtnContainer = container.querySelector('.fz-quiz-btn-container');
                    if (quizBtnContainer) quizBtnContainer.remove();
                }
            }
        }

        if (type === 'TOGGLE_NARRATION') {
            narrateBtn.click();
        }

        if (type === 'CLOSE_READER') {
            AudioService.parar();
            if (window.BgmService) BgmService.parar();
            container.remove();
            window.removeEventListener('message', messageHandler);
            document.dispatchEvent(new CustomEvent('app:readerClosed'));
            if (onBack) onBack();
        }
    };

    window.addEventListener('message', messageHandler);

    container.appendChild(header);
    container.appendChild(iframe);

    return container;
};
