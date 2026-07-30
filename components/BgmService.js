/**
 * BgmService.js — Fabula-Zen
 * Serviço de Música de Fundo (BGM) do Frontend
 * Regras:
 * - O áudio inicia a 50% (0.5) de volume para não atrapalhar leitura manual
 * - Quando a narração toca (ducking), reduz para 40% (0.4)
 * - Seleção:
 *    - Aventura / Hora de dormir -> Categoria
 *    - Livros Animados -> Tag principal
 *    - RPG -> ID do livro
 */

const BgmService = (() => {
  let _bgmAudio = new Audio();
  _bgmAudio.loop = true;
  _bgmAudio.crossOrigin = "anonymous"; // Necessário para Web Audio API com URLs externas
  
  let _audioCtx = null;
  let _gainNode = null;
  let _mediaSource = null;

  let _currentVolume = 0.15; // 15% (música suave)
  let _duckVolume = 0.08;    // 8% durante a narração (ducking)

  const BASE_URL = 'https://auhamseeqdpoatwnyxwl.supabase.co/storage/v1/object/public/fabula-assets/assets/audio';

  function _getBgmUrl(book) {
    const cat = book.categoria ? book.categoria.toLowerCase() : "";

    if (cat === "fabula rpg") {
      return `${BASE_URL}/bgm_RPG/bgm_${book.id}.mp3`;
    }

    let tema = "aventura";
    
    // Regra 1: Tag "folclore" sempre vence (mesmo se categoria for Aventura/Hora de dormir)
    if (book.tags && book.tags.some(t => t.toLowerCase() === "folclore")) {
        tema = "folclore";
    } 
    // Regra 2: "Livros Animados" são filtrados *exclusivamente* pela tag principal
    else if (cat === "livros animados" && book.tags && book.tags.length > 0) {
        tema = book.tags[0].toLowerCase().replace(/ /g, "_");
    } 
    // Regra 3: Fallbacks baseados na categoria
    else if (cat === "hora de dormir") {
        tema = "hora_de_dormir";
    } else {
        tema = "aventura";
    }

    const variante = Math.random() > 0.5 ? "01" : "02";
    return `${BASE_URL}/bgm/bgm_${tema}-${variante}.mp3`;
  }

  function _initWebAudio() {
    if (!_audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      _audioCtx = new AudioContext();
      _gainNode = _audioCtx.createGain();
      _mediaSource = _audioCtx.createMediaElementSource(_bgmAudio);
      
      _mediaSource.connect(_gainNode);
      _gainNode.connect(_audioCtx.destination);
    }
    if (_audioCtx.state === 'suspended') {
      _audioCtx.resume();
    }
  }

  function iniciar(book) {
    parar();
    const url = _getBgmUrl(book);
    
    _bgmAudio.src = url;
    
    _initWebAudio();
    _gainNode.gain.value = _currentVolume;
    
    _bgmAudio.play().catch(e => console.warn('BGM autoplay bloqueado pelo navegador. Necessário interação do usuário.', e));
  }

  function parar() {
    if (!_bgmAudio.paused) {
      _bgmAudio.pause();
    }
    _bgmAudio.currentTime = 0;
  }

  // Hook de ducking usando o evento disparado pelo AudioService.js
  document.addEventListener('audioService:estado', (e) => {
    if (!_bgmAudio) return;
    const tocando = e.detail.tocando;
    
    // Transição suave (ducking)
    _fadeVolume(tocando ? _duckVolume : _currentVolume);
  });

  function _fadeVolume(targetVolume) {
    if (!_audioCtx || !_gainNode) return;
    
    const currentTime = _audioCtx.currentTime;
    
    // Cancela agendamentos anteriores para evitar conflitos de transição
    _gainNode.gain.cancelScheduledValues(currentTime);
    
    // Define o valor inicial como o valor atual para a transição
    _gainNode.gain.setValueAtTime(_gainNode.gain.value, currentTime);
    
    // Realiza um fade suave de 1 segundo para o novo volume
    _gainNode.gain.linearRampToValueAtTime(targetVolume, currentTime + 1.0);
  }

  return { iniciar, parar };
})();

window.BgmService = BgmService;
