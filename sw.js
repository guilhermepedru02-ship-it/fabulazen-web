const CACHE_NAME = 'fz-cache-v5.7-chunkloader-fix';
const AUDIO_CACHE = 'fabula-zen-audio-v1';
const IMAGE_CACHE = 'fabula-zen-images-v2';
const VIDEO_CACHE = 'fabula-zen-videos-v1';
const MAX_VIDEOS = 15;
const MAX_AUDIOS = 60;
const MAX_IMAGES = 100;

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/styles.css',
    './scripts/app.js',
    './manifest.json',
    './data/inventory.json',
    './css/avatar.css',
    './css/gamification.css',
    './css/build-scene.css',
    './css/selecao-livro.css',
    './css/quiz.css',
    './components/audioService.js',
    './assets/avatares/avatarData.js',
    './components/GamificationEngine.js',
    './components/GamificationUI.js',
    './components/AvatarSystem.js',
    './components/BuildSceneGame.js',
    './components/Reader.js',
    './components/Shelf.js',
    './components/GamesHub.js',
    './components/FindObjectGame.js',
    './components/GlobalMenu.js'
];

// Utilitário iterativo (não recursivo) para limpar caches por quantidade
async function limparCachePorQuantidade(cacheName, maxItems) {
    try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        if (keys.length > maxItems) {
            const itensParaRemover = keys.length - maxItems;
            console.log(`[SW] Limpando ${itensParaRemover} itens do cache: ${cacheName}`);
            for (let i = 0; i < itensParaRemover; i++) {
                await cache.delete(keys[i]);
            }
        }
    } catch (e) {
        console.warn(`[SW] Erro na limpeza do cache ${cacheName}:`, e);
    }
}


// Instalação: Cacheia os ativos fundamentais
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 [SW] Cacheando ativos iniciais...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => ![CACHE_NAME, AUDIO_CACHE, IMAGE_CACHE, VIDEO_CACHE].includes(key))
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Estratégia de Fetch Otimizada
self.addEventListener('fetch', (event) => {
    // 0. Ignorar requisições que não sejam GET (ex: POST)
    if (event.request.method !== 'GET') {
        return; // Deixa o navegador fazer a requisição naturalmente
    }

    const url = new URL(event.request.url);

    // 0.5 Tratamento de Mídia com Suporte a Streaming (Range Requests para Safari/iOS)
    const isVideo = url.pathname.match(/\.(mp4|webm)$/i);
    const isAudio = url.pathname.includes('/audio/pag');

    if (isVideo || isAudio) {
        event.respondWith(
            (async () => {
                const cacheStore = isVideo ? VIDEO_CACHE : AUDIO_CACHE;
                const maxItems = isVideo ? MAX_VIDEOS : MAX_AUDIOS;
                const cache = await caches.open(cacheStore);
                const cachedResponse = await cache.match(event.request);
                
                let responseToUse = cachedResponse;

                if (!responseToUse) {
                    try {
                        const fetchOptions = url.hostname !== self.location.hostname
                            ? { mode: 'cors', credentials: 'omit' }
                            : {};
                        const networkResponse = await fetch(event.request.url, fetchOptions);
                        if (networkResponse.ok || networkResponse.type === 'opaque') {
                            cache.put(event.request, networkResponse.clone());
                            // Faxina rotativa silenciosa
                            limparCachePorQuantidade(cacheStore, maxItems);
                        }
                        responseToUse = networkResponse;
                    } catch (e) {
                        console.error('[SW Media] Falha de rede:', e);
                        return new Response('', { status: 504 });
                    }
                }

                // Handler de "Range" (Streaming) – Essencial para Safari e estabilidade de áudio
                if (event.request.headers.has('range') && responseToUse) {
                    const rangeHeader = event.request.headers.get('range');
                    try {
                        const arrayBuffer = await responseToUse.clone().arrayBuffer();
                        const bytes = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
                        const start = Number(bytes[1]);
                        const end = bytes[2] ? Number(bytes[2]) : arrayBuffer.byteLength - 1;

                        return new Response(arrayBuffer.slice(start, end + 1), {
                            status: 206,
                            statusText: 'Partial Content',
                            headers: [
                                ['Content-Range', `bytes ${start}-${end}/${arrayBuffer.byteLength}`],
                                ['Content-Length', `${end - start + 1}`],
                                ['Content-Type', responseToUse.headers.get('Content-Type')],
                                ['Accept-Ranges', 'bytes']
                            ]
                        });
                    } catch (err) {
                        return responseToUse; 
                    }
                }

                return responseToUse;
            })()
        );
        return;
    }

    // 1. Imagens: Cache First com limpeza por quantidade
    const isImage = url.pathname.match(/\.(jpeg|jpg|png|webp|svg)$/i);
    if (isImage) {
        event.respondWith(
            caches.open(IMAGE_CACHE).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    
                    const fetchOptions = url.hostname !== self.location.hostname
                        ? { mode: 'cors', credentials: 'omit' }
                        : {};
                    
                    return fetch(event.request.url, fetchOptions).then(async (networkResponse) => {
                        // Smart Fallback para extensões de imagem (tenta outros formatos se o solicitado falhar)
                        if (!networkResponse.ok && url.pathname.includes('/assets/ebooks/')) {
                            const extMatch = url.pathname.match(/\.(webp|jpeg|jpg|png)$/i);
                            if (extMatch) {
                                const originalExt = extMatch[0].toLowerCase();
                                const fallbacks = ['.webp', '.jpg', '.png', '.jpeg'].filter(ext => ext !== originalExt);
                                for (const ext of fallbacks) {
                                    const fallbackUrl = new URL(url.href);
                                    fallbackUrl.pathname = fallbackUrl.pathname.replace(/\.(webp|jpeg|jpg|png)$/i, ext);
                                    try {
                                        const fbResponse = await fetch(fallbackUrl.href, fetchOptions);
                                        if (fbResponse.ok) {
                                            console.log(`✨ [SW Fallback] Imagem redirecionada para ${ext}:`, fallbackUrl.pathname);
                                            cache.put(event.request, fbResponse.clone());
                                            return fbResponse;
                                        }
                                    } catch (e) {}
                                }
                            }
                        }

                        if (networkResponse.ok || networkResponse.type === 'opaque') {
                            cache.put(event.request, networkResponse.clone());
                            limparCachePorQuantidade(IMAGE_CACHE, MAX_IMAGES);
                        }
                        return networkResponse;
                    });
                });
            })
        );
        return;
    }


    // 2. Bibliotecas Externas (CDNs como Lucide): Cache First
    if (url.hostname.includes('unpkg.com') || url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
        event.respondWith(
            caches.open('external-libs-v1').then((cache) => {
                return cache.match(event.request).then((res) => {
                    return res || fetch(event.request).then((net) => {
                        cache.put(event.request, net.clone());
                        return net;
                    });
                });
            })
        );
        return;
    }

    // 3.Scripts e CSS do Projeto: Stale-While-Revalidate
    // (Carrega instantâneo do cache, mas atualiza por baixo dos panos)
    if (ASSETS_TO_CACHE.some(asset => url.pathname.endsWith(asset.replace('./', '')))) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((cachedResponse) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // 4. Default: Network First (com cacheamento do resultado)
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok || response.type === 'opaque') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

