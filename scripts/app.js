import { Shelf } from '../components/Shelf.js';
import { Reader } from '../components/Reader.js';
import { QuizMiniGame } from '../components/QuizMiniGame.js';
import { GlobalMenu } from '../components/GlobalMenu.js';
import { GamesHub } from '../components/GamesHub.js';
import { FindObjectGame } from '../components/FindObjectGame.js';
import { AuthUI } from '../components/AuthUI.js';
import { CustomOrderPage } from '../components/CustomOrderPage.js';
import { PaymentPage } from '../components/PaymentPage.js';
import { supabase } from './supabase.js';

console.log('🚀 [Fabula-Zen] App v3.1 Core Loaded - CLOUD SYNC FIX');

// O BRIDGE_URL (backend local) foi removido em favor da arquitetura 100% cloud.

// --- App Orchestrator ---
class App {
    constructor() {
        this.root = document.getElementById('app-root');
        this.books = [];
        this.currentView = 'SHELF';
        this.selectedBook = null;
        this.lastOpenedBook = null;
        this.isTransitioning = false;
        this.isGlobalMenuOpen = false;
        this.currentProfileId = null; // UUID da tabela profiles (diferente de auth uid)

        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        // Feedback visual imediato (Estilos inline simples para garantir visibilidade)
        this.root.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#0a0a0a; color:#d4af37; font-family:serif;">
                <div style="width:40px; height:40px; border:3px solid #333; border-top-color:#d4af37; border-radius:50%; animation: fz-spin 1s linear infinite;"></div>
                <p style="margin-top:20px; letter-spacing:2px;">ABRINDO O MUNDO MÁGICO...</p>
                <style>@keyframes fz-spin { to { transform: rotate(360deg); } }</style>
            </div>
        `;

        try {
            console.log('🏁 [App] Iniciando orquestrador...');
            
            // 1. Verificação manual imediata para evitar dependência exclusiva do evento
            const { data: { session: initialSession } } = await supabase.auth.getSession();
            console.log('🔍 [App] Sessão inicial:', initialSession ? 'Logado' : 'Anônimo');

            // Função interna para lidar com a sessão de forma centralizada
            const handleAuth = async (event, session) => {
                console.log(`🔐 [Auth Handler] Evento: ${event}`, session ? 'Usuário Logado' : 'Sem Sessão');
                try {
                    if (session) {
                        this.currentUserId = session.user.id;
                        await this.ensureProfileExists(session.user);
                        await this.initializeEngines(session);
                        this.books = await this.loadInventory();
                        this.setupGlobalMenu();

                        // Parse Stripe URL parameters on startup
                        const urlParams = new URLSearchParams(window.location.search);
                        const payment = urlParams.get('payment');
                        const type = urlParams.get('type');
                        if (payment === 'success') {
                            this.showSuccessOverlay(type);
                            window.history.replaceState({}, document.title, window.location.pathname);
                        }

                        this.navigate('SHELF');
                    } else {
                        this.currentUserId = null;
                        this.books = await this.loadInventory();
                        this.navigate('AUTH');
                    }
                } catch (err) {
                    console.error('❌ [Critical Auth Error]:', err);
                    this.navigate('AUTH'); // Fallback final
                }
            };

            // 2. Escuta mudanças futuras
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_OUT') {
                    if (this.currentUserId) {
                        console.log('🔄 [Auth] Usuário deslogou. Recarregando página...');
                        location.reload();
                    } else {
                        console.log('ℹ️ [Auth] Usuário deslogado. Redirecionando para AUTH.');
                        handleAuth(event, session);
                    }
                    return;
                }
                // Evita processar o INITIAL_SESSION se já processamos a sessão manual (ou vice-versa)
                if (event === 'INITIAL_SESSION' && initialSession) return;
                handleAuth(event, session);
            });

            // 3. Processa o estado inicial IMEDIATAMENTE
            await handleAuth('INITIAL_CHECK', initialSession);

            // Verificação do Bridge removida (isolamento 100% cloud)
        } catch (error) {
            console.error('Erro ao inicializar:', error);
            this.root.innerHTML = `<div class="container"><p>Erro ao carregar o mundo mágico.</p></div>`;
        }
    }

    async initializeEngines(session) {
        const userId = session?.user?.id;
        console.log(`⚙️ [App] Inicializando motores para user: ${userId || 'ANON'}`);
        
        if (window.GamificationEngine) {
            await GamificationEngine.init(supabase, userId);
        }
        
        // GamificationUI deve ser init apenas uma vez
        if (window.GamificationUI && !this.gamificationUIStarted) {
            GamificationUI.init();
            this.gamificationUIStarted = true;
        }

        if (window.AvatarSystem) {
            await AvatarSystem.init(supabase, userId);
        }
    }

    /**
     * Carrega inventário de livros.
     * Em desenvolvimento (localhost): Combina local JSON + Supabase.
     * Em produção: Apenas Supabase (Livros Publicados + Customizados).
     */
    async loadInventory() {
        console.log('📚 [App] Carregando inventário da nuvem...');
        let finalBooks = [];
        
        try {
            // Buscar do Supabase (Fonte única da verdade em produção)
            const { data: cloudBooks, error } = await supabase
                .from('ebooks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            if (cloudBooks) {
                // Normaliza campos do Supabase para o padrão do App (CamelCase vs snake_case)
                const normalizedCloud = cloudBooks.map(b => ({
                    ...b,
                    titulo: b.title,
                    capaUrl: b.cover_url,
                    arquivoUrl: b.file_url,
                    // Ebooks personalizados (owner_id preenchido) sempre viram a categoria dedicada
                    // "Meu Fabula" na estante, independente da categoria original do livro.
                    categoria: b.owner_id ? 'Meu Fabula' : b.category,
                    destaque: b.is_featured,
                    descricao: b.description,
                    storyPages: b.story_pages,
                    quiz: b.quiz
                }));
                finalBooks = [...normalizedCloud];
            }

            // Enriquece com tags do inventory.json (o banco não possui coluna 'tags')
            try {
                const invResp = await fetch('https://auhamseeqdpoatwnyxwl.supabase.co/storage/v1/object/public/fabula-assets/data/inventory.json');
                if (invResp.ok) {
                    const invBooks = await invResp.json();
                    const tagsMap = {};
                    invBooks.forEach(b => { if (b.id && b.tags) tagsMap[b.id] = b.tags; });
                    finalBooks = finalBooks.map(b => ({
                        ...b,
                        tags: b.tags || tagsMap[b.id] || []
                    }));
                    console.log('🏷️ [Inventory] Tags enriquecidas via inventory.json do Storage.');
                }
            } catch (e) {
                console.warn('⚠️ [Inventory] Não foi possível carregar tags do Storage:', e.message);
            }

            console.log(`📚 [Inventory] ${finalBooks.length} livros carregados do Supabase.`);
            
            // Em modo desenvolvimento (localhost ou IP local Wi-Fi 192.168.x.x), puxa drafts do Cockpit (Admin Server)
            const currentHost = window.location.hostname;
            const isLocalDev = currentHost === 'localhost' || 
                               currentHost === '127.0.0.1' || 
                               currentHost.startsWith('192.168.') || 
                               currentHost.startsWith('10.') || 
                               currentHost.startsWith('172.');

            if (isLocalDev) {
                try {
                    const localResp = await fetch(`http://${currentHost}:5001/data/inventory.json`);
                    if (localResp.ok) {
                        const localBooks = await localResp.json();
                        
                        // Filtra para não duplicar os que já subiram
                        const novelBooks = localBooks.filter(lb => {
                            if (!lb.id) return false;
                            const isPublished = finalBooks.some(cb => cb.id?.toString().trim() === lb.id?.toString().trim());
                            return !isPublished;
                        });
                        
                        const reviewBooks = novelBooks.map(b => ({ ...b, status: 'review' }));
                        finalBooks = [...reviewBooks, ...finalBooks];
                        console.log(`🛠️ [Inventory] Local Dev: ${reviewBooks.length} drafts locais adicionados.`);
                    }
                } catch (e) {
                    console.warn('⚠️ [App] Painel Admin indisponível. Mostrando apenas produção.', e.message);
                }
            }

        } catch (err) {
            console.error('❌ [App] Erro ao carregar inventário do Supabase:', err);
            finalBooks = [];
        }

        // Interceptador: converte caminhos "assets/" locais para o Supabase Storage ou Admin Server
        const STORAGE_BASE_URL = "https://auhamseeqdpoatwnyxwl.supabase.co/storage/v1/object/public/fabula-assets/";
        const currentHost = window.location.hostname;
        const isLocalDev = currentHost === 'localhost' || 
                           currentHost === '127.0.0.1' || 
                           currentHost.startsWith('192.168.') || 
                           currentHost.startsWith('10.') || 
                           currentHost.startsWith('172.');

        const rewriteAssetUrl = (url) => {
            if (url && url.startsWith('assets/')) {
                if (isLocalDev) {
                    // Mapeia drafts dinamicamente para o backend admin (porta 5001 no IP atual)
                    return `http://${currentHost}:5001/` + url;
                }
                return STORAGE_BASE_URL + url;
            }
            return url;
        };

        return finalBooks.map(book => ({
            ...book,
            capaUrl: rewriteAssetUrl(book.capaUrl),
            arquivoUrl: rewriteAssetUrl(book.arquivoUrl),
            storyPages: book.storyPages ? book.storyPages.map(page => ({
                ...page,
                image: rewriteAssetUrl(page.image),
                audio: rewriteAssetUrl(page.audio)
            })) : []
        }));
    }

    async ensureProfileExists(user) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, created_at, subscription_status')
                .eq('user_id', user.id)
                .single();
            
            // Código PGRST116 indica que nenhuma linha foi encontrada
            if (error && error.code === 'PGRST116') {
                console.log('✨ Criando perfil mágico inicial...');
                // Estado inicial de gamificação para novos perfis
                const initialGameState = {
                    xp: 0, nivel: 1, tituloNivel: 'Leitor Iniciante',
                    conquistas: [], conquistasDatas: {},
                    livrosLidos: [], livrosFolclore: 0,
                    quizzesCompletos: 0, quizzesPerfeitos: 0, quizzesFeitos: {},
                    objetosEncontrados: 0, cenasMontadas: 0,
                    diasConsecutivos: 0, ultimaLeitura: null,
                    booksReadToday: [], xpGanhoHoje: 0, dataXpHoje: null,
                    avataresDesbloqueados: ['maya']
                };
                const { data: newProfile, error: insertErr } = await supabase.from('profiles').insert({
                    user_id: user.id,
                    display_name: null, // Deixa nulo para forçar o onboarding do AvatarSystem
                    game_state: initialGameState,
                    unlocked_avatars: ['maya']
                }).select('id, created_at, subscription_status').single();

                if (insertErr) {
                    console.error('Erro ao criar perfil:', insertErr.message);
                } else if (newProfile) {
                    this.currentProfileId = newProfile.id;
                    this.currentProfileData = newProfile;
                    console.log('✅ [App] Perfil criado. profileId:', this.currentProfileId);
                }
            } else if (data) {
                this.currentProfileId = data.id;
                this.currentProfileData = data;
                console.log('✅ [App] Perfil encontrado. profileId:', this.currentProfileId);
            }
        } catch (err) {
            console.warn('Erro em ensureProfileExists:', err);
        }
    }

    /**
     * Geração de texto via Gemini em tempo real foi removida em favor 
     * da arquitetura "Static-First" (assets gerados previamente no build).
     */
    async characterizeText(text, persona) {
        return text; // Retorna sempre o texto original agora
    }

    isTrialExpired() {
        if (!this.currentProfileData) return false;
        if (this.currentProfileData.subscription_status === 'active') return false;
        const createdDate = new Date(this.currentProfileData.created_at || new Date());
        const diffTime = Math.abs(new Date() - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 7;
    }

    showSuccessOverlay(type) {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 fade-in';
        const msg = type === 'custom' 
            ? 'Sua história personalizada está na forja mágica! Nossos artesãos digitais estão ilustrando seus sonhos e ela aparecerá na estante em até 72h.'
            : 'Sua assinatura Passe Mágico foi solicitada com sucesso! Em instantes, nossos escribas registrarão sua chave e toda a biblioteca se abrirá.';
        
        overlay.innerHTML = `
            <div class="bg-[#fbf8f1] rounded-3xl p-8 max-w-md w-full mx-4 text-center border-2 border-[#d4af37]/40 shadow-2xl relative overflow-hidden book-page">
                <div class="absolute inset-0 opacity-10 bg-[url('../assets/ui/noise.png')] pointer-events-none"></div>
                <div class="text-5xl mb-4 animate-bounce text-[#d4af37]">✨</div>
                <h2 class="font-serif text-2xl sm:text-3xl font-bold text-[#1a140b] mb-4 font-['Cinzel']">Magia Realizada!</h2>
                <p class="text-[#5c5039] text-base leading-relaxed mb-8">${msg}</p>
                <button class="bg-[#111] hover:bg-[#222] text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105" onclick="this.parentElement.parentElement.remove()">
                    Continuar Jornada
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    setupGlobalMenu() {
        const btnMenu = document.getElementById('btn-global-menu');
        if (btnMenu) {
            btnMenu.addEventListener('click', () => {
                this.isGlobalMenuOpen = true;
                this.renderGlobalMenu();
            });
        }
        
        // Listen for internal game events
        document.addEventListener('app:startFindObject', (e) => {
            const { book, pageData, pageIndex } = e.detail;
            this.navigate('FIND_OBJECT_IN_BOOK', book, { ...pageData, pageIndex });
        });
    }

    async navigate(view, book = null, pageData = null) {
        if (this.isTransitioning) return;

        // Garante que o BGM nunca vaze para fora do e-book
        if (view !== 'READER' && window.BgmService) {
            window.BgmService.parar();
        }

        // Intercept navigation if trial expired (and they aren't already going to PAYMENTS or AUTH)
        if (view !== 'PAYMENTS' && view !== 'AUTH' && this.isTrialExpired()) {
            console.log('⚠️ [App] Período de teste expirado. Redirecionando para Central de Pagamentos.');
            this.pendingOrder = { trialExpired: true, isSubscription: true, profileId: this.currentProfileId };
            view = 'PAYMENTS';
            book = null;
            pageData = null;
        }

        this.isTransitioning = true;
        this.root.style.transition = 'opacity 0.4s ease';
        this.root.style.opacity = '0';

        let initialPageFromCloud = 0;
        // Usa profileId OU userId como chave — garante que funciona mesmo se profiles falhar com 400
        const effectiveUserId = this.currentProfileId || this.currentUserId;
        if (view === 'READER' && book && pageData === null && effectiveUserId) {
            const localKey = `fz_progress_${effectiveUserId}_${book.id}`;
            const localProgress = localStorage.getItem(localKey);
            if (localProgress !== null && localProgress !== 'undefined') {
                const parsed = parseInt(localProgress, 10);
                if (!isNaN(parsed)) initialPageFromCloud = parsed;
            }
            console.log(`📖 [App] Progresso recuperado para "${book.id}": página ${initialPageFromCloud} (chave: ${localKey.substring(0, 30)}...)`);

            // Tenta sincronizar da nuvem apenas se tivermos profileId
            if (this.currentProfileId && typeof supabase !== 'undefined') {
                try {
                    const { data } = await supabase.from('reading_progress')
                        .select('last_page_read')
                        .eq('profile_id', this.currentProfileId)
                        .eq('book_id', book.id)
                        .single();
                    if (data && data.last_page_read !== undefined) {
                        if (data.last_page_read > initialPageFromCloud) {
                            initialPageFromCloud = data.last_page_read;
                            localStorage.setItem(localKey, initialPageFromCloud);
                            console.log(`☁️ [App] Nuvem mais recente: página ${initialPageFromCloud}`);
                        }
                    }
                } catch(err) { /* ignora */ }
            }
            console.log(`✅ [App] Página inicial final: ${initialPageFromCloud}`);
        }

        setTimeout(() => {
            this.currentView = view;
            if (book !== null) {
                this.selectedBook = book;
            }
            // Usa o pageData passado ou o q veio da nuvem
            this.render(pageData !== null ? pageData : (view === 'READER' ? initialPageFromCloud : null));
            this.root.style.opacity = '1';
            this.isTransitioning = false;
        }, 400);
    }

    render(pageData = null) {
        this.root.innerHTML = '';
        if (this.currentView === 'AUTH') {
            const authElement = AuthUI();
            this.root.appendChild(authElement);
        } else if (this.currentView === 'SHELF') {
            const shelfElement = Shelf(this.books, (book) => this.navigate('READER', book), this.lastOpenedBook);
            this.root.appendChild(shelfElement);
        } else if (this.currentView === 'READER' && this.selectedBook) {
            this.lastOpenedBook = this.selectedBook; // Salva o último aberto

            const onQuizRequest = () => {
                this.navigate('QUIZ', this.selectedBook);
            };

            const onPageChange = async (bookId, pageIndex, isCompleted) => {
                // Usa profileId OU userId — nunca perde o progresso por causa do 400 no profiles
                const uid = this.currentProfileId || this.currentUserId;
                if (!uid) return;

                // Salva no localStorage imediatamente
                const localKey = `fz_progress_${uid}_${bookId}`;
                localStorage.setItem(localKey, pageIndex);

                // Sincroniza com Supabase apenas se tivermos o profileId
                if (!this.currentProfileId || typeof supabase === 'undefined') return;
                try {
                    await supabase.from('reading_progress').upsert({
                        profile_id: this.currentProfileId,
                        book_id: bookId,
                        last_page_read: pageIndex,
                        completed: isCompleted,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'profile_id, book_id' });
                } catch(e) { console.warn('Falha no sync de progresso de leitura', e); }
            };

            const initialPage = (pageData !== null && typeof pageData === 'number') ? pageData : 0;
            const readerElement = Reader(
                this.selectedBook,
                () => this.navigate('SHELF'),
                onQuizRequest,
                initialPage,
                onPageChange
            );
            this.root.appendChild(readerElement);
        } else if (this.currentView === 'QUIZ' && this.selectedBook) {
            QuizMiniGame.iniciar(this.selectedBook, (resultado) => {
                // Se houver resultado (quiz completo), registra XP
                if (resultado && window.GamificationEngine) {
                    GamificationEngine.registrarQuiz({
                        bookId: this.selectedBook.id,
                        acertos: resultado.acertos,
                        total: resultado.total
                    });
                }
                // Volta à estante (tanto ao finalizar quanto ao fechar no X)
                this.navigate('SHELF');
            });
        } else if (this.currentView === 'GAMES') {
            const gamesElement = GamesHub(
                this.books,
                (view) => this.navigate(view),
                (view, params) => this.navigate(view, params)
            );
            this.root.appendChild(gamesElement);
        } else if (this.currentView === 'FIND_OBJECT_IN_BOOK' && this.selectedBook && pageData) {
            const returnToPage = pageData.pageIndex || 0;
            const findObjElement = FindObjectGame(
                this.selectedBook,
                pageData,
                () => this.navigate('READER', this.selectedBook, returnToPage),
                () => this.navigate('READER', this.selectedBook, returnToPage)
            );
            this.root.appendChild(findObjElement);
        } else if (this.currentView === 'FIND_OBJECT_STANDALONE') {
            // Find Object Standalone sem livro específico yet
            const findObjElement = FindObjectGame(
                null, 
                null, 
                () => this.navigate('GAMES'),
                () => this.navigate('GAMES')
            );
            this.root.appendChild(findObjElement);
        } else if (this.currentView === 'CUSTOM_ORDER') {
            const orderElement = CustomOrderPage((data) => {
                this.pendingOrder = data; // Salva dados temporários
                this.navigate('PAYMENTS');
            });
            this.root.appendChild(orderElement);
        } else if (this.currentView === 'PAYMENTS') {
            if (!this.pendingOrder) {
                this.pendingOrder = { isSubscription: true, profileId: this.currentProfileId };
            } else if (!this.pendingOrder.profileId && !this.pendingOrder.theme) {
                this.pendingOrder.isSubscription = true;
                this.pendingOrder.profileId = this.currentProfileId;
            }
            const paymentElement = PaymentPage(this.pendingOrder, (action) => {
                if (action === 'CANCEL') {
                    this.pendingOrder = null;
                    this.navigate('SHELF');
                }
            });
            this.root.appendChild(paymentElement);
        }
    }

    renderGlobalMenu() {
        // Remove existing if any
        const existing = document.getElementById('global-menu-overlay');
        if (existing) existing.remove();

        const menuElement = GlobalMenu(
            this.isGlobalMenuOpen,
            () => {
                this.isGlobalMenuOpen = false;
                const el = document.getElementById('global-menu-overlay');
                if (el) {
                    el.classList.remove('open');
                    setTimeout(() => el.remove(), 300);
                }
            },
            (view) => {
                this.navigate(view);
            }
        );
        document.body.appendChild(menuElement);
        
        // Trigger reflow to animate
        requestAnimationFrame(() => {
            menuElement.classList.add('open');
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new App();

    // Registro do Service Worker para garantir atualizações e offline
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('✅ [PWA] Service Worker registrado!'))
            .catch(err => console.error('❌ [PWA] Falha ao registrar SW:', err));
    }

    // --- Fullscreen Imersivo ---
    // Entra em tela cheia no primeiro toque do usuário (necessário por política do navegador)
    const entrarFullscreen = () => {
        const el = document.documentElement;
        const requestFS = el.requestFullscreen
            || el.webkitRequestFullscreen
            || el.msRequestFullscreen;

        if (requestFS && !document.fullscreenElement && !document.webkitFullscreenElement) {
            requestFS.call(el).catch(err => {
                console.warn('⚠️ [Fullscreen] Não foi possível entrar em tela cheia:', err.message);
            });
        }
    };

    // Dispara no primeiro toque/clique e remove o listener
    const onPrimeiroToque = () => {
        entrarFullscreen();
        document.removeEventListener('click', onPrimeiroToque);
        document.removeEventListener('touchstart', onPrimeiroToque);
    };
    document.addEventListener('click', onPrimeiroToque, { once: true });
    document.addEventListener('touchstart', onPrimeiroToque, { once: true });

    // Quando o usuário sair do fullscreen (ex: botão voltar), 
    // re-entra no próximo toque
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            console.log('ℹ️ [Fullscreen] Usuário saiu da tela cheia. Reativará no próximo toque.');
            document.addEventListener('click', onceReenterFS, { once: true });
            document.addEventListener('touchstart', onceReenterFS, { once: true });
        }
    });

    const onceReenterFS = () => {
        entrarFullscreen();
    };
});
