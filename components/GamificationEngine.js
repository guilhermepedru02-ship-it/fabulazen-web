/**
 * GamificationEngine.js — Fabula-Zen v2.0
 * Motor de gamificação: XP Escalável, Níveis, Daily Cap, Conquistas e Avatares.
 * Tudo roda com localStorage, sem tocar no inventory.json nem no n8n.
 *
 * Mudanças v2.0:
 *   - 10 níveis com curva exponencial (nível² × 100)
 *   - Distinção entre 1ª leitura (100 XP) e releitura (20 XP)
 *   - Daily Cap de 300 XP/dia com feedback para a criança
 *   - Rastreio de quizzes repetidos por livro (quiz repetido = 10 XP)
 *   - Suporte a unlock tipo 'hibrido' (nivel + conquista combinados)
 *   - 4 novas conquistas de longo prazo
 *
 * Eventos CustomEvent disparados (escutados pelo GamificationUI.js):
 *   gamification:xpGanho            { xpGanho, xpTotal, fonte }
 *   gamification:nivelUp            { nivelAnterior, nivelNovo, tituloNovo }
 *   gamification:conquista          { conquista }
 *   gamification:avatarDesbloqueado { avatar }
 *   gamification:dailyCap           { xpGanhoHoje, limite }
 */

const GamificationEngine = (() => {

  // ── Constants ──────────────────────────────────────────────────────────────

  let STORAGE_KEY = 'fz_gamificacao_anon';
  const XP_MAXIMO_DIARIO = 300;

  // Cloud Sync properties
  let dbClient = null;
  let userId = null;
  let syncTimeout = null;

  // Curva exponencial: XP necessário = nível² × 100
  const NIVEIS = [
    { nivel: 1,  titulo: 'Leitor Iniciante',       xpNecessario: 0    },
    { nivel: 2,  titulo: 'Explorador de Histórias', xpNecessario: 100  },
    { nivel: 3,  titulo: 'Aventureiro',             xpNecessario: 250  },
    { nivel: 4,  titulo: 'Guardião das Histórias',  xpNecessario: 500  },
    { nivel: 5,  titulo: 'Mestre das Páginas',      xpNecessario: 900  },
    { nivel: 6,  titulo: 'Herói das Palavras',      xpNecessario: 1400 },
    { nivel: 7,  titulo: 'Sábio do Sertão',         xpNecessario: 2000 },
    { nivel: 8,  titulo: 'Lenda do Folclore',       xpNecessario: 2700 },
    { nivel: 9,  titulo: 'Guardião Lendário',       xpNecessario: 3500 },
    { nivel: 10, titulo: 'O Grande Contador',       xpNecessario: 4500 }
  ];

  // XP por ação — balanceado para 300 XP/dia máx
  const XP_VALUES = {
    primeiraLeitura:  100,  // 1a vez que lê este livro
    releitura:         20,  // livro já lido antes
    quizPerfeito:      30,  // 100% de acertos, primeira vez
    quizParcial:       15,  // ≥50% de acertos, primeira vez
    quizRepetido:      10,  // qualquer nota em quiz já feito antes
    encontreObjeto:    40,
    montarCena:        40,
    bonusDiario:       25   // primeiro livro do dia
  };

  const CONQUISTAS = [
    // ── Leitura ──
    { id: 'primeiro_livro',   titulo: 'Primeira Página Virada',    tipo: 'leitura',   icone: '📖', xpBonus: 50,  condicao: (s) => s.livrosLidos.length >= 1 },
    { id: 'cinco_livros',     titulo: 'Leitor Dedicado',           tipo: 'leitura',   icone: '📚', xpBonus: 100, condicao: (s) => s.livrosLidos.length >= 5 },
    { id: 'dez_livros',       titulo: 'Devorador de Histórias',    tipo: 'leitura',   icone: '🏆', xpBonus: 200, condicao: (s) => s.livrosLidos.length >= 10 },
    { id: 'vinte_livros',     titulo: 'Voraz das Histórias',       tipo: 'leitura',   icone: '🌟', xpBonus: 300, condicao: (s) => s.livrosLidos.length >= 20 },
    { id: 'semana_seguida',   titulo: 'Leitor Fiel',               tipo: 'leitura',   icone: '🔥', xpBonus: 120, condicao: (s) => s.diasConsecutivos >= 7 },
    // ── Folclore ──
    { id: 'folclore_1',       titulo: 'Amigo do Folclore',         tipo: 'folclore',  icone: '🎭', xpBonus: 60,  condicao: (s) => s.livrosFolclore >= 1 },
    { id: 'heroi_folclore',   titulo: 'Herói do Folclore',         tipo: 'folclore',  icone: '⭐', xpBonus: 150, condicao: (s) => s.livrosFolclore >= 3 },
    { id: 'mestre_folclore',  titulo: 'Mestre do Folclore',        tipo: 'folclore',  icone: '👑', xpBonus: 200, condicao: (s) => s.livrosFolclore >= 5 },
    // ── Mini-jogos ──
    { id: 'primeiro_quiz',    titulo: 'Primeiro Desafio',          tipo: 'minigame',  icone: '❓', xpBonus: 30,  condicao: (s) => s.quizzesCompletos >= 1 },
    { id: 'quiz_perfeito',    titulo: 'Mente Brilhante',           tipo: 'minigame',  icone: '💎', xpBonus: 50,  condicao: (s) => s.quizzesPerfeitos >= 1 },
    { id: 'quiz_mestre',      titulo: 'Mente Brilhante Suprema',   tipo: 'minigame',  icone: '🧠', xpBonus: 100, condicao: (s) => s.quizzesPerfeitos >= 10 },
    { id: 'detetive',         titulo: 'Detetive de Histórias',     tipo: 'minigame',  icone: '🔍', xpBonus: 80,  condicao: (s) => s.objetosEncontrados >= 5 },
    { id: 'montador',         titulo: 'Contador de Histórias',     tipo: 'minigame',  icone: '🧩', xpBonus: 80,  condicao: (s) => s.cenasMontadas >= 5 },
    // ── Coleção ──
    { id: 'colecionador',     titulo: 'Colecionador de Amigos',    tipo: 'colecao',   icone: '🎨', xpBonus: 150, condicao: (s) => s.avataresDesbloqueados.length >= 5 }
  ];

  // ── Storage ────────────────────────────────────────────────────────────────

  function _getEstadoRaw() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (_) { return null; }
  }

  function _salvar(estado) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    _agendarSyncNuvem(estado);
  }

  function _agendarSyncNuvem(estado) {
    if (!dbClient || !userId) return; // Offline ou sem conta: fica só local
    
    if (syncTimeout) clearTimeout(syncTimeout);
    
    // Debounce de 3 segundos para enviar batch para a nuvem
    syncTimeout = setTimeout(async () => {
      try {
        const { error } = await dbClient.from('profiles').update({
          xp: estado.xp,
          level: estado.nivel,
          daily_xp_count: estado.xpGanhoHoje,
          streak_days: estado.diasConsecutivos,
          unlocked_avatars: estado.avataresDesbloqueados,
          game_state: estado, // Payload completo entra aqui
          last_activity: new Date().toISOString()
        }).eq('user_id', userId);
        
        if (error) console.error('☁️ [Gamification Sync] Erro no Supabase:', error.message);
      } catch(err) {
        console.error('☁️ [Gamification Sync] Falha ao sincronizar:', err);
      }
    }, 3000);
  }

  function _criarEstadoInicial() {
    return {
      xp: 0,
      nivel: 1,
      tituloNivel: 'Leitor Iniciante',
      conquistas: [],            // IDs das conquistas desbloqueadas
      conquistasDatas: {},       // { id: 'ISO date' }
      livrosLidos: [],           // IDs únicos dos livros lidos (1ª vez)
      livrosFolclore: 0,         // contagem de livros folclore lidos
      quizzesCompletos: 0,
      quizzesPerfeitos: 0,
      quizzesFeitos: {},         // { [bookId]: true } — rastreia quizzes já feitos
      objetosEncontrados: 0,
      cenasMontadas: 0,
      diasConsecutivos: 0,
      ultimaLeitura: null,       // ISO date da última leitura
      booksReadToday: [],        // IDs dos livros lidos hoje (reseta à meia-noite)
      xpGanhoHoje: 0,            // XP acumulado no dia (Daily Cap)
      dataXpHoje: null,          // 'YYYY-MM-DD' do dia atual
      avataresDesbloqueados: ['maya']  // Maya sempre desbloqueada
    };
  }

  function _getEstado() {
    let estado = _getEstadoRaw();
    if (!estado) {
      estado = _criarEstadoInicial();
      _salvar(estado);
      return estado;
    }
    // Migração automática: garante campos novos para estados v1
    if (!estado.avataresDesbloqueados) estado.avataresDesbloqueados = ['maya'];
    if (!estado.conquistasDatas)       estado.conquistasDatas = {};
    if (!estado.livrosFolclore)        estado.livrosFolclore = 0;
    if (!estado.quizzesPerfeitos)      estado.quizzesPerfeitos = 0;
    if (!estado.quizzesFeitos)         estado.quizzesFeitos = {};
    if (!estado.xpGanhoHoje)           estado.xpGanhoHoje = 0;
    if (!estado.dataXpHoje)            estado.dataXpHoje = null;
    return estado;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function _hoje() {
    return new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }

  function _resetarDiario(estado) {
    const hoje = _hoje();
    const diaAnterior = estado.dataXpHoje;
    if (diaAnterior !== hoje) {
      estado.booksReadToday = [];
      estado.xpGanhoHoje = 0;
      estado.dataXpHoje = hoje;
    }
  }

  function _atualizarDiasConsecutivos(estado) {
    const hoje = _hoje();
    if (!estado.ultimaLeitura) {
      estado.diasConsecutivos = 1;
      return;
    }
    const ultimoDia = estado.ultimaLeitura.split('T')[0];
    if (ultimoDia === hoje) return; // já leu hoje

    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toISOString().split('T')[0];

    if (ultimoDia === ontemStr) {
      estado.diasConsecutivos += 1;
    } else {
      estado.diasConsecutivos = 1; // sequência quebrada
    }
  }

  function _calcularNivel(xp) {
    let nivelAtual = NIVEIS[0];
    for (const n of NIVEIS) {
      if (xp >= n.xpNecessario) nivelAtual = n;
    }
    return nivelAtual;
  }

  function _emitir(nome, detail) {
    document.dispatchEvent(new CustomEvent(nome, { detail }));
  }

  // ── XP com Daily Cap ───────────────────────────────────────────────────────

  function _concederXP(estado, quantidade, fonte) {
    const hoje = _hoje();
    // Garante que o reset diário ocorreu
    if (estado.dataXpHoje !== hoje) {
      estado.xpGanhoHoje = 0;
      estado.dataXpHoje = hoje;
    }

    // Verifica Daily Cap
    if (estado.xpGanhoHoje >= XP_MAXIMO_DIARIO) {
      _emitir('gamification:dailyCap', {
        xpGanhoHoje: estado.xpGanhoHoje,
        limite: XP_MAXIMO_DIARIO
      });
      return 0; // Não concede XP, mas a ação ainda é registrada
    }

    // Limita ao teto diário restante
    const xpRestante = XP_MAXIMO_DIARIO - estado.xpGanhoHoje;
    const xpReal = Math.min(quantidade, xpRestante);

    estado.xp += xpReal;
    estado.xpGanhoHoje += xpReal;
    _emitir('gamification:xpGanho', { xpGanho: xpReal, xpTotal: estado.xp, fonte });
    return xpReal;
  }

  function _verificarNivel(estado) {
    const nivelAnterior = estado.nivel;
    const novoNivel = _calcularNivel(estado.xp);
    if (novoNivel.nivel > nivelAnterior) {
      estado.nivel = novoNivel.nivel;
      estado.tituloNivel = novoNivel.titulo;
      _emitir('gamification:nivelUp', {
        nivelAnterior,
        nivelNovo: novoNivel.nivel,
        tituloNovo: novoNivel.titulo
      });
    }
  }

  // ── Conquistas ─────────────────────────────────────────────────────────────

  function _verificarConquistas(estado) {
    let novaCriada = false;
    for (const c of CONQUISTAS) {
      if (estado.conquistas.includes(c.id)) continue;
      if (c.condicao(estado)) {
        estado.conquistas.push(c.id);
        estado.conquistasDatas[c.id] = new Date().toISOString();
        // Bônus de conquista vai para XP sem limitar pelo daily cap (recompensa especial)
        estado.xp += c.xpBonus;
        _emitir('gamification:conquista', { conquista: { ...c } });
        _emitir('gamification:xpGanho', { xpGanho: c.xpBonus, xpTotal: estado.xp, fonte: `conquista:${c.id}` });
        novaCriada = true;
      }
    }
    return novaCriada;
  }

  // ── Avatares ───────────────────────────────────────────────────────────────

  function _verificarCondicaoUnlock(av, estado) {
    if (!av.unlock) return false;

    // nivelMinimo é requisito universal
    if (av.nivelMinimo && estado.nivel < av.nivelMinimo) return false;

    const u = av.unlock;

    switch (u.tipo) {
      case 'padrao':
        return true;
      case 'nivel':
        return estado.nivel >= (u.nivel || 1);
      case 'folclore':
        return estado.livrosFolclore >= (u.livros || 1);
      case 'quizzes':
        return estado.quizzesCompletos >= (u.quantidade || 1);
      case 'livros':
        return estado.livrosLidos.length >= (u.quantidade || 1);
      case 'conquista':
        return estado.conquistas.includes(u.conquistaId);
      case 'hibrido': {
        // Suporta múltiplas condições combinadas com AND
        const condicoes = u.condicoes || [];
        return condicoes.every(cond => _verificarCondicaoUnlock({ nivelMinimo: 0, unlock: cond }, estado));
      }
      default:
        return false;
    }
  }

  function _verificarAvataresDesbloqueados(estado) {
    const avatares = window.AVATARES || [];
    for (const av of avatares) {
      if (av.aposentado || av.draft) continue;
      if (estado.avataresDesbloqueados.includes(av.id)) continue;

      if (_verificarCondicaoUnlock(av, estado)) {
        estado.avataresDesbloqueados.push(av.id);
        _emitir('gamification:avatarDesbloqueado', { avatar: av });
      }
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  async function init(supabaseClient, authUserId) {
    if (syncTimeout) clearTimeout(syncTimeout);
    dbClient = supabaseClient;
    userId = authUserId;
    STORAGE_KEY = userId ? `fz_gamificacao_${userId}` : 'fz_gamificacao_anon';

    // Se estiver online e logado, baixa a nuvem
    if (dbClient && userId) {
      try {
        console.log('☁️ [Gamification Sync] Baixando perfil mágico da nuvem...');
        const { data, error } = await dbClient
            .from('profiles')
            .select('game_state')
            .eq('user_id', userId)
            .single();

        if (!error && data && data.game_state && typeof data.game_state.xp === 'number') {
           // Nuvem tem dados válidos → sobrescreve localStorage
           localStorage.setItem(STORAGE_KEY, JSON.stringify(data.game_state));
           console.log('☁️ [Gamification Sync] Dados válidos da nuvem carregados. XP:', data.game_state.xp);
        } else {
           // Nuvem vazia/inválida → cria estado inicial fresco e envia pra nuvem
           console.log('☁️ [Gamification Sync] Nuvem sem dados válidos. Criando estado inicial fresco.');
           const estadoFresco = _criarEstadoInicial();
           localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoFresco));
           _agendarSyncNuvem(estadoFresco);
        }
      } catch (err) {
        console.warn('⚠️ [Gamification Sync] Offline ou erro na nuvem, usando progresso local:', err);
      }
    }

    const estado = _getEstado();
    _resetarDiario(estado);
    _verificarAvataresDesbloqueados(estado);
    _salvar(estado);
    console.log('🎮 [Gamification v2.0] Engine inicializado com Cloud Sync', {
      xp: estado.xp,
      nivel: estado.nivel,
      xpHoje: estado.xpGanhoHoje,
      cap: XP_MAXIMO_DIARIO
    });
  }

  function registrarLeitura(bookId, bookTags) {
    const estado = _getEstado();
    _resetarDiario(estado);

    // Bônus diário (primeiro livro do dia)
    if (estado.booksReadToday.length === 0) {
      _concederXP(estado, XP_VALUES.bonusDiario, 'bonus_diario');
    }

    // Verifica se é 1ª leitura ou releitura
    const isPrimeiraVez = !estado.livrosLidos.includes(bookId);
    const xpLeitura = isPrimeiraVez ? XP_VALUES.primeiraLeitura : XP_VALUES.releitura;

    // XP só concedido uma vez por livro por dia
    if (!estado.booksReadToday.includes(bookId)) {
      _concederXP(estado, xpLeitura, isPrimeiraVez ? 'primeira_leitura' : 'releitura');
      estado.booksReadToday.push(bookId);
    }

    // Registrar o livro como lido (apenas 1 vez globalmente)
    if (isPrimeiraVez) {
      estado.livrosLidos.push(bookId);
    }

    // Contar folclore
    const tags = bookTags || [];
    if (tags.includes('folclore') && isPrimeiraVez) {
      estado.livrosFolclore += 1;
    }

    // Atualizar dias consecutivos
    _atualizarDiasConsecutivos(estado);
    estado.ultimaLeitura = new Date().toISOString();

    // Pipeline de verificação
    _verificarConquistas(estado);
    _verificarNivel(estado);
    _verificarAvataresDesbloqueados(estado);

    _salvar(estado);
    console.log(`🎮 [Gamification] Leitura: ${bookId} | ${isPrimeiraVez ? '1ª vez (+' + XP_VALUES.primeiraLeitura + 'XP)' : 'releitura (+' + XP_VALUES.releitura + 'XP)'} | XP hoje: ${estado.xpGanhoHoje}/${XP_MAXIMO_DIARIO}`);
  }

  function registrarQuiz(resultado) {
    // resultado: { bookId: string, perfeito: boolean, acertos: number, total: number }
    const estado = _getEstado();
    _resetarDiario(estado);

    const bookId = resultado.bookId || 'desconhecido';
    const jaFez = !!estado.quizzesFeitos[bookId];

    estado.quizzesCompletos += 1;

    if (jaFez) {
      // Quiz repetido — XP reduzido independente da nota
      _concederXP(estado, XP_VALUES.quizRepetido, 'quiz_repetido');
    } else {
      // Primeira vez neste livro
      estado.quizzesFeitos[bookId] = true;
      if (resultado.perfeito || resultado.acertos === resultado.total) {
        estado.quizzesPerfeitos += 1;
        _concederXP(estado, XP_VALUES.quizPerfeito, 'quiz_perfeito');
      } else if (resultado.acertos >= resultado.total / 2) {
        _concederXP(estado, XP_VALUES.quizParcial, 'quiz_parcial');
      }
    }

    _verificarConquistas(estado);
    _verificarNivel(estado);
    _verificarAvataresDesbloqueados(estado);
    _salvar(estado);
  }

  function registrarEncontreObjeto() {
    const estado = _getEstado();
    _resetarDiario(estado);
    estado.objetosEncontrados += 1;
    _concederXP(estado, XP_VALUES.encontreObjeto, 'encontre_objeto');
    _verificarConquistas(estado);
    _verificarNivel(estado);
    _verificarAvataresDesbloqueados(estado);
    _salvar(estado);
  }

  function registrarMontarCena(xpManual) {
    const estado = _getEstado();
    _resetarDiario(estado);
    estado.cenasMontadas += 1;
    const xp = (typeof xpManual === 'number') ? xpManual : XP_VALUES.montarCena;
    _concederXP(estado, xp, 'montar_cena');
    _verificarConquistas(estado);
    _verificarNivel(estado);
    _verificarAvataresDesbloqueados(estado);
    _salvar(estado);
  }

  function ganharXP(quantidade, fonte) {
    const estado = _getEstado();
    _resetarDiario(estado);
    _concederXP(estado, quantidade, fonte);
    _verificarConquistas(estado);
    _verificarNivel(estado);
    _verificarAvataresDesbloqueados(estado);
    _salvar(estado);
  }

  function getEstado() {
    const estado = _getEstado();
    _resetarDiario(estado);
    const nivelAtual = _calcularNivel(estado.xp);
    const proximoNivel = NIVEIS.find(n => n.nivel === nivelAtual.nivel + 1);
    const xpNoNivelAtual = nivelAtual.xpNecessario;
    const xpParaProximo = proximoNivel ? proximoNivel.xpNecessario : null;

    return {
      ...estado,
      tituloNivel: nivelAtual.titulo,
      xpParaProximoNivel: xpParaProximo,
      xpNoNivelAtual,
      xpRestanteHoje: Math.max(0, XP_MAXIMO_DIARIO - estado.xpGanhoHoje),
      capDiarioAtingido: estado.xpGanhoHoje >= XP_MAXIMO_DIARIO,
      progresso: xpParaProximo
        ? ((estado.xp - xpNoNivelAtual) / (xpParaProximo - xpNoNivelAtual)) * 100
        : 100
    };
  }

  function getConquistasDefinidas() {
    const estado = _getEstado();
    return CONQUISTAS.map(c => ({
      ...c,
      desbloqueada: estado.conquistas.includes(c.id),
      data: estado.conquistasDatas[c.id] || null,
      condicao: undefined  // não expor função
    }));
  }

  function isAvatarDesbloqueado(avatarId) {
    return _getEstado().avataresDesbloqueados.includes(avatarId);
  }

  function getDicaDesbloqueio(avatar) {
    if (!avatar.unlock) return 'Disponível desde o início';
    const u = avatar.unlock;
    switch (u.tipo) {
      case 'padrao':    return 'Disponível desde o início';
      case 'folclore':  return `Leia ${u.livros} livro(s) de folclore`;
      case 'nivel':     return `Chegue ao nível ${u.nivel}`;
      case 'quizzes':   return `Complete ${u.quantidade} quiz(zes)`;
      case 'livros':    return `Leia ${u.quantidade} livro(s)`;
      case 'conquista': {
        const c = CONQUISTAS.find(x => x.id === u.conquistaId);
        return c ? `Conquiste "${c.titulo}"` : 'Complete uma conquista especial';
      }
      case 'hibrido': {
        const partes = (u.condicoes || []).map(cond => getDicaDesbloqueio({ unlock: cond }));
        return partes.join(' + ');
      }
      default: return 'Continue jogando para desbloquear';
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  return {
    init,
    registrarLeitura,
    registrarQuiz,
    registrarEncontreObjeto,
    registrarMontarCena,
    ganharXP,
    getEstado,
    getConquistasDefinidas,
    isAvatarDesbloqueado,
    getDicaDesbloqueio,
    // Constantes expostas para UI
    XP_MAXIMO_DIARIO,
    NIVEIS
  };

})();

window.GamificationEngine = GamificationEngine;
