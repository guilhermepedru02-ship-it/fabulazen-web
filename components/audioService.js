/**
 * audioService.js — Fabula-Zen
 * Serviço de narração com duas camadas:
 *   1. MP3 pré-gerado em disco (premium, via update_all_audio.py)
 *   2. Web Speech API nativa (fallback gratuito)
 *
 * IMPORTANTE: ElevenLabs NÃO é chamado pelo navegador em runtime.
 * É uma ferramenta interna de produção (update_all_audio.py → MP3 em disco).
 * Isso controla custos e garante que o áudio premium seja pré-pago.
 *
 * API pública:
 *   AudioService.narrar(texto, idPagina)  → Promise<void>  toca a narração
 *   AudioService.pausar()                 → pausa o áudio atual
 *   AudioService.retomar()                → retoma de onde parou
 *   AudioService.parar()                  → para e reseta
 *   AudioService.estaRodando()            → boolean
 *   AudioService.limparCache()            → limpa cache ao trocar de livro
 */

const AudioService = (() => {

  // ── Config ─────────────────────────────────────────────────────────────────
  // Sem chamadas externas em runtime — apenas MP3 local + Web Speech API

  // ── Estado ─────────────────────────────────────────────────────────────────
  let _audio      = null;   // HTMLAudioElement atual
  let _rodando    = false;
  let _cache      = {};     // { [idPagina]: objectURL } — cache em memória
  let _loading    = false;
  let _isFallback = false;  // Novo: rastreia se estamos no modo nativo
  let _pausado    = false;

  // ── API pública ────────────────────────────────────────────────────────────

  async function narrar(texto, idPagina, basePath = null) {
    parar();
    if (!texto?.trim()) return;

    _setLoading(true);
    try {
      const url = await _obterAudio(texto, idPagina, basePath);
      _setLoading(false);
      _isFallback = false;
      await _tocar(url);
    } catch (err) {
      _setLoading(false);
      console.warn('[AudioService] Usando fallback Web Speech:', err.message);
      _isFallback = true;
      _fallbackWebSpeech(texto);
    }
  }

  /**
   * Pré-carrega a próxima página silenciosamente.
   * Chame ao virar a página para evitar delay na narração seguinte.
   */
  async function precarregar(texto, idPagina, basePath = null) {
    if (!texto?.trim() || _cache[idPagina]) return;
    try {
      await _obterAudio(texto, idPagina, basePath);
    } catch (_) { /* silencioso */ }
  }

  function pausar() {
    _pausado = true;
    if (_isFallback) {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        _rodando = false;
        _atualizarBotao(false);
      }
      return;
    }

    if (_audio && _rodando) {
      _audio.pause();
      _rodando = false;
      _atualizarBotao(false);
    }
  }

  function retomar() {
    if (!_pausado) return false;
    _pausado = false;

    if (_isFallback) {
      if (window.speechSynthesis) {
        window.speechSynthesis.resume();
        _rodando = true;
        _atualizarBotao(true);
        return true;
      }
      return false;
    }

    if (_audio && !_rodando) {
      _audio.play().catch(console.error);
      return true;
    }
    return false;
  }

  function parar() {
    _pausado = false;
    if (_isFallback) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else if (_audio) {
      _audio.pause();
      _audio.currentTime = 0;
      _audio = null;
    }
    _rodando = false;
    _atualizarBotao(false);
  }

  function estaRodando() { return _rodando; }
  function estaCarregando() { return _loading; }

  function limparCache() {
    Object.values(_cache).forEach(u => URL.revokeObjectURL(u));
    _cache = {};
  }

  // ── Internos ───────────────────────────────────────────────────────────────
  
  async function _obterAudio(texto, idPagina, basePath = null) {
    if (_cache[idPagina]) return _cache[idPagina];

    const partes = idPagina.split('_p');
    if (partes.length === 2) {
      const ebookId    = partes[0];
      const index      = parseInt(partes[1], 10);
      const numPagina  = index + 1; // pag1.mp3, pag2.mp3...
      
      const base = basePath || `assets/ebooks/${ebookId}`;
      const urlEstatica = `${base}/audio/pag${numPagina}.mp3`;

      _cache[idPagina] = urlEstatica;
      return urlEstatica;
    }

    throw new Error(`MP3 não mapeável para ${idPagina}`);
  }


  function _tocar(url) {
    return new Promise((resolve, reject) => {
      _audio   = new Audio(url);
      _rodando = true;
      _atualizarBotao(true);

      _audio.addEventListener('ended',  () => { _rodando = false; _atualizarBotao(false); resolve(); });
      _audio.addEventListener('error',  () => { _rodando = false; _atualizarBotao(false); reject(new Error('Erro no HTMLAudioElement')); });
      _audio.addEventListener('pause',  () => { _rodando = false; _atualizarBotao(false); });
      _audio.addEventListener('play',   () => { _rodando = true;  _atualizarBotao(true);  });

      _audio.play().catch(reject);
    });
  }

  // Fallback para Web Speech API caso o bridge esteja fora do ar
  function _fallbackWebSpeech(texto) {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    
    // Tenta encontrar voz PT-BR
    const vozes = speechSynthesis.getVoices();
    const ptBR  = vozes.find(v => v.lang.startsWith('pt') && v.name.toLowerCase().includes('female'))
               || vozes.find(v => v.lang.startsWith('pt'));
    
    if (ptBR) utterance.voice = ptBR;
    utterance.rate  = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      _rodando = true;
      _atualizarBotao(true);
    };
    utterance.onend = () => {
      _rodando = false;
      _atualizarBotao(false);
    };
    utterance.onerror = () => {
      _rodando = false;
      _atualizarBotao(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  // ── UI helpers ──────────────────────────────────────────────────────────────
  // Os IDs abaixo devem bater com o que existe no Reader.js / index.html

  function _setLoading(ativo) {
    _loading = ativo;
    const detail = { ativo, isFallback: _isFallback };
    document.dispatchEvent(new CustomEvent('audioService:loading', { detail }));
    _broadcastToIframes('audioService:loading', detail);
  }

  function _atualizarBotao(tocando) {
    const detail = { tocando, isFallback: _isFallback, pausado: _pausado };
    document.dispatchEvent(new CustomEvent('audioService:estado', { detail }));
    _broadcastToIframes('audioService:estado', detail);
  }

  function _broadcastToIframes(type, detail) {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow.postMessage({ type, detail }, "*");
      } catch (e) { /* cross-origin if sandbox is too strict */ }
    });
  }

  return { narrar, precarregar, pausar, retomar, parar, estaRodando, estaCarregando, limparCache };

})();


