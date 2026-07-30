/**
 * BuildSceneGame.js — Fabula-Zen
 * Mini-jogo "Montar a Cena" — Ordenar a sequência das páginas da história.
 *
 * COMO FUNCIONA:
 *   1. Sorteia 4-5 páginas aleatórias do storyPages do ebook
 *   2. Exibe as cenas embaralhadas (imagem + título)
 *   3. Criança arrasta e reordena até achar a sequência correta
 *   4. Ao confirmar → feedback página a página + XP
 *
 * DADOS NECESSÁRIOS:
 *   Apenas o campo storyPages já existente no inventory.json.
 *   Zero assets novos, zero alterações no pipeline n8n.
 *
 * INTEGRAÇÃO:
 *   BuildSceneGame.iniciar(ebook, onConcluido)
 *     ebook       → objeto do inventory.json
 *     onConcluido → callback com { acertos, total, xpGanho }
 *
 *   Ativado pela view "Mundo dos Games" → "Montar Cena" → seleção de livro.
 *   NÃO aparece dentro do Reader (diferente do Quiz e do Encontrar Objeto).
 */

const BuildSceneGame = (() => {

  // ── Config ─────────────────────────────────────────────────────────────────
  const CENAS_POR_JOGO = 4;   // quantas páginas sortear (4 ou 5)
  const XP_PERFEITO   = 40;
  const XP_PARCIAL    = 15;   // acertou pelo menos metade na ordem certa

  // ── Estado ─────────────────────────────────────────────────────────────────
  let _ebook       = null;
  let _cenas       = [];      // páginas sorteadas na ordem CORRETA
  let _ordem       = [];      // ordem atual do jogador (índices de _cenas)
  let _overlay     = null;
  let _onConcluido = null;
  let _dragIdx     = null;    // índice do card sendo arrastado

  // ── API pública ────────────────────────────────────────────────────────────

  function iniciar(ebook, onConcluido) {
    if (!ebook?.storyPages?.length) {
      console.error('[BuildSceneGame] ebook sem storyPages');
      return;
    }
    _ebook       = ebook;
    _onConcluido = onConcluido;
    _dragIdx     = null;

    _cenas = _sortearCenas(ebook.storyPages);
    _ordem = _embaralhar(_cenas.map((_, i) => i));

    _renderizar();
  }

  // ── Sorteio e embaralhamento ───────────────────────────────────────────────

  function _sortearCenas(pages) {
    // Filtra páginas que têm imagem e texto
    const validas = pages.filter(p => p.image && (p.text || p.title));
    // Pega no máximo CENAS_POR_JOGO páginas distribuídas ao longo do livro
    if (validas.length <= CENAS_POR_JOGO) return [...validas];

    const step   = Math.floor(validas.length / CENAS_POR_JOGO);
    const result = [];
    for (let i = 0; i < CENAS_POR_JOGO; i++) {
      const idx = Math.min(i * step + Math.floor(Math.random() * step), validas.length - 1);
      result.push(validas[idx]);
    }
    // Garante que estão em ordem crescente de número de página
    return result.sort((a, b) => (a.numero || 0) - (b.numero || 0));
  }

  function _embaralhar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    // Garante que nunca sai na ordem certa por acaso
    const correta = arr.every((v, i) => a[i] === v);
    return correta ? _embaralhar(arr) : a;
  }

  // ── Renderização principal ─────────────────────────────────────────────────

  function _renderizar() {
    _overlay?.remove();
    _overlay = document.createElement('div');
    _overlay.id = 'fz-build-overlay';
    _overlay.innerHTML = `
      <div class="fz-build-modal">
        <div class="fz-build-header">
          <button class="fz-build-voltar" id="fz-build-voltar">←</button>
          <div class="fz-build-titulo-wrap">
            <span class="fz-build-label">Montar a Cena</span>
            <span class="fz-build-livro">${_ebook.titulo}</span>
          </div>
        </div>

        <p class="fz-build-instrucao">
          Arraste as cenas e coloque a história na ordem certa!
        </p>

        <div class="fz-build-grid" id="fz-build-grid">
          ${_ordem.map((cenaIdx, posicao) => _cardHTML(cenaIdx, posicao)).join('')}
        </div>

        <button class="fz-build-btn-confirmar" id="fz-build-confirmar">
          Confirmar ordem
        </button>
      </div>`;

    document.body.appendChild(_overlay);
    requestAnimationFrame(() => _overlay.classList.add('visivel'));

    _bindEventos();
  }

  function _getImageUrl(cena) {
    let url = cena.image;
    if (!url) return '';
    // Se já for local ou assets, retornar direto
    if (url.startsWith('assets/') || !url.startsWith('http')) {
        if (!url.startsWith('assets/') && _ebook?.arquivoUrl) {
           const baseUrl = _ebook.arquivoUrl.substring(0, _ebook.arquivoUrl.lastIndexOf('/') + 1);
           return baseUrl + url;
        }
        return url;
    }

    // Para URLs externas, fallback para o padrão pagX do diretório
    if (_ebook?.arquivoUrl && cena.numero) {
        const baseUrl = _ebook.arquivoUrl.substring(0, _ebook.arquivoUrl.lastIndexOf('/') + 1);
        let ext = 'jpg';
        if (_ebook.capaUrl && _ebook.capaUrl.includes('.')) {
            ext = _ebook.capaUrl.split('.').pop().toLowerCase();
        }
        // Fallback especial para .jpeg (comum em Ilha Borboletas)
        if (cena.numero >= 4 && _ebook.id === 'IlhaBorboletasPerdidas') ext = 'jpeg';
        
        return `${baseUrl}pag${cena.numero}.${ext}`;
    }
    return url;
  }

  function _cardHTML(cenaIdx, posicao) {
    const cena = _cenas[cenaIdx];
    return `
      <div class="fz-build-card"
           data-posicao="${posicao}"
           data-cena-idx="${cenaIdx}"
           draggable="true">
        <div class="fz-build-card-img-wrap">
          <img src="${_getImageUrl(cena)}" alt="${cena.title || ''}" loading="lazy"/>
        </div>
        <p class="fz-build-card-titulo">${cena.title || `Cena ${posicao + 1}`}</p>
        <div class="fz-build-card-num">${posicao + 1}</div>
      </div>`;
  }

  // ── Drag and drop ──────────────────────────────────────────────────────────

  function _bindEventos() {
    if (_overlay.dataset.eventosOk) return;
    _overlay.dataset.eventosOk = 'true';

    const grid = _overlay.querySelector('#fz-build-grid');

    // Botão voltar (o botão agora está fora da área que re-renderiza)
    _overlay.addEventListener('click', e => {
      const btnVoltar = e.target.closest('#fz-build-voltar');
      const btnConfirmar = e.target.closest('#fz-build-confirmar');
      const btnNovo = e.target.closest('#fz-build-novo');
      const btnVoltarGames = e.target.closest('#fz-build-voltar-games');

      if (btnVoltar || btnVoltarGames) {
        _fechar();
        document.dispatchEvent(new CustomEvent('buildScene:voltar'));
      } else if (btnConfirmar) {
        _verificar();
      } else if (btnNovo) {
        iniciar(_ebook, _onConcluido);
      }
    });

    // Drag & Drop — desktop (Delegação no grid)
    grid.addEventListener('dragstart', e => {
      const card = e.target.closest('.fz-build-card');
      if (!card) return;
      _dragIdx = parseInt(card.dataset.posicao);
      card.classList.add('arrastando');
      e.dataTransfer.effectAllowed = 'move';
    });

    grid.addEventListener('dragend', e => {
      const card = e.target.closest('.fz-build-card');
      card?.classList.remove('arrastando');
      grid.querySelectorAll('.fz-build-card').forEach(c => c.classList.remove('sobre'));
      // _dragIdx = null; // Não limpa aqui para o drop pegar
    });

    grid.addEventListener('dragover', e => {
      e.preventDefault();
      const card = e.target.closest('.fz-build-card');
      grid.querySelectorAll('.fz-build-card').forEach(c => c.classList.remove('sobre'));
      if (card) card.classList.add('sobre');
    });

    grid.addEventListener('drop', e => {
      e.preventDefault();
      const destCard = e.target.closest('.fz-build-card');
      if (!destCard || _dragIdx === null) return;
      const destIdx = parseInt(destCard.dataset.posicao);
      if (_dragIdx === destIdx) return;

      // Troca na ordem
      const tmp = _ordem[_dragIdx];
      _ordem[_dragIdx] = _ordem[destIdx];
      _ordem[destIdx] = tmp;

      _dragIdx = null;
      _atualizarGrid();
    });

    // Touch — mobile
    let touchCard = null;
    let touchClone = null;
    let touchOrigIdx = null;

    grid.addEventListener('touchstart', e => {
      touchCard = e.target.closest('.fz-build-card');
      if (!touchCard) return;
      touchOrigIdx = parseInt(touchCard.dataset.posicao);

      touchClone = touchCard.cloneNode(true);
      touchClone.style.cssText = `
        position:fixed; pointer-events:none; opacity:0.85; z-index:9999;
        width:${touchCard.offsetWidth}px; transition:none;
        border:2px solid #D4AF37; border-radius:12px;`;
      document.body.appendChild(touchClone);
      touchCard.classList.add('arrastando');
      _moverClone(touchClone, e.touches[0]);
    }, { passive: true });

    grid.addEventListener('touchmove', e => {
      if (!touchClone) return;
      e.preventDefault();
      _moverClone(touchClone, e.touches[0]);

      touchClone.style.display = 'none';
      const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      touchClone.style.display = '';
      const destCard = el?.closest('.fz-build-card');
      grid.querySelectorAll('.fz-build-card').forEach(c => c.classList.remove('sobre'));
      if (destCard && destCard !== touchCard) destCard.classList.add('sobre');
    }, { passive: false });

    grid.addEventListener('touchend', e => {
      if (!touchClone) return;
      touchClone.remove();
      touchClone = null;
      touchCard?.classList.remove('arrastando');

      const el = document.elementFromPoint(
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY
      );
      const destCard = el?.closest('.fz-build-card');
      grid.querySelectorAll('.fz-build-card').forEach(c => c.classList.remove('sobre'));

      if (destCard && touchOrigIdx !== null) {
        const destIdx = parseInt(destCard.dataset.posicao);
        if (destIdx !== touchOrigIdx) {
          const tmp = _ordem[touchOrigIdx];
          _ordem[touchOrigIdx] = _ordem[destIdx];
          _ordem[destIdx] = tmp;
          _atualizarGrid();
        }
      }
      touchCard = null;
      touchOrigIdx = null;
    });
  }

  function _moverClone(clone, touch) {
    clone.style.left = (touch.clientX - clone.offsetWidth / 2) + 'px';
    clone.style.top  = (touch.clientY - clone.offsetHeight / 2) + 'px';
  }

  function _atualizarGrid() {
    const grid = _overlay.querySelector('#fz-build-grid');
    grid.innerHTML = _ordem.map((cenaIdx, posicao) => _cardHTML(cenaIdx, posicao)).join('');
    // Não chama mais _bindEventos aqui, pois usamos deleção no overlay/grid persistente
  }

  // ── Verificação e resultado ────────────────────────────────────────────────

  function _verificar() {
    // A sequência correta é _cenas[0], _cenas[1], ... em ordem numérica
    // _ordem[i] deve ser === i para estar certo
    let acertos = 0;
    const resultado = _ordem.map((cenaIdx, posicao) => {
      const correto = cenaIdx === posicao;
      if (correto) acertos++;
      return { cenaIdx, posicao, correto };
    });

    const total = _cenas.length;
    const xp    = acertos === total ? XP_PERFEITO
                : acertos >= Math.ceil(total / 2) ? XP_PARCIAL
                : 0;

    _mostrarFeedback(resultado, acertos, total, xp);
  }

  function _mostrarFeedback(resultado, acertos, total, xp) {
    const estrelas = acertos === total ? '⭐⭐⭐'
                   : acertos >= Math.ceil(total / 2) ? '⭐⭐'
                   : '⭐';

    const titulo = acertos === total ? 'Perfeito! Você conhece bem a história!'
                 : acertos >= Math.ceil(total / 2) ? 'Muito bem! Quase lá!'
                 : 'Continue tentando!';

    // Mostra ordem correta com marcação visual
    const cardsHTML = resultado.map(({ cenaIdx, posicao, correto }) => {
      const cena = _cenas[cenaIdx];
      return `
        <div class="fz-build-card fz-build-card-resultado ${correto ? 'correta' : 'errada'}">
          <div class="fz-build-card-img-wrap">
            <img src="${_getImageUrl(cena)}" alt="${cena.title || ''}" loading="lazy"/>
          </div>
          <p class="fz-build-card-titulo">${cena.title || `Cena ${posicao + 1}`}</p>
          <div class="fz-build-card-badge">${correto ? '✓' : `${cenaIdx + 1}º`}</div>
        </div>`;
    }).join('');

    _overlay.querySelector('.fz-build-modal').innerHTML = `
      <div class="fz-build-resultado-topo">
        <div class="fz-build-estrelas">${estrelas}</div>
        <h2 class="fz-build-resultado-titulo">${titulo}</h2>
        <p class="fz-build-placar">${acertos} de ${total} na posição certa</p>
        ${xp > 0 ? `<p class="fz-build-xp">+${xp} XP</p>` : ''}
      </div>

      <p class="fz-build-instrucao">A ordem correta era:</p>
      <div class="fz-build-grid fz-build-grid-resultado">
        ${_cenas.map((cena, i) => `
          <div class="fz-build-card fz-build-card-resultado correto-final">
            <div class="fz-build-card-img-wrap">
              <img src="${_getImageUrl(cena)}" alt="${cena.title || ''}" loading="lazy"/>
            </div>
            <p class="fz-build-card-titulo">${cena.title || `Cena ${i + 1}`}</p>
            <div class="fz-build-card-num">${i + 1}</div>
          </div>`).join('')}
      </div>

      <div class="fz-build-acoes">
        <button class="fz-build-btn-novo" id="fz-build-novo">Jogar de novo</button>
        <button class="fz-build-btn-voltar-games" id="fz-build-voltar-games">
          Escolher outro livro
        </button>
      </div>`;

    _overlay.querySelector('#fz-build-novo').addEventListener('click', () => {
      iniciar(_ebook, _onConcluido);
    });

    _overlay.querySelector('#fz-build-voltar-games').addEventListener('click', () => {
      _fechar();
      document.dispatchEvent(new CustomEvent('buildScene:voltar'));
    });

    if (_onConcluido) _onConcluido({ acertos, total, xpGanho: xp });
  }

  // ── Utils ──────────────────────────────────────────────────────────────────

  function _fechar() {
    if (_overlay) {
      _overlay.classList.remove('visivel');
      const oldOverlay = _overlay;
      oldOverlay.style.pointerEvents = 'none'; // Previne bloqueios de clique residuais na tela de baixo
      setTimeout(() => {
          if (oldOverlay && oldOverlay.parentNode) {
              oldOverlay.parentNode.removeChild(oldOverlay);
          }
      }, 400);
      _overlay = null;
    }
  }

  return { iniciar };

})();

window.BuildSceneGame = BuildSceneGame;
