/**
 * QuizMiniGame.js — Fabula-Zen (atualizado)
 *
 * MUDANÇA PRINCIPAL: O quiz agora é ESTÁTICO por padrão.
 * Lê as perguntas do campo `quiz.perguntas` do inventory.json.
 * Só chama o Gemini dinamicamente se o quiz não estiver pré-gerado.
 *
 * Isso reduz o consumo de tokens do Gemini de:
 *   ANTES: 1 chamada por criança por quiz (escala com usuários)
 *   DEPOIS: 0 chamadas (quiz já está no inventory.json)
 *
 * INTEGRAÇÃO:
 *   Nenhuma mudança na forma como o Reader.js chama o QuizMiniGame.
 *   A troca é transparente — a interface e o XP funcionam igual.
 *
 *   QuizMiniGame.iniciar(ebook, onConcluido)
 *     ebook       → objeto do inventory.json (já carregado pelo app)
 *     onConcluido → callback com { acertos, total, xpGanho }
 */

const QuizMiniGame = (() => {

  // ── Config ─────────────────────────────────────────────────────────────────
  const XP_TUDO_CERTO  = 50;
  const XP_METADE_MAIS = 20;
  const TOTAL_PERGUNTAS = 5;

  // ── Estado ─────────────────────────────────────────────────────────────────
  let _ebook        = null;
  let _perguntas    = [];
  let _atual        = 0;
  let _acertos      = 0;
  let _onConcluido  = null;
  let _overlay      = null;
  let _jaNotificado = false;

  // ── API pública ────────────────────────────────────────────────────────────

  async function iniciar(ebook, onConcluido) {
    _ebook       = ebook;
    _onConcluido = onConcluido;
    _atual       = 0;
    _acertos     = 0;
    _jaNotificado = false;

    _mostrarCarregando();

    try {
      _perguntas = await _obterPerguntas(ebook);
      if (!_perguntas || _perguntas.length === 0) {
        throw new Error("Nenhuma pergunta disponível para este livro.");
      }
      _renderizarPergunta();
    } catch (err) {
      console.error('[QuizMiniGame] Erro ao carregar perguntas:', err);
      _mostrarErro('Não foi possível carregar o quiz. Tente novamente.');
    }
  }

  // ── Obtenção de perguntas — estático primeiro, dinâmico como fallback ──────

  async function _obterPerguntas(ebook) {

    // ── CAMINHO 1: Quiz pré-gerado no inventory.json (custo zero) ────────────
    if (ebook.quiz && Array.isArray(ebook.quiz.perguntas) && ebook.quiz.perguntas.length > 0) {
      console.log('[QuizMiniGame] Usando quiz estático do inventory.json');
      return _embaralharOpcoes(ebook.quiz.perguntas);
    }

    // ── CAMINHO 2: Geração dinâmica via Gemini (fallback) ────────────────────
    // Só chega aqui se o ebook não tiver quiz pré-gerado.
    // Isso não deveria acontecer em produção após o pipeline n8n ser atualizado.
    console.warn('[QuizMiniGame] Quiz estático não encontrado — gerando dinamicamente via Gemini.');
    return await _gerarDinamicamente(ebook);
  }

  async function _gerarDinamicamente(ebook) {
    const textoCompleto = (ebook.storyPages || [])
      .map(p => `Página ${p.numero}: ${p.text}`)
      .join('\n\n');

    const prompt = `Você é um educador especialista em literatura infantil.

Baseado na história abaixo, crie exatamente ${TOTAL_PERGUNTAS} perguntas de múltipla escolha para crianças de 4 a 10 anos.

História: "${ebook.titulo}"
${textoCompleto}

REGRAS:
- Linguagem simples, adequada para crianças
- Cada pergunta tem exatamente 3 opções (A, B, C)
- Apenas uma opção é correta
- Inclua uma explicação curta e encorajadora para a resposta correta

Responda SOMENTE com JSON válido neste formato:
{
  "perguntas": [
    {
      "id": 1,
      "pergunta": "texto da pergunta?",
      "opcoes": ["opção A", "opção B", "opção C"],
      "correta": 0,
      "explicacao": "Muito bem! Explicação curta."
    }
  ]
}`;

    // Chama o proxy seguro do backend (chaves nunca saem do servidor)
    const bridgeUrl = `http://${window.location.hostname}:5000/api/gemini/generate`;
    const res = await fetch(bridgeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
      throw new Error(`Proxy retornou erro ${res.status}`);
    }

    const data = await res.json();
    const resposta = (data.text || '').trim();

    // Extração robusta de JSON
    let texto = resposta.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();
    const inicio = texto.indexOf('{');
    const fim    = texto.lastIndexOf('}');
    if (inicio === -1 || fim === -1) throw new Error('JSON não encontrado na resposta');
    const dados = JSON.parse(texto.substring(inicio, fim + 1));

    return _embaralharOpcoes(dados.perguntas || []);
  }

  // Embaralha a ordem das perguntas a cada sessão para variação
  function _embaralharOpcoes(perguntas) {
    return [...perguntas].sort(() => Math.random() - 0.5);
  }

  // ── Renderização ───────────────────────────────────────────────────────────

  function _mostrarCarregando() {
    _overlay = document.createElement('div');
    _overlay.id = 'fz-quiz-overlay';
    _overlay.innerHTML = `
      <div class="book-wrap" style="justify-content:center;align-items:center;">
        <h2 style="font-family:'Cinzel',serif;color:#8b5e2e;">Preparando quiz...</h2>
      </div>`;
    document.body.appendChild(_overlay);
    requestAnimationFrame(() => _overlay.classList.add('visivel'));
  }

  function _renderizarPergunta() {
    const q   = _perguntas[_atual];
    const num = _atual + 1;
    const tot = _perguntas.length;
    const letras = ['A','B','C'];

    _overlay.innerHTML = `
      <div class="book-wrap" id="book">
        <button id="fz-quiz-close" class="btn-fechar">&times;</button>
        <div class="book-img-container">
          <div class="book-img-bg" style="background-image: url('${_ebook.capaUrl || ''}')"></div>
          <div class="book-image" id="book-img">
            <div class="brand-panel" id="brand-panel">
              <div class="feedback-icon" id="feedback-icon"></div>
              <div class="brand-text" id="brand-text">Fabula-Zen</div>
              <div class="brand-sub" id="brand-sub">Quiz do Ebook</div>
            </div>
          </div>
        </div>
        <div class="book-content" id="book-right">
          <div id="quiz-area">
            <div class="location-tag">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${_ebook.categoria || 'Desafio Zen'}</span>
            </div>
            <div class="question-num" id="q-num">Pergunta ${num} de ${tot}</div>
            <div id="q-title-container" style="min-height: 80px; transition: height 0.3s ease;">
                <h2 class="question-title" id="q-title">${q.pergunta}</h2>
            </div>
            <div class="options-list" id="options">
              ${q.opcoes.map((op, i) => `
                <div class="option" data-idx="${i}">
                  <span class="option-letter">${letras[i]}</span> ${op}
                </div>
              `).join('')}
            </div>
            <div class="question-explanation" id="fz-quiz-feedback"></div>
          </div>

          <div class="book-footer">
            <div class="dots" id="dots">
              ${Array.from({length: tot}).map((_, i) => `<div class="dot ${i === _atual ? 'active' : ''}"></div>`).join('')}
            </div>
            <button class="btn-next" id="fz-quiz-prox" disabled>Próximo</button>
          </div>
        </div>
      </div>
    `;

    _overlay.querySelector('#fz-quiz-close').addEventListener('click', _fechar);

    // Tipografia Zen: Balancear Título da Pergunta
    if (window.LayoutEngine) {
        const titleEl = _overlay.querySelector('#q-title');
        const containerEl = _overlay.querySelector('#q-title-container');
        
        // Mede e trava a altura para evitar saltos
        const height = LayoutEngine.predictHeight(q.pergunta, containerEl.clientWidth || 400, "bold 22px 'Nunito'");
        containerEl.style.height = `${height}px`;
        
        LayoutEngine.renderBalancedTitle(q.pergunta, titleEl, "bold 22px 'Nunito'");
    }

    _overlay.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => _responder(parseInt(btn.dataset.idx), q, btn));
    });
  }

  function _responder(idxEscolhido, questao, elClicked) {
    if (_overlay.querySelector('.option.correct')) return; // Já respondeu

    const correto = idxEscolhido === questao.correta;
    if (correto) _acertos++;

    const allOpts = _overlay.querySelectorAll('.option');
    allOpts[questao.correta].classList.add('correct');

    const brandText = _overlay.querySelector('#brand-text');
    const brandSub = _overlay.querySelector('#brand-sub');
    const feedbackIcon = _overlay.querySelector('#feedback-icon');
    const bookImg = _overlay.querySelector('#book-img');
    const btnProx = _overlay.querySelector('#fz-quiz-prox');
    const feedbackText = _overlay.querySelector('#fz-quiz-feedback');

    if (correto) {
      bookImg.style.backgroundColor = 'rgba(10,31,10,0.85)';
      feedbackIcon.textContent = '🌟';
      feedbackIcon.style.display = 'block';
      brandText.textContent = 'Parabéns!';
      brandText.style.color = '#7fe87f';
      brandText.style.textShadow = '0 0 12px rgba(100,230,100,0.6), 0 0 30px rgba(100,230,100,0.3), 2px 2px 0px #1a5a1a, 4px 4px 0px #0a3a0a';
      brandSub.textContent = 'Resposta correta!';
      brandSub.style.opacity = '1';

      feedbackText.className = 'question-explanation correct-exp';
      feedbackText.innerHTML = `⭐ <strong>Isso aí!</strong> ${questao.explicacao}`;
    } else {
      elClicked.classList.add('wrong');
      bookImg.style.backgroundColor = 'rgba(31,10,10,0.85)';
      feedbackIcon.textContent = '💔';
      feedbackIcon.style.display = 'block';
      brandText.textContent = 'Puxa...';
      brandText.style.color = '#f57878';
      brandText.style.textShadow = '0 0 12px rgba(245,120,120,0.6), 0 0 30px rgba(245,120,120,0.3), 2px 2px 0px #8a1a1a, 4px 4px 0px #5a0a0a';
      brandSub.textContent = 'Tente a próxima!';
      brandSub.style.opacity = '1';

      feedbackText.className = 'question-explanation wrong-exp';
      feedbackText.innerHTML = `💡 A resposta certa era <strong>${questao.opcoes[questao.correta]}</strong>. ${questao.explicacao}`;
    }

    feedbackText.style.display = 'block';
    
    if (_atual < _perguntas.length - 1) {
      btnProx.textContent = 'Próximo';
    } else {
      btnProx.textContent = 'Ver Resultado';
    }
    btnProx.disabled = false;
    btnProx.addEventListener('click', _avancar);
  }

  function _avancar() {
    _atual++;
    if (_atual < _perguntas.length) {
      _renderizarPergunta();
    } else {
      _mostrarResultado();
    }
  }

  function _mostrarResultado() {
    const total = _perguntas.length;
    const xp = _acertos === total ? XP_TUDO_CERTO
             : _acertos >= Math.ceil(total / 2) ? XP_METADE_MAIS
             : 0;

    _overlay.innerHTML = `
      <div class="book-wrap" id="book">
        <button id="fz-quiz-close" class="btn-fechar">&times;</button>
        <div class="book-img-container">
          <div class="book-img-bg" style="background-image: url('${_ebook.capaUrl || ''}')"></div>
          <div class="book-image" id="book-img" style="background-color: rgba(0,0,0,0.7);">
            <div class="brand-panel">
              <div class="brand-text" style="color:#f5c518; text-shadow:0 0 12px rgba(245,197,24,0.6), 2px 2px 0px #8a6c00;">Fabula-Zen</div>
              <div class="brand-sub">Quiz Concluído!</div>
            </div>
          </div>
        </div>
        <div class="book-content result-view" style="justify-content: center;">
          <div class="location-tag" style="justify-content:center;margin-bottom:1rem;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${_ebook.titulo}
          </div>
          <h2>Você terminou o quiz!</h2>
          <div class="result-score">${_acertos}/${total}</div>
          <p>${_acertos === total ? 'Perfeito! Você conhece bem a história!' : _acertos >= Math.ceil(total / 2) ? 'Muito bem! Você prestou bastante atenção.' : 'Que tal reler o ebook e tentar novamente?'}</p>
          ${xp > 0 ? `<p style="font-weight:bold;color:#5a8a4a;font-size:18px;">+${xp} XP Ganhos!</p>` : ''}
          <div style="margin-top: 1.5rem; display: flex; justify-content: center;">
            <button class="btn-restart" id="fz-quiz-novo">Jogar de novo</button>
            <button class="btn-close" id="fz-quiz-fechar">Voltar</button>
          </div>
        </div>
      </div>
    `;

    _overlay.querySelector('#fz-quiz-close').addEventListener('click', _fechar);

    _overlay.querySelector('#fz-quiz-novo').addEventListener('click', () => {
      iniciar(_ebook, _onConcluido);
    });

    _overlay.querySelector('#fz-quiz-fechar').addEventListener('click', () => {
      _fechar();
    });

    // Notifica o GamificationEngine (com dados de acerto)
    if (_onConcluido) {
        _onConcluido({ acertos: _acertos, total, xpGanho: xp });
        _jaNotificado = true;
    }
  }

  function _mostrarErro(msg) {
    if (_overlay) {
      _overlay.innerHTML = `
        <div class="book-wrap" style="justify-content:center;align-items:center;flex-direction:column;">
          <button id="fz-quiz-close" class="btn-fechar">&times;</button>
          <h2 style="font-family:'Cinzel',serif;color:#a03030;margin-bottom:1rem;">Ops!</h2>
          <p style="font-family:'Nunito',sans-serif;font-weight:bold;">${msg}</p>
          <button class="btn-close" id="fz-quiz-fechar-erro" style="margin-top:2rem;">Fechar</button>
        </div>`;
      _overlay.querySelector('#fz-quiz-fechar-erro').addEventListener('click', _fechar);
      _overlay.querySelector('#fz-quiz-close').addEventListener('click', _fechar);
    }
  }

  function _fechar() {
    if (_overlay) {
      _overlay.classList.remove('visivel');
      setTimeout(() => {
        _overlay?.remove();
        _overlay = null;
        // Notifica o app.js para voltar à estante apenas se ainda não navegamos
        if (_onConcluido && !_jaNotificado) {
            _onConcluido();
            _jaNotificado = true;
        }
      }, 350);
    }
  }

  return { iniciar };

})();

window.QuizMiniGame = QuizMiniGame;
export { QuizMiniGame };
