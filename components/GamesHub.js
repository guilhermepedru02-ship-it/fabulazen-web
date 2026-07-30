export function GamesHub(books, onNavigate, onStartGame) {
    const container = document.createElement('div');
    container.className = 'games-hub-container fade-in';
    
    // Função auxiliar para voltar para a tela inicial do Hub de Games
    const renderOriginalHub = () => {
        container.innerHTML = `
<!-- HERO -->
<div class="hero gh-hero">
  <div class="hero-badge"><span>🎮</span> ÁREA DE AVENTURAS</div>
  <h1>Mundo dos<br><em>Games</em></h1>
  <p class="hero-sub">Jogue, aprenda e ganhe XP enquanto mergulha nas histórias!</p>
  <div class="xp-strip">
    <div class="dot"></div> Ganhe XP em cada desafio e desbloqueie novos aventureiros
  </div>
</div>

<!-- TROPHY BANNER -->
<div class="trophy-banner">
  <div class="trophy-icon">🏆</div>
  <div class="trophy-text">
    <h3>Suas conquistas desbloqueiam recompensas!</h3>
    <p>Jogue mais para ganhar XP, subir de nível e revelar novos personagens.</p>
  </div>
  <div class="trophy-pills">
    <span class="trophy-pill">+20 XP por rodada</span>
    <span class="trophy-pill">🔓 Avatares especiais</span>
    <span class="trophy-pill">🎖️ Medalhas</span>
  </div>
</div>

<!-- GAMES GRID -->
<section class="games-section">
  <div class="games-grid">

    <!-- Card 1: Encontre o Objeto -->
    <div class="game-card gold-theme" id="btn-encontre-objeto" tabindex="0">
      <div class="card-art card-art-gold">
        <div class="card-art-glow gold-glow-el"></div>
        <div class="card-xp">+20 XP</div>
        <div class="card-diff">
          <span class="star-f">★</span><span class="star-f">★</span><span class="star-e">★</span>
        </div>
        <div class="card-emoji">🔍</div>
      </div>
      <div class="card-body">
        <span class="card-tag tag-gold">Atenção & Observação</span>
        <div class="card-title">Encontre o Objeto</div>
        <p class="card-desc">Itens mágicos estão escondidos nas ilustrações das histórias. Você consegue achar todos antes do tempo acabar?</p>
        <div class="card-chips">
          <span class="chip">⏱️ Contrarrelógio</span>
          <span class="chip">🖼️ Ilustrações reais</span>
          <span class="chip">🎯 Vários níveis</span>
        </div>
        <button class="btn-play btn-gold">▶ Jogar Agora</button>
      </div>
    </div>

    <!-- Card 2: Montar Cena (com a descrição do Ordenar História) -->
    <div class="game-card green-theme" id="btn-montar-cena" tabindex="0">
      <div class="card-art card-art-green">
        <div class="card-art-glow green-glow-el"></div>
        <div class="card-xp">+35 XP</div>
        <div class="card-diff">
          <span class="star-f">★</span><span class="star-f">★</span><span class="star-f">★</span>
        </div>
        <div class="card-emoji">📖</div>
      </div>
      <div class="card-body">
        <span class="card-tag tag-green">Sequência & Lógica</span>
        <div class="card-title">Montar Cena</div>
        <p class="card-desc">As cenas da história estão embaralhadas! Arraste-as para a ordem certa e reconte a aventura do jeito correto.</p>
        <div class="card-chips">
          <span class="chip">🔀 Embaralhado</span>
          <span class="chip">🧩 Drag & Drop</span>
          <span class="chip">🖼️ Criatividade</span>
        </div>
        <button class="btn-play btn-green">▶ Jogar Agora</button>
      </div>
    </div>

    <!-- Card 3: Quiz da História -->
    <div class="game-card purple-theme" id="btn-quiz-historia" tabindex="0">
      <div class="card-art card-art-purple">
        <div class="card-art-glow purple-glow-el"></div>
        <div class="card-xp">+30 XP</div>
        <div class="card-diff">
          <span class="star-f">★</span><span class="star-f">★</span><span class="star-f">★</span>
        </div>
        <div class="card-emoji">🧠</div>
      </div>
      <div class="card-body">
        <span class="card-tag tag-purple">Memória & Quiz</span>
        <div class="card-title">Quiz da História</div>
        <p class="card-desc">Responda perguntas sobre os capítulos que você leu. Prove que você é um verdadeiro Guardião das Histórias!</p>
        <div class="card-chips">
          <span class="chip">❓ Desafio Mental</span>
          <span class="chip">⚡ Conhecimento</span>
          <span class="chip">🏅 Recompensas</span>
        </div>
        <button class="btn-play btn-purple">▶ Jogar Agora</button>
      </div>
    </div>

    <!-- Card 4: Memória Mágica (NOVO) -->
    <div class="game-card blue-theme" id="btn-memoria-magica" tabindex="0">
      <div class="card-art card-art-blue" style="background: linear-gradient(135deg, #8a2b2b, #6a0dad);">
        <div class="card-art-glow blue-glow-el"></div>
        <div class="card-xp">+40 XP</div>
        <div class="card-diff">
          <span class="star-f">★</span><span class="star-f">★</span><span class="star-f">★</span><span class="star-f">★</span>
        </div>
        <div class="card-emoji">🎴</div>
      </div>
      <div class="card-body">
        <span class="card-tag tag-blue">Foco & Competição</span>
        <div class="card-title">Memória Mágica</div>
        <p class="card-desc">Desafie sua mente ou duele contra um amigo! Encontre os pares revelando os pergaminhos mágicos das nossas fábulas.</p>
        <div class="card-chips">
          <span class="chip">⚔️ 1 ou 2 Jogadores</span>
          <span class="chip">⏱️ Turnos de 10s</span>
          <span class="chip">📜 Estilo RPG</span>
        </div>
        <button class="btn-play btn-blue">▶ Jogar Agora</button>
      </div>
    </div>

  </div>

</section>

<!-- BACK BUTTON -->
<div class="back-area">
  <button class="btn-back" id="gh-back-shelf">← Voltar para Estante</button>
</div>
        `;

        // Eventos
        container.querySelector('#gh-back-shelf').addEventListener('click', () => onNavigate('SHELF'));

        container.querySelector('#btn-encontre-objeto').addEventListener('click', () => {
            _mostrarTutorialEncontreObjeto();
        });

        container.querySelector('#btn-montar-cena').addEventListener('click', () => {
            abrirSelecaoMontarCena();
        });

        container.querySelector('#btn-quiz-historia').addEventListener('click', () => {
            abrirSelecaoQuiz();
        });

        container.querySelector('#btn-memoria-magica').addEventListener('click', () => {
            abrirSelecaoMemoria();
        });

        setTimeout(() => {
            if (window.lucide) {
                window.lucide.createIcons({ root: container });
            }
        }, 0);
    };

    // --- Seleção: Montar Cena ---
    const abrirSelecaoMontarCena = () => {
        const inventory = books || [];

        // Ignora livros de RPG e Animados (não compatíveis com esta mecânica)
        const aplicaveis = inventory.filter(ebook => 
            ebook.tipo !== 'RPG' && 
            ebook.categoria !== 'Fabula RPG' && 
            ebook.categoria !== 'Livros Animados'
        );

        // Filtra livros que têm pelo menos 4 storyPages com imagem e texto
        const disponiveis = aplicaveis.filter(ebook =>
            (ebook.storyPages || []).filter(p => p.image && (p.text || p.title)).length >= 4
        );

        const bloqueados = aplicaveis.filter(ebook =>
            (ebook.storyPages || []).filter(p => p.image && (p.text || p.title)).length < 4
        );

        _renderizarSelecaoLivro(disponiveis, bloqueados, 'Montar a Cena', 'Escolha uma história para jogar:', (ebook) => {
            if (window.BuildSceneGame) {
                window.BuildSceneGame.iniciar(ebook, ({ acertos, total, xpGanho }) => {
                    if (xpGanho > 0 && window.GamificationEngine) {
                        window.GamificationEngine.registrarMontarCena(xpGanho);
                    }
                });
            } else {
                console.error('[GamesHub] Componente BuildSceneGame não carregado.');
            }
        });
    };

    // --- Seleção: Quiz da História ---
    const abrirSelecaoQuiz = () => {
        const inventory = books || [];

        // Livros do tipo RPG são muito ramificados e não participam do Quiz
        const aplicaveis = inventory.filter(ebook => 
            ebook.tipo !== 'RPG' && 
            ebook.categoria !== 'Fabula RPG'
        );

        // Filtra livros que têm o objeto de quiz mapeado vindo do inventory.json
        const disponiveis = aplicaveis.filter(ebook =>
            ebook.quiz && Array.isArray(ebook.quiz.perguntas) && ebook.quiz.perguntas.length > 0
        );

        const bloqueados = aplicaveis.filter(ebook =>
            !ebook.quiz || !Array.isArray(ebook.quiz.perguntas) || ebook.quiz.perguntas.length === 0
        );

        _renderizarSelecaoLivro(disponiveis, bloqueados, 'Quiz da História', 'Escolha um ebook que você já leu para testar sua memória:', (ebook) => {
            if (window.QuizMiniGame) {
                window.QuizMiniGame.iniciar(ebook, ({ acertos, total, xpGanho } = {}) => {
                    // Após a janela do quiz fechar, voltamos à estante automaticamente ou deixamos o user aqui
                });
            } else {
                console.error('[GamesHub] Componente QuizMiniGame não carregado.');
            }
        });
    };

    // --- Seleção: Memória Mágica ---
    const abrirSelecaoMemoria = () => {
        if (window.MemoryGame) {
            // Agora iniciamos o jogo diretamente com o inventário completo
            // O MemoryGame irá lidar com a extração de todas as artes
            window.MemoryGame.iniciar(books, () => {
                // Ao sair do jogo, volta para o GamesHub original
                const appRoot = document.getElementById('app-root');
                appRoot.innerHTML = '';
                appRoot.appendChild(container);
            });
        } else {
            console.error('[GamesHub] Componente MemoryGame não carregado.');
        }
    };

    // --- Componente Reutilizável de Grade de Seleção de Ebooks ---
    const _renderizarSelecaoLivro = (disponiveis, bloqueados, titulo, subTitulo, onEbookSelected) => {
        container.innerHTML = `
          <div class="fz-games-selecao fade-in">
            <div class="fz-games-selecao-header">
              <button class="fz-games-selecao-voltar" id="fz-selecao-voltar" aria-label="Voltar para Games">←</button>
              <div>
                <h2 class="fz-games-selecao-titulo">${titulo}</h2>
                <p class="fz-games-selecao-sub">${subTitulo}</p>
              </div>
            </div>
            
            <div class="fz-games-livros-grid" style="margin-top: 2rem;">
              ${disponiveis.map(ebook => `
                <div class="fz-games-livro-card" data-id="${ebook.id}" tabindex="0">
                  <img src="${ebook.capaUrl || ebook.coverImage}" alt="Capa: ${ebook.titulo}" loading="lazy"/>
                  <div class="card-content">
                      <span class="fz-games-livro-titulo">${ebook.titulo}</span>
                  </div>
                </div>
              `).join('')}

              ${bloqueados.map(ebook => `
                <div class="fz-games-livro-card bloqueado" title="Jogo em breve">
                  <img src="${ebook.capaUrl || ebook.coverImage}" alt="Capa: ${ebook.titulo}" loading="lazy"/>
                  <div class="fz-games-livro-cadeado">🔒</div>
                  <div class="card-content">
                      <span class="fz-games-livro-titulo">${ebook.titulo}</span>
                      <span class="fz-games-livro-breve">Restrito</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>`;

        // Voltar para Mundo dos Games
        container.querySelector('#fz-selecao-voltar').addEventListener('click', () => {
            renderOriginalHub();
        });

        // Clicar num livro disponível para iniciar
        container.querySelectorAll('.fz-games-livro-card:not(.bloqueado)').forEach(card => {
            const iniciarJogo = () => {
                const ebookId = card.dataset.id;
                const ebook = disponiveis.find(e => e.id === ebookId);
                if (!ebook) return;
                
                onEbookSelected(ebook);
            };

            card.addEventListener('click', iniciarJogo);
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') iniciarJogo();
            });
        });
    };

    // --- Modal Explicativo/Tutorial Encontre o Objeto ---
    const _mostrarTutorialEncontreObjeto = () => {
        const overlay = document.createElement('div');
        overlay.className = 'gh-tutorial-overlay';
        overlay.innerHTML = `
            <div class="gh-tutorial-modal">
                <button class="gh-tutorial-close">&times;</button>
                <div class="gh-tutorial-icon">🔍</div>
                <h3 class="gh-tutorial-title">Onde jogar?</h3>
                <p class="gh-tutorial-text">
                    O jogo <strong>Encontre o Objeto</strong> começa de surpresa <strong>durante a leitura dos livros!</strong><br><br>
                    Enquanto estiver lendo uma história na estante, preste muita atenção nas ilustrações originais, a qualquer momento o cronômetro pode disparar pedindo para você procurar algo mágico escondido na tela.
                </p>
                <button class="gh-tutorial-btn">Entendi!</button>
            </div>
        `;
        
        container.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('visivel'));

        const fechar = () => {
            overlay.classList.remove('visivel');
            setTimeout(() => overlay.remove(), 350);
        };

        overlay.querySelector('.gh-tutorial-close').addEventListener('click', fechar);
        overlay.querySelector('.gh-tutorial-btn').addEventListener('click', fechar);
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) fechar();
        });
    };

    // Renderiza a parte inicial (Hub) assim que constrói
    renderOriginalHub();

    return container;
}
