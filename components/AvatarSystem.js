/**
 * AvatarSystem.js — Fabula-Zen
 * Sistema de avatar com suporte a múltiplos formatos de renderização.
 *
 * Formatos suportados (campo render no avatarData.js):
 *   'svg'    → SVG inline  (atual)
 *   'img'    → <img src>   (para PNGs/WEBPs gerados por IA ou 3D renderizado)
 *   'sprite' → sprite sheet (para animações futuras)
 *
 * Para trocar o estilo de todos os avatares:
 *   1. Edite apenas o avatarData.js
 *   2. Este arquivo não precisa ser alterado
 */

const AvatarSystem = (() => {

  // ── Storage ────────────────────────────────────────────────────────────────
  let STORAGE_KEY = 'fz_perfil_anon';
  let dbClient = null;
  let userId = null;

  function getPerfil() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch (_) { return null; }
  }

  function salvarPerfil(perfil) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
    _syncPerfilNuvem(perfil);
  }

  async function _syncPerfilNuvem(perfil) {
    if (!dbClient || !userId) return;
    try {
      const { error } = await dbClient.from('profiles').update({
        display_name: perfil.nome,
        current_avatar_id: perfil.avatarId
      }).eq('user_id', userId);
      if (error) console.error('☁️ [Avatar Sync] Erro no Supabase:', error.message);
    } catch(err) {
      console.error('☁️ [Avatar Sync] Falha ao sincronizar:', err);
    }
  }

  function perfilExiste() {
    const p = getPerfil();
    return p && p.nome && p.avatarId;
  }

  // ── Render strategy ────────────────────────────────────────────────────────
  // Único lugar que sabe como renderizar cada formato.
  // Adicione novos formatos aqui sem tocar no resto do código.

  function _getAssetUrl(url) {
    if (url && url.startsWith('assets/')) {
        return "https://auhamseeqdpoatwnyxwl.supabase.co/storage/v1/object/public/fabula-assets/" + url;
    }
    return url;
  }

  function _renderAvatar(av, tamanho = 'md') {
    if (!av) return '<div class="fz-avatar-vazio"></div>';

    const isMenu = tamanho === 'sm';
    const sizes = { sm: '75px', md: '100px', lg: '140px' };
    const sz = sizes[tamanho] || sizes.md;
    const raridade = av.raridade || 'comum';

    if (isMenu) {
      // Medalhão circular elegante para o Menu
      return `
        <div class="fz-avatar-medallion raridade-${raridade}" style="width:${sz}; height:${sz};">
            ${av.render === 'svg' ? av.svg : `<img src="${_getAssetUrl(av.src)}" alt="${av.nome}" />`}
        </div>`;
    }

    // Card de Baralho Mágico para o Perfil/Onboarding
    let innerContent = '';
    if (av.render === 'svg') {
      innerContent = av.svg;
    } else if (av.render === 'img') {
      innerContent = `<img src="${_getAssetUrl(av.src)}" alt="${av.nome}" style="${av.transform || ''}" />`;
    } else if (av.render === 'sprite') {
      innerContent = `<div style="width:100%;height:100%;background:url('${_getAssetUrl(av.sheet)}') -${av.x}px -${av.y}px;"></div>`;
    }

    return `
      <div class="fz-avatar-magic-card raridade-${raridade} t-${tamanho}">
        <div class="fz-avatar-aura"></div>
        <div class="fz-avatar-stage">
          ${innerContent}
        </div>
      </div>`;
  }

  // ── Helpers de lista ───────────────────────────────────────────────────────

  function _avaturesAtivos() {
    return (window.AVATARES || []).filter(a => !a.aposentado && !a.draft);
  }

  function _avataresDesbloqueados() {
    const ativos = _avaturesAtivos();
    if (!window.GamificationEngine) return ativos;
    return ativos.filter(a => GamificationEngine.isAvatarDesbloqueado(a.id));
  }

  function _isAvatarDesbloqueado(id) {
    if (!window.GamificationEngine) return true;
    return GamificationEngine.isAvatarDesbloqueado(id);
  }

  function _encontrarAvatar(id) {
    const todos = window.AVATARES || [];
    return todos.find(a => a.id === id) || _avaturesAtivos()[0] || null;
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  async function init(supabaseClient, authUserId) {
    dbClient = supabaseClient;
    userId = authUserId;
    STORAGE_KEY = userId ? `fz_perfil_${userId}` : 'fz_perfil_anon';

    if (dbClient && userId) {
      try {
        console.log('☁️ [Avatar Sync] Baixando perfil da nuvem...');
        const { data, error } = await dbClient
            .from('profiles')
            .select('display_name, current_avatar_id')
            .eq('user_id', userId)
            .single();

        if (!error && data && data.display_name) {
           // Nuvem tem dados válidos
           const avatarIdValido = (data.current_avatar_id && data.current_avatar_id !== 'comum_1')
              ? data.current_avatar_id : 'maya';
           localStorage.setItem(STORAGE_KEY, JSON.stringify({
              nome: data.display_name,
              avatarId: avatarIdValido,
              criadoEm: new Date().toISOString()
           }));
           console.log('☁️ [Avatar Sync] Perfil carregado da nuvem:', data.display_name);
        } else {
           console.log('☁️ [Avatar Sync] Nuvem sem perfil configurado. Onboarding será exibido.');
        }
      } catch (err) {
        console.warn('⚠️ [Avatar Sync] Offline ou erro na nuvem:', err);
      }
    }

    if (!perfilExiste()) {
      _mostrarOnboarding();
    } else {
      // Garante fallback se o avatar salvo foi aposentado
      const perfil = getPerfil();
      const av = _encontrarAvatar(perfil.avatarId);
      if (av && av.aposentado) {
        const ativo = _avaturesAtivos()[0];
        if (ativo) {
          perfil.avatarId = ativo.id;
          salvarPerfil(perfil);
        }
      }
      _injetarAvatarNoMenu();
    }
  }

  // ── Onboarding ─────────────────────────────────────────────────────────────

  let onboardingAberto = false;
  function _mostrarOnboarding() {
    if (onboardingAberto) return;
    onboardingAberto = true;

    const overlay = document.createElement('div');
    overlay.id = 'fz-onboarding';
    overlay.innerHTML = _templateOnboarding();
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visivel'));
    _bindOnboarding(overlay);
  }

  function _renderAvatarCard(av, perfilAvatarId) {
    const desbloqueado = _isAvatarDesbloqueado(av.id);
    const selecionado = av.id === perfilAvatarId;
    const dica = (!desbloqueado && window.GamificationEngine)
      ? GamificationEngine.getDicaDesbloqueio(av) : '';

    if (desbloqueado) {
      return `
        <div class="fz-avatar-card ${selecionado ? 'selecionado' : ''}" data-id="${av.id}" title="${av.nome}" tabindex="0" role="radio" aria-checked="${selecionado}">
          ${_renderAvatar(av, 'md')}
          <span class="fz-avatar-nome">${av.nome}</span>
        </div>`;
    } else {
      const dicaFormatada = dica.split('+').map(pt => {
        let icon = '✨';
        const txt = pt.trim().toLowerCase();
        if (txt.includes('nível')) icon = '⭐';
        else if (txt.includes('leia') || txt.includes('livro')) icon = '📖';
        else if (txt.includes('conquista') || txt.includes('conquiste')) icon = '🏆';
        return `<div class="fz-mission-item"><span>${icon}</span> ${pt.trim()}</div>`;
      }).join('');

      return `
        <div class="fz-avatar-card fz-avatar-locked" tabindex="0" title="${dica.replace(/\+/g, ' ')}">
          ${_renderAvatar(av, 'md')}
          <span class="fz-avatar-locked-overlay">🔒</span>
          <span class="fz-avatar-nome">${av.nome}</span>
          <div class="fz-avatar-mission-box">
             <div class="fz-mission-title">Missão de Desbloqueio</div>
             ${dicaFormatada}
          </div>
        </div>`;
    }
  }

  function _templateOnboarding() {
    const cards = _avaturesAtivos().map(av => _renderAvatarCard(av, null)).join('');

    return `
      <div class="fz-onboarding-modal" role="dialog" aria-modal="true" aria-label="Criar perfil">
        <div class="fz-onboarding-topo">
          <div class="fz-onboarding-estrelas">✦ ✦ ✦</div>
          <h2 class="fz-onboarding-titulo">Bem-vindo ao Fabula-Zen!</h2>
          <p class="fz-onboarding-sub">Antes de começar, vamos criar seu perfil de leitor</p>
        </div>

        <div class="fz-onboarding-passo" id="fz-passo-1">
          <label class="fz-label" for="fz-input-nome">Como você se chama?</label>
          <input class="fz-input" id="fz-input-nome" type="text"
            placeholder="Digite seu nome..." maxlength="20" autocomplete="off"/>
          <button class="fz-btn-proximo" id="fz-btn-proximo" disabled>Próximo →</button>
        </div>

        <div class="fz-onboarding-passo fz-oculto" id="fz-passo-2">
          <p class="fz-label">Escolha seu aventureiro</p>
          <div class="fz-avatar-grid" role="radiogroup">${cards}</div>
          <button class="fz-btn-confirmar fz-oculto" id="fz-btn-confirmar">
            Começar a ler!
          </button>
        </div>
      </div>
    `;
  }

  function _bindOnboarding(overlay) {
    const inputNome    = overlay.querySelector('#fz-input-nome');
    const btnProximo   = overlay.querySelector('#fz-btn-proximo');
    const passo1       = overlay.querySelector('#fz-passo-1');
    const passo2       = overlay.querySelector('#fz-passo-2');
    const btnConfirmar = overlay.querySelector('#fz-btn-confirmar');
    let avatarSelecionado = null;

    inputNome.addEventListener('input', () => {
      btnProximo.disabled = inputNome.value.trim().length < 2;
    });

    inputNome.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !btnProximo.disabled) btnProximo.click();
    });

    btnProximo.addEventListener('click', () => {
      passo1.classList.add('fz-oculto');
      passo2.classList.remove('fz-oculto');
    });

    overlay.querySelectorAll('.fz-avatar-card').forEach(card => {
      const selecionar = () => {
        overlay.querySelectorAll('.fz-avatar-card').forEach(c => {
          c.classList.remove('selecionado');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('selecionado');
        card.setAttribute('aria-checked', 'true');
        avatarSelecionado = card.dataset.id;
        btnConfirmar.classList.remove('fz-oculto');
      };
      card.addEventListener('click', selecionar);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') selecionar(); });
    });

    btnConfirmar.addEventListener('click', () => {
      if (!avatarSelecionado) return;
      const perfil = {
        nome:     inputNome.value.trim(),
        avatarId: avatarSelecionado,
        criadoEm: new Date().toISOString()
      };
      salvarPerfil(perfil);
      _fecharOverlay(overlay);
      _injetarAvatarNoMenu();
      document.dispatchEvent(new CustomEvent('avatarSystem:perfilCriado', { detail: perfil }));
    });
  }

  // ── Perfil ─────────────────────────────────────────────────────────────────

  function abrirPerfil() {
    const perfil = getPerfil();
    if (!perfil) { _mostrarOnboarding(); return; }

    const overlay = document.createElement('div');
    overlay.id = 'fz-perfil';
    overlay.innerHTML = _templatePerfil(perfil);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visivel'));
    _bindPerfil(overlay, perfil);
  }

  function _templatePerfil(perfil) {
    const avatarAtual = _encontrarAvatar(perfil.avatarId);
    const cards = _avaturesAtivos().map(av => _renderAvatarCard(av, perfil.avatarId)).join('');

    // Gamificação: dados de XP e nível
    let xpSection = '';
    let tituloNivel = 'Leitor Iniciante';
    if (window.GamificationEngine) {
      const estado = GamificationEngine.getEstado();
      tituloNivel = estado.tituloNivel;
      const xpLabel = estado.xpParaProximoNivel
        ? `${estado.xp} / ${estado.xpParaProximoNivel} XP`
        : `${estado.xp} XP (Nível Máximo)`;
      const progresso = Math.min(estado.progresso, 100);
      xpSection = `
        <div class="fz-xp-section">
          <div class="fz-xp-header">
            <span class="fz-xp-label">Progresso para próximo nível</span>
            <span class="fz-xp-valor">${xpLabel}</span>
          </div>
          <div class="fz-xp-bar-bg">
            <div class="fz-xp-bar-fill" style="width: ${progresso}%"></div>
          </div>
        </div>`;
    }

    return `
      <div class="fz-onboarding-modal" role="dialog" aria-modal="true" aria-label="Meu perfil">
        <button class="fz-btn-fechar" id="fz-btn-fechar-perfil" aria-label="Fechar perfil">✕</button>

        <div class="fz-perfil-topo">
          <div class="fz-perfil-avatar-grande" id="fz-preview-avatar">
            ${_renderAvatar(avatarAtual, 'lg')}
          </div>
          <div class="fz-perfil-info">
            <div class="fz-perfil-nome-container">
                <h2 class="fz-perfil-nome" id="fz-display-name">${perfil.nome}</h2>
                <button class="fz-btn-edit-nome" id="fz-btn-edit-nome" title="Editar Nome">
                    <i data-lucide="pencil"></i>
                </button>
            </div>
            <span class="fz-perfil-badge">${tituloNivel}</span>
          </div>
        </div>

        ${xpSection}

        <button class="fz-btn-conquistas" id="fz-btn-conquistas">🏆 Minhas Conquistas</button>

        <div class="fz-perfil-secao">
          <p class="fz-label">Trocar aventureiro</p>
          <div class="fz-avatar-grid" role="radiogroup">${cards}</div>
        </div>

        <button class="fz-btn-confirmar" id="fz-btn-salvar-perfil">
          Salvar alterações
        </button>
      </div>
    `;
  }

  function _bindPerfil(overlay, perfil) {
    let avatarSelecionado = perfil.avatarId;
    let nomeAtual = perfil.nome;

    overlay.querySelector('#fz-btn-fechar-perfil').addEventListener('click', () => _fecharOverlay(overlay));
    overlay.addEventListener('click', e => { if (e.target === overlay) _fecharOverlay(overlay); });

    // Lógica de edição de nome (inline pergaminho)
    const btnEdit = overlay.querySelector('#fz-btn-edit-nome');
    const displayNome = overlay.querySelector('#fz-display-name');
    const nomeContainer = overlay.querySelector('.fz-perfil-nome-container');
    let editando = false;

    function _abrirEdicaoNome() {
        if (editando) return;
        editando = true;

        // Esconde nome e botão de editar
        displayNome.style.display = 'none';
        btnEdit.style.display = 'none';

        // Cria o container de edição estilo pergaminho
        const editBox = document.createElement('div');
        editBox.className = 'fz-edit-nome-pergaminho';
        editBox.innerHTML = `
            <input type="text" class="fz-input-nome-pergaminho" value="${nomeAtual}" maxlength="20" spellcheck="false" aria-label="Novo nome do aventureiro" />
            <div class="fz-edit-nome-acoes">
                <button class="fz-edit-nome-confirmar" title="Confirmar" aria-label="Confirmar nome">✓</button>
                <button class="fz-edit-nome-cancelar" title="Cancelar" aria-label="Cancelar edição">✕</button>
            </div>
        `;
        nomeContainer.appendChild(editBox);

        const inputNome = editBox.querySelector('.fz-input-nome-pergaminho');
        const btnConfirmar = editBox.querySelector('.fz-edit-nome-confirmar');
        const btnCancelar = editBox.querySelector('.fz-edit-nome-cancelar');

        // Foca e seleciona o texto
        requestAnimationFrame(() => {
            inputNome.focus();
            inputNome.select();
        });

        function confirmar() {
            const val = inputNome.value.trim();
            if (val.length >= 2) {
                nomeAtual = val;
                displayNome.textContent = nomeAtual;
            }
            fecharEdicao();
        }

        function fecharEdicao() {
            editBox.classList.add('fz-edit-nome-saindo');
            editBox.addEventListener('animationend', () => {
                editBox.remove();
                displayNome.style.display = '';
                btnEdit.style.display = '';
                editando = false;
            }, { once: true });
        }

        btnConfirmar.addEventListener('click', confirmar);
        btnCancelar.addEventListener('click', fecharEdicao);
        inputNome.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') confirmar();
            if (e.key === 'Escape') fecharEdicao();
        });
    }

    btnEdit.addEventListener('click', _abrirEdicaoNome);

    // Botão de conquistas
    const btnConquistas = overlay.querySelector('#fz-btn-conquistas');
    if (btnConquistas && window.GamificationUI) {
      btnConquistas.addEventListener('click', () => GamificationUI.abrirGaleriaConquistas());
    }

    // Apenas cards desbloqueados são selecionáveis (não possuem classe fz-avatar-locked)
    overlay.querySelectorAll('.fz-avatar-card:not(.fz-avatar-locked)').forEach(card => {
      const selecionar = () => {
        overlay.querySelectorAll('.fz-avatar-card').forEach(c => {
          c.classList.remove('selecionado');
          c.setAttribute('aria-checked', 'false');
        });
        card.classList.add('selecionado');
        card.setAttribute('aria-checked', 'true');
        avatarSelecionado = card.dataset.id;

        // Preview em tempo real
        const novoAv = _encontrarAvatar(avatarSelecionado);
        const preview = overlay.querySelector('#fz-preview-avatar');
        if (novoAv && preview) preview.innerHTML = _renderAvatar(novoAv, 'lg');
      };
      card.addEventListener('click', selecionar);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') selecionar(); });
    });

    overlay.querySelector('#fz-btn-salvar-perfil').addEventListener('click', () => {
      const novoPerfil = { ...perfil, nome: nomeAtual, avatarId: avatarSelecionado };
      salvarPerfil(novoPerfil);
      _injetarAvatarNoMenu();
      _fecharOverlay(overlay);
      document.dispatchEvent(new CustomEvent('avatarSystem:perfilAtualizado', { detail: novoPerfil }));
    });

    // Inicializa ícones Lucide no perfil
    if (window.lucide) window.lucide.createIcons({ root: overlay });
  }

  // ── Menu avatar ────────────────────────────────────────────────────────────

  function _injetarAvatarNoMenu() {
    const perfil = getPerfil();
    if (!perfil) return;
    const av = _encontrarAvatar(perfil.avatarId);
    if (!av) return;

    document.getElementById('fz-menu-avatar')?.remove();

    const btn = document.createElement('button');
    btn.id = 'fz-menu-avatar';
    btn.setAttribute('aria-label', `Perfil de ${perfil.nome}`);
    btn.title = perfil.nome;
    btn.style.cssText = `
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      width: 75px;
      height: 75px;
      flex-shrink: 0;
    `;
    btn.innerHTML = _renderAvatar(av, 'sm');
    btn.addEventListener('click', abrirPerfil);

    const targetContainer = document.querySelector('.header-spacer') || document.querySelector('header, .header, nav, .nav, #header');
    if (targetContainer) {
      if (targetContainer.classList.contains('header-spacer')) {
          targetContainer.innerHTML = '';
          targetContainer.style.display = 'flex';
          targetContainer.style.justifyContent = 'flex-end';
          targetContainer.style.alignItems = 'center';
          targetContainer.style.overflow = 'visible';
          targetContainer.style.width = '75px';
      }
      targetContainer.appendChild(btn);
    } else {
      btn.style.cssText = `
        position:fixed;bottom:24px;right:24px;z-index:900;
        width:56px;height:56px;border-radius:50%;border:3px solid #D4AF37;
        background:white;cursor:pointer;padding:4px;
        box-shadow:0 4px 16px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(btn);
    }
  }

  // ── Utils ──────────────────────────────────────────────────────────────────

  function _fecharOverlay(overlay) {
    if (overlay.id === 'fz-onboarding') onboardingAberto = false;
    overlay.classList.remove('visivel');
    overlay.classList.add('saindo');
    setTimeout(() => overlay.remove(), 400);
  }

  // ── API pública ────────────────────────────────────────────────────────────
  return { init, abrirPerfil, getPerfil, perfilExiste };

})();

window.AvatarSystem = AvatarSystem;