/* ═══════════════════════════════════════════════════════════════════════════
   COMO INTEGRAR NO Reader.js EXISTENTE
   ═══════════════════════════════════════════════════════════════════════════

   1. Adicione no index.html (antes do app.js):
      <script src="components/audioService.js"></script>

   2. No Reader.js, localize o método que chama o TTS. Provavelmente:

        // Trecho atual (Web Speech API)
        async _speak(text) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          // ... seleção de voz PT-BR ...
          speechSynthesis.speak(utterance);
        }

        _stopSpeaking() {
          window.speechSynthesis.cancel();
        }

   3. Substitua por:

        async _speak(text) {
          // idPagina garante cache por livro + número de página
          const idPagina = `${this.ebook.id}_p${this.currentPage}`;

          // Usa voz caracterizada pela IA (já existe no Reader.js)
          // ou o texto puro se a caracterização falhar
          await AudioService.narrar(text, idPagina);
        }

        _stopSpeaking() {
          AudioService.parar();
        }

   4. No evento de virar página, adicione o pré-carregamento:

        _onPageChange(novaPagina) {
          AudioService.parar();
          // Pré-carrega a próxima página enquanto a criança lê a atual
          const proxPagina = this.ebook.storyPages[novaPagina];
          if (proxPagina) {
            const idProx = `${this.ebook.id}_p${novaPagina}`;
            AudioService.precarregar(proxPagina.text, idProx);
          }
        }

   5. Ao fechar/trocar de livro:

        _onClose() {
          AudioService.parar();
          AudioService.limparCache();
        }

   6. Para reagir ao estado do áudio no botão (opcional):

        document.addEventListener('audioService:loading', ({ detail }) => {
          // mostra spinner no botão de narração
          btnNarrar.classList.toggle('carregando', detail.ativo);
        });

        document.addEventListener('audioService:estado', ({ detail }) => {
          // troca ícone 🔊 / ⏸
          iconeAudio.textContent = detail.tocando ? '⏸' : '🔊';
        });

   ═══════════════════════════════════════════════════════════════════════════ */
