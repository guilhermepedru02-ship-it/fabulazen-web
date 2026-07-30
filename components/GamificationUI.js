/**
 * GamificationUI.js — Fabula-Zen
 * Camada visual para o sistema de gamificação.
 * Escuta os CustomEvents do GamificationEngine e renderiza:
 *   - Toast de XP ganho
 *   - Toast de Conquista desbloqueada
 *   - Modal de Level Up (celebração)
 *   - Modal de Avatar Desbloqueado
 *   - Galeria de Conquistas (acessível pelo perfil)
 */

const GamificationUI = (() => {

  // ── Toast container ────────────────────────────────────────────────────────

  let _toastContainer = null;

  function _getToastContainer() {
    if (_toastContainer && document.body.contains(_toastContainer)) return _toastContainer;
    _toastContainer = document.createElement('div');
    _toastContainer.id = 'fz-toast-container';
    document.body.appendChild(_toastContainer);
    return _toastContainer;
  }

  // ── Toast de XP ────────────────────────────────────────────────────────────

  function _mostrarToastXP(detail) {
    // Não mostra toast para XP de conquista (a conquista já tem seu toast)
    if (detail.fonte && detail.fonte.startsWith('conquista:')) return;

    const container = _getToastContainer();
    const toast = document.createElement('div');
    toast.className = 'fz-toast fz-toast-xp';

    const labels = {
      bonus_diario:      'Bônus Diário 🌟',
      quiz_perfeito:     'Quiz Perfeito!',
      quiz_parcial:      'Quiz',
      quiz_repetido:     'Quiz',
      encontre_objeto:   'Objeto Encontrado',
      montar_cena:       'Cena Montada',
      primeira_leitura:  'Nova História!',
      releitura:         'Releitura',
      memory_win:        'Jogo da Memória 🧠'
    };
    const label = labels[detail.fonte] || 'Leitura';

    toast.innerHTML = `
      <span class="fz-toast-icone">⭐</span>
      <div class="fz-toast-texto">
        <strong>+${detail.xpGanho} XP</strong>
        <span>${label}</span>
      </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('fz-toast-visivel'));

    setTimeout(() => {
      toast.classList.remove('fz-toast-visivel');
      toast.classList.add('fz-toast-saindo');
      setTimeout(() => toast.remove(), 400);
    }, 2500);
  }

  // ── Toast de Daily Cap ─────────────────────────────────────────────────────

  function _mostrarToastDailyCap() {
    // Evita duplicatas (só abre 1 toast de daily cap por vez)
    if (document.querySelector('.fz-toast-dailycap')) return;

    const container = _getToastContainer();
    const toast = document.createElement('div');
    toast.className = 'fz-toast fz-toast-dailycap';

    toast.innerHTML = `
      <span class="fz-toast-icone">🌙</span>
      <div class="fz-toast-texto">
        <strong>Missão cumprida!</strong>
        <span>Volte amanhã para mais XP!</span>
      </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('fz-toast-visivel'));

    setTimeout(() => {
      toast.classList.remove('fz-toast-visivel');
      toast.classList.add('fz-toast-saindo');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  // ── Toast de Conquista ─────────────────────────────────────────────────────

  function _mostrarToastConquista(detail) {
    const { conquista } = detail;
    const container = _getToastContainer();
    const toast = document.createElement('div');
    toast.className = 'fz-toast fz-toast-conquista';

    toast.innerHTML = `
      <span class="fz-toast-icone fz-toast-icone-conquista">${conquista.icone}</span>
      <div class="fz-toast-texto">
        <strong>Conquista Desbloqueada!</strong>
        <span>${conquista.titulo}</span>
        <span class="fz-toast-xp-bonus">+${conquista.xpBonus} XP</span>
      </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('fz-toast-visivel'));

    setTimeout(() => {
      toast.classList.remove('fz-toast-visivel');
      toast.classList.add('fz-toast-saindo');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ── Modal Queue (garante que modais apareçam um por vez) ───────────────────

  const _modalQueue = [];
  let _modalAtivo = false;

  function _enfileirarModal(criarModalFn) {
    _modalQueue.push(criarModalFn);
    if (!_modalAtivo) _processarProximoModal();
  }

  function _processarProximoModal() {
    if (_modalQueue.length === 0) { _modalAtivo = false; return; }
    _modalAtivo = true;
    const criarModal = _modalQueue.shift();
    criarModal(() => {
      // callback chamado quando o modal é fechado
      _processarProximoModal();
    });
  }

  // ── Modal de Level Up ──────────────────────────────────────────────────────

  function _mostrarLevelUp(detail) {
    _enfileirarModal((onClose) => {
      const overlay = document.createElement('div');
      overlay.id = 'fz-levelup';
      overlay.className = 'fz-gamif-overlay';

      overlay.innerHTML = `
        <div class="fz-levelup-modal">
          <div class="fz-levelup-particulas" id="fz-particulas"></div>
          <div class="fz-levelup-estrela">🌟</div>
          <h2 class="fz-levelup-titulo">Nível ${detail.nivelNovo}!</h2>
          <p class="fz-levelup-subtitulo">${detail.tituloNovo}</p>
          <p class="fz-levelup-msg">Você evoluiu! Continue lendo para desbloquear mais personagens e conquistas.</p>
          <button class="fz-btn-confirmar fz-levelup-btn" id="fz-btn-fechar-levelup">Incrível! ✨</button>
        </div>
      `;

      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('visivel'));
      _criarParticulas(overlay.querySelector('#fz-particulas'));

      overlay.querySelector('#fz-btn-fechar-levelup').addEventListener('click', () => {
        overlay.classList.remove('visivel');
        overlay.classList.add('saindo');
        setTimeout(() => { overlay.remove(); onClose(); }, 400);
      });
    });
  }

  function _criarParticulas(container) {
    const cores = ['#D4AF37', '#FFD700', '#FFA500', '#FF6347', '#9B59B6', '#3498DB', '#2ECC71'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'fz-particula';
      p.style.left = `${Math.random() * 100}%`;
      p.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
      p.style.animationDelay = `${Math.random() * 0.6}s`;
      p.style.animationDuration = `${1 + Math.random() * 1.5}s`;
      container.appendChild(p);
    }
  }

  // ── Modal de Avatar Desbloqueado ───────────────────────────────────────────

  function _mostrarAvatarDesbloqueado(detail) {
    const { avatar } = detail;

    _enfileirarModal((onClose) => {
      const overlay = document.createElement('div');
      overlay.className = 'fz-gamif-overlay';

      const renderAvatar = _renderAvatarHTML(avatar);

      const mensagens = {
        'maya':    'Olá, aventureiro! Eu sou Maya. Vamos explorar muitas histórias juntos! 🤎',
        'saci':    'Ê! Agora eu sou seu companheiro de travessuras e aventuras! 🌀',
        'luna':    'As estrelas disseram que você viria... Vamos explorar juntos! 🌙',
        'davi':    'Um novo explorador apareceu! Vamos desbravar novos mundos! 🧭',
        'bia':     'Que curiosidade incrível a sua! Vamos descobrir mais histórias! 🔮',
        'kaua':    'Você é digno de ser um guardião! Juntos protegeremos as histórias! 🌿',
        'isis':    'A sabedoria se revela para quem lê com o coração! 📜',
        'pedro':   'Um verdadeiro herói corajoso! Nenhum desafio nos deterá! ⚔️',
        'caipora': 'Você provou ser um verdadeiro herói do folclore! Que a floresta te guie! 🌿✨',
        'flipflip': 'Os sonhos de mil crianças te trouxeram até aqui... Que jornada incrível! 🐻✨',
        'pipoca':  'Você devorou histórias e conquistou seu lugar entre os leitores! 🌟',
        'cuca':    'Hahaha! Magia e misteriosas lendas nos aguardam nesta jornada! 🐊✨'
      };

      const raridadeLabels = {
        'lendario': { texto: '✨ Lendário', classe: 'fz-raridade-lendario' },
        'raro':     { texto: '⚡ Raro',    classe: 'fz-raridade-raro' },
        'comum':    { texto: '🍃 Comum',   classe: 'fz-raridade-comum' }
      };
      const raridade = raridadeLabels[avatar.raridade] || null;
      const raridadeBadge = raridade
        ? `<span class="fz-raridade-badge ${raridade.classe}">${raridade.texto}</span>`
        : '';

      // Cor do glow por raridade
      const glowColors = {
        lendario: 'rgba(212, 175, 55, 0.5)',
        raro:     'rgba(80, 120, 255, 0.4)',
        comum:    'rgba(60, 180, 100, 0.3)'
      };
      const glowColor = glowColors[avatar.raridade] || glowColors.comum;

      overlay.innerHTML = `
        <div class="fz-avatar-unlock-modal fz-avatar-unlock-${avatar.raridade || 'comum'}">
          <div class="fz-avatar-unlock-glow" style="background: radial-gradient(circle, ${glowColor} 0%, transparent 70%);"></div>
          ${raridadeBadge}
          <div class="fz-avatar-unlock-avatar">${renderAvatar}</div>
          <h2 class="fz-avatar-unlock-nome">${avatar.nome} Desbloqueado!</h2>
          <p class="fz-avatar-unlock-msg">${mensagens[avatar.id] || 'Um novo amigo se juntou à sua jornada!'}</p>
          <button class="fz-btn-confirmar fz-avatar-unlock-btn fz-avatar-unlock-btn-${avatar.raridade || 'comum'}">Conhecer ${avatar.nome} 🎉</button>
        </div>
      `;

      document.body.appendChild(overlay);
      requestAnimationFrame(() => overlay.classList.add('visivel'));

      overlay.querySelector('.fz-avatar-unlock-btn').addEventListener('click', () => {
        overlay.classList.remove('visivel');
        overlay.classList.add('saindo');
        setTimeout(() => { overlay.remove(); onClose(); }, 400);
      });
    });
  }

  // ── Render helper (duplicated from AvatarSystem to avoid circular deps) ───

  function _renderAvatarHTML(av, options = {}) {
    if (!av) return '<div class="fz-avatar-vazio"></div>';
    const raridadeClass = av.raridade ? `fz-avatar-raridade-${av.raridade}` : '';
    if (av.render === 'svg') return `<div class="fz-avatar-wrap ${raridadeClass}">${av.svg}</div>`;
    if (av.render === 'img') return `<img class="fz-avatar-wrap ${raridadeClass}" src="${av.src}" alt="${av.nome}" style="width:96px;height:96px;object-fit:contain;border-radius:50%"/>`;
    return '<div class="fz-avatar-wrap fz-avatar-vazio"></div>';
  }

  // ── Galeria de Conquistas ──────────────────────────────────────────────────

  function abrirGaleriaConquistas() {
    const conquistas = GamificationEngine.getConquistasDefinidas();

    const overlay = document.createElement('div');
    overlay.id = 'fz-conquistas';
    overlay.className = 'fz-gamif-overlay';

    const cards = conquistas.map(c => {
      const dataStr = c.data
        ? new Date(c.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
        : '';
      return `
        <div class="fz-conquista-card ${c.desbloqueada ? 'fz-conquista-desbloqueada' : 'fz-conquista-bloqueada'}">
          <span class="fz-conquista-icone">${c.desbloqueada ? c.icone : '🔒'}</span>
          <div class="fz-conquista-info">
            <strong>${c.titulo}</strong>
            ${c.desbloqueada ? `<span class="fz-conquista-data">${dataStr}</span>` : '<span class="fz-conquista-bonus">+' + c.xpBonus + ' XP</span>'}
          </div>
        </div>
      `;
    }).join('');

    overlay.innerHTML = `
      <div class="fz-onboarding-modal" role="dialog" aria-modal="true" aria-label="Conquistas">
        <button class="fz-btn-fechar" id="fz-btn-fechar-conquistas" aria-label="Fechar conquistas">✕</button>
        <div class="fz-conquistas-topo">
          <h2 class="fz-onboarding-titulo">🏆 Conquistas</h2>
          <p class="fz-onboarding-sub">${conquistas.filter(c => c.desbloqueada).length} de ${conquistas.length} desbloqueadas</p>
        </div>
        <div class="fz-conquista-grid">${cards}</div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visivel'));

    overlay.querySelector('#fz-btn-fechar-conquistas').addEventListener('click', () => {
      overlay.classList.remove('visivel');
      overlay.classList.add('saindo');
      setTimeout(() => overlay.remove(), 400);
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('visivel');
        overlay.classList.add('saindo');
        setTimeout(() => overlay.remove(), 400);
      }
    });
  }

  // ── Init (bind events) ────────────────────────────────────────────────────

  function init() {
    document.addEventListener('gamification:xpGanho',           (e) => _mostrarToastXP(e.detail));
    document.addEventListener('gamification:conquista',          (e) => _mostrarToastConquista(e.detail));
    document.addEventListener('gamification:nivelUp',            (e) => _mostrarLevelUp(e.detail));
    document.addEventListener('gamification:avatarDesbloqueado', (e) => _mostrarAvatarDesbloqueado(e.detail));
    document.addEventListener('gamification:dailyCap',           ()  => _mostrarToastDailyCap());
    console.log('🎨 [GamificationUI] Inicializado v2.0 — com Daily Cap, Raridade e Mensagens Lendárias');
  }

  // ── Public ────────────────────────────────────────────────────────────────
  return { init, abrirGaleriaConquistas };

})();

window.GamificationUI = GamificationUI;
