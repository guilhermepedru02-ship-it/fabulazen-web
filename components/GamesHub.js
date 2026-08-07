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
      <div class="card-art card-art-blue">
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
        const isQuiz = titulo.includes('Quiz');
        const gameEmoji  = isQuiz ? '🧠' : '📖';
        const gameTag    = isQuiz ? 'Memória & Quiz' : 'Sequência & Lógica';
        const gameColor  = isQuiz ? '#7c3aed' : '#059669';
        const gameColorL = isQuiz ? '#a78bfa' : '#34d399';
        const xpText     = isQuiz ? '+30 XP' : '+35 XP';

        container.innerHTML = `
          <style>
            @keyframes fz-float-leaf {
              0%   { transform: translateY(0)   rotate(0deg)   scale(1);    opacity: 0; }
              10%  { opacity: 0.6; }
              90%  { opacity: 0.4; }
              100% { transform: translateY(-110vh) rotate(360deg) scale(0.7); opacity: 0; }
            }
            @keyframes fz-pulse-gold {
              0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
              50%       { box-shadow: 0 0 20px 4px rgba(212,175,55,0.35); }
            }
            @keyframes fz-shimmer {
              0%   { background-position: -200% 0; }
              100% { background-position:  200% 0; }
            }
            .fz-sel-card {
              position: relative;
              border-radius: 14px;
              overflow: hidden;
              cursor: pointer;
              background: #fff;
              border: 2px solid rgba(212,175,55,0.25);
              box-shadow: 0 4px 16px rgba(90,60,10,0.10);
              transition: transform 0.28s cubic-bezier(.23,1,.32,1),
                          box-shadow 0.28s ease,
                          border-color 0.28s ease;
            }
            .fz-sel-card:hover {
              transform: translateY(-8px) scale(1.03);
              box-shadow: 0 18px 40px rgba(212,175,55,0.35), 0 4px 16px rgba(90,60,10,0.12);
              border-color: #D4AF37;
            }
            .fz-sel-card:hover .fz-sel-play-btn { opacity: 1; transform: translateY(0); }
            .fz-sel-play-btn {
              opacity: 0;
              transform: translateY(6px);
              transition: opacity 0.22s, transform 0.22s;
              background: #D4AF37;
              color: #1a1000;
              font-family: 'Nunito', sans-serif;
              font-weight: 900;
              font-size: 0.68rem;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              padding: 4px 10px;
              border-radius: 6px;
              display: inline-block;
              margin-top: 5px;
            }
            .fz-sel-locked {
              filter: grayscale(70%);
              cursor: not-allowed;
              opacity: 0.55;
              border-style: dashed;
            }
            .fz-sel-locked:hover {
              transform: none !important;
              box-shadow: none !important;
              border-color: rgba(212,175,55,0.2) !important;
            }
            .fz-sel-back-btn:hover { background: rgba(212,175,55,0.2) !important; }
            
            .fz-sel-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
              gap: 20px;
            }
            
            .fz-sel-grid-locked {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
              gap: 12px;
            }

            @media (max-width: 768px) {
              .fz-sel-play-btn {
                opacity: 1 !important;
                transform: translateY(0) !important;
              }
              .fz-sel-grid, .fz-sel-grid-locked {
                display: flex;
                flex-wrap: nowrap;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                -webkit-overflow-scrolling: touch;
                padding-bottom: 24px;
                gap: 16px;
                /* Esconde a barra de rolagem mas mantém a funcionalidade */
                scrollbar-width: none;
              }
              .fz-sel-grid::-webkit-scrollbar, .fz-sel-grid-locked::-webkit-scrollbar {
                display: none;
              }
              .fz-sel-grid > .fz-sel-card {
                flex: 0 0 75%;
                max-width: 260px;
                scroll-snap-align: center;
                border-radius: 12px;
              }
              .fz-sel-grid-locked > .fz-sel-card {
                flex: 0 0 45%;
                max-width: 150px;
                scroll-snap-align: center;
                border-radius: 10px;
              }
            }
          </style>

          <div style="
            position: absolute;
            inset: 0;
            min-height: 100%;
            background: linear-gradient(160deg, #FDFCF0 0%, #FFF8DC 40%, #F5F0D0 100%);
            font-family: 'Nunito', sans-serif;
            overflow-y: auto;
            overflow-x: hidden;
          ">

            <!-- PARTÍCULAS FLUTUANTES (folhas + estrelas) -->
            <div aria-hidden="true" style="position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;">
              ${['🍃','✨','🌿','⭐','🍀','✦','🌸','🌟'].map((el,i) => `
                <span style="
                  position: absolute;
                  bottom: -40px;
                  left: ${8 + i * 12}%;
                  font-size: ${0.8 + (i % 3) * 0.4}rem;
                  animation: fz-float-leaf ${7 + i * 1.3}s ease-in-out ${i * 0.9}s infinite;
                  filter: opacity(0.55);
                ">${el}</span>
              `).join('')}
            </div>

            <!-- HEADER (mesmo estilo do app-header) -->
            <div style="
              position: sticky;
              top: 0;
              z-index: 20;
              background: #000;
              border-bottom: 2px solid #FFD700;
              box-shadow: 0 4px 20px rgba(255,215,0,0.25);
              display: flex;
              align-items: center;
              gap: 14px;
              padding: 0 20px;
              height: 56px;
            ">
              <button id="fz-selecao-voltar" class="fz-sel-back-btn" aria-label="Voltar para Games" style="
                background: rgba(255,215,0,0.1);
                border: 1px solid rgba(255,215,0,0.3);
                color: #FFD700;
                width: 36px; height: 36px;
                border-radius: 50%;
                font-size: 1.1rem;
                cursor: pointer;
                display: flex; align-items: center; justify-content: center;
                transition: background 0.2s;
                flex-shrink: 0;
              ">←</button>

              <span style="
                font-family: 'Cinzel', 'Playfair Display', serif;
                color: #FFD700;
                font-size: 1rem;
                font-weight: 700;
                letter-spacing: 1px;
                text-shadow: 0 0 12px rgba(255,215,0,0.5);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              ">${gameEmoji} ${titulo}</span>

              <div style="
                margin-left: auto;
                background: ${gameColor};
                color: #fff;
                font-size: 0.7rem;
                font-weight: 800;
                padding: 4px 12px;
                border-radius: 999px;
                white-space: nowrap;
                flex-shrink: 0;
              ">${xpText} por jogar</div>
            </div>

            <!-- HERO -->
            <div style="
              position: relative;
              z-index: 1;
              text-align: center;
              padding: 36px 24px 24px;
              border-bottom: 1px solid rgba(212,175,55,0.2);
            ">
              <!-- Tag do jogo -->
              <div style="
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: rgba(212,175,55,0.12);
                border: 1px solid rgba(212,175,55,0.35);
                border-radius: 999px;
                padding: 5px 18px;
                font-size: 0.72rem;
                color: #8b6914;
                letter-spacing: 2px;
                text-transform: uppercase;
                font-weight: 800;
                margin-bottom: 14px;
              ">${gameEmoji} ${gameTag}</div>

              <h2 style="
                font-family: 'Playfair Display', 'Cinzel', serif;
                font-size: clamp(1.8rem, 5vw, 2.8rem);
                color: #1a1000;
                margin: 0 0 10px 0;
                line-height: 1.15;
              ">${titulo}</h2>

              <p style="
                color: #6b5f4a;
                font-size: 0.95rem;
                margin: 0 auto;
                max-width: 420px;
              ">${subTitulo}</p>

              <!-- Divisor decorativo dourado -->
              <div style="
                margin: 20px auto 0;
                width: 60px;
                height: 2px;
                background: linear-gradient(90deg, transparent, #D4AF37, transparent);
                border-radius: 2px;
              "></div>
            </div>

            <!-- GRID DE LIVROS DISPONÍVEIS -->
            ${disponiveis.length > 0 ? `
            <div style="position:relative;z-index:1;padding:28px 20px 8px;">
              <p style="
                color: #8b6914;
                font-size: 0.68rem;
                font-weight: 800;
                letter-spacing: 3px;
                text-transform: uppercase;
                margin: 0 0 18px 0;
                display: flex;
                align-items: center;
                gap: 8px;
              "><span style="flex:1;height:1px;background:linear-gradient(90deg,rgba(212,175,55,0.5),transparent)"></span>
               Prontos para jogar
               <span style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.5))"></span></p>

              <div class="fz-sel-grid">
                ${disponiveis.map(ebook => `
                  <div class="fz-sel-card fz-games-livro-card" data-id="${ebook.id}" tabindex="0"
                       role="button" aria-label="Jogar com ${ebook.titulo}">
                    <img src="${ebook.capaUrl || ebook.coverImage}" alt="${ebook.titulo}"
                         loading="lazy" style="
                      width: 100%;
                      aspect-ratio: 3/4;
                      object-fit: cover;
                      display: block;
                    "/>
                    <!-- overlay gradiente -->
                    <div style="
                      position: absolute;
                      inset: 0;
                      background: linear-gradient(to top,
                        rgba(20,12,0,0.88) 0%,
                        rgba(20,12,0,0.2) 55%,
                        transparent 100%);
                      display: flex;
                      flex-direction: column;
                      justify-content: flex-end;
                      padding: 12px 10px;
                    ">
                      <span style="
                        color: #fff;
                        font-size: 0.8rem;
                        font-weight: 700;
                        line-height: 1.3;
                        text-shadow: 0 1px 6px rgba(0,0,0,0.9);
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                      ">${ebook.titulo}</span>
                      <div class="fz-sel-play-btn">▶ JOGAR</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}

            <!-- GRID DE LIVROS BLOQUEADOS -->
            ${bloqueados.length > 0 ? `
            <div style="position:relative;z-index:1;padding:20px 20px 40px;">
              <p style="
                color: #b0a080;
                font-size: 0.68rem;
                font-weight: 800;
                letter-spacing: 3px;
                text-transform: uppercase;
                margin: 0 0 14px 0;
                display: flex;
                align-items: center;
                gap: 8px;
              "><span style="flex:1;height:1px;background:rgba(176,160,128,0.3)"></span>
               🔒 Indisponíveis para este jogo
               <span style="flex:1;height:1px;background:rgba(176,160,128,0.3)"></span></p>

              <div class="fz-sel-grid-locked">
                ${bloqueados.map(ebook => `
                  <div class="fz-sel-card fz-sel-locked fz-games-livro-card bloqueado"
                       title="${ebook.titulo} — não disponível para este jogo">
                    <img src="${ebook.capaUrl || ebook.coverImage}" alt="${ebook.titulo}"
                         loading="lazy" style="width:100%;aspect-ratio:3/4;object-fit:cover;display:block;"/>
                    <div style="
                      position: absolute; inset: 0;
                      background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%);
                      display: flex; flex-direction: column;
                      justify-content: flex-end; padding: 10px;
                      align-items: center;
                    ">
                      <div style="font-size:1.4rem;margin-bottom:4px;">🔒</div>
                      <span style="color:rgba(255,255,255,0.75);font-size:0.72rem;text-align:center;line-height:1.3;">${ebook.titulo}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>` : ''}

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
